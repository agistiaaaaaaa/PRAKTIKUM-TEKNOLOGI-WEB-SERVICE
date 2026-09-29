import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getRequestUser } from '../request-user';
import { ROLES_KEY } from '../roles.decorator';
import { Role } from '../role.enum';

/**
 * Dipasang setelah JwtAuthGuard/GqlAuthGuard. Tidak login -> 401 dari guard JWT;
 * login tetapi role tidak sesuai -> 403 dari guard ini.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) {
      return true;
    }

    const user = getRequestUser(context);
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Anda tidak berwenang mengakses resource ini');
    }
    return true;
  }
}
