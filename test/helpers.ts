import { INestApplication } from '@nestjs/common';
import { PrismaService } from '@wisataku/common';
import * as bcrypt from 'bcrypt';
import request from 'supertest';

export const PASSWORD = 'rahasia123';

/** Prefix email unik per file test agar data uji bisa dibersihkan tanpa menyentuh data lain. */
export function emailPrefix(name: string): string {
  return `e2e-${name}-${Date.now()}-`;
}

export async function createUser(
  prisma: PrismaService,
  email: string,
  role: 'admin' | 'wisatawan',
): Promise<void> {
  const passwordHash = await bcrypt.hash(PASSWORD, 4);
  await prisma.user.create({ data: { nama: `E2E ${role}`, email, passwordHash, role } });
}

export async function login(app: INestApplication, email: string): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password: PASSWORD })
    .expect(200);
  return res.body.access_token;
}

/** Menghapus user uji (ulasan & reservasi ikut terhapus lewat cascade) lalu destinasi uji. */
export async function cleanup(
  prisma: PrismaService,
  prefix: string,
  destinasiIds: number[],
): Promise<void> {
  await prisma.user.deleteMany({ where: { email: { startsWith: prefix } } });
  if (destinasiIds.length) {
    await prisma.destinasi.deleteMany({ where: { id: { in: destinasiIds } } });
  }
}

export function futureDate(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}
