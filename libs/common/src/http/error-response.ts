import { ApiProperty } from '@nestjs/swagger';

/** Format error bawaan NestJS, didokumentasikan agar muncul di Swagger. */
export class ErrorResponse {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'Destinasi dengan id 999 tidak ditemukan',
  })
  message: string | string[];

  @ApiProperty({ example: 'Not Found' })
  error: string;
}
