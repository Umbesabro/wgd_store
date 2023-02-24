import { Body, Controller, Post } from '@nestjs/common';
import { SalesOrder } from 'src/db/entity/sales-order';
import { SalesClient } from 'wgd_event_log_client';
import { SalesOrderDto } from './dto/sales-order.dto';
import { SalesOrderService } from './sales-order.service';

@Controller('api/order/sales')
export class SalesOrderController {
  constructor(private readonly salesOrderService: SalesOrderService) {}

}
