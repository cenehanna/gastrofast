export class CreateOrderDto {
  address: string;
  total: number;
  restaurantId: number;
  itemsJson?: any;
  guestName?: string;
  guestPhone?: string;
}
