import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NEVER, of, throwError } from 'rxjs';
import { sendRpc, toHttpException } from './rpc';

describe('rpc client helper', () => {
  beforeAll(() => jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined));
  afterAll(() => jest.restoreAllMocks());

  const proxyReturning = (observable: unknown) =>
    ({ send: jest.fn(() => observable) }) as unknown as ClientProxy;

  it('toHttpException mempertahankan status dari microservice', () => {
    const error = toHttpException({
      statusCode: 404,
      message: 'tidak ditemukan',
      error: 'Not Found',
    });

    expect(error.getStatus()).toBe(404);
    expect(error.getResponse()).toEqual({
      statusCode: 404,
      message: 'tidak ditemukan',
      error: 'Not Found',
    });
  });

  it('toHttpException mengubah error koneksi menjadi 503', () => {
    expect(toHttpException(new Error('connect ECONNREFUSED'))).toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('sendRpc mengembalikan balasan pertama', async () => {
    await expect(
      sendRpc(proxyReturning(of({ id: 1 })), 'destinasi.findOne', 1, 100),
    ).resolves.toEqual({ id: 1 });
  });

  it('sendRpc melempar 404 jika microservice membalas error 404', async () => {
    const proxy = proxyReturning(throwError(() => ({ statusCode: 404, message: 'x' })));

    await expect(sendRpc(proxy, 'destinasi.findOne', 9, 100)).rejects.toMatchObject({
      status: 404,
    });
  });

  it('sendRpc melempar 503 jika microservice tidak membalas sampai timeout', async () => {
    await expect(
      sendRpc(proxyReturning(NEVER), 'destinasi.findAll', {}, 20),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
