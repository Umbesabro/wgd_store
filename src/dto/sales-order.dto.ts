import { SalesOrderPositionDto } from './sales-order-position.dto';

export class SalesOrderDto {
  id?: number;
  orderDate: Date;
  deliveryDate: Date;
  positions: Array<SalesOrderPositionDto>;
}
