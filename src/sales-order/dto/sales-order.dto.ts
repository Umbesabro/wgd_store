import { SalesOrderPositionDto } from "./sales-order-position.dto"

export class SalesOrderDto {
    orderDate: Date;
    deliveryDate: Date;
    positions: Array<SalesOrderPositionDto>;
}
