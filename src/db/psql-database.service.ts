import { Injectable } from '@nestjs/common/decorators';
import { Sequelize, Transaction } from 'sequelize';
import { SalesOrderDto } from 'src/dto/sales-order.dto';
import { SalesOrderPosition } from './entity/model/sales-order-position.model';
import { SalesOrder } from './entity/model/sales-order.model';

@Injectable()
export class PsqlDatabase {

  private readonly sequelize = new Sequelize(
    'wgd_store',
    process.env.WGD_PSQL_USER,
    process.env.WGD_PSQL_PW,
    {
      host: 'localhost',
      dialect: 'postgres',
      port: 5432,
      logging: false
    }
  );

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    console.log("Initilizing database connection...");
    SalesOrder.initModel(this.sequelize);
    SalesOrderPosition.initModel(this.sequelize);
    SalesOrder.associate();
    SalesOrderPosition.associate();
    this.sequelize.sync();
    console.log("Database connection initilized successfuly");
  }

  async createSalesOrder(salesOrderDto: SalesOrderDto) {
    let transaction: Transaction;

    try {
      transaction = await this.sequelize.transaction();
      const { orderDate, deliveryDate, status, positions } = salesOrderDto;
      const salesOrder = await SalesOrder.create(
        {
          orderDate,
          deliveryDate,
          status
        },
        { transaction }
      );

      const dbSalesOrderPositions = await Promise.all(
        positions.map((pos) =>
          SalesOrderPosition.create(
            {
              productId: pos.productId,
              quantity: pos.quantity,
              salesOrderId: salesOrder.id
            },
            { transaction }
          )
        )
      );
      console.log(JSON.stringify(salesOrder));

      await transaction.commit();

      console.log('SalesOrder with positions created successfully!');
    } catch (error) {
      // rollback the transaction if something went wrong
      if (transaction) {
        await transaction.rollback();
      }

      console.error('Failed to create SalesOrder with positions:', error);
    }
  }

  createSalesOrderWithPositions = async (): Promise<void> => {
    let transaction: Transaction;

    try {
      transaction = await this.sequelize.transaction();

      // create a new SalesOrder
      const salesOrder = await SalesOrder.create(
        {
          orderDate: new Date(),
          deliveryDate: new Date(),
          status: 'PENDING'
        },
        { transaction }
      );
      // create 3 new SalesOrderPositions, associated with the new SalesOrder
      const positions = await Promise.all([
        SalesOrderPosition.create(
          {
            productId: 1,
            quantity: 2,
            salesOrderId: salesOrder.id
          },
          { transaction }
        ),
        SalesOrderPosition.create(
          {
            productId: 2,
            quantity: 1,
            salesOrderId: salesOrder.id
          },
          { transaction }
        ),
        SalesOrderPosition.create(
          {
            productId: 3,
            quantity: 4,
            salesOrderId: salesOrder.id
          },
          { transaction }
        )
      ]);

      // commit the transaction if everything went well
      await transaction.commit();

      console.log('SalesOrder with positions created successfully!');
    } catch (error) {
      // rollback the transaction if something went wrong
      if (transaction) {
        await transaction.rollback();
      }

      console.error('Failed to create SalesOrder with positions:', error);
    }
  };
}
