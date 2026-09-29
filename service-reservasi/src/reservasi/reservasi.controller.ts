import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RESERVASI_PATTERNS } from '@wisataku/common';
import { CreateReservasiPayload, ReservasiService } from '@wisataku/domain';

@Controller()
export class ReservasiController {
  constructor(private readonly reservasiService: ReservasiService) {}

  @MessagePattern(RESERVASI_PATTERNS.create)
  create(@Payload() { userId, dto }: CreateReservasiPayload) {
    return this.reservasiService.create(userId, dto);
  }
}
