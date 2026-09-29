import { Module } from '@nestjs/common';
import { ServiceClientsModule } from '../clients/service-clients.module';
import { ReservasiController } from './reservasi.controller';

@Module({
  imports: [ServiceClientsModule],
  controllers: [ReservasiController],
})
export class ReservasiModule {}
