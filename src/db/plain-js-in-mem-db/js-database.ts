import { Injectable } from '@nestjs/common';
import { SalesOrderDto } from 'src/dto/sales-order.dto';
import { DatabaseServiceAPI } from '../database-service-api';
import { SalesOrder } from '../entity/sales-order';
import { Database } from './database';

@Injectable()
export class JsDatabase implements DatabaseServiceAPI {
  private readonly database: Database = new Database();

  saveSalesOrder(salesOrderDto: SalesOrderDto): SalesOrder {
    const salesOrder = SalesOrder.fromDto(salesOrderDto);
    this.database.saveSalesOrder(salesOrder);

    //temp
    console.log(`
        SalesOrders[${this.database.getSalesOrders().length}]:
        ${JSON.stringify(this.database.getSalesOrders(), null, 2)}
    `);

    return salesOrder;
  }

  changeSalesOrderStatus(id: number, status: string): SalesOrder {
    const salesOrder = this.database.getSalesOrder(id);
    salesOrder.status = status;
    const updatedSalesOrder = this.database.saveSalesOrder(salesOrder);
    //temp
    console.log(`
    SalesOrders[${this.database.getSalesOrders().length}]:
        ${JSON.stringify(this.database.getSalesOrders(), null, 2)}
    `);
    return updatedSalesOrder;
  }

  getSalesOrder(id: number) {
    return this.database.getSalesOrder(id);
  }

  orderExists(id: number): boolean {
    return this.database.getSalesOrder(id) !== undefined;
  }
}
