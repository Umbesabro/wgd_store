import { Test, TestingModule } from '@nestjs/testing';
import sinon from 'sinon';
import { SalesOrder } from '../db/model/sales-order.model';
import { PsqlDatabase } from '../db/psql-database.service';
import { SalesOrderDto } from '../dto/sales-order.dto';
import { EventLogClient } from '../event-log-client/sales/event-log-client';
import { ORDER_STATUS } from './order-status';
import { SalesOrderService } from './sales-order.service';

describe('SalesOrderService', () => {
  let service: SalesOrderService;
  let psqlDatabase: PsqlDatabase;
  let eventLogClient: EventLogClient;
  const salesOrderMock = sinon.createStubInstance(SalesOrder);
  const psqlDatabaseMock = sinon.createStubInstance(PsqlDatabase);
  beforeEach(async () => {
    salesOrderMock.id = 1;
    salesOrderMock.status = 'PENDING';
    salesOrderMock.positions = [];
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesOrderService,
        {
          provide: PsqlDatabase,
          useValue: psqlDatabaseMock
        },
        {
          provide: EventLogClient,
          useValue: {
            dispatchOrderFromWarehouse: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<SalesOrderService>(SalesOrderService);
    psqlDatabase = module.get<PsqlDatabase>(PsqlDatabase);
    eventLogClient = module.get<EventLogClient>(EventLogClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
    sinon.reset();
  });

  describe('save', () => {
    it('Should not call save on db when provided dto is undefined', () => {
      service.createSalesOrder(undefined);

      sinon.assert.notCalled(psqlDatabase.createSalesOrder);
    });

    it('Should call save on db with given dto', () => {
      const salesOrderDto: SalesOrderDto = {
        deliveryDate: new Date(),
        orderDate: new Date(),
        positions: [],
        status: 'PENDING'
      };
      service.createSalesOrder(salesOrderDto);

      sinon.assert.calledWith(psqlDatabase.createSalesOrder, salesOrderDto);
    });
  });

  describe('dispatchSalesOrder', () => {
    [ORDER_STATUS.PENDING, ORDER_STATUS.DISPATCH_FAILED].forEach((orderStatus) => {
      it(`Should be able to request dispatch when status is  ${orderStatus}`, async () => {
        salesOrderMock.status = orderStatus;
        psqlDatabaseMock.getSalesOrder.returns({ ...salesOrderMock });
        const salesOrderToBeSaved = { ...salesOrderMock, ...{ status: ORDER_STATUS.DISPATCH_REQUESTED } };

        await service.dispatchSalesOrder(0);

        sinon.assert.calledWith(psqlDatabase.save, salesOrderToBeSaved);
      });
    });

    [ORDER_STATUS.DISPATCH_REQUESTED, ORDER_STATUS.DISPATCH_SUCCESSFUL].forEach((orderStatus) => {
      it(`Should NOT be able to request dispatch when status is ${orderStatus}`, async () => {
        salesOrderMock.status = orderStatus;
        psqlDatabaseMock.getSalesOrder.returns({ ...salesOrderMock });

        await service.dispatchSalesOrder(0);

        sinon.assert.notCalled(psqlDatabase.save);
      });
    });
  });
  
  describe('setDispatchFailedStatus', () => {
    [ ORDER_STATUS.DISPATCH_REQUESTED].forEach((orderStatus) => {
      it(`Should be able to change status to failed when status is ${orderStatus}`, async () => {
        salesOrderMock.status = orderStatus;
        psqlDatabaseMock.getSalesOrder.returns({ ...salesOrderMock });
        const salesOrderToBeSaved = { ...salesOrderMock, ...{ status: ORDER_STATUS.DISPATCH_FAILED } };

        await service.setDispatchFailedStatus(0);

        sinon.assert.calledWith(psqlDatabase.save, salesOrderToBeSaved);
      });
    });

    [ORDER_STATUS.PENDING, ORDER_STATUS.DISPATCH_SUCCESSFUL, ORDER_STATUS.DISPATCH_FAILED].forEach((orderStatus) => {
      it(`Should NOT be able to change status to failed when status is ${orderStatus}`, async () => {
        salesOrderMock.status = orderStatus;
        psqlDatabaseMock.getSalesOrder.returns({ ...salesOrderMock });

        await service.setDispatchFailedStatus(0);

        sinon.assert.notCalled(psqlDatabase.save);
      });
    });
  });
});
