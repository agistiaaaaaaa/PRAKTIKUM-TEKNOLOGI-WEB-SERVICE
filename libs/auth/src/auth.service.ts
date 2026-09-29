import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@wisataku/common';
import * as bcrypt from 'bcrypt';
import { LoginResponse, RegisterResponse } from './dto/auth-response';
import { JwtPayload } from './jwt-payload';
import { Role } from './role.enum';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /** Registrasi publik selalu menghasilkan role wisatawan; akun admin dibuat lewat seed. */
  async register(nama: string, email: string, password: string): Promise<RegisterResponse> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { nama, email, passwordHash, role: Role.Wisatawan },
    });
    return { id: user.id, nama: user.nama, email: user.email, role: user.role };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Pesan sama untuk email tidak terdaftar dan password salah agar email tidak bisa ditebak.
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const payload: JwtPayload = { sub: user.id, role: user.role as Role };
    return { access_token: this.jwtService.sign(payload), token_type: 'Bearer' };
  }
}
