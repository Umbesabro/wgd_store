import { SalesOrder } from '../entity/sales-order';

export class Database {
  private readonly salesOrders: Array<SalesOrder> = [];

  saveSalesOrder(salesOrder: SalesOrder) {
    this.salesOrders.push(salesOrder);
  }

  getSalesOrders(): Array<SalesOrder> {
    return this.salesOrders;
  }
}
