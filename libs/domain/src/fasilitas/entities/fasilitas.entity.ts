import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType()
export class Fasilitas {
  @ApiProperty({ example: 1 })
  @Field(() => Int)
  id: number;

  @ApiProperty({ example: 1 })
  @Field(() => Int)
  destinasiId: number;

  @ApiProperty({ example: 'Area parkir' })
  @Field()
  namaFasilitas: string;
}
