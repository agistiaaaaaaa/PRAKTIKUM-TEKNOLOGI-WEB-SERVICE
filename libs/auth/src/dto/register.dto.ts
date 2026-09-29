import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Siti' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nama: string;

  @ApiProperty({ example: 'siti@example.com' })
  @IsEmail()
  @MaxLength(150)
  email: string;

  @ApiProperty({ example: 'rahasia123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72) // batas input bcrypt
  password: string;
}
