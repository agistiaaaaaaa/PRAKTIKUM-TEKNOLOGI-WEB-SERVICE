import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Destinasi, Fasilitas, Ulasan } from '@wisataku/domain';

/** Respons GET /destinasi/:id/lengkap: gabungan tiga pesan ke service-destinasi. */
export class DestinasiLengkap extends OmitType(Destinasi, ['ulasan', 'fasilitas'] as const) {
  @ApiProperty({ type: [Ulasan], description: 'Maksimal 3 ulasan terbaru' })
  ulasanTerbaru: Ulasan[];

  @ApiProperty({ type: [Fasilitas] })
  fasilitas: Fasilitas[];
}
