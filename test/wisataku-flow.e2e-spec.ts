import { TEST_DESTINASI_PORT, TEST_RESERVASI_PORT } from './gateway-test-env';
import { INestApplication, INestMicroservice } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { HttpToRpcExceptionFilter, PrismaService } from '@wisataku/common';
import request from 'supertest';
import { AppModule as GatewayModule } from '../gateway/src/app.module';
import { setupGateway } from '../gateway/src/setup';
import { AppModule as DestinasiServiceModule } from '../service-destinasi/src/app.module';
import { AppModule as ReservasiServiceModule } from '../service-reservasi/src/app.module';
import { cleanup, createUser, emailPrefix, futureDate, login, PASSWORD } from './helpers';

async function startMicroservice(module: unknown, port: number): Promise<INestMicroservice> {
  const moduleRef = await Test.createTestingModule({ imports: [module as never] }).compile();
  const service = moduleRef.createNestMicroservice({
    transport: Transport.TCP,
    options: { host: '127.0.0.1', port },
    logger: false,
  });
  service.useGlobalFilters(new HttpToRpcExceptionFilter());
  await service.listen();
  return service;
}

/**
 * Skenario Bab 8.4: client -> API Gateway -> service-destinasi / service-reservasi (TCP) -> MariaDB.
 * Ketiga aplikasi dijalankan di proses test, komunikasi antar-layanan tetap melalui TCP sungguhan.
 */
describe('Alur Lengkap Wisatawan WisataKu lewat API Gateway (e2e)', () => {
  let gateway: INestApplication;
  let services: INestMicroservice[];
  let prisma: PrismaService;
  let token: string;
  let destinasiId: number;
  const prefix = emailPrefix('flow');
  const email = `${prefix}siti@example.com`;
  const createdIds: number[] = [];

  const http = () => request(gateway.getHttpServer());

  beforeAll(async () => {
    services = [
      await startMicroservice(DestinasiServiceModule, TEST_DESTINASI_PORT),
      await startMicroservice(ReservasiServiceModule, TEST_RESERVASI_PORT),
    ];

    const moduleRef = await Test.createTestingModule({ imports: [GatewayModule] }).compile();
    gateway = moduleRef.createNestApplication({ logger: false });
    setupGateway(gateway);
    await gateway.init();
    prisma = gateway.get(PrismaService);

    // Destinasi Pantai milik test agar langkah reservasi tidak bergantung pada data seed
    await createUser(prisma, `${prefix}admin@example.com`, 'admin');
    const adminToken = await login(gateway, `${prefix}admin@example.com`);
    const res = await http()
      .post('/v2/destinasi')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nama: 'Pantai Alur E2E', kategori: 'Pantai', hargaDewasa: 15000, hargaAnak: 7500 })
      .expect(201);
    createdIds.push(res.body.id);
  });

  afterAll(async () => {
    await cleanup(prisma, prefix, createdIds);
    await gateway.close();
    await Promise.all(services.map((service) => service.close()));
  });

  it('1. Registrasi wisatawan baru', async () => {
    const res = await http()
      .post('/auth/register')
      .send({ nama: 'Siti', email, password: PASSWORD });
    expect(res.status).toBe(201);
  });

  it('2. Login dan menerima token JWT', async () => {
    const res = await http().post('/auth/login').send({ email, password: PASSWORD });
    expect(res.status).toBe(200);
    token = res.body.access_token;
  });

  it('3. Mencari destinasi kategori Pantai', async () => {
    const res = await http().get('/destinasi?kategori=Pantai');
    expect(res.status).toBe(200);
    // Urutan terbaru lebih dulu, sehingga destinasi milik test berada di indeks 0
    destinasiId = res.body[0].id;
    expect(destinasiId).toBe(createdIds[0]);
  });

  it('4. Membuat reservasi dengan token yang valid', async () => {
    const res = await http()
      .post('/reservasi')
      .set('Authorization', `Bearer ${token}`)
      .send({ destinasiId, tanggalKunjungan: futureDate(30), jumlahTiket: 2 });
    expect(res.status).toBe(201);
    expect(res.body.totalHarga).toBe(30000);
  });

  it('5. Wisatawan ditolak menghapus destinasi (403)', async () => {
    const res = await http()
      .delete(`/destinasi/${destinasiId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  describe('Fitur gateway', () => {
    it('/v1 dan /v2 menyajikan struktur harga yang berbeda untuk data yang sama', async () => {
      const v1 = await http().get(`/v1/destinasi/${destinasiId}`).expect(200);
      const v2 = await http().get(`/v2/destinasi/${destinasiId}`).expect(200);

      expect(v1.body.hargaTiket).toBe(15000);
      expect(v1.body).not.toHaveProperty('hargaAnak');
      expect(v2.body).toMatchObject({ hargaDewasa: 15000, hargaAnak: 7500 });
      expect(v2.body).not.toHaveProperty('hargaTiket');
    });

    it('/destinasi tanpa prefix versi setara dengan v1', async () => {
      const res = await http().get(`/destinasi/${destinasiId}`).expect(200);
      expect(res.body.hargaTiket).toBe(15000);
    });

    it('GET /destinasi/:id/lengkap menggabungkan destinasi, ulasan, dan fasilitas', async () => {
      const res = await http().get(`/destinasi/${destinasiId}/lengkap`).expect(200);
      expect(res.body).toMatchObject({ id: destinasiId, ulasanTerbaru: [], fasilitas: [] });
    });

    it('404 dari service-destinasi diteruskan gateway sebagai HTTP 404', async () => {
      const res = await http().get('/destinasi/999999').expect(404);
      expect(res.body.message).toBe('Destinasi dengan id 999999 tidak ditemukan');
    });

    it('validasi reservasi dari service-reservasi diteruskan sebagai 400', () =>
      http()
        .post('/reservasi')
        .set('Authorization', `Bearer ${token}`)
        .send({ destinasiId, tanggalKunjungan: '2020-01-01', jumlahTiket: 1 })
        .expect(400));

    it('GraphQL di gateway mengambil data dari microservice', async () => {
      const ulasan = await http()
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: `mutation ($input: CreateUlasanInput!) { tambahUlasan(input: $input) { id tanggal } }`,
          variables: { input: { destinasiId, rating: 4, komentar: 'Bersih dan tertata' } },
        })
        .expect(200);
      expect(ulasan.body.errors).toBeUndefined();

      const res = await http()
        .post('/graphql')
        .send({
          query: `{ destinasi(id: ${destinasiId}) { nama ratingRata ulasan { rating komentar } } }`,
        })
        .expect(200);
      expect(res.body.data.destinasi).toEqual({
        nama: 'Pantai Alur E2E',
        ratingRata: 4,
        ulasan: [{ rating: 4, komentar: 'Bersih dan tertata' }],
      });
    });
  });
});
