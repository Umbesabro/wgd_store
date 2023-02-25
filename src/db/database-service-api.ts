import { SalesOrderDto } from "src/dto/sales-order.dto";
import { SalesOrder } from "./entity/sales-order";

export interface DatabaseServiceAPI {

    saveSalesOrder(salesOrder: SalesOrderDto): SalesOrder;
    getSalesOrder(id:number): SalesOrder;
    orderExists(id: number): boolean;

}