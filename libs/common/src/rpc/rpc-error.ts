/** Bentuk error yang dikirim microservice ke gateway melalui TCP. */
export interface RpcErrorPayload {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export function isRpcErrorPayload(value: unknown): value is RpcErrorPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as RpcErrorPayload).statusCode === 'number' &&
    'message' in value
  );
}
