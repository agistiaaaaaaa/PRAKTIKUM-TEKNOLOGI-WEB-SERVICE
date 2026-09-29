import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { configureHttpApp } from '@wisataku/common';
import { API_INFO } from './api-info';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureHttpApp(app, API_INFO);

  const port = app.get(ConfigService).get<number>('API_PORT', 3000);
  await app.listen(port);
  Logger.log(`WisataKu API (monolitik) berjalan di http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
