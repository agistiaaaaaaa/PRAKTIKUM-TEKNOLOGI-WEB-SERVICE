import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DESTINASI_PATTERNS } from '@wisataku/common';
import {
  DestinasiInput,
  DestinasiService,
  QueryDestinasiDto,
  UpdateDestinasiPayload,
} from '@wisataku/domain';

/** Sama seperti controller REST Bab 3, tetapi menerima pesan TCP dari gateway. */
@Controller()
export class DestinasiController {
  constructor(private readonly destinasiService: DestinasiService) {}

  @MessagePattern(DESTINASI_PATTERNS.findAll)
  findAll(@Payload() query: QueryDestinasiDto) {
    return this.destinasiService.findAll(query);
  }

  @MessagePattern(DESTINASI_PATTERNS.findOne)
  findOne(@Payload() id: number) {
    return this.destinasiService.findOne(id);
  }

  @MessagePattern(DESTINASI_PATTERNS.create)
  create(@Payload() input: DestinasiInput) {
    return this.destinasiService.create(input);
  }

  @MessagePattern(DESTINASI_PATTERNS.update)
  update(@Payload() { id, data }: UpdateDestinasiPayload) {
    return this.destinasiService.update(id, data);
  }

  @MessagePattern(DESTINASI_PATTERNS.remove)
  remove(@Payload() id: number) {
    return this.destinasiService.remove(id);
  }
}
