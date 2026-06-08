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
import { randomUUID } from 'crypto';

@Controller('orders')
export class OrdersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAllOrders() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyOrders(@GetUser() user: { id: number }) {
    return this.prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('track')
  async trackOrder(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Токен відстеження обов’язковий');
    }

    const order = await this.prisma.order.findUnique({
      where: { trackingToken: token },
    });

    if (!order) {
      throw new NotFoundException('Замовлення не знайдено');
    }

    return {
      id: order.id,
      status: order.status,
      restaurantId: order.restaurantId,
      trackingToken: order.trackingToken,
      userId: order.userId,
      guestName: order.guestName,
      guestPhone: order.guestPhone,
      address: order.address,
      total: order.total,
      createdAt: order.createdAt,
    };
  }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  async createOrder(
    @Body() orderData: CreateOrderDto,
    @GetUser() user: { id: number } | null,
  ) {
    const trackingToken = randomUUID();
    const isGuest = !user;

    if (isGuest && (!orderData.guestName || !orderData.guestPhone)) {
      throw new BadRequestException(
        'Для гостя необхідно вказати guestName та guestPhone',
      );
    }

    const userRecord = !isGuest
      ? await this.prisma.user.findUnique({
          where: { id: user!.id },
          select: { name: true, phone: true, savedAddresses: true },
        })
      : null;

    if (!isGuest && !userRecord) {
      throw new NotFoundException('Користувача не знайдено');
    }

    const order = await this.prisma.order.create({
      data: {
        guestName: isGuest ? orderData.guestName : null,
        guestPhone: isGuest ? orderData.guestPhone : null,
        address: orderData.address,
        total: orderData.total,
        restaurantId: orderData.restaurantId,
        userId: user?.id ?? null,
        trackingToken,
        status: 'PLACED',
      },
    });

    if (!isGuest && order.address && userRecord) {
      const normalizedAddress = order.address.trim();
      const addresses = [
        normalizedAddress,
        ...userRecord.savedAddresses.filter(
          (address) => address !== normalizedAddress,
        ),
      ].slice(0, 5);

      await this.prisma.user.update({
        where: { id: user!.id },
        data: { savedAddresses: addresses },
      });
    }

    return {
      order,
      trackingToken,
    };
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.prisma.order.findUnique({
      where: { id: parseInt(id) },
    });
  }
  // В orders.controller.ts додати:

  // 1. Отримання замовлень авторизованого користувача
  @Get('my')
  @UseGuards(JwtAuthGuard) // Тільки для авторизованих
  async getMyOrders(@Request() req) {
    const userId = req.user.id;
    return this.prisma.order.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 2. Відстеження замовлення для гостей (публічний ендпоінт)
  @Get('track')
  async trackOrder(@Query('token') token: string) {
    if (!token) {
      throw new NotFoundException('Токен не надано');
    }

    const order = await this.prisma.order.findFirst({
      where: { trackingToken: token },
    });

    if (!order) {
      throw new NotFoundException('Замовлення не знайдено');
    }

    return order;
  }

  // 3. Оновіть createOrder - додайте генерацію trackingToken для гостей
  @Post()
  async createOrder(@Body() orderData, @Request() req) {
    const trackingToken = crypto.randomUUID(); // Генеруємо унікальний токен

    return this.prisma.order.create({
      data: {
        clientName: orderData.clientName,
        clientPhone: orderData.clientPhone,
        address: orderData.address,
        total: orderData.total,
        itemsJson: orderData.itemsJson,
        userId: orderData.userId || null,
        trackingToken: trackingToken, // Додаємо це поле в schema.prisma
        status: 'Прийнято',
      },
    });
  }
  @Patch(':id')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: body.status },
    });
  }
}
