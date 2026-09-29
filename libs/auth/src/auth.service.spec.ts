import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@wisataku/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { JwtPayload } from './jwt-payload';
import { Role } from './role.enum';

describe('AuthService', () => {
  let service: AuthService;
  const jwtService = new JwtService({ secret: 'unit-test-secret' });
  const prismaMock = {
    user: { findUnique: jest.fn(), create: jest.fn() },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('menyimpan hash bcrypt, bukan password asli, dengan role wisatawan', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockImplementation(({ data }) => Promise.resolve({ id: 7, ...data }));

      const result = await service.register('Siti', 'siti@example.com', 'rahasia123');

      const { data } = prismaMock.user.create.mock.calls[0][0];
      expect(data.passwordHash).not.toBe('rahasia123');
      expect(await bcrypt.compare('rahasia123', data.passwordHash)).toBe(true);
      expect(data.role).toBe(Role.Wisatawan);
      expect(result).toEqual({ id: 7, nama: 'Siti', email: 'siti@example.com', role: 'wisatawan' });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('menolak registrasi jika email sudah terdaftar', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: 'ada@example.com' });

      await expect(service.register('Budi', 'ada@example.com', 'rahasia123')).rejects.toThrow(
        ConflictException,
      );
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const storedUser = async (role: Role) => ({
      id: 3,
      email: 'siti@example.com',
      passwordHash: await bcrypt.hash('rahasia123', 4),
      role,
    });

    it('mengembalikan JWT berisi sub dan role jika kredensial benar', async () => {
      prismaMock.user.findUnique.mockResolvedValue(await storedUser(Role.Admin));

      const result = await service.login('siti@example.com', 'rahasia123');

      expect(result.token_type).toBe('Bearer');
      const payload = jwtService.verify<JwtPayload>(result.access_token);
      expect(payload.sub).toBe(3);
      expect(payload.role).toBe('admin');
    });

    it('menolak password yang salah', async () => {
      prismaMock.user.findUnique.mockResolvedValue(await storedUser(Role.Wisatawan));

      await expect(service.login('siti@example.com', 'salah12345')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('menolak email yang tidak terdaftar dengan pesan yang sama', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.login('tidakada@example.com', 'rahasia123')).rejects.toThrow(
        'Email atau password salah',
      );
    });
  });
});
