import { ArgumentsHost, Catch, HttpException, Logger, RpcExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcErrorPayload } from './rpc-error';

/**
 * Filter bawaan microservice mengubah semua exception non-RpcException menjadi
 * "Internal server error". Akibatnya NotFoundException dari service domain akan
 * sampai ke client sebagai 500. Filter ini meneruskan status dan pesan aslinya
 * agar gateway bisa membalas dengan status HTTP yang sama.
 */
@Catch()
export class HttpToRpcExceptionFilter implements RpcExceptionFilter<unknown> {
  private readonly logger = new Logger(HttpToRpcExceptionFilter.name);

  catch(exception: unknown, _host: ArgumentsHost): Observable<never> {
    if (exception instanceof HttpException) {
      return throwError(() => toPayload(exception));
    }

    this.logger.error(exception);
    const payload: RpcErrorPayload = {
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
    return throwError(() => payload);
  }
}

function toPayload(exception: HttpException): RpcErrorPayload {
  const response = exception.getResponse();
  if (typeof response === 'string') {
    return { statusCode: exception.getStatus(), message: response };
  }
  return {
    statusCode: exception.getStatus(),
    ...(response as Omit<RpcErrorPayload, 'statusCode'>),
  };
}
