import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

/** JwtAuthGuard versi GraphQL: request diambil dari context GraphQL, bukan dari HTTP handler. */
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext): Request {
    return GqlExecutionContext.create(context).getContext<{ req: Request }>().req;
  }
}
