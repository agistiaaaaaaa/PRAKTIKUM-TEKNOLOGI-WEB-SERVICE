# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/). Belum ada rilis bertag; seluruh perubahan masih di bagian *Unreleased*.

## Unreleased

### Added

- REST API resource destinasi: daftar dengan filter kategori dan pagination, detail, create, update, delete, serta sub-resource `ulasan` dan `fasilitas`.
- Endpoint `POST /reservasi` dengan perhitungan `totalHarga` di server dan penolakan tanggal kunjungan yang sudah lewat.
- GraphQL API code-first: query `destinasi(id)`, `cariDestinasi(kategori)`, mutation `tambahUlasan(input)`, field bertingkat `ulasan` dan `fasilitas`.
- Skema Prisma untuk Kategori, Destinasi, Ulasan, Fasilitas, User, Reservasi dengan empat migrasi bertahap dan seed data contoh.
- Autentikasi JWT (`POST /auth/register`, `POST /auth/login`) dengan hash password bcrypt.
- Otorisasi berbasis peran (`admin`, `wisatawan`) untuk REST dan GraphQL.
- Unit test (32) dan e2e test (41), termasuk skenario alur wisatawan Bab 8.4 melalui gateway.
- Skrip load test k6 (`load-test.js`).
- Microservice `service-destinasi` (TCP 5001) dan `service-reservasi` (TCP 5002).
- API Gateway dengan penerusan error microservice sesuai status aslinya dan endpoint agregasi `GET /destinasi/:id/lengkap`.
- Dockerfile multi-stage untuk gateway dan kedua microservice, `docker-compose.yml`, `.dockerignore`.
- URI versioning di gateway: `/v1/destinasi` (`hargaTiket`) dan `/v2/destinasi` (`hargaDewasa`, `hargaAnak`); kolom `hargaAnak` di database.
- Dokumentasi OpenAPI (Swagger UI di `/api/docs`) dan skrip `npm run openapi:export`.

### Deprecated

- `/v1/destinasi` dan `/destinasi` tanpa prefix versi (struktur `hargaTiket`). Client baru sebaiknya memakai `/v2/destinasi`. Keduanya tetap berjalan; tanggal penghapusan belum ditetapkan dan akan diumumkan di changelog ini minimal satu semester sebelumnya, setelah API ter-deploy dan consumer v1 diketahui.

### Fixed

- Worker Jest kehabisan memori pada mesin dengan banyak CPU (transpile-only melalui `tsconfig.spec.json`, `maxWorkers: 50%`).
- Override port microservice pada e2e gateway tidak terbaca karena `ConfigModule` sudah memvalidasi environment saat modul di-import.

### Security

- `npm audit` mencatat 5 kerentanan (3 high, 2 moderate) pada dependency tidak langsung: `deepmerge-ts` melalui Prisma CLI/`@prisma/config`, dan `js-yaml` melalui `@nestjs/swagger`. Perbaikan otomatis memerlukan perubahan versi yang *breaking*, sehingga belum diterapkan. Detail di `docs/tugas-5/evaluasi/`.

### Pending Verification

- Eksekusi load test k6.
- Menjalankan stack dengan `docker compose up`.
- Deployment ke server cloud.
