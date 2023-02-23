import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JsDatabase } from './db/plain-js-in-mem-db/js-database';
import { SalesOrderController } from './sales-order/sales-order.controller';
import { SalesOrderService } from './sales-order/sales-order.service';

@Module({
  imports: [],
  controllers: [AppController, SalesOrderController],
  providers: [AppService, SalesOrderService, JsDatabase],
})
export class AppModule {}
