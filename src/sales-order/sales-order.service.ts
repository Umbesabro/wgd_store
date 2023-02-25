import { Injectable } from '@nestjs/common';
import { SalesOrder } from 'src/db/entity/sales-order';
import { JsDatabase } from 'src/db/plain-js-in-mem-db/js-database';
import { SalesOrderDto } from './dto/sales-order.dto';
import { ORDER_STATUS } from './order-status';

@Injectable()
export class SalesOrderService {
  private readonly maxRetries = 3;
  private readonly retryTimeout = 5 * 1000;

  constructor(private readonly jsDatabase: JsDatabase) {}

  createSalesOrder(salesOrderDto: SalesOrderDto): void {
    this.jsDatabase.saveSalesOrder(salesOrderDto);
  }

  dispatchSalesOrder(id: number): void {
    this.updateSalesOrderStatus(id, ORDER_STATUS.DISPATCH_REQUESTED);
  }

  private updateSalesOrderStatus(id: number, status: string): void {
    if (!this.jsDatabase.orderExists(id)) {
      this.retryUpdateSalesOrderStatus(id, status);
    } else if (this.isStatusTransitionAllowed(id, status)) {
      this.jsDatabase.changeSalesOrderStatus(id, status);
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

  private retryUpdateSalesOrderStatus(
    id: number,
    status: string,
    retryCount: number = 0
  ): void {
    if (!this.jsDatabase.orderExists(id) && retryCount < this.maxRetries) {
      console.error(
        `Failed to updated status of sales order with id:${id}, order doesn't exist, will retry in ${
          this.retryTimeout / 1000
        } sec`
      );
      setTimeout(
        () => this.retryUpdateSalesOrderStatus(id, status, ++retryCount),
        this.retryTimeout
      );
    } else if (
      this.jsDatabase.orderExists(id) &&
      this.isStatusTransitionAllowed(id, status)
    ) {
      this.jsDatabase.changeSalesOrderStatus(id, status);
    } else if (!this.jsDatabase.orderExists(id)) {
      console.error(
        `Failed to updated status of sales order with id:${id} ${retryCount} times, aborting`
      );
    }
  }
}
