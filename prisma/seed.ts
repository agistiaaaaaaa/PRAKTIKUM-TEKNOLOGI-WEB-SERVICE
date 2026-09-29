/**
 * Data contoh untuk demo dan pengujian manual.
 * Nama destinasi nyata di Lombok, tetapi harga tiket dan ulasan adalah data fiktif.
 *
 * Aman dijalankan berulang: kategori dan akun di-upsert, destinasi hanya dibuat
 * bila tabel masih kosong.
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

const KATEGORI = ['Pantai', 'Gunung', 'Budaya', 'Pulau', 'Kuliner'];

const DESTINASI = [
  {
    nama: 'Pantai Kuta Mandalika',
    kategori: 'Pantai',
    lokasi: 'Kuta, Lombok Tengah',
    deskripsi: 'Pantai berpasir putih di kawasan ekonomi khusus Mandalika.',
    hargaTiket: 15000,
    hargaAnak: 10000,
    fasilitas: ['Area parkir', 'Toilet umum', 'Warung makan'],
    ulasan: [
      { rating: 5, komentar: 'Pasirnya bersih dan ombaknya bagus untuk foto.' },
      { rating: 4, komentar: 'Ramai saat akhir pekan, datang pagi lebih nyaman.' },
    ],
  },
  {
    nama: 'Pantai Tanjung Aan',
    kategori: 'Pantai',
    lokasi: 'Sengkol, Lombok Tengah',
    deskripsi: 'Pantai dengan pasir berbutir besar, dekat Bukit Merese.',
    hargaTiket: 10000,
    hargaAnak: 5000,
    fasilitas: ['Area parkir', 'Penyewaan payung'],
    ulasan: [{ rating: 5, komentar: 'Sunset dari Bukit Merese sangat indah.' }],
  },
  {
    nama: 'Gili Trawangan',
    kategori: 'Pulau',
    lokasi: 'Gili Indah, Lombok Utara',
    deskripsi: 'Pulau kecil tanpa kendaraan bermotor, populer untuk snorkeling.',
    hargaTiket: 20000,
    hargaAnak: 10000,
    fasilitas: ['Penyewaan sepeda', 'Penyewaan alat snorkeling', 'Penginapan'],
    ulasan: [
      { rating: 5, komentar: 'Snorkeling bisa bertemu penyu.' },
      { rating: 4, komentar: 'Harga makanan agak mahal tapi sepadan.' },
      { rating: 4, komentar: 'Cocok untuk bersepeda keliling pulau.' },
    ],
  },
  {
    nama: 'Gunung Rinjani via Sembalun',
    kategori: 'Gunung',
    lokasi: 'Sembalun, Lombok Timur',
    deskripsi: 'Jalur pendakian menuju Danau Segara Anak dan puncak Rinjani.',
    hargaTiket: 50000,
    hargaAnak: null,
    fasilitas: ['Pos registrasi', 'Area berkemah'],
    ulasan: [{ rating: 5, komentar: 'Berat tetapi pemandangan dari Plawangan luar biasa.' }],
  },
  {
    nama: 'Desa Adat Sade',
    kategori: 'Budaya',
    lokasi: 'Rembitan, Lombok Tengah',
    deskripsi: 'Desa suku Sasak dengan rumah adat dan kerajinan tenun.',
    hargaTiket: 10000,
    hargaAnak: 5000,
    fasilitas: ['Pemandu lokal', 'Toko kain tenun'],
    ulasan: [],
  },
];

async function upsertUser(nama: string, email: string, password: string, role: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  // Password ikut diperbarui agar mengganti SEED_ADMIN_PASSWORD lalu seed ulang cukup untuk reset.
  return prisma.user.upsert({
    where: { email },
    update: { passwordHash, role },
    create: { nama, email, passwordHash, role },
  });
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@wisataku.id';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('SEED_ADMIN_PASSWORD belum diisi di .env');
  }

  for (const namaKategori of KATEGORI) {
    await prisma.kategori.upsert({ where: { namaKategori }, update: {}, create: { namaKategori } });
  }

  const admin = await upsertUser('Admin WisataKu', adminEmail, adminPassword, 'admin');
  // Akun penulis ulasan contoh; password acak karena tidak dipakai untuk login.
  const pengulas = await upsertUser(
    'Pengulas Contoh',
    'pengulas@wisataku.id',
    randomBytes(24).toString('hex'),
    'wisatawan',
  );

  if ((await prisma.destinasi.count()) === 0) {
    for (const d of DESTINASI) {
      const ratings = d.ulasan.map((u) => u.rating);
      const ratingRata = ratings.length
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : 0;

      await prisma.destinasi.create({
        data: {
          nama: d.nama,
          lokasi: d.lokasi,
          deskripsi: d.deskripsi,
          hargaTiket: d.hargaTiket,
          hargaAnak: d.hargaAnak,
          ratingRata,
          kategori: { connect: { namaKategori: d.kategori } },
          fasilitas: { create: d.fasilitas.map((namaFasilitas) => ({ namaFasilitas })) },
          ulasan: { create: d.ulasan.map((u) => ({ ...u, userId: pengulas.id })) },
        },
      });
    }
  }

  console.log(`Seed selesai. Admin: ${admin.email}. Destinasi: ${await prisma.destinasi.count()}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
