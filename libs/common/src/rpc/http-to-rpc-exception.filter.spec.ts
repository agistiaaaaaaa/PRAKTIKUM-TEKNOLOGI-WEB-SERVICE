import { ArgumentsHost, BadRequestException, NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpToRpcExceptionFilter } from './http-to-rpc-exception.filter';

describe('HttpToRpcExceptionFilter', () => {
  const filter = new HttpToRpcExceptionFilter();
  const host = {} as ArgumentsHost;

  const errorOf = (exception: unknown) =>
    firstValueFrom(filter.catch(exception, host)).catch((error: unknown) => error);

  it('meneruskan status dan pesan NotFoundException', async () => {
    expect(await errorOf(new NotFoundException('Destinasi dengan id 9 tidak ditemukan'))).toEqual({
      statusCode: 404,
      message: 'Destinasi dengan id 9 tidak ditemukan',
      error: 'Not Found',
    });
  });

  it('meneruskan daftar pesan validasi', async () => {
    const error = await errorOf(new BadRequestException(['rating must not be greater than 5']));
    expect(error).toMatchObject({
      statusCode: 400,
      message: ['rating must not be greater than 5'],
    });
  });

  it('menyembunyikan detail error yang tidak dikenal sebagai 500', async () => {
    jest.spyOn(filter['logger'], 'error').mockImplementation(() => undefined);

    expect(await errorOf(new Error('koneksi database putus'))).toEqual({
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  });
});
