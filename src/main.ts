import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(
    process.env.WGD_STORE_PORT ? process.env.WGD_STORE_PORT : 3002
  );
}

bootstrap();
