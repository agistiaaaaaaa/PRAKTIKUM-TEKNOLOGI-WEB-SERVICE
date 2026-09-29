import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AsyncMicroserviceOptions, Transport } from '@nestjs/microservices';
import { HttpToRpcExceptionFilter } from '@wisataku/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(AppModule, {
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      transport: Transport.TCP,
      options: { host: '0.0.0.0', port: Number(config.get('SERVICE_DESTINASI_PORT', 5001)) },
    }),
  });
  app.useGlobalFilters(new HttpToRpcExceptionFilter());
  await app.listen();
  Logger.log('service-destinasi siap menerima pesan TCP', 'Bootstrap');
}
bootstrap();
