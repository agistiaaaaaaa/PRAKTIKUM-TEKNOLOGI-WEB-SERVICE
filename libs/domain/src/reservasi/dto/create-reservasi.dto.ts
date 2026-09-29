import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, Matches, Max, Min } from 'class-validator';

export class CreateReservasiDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  destinasiId: number;

  @ApiProperty({
    example: '2026-12-25',
    description: 'Format YYYY-MM-DD, tidak boleh sebelum hari ini',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'tanggalKunjungan harus berformat YYYY-MM-DD' })
  @IsDateString({ strict: true })
  tanggalKunjungan: string;

  @ApiProperty({ example: 2, minimum: 1, maximum: 20 })
  @IsInt()
  @Min(1)
  @Max(20)
  jumlahTiket: number;
}
