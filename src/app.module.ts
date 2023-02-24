import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JsDatabase } from './db/plain-js-in-mem-db/js-database';
import { SalesOrderController } from './sales-order/sales-order.controller';
import { SalesOrderService } from './sales-order/sales-order.service';
import { QueueService } from './queue/queue.service';
import { QueueReader } from './queue/queue-reader';

@Module({
  imports: [],
  controllers: [AppController, SalesOrderController],
  providers: [AppService, SalesOrderService, JsDatabase, QueueService, QueueReader],
})
export class AppModule {}
