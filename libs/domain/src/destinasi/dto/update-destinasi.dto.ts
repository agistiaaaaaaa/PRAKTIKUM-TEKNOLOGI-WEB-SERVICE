import { PartialType } from '@nestjs/swagger';
import { CreateDestinasiDto } from './create-destinasi.dto';

// PartialType membuat seluruh field opsional -- cocok untuk PATCH
export class UpdateDestinasiDto extends PartialType(CreateDestinasiDto) {}
