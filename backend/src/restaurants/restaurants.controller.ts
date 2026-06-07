import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAllRestaurants() {
    return this.prisma.restaurant.findMany({
      include: {
        dishes: true,
      },
    });
  }

  @Get(':id')
  async getRestaurant(@Param('id') id: string) {
    return this.prisma.restaurant.findUnique({
      where: { id: parseInt(id) },
      include: {
        dishes: true,
      },
    });
  }
}
