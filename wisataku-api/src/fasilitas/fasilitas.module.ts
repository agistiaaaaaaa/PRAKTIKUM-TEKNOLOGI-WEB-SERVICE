import { Module } from '@nestjs/common';
import { FasilitasService } from '@wisataku/domain';

@Module({
  providers: [FasilitasService],
  exports: [FasilitasService],
})
export class FasilitasModule {}
