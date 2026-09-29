import { ApiProperty } from '@nestjs/swagger';
import { Reservasi as ReservasiRow } from '@prisma/client';

export class Reservasi {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 2 })
  userId: number;

  @ApiProperty({ example: 1 })
  destinasiId: number;

  @ApiProperty({ example: '2026-12-25', format: 'date' })
  tanggalKunjungan: string;

  @ApiProperty({ example: 2 })
  jumlahTiket: number;

  @ApiProperty({ example: 'dipesan' })
  status: string;

  @ApiProperty({ example: 30000, description: 'hargaTiket x jumlahTiket, dihitung server' })
  totalHarga: number;

  @ApiProperty({ example: '2026-09-29T10:00:00.000Z' })
  createdAt: Date;
}

export function toReservasi(row: ReservasiRow): Reservasi {
  return { ...row, tanggalKunjungan: row.tanggalKunjungan.toISOString().slice(0, 10) };
}
