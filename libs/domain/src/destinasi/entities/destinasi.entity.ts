import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Fasilitas } from '../../fasilitas/entities/fasilitas.entity';
import { Ulasan } from '../../ulasan/entities/ulasan.entity';
import { DestinasiRecord } from '../destinasi.record';

/** Representasi destinasi di REST v1 dan GraphQL. */
@ObjectType()
export class Destinasi {
  @ApiProperty({ example: 1 })
  @Field(() => Int)
  id: number;

  @ApiProperty({ example: 'Pantai Kuta Mandalika' })
  @Field()
  nama: string;

  @ApiProperty({ example: 'Pantai' })
  @Field()
  kategori: string;

  @ApiProperty({ example: 'Kuta, Lombok Tengah', nullable: true, type: String })
  @Field(() => String, { nullable: true })
  lokasi: string | null;

  @ApiProperty({
    example: 'Pantai berpasir putih di kawasan Mandalika.',
    nullable: true,
    type: String,
  })
  @Field(() => String, { nullable: true })
  deskripsi: string | null;

  @ApiProperty({ example: 15000 })
  @Field(() => Float)
  hargaTiket: number;

  @ApiProperty({ example: 4.5 })
  @Field(() => Float)
  ratingRata: number;

  @ApiProperty({ example: '2026-09-29T10:00:00.000Z' })
  createdAt: Date;

  // Dua field berikut hanya ada di GraphQL dan diisi oleh @ResolveField
  @Field(() => [Ulasan], { nullable: true })
  ulasan?: Ulasan[];

  @Field(() => [Fasilitas], { nullable: true })
  fasilitas?: Fasilitas[];
}

export function toDestinasiV1(record: DestinasiRecord): Destinasi {
  const { id, nama, kategori, lokasi, deskripsi, hargaTiket, ratingRata, createdAt } = record;
  return { id, nama, kategori, lokasi, deskripsi, hargaTiket, ratingRata, createdAt };
}
