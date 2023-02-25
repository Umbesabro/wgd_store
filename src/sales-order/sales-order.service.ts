import { Injectable } from '@nestjs/common';
import { SalesOrder } from 'src/db/entity/sales-order';
import { JsDatabase } from 'src/db/plain-js-in-mem-db/js-database';
import { SalesOrderDto } from 'src/dto/sales-order.dto';
import { EventLogClient } from 'src/event-log-client/sales/event-log-client';
import { ORDER_STATUS } from './order-status';

@Injectable()
export class SalesOrderService {
  private readonly maxRetries = 3;
  private readonly retryTimeout = 5 * 1000;

  constructor(
    private readonly jsDatabase: JsDatabase,
    private readonly eventLogClient: EventLogClient
  ) {}

  createSalesOrder(salesOrderDto: SalesOrderDto): void {
    this.jsDatabase.saveSalesOrder(salesOrderDto);
  }

  async dispatchSalesOrder(id: number) {
    const updatedSalesOrder = await this.retryUpdateSalesOrderStatusWithDelay(
      id,
      ORDER_STATUS.DISPATCH_REQUESTED
    );
    console.log(
      `Updated status of sales order: ${JSON.stringify(updatedSalesOrder)}`
    );
  }

  private async retryUpdateSalesOrderStatusWithDelay(
    id: number,
    status: string,
    retries = this.maxRetries,
    interval = this.retryTimeout,
    finalErr = `Failed to updated status of sales order, aborting`
  ): Promise<SalesOrderDto> {
    try {
      return await this.updateSalesOrderStatus(id, status);
    } catch (err) {
      console.log(err);
      if (retries <= 0) {
        return Promise.reject(finalErr);
      }
      await this.wait(interval);
      return this.retryUpdateSalesOrderStatusWithDelay(
        id,
        status,
        retries - 1,
        interval,
        finalErr
      );
    }
  }

  private isStatusTransitionAllowed(id: number, status: string) {
    const salesOrder: SalesOrder = this.jsDatabase.getSalesOrder(id);
    const isTransitionAllowed =
      ORDER_STATUS.possibleTransitions[salesOrder.status] &&
      ORDER_STATUS.possibleTransitions[salesOrder.status].indexOf(status) > -1;
    if (!isTransitionAllowed) {
      console.error(
        `Cannot change order status from ${salesOrder.status} to ${status}, order id: ${id}`
      );
    }
    return isTransitionAllowed;
  }

  private async updateSalesOrderStatus(
    id: number,
    status: string
  ): Promise<SalesOrderDto> {
    if (!this.jsDatabase.orderExists(id)) {
      throw new Error(
        `Failed to updated status of sales order with id:${id}, order doesn't exist, will retry in ${
          this.retryTimeout / 1000
        } sec`
      );
    } else if (this.isStatusTransitionAllowed(id, status)) {
      return this.jsDatabase.changeSalesOrderStatus(id, status);
    }
  }

  private wait = (ms) =>
    new Promise<void>((resolve) => {
      setTimeout(() => resolve(), ms);
    });
}
