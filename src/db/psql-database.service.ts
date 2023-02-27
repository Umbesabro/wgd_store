import { Injectable } from '@nestjs/common/decorators';
import { Sequelize, Transaction } from 'sequelize';
import { SalesOrderDto } from 'src/dto/sales-order.dto';
import { SalesOrderPosition } from './model/sales-order-position.model';
import { SalesOrder } from './model/sales-order.model';

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
    console.log('Initilizing database connection...');
    SalesOrder.initModel(this.sequelize);
    SalesOrderPosition.initModel(this.sequelize);
    SalesOrder.associate();
    SalesOrderPosition.associate();
    this.sequelize.sync();
    console.log('Database connection initilized successfuly');
  }

  getSalesOrder(salesOrderId: number): Promise<SalesOrder> {
    try {
      return SalesOrder.findOne({
        where: { id: salesOrderId },
        include: [SalesOrderPosition]
      });
    } catch (error) {
      console.error('Failed to fetch SalesOrder:', error);
    }
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
}
