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
    const salesOrder = await this.retryUpdateSalesOrderStatusWithDelay(
      id,
      ORDER_STATUS.DISPATCH_REQUESTED
    );
    if (salesOrder) { // TODO Change to try...catch...this if is needed as I need to change retryUpdate... it returns undefined if failes....
      this.eventLogClient.dispatchOrderFromWarehouse(salesOrder);
    }
  }

  async setDispatchFailedStatus(id: number) {
    await this.retryUpdateSalesOrderStatusWithDelay(
      id,
      ORDER_STATUS.DISPATCH_FAILED
    );
  }

  async setDispatchSuccessfulStatus(id: number) {
    await this.retryUpdateSalesOrderStatusWithDelay(
      id,
      ORDER_STATUS.DISPATCH_SUCCESSFUL
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
    console.log(`Updating status of sales order id ${id}`);
    if (!this.jsDatabase.orderExists(id)) {
      throw new Error(
        `Failed to updated status of sales order with id:${id}, order doesn't exist, will retry in ${
          this.retryTimeout / 1000
        } sec`
      );
    } else if (this.isStatusTransitionAllowed(id, status)) {
      const salesOrder: SalesOrder = this.jsDatabase.changeSalesOrderStatus(
        id,
        status
      );
      console.log(`Updated order status ${JSON.stringify(salesOrder)}`);
      return SalesOrderDto.fromEntity(salesOrder);
    }
  }

  private wait = (ms) =>
    new Promise<void>((resolve) => {
      setTimeout(() => resolve(), ms);
    });
}
