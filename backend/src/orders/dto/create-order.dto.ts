import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsNumber()
  @IsNotEmpty()
  total!: number;

  @IsNumber()
  @IsNotEmpty()
  restaurantId!: number;

  @IsOptional()
  itemsJson?: any;

  @IsString()
  @IsOptional()
  guestName?: string;

  @IsString()
  @IsOptional()
  guestPhone?: string;
}
