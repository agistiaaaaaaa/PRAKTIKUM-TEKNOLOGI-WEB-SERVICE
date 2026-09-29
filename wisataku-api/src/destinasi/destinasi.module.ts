import { Module } from '@nestjs/common';
import { DestinasiService } from '@wisataku/domain';
import { FasilitasModule } from '../fasilitas/fasilitas.module';
import { UlasanModule } from '../ulasan/ulasan.module';
import { DestinasiController } from './destinasi.controller';
import { DestinasiResolver } from './destinasi.resolver';

@Module({
  imports: [UlasanModule, FasilitasModule],
  controllers: [DestinasiController],
  providers: [DestinasiService, DestinasiResolver],
})
export class DestinasiModule {}
