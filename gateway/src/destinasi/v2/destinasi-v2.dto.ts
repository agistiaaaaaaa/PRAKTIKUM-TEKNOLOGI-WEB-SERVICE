import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { CreateDestinasiDto, DestinasiInput } from '@wisataku/domain';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class CreateDestinasiV2Dto extends OmitType(CreateDestinasiDto, ['hargaTiket'] as const) {
  @ApiProperty({ example: 15000, minimum: 0 })
  @IsNumber()
  @Min(0)
  hargaDewasa: number;

  @ApiPropertyOptional({ example: 10000, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hargaAnak?: number;
}

export class UpdateDestinasiV2Dto extends PartialType(CreateDestinasiV2Dto) {}

/** Menerjemahkan field v2 ke bentuk domain (kolom database tetap hargaTiket). */
export function fromDestinasiV2Dto(dto: UpdateDestinasiV2Dto): Partial<DestinasiInput> {
  const { hargaDewasa, ...rest } = dto;
  return hargaDewasa === undefined ? rest : { ...rest, hargaTiket: hargaDewasa };
}
