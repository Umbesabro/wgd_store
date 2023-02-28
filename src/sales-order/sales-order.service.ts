import { Injectable, Logger } from '@nestjs/common';
import { SalesOrder } from '../db/model/sales-order.model';
import { PsqlDatabase } from '../db/psql-database.service';
import { SalesOrderDto } from '../dto/sales-order.dto';
import { EventLogClient } from '../event-log-client/sales/event-log-client';
import { ORDER_STATUS } from './order-status';

@Injectable()
export class SalesOrderService {
  private readonly logger: Logger = new Logger(SalesOrderService.name);

  constructor(private readonly eventLogClient: EventLogClient, private readonly psqlDatabase: PsqlDatabase) {}

  async createSalesOrder(salesOrderDto: SalesOrderDto): Promise<void> {
    if (salesOrderDto) {
      await this.psqlDatabase.createSalesOrder(salesOrderDto);
    } else {
      this.logger.error('Received undefined instead of instance of SalesOrderDto');
    }
  }

  async dispatchSalesOrder(id: number): Promise<void> {
    let salesOrder: SalesOrderDto;
    try {
      salesOrder = await this.updateSalesOrderStatus(id, ORDER_STATUS.DISPATCH_REQUESTED);
      this.dispatchOrderFromWarehouse(salesOrder, id);
    } catch (err) {
      this.logger.error('Failed to change statatus of order with id ' + id, err);
    }
  }

  private async dispatchOrderFromWarehouse(salesOrder: SalesOrderDto, id: number) {
    try {
      await this.eventLogClient.dispatchOrderFromWarehouse(salesOrder);
    } catch (error) {
      this.logger.error(`Failed to dispatch order ${id}: ${error.message}`);
      await this.setDispatchFailedStatus(id);
    }
  }

  async setDispatchFailedStatus(id: number): Promise<void> {
    try {
      await this.updateSalesOrderStatus(id, ORDER_STATUS.DISPATCH_FAILED);
    } catch (err) {
      this.logger.error('Failed to change statatus of order with id ' + id, err);
    }
  }

  async setDispatchSuccessfulStatus(id: number): Promise<void> {
    try {
      await this.updateSalesOrderStatus(id, ORDER_STATUS.DISPATCH_SUCCESSFUL);
    } catch (err) {
      this.logger.error('Failed to change statatus of order with id ' + id, err);
    }
  }

  private async updateSalesOrderStatus(id: number, status: string): Promise<SalesOrderDto> {
    this.logger.log(`Updating status of sales order id ${id}`);
    const salesOrder = await this.psqlDatabase.getSalesOrder(id);
    if (!salesOrder) {
      throw new Error(`Cannot update status of sales order with id:${id} as it doesn't exist`);
    }

    const isStatusTransitionAllowed = this.isStatusTransitionAllowed(salesOrder, status);
    if (!isStatusTransitionAllowed) {
      throw new Error(`Cannot change order status from ${salesOrder.status} to ${status}, order id: ${salesOrder.id}`);
    }
    salesOrder.status = status;
    await this.psqlDatabase.save(salesOrder);
    this.logger.log(`Updated order status ${JSON.stringify(salesOrder)}`);
    return SalesOrderDto.fromEntity(salesOrder);
  }

  private isStatusTransitionAllowed(salesOrder: SalesOrder, status: string): boolean {
    const allowedTransitions = ORDER_STATUS.possibleTransitions[salesOrder.status];
    return allowedTransitions !== undefined && allowedTransitions.indexOf(status) !== -1;
  }
}
