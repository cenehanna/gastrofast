import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { GetUser } from '../auth/user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { randomUUID } from 'crypto';

@Controller('orders')
export class OrdersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllOrders() {
    const orders = await this.prisma.order.findMany({
      include: {
        items: true,
        restaurant: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => ({
      id: order.id,
      restaurant: order.restaurant?.name || '-',
      clientName: order.user?.name || order.guestName || 'Гість',
      clientPhone: order.user?.phone || order.guestPhone || '-',
      address: order.address,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        name: item.dishName,
        quantity: item.quantity,
        price: item.price,
      })),
    }));
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyOrders(
    @GetUser() user: { id: number; name: string; phone: string },
  ) {
    console.log('=== getMyOrders called ===');
    console.log('User from token:', JSON.stringify(user, null, 2));

    const orders = await this.prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: true,
        restaurant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Orders found:', orders.length);
    console.log('First order:', JSON.stringify(orders[0], null, 2));

    let userName = user.name;
    let userPhone = user.phone;

    if (!userName || !userPhone) {
      const storedUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true, phone: true },
      });
      userName = userName || storedUser?.name || 'Гість';
      userPhone = userPhone || storedUser?.phone || '-';
    }

    const result = orders.map((order) => ({
      id: order.id,
      clientName: userName,
      clientPhone: userPhone || '-',
      address: order.address,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        name: item.dishName,
        quantity: item.quantity,
        price: item.price,
      })),
    }));

    console.log('Result:', JSON.stringify(result[0], null, 2));
    return result;
  }

  @Get('track')
  async trackOrder(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Токен відстеження обовʼязковий');
    }

    const order = await this.prisma.order.findFirst({
      where: { trackingToken: token },
      include: {
        items: true,
        restaurant: true,
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Замовлення не знайдено');
    }

    return {
      id: order.id,
      status: order.status,
      clientName: order.guestName || order.user?.name || 'Гість',
      clientPhone: order.guestPhone || order.user?.phone || '-',
      address: order.address,
      total: order.total,
      createdAt: order.createdAt,
      trackingToken: order.trackingToken,
      items: order.items.map((item) => ({
        name: item.dishName,
        quantity: item.quantity,
        price: item.price,
        image: item.dishImage,
        dishId: item.dishId,
      })),
      restaurant: order.restaurant
        ? {
            id: order.restaurant.id,
            name: order.restaurant.name,
          }
        : null,
    };
  }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  async createOrder(
    @Body() orderData: CreateOrderDto,
    @GetUser() user: { id: number; name: string; phone: string } | null,
  ) {
    const isGuest = !user;
    const trackingToken = randomUUID();

    if (!orderData.address) {
      throw new BadRequestException("Адреса доставки є обов'язковою");
    }

    if (!orderData.restaurantId) {
      throw new BadRequestException("ID ресторану є обов'язковим");
    }

    if (!orderData.items || orderData.items.length === 0) {
      throw new BadRequestException('Кошик не може бути порожнім');
    }

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: orderData.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Ресторан не знайдено');
    }

    let userId: number | null = null;
    let guestName: string | null = null;
    let guestPhone: string | null = null;

    if (isGuest) {
      if (!orderData.guestName || !orderData.guestPhone) {
        throw new BadRequestException(
          "Для гостя необхідно вказати ім'я та телефон",
        );
      }
      guestName = orderData.guestName;
      guestPhone = orderData.guestPhone;
    } else {
      userId = user.id;

      const userRecord = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { savedAddresses: true },
      });

      if (userRecord) {
        const normalizedAddress = orderData.address.trim();
        const addresses = [
          normalizedAddress,
          ...userRecord.savedAddresses.filter(
            (addr: string) => addr !== normalizedAddress,
          ),
        ].slice(0, 5);

        await this.prisma.user.update({
          where: { id: user.id },
          data: { savedAddresses: addresses },
        });
      }
    }

    const dishIds = orderData.items.map((item) => item.dishId);
    const dishes = await this.prisma.dish.findMany({
      where: { id: { in: dishIds } },
    });

    const dishMap = new Map(dishes.map((dish) => [dish.id, dish]));

    let totalAmount = 0;
    const orderItemsData: {
      dishId: number;
      quantity: number;
      price: number;
      dishName: string;
      dishImage: string;
    }[] = [];

    for (const item of orderData.items) {
      const dish = dishMap.get(item.dishId);
      if (!dish) {
        throw new NotFoundException(`Страва з ID ${item.dishId} не знайдена`);
      }
      totalAmount += dish.price * item.quantity;

      orderItemsData.push({
        dishId: item.dishId,
        quantity: item.quantity,
        price: item.price,
        dishName: dish.name,
        dishImage: dish.image,
      });
    }

    const order = await this.prisma.order.create({
      data: {
        address: orderData.address,
        total: totalAmount,
        status: 'PENDING',
        trackingToken: trackingToken,
        userId: userId,
        guestName: guestName,
        guestPhone: guestPhone,
        restaurantId: orderData.restaurantId,
        items: {
          create: orderItemsData,
        },
      },
    });

    return {
      id: order.id,
      trackingToken: trackingToken,
      status: order.status,
      total: order.total,
      message: isGuest
        ? 'Замовлення створено. Збережіть посилання для відстеження!'
        : 'Замовлення успішно створено',
    };
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    const orderId = parseInt(id);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        restaurant: true,
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Замовлення не знайдено');
    }

    return {
      id: order.id,
      clientName: order.user?.name || order.guestName || 'Гість',
      clientPhone: order.user?.phone || order.guestPhone || '-',
      address: order.address,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        name: item.dishName,
        quantity: item.quantity,
        price: item.price,
      })),
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const validStatuses = ['PENDING', 'PLACED', 'COOKING', 'DELIVERED', 'DONE', 'CANCELLED'];

    if (!validStatuses.includes(body.status)) {
      throw new BadRequestException('Невірний статус замовлення');
    }

    const order = await this.prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: body.status },
    });

    return {
      id: order.id,
      status: order.status,
      message: 'Статус оновлено',
    };
  }
}
