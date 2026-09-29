import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryDestinasiDto {
  @ApiPropertyOptional({ example: 'Pantai', description: 'Filter berdasarkan nama kategori' })
  @IsOptional()
  @IsString()
  kategori?: string;

  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    description: 'Nomor halaman, dipakai bersama limit',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    minimum: 1,
    maximum: 100,
    description: 'Jumlah data per halaman. Tanpa limit, seluruh data dikembalikan.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
