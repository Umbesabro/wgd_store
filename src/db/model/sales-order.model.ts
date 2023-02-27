import { DataTypes, HasManyCreateAssociationMixin, Model } from 'sequelize';
import { SalesOrderPosition } from './sales-order-position.model';

export interface SalesOrderAttributes {
  id: number;
  orderDate: Date;
  deliveryDate: Date;
  status: string;
}

export class SalesOrder extends Model<SalesOrderAttributes> implements SalesOrderAttributes {
  public id!: number;
  public orderDate!: Date;
  public deliveryDate!: Date;
  public status!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public positions?: SalesOrderPosition[];

  public static associations: {
    positions: any;
  };

  public static initModel(sequelize): void {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        orderDate: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        deliveryDate: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING(50),
          allowNull: false,
          defaultValue: 'PENDING',
        },
      },
      {
        tableName: 'sales_orders',
        sequelize,
      },
    );
  }

  public createPositions?: HasManyCreateAssociationMixin<SalesOrderPosition>;

  public static associate(): void {
    this.hasMany(SalesOrderPosition, {
      sourceKey: 'id',
      foreignKey: 'salesOrderId',
      as: 'positions',
    });
  }
}

