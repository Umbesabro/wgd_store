import { Injectable, Logger } from '@nestjs/common';
import { Message } from 'amqp-ts';
import { SalesOrderDto } from '../dto/sales-order.dto';
import { SalesOrderService } from '../sales-order/sales-order.service';

@Injectable()
export class QueueService {
  private readonly logger: Logger = new Logger(QueueService.name);
  constructor(private readonly salesOrderService: SalesOrderService) {}

  processNewSalesOrder(newSalesOrderEventMsg: Message) {
    try {
      const { payload } = newSalesOrderEventMsg.getContent();
      const salesOrderDto: SalesOrderDto = JSON.parse(payload);
      this.salesOrderService
        .createSalesOrder(salesOrderDto)
        .then(() => newSalesOrderEventMsg.ack(false))
        .catch((err) => {
          this.logger.error(`Failed to create new sales order`, err);
        });
    } catch (err) {
      this.logger.error(`Failed to process new sales order event`, err);
    }
  }

  processDispatchFailed(dispatchFailedEventMsg: Message) {
    try {
      const { payload } = dispatchFailedEventMsg.getContent();
      const salesOrderDto: SalesOrderDto = JSON.parse(payload);
      this.salesOrderService
        .setDispatchFailedStatus(salesOrderDto.id)
        .then(() => dispatchFailedEventMsg.ack(false))
        .catch((err) => {
          this.logger.error(`Failed to set dispatch failed status`, err);
        });
      dispatchFailedEventMsg.ack(false);
    } catch (err) {
      this.logger.error(`Failed to process dispatch failed event`, err);
    }
  }

  processDispatchSuccessful(dispatchSuccessfulEventMsg: Message) {
    try {
      const { payload } = dispatchSuccessfulEventMsg.getContent();
      const salesOrderDto: SalesOrderDto = JSON.parse(payload);
      this.salesOrderService
        .setDispatchSuccessfulStatus(salesOrderDto.id)
        .then(() => dispatchSuccessfulEventMsg.ack(false))
        .catch((err) => {
          this.logger.error(`Failed to set dispatch successful status`, err);
        });
      dispatchSuccessfulEventMsg.ack(false);
    } catch (err) {
      this.logger.error(`Failed to process dispatch successful event`, err);
    }
  }

  dispatchSalesOrder(dispatchSalesOrderEventMsg: Message) {
    try {
      const { payload } = dispatchSalesOrderEventMsg.getContent();
      const { id } = JSON.parse(payload);
      this.salesOrderService
        .dispatchSalesOrder(id)
        .then(() => dispatchSalesOrderEventMsg.ack(false))
        .catch((err) => {
          this.logger.error(`Failed to dispatch sales order`, err);
        });
      dispatchSalesOrderEventMsg.ack(false);
    } catch (err) {
      this.logger.error(`Failed to process dispatch sales order event`, err);
    }
  }
}
