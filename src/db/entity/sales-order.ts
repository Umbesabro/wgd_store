import { SalesOrderDto } from 'src/sales-order/dto/sales-order.dto';
import { SalesOrderPosition } from './sales-order-position';

export class SalesOrder {
  id: string;
  orderDate: Date;
  deliveryDate: Date;
  positions: Array<SalesOrderPosition>;

  public static fromDto(salesOrderDto: SalesOrderDto) {
    const salesOrder = new SalesOrder();
    console.log(salesOrderDto);
    salesOrder.deliveryDate = salesOrderDto.deliveryDate;
    salesOrder.orderDate = salesOrderDto.orderDate;
    salesOrder.positions = [];
    salesOrderDto.positions.forEach((dtoPos) =>
      salesOrder.positions.push({ ...dtoPos })
    );
    return salesOrder;
  }
}
