import { SalesOrderDto } from "src/sales-order/dto/sales-order.dto";
import { SalesOrder } from "./entity/sales-order";

export interface DatabaseServiceAPI {

    saveSalesOrder(salesOrder: SalesOrderDto): SalesOrder;
    getSalesOrder(id:string): SalesOrder;

}