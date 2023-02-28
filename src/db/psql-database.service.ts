import { Logger } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common/decorators';
import { Model, Sequelize, Transaction } from 'sequelize';
import { SalesOrderDto } from 'src/dto/sales-order.dto';
import { SalesOrderPosition } from './model/sales-order-position.model';
import { SalesOrder } from './model/sales-order.model';

@Injectable()
export class PsqlDatabase {
  
  private readonly logger = new Logger(PsqlDatabase.name);
  constructor(@Inject('SEQUELIZE') private readonly sequelize: Sequelize) {
    this.initDatabase();
  }

  private initDatabase() {
    this.logger.log('Initilizing database connection...');
    SalesOrder.initModel(this.sequelize);
    SalesOrderPosition.initModel(this.sequelize);
    SalesOrder.associate();
    SalesOrderPosition.associate();
    this.sequelize.sync();
    this.logger.log('Database connection initilized successfuly');
  }

  getSalesOrder(salesOrderId: number): Promise<SalesOrder> {
    try {
      return SalesOrder.findOne({
        where: { id: salesOrderId },
        include: {
          model: SalesOrderPosition,
          as: 'positions'
        }
      });
    } catch (error) {
      this.logger.error('Failed to fetch SalesOrder:', error);
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
      await Promise.all(
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
      await transaction.commit();

      this.logger.log('SalesOrder with positions created successfully!');
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      this.logger.error('Failed to create SalesOrder with positions:', error);
    }
  }

  save<T extends Model>(model: T): void {
    try {
      model.save();
    } catch (err) {
      this.logger.error(`Failed to save ${JSON.stringify(model)}`);
    }
  }
}
