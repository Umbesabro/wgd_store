import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { QueueReader } from './queue/queue-reader';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3002);
}
bootstrap();
