import { DataTypes, Model } from 'sequelize';
import { SalesOrder } from './sales-order.model';

interface SalesOrderPositionAttributes {
  id: number;
  productId: number;
  quantity: number;
  salesOrderId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class SalesOrderPosition extends Model<
  SalesOrderPositionAttributes,
  Partial<SalesOrderPositionAttributes>
> {
  public id!: number;
  public productId!: number;
  public quantity!: number;
  public salesOrderId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getSalesOrder!: () => Promise<SalesOrder>;

  public static initModel(sequelize): void {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        productId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        salesOrderId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'sales_orders',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      },
      {
        tableName: 'sales_order_positions',
        sequelize
      }
    );
  }

  public static associate(): void {
    this.belongsTo(SalesOrder, {
      foreignKey: {
        name: 'salesOrderId',
        allowNull: false
      },
      onDelete: 'CASCADE'
    });
  }
}
