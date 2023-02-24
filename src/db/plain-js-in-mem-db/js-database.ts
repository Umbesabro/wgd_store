import { Injectable } from '@nestjs/common';
import { SalesOrderDto } from 'src/sales-order/dto/sales-order.dto';
import { DatabaseServiceAPI } from '../database-service-api';
import { SalesOrder } from '../entity/sales-order';
import { Database } from './database';

@Injectable()
export class JsDatabase implements DatabaseServiceAPI {
  private readonly database: Database = new Database();

  saveSalesOrder(salesOrderDto: SalesOrderDto): SalesOrder {
    const salesOrder = SalesOrder.fromDto(salesOrderDto);
    salesOrder.id = 'id' + new Date().getTime();
    this.database.saveSalesOrder(salesOrder);

    //temp
    console.log(`
        SalesOrders:
        ${JSON.stringify(this.database.getSalesOrders(), null, 2)}
    `);

    return salesOrder;
  }

  getSalesOrder(id: string) {
    return this.database.getSalesOrders().filter((so) => so.id === id)[0];
  }
}
