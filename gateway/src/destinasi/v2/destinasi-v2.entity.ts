import { ApiProperty } from '@nestjs/swagger';
import { DestinasiRecord } from '@wisataku/domain';

/** Struktur v2: hargaTiket dipecah menjadi hargaDewasa dan hargaAnak. */
export class DestinasiV2 {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Pantai Kuta Mandalika' })
  nama: string;

  @ApiProperty({ example: 'Pantai' })
  kategori: string;

  @ApiProperty({ example: 'Kuta, Lombok Tengah', nullable: true, type: String })
  lokasi: string | null;

  @ApiProperty({
    example: 'Pantai berpasir putih di kawasan Mandalika.',
    nullable: true,
    type: String,
  })
  deskripsi: string | null;

  @ApiProperty({ example: 15000 })
  hargaDewasa: number;

  @ApiProperty({
    example: 10000,
    nullable: true,
    type: Number,
    description: 'null bila destinasi belum menetapkan harga khusus anak',
  })
  hargaAnak: number | null;

  @ApiProperty({ example: 4.5 })
  ratingRata: number;

  @ApiProperty({ example: '2026-09-29T10:00:00.000Z' })
  createdAt: Date;
}

export function toDestinasiV2(record: DestinasiRecord): DestinasiV2 {
  const { hargaTiket, hargaAnak, ...rest } = record;
  return { ...rest, hargaDewasa: hargaTiket, hargaAnak };
}
