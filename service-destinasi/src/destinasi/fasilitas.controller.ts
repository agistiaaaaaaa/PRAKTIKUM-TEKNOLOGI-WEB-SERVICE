import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FASILITAS_PATTERNS } from '@wisataku/common';
import { FasilitasService } from '@wisataku/domain';

@Controller()
export class FasilitasController {
  constructor(private readonly fasilitasService: FasilitasService) {}

  @MessagePattern(FASILITAS_PATTERNS.findByDestinasi)
  findByDestinasi(@Payload() destinasiId: number) {
    return this.fasilitasService.findByDestinasi(destinasiId);
  }
}
