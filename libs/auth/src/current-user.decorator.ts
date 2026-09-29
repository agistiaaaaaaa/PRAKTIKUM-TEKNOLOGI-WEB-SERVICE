import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getRequestUser } from './request-user';

/** Menyuntikkan user yang sedang login (hasil JwtStrategy.validate) ke parameter handler. */
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) =>
  getRequestUser(context),
);
