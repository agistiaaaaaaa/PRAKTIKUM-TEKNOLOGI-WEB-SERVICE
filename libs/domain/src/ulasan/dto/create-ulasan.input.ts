import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';

@InputType()
export class CreateUlasanInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  destinasiId: number;

  @Field(() => Int, { description: 'Nilai 1 sampai 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  komentar: string;
}
