import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { EventDto } from 'src/dto/event.dto';
import { SalesOrderDto } from 'src/dto/sales-order.dto';
import { QUEUES } from 'src/queue/queues';
import { Config } from '../cfg/config';

@Injectable()
export class EventLogClient {
  async dispatchOrderFromWarehouse(salesOrder: SalesOrderDto): Promise<EventDto> {
    const r = await axios.post(Config.createEventUrl, {
      payload: salesOrder,
      name: QUEUES.WAREHOUSE_DISPATCH_ORDER,
    });
    return r.data;
  }
}
