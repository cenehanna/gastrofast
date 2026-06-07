import { Module } from '@nestjs/common';
import { RestaurantsController } from './restaurants.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RestaurantsController],
})
export class RestaurantsModule {}
