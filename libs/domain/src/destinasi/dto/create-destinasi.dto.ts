import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateDestinasiDto {
  @ApiProperty({ example: 'Pantai Kuta Mandalika', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nama: string;

  @ApiProperty({ example: 'Pantai', description: 'Nama kategori; dibuat otomatis jika belum ada' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  kategori: string;

  @ApiPropertyOptional({ example: 'Kuta, Lombok Tengah', maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  lokasi?: string;

  @ApiPropertyOptional({ example: 'Pantai berpasir putih di kawasan Mandalika.' })
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiProperty({ example: 15000, minimum: 0 })
  @IsNumber()
  @Min(0)
  hargaTiket: number;
}
