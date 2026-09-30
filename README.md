# WisataKu API

## Overview

WisataKu adalah backend API untuk studi kasus aplikasi wisata pada *Modul Praktikum Teknologi Web Service — NestJS, Prisma & MariaDB*. Wisatawan dapat mencari destinasi, membaca dan menulis ulasan, serta memesan tiket kunjungan. Admin mengelola data destinasi.

Proyek dikembangkan bertahap mengikuti modul. Tahap pertama adalah aplikasi monolitik modular (`wisataku-api`, Bab 1–5). Tahap berikutnya memecah domain Destinasi dan Reservasi menjadi microservice di belakang API Gateway (`gateway`, `service-destinasi`, `service-reservasi`, Bab 6–8). Kedua tahap ada di repository ini dan memakai logika domain yang sama dari `libs/`.

## Features

- REST API untuk destinasi, ulasan, fasilitas, reservasi, dan autentikasi
- GraphQL API (code-first, Apollo) dengan query bertingkat dan mutation
- Prisma ORM dengan migrasi bertahap dan data seed
- MariaDB sebagai basis data
- Autentikasi JWT (Passport) dengan password ber-hash bcrypt
- Otorisasi berbasis peran (`admin`, `wisatawan`)
- Unit test (Jest) dan e2e test (Supertest)
- Skrip load test k6
- Microservices dengan transport TCP
- API Gateway dengan agregasi respons
- Konfigurasi Docker dan Docker Compose
- URI versioning (`/v1`, `/v2`)
- Dokumentasi OpenAPI / Swagger

## Architecture

Bentuk akhir sistem:

```
Client (aplikasi mobile / web admin)
        │  HTTP :3000
        ▼
API Gateway (NestJS)          — JWT & RBAC, routing, versioning, agregasi, Swagger, GraphQL
        │  TCP (jaringan internal)
        ├──────────────────────────────┐
        ▼                              ▼
service-destinasi :5001        service-reservasi :5002
(Destinasi, Kategori,          (Reservasi)
 Ulasan, Fasilitas)
        │                              │
        └──────────────┬───────────────┘
                       ▼
                MariaDB (wisataku_db)
```

- Client hanya mengenal gateway. Port 5001 dan 5002 tidak dipublikasikan di Docker Compose.
- Gateway juga membaca tabel `User` untuk register/login, karena autentikasi dilakukan di gateway (sesuai diagram Bab 8.2).
- Kedua microservice memakai satu database `wisataku_db`, mengikuti `docker-compose.yml` pada modul.
- Ulasan tetap berada di `service-destinasi`, sesuai catatan Bab 8.2.

`wisataku-api` adalah tahap awal: satu proses NestJS yang memuat seluruh fitur Bab 2–5 dan langsung mengakses MariaDB. Aplikasi ini tetap dipertahankan sebagai luaran Tugas 3–4 dan dapat dijalankan sendiri.

## Technology Stack

| Technology | Purpose |
|---|---|
| TypeScript 5, Node.js 22 | Bahasa dan runtime |
| NestJS 11 | Framework backend (module, controller, provider, DI) |
| Prisma 6 | ORM, migrasi skema, seed |
| MariaDB | Basis data relasional |
| @nestjs/swagger | Dokumen OpenAPI dan Swagger UI |
| @nestjs/graphql + Apollo Server 5 | Endpoint GraphQL code-first |
| @nestjs/jwt, Passport (passport-jwt), bcrypt | Autentikasi JWT dan hashing password |
| class-validator, class-transformer | Validasi DTO |
| @nestjs/microservices | Komunikasi TCP gateway ↔ microservice |
| @nestjs/config | Konfigurasi melalui environment variable |
| Jest, Supertest | Unit test dan e2e test |
| k6 | Load test |
| Docker, Docker Compose | Containerization |

## Project Structure

Monorepo Nest CLI (`nest-cli.json`, `monorepo: true`) dengan satu `package.json`.

```
wisataku/
├── wisataku-api/          # Aplikasi monolitik (Tugas 3–4)
│   └── src/               #   destinasi, ulasan, fasilitas, reservasi, main.ts, schema.gql
├── gateway/               # API Gateway HTTP (Tugas 5–6)
│   ├── Dockerfile
│   └── src/               #   clients/ (ClientProxy), destinasi/ (v1, v2, resolver), reservasi/
├── service-destinasi/     # Microservice TCP 5001
│   ├── Dockerfile
│   └── src/destinasi/     #   @MessagePattern destinasi, ulasan, fasilitas
├── service-reservasi/     # Microservice TCP 5002
│   ├── Dockerfile
│   └── src/reservasi/
├── libs/
│   ├── common/            # PrismaModule, konfigurasi HTTP/Swagger/GraphQL, pattern & error RPC
│   ├── auth/              # AuthModule, JwtStrategy, guard, @Roles
│   └── domain/            # Service domain, DTO, entity (dipakai monolit & microservice)
├── prisma/                # schema.prisma, migrations/, seed.ts
├── test/                  # e2e test + jest-e2e.json
├── scripts/               # export-openapi.ts, build-pdf.mjs (npm run docs:pdf)
├── docs/                  # laporan Tugas 1–6, OpenAPI, hasil pengujian
├── load-test.js           # k6
├── docker-compose.yml
├── .env.example
└── CHANGELOG.md
```

## Requirements

- Node.js 20 atau lebih baru (dikembangkan dengan Node.js 24.15, image Docker memakai Node.js 22) dan npm
- MariaDB (dikembangkan dengan MariaDB 12.1 lokal) atau Docker untuk menjalankan MariaDB
- NestJS CLI tidak perlu dipasang global; `@nestjs/cli` sudah ada di devDependencies dan dipakai lewat `npm run`
- k6, hanya untuk load test
- Docker Desktop (atau Docker Engine + Compose v2), hanya untuk menjalankan stack container

## Environment Setup

```bash
npm install
cp .env.example .env
```

Isi `.env`. Variabel yang dibaca aplikasi:

| Variabel | Dipakai oleh | Keterangan |
|---|---|---|
| `DATABASE_URL` | semua aplikasi, Prisma | `mysql://USER:PASSWORD@HOST:PORT/wisataku_db` |
| `JWT_SECRET` | wisataku-api, gateway | Wajib. String acak panjang |
| `JWT_EXPIRES_IN` | wisataku-api, gateway | Masa berlaku token dalam detik (default 3600) |
| `API_PORT` | wisataku-api | Default 3000 |
| `GATEWAY_PORT` | gateway | Default 3000 |
| `SERVICE_DESTINASI_HOST`, `SERVICE_DESTINASI_PORT` | gateway, service-destinasi | Default `localhost:5001` |
| `SERVICE_RESERVASI_HOST`, `SERVICE_RESERVASI_PORT` | gateway, service-reservasi | Default `localhost:5002` |
| `RPC_TIMEOUT_MS` | gateway | Batas tunggu balasan microservice (default 5000) |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | seed | Akun admin yang dibuat oleh `npm run db:seed` |
| `MARIADB_*` | docker-compose.yml | Kredensial container MariaDB |

Aplikasi berhenti saat start dengan pesan jelas bila `DATABASE_URL` atau `JWT_SECRET` belum diisi. File `.env` tercantum di `.gitignore`.

## Database Setup

1. Siapkan database MariaDB `wisataku_db` dan user yang memiliki hak membuat database (Prisma `migrate dev` memerlukan shadow database).
2. Arahkan `DATABASE_URL` ke database tersebut.
3. Jalankan:

```bash
npm run prisma:generate   # generate Prisma Client
npm run prisma:deploy     # terapkan migrasi yang ada (prisma migrate deploy)
npm run db:seed           # kategori, 5 destinasi contoh, akun admin
```

`npm run prisma:migrate` (`prisma migrate dev`) hanya diperlukan saat mengubah `schema.prisma`.

Migrasi dibuat bertahap mengikuti modul:

| Migrasi | Bab | Isi |
|---|---|---|
| `20260929172407_init` | 3 | Kategori, Destinasi, Ulasan, Fasilitas |
| `20260929172429_add_user` | 5 | User, relasi Ulasan → User |
| `20260929172446_add_reservasi` | 6 | Reservasi |
| `20260929172502_add_harga_anak` | 7 | Kolom `hargaAnak` untuk API v2 |

Registrasi publik selalu membuat role `wisatawan`. Akun admin dibuat oleh seed dari `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD`. Seed aman dijalankan berulang.

## Running Locally

Monolit (tahap Bab 3–5):

```bash
npm run start:api            # mode watch
# atau
npm run build:api && npm run start:prod:api
```

Gateway dan microservice (tahap Bab 6–8), masing-masing di terminal terpisah:

```bash
npm run start:destinasi      # TCP 5001
npm run start:reservasi      # TCP 5002
npm run start:gateway        # HTTP 3000
```

Monolit dan gateway sama-sama memakai port 3000 secara default, jadi jalankan salah satu saja, atau ubah `API_PORT`/`GATEWAY_PORT`.

`npm run build` mem-build keempat aplikasi ke `dist/<nama-aplikasi>/main.js`.

## REST API

Endpoint yang tersedia di gateway (monolit memiliki endpoint yang sama tanpa `/v1`, `/v2`, dan `/lengkap`):

| Method | Endpoint | Akses | Status utama |
|---|---|---|---|
| POST | `/auth/register` | Publik | 201, 400, 409 |
| POST | `/auth/login` | Publik | 200, 400, 401 |
| GET | `/destinasi?kategori=&page=&limit=` | Publik | 200, 400 |
| GET | `/destinasi/:id` | Publik | 200, 400, 404 |
| GET | `/destinasi/:id/ulasan` | Publik | 200, 404 |
| GET | `/destinasi/:id/fasilitas` | Publik | 200, 404 |
| GET | `/destinasi/:id/lengkap` | Publik (gateway) | 200, 404 |
| POST | `/destinasi` | Admin | 201, 400, 401, 403 |
| PATCH | `/destinasi/:id` | Admin | 200, 400, 401, 403, 404 |
| DELETE | `/destinasi/:id` | Admin | 200, 401, 403, 404, 409 |
| POST | `/reservasi` | Wisatawan | 201, 400, 401, 403, 404 |
| GET, POST, PATCH, DELETE | `/v1/destinasi...` | sama dengan tanpa prefix | |
| GET, POST, PATCH, DELETE | `/v2/destinasi`, `/v2/destinasi/:id` | sama, struktur harga v2 | |

Di gateway, setiap endpoint dapat membalas 503 bila microservice tidak dapat dihubungi. `DELETE` membalas 409 bila destinasi sudah memiliki reservasi. Format error mengikuti bawaan NestJS: `{ statusCode, message, error }`.

Contoh:

```bash
curl http://localhost:3000/destinasi?kategori=Pantai
curl http://localhost:3000/destinasi/1/lengkap
```

## GraphQL

Endpoint: `POST /graphql`. `GET /graphql` di browser membuka Apollo Sandbox (landing page lokal). Skema dibuat code-first dan disimpan di `wisataku-api/src/schema.gql` (gateway memiliki skema identik di `gateway/src/schema.gql`).

```graphql
query DetailDestinasi {
  destinasi(id: 1) {
    nama
    kategori
    ratingRata
    ulasan { rating komentar tanggal }   # 3 ulasan terbaru
    fasilitas { namaFasilitas }
  }
}

query CariPantai {
  cariDestinasi(kategori: "Pantai") { id nama hargaTiket }
}

# Memerlukan header Authorization: Bearer <token wisatawan>
mutation TambahUlasan {
  tambahUlasan(input: { destinasiId: 1, rating: 5, komentar: "Pantainya bersih" }) {
    id
    rating
  }
}
```

`ulasan` dan `fasilitas` diisi oleh `@ResolveField` sehingga hanya di-query bila diminta client. `tambahUlasan` memperbarui `ratingRata` destinasi dalam satu transaksi.

## Authentication

1. `POST /auth/register` dengan `{ nama, email, password }` (password minimal 8 karakter). Password disimpan sebagai hash bcrypt (cost 10), tidak pernah dalam bentuk asli.
2. `POST /auth/login` dengan `{ email, password }` membalas `{ access_token, token_type: "Bearer" }` dengan status 200.
3. Kirim header `Authorization: Bearer <access_token>` ke endpoint yang dilindungi.

Payload JWT berisi `sub` (id user) dan `role`, ditandatangani HS256 dengan `JWT_SECRET`. Token kedaluwarsa setelah `JWT_EXPIRES_IN` detik. Login dengan email yang tidak terdaftar dan password yang salah menghasilkan pesan yang sama.

## Authorization

| Role | Cara mendapatkan | Hak akses |
|---|---|---|
| `wisatawan` | `POST /auth/register` | `POST /reservasi`, mutation `tambahUlasan` |
| `admin` | `npm run db:seed` | `POST`, `PATCH`, `DELETE` `/destinasi` (juga `/v1`, `/v2`) |

Endpoint dilindungi dengan `@UseGuards(JwtAuthGuard, RolesGuard)` dan `@Roles(...)`. Mutation GraphQL memakai `GqlAuthGuard`. Tanpa token, token tidak valid, atau token kedaluwarsa → 401. Token valid dengan role yang salah → 403.

## Swagger

| URL | Isi |
|---|---|
| `http://localhost:3000/api/docs` | Swagger UI |
| `http://localhost:3000/api/docs-json` | Dokumen OpenAPI JSON |
| `http://localhost:3000/api/docs-yaml` | Dokumen OpenAPI YAML |

Ketiga URL terverifikasi membalas 200 pada monolit dan gateway yang dijalankan lokal. Dokumen juga dapat diekspor tanpa menjalankan server:

```bash
npm run openapi:export
# docs/tugas-2/openapi.{json,yaml}          (monolit)
# docs/tugas-5/openapi-gateway.{json,yaml}  (gateway)
```

## Testing

```bash
npm run typecheck   # tsc --noEmit, termasuk file test
npm run test        # unit test, tidak memerlukan database
npm run test:e2e    # e2e test, memerlukan MariaDB dari DATABASE_URL
k6 run load-test.js # load test, memerlukan k6 dan API yang berjalan
```

| Jenis | Cakupan | Status |
|---|---|---|
| Unit (8 suite, 32 test) | AuthService (hash, email duplikat, login, password salah, isi JWT), JwtStrategy, RolesGuard, DestinasiService, ReservasiService, filter error RPC, klien RPC gateway, mapper v1/v2 | Terverifikasi |
| E2E monolit (`test/destinasi.e2e-spec.ts`) | Auth, GET/filter/400/404, 401 tanpa token/token invalid/token kedaluwarsa, 403 wisatawan, CRUD admin, reservasi, 409, GraphQL | Terverifikasi |
| E2E alur Bab 8.4 (`test/wisataku-flow.e2e-spec.ts`) | Register → login → cari → reservasi → 403, v1 vs v2, `/lengkap`, error dari microservice, GraphQL lewat gateway | Terverifikasi |
| Smoke test manual | Monolit 32 cek, gateway 37 cek, lewat HTTP ke server yang berjalan | Terverifikasi |
| Load test k6 (`load-test.js`) | `GET /destinasi`, 50 VU, 30 detik | Belum dijalankan, k6 belum terpasang |

E2E gateway menjalankan kedua microservice di dalam proses test pada port 15001/15002 dan berkomunikasi melalui TCP sungguhan. Data uji dibuat dengan prefix email `e2e-` dan dihapus setelah test selesai. Output asli test tersimpan di `docs/tugas-4/test-results/`.

## Microservices

| Aplikasi | Transport | Message pattern |
|---|---|---|
| `service-destinasi` | TCP 5001 | `destinasi.findAll`, `destinasi.findOne`, `destinasi.create`, `destinasi.update`, `destinasi.remove`, `ulasan.findByDestinasi`, `ulasan.create`, `fasilitas.findByDestinasi` |
| `service-reservasi` | TCP 5002 | `reservasi.create` |

Nama pattern didefinisikan sekali di `libs/common/src/rpc/patterns.ts`. Gateway memanggil microservice melalui `ClientProxy.send` dengan batas waktu `RPC_TIMEOUT_MS`. `HttpToRpcExceptionFilter` di sisi microservice meneruskan status asli exception (misalnya 404), lalu gateway mengubahnya kembali menjadi HTTP exception dengan status yang sama. Timeout atau koneksi gagal menjadi 503.

`GET /destinasi/:id/lengkap` memanggil `destinasi.findOne`, `ulasan.findByDestinasi`, dan `fasilitas.findByDestinasi` secara paralel lalu menggabungkannya menjadi satu respons.

## Docker

- `gateway/Dockerfile`, `service-destinasi/Dockerfile`, `service-reservasi/Dockerfile`: multi-stage (`node:22-alpine`), build context root repository karena `libs/` dipakai bersama.
- `docker-compose.yml`: `mariadb` (healthcheck) → `migrate` (sekali jalan: `prisma migrate deploy` + seed) → `service-destinasi`, `service-reservasi` → `gateway`. Hanya gateway yang dipublikasikan ke host.
- Nilai rahasia dibaca dari `.env`; Compose berhenti dengan pesan bila `JWT_SECRET`, `MARIADB_PASSWORD`, `MARIADB_ROOT_PASSWORD`, atau `SEED_ADMIN_PASSWORD` kosong.

```bash
docker compose up --build -d
docker compose ps
curl http://localhost:3000/destinasi
```

Docker configuration has been prepared and validated syntactically. Runtime verification requires Docker Desktop, which is not installed on the development machine yet.

## API Versioning

Gateway memakai URI versioning (`VersioningType.URI`).

| Versi | Endpoint | Struktur harga |
|---|---|---|
| v1 | `/v1/destinasi`, `/v1/destinasi/:id` (+ `/ulasan`, `/fasilitas`, `/lengkap`) | `hargaTiket` |
| v2 | `/v2/destinasi`, `/v2/destinasi/:id` | `hargaDewasa`, `hargaAnak` |
| tanpa prefix | `/destinasi...` | Sama dengan v1, untuk client yang dibuat sebelum versioning |

Contoh `GET /v2/destinasi/1`:

```json
{ "id": 1, "nama": "Pantai Kuta Mandalika", "kategori": "Pantai", "hargaDewasa": 15000, "hargaAnak": 10000, "ratingRata": 4.5, "...": "..." }
```

Kolom database tetap `hargaTiket`; v2 memetakannya menjadi `hargaDewasa` dan menambahkan kolom `hargaAnak` (migrasi `add_harga_anak`). Kebijakan deprecation v1 dicatat di `CHANGELOG.md`.

## Troubleshooting

**Jest crash "Zone Allocation failed - process out of memory".** Di mesin 16 CPU, Jest membuat ~15 worker ts-jest yang masing-masing melakukan type-check penuh. Solusi yang diterapkan: `tsconfig.spec.json` dengan `isolatedModules: true` (Jest hanya men-transpile) dan `maxWorkers: "50%"`. Pemeriksaan tipe tetap dilakukan oleh `npm run typecheck`.

**E2E gateway membalas 503.** `ConfigModule.forRoot` membaca dan memvalidasi environment saat `AppModule` di-import, sebelum kode di badan file test berjalan, sehingga override port test tidak terbaca. Override dipindahkan ke `test/gateway-test-env.ts` yang di-import paling awal.

**MariaDB setelah komputer mati mendadak.** MariaDB lokal perlu dijalankan ulang secara manual. Saat start, InnoDB melakukan crash recovery otomatis ("Crash table recovery finished"). Setelah itu jalankan `npx prisma migrate status` untuk memastikan skema masih "up to date" sebelum melanjutkan.

**`EADDRINUSE :::3000`.** Monolit dan gateway memakai port default yang sama. Hentikan salah satu atau ubah `API_PORT`/`GATEWAY_PORT`.

**Nama tabel huruf kecil pada migrasi.** Dua migrasi berisi `ALTER TABLE \`ulasan\`` dan `\`destinasi\`` karena dibuat di MariaDB Windows yang tidak membedakan huruf besar/kecil. Container MariaDB di `docker-compose.yml` dijalankan dengan `--lower-case-table-names=1` agar migrasi yang sama berjalan di Linux. Migrasi yang sudah diterapkan tidak diubah.

## Laporan PDF

Laporan Tugas 1–6 ditulis dalam Markdown di `docs/tugas-*/` lalu dibuat menjadi PDF dengan Chrome/Edge headless:

```bash
npm run docs:pdf
```

Sampul mengikuti format laporan praktikum STMIK Lombok (logo di `docs/assets/`). Nama dan NIM pada sampul dibaca dari `docs/identitas.json`.

## Verification

Hasil pemeriksaan terakhir di mesin pengembangan (Windows 11, Node.js 24.15, MariaDB 12.1):

| Check | Result |
|---|---|
| Build (4 aplikasi) | PASS |
| TypeScript typecheck | PASS |
| Unit Tests | PASS 32/32 |
| E2E Tests | PASS 41/41 |
| Prisma (validate, migrate status) | PASS |
| API Smoke Test | PASS (monolit 32/32, gateway 37/37) |
| Swagger UI & GraphQL landing page | PASS (HTTP 200) |
| Docker Runtime | BLOCKED - Docker not installed |
| k6 | BLOCKED - k6 not installed |
| Cloud deployment | NOT STARTED |

Rincian per tugas: `docs/final-audit.md`.
