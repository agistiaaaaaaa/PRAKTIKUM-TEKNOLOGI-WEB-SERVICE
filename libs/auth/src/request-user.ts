import { ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { AuthUser } from './jwt-payload';

/** Mengambil request.user dari konteks HTTP maupun GraphQL. */
export function getRequestUser(context: ExecutionContext): AuthUser | undefined {
  const request =
    context.getType<GqlContextType>() === 'graphql'
      ? GqlExecutionContext.create(context).getContext<{ req: Request }>().req
      : context.switchToHttp().getRequest<Request>();
  return request.user as AuthUser | undefined;
}
