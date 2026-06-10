import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController],
  providers: [RolesGuard],
})
export class OrdersModule {}
