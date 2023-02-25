import { Injectable } from '@nestjs/common';
import * as Amqp from 'amqp-ts';
import { QueueService } from './queue.service';
import { QUEUES } from './queues';

@Injectable()
export class QueueReader {
  private queues = {};
  private exchanges = {};
  private connection: Amqp.Connection = new Amqp.Connection('amqp://localhost'); // TODO move host to cfg/sys env

  constructor(private readonly queueService: QueueService) {
    this.subscribeNewSalesOrder(QUEUES.NEW_SALES_ORDER);
    this.subscribeDispatchOrder(QUEUES.REQUEST_DISPATCH_ORDER);
    this.subscribeDispatchOrder(QUEUES.DISPATCH_FAILED);
  }

  subscribeNewSalesOrder(queueName) {
    const queue = this.getQueue(queueName);
    queue.activateConsumer((message) =>
      this.queueService.consumeNewSalesOrder(message)
    );
  }
  
  subscribeDispatchOrder(queueName) {
    const queue = this.getQueue(queueName);
    queue.activateConsumer((message) =>
      this.queueService.dispatchSalesOrder(message)
    );
  } 
  subscribeDispatchFailed(queueName) {
    const queue = this.getQueue(queueName);
    queue.activateConsumer((message) =>
      this.queueService.dispatchFailed(message)
    );
  }

  private getQueue(queueName) {
    let queue;
    let exchange;
    if (!this.queues[queueName]) {
      queue = this.connection.declareQueue(queueName);
      exchange = this.connection.declareExchange(queueName);
      queue.bind(exchange);
      this.queues[queueName] = queue;
      this.exchanges[queueName] = exchange;
    } else {
      queue = this.queues[queueName];
      exchange = this.exchanges[queueName];
    }
    return queue;
  }
}
