import { Test } from '@nestjs/testing';
import { Message } from 'amqp-ts';
import sinon from 'sinon';
import { SalesOrderDto } from '../dto/sales-order.dto';
import { ORDER_STATUS } from '../sales-order/order-status';
import { SalesOrderService } from '../sales-order/sales-order.service';
import { QueueService } from './queue.service';

describe('QueueService', () => {
  let queueService: QueueService;
  let salesOrderService: SalesOrderService;
  let createSalesOrderStub: sinon.SinonStub;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: SalesOrderService,
          useValue: {
            createSalesOrder: () => {}
          }
        }
      ]
    }).compile();

    queueService = moduleRef.get<QueueService>(QueueService);
    salesOrderService = moduleRef.get<SalesOrderService>(SalesOrderService);
    createSalesOrderStub = sinon.stub(salesOrderService, 'createSalesOrder');
  });

  afterEach(() => {
    sinon.restore();
  });
  const prepareDto = (): SalesOrderDto => {
    return {
      deliveryDate: null,
      orderDate: null,
      positions: [],
      status: ORDER_STATUS.PENDING
    };
  };
  describe('processNewSalesOrder', () => {
    it('should create a new sales order and acknowledge the message', async () => {
      const salesOrderDto: SalesOrderDto = prepareDto();

      const message = sinon.createStubInstance(Message);
      message.getContent.returns({ payload: JSON.stringify(salesOrderDto) });

      createSalesOrderStub.resolves();

      await queueService.processNewSalesOrder(message);

      sinon.assert.calledOnce(createSalesOrderStub);
      sinon.assert.calledWith(createSalesOrderStub, salesOrderDto);
      sinon.assert.calledOnce(message.ack);
      sinon.assert.calledWithExactly(message.ack, false);
    });

    it('should not ack message if there is an error creating the sales order', async () => {
      const salesOrderDto: SalesOrderDto = prepareDto();
      const error = new Error('Failed to create sales order');
      const message = sinon.createStubInstance(Message);
      message.getContent.returns({ payload: JSON.stringify(salesOrderDto) });

      createSalesOrderStub.rejects(error);

      await queueService.processNewSalesOrder(message);

      sinon.assert.notCalled(message.ack);
    });

    it('should not ack message if there is an error parsing the sales order payload', async () => {
      const invalidPayload = 'invalid_payload';
      const message = sinon.createStubInstance(Message);
      message.getContent.throws({ payload: invalidPayload});

      await queueService.processNewSalesOrder(message);

      sinon.assert.notCalled(message.ack);
    });

    it('should not call createSalesOrder if there is an error parsing the sales order payload', async () => {
      const invalidPayload = 'invalid_payload';
      const message = sinon.createStubInstance(Message);
      message.getContent.throws({ payload: invalidPayload});

      await queueService.processNewSalesOrder(message);

      sinon.assert.notCalled(createSalesOrderStub);
    });
  });
});
