import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType()
export class Ulasan {
  @ApiProperty({ example: 1 })
  @Field(() => Int)
  id: number;

  @ApiProperty({ example: 1 })
  @Field(() => Int)
  destinasiId: number;

  @ApiProperty({ example: 2 })
  @Field(() => Int)
  userId: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @Field(() => Int)
  rating: number;

  @ApiProperty({ example: 'Pemandangan luar biasa!' })
  @Field()
  komentar: string;

  @ApiProperty({ example: '2026-09-29T10:00:00.000Z' })
  @Field()
  tanggal: Date;
}
