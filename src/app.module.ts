import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SalesOrderService } from './sales-order/sales-order.service';
import { QueueService } from './queue/queue.service';
import { QueueReader } from './queue/queue-reader';
import { EventLogClient } from './event-log-client/sales/event-log-client';
import { PsqlSalesOrderClient } from './db/psql/psql-sales-order-client';
import { SalesOrderMapper } from './db/sales-order-mapper';
import { PsqlDatabase } from './db/psql-database.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    SalesOrderService,
    QueueService,
    QueueReader,
    EventLogClient,
    PsqlSalesOrderClient,
    SalesOrderMapper,
    PsqlDatabase
  ]
})
export class AppModule {}
