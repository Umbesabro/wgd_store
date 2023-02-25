import { SalesOrderDto } from 'src/dto/sales-order.dto';
import { SalesOrderPosition } from './sales-order-position';

export class SalesOrder {
  id: number;
  orderDate: Date;
  deliveryDate: Date;
  positions: Array<SalesOrderPosition>;
  status: string = 'PENDING';

  public static fromDto(salesOrderDto: SalesOrderDto) {
    const salesOrder = new SalesOrder();
    salesOrder.deliveryDate = salesOrderDto.deliveryDate;
    salesOrder.orderDate = salesOrderDto.orderDate;
    salesOrder.positions = [];
    salesOrderDto.positions.forEach((dtoPos) =>
      salesOrder.positions.push({ ...dtoPos })
    );
    return salesOrder;
  }
}
