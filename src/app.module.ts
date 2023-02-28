import { Module } from '@nestjs/common';
import * as Amqp from 'amqp-ts';
import { Sequelize } from 'sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PsqlDatabase } from './db/psql-database.service';
import { EventLogClient } from './event-log-client/sales/event-log-client';
import { QueueReader } from './queue/queue-reader';
import { QueueService } from './queue/queue.service';
import { SalesOrderService } from './sales-order/sales-order.service';

const AMQP_CONNECTION = 'AMQP_CONNECTION';
const SEQUELIZE = 'SEQUELIZE';
const amqpConnectionProvider = {
  provide: AMQP_CONNECTION,
  useValue: new Amqp.Connection('amqp://localhost')
};

const sequelizeProvider = {
  provide: SEQUELIZE,
  useValue: new Sequelize('wgd_store', process.env.WGD_PSQL_USER, process.env.WGD_PSQL_PW, {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
    logging: false
  })
};

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    SalesOrderService,
    QueueService,
    QueueReader,
    EventLogClient,
    PsqlDatabase,
    amqpConnectionProvider,
    sequelizeProvider
  ]
})
export class AppModule {}
