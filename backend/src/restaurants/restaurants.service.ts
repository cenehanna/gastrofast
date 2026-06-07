import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.restaurant.findMany(); // без .client
  }

  async findOne(id: number) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        dishes: true,
      },
    });

    if (!restaurant) {
      throw new NotFoundException(`Ресторан з ID ${id} не знайдено`);
    }

    return restaurant;
  }
}
