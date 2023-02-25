import { SalesOrder } from '../entity/sales-order';

export class Database {
  private readonly salesOrders: { [key: string]: SalesOrder } = {};
  private id = -1;

  saveSalesOrder(salesOrder: SalesOrder) {
    if (salesOrder.id === undefined) {
      salesOrder.id = ++this.id;
    }
    this.salesOrders[salesOrder.id] = salesOrder;
    return this.salesOrders[salesOrder.id];
  }

  getSalesOrders(): Array<SalesOrder> {
    return Object.keys(this.salesOrders).map((id) => this.salesOrders[id]);
  }

  getSalesOrder(id: number) {
    return this.salesOrders[id];
  }
}
