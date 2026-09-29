import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { configureHttpApp, PrismaService } from '@wisataku/common';
import request from 'supertest';
import { API_INFO } from '../wisataku-api/src/api-info';
import { AppModule } from '../wisataku-api/src/app.module';
import { cleanup, createUser, emailPrefix, futureDate, login, PASSWORD } from './helpers';

// Aplikasi monolitik (Tugas 3-4) terhadap MariaDB dari DATABASE_URL di .env.
describe('WisataKu API monolitik (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let wisatawanToken: string;
  const prefix = emailPrefix('api');
  const createdIds: number[] = [];

  const http = () => request(app.getHttpServer());
  const destinasiBaru = { nama: 'Bukit Merese', kategori: 'Pantai', hargaTiket: 10000 };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    configureHttpApp(app, API_INFO);
    await app.init();

    prisma = app.get(PrismaService);
    await createUser(prisma, `${prefix}admin@example.com`, 'admin');
    await createUser(prisma, `${prefix}wisatawan@example.com`, 'wisatawan');
    adminToken = await login(app, `${prefix}admin@example.com`);
    wisatawanToken = await login(app, `${prefix}wisatawan@example.com`);
  });

  afterAll(async () => {
    await cleanup(prisma, prefix, createdIds);
    await app.close();
  });

  describe('Auth', () => {
    const email = `${prefix}baru@example.com`;

    it('POST /auth/register membuat akun wisatawan (201) tanpa mengembalikan password', async () => {
      const res = await http()
        .post('/auth/register')
        .send({ nama: 'Siti', email, password: PASSWORD })
        .expect(201);
      expect(res.body).toMatchObject({ email, role: 'wisatawan' });
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('POST /auth/register dengan email yang sama ditolak (409)', () =>
      http().post('/auth/register').send({ nama: 'Siti', email, password: PASSWORD }).expect(409));

    it('POST /auth/register dengan data tidak valid ditolak (400)', () =>
      http()
        .post('/auth/register')
        .send({ nama: '', email: 'bukan-email', password: '123' })
        .expect(400));

    it('POST /auth/login mengembalikan token (200)', async () => {
      const res = await http().post('/auth/login').send({ email, password: PASSWORD }).expect(200);
      expect(res.body.token_type).toBe('Bearer');
      expect(typeof res.body.access_token).toBe('string');
    });

    it('POST /auth/login dengan password salah ditolak (401)', () =>
      http().post('/auth/login').send({ email, password: 'salah12345' }).expect(401));
  });

  describe('GET /destinasi', () => {
    it('mengembalikan status 200 dan array', async () => {
      const res = await http().get('/destinasi').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('memfilter berdasarkan kategori', async () => {
      const res = await http().get('/destinasi?kategori=Pantai').expect(200);
      expect(res.body.every((d: { kategori: string }) => d.kategori === 'Pantai')).toBe(true);
    });

    it('menolak query limit yang tidak valid (400)', () =>
      http().get('/destinasi?limit=0').expect(400));

    it('GET /destinasi/abc ditolak ParseIntPipe (400)', () =>
      http().get('/destinasi/abc').expect(400));

    it('GET /destinasi/999999 mengembalikan 404', async () => {
      const res = await http().get('/destinasi/999999').expect(404);
      expect(res.body.message).toBe('Destinasi dengan id 999999 tidak ditemukan');
    });
  });

  describe('Otorisasi endpoint admin', () => {
    it('POST /destinasi tanpa token ditolak (401)', () =>
      http().post('/destinasi').send(destinasiBaru).expect(401));

    it('POST /destinasi dengan token tidak valid ditolak (401)', () =>
      http()
        .post('/destinasi')
        .set('Authorization', 'Bearer token.palsu.sekali')
        .send(destinasiBaru)
        .expect(401));

    it('POST /destinasi dengan token kedaluwarsa ditolak (401)', async () => {
      const expired = app.get(JwtService).sign({ sub: 1, role: 'admin' }, { expiresIn: -10 });
      await http()
        .post('/destinasi')
        .set('Authorization', `Bearer ${expired}`)
        .send(destinasiBaru)
        .expect(401);
    });

    it('POST /destinasi oleh wisatawan ditolak (403)', () =>
      http()
        .post('/destinasi')
        .set('Authorization', `Bearer ${wisatawanToken}`)
        .send(destinasiBaru)
        .expect(403));

    it('POST /destinasi oleh admin dengan body tidak valid ditolak (400)', () =>
      http()
        .post('/destinasi')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nama: 'Tanpa harga' })
        .expect(400));
  });

  describe('CRUD destinasi oleh admin', () => {
    let id: number;

    it('POST /destinasi membuat destinasi (201)', async () => {
      const res = await http()
        .post('/destinasi')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(destinasiBaru)
        .expect(201);
      id = res.body.id;
      createdIds.push(id);
      expect(res.body).toMatchObject(destinasiBaru);
    });

    it('PATCH /destinasi/:id mengubah sebagian data (200)', async () => {
      const res = await http()
        .patch(`/destinasi/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ hargaTiket: 12000 })
        .expect(200);
      expect(res.body.hargaTiket).toBe(12000);
      expect(res.body.nama).toBe(destinasiBaru.nama);
    });

    it('PATCH /destinasi/:id oleh wisatawan ditolak (403)', () =>
      http()
        .patch(`/destinasi/${id}`)
        .set('Authorization', `Bearer ${wisatawanToken}`)
        .send({ hargaTiket: 1 })
        .expect(403));

    it('PATCH /destinasi/999999 mengembalikan 404', () =>
      http()
        .patch('/destinasi/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ hargaTiket: 1 })
        .expect(404));

    it('DELETE /destinasi/:id oleh wisatawan ditolak (403)', () =>
      http()
        .delete(`/destinasi/${id}`)
        .set('Authorization', `Bearer ${wisatawanToken}`)
        .expect(403));

    it('DELETE /destinasi/:id oleh admin berhasil (200) lalu data hilang (404)', async () => {
      await http()
        .delete(`/destinasi/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      await http().get(`/destinasi/${id}`).expect(404);
    });

    it('DELETE /destinasi/999999 mengembalikan 404', () =>
      http().delete('/destinasi/999999').set('Authorization', `Bearer ${adminToken}`).expect(404));
  });

  describe('Reservasi', () => {
    let destinasiId: number;

    beforeAll(async () => {
      const res = await http()
        .post('/destinasi')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...destinasiBaru, nama: 'Destinasi Reservasi E2E' });
      destinasiId = res.body.id;
      createdIds.push(destinasiId);
    });

    it('wisatawan membuat reservasi (201) dengan totalHarga dari server', async () => {
      const res = await http()
        .post('/reservasi')
        .set('Authorization', `Bearer ${wisatawanToken}`)
        .send({ destinasiId, tanggalKunjungan: futureDate(30), jumlahTiket: 2 })
        .expect(201);
      expect(res.body.totalHarga).toBe(20000);
    });

    it('tanggal kunjungan yang sudah lewat ditolak (400)', () =>
      http()
        .post('/reservasi')
        .set('Authorization', `Bearer ${wisatawanToken}`)
        .send({ destinasiId, tanggalKunjungan: '2020-01-01', jumlahTiket: 1 })
        .expect(400));

    it('destinasi yang sudah punya reservasi tidak bisa dihapus (409)', () =>
      http()
        .delete(`/destinasi/${destinasiId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(409));
  });

  describe('GraphQL', () => {
    let destinasiId: number;
    const tambahUlasan = `mutation ($input: CreateUlasanInput!) {
      tambahUlasan(input: $input) { id rating komentar }
    }`;

    beforeAll(async () => {
      const res = await http()
        .post('/destinasi')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...destinasiBaru, nama: 'Destinasi GraphQL E2E' });
      destinasiId = res.body.id;
      createdIds.push(destinasiId);
    });

    it('tambahUlasan tanpa token ditolak (UNAUTHENTICATED)', async () => {
      const res = await http()
        .post('/graphql')
        .send({
          query: tambahUlasan,
          variables: { input: { destinasiId, rating: 5, komentar: 'x' } },
        });
      expect(res.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
    });

    it('tambahUlasan oleh wisatawan menyimpan ulasan dan memperbarui ratingRata', async () => {
      for (const rating of [5, 4]) {
        const res = await http()
          .post('/graphql')
          .set('Authorization', `Bearer ${wisatawanToken}`)
          .send({
            query: tambahUlasan,
            variables: { input: { destinasiId, rating, komentar: `Rating ${rating}` } },
          })
          .expect(200);
        expect(res.body.errors).toBeUndefined();
      }

      const res = await http()
        .post('/graphql')
        .send({
          query: `query ($id: Int!) {
            destinasi(id: $id) { nama kategori ratingRata ulasan { rating komentar } fasilitas { namaFasilitas } }
          }`,
          variables: { id: destinasiId },
        })
        .expect(200);
      const { destinasi } = res.body.data;
      expect(destinasi.ratingRata).toBe(4.5);
      expect(destinasi.ulasan).toHaveLength(2);
      expect(destinasi.fasilitas).toEqual([]);
    });

    it('tambahUlasan dengan rating di luar 1-5 ditolak validasi', async () => {
      const res = await http()
        .post('/graphql')
        .set('Authorization', `Bearer ${wisatawanToken}`)
        .send({
          query: tambahUlasan,
          variables: { input: { destinasiId, rating: 9, komentar: 'x' } },
        });
      expect(res.body.errors[0].extensions.code).toBe('BAD_REQUEST');
    });

    it('destinasi(id) yang tidak ada menghasilkan error NOT_FOUND', async () => {
      const res = await http()
        .post('/graphql')
        .send({ query: '{ destinasi(id: 999999) { nama } }' });
      expect(res.body.errors[0].extensions.code).toBe('NOT_FOUND');
    });

    it('cariDestinasi(kategori) hanya mengembalikan kategori tersebut', async () => {
      const res = await http()
        .post('/graphql')
        .send({ query: '{ cariDestinasi(kategori: "Pantai") { kategori } }' });
      expect(res.body.data.cariDestinasi.length).toBeGreaterThan(0);
      expect(
        res.body.data.cariDestinasi.every((d: { kategori: string }) => d.kategori === 'Pantai'),
      ).toBe(true);
    });
  });
});
