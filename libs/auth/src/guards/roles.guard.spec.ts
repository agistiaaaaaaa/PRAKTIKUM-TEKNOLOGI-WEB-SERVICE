import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthUser } from '../jwt-payload';
import { Role } from '../role.enum';
import { RolesGuard } from './roles.guard';

function httpContext(user?: AuthUser): ExecutionContext {
  return {
    getType: () => 'http',
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  const requireRoles = (roles: Role[] | undefined) =>
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(roles);

  afterEach(() => jest.restoreAllMocks());

  it('mengizinkan handler tanpa @Roles', () => {
    requireRoles(undefined);
    expect(guard.canActivate(httpContext())).toBe(true);
  });

  it('mengizinkan user dengan role yang sesuai', () => {
    requireRoles([Role.Admin]);
    expect(guard.canActivate(httpContext({ userId: 1, role: Role.Admin }))).toBe(true);
  });

  it('menolak wisatawan pada endpoint admin dengan 403', () => {
    requireRoles([Role.Admin]);
    expect(() => guard.canActivate(httpContext({ userId: 2, role: Role.Wisatawan }))).toThrow(
      ForbiddenException,
    );
  });

  it('menolak request tanpa user', () => {
    requireRoles([Role.Wisatawan]);
    expect(() => guard.canActivate(httpContext())).toThrow(ForbiddenException);
  });
});
