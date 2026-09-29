import { Module } from '@nestjs/common';
import { DestinasiService, FasilitasService, UlasanService } from '@wisataku/domain';
import { DestinasiController } from './destinasi.controller';
import { FasilitasController } from './fasilitas.controller';
import { UlasanController } from './ulasan.controller';

// Ulasan dan Fasilitas tetap di service ini (lihat catatan Bab 8.2 modul)
@Module({
  controllers: [DestinasiController, UlasanController, FasilitasController],
  providers: [DestinasiService, UlasanService, FasilitasService],
})
export class DestinasiModule {}
