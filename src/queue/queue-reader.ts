import { Injectable, Inject } from '@nestjs/common';
import * as Amqp from 'amqp-ts';
import { QueueService } from './queue.service';
import { QUEUES } from './queues';

@Injectable()
export class QueueReader {
  private queues = {};
  private exchanges = {};

  constructor(
    private readonly queueService: QueueService,
    @Inject('AMQP_CONNECTION') private readonly connection: Amqp.Connection,
  ) {
    this.subscribeNewSalesOrder(QUEUES.NEW_SALES_ORDER);
    this.subscribeDispatchOrder(QUEUES.REQUEST_DISPATCH_ORDER);
    this.subscribeDispatchFailed(QUEUES.DISPATCH_FAILED);
    this.subscribeDispatchSuccessful(QUEUES.DISPATCH_SUCCESSFUL);
  }

  private subscribeNewSalesOrder(queueName) {
    const queue = this.getQueue(queueName);
    queue.activateConsumer((message) =>
      this.queueService.processNewSalesOrder(message)
    );
  }

  private subscribeDispatchOrder(queueName) {
    const queue = this.getQueue(queueName);
    queue.activateConsumer((message) =>
      this.queueService.dispatchSalesOrder(message)
    );
  }

  private subscribeDispatchFailed(queueName) {
    const queue = this.getQueue(queueName);
    queue.activateConsumer((message) =>
      this.queueService.processDispatchFailed(message)
    );
  }

  private subscribeDispatchSuccessful(queueName) {
    const queue = this.getQueue(queueName);
    queue.activateConsumer((message) =>
      this.queueService.processDispatchSuccessful(message)
    );
  }

  private getQueue(queueName) {
    if (!this.queues[queueName]) {
      const { queue, exchange } = this.createQueueAndExchange(queueName);
      this.queues[queueName] = queue;
      this.exchanges[queueName] = exchange;
    }
    return this.queues[queueName];
  }

  private createQueueAndExchange(queueName) {
    const queue = this.connection.declareQueue(queueName);
    const exchange = this.connection.declareExchange(queueName);
    queue.bind(exchange);
    return { queue, exchange };
  }
}
