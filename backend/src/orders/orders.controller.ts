import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('orders')
export class OrdersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAllOrders() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.prisma.order.findUnique({
      where: { id: parseInt(id) },
    });
  }

  @Post()
  async createOrder(
    @Body()
    orderData: {
      clientName: string;
      clientPhone: string;
      address: string;
      total: number;
      itemsJson: any;
      userId?: number;
    },
  ) {
    return this.prisma.order.create({
      data: {
        clientName: orderData.clientName,
        clientPhone: orderData.clientPhone,
        address: orderData.address,
        total: orderData.total,
        itemsJson: orderData.itemsJson,
        userId: orderData.userId || null,
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
