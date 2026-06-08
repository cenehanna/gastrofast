import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  dishId!: number;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  price!: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: "Адреса доставки є обов'язковою" })
  @MinLength(5, { message: 'Адреса має бути довшою' })
  address!: string;

  @IsNumber()
  @IsNotEmpty({ message: "ID ресторану є обов'язковим" })
  restaurantId!: number;

  @IsArray()
  @IsNotEmpty({ message: 'Кошик не може бути порожнім' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsString()
  @IsOptional()
  guestName?: string;

  @IsString()
  @IsOptional()
  guestPhone?: string;

  @IsString()
  @IsOptional()
  guestEmail?: string;

  @IsOptional()
  itemsJson?: any;

  @IsOptional()
  total?: number;
}