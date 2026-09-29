import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'siti@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'rahasia123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
