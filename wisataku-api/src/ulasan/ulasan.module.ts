import { Module } from '@nestjs/common';
import { UlasanService } from '@wisataku/domain';
import { UlasanResolver } from './ulasan.resolver';

@Module({
  providers: [UlasanService, UlasanResolver],
  exports: [UlasanService],
})
export class UlasanModule {}
