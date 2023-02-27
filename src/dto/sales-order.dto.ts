import { SalesOrder } from 'src/db/entity/sales-order';
import { SalesOrderPositionDto } from './sales-order-position.dto';

export class SalesOrderDto {
  id?: number;
  orderDate: Date;
  deliveryDate: Date;
  positions: Array<SalesOrderPositionDto>;
  status: string = 'PENDING';

  static fromEntity(salesOrder: SalesOrder): SalesOrderDto {
    const salesOrderDto: SalesOrderDto = new SalesOrderDto();
    const {
      id,
      order_date: orderDate,
      delivery_date: deliveryDate,
      // positions
    } = salesOrder;
    salesOrderDto.id = id;
    salesOrderDto.orderDate = orderDate;
    salesOrderDto.deliveryDate = deliveryDate;

    const dtoPositions: SalesOrderPositionDto[] = [];
    // positions.forEach((pos) => {
    //   const saleOrderPosition: SalesOrderPositionDto =
    //     new SalesOrderPositionDto();
    //   saleOrderPosition.orderId = pos.order_id;
    //   saleOrderPosition.productId = pos.product_id;
    //   saleOrderPosition.quantity = pos.quantity;
    //   dtoPositions.push(saleOrderPosition);
    // });

    salesOrderDto.positions = []; // TODO
    return salesOrderDto;
  }
}
