export class SalesOrder {
  id?: number;
  order_date: Date;
  delivery_date: Date;
  status: string = 'PENDING';
}
