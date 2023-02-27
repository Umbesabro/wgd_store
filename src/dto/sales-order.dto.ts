import { SalesOrder } from 'src/db/model/sales-order.model';
import { SalesOrderPositionDto } from './sales-order-position.dto';

export class SalesOrderDto {
  id?: number;
  orderDate: Date;
  deliveryDate: Date;
  positions: Array<SalesOrderPositionDto>;
  status: string = 'PENDING';

  static fromEntity(salesOrder: SalesOrder): SalesOrderDto {
    const salesOrderDto: SalesOrderDto = new SalesOrderDto();
    const { id, orderDate, deliveryDate, positions } = salesOrder;
    salesOrder.positions;
    salesOrderDto.id = id;
    salesOrderDto.orderDate = orderDate;
    salesOrderDto.deliveryDate = deliveryDate;
    salesOrderDto.positions = [...positions];
    return salesOrderDto;
  }
}
