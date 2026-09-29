import { Role } from './role.enum';

/** Isi token JWT. */
export interface JwtPayload {
  sub: number;
  role: Role;
}

/** Objek yang disimpan JwtStrategy ke request.user. */
export interface AuthUser {
  userId: number;
  role: Role;
}
