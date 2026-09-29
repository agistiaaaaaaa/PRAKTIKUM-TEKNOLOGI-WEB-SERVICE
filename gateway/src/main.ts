import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupGateway } from './setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupGateway(app);

  const port = app.get(ConfigService).get<number>('GATEWAY_PORT', 3000);
  await app.listen(port);
  Logger.log(`API Gateway berjalan di http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
