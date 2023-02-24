import { Injectable } from '@nestjs/common';
import { SalesOrder } from 'src/db/entity/sales-order';
import { JsDatabase } from 'src/db/plain-js-in-mem-db/js-database';
import { SalesOrderDto } from './dto/sales-order.dto';

@Injectable()
export class SalesOrderService {
  constructor(private readonly jsDatabase: JsDatabase) {}

  createSalesOrder(salesOrderDto: SalesOrderDto): SalesOrder {
    const salesOrder: SalesOrder =
      this.jsDatabase.saveSalesOrder(salesOrderDto);
    return salesOrder;
  }

  
}
