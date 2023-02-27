import { Injectable } from '@nestjs/common';
import { SalesOrderPositionDto } from 'src/dto/sales-order-position.dto';
import { SalesOrderDto } from 'src/dto/sales-order.dto';
import { SalesOrder } from './entity/sales-order';
import { SalesOrderPosition } from './entity/sales-order-position';

@Injectable()
export class SalesOrderMapper {
  salesOrderFromDto(salesOrderDto: SalesOrderDto): SalesOrder {
    const salesOrder = new SalesOrder();
    salesOrder.delivery_date = salesOrderDto.deliveryDate;
    salesOrder.order_date = salesOrderDto.orderDate;
    return salesOrder;
  }

  salesOrderPositionFromDto(
    salesOrderPositionDto: SalesOrderPositionDto,
    orderId: number
  ): SalesOrderPosition {
    return {
      product_id: salesOrderPositionDto.productId,
      quantity: salesOrderPositionDto.quantity,
      order_id: orderId
    };
  }
}
