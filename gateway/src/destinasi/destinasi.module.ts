import { Module } from '@nestjs/common';
import { ServiceClientsModule } from '../clients/service-clients.module';
import { DestinasiV1Controller } from './destinasi-v1.controller';
import { DestinasiResolver } from './destinasi.resolver';
import { UlasanResolver } from './ulasan.resolver';
import { DestinasiV2Controller } from './v2/destinasi-v2.controller';

@Module({
  imports: [ServiceClientsModule],
  controllers: [DestinasiV1Controller, DestinasiV2Controller],
  providers: [DestinasiResolver, UlasanResolver],
})
export class DestinasiModule {}
