import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DestinasiClient } from './destinasi.client';
import { ReservasiClient } from './reservasi.client';
import { DESTINASI_SERVICE, RESERVASI_SERVICE } from './service-tokens';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: DESTINASI_SERVICE,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('SERVICE_DESTINASI_HOST', 'localhost'),
            port: Number(config.get('SERVICE_DESTINASI_PORT', 5001)),
          },
        }),
      },
      {
        name: RESERVASI_SERVICE,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('SERVICE_RESERVASI_HOST', 'localhost'),
            port: Number(config.get('SERVICE_RESERVASI_PORT', 5002)),
          },
        }),
      },
    ]),
  ],
  providers: [DestinasiClient, ReservasiClient],
  exports: [DestinasiClient, ReservasiClient],
})
export class ServiceClientsModule {}
