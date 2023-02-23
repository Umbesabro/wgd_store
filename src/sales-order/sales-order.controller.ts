import { Body, Controller, Post } from '@nestjs/common';
import { SalesOrder } from 'src/db/entity/sales-order';
import { SalesOrderDto } from './dto/sales-order.dto';
import { SalesOrderService } from './sales-order.service';

@Controller('api/order/sales')
export class SalesOrderController {
  constructor(private readonly salesOrderService: SalesOrderService) {}

  @Post('/create')
  createSalesOrder(@Body() salesOrderDto: SalesOrderDto): SalesOrder {
    return this.salesOrderService.createSalesOrder(salesOrderDto);
  }
}
