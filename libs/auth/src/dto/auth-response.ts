import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponse {
  @ApiProperty({ example: 5 })
  id: number;

  @ApiProperty({ example: 'Siti' })
  nama: string;

  @ApiProperty({ example: 'siti@example.com' })
  email: string;

  @ApiProperty({ example: 'wisatawan' })
  role: string;
}

export class LoginResponse {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ example: 'Bearer' })
  token_type: 'Bearer';
}
