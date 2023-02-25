import { Injectable } from '@nestjs/common';
import { Message } from 'amqp-ts';
import { SalesOrderDto } from 'src/sales-order/dto/sales-order.dto';
import { SalesOrderService } from 'src/sales-order/sales-order.service';

@Injectable()
export class QueueService {
  constructor(private readonly salesorderService: SalesOrderService) {}

  consumeNewSalesOrder(newSalesOrderEventMsg: Message) {
    try {
      const { payload } = newSalesOrderEventMsg.getContent();
      const salesOrderDto: SalesOrderDto = JSON.parse(payload);
      this.salesorderService.createSalesOrder(salesOrderDto);
    } catch (err) {
      console.error(
        `Failed to process message ${JSON.stringify(newSalesOrderEventMsg)}`,
        err
      );
    }
  }

  dispatchSalesOrder(dispatchSalesOrderEventMsg: Message) {
    try {
      const { payload } = dispatchSalesOrderEventMsg.getContent();
      const { id } = JSON.parse(payload);
      this.salesorderService.dispatchSalesOrder(id);
    } catch (err) {
      console.error(
        `Failed to process message ${JSON.stringify(
          dispatchSalesOrderEventMsg
        )}`,
        err
      );
    }
  }
}
