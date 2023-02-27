import { Injectable } from '@nestjs/common';
import { SalesOrderDto } from 'src/dto/sales-order.dto';
import { DatabaseServiceAPI } from '../database-service-api';
import { SalesOrder } from '../entity/sales-order';
import { SalesOrderMapper } from '../sales-order-mapper';
import { PsqlClient } from './psql-client';

@Injectable()
export class PsqlSalesOrderClient
  extends PsqlClient
  implements DatabaseServiceAPI
{
  constructor(private readonly salesOrderMapper: SalesOrderMapper) {
    super();
  }

  async saveSalesOrder(salesOrderDto: SalesOrderDto): Promise<SalesOrder> {
    const salesOrderSqlObject =
      this.salesOrderMapper.salesOrderFromDto(salesOrderDto);

    const result = await this.sql.begin(async (sql) => {
      const [salesOrder] = await sql`
      insert into sales_orders ${sql(salesOrderSqlObject)}
      returning *
    `;

      const salesOrderPositionSqlObjects = salesOrderDto.positions.map(
        (dtoPos) =>
          this.salesOrderMapper.salesOrderPositionFromDto(dtoPos, salesOrder.id)
      );

      const salesOrderPositions =
        await sql`insert into sales_order_positions ${sql(
          salesOrderPositionSqlObjects
        )}
        returning *
        `;

      return [salesOrder, salesOrderPositions];
    });
    console.log('DB result  ' + JSON.stringify(result));
    this.getSalesOrder2(13);
    return null;
  }

  getSalesOrder(id: number): SalesOrder {
    throw new Error('Method not implemented.');
  }

  async getSalesOrder2(id: number) {
    const result = await this.sql`SELECT * FROM sales_orders so JOIN sales_order_positions sop on so.id = sop.order_id where so.id = ${id};`
    console.log(result);
  }

  orderExists(id: number): boolean {
    throw new Error('Method not implemented.');
  }
}
