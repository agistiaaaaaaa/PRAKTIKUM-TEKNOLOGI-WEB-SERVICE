import { Module } from '@nestjs/common';
import { ReservasiService } from '@wisataku/domain';
import { ReservasiController } from './reservasi.controller';

@Module({
  controllers: [ReservasiController],
  providers: [ReservasiService],
})
export class ReservasiModule {}
