import { SalesOrder } from 'src/db/entity/sales-order';
import { SalesOrderPositionDto } from './sales-order-position.dto';

export class SalesOrderDto {
  id?: number;
  orderDate: Date;
  deliveryDate: Date;
  positions: Array<SalesOrderPositionDto>;

  static fromEntity(salesOrder: SalesOrder): SalesOrderDto {
    const salesOrderDto: SalesOrderDto = new SalesOrderDto();
    const { id, orderDate, deliveryDate, positions } = salesOrder;
    salesOrderDto.id = id;
    salesOrderDto.orderDate = orderDate;
    salesOrderDto.deliveryDate = deliveryDate;
    salesOrderDto.positions = positions;
    return salesOrderDto;
  }
}
