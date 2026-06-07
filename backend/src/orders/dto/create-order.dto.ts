export class CreateOrderDto {
  clientName!: string;
  clientPhone!: string;
  address!: string;
  total!: number;
  itemsJson!: any;
  userId?: number;
}
