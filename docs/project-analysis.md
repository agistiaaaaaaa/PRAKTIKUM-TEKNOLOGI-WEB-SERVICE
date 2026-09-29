# Analisis Proyek WisataKu

Dokumen ini merangkum isi *Modul Praktikum Teknologi Web Service — NestJS, Prisma & MariaDB* (STMIK Lombok, 2026, 44 halaman) dan menerjemahkannya menjadi rencana kerja untuk Tugas 1–6. Seluruh keputusan teknis di repository ini merujuk ke dokumen ini.

## 1. Ringkasan Modul

Modul terdiri atas 8 bab. Bab 1–7 membangun satu backend WisataKu secara bertahap, Bab 8 menyatukannya menjadi proyek akhir.

| Bab | Materi | Yang dibangun | Tugas |
|---|---|---|---|
| 1 | Web service, API, HTTP, REST/GraphQL/SOAP/gRPC, client-server, stateless, layered, monolitik vs microservices | Proyek NestJS awal, `DestinasiController` sederhana | Tugas 1 |
| 2 | Konvensi URI, method & status code, DTO, `class-validator`, `@nestjs/swagger` | DTO Destinasi, Swagger UI di `/api/docs`, ekspor `openapi.json` | Tugas 2 |
| 3 | Prisma + MariaDB, `PrismaService`, CRUD, `NotFoundException`, `ParseIntPipe` | CRUD Destinasi dengan database | Tugas 3 (REST) |
| 4 | GraphQL code-first, `@ObjectType`, resolver, `@ResolveField`, mutation | Query `destinasi`, `cariDestinasi`, mutation `tambahUlasan` | Tugas 3 (GraphQL) |
| 5 | JWT (Passport), bcrypt, RBAC (Guard + decorator), Jest, Supertest, k6 | `AuthModule`, `RolesGuard`, unit/e2e test, `load-test.js` | Tugas 4 |
| 6 | `@nestjs/microservices`, TCP, `@MessagePattern`, `ClientProxy`, API composition | `service-destinasi`, `service-reservasi`, `gateway` | Tugas 5 (microservices) |
| 7 | Dockerfile multi-stage, Docker Compose, `@nestjs/config`, URI versioning, siklus hidup API | Dockerfile, `docker-compose.yml`, `/v1` & `/v2`, changelog | Tugas 5 (deployment) |
| 8 | Integrasi, Definition of Done, skenario e2e, README, panduan presentasi | Sistem utuh + dokumentasi + presentasi | Tugas 6 |

Entitas bisnis dari modul (hal. 4–5): **Destinasi**, **Kategori**, **User**, **Ulasan**, **Reservasi**, **Fasilitas**.

## 2. Requirement Matrix

Kolom "Eksplisit" berasal langsung dari teks modul. Kolom "Implisit" adalah kebutuhan yang tidak ditulis tetapi harus ada agar requirement eksplisit dapat dipenuhi atau diuji.

### Tugas 1 — Analisis Arsitektur Web Service (Bab 1)

| Eksplisit | Implisit |
|---|---|
| Menjelaskan web service, API, HTTP (method, URL, header, body, status code) | Analisis dikaitkan ke kebutuhan WisataKu, bukan definisi umum |
| Membandingkan REST, GraphQL, SOAP, gRPC | Alasan pemilihan REST + GraphQL untuk WisataKu |
| Prinsip client-server, stateless, layered system | Kaitan stateless dengan JWT (Bab 5) |
| Monolitik vs microservices, pemilihan arsitektur | Jawaban latihan 1.4 langkah 6: alasan monolitik modular di tahap awal |
| Diagram akses aplikasi mobile & web admin ke backend | Batas domain (bounded context) Destinasi & Reservasi |
| Luaran: laporan PDF + diagram draw.io | Diagram dapat diedit (`.drawio`) dan diekspor (`.png`) |

### Tugas 2 — Desain Endpoint & Dokumentasi API (Bab 2)

| Eksplisit | Implisit |
|---|---|
| URI kata benda jamak, huruf kecil, hierarki relasi | Konsistensi penamaan antara REST, GraphQL, dan gateway |
| Method HTTP & status code semantik | Tabel status code per endpoint (200/201/400/401/403/404/409) |
| DTO + `class-validator`, `ValidationPipe({ whitelist, transform })` | Format error response yang seragam |
| `@nestjs/swagger`, Swagger UI `/api/docs`, `addBearerAuth` | Dokumentasi sesuai implementasi, bukan rancangan terpisah |
| Ekspor `openapi.json` | Juga YAML (luaran menyebut "YAML/JSON") |
| Luaran: file OpenAPI + screenshot Swagger UI | Screenshot diambil dari server yang benar-benar berjalan |

### Tugas 3 — Implementasi RESTful & GraphQL API (Bab 3–4)

| Eksplisit | Implisit |
|---|---|
| Prisma provider `mysql` ke MariaDB, migrasi | Data contoh (seed) agar API dapat didemokan |
| `PrismaService` + `PrismaModule` global | — |
| CRUD Destinasi, filter kategori, `NotFoundException`, `ParseIntPipe` | 404 untuk update/delete id yang tidak ada |
| GraphQL code-first: `destinasi(id)`, `cariDestinasi(kategori)`, `tambahUlasan(input)` | GraphQL membaca database, bukan data dummy |
| `@ResolveField` untuk `ulasan` (3 terbaru) & `fasilitas` | `ratingRata` diperbarui saat ulasan ditambah |
| Membandingkan jumlah request REST vs GraphQL (latihan 4.4 langkah 6) | Endpoint REST pembanding: `/destinasi/:id/ulasan` (rancangan Bab 2) dan `/destinasi/:id/fasilitas` |
| Luaran: source code GitHub + screenshot Postman/Apollo Sandbox | — |

### Tugas 4 — Keamanan dan Pengujian API (Bab 5)

| Eksplisit | Implisit |
|---|---|
| `POST /auth/register`, `POST /auth/login`, bcrypt | Login mengembalikan **200** (modul Bab 8 mengharapkan 200, default NestJS untuk POST adalah 201) |
| Payload JWT `{ sub, role }`, `JwtStrategy`, `JwtAuthGuard` | Secret JWT dari environment, bukan hard-code |
| `@Roles()` + `RolesGuard`, role `wisatawan` & `admin` | Cara membuat akun admin (register selalu membuat `wisatawan`) |
| POST/PATCH/DELETE `/destinasi` khusus admin | 401 tanpa token/token invalid/kedaluwarsa, 403 untuk role salah |
| Guard pada mutation GraphQL `tambahUlasan` (lampiran) | Guard versi GraphQL (`GqlExecutionContext`) |
| Unit test `AuthService` dengan mock Prisma, e2e Supertest, k6 | Database uji untuk e2e; hasil k6 asli, bukan angka karangan |
| Luaran: source code keamanan + laporan pengujian PDF | — |

### Tugas 5 — Integrasi & Deployment (Bab 6–7)

| Eksplisit | Implisit |
|---|---|
| `service-destinasi` (TCP 5001) dengan `destinasi.findAll`, `destinasi.findOne` | Pola untuk create/update/delete agar CRUD admin tetap berjalan lewat gateway |
| `service-reservasi` (TCP 5002) | Pola `reservasi.create` |
| Gateway HTTP + `ClientProxy`, client tidak tahu port 5001 | Port microservice tidak dipublikasikan di Docker Compose |
| Agregasi `GET /destinasi/:id/lengkap` | Error dari microservice diteruskan dengan status code yang benar (bukan selalu 500) |
| Dockerfile multi-stage per layanan, `docker-compose.yml` dengan MariaDB | Migrasi & seed database saat stack pertama kali naik |
| `@nestjs/config`, konfigurasi dipindah ke env | `.env.example`, tidak ada secret asli di repo |
| URI versioning `/v1` & `/v2` (`hargaTiket` → `hargaDewasa`/`hargaAnak`) | Kolom `hargaAnak` di database; `/destinasi` tanpa prefix tetap berjalan untuk client lama |
| Laporan evaluasi: `npm audit`, load test terbaru, potensi breaking change | CHANGELOG dengan kebijakan deprecation |
| Deploy ke VPS, URL layanan aktif | Butuh akses server — **ACTION REQUIRED** bila tidak tersedia |

### Tugas 6 — Proyek Akhir Terintegrasi (Bab 8)

| Eksplisit | Implisit |
|---|---|
| Definition of Done 8.3 (8 butir) | Setiap butir punya bukti yang dapat diperiksa |
| Skenario e2e 8.4: register → login → cari → reservasi → 403 | Tanggal kunjungan di contoh modul (`2025-12-25`) sudah lewat; test memakai tanggal masa depan |
| README (8.5) | README sesuai perintah yang benar-benar berjalan |
| Presentasi (8.6), luaran 8.7: GitHub, URL deploy, PDF teknis, slide, video YouTube | URL deploy, video, dan repo GitHub dibuat oleh mahasiswa — **ACTION REQUIRED** |

## 3. Dependency Map

```
Bab 1 ──► Tugas 1   (analisis + arsitektur)
  │
Bab 2 ──► Tugas 2   (desain endpoint, DTO, Swagger)
  │         │  DTO & kontrak endpoint dipakai ulang
Bab 3 ─┬► Tugas 3   (REST CRUD + Prisma)
Bab 4 ─┘    │  DestinasiService, entity GraphQL dipakai ulang
  │         ▼
Bab 5 ──► Tugas 4   (AuthModule, RBAC, test)
  │         │  AuthModule dipakai gateway; service domain dipakai microservice
Bab 6 ─┬► Tugas 5   (microservices + gateway)
Bab 7 ─┘    │  Dockerfile, compose, config, versioning
  │         ▼
Bab 8 ──► Tugas 6   (integrasi, e2e alur bisnis, dokumentasi, presentasi)
```

Poin penting dari modul: pada Bab 6 langkah 2, `DestinasiService` dari Bab 3 dipindahkan ke microservice dan "tetap sama persis — hanya lapisan Controller yang berubah". Repository ini memanfaatkan hal itu secara langsung: logika domain ditulis sekali di `libs/domain` dan dipakai oleh aplikasi monolitik maupun microservice.

## 4. Arsitektur Target

### 4.1 Struktur repository

Satu repository, satu `package.json`, memakai *monorepo mode* bawaan Nest CLI (`nest-cli.json` dengan beberapa `projects`). Alasannya: modul membangun satu proyek yang berevolusi, dan dengan monorepo kode Bab 3–5 dipakai ulang oleh Bab 6–7 tanpa disalin.

```
wisataku/
├── wisataku-api/        # Tahap 1: monolitik modular (Bab 1–5, Tugas 3–4)
├── gateway/             # Tahap 2: API Gateway HTTP (Bab 6–8)
├── service-destinasi/   # Tahap 2: microservice TCP 5001
├── service-reservasi/   # Tahap 2: microservice TCP 5002
├── libs/
│   ├── common/          # PrismaModule, nama message pattern, filter error RPC
│   ├── auth/            # AuthModule: register/login, JWT, guard, @Roles
│   └── domain/          # Service domain + DTO + entity (REST & GraphQL)
├── prisma/              # schema.prisma, migrasi, seed
├── test/                # e2e test (Supertest)
├── docs/                # laporan per tugas
├── load-test.js         # k6
└── docker-compose.yml
```

Aplikasi `wisataku-api` dipertahankan (tidak dihapus) karena merupakan luaran Tugas 3–4 dan dapat dijalankan sendiri hanya dengan MariaDB. Aplikasi `gateway` + dua microservice adalah bentuk akhir sistem (Tugas 5–6).

### 4.2 Pembagian tanggung jawab

| Komponen | Tanggung jawab | Akses data |
|---|---|---|
| `gateway` | HTTP publik, Swagger, GraphQL, JWT & RBAC, versioning, agregasi | Tabel `User` (autentikasi) |
| `service-destinasi` | Destinasi, Kategori, Ulasan, Fasilitas | Prisma → MariaDB |
| `service-reservasi` | Reservasi | Prisma → MariaDB (membaca harga destinasi) |
| `wisataku-api` | Seluruh fitur Bab 2–5 dalam satu proses | Prisma → MariaDB |

Catatan keputusan:

1. **Autentikasi di gateway.** Diagram Bab 8.2 menempatkan "Autentikasi JWT" di gateway, tetapi `docker-compose.yml` modul tidak memberi gateway `DATABASE_URL`, padahal register/login memerlukan tabel `User`. Gateway di repository ini diberi `DATABASE_URL` dan hanya mengakses tabel `User`. Alternatif (service-auth terpisah) tidak diminta modul.
2. **Satu database bersama.** Compose modul memakai satu database `wisataku_db` untuk kedua service. Diikuti apa adanya. `service-reservasi` hanya membaca harga destinasi untuk menghitung `totalHarga`. Pemisahan database per service dicatat sebagai pengembangan lanjut.
3. **Ulasan tetap di `service-destinasi`**, sesuai catatan Bab 8.2 ("service-ulasan dapat dipisahkan lebih lanjut ... atau tetap berada di dalam service-destinasi").

### 4.3 Model data (Prisma)

```
Kategori 1──* Destinasi 1──* Ulasan *──1 User
                  │  1                      │ 1
                  ├──* Fasilitas            │
                  └──* Reservasi *──────────┘
```

| Model | Field |
|---|---|
| Kategori | id, namaKategori (unik) |
| Destinasi | id, nama, kategoriId, lokasi?, deskripsi?, hargaTiket, hargaAnak? (Bab 7), ratingRata, createdAt |
| Ulasan | id, destinasiId, userId, rating (1–5), komentar, tanggal |
| Fasilitas | id, destinasiId, namaFasilitas |
| User | id, nama, email (unik), passwordHash, role (`wisatawan`/`admin`), createdAt |
| Reservasi | id, userId, destinasiId, tanggalKunjungan, jumlahTiket, status, totalHarga, createdAt |

Modul Bab 3 menyimpan `kategori` sebagai string di tabel Destinasi, sedangkan tabel entitas (hal. 4) memiliki model `Kategori`. Repository ini memakai model `Kategori` dan tetap menerima/mengembalikan `kategori` sebagai string (`"Pantai"`) sehingga kontrak API sama dengan contoh modul.

Migrasi dibuat bertahap mengikuti modul: `init` (Bab 3), `add_user` (Bab 5), `add_harga_anak` (Bab 7).

## 5. Endpoint

| Method | Endpoint | Otorisasi | Aplikasi |
|---|---|---|---|
| POST | `/auth/register` | Publik | api, gateway |
| POST | `/auth/login` | Publik | api, gateway |
| GET | `/destinasi?kategori=&page=&limit=` | Publik | api, gateway (v1) |
| GET | `/destinasi/:id` | Publik | api, gateway (v1) |
| GET | `/destinasi/:id/ulasan` | Publik | api, gateway |
| GET | `/destinasi/:id/fasilitas` | Publik | api, gateway |
| POST | `/destinasi` | Admin | api, gateway |
| PATCH | `/destinasi/:id` | Admin | api, gateway |
| DELETE | `/destinasi/:id` | Admin | api, gateway |
| GET | `/destinasi/:id/lengkap` | Publik | gateway |
| POST | `/reservasi` | Wisatawan | api, gateway |
| POST | `/graphql` — `destinasi`, `cariDestinasi` | Publik | api, gateway |
| POST | `/graphql` — `tambahUlasan` | Wisatawan | api, gateway |
| GET | `/v1/destinasi`, `/v1/destinasi/:id` | Publik | gateway |
| GET | `/v2/destinasi`, `/v2/destinasi/:id` | Publik | gateway |

Di gateway, route destinasi tanpa prefix (`/destinasi`) adalah alias dari v1 agar client lama dan skenario e2e Bab 8 tetap berjalan.

## 6. Alur

**Autentikasi.** `POST /auth/register` → bcrypt hash (cost 10) → simpan `User` role `wisatawan`. `POST /auth/login` → cari user → `bcrypt.compare` → `jwt.sign({ sub, role })` → `{ access_token, token_type }`.

**Otorisasi.** Request → `JwtAuthGuard` (verifikasi tanda tangan & `exp`, gagal = 401) → `RolesGuard` membaca metadata `@Roles()` (tidak cocok = 403) → handler.

**REST (monolitik).** Controller → `ValidationPipe`/`ParseIntPipe` → Service domain → Prisma → MariaDB.

**GraphQL.** `POST /graphql` → resolver `destinasi(id)` → `@ResolveField` `ulasan` (3 terbaru) dan `fasilitas` hanya bila diminta client.

**Microservices.** Client → Gateway (HTTP 3000) → `ClientProxy.send('destinasi.findOne', id)` → TCP → `service-destinasi` `@MessagePattern` → Service domain → MariaDB. Error `NotFoundException` di service diubah menjadi payload RPC `{ statusCode: 404, ... }` lalu dikembalikan gateway sebagai HTTP 404.

**Agregasi.** `GET /destinasi/:id/lengkap` → gateway memanggil `destinasi.findOne`, `ulasan.findByDestinasi`, `fasilitas.findByDestinasi` secara paralel (`Promise.all`) → satu respons.

**Docker.** `mariadb` (healthcheck) → `migrate` (sekali jalan: `prisma migrate deploy` + seed) → `service-destinasi`, `service-reservasi` → `gateway` (satu-satunya port yang dipublikasikan).

**Deployment.** VPS dengan Docker → `git clone` → isi `.env` → `docker compose up --build -d` → uji dari luar jaringan.

## 7. Strategi Pengujian

| Jenis | Alat | Cakupan | Butuh database |
|---|---|---|---|
| Unit | Jest | `AuthService`, `RolesGuard`, `DestinasiService`, `ReservasiService`, pemetaan error RPC, mapper v2 | Tidak (mock) |
| E2E monolitik | Jest + Supertest | 200/400/401/403/404, token invalid & kedaluwarsa, GraphQL | Ya |
| E2E terintegrasi | Jest + Supertest | Alur Bab 8.4 lewat gateway + microservice TCP sungguhan, v1 vs v2, agregasi | Ya |
| Beban | k6 | `GET /destinasi` 50 VU 30 detik (sesuai modul) | Ya |

## 8. Dokumen yang Dihasilkan

Lihat `docs/deliverables-checklist.md` untuk daftar lengkap per tugas.

## 9. Definition of Done (Bab 8.3)

1. Seluruh endpoint REST berjalan sesuai dokumentasi OpenAPI.
2. GraphQL mengembalikan data gabungan Destinasi + Ulasan + Fasilitas.
3. JWT + RBAC diterapkan pada seluruh endpoint sensitif.
4. `npm run test` dan `npm run test:e2e` lulus.
5. Microservices dan API Gateway berfungsi.
6. Seluruh layanan berjalan dengan satu perintah `docker compose up`.
7. Versioning diterapkan minimal pada satu resource.
8. README, OpenAPI, dan CHANGELOG lengkap dan mutakhir.

Status verifikasi tiap butir dicatat di `docs/final-audit.md`.
