import { Injectable } from '@nestjs/common';
import { SalesOrder } from 'src/db/model/sales-order.model';
import { PsqlDatabase } from 'src/db/psql-database.service';
import { SalesOrderDto } from 'src/dto/sales-order.dto';
import { EventLogClient } from 'src/event-log-client/sales/event-log-client';
import { ORDER_STATUS } from './order-status';

@Injectable()
export class SalesOrderService {
  constructor(
    private readonly eventLogClient: EventLogClient,
    private readonly psqlDatabase: PsqlDatabase
  ) {}

  createSalesOrder(salesOrderDto: SalesOrderDto): void {
    this.psqlDatabase.createSalesOrder(salesOrderDto);
  }

  async dispatchSalesOrder(id: number) {
    const salesOrder = await this.updateSalesOrderStatus(
      id,
      ORDER_STATUS.DISPATCH_REQUESTED
    );
    if (salesOrder) {
      // TODO Change to try...catch...this if is needed as I need to change retryUpdate... it returns undefined if failes....
      this.eventLogClient.dispatchOrderFromWarehouse(salesOrder);
    }
  }

  async setDispatchFailedStatus(id: number) {
    await this.updateSalesOrderStatus(id, ORDER_STATUS.DISPATCH_FAILED);
  }

  async setDispatchSuccessfulStatus(id: number) {
    await this.updateSalesOrderStatus(id, ORDER_STATUS.DISPATCH_SUCCESSFUL);
  }

  private async isStatusTransitionAllowed(salesOrder, status) {
    const isTransitionAllowed =
      ORDER_STATUS.possibleTransitions[salesOrder.status] &&
      ORDER_STATUS.possibleTransitions[salesOrder.status].indexOf(status) > -1;
    if (!isTransitionAllowed) {
      console.error(
        `Cannot change order status from ${salesOrder.status} to ${status}, order id: ${salesOrder.id}`
      );
    }
    return isTransitionAllowed;
  }

  private async updateSalesOrderStatus(
    id: number,
    status: string
  ): Promise<SalesOrderDto> {
    console.log(`Updating status of sales order id ${id}`);
    const salesOrder: SalesOrder = await this.psqlDatabase.getSalesOrder(id);
    if (salesOrder === null) {
      console.error(
        `Cannot update status of sales order with id:${id} as it doesn't exist`
      );
      return null; // TODO
    }
    const isStatusTransationAllowed = await this.isStatusTransitionAllowed(
      salesOrder,
      status
    );
    if (isStatusTransationAllowed) {
      salesOrder.status = status;
      await salesOrder.save();
      console.log(`Updated order status ${JSON.stringify(salesOrder)}`);
      return SalesOrderDto.fromEntity(salesOrder);
    }
  }
}
