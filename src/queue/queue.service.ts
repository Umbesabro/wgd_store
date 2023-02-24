import { Injectable } from '@nestjs/common';
import { Message } from 'amqp-ts';
import { JsDatabase } from 'src/db/plain-js-in-mem-db/js-database';
import { SalesOrderDto } from 'src/sales-order/dto/sales-order.dto';

@Injectable()
export class QueueService {
  constructor(private readonly database: JsDatabase) {}

  consumeNewSalesOrder(newSalesOrderEvent: Message) {
    const { payload } = newSalesOrderEvent.getContent();
    const salesOrderDto: SalesOrderDto = JSON.parse(payload);
    this.database.saveSalesOrder(salesOrderDto);
  }
}
