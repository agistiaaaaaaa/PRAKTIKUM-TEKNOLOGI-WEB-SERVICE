import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ULASAN_PATTERNS } from '@wisataku/common';
import { CreateUlasanPayload, UlasanByDestinasiPayload, UlasanService } from '@wisataku/domain';

@Controller()
export class UlasanController {
  constructor(private readonly ulasanService: UlasanService) {}

  @MessagePattern(ULASAN_PATTERNS.findByDestinasi)
  findByDestinasi(@Payload() { destinasiId, limit }: UlasanByDestinasiPayload) {
    return this.ulasanService.findByDestinasi(destinasiId, limit);
  }

  @MessagePattern(ULASAN_PATTERNS.create)
  create(@Payload() { userId, input }: CreateUlasanPayload) {
    return this.ulasanService.create(userId, input);
  }
}
