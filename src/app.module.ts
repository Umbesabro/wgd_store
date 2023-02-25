import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JsDatabase } from './db/plain-js-in-mem-db/js-database';
import { SalesOrderService } from './sales-order/sales-order.service';
import { QueueService } from './queue/queue.service';
import { QueueReader } from './queue/queue-reader';
import { EventLogClient } from './event-log-client/sales/event-log-client';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, SalesOrderService, JsDatabase, QueueService, QueueReader, EventLogClient],
})
export class AppModule {}
