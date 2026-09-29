import { HttpException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { isRpcErrorPayload } from '@wisataku/common';
import { firstValueFrom, timeout } from 'rxjs';

const logger = new Logger('RpcClient');

/**
 * Mengirim pesan ke microservice dan menunggu balasan pertama.
 * Error dari microservice diubah kembali menjadi HttpException dengan status aslinya
 * (404, 400, 409, ...). Timeout atau koneksi gagal menjadi 503.
 */
export async function sendRpc<T>(
  client: ClientProxy,
  pattern: string,
  data: unknown,
  timeoutMs: number,
): Promise<T> {
  try {
    return await firstValueFrom(client.send<T>(pattern, data).pipe(timeout(timeoutMs)));
  } catch (error) {
    const httpError = toHttpException(error);
    if (httpError instanceof ServiceUnavailableException) {
      logger.warn(`Pesan "${pattern}" gagal: ${error instanceof Error ? error.message : error}`);
    }
    throw httpError;
  }
}

export function toHttpException(error: unknown): HttpException {
  if (isRpcErrorPayload(error)) {
    const { statusCode, message, error: errorName } = error;
    return new HttpException({ statusCode, message, error: errorName }, statusCode);
  }
  return new ServiceUnavailableException('Layanan internal sedang tidak dapat dihubungi');
}
