# Final Audit Tugas 1–6

Audit terhadap *Modul Praktikum Teknologi Web Service — NestJS, Prisma & MariaDB* (rincian tugas hal. 6–7, luaran tiap bab, Definition of Done Bab 8.3, luaran akhir Bab 8.7). Tanggal audit: 30 September 2026.

Status:

- **PASS**: ada dan sudah dijalankan/diperiksa, dengan bukti yang dapat dibuka.
- **PENDING**: dapat dikerjakan, tetapi belum selesai.
- **BLOCKED**: tidak dapat dikerjakan karena alat atau akses belum tersedia.
- **NOT STARTED**: belum dikerjakan sama sekali.

## Tugas 1 — Analisis Arsitektur Web Service

Luaran modul: laporan PDF + diagram arsitektur (draw.io).

| Tugas | Requirement | Status | Evidence |
|---|---|---|---|
| 1 | Konsep web service, API, HTTP | PASS | `docs/tugas-1/laporan-tugas-1.md` bagian 2–3 |
| 1 | Perbandingan REST, GraphQL, SOAP, gRPC | PASS | laporan bagian 4 |
| 1 | Client-server, stateless, layered system | PASS | laporan bagian 5 |
| 1 | Monolitik vs microservices, alasan monolitik modular (latihan 1.4 langkah 6) | PASS | laporan bagian 6 |
| 1 | Diagram akses aplikasi mobile & web admin | PASS | `arsitektur-wisataku.drawio` (2 halaman), `arsitektur-wisataku.png`, `arsitektur-monolitik.png` |
| 1 | Laporan PDF | PASS | `docs/tugas-1/laporan-tugas-1.pdf` |
| 1 | Sampul format laporan praktikum STMIK Lombok | PASS | logo dari dokumen acuan (tidak diubah), tata letak sama untuk Tugas 1–6 |
| 1–4 | Identitas mahasiswa di sampul | PASS | Baiq Agestia Cahya Ilami, NIM TI21240005 (`docs/identitas.json`) |

## Tugas 2 — Desain Endpoint & Dokumentasi API

Luaran modul: file OpenAPI (YAML/JSON) + screenshot Swagger UI.

| Tugas | Requirement | Status | Evidence |
|---|---|---|---|
| 2 | Desain endpoint (URI, method, status code) | PASS | `docs/tugas-2/api-design.md` |
| 2 | DTO + validasi | PASS | `libs/domain/src/**/dto`, e2e 400 lulus |
| 2 | Swagger UI `/api/docs` dengan bearer auth | PASS | HTTP 200 di monolit & gateway (`swagger-verification.md`) |
| 2 | OpenAPI JSON | PASS | `docs/tugas-2/openapi.json`, diekspor dari kode |
| 2 | OpenAPI YAML | PASS | `docs/tugas-2/openapi.yaml` |
| 2 | Laporan PDF | PASS | `docs/tugas-2/laporan-tugas-2.pdf` |
| 2 | Screenshot Swagger UI | PASS | `docs/tugas-2/screenshots/swagger-overview.png`, `swagger-destinasi.png` (Try it out `GET /destinasi/1` → 200, respons asli) |
| 2 | Contoh error OpenAPI sesuai status code | PASS | `buildOpenApiDocument` memberi contoh 400/401/403/409/503 dari pesan asli API; unit 32/32 dan e2e 41/41 tetap lulus |

## Tugas 3 — Implementasi RESTful & GraphQL API

Luaran modul: source code (GitHub) + screenshot uji API (Postman/Apollo Sandbox).

| Tugas | Requirement | Status | Evidence |
|---|---|---|---|
| 3 | Prisma + MariaDB, migrasi, PrismaService global | PASS | `prisma/`, `libs/common/src/prisma/`, `prisma migrate status` up to date |
| 3 | CRUD Destinasi, filter kategori, NotFoundException, ParseIntPipe | PASS | `wisataku-api/src/destinasi/`, e2e CRUD/400/404 lulus |
| 3 | GraphQL `destinasi(id)`, `cariDestinasi(kategori)` | PASS | e2e GraphQL lulus |
| 3 | `@ResolveField` ulasan & fasilitas | PASS | e2e: query bertingkat mengembalikan ulasan & fasilitas |
| 3 | Mutation `tambahUlasan` | PASS | e2e: `ratingRata` diperbarui menjadi 4.5 |
| 3 | Perbandingan jumlah request REST vs GraphQL | PASS | `docs/tugas-3/laporan-tugas-3.md` bagian 5 |
| 3 | Bukti uji API (log) | PASS | `docs/tugas-3/rest-api-evidence.txt` (curl), `graphql-evidence.txt`, `docs/tugas-4/test-results/e2e-test-2026-09-30.txt` |
| 3 | Uji Postman | PASS (CLI) | Koleksi `docs/tugas-3/postman/` dijalankan Newman: 8 request, 13/13 assertion. Screenshot aplikasi Postman GUI belum diambil (opsional) |
| 3 | Screenshot Apollo Sandbox | PASS | `docs/tugas-3/screenshots/apollo-query.png` (query `destinasi(id: 1)` bertingkat → 200), `apollo-mutation.png` (`tambahUlasan` dengan token wisatawan → 200) |
| 3 | Source code di GitHub | BLOCKED | Git lokal ada; URL remote belum diberikan |
| 3 | Laporan PDF | PASS | `docs/tugas-3/laporan-tugas-3.pdf` |

## Tugas 4 — Keamanan dan Pengujian API

Luaran modul: source code keamanan API + laporan pengujian PDF.

| Tugas | Requirement | Status | Evidence |
|---|---|---|---|
| 4 | Register/login, bcrypt | PASS | unit test hash & login; hash `$2b$10$` di database |
| 4 | JWT `{ sub, role }`, JwtStrategy, JwtAuthGuard | PASS | unit test JWT; e2e 401 tanpa token/invalid/kedaluwarsa |
| 4 | `@Roles` + RolesGuard (admin, wisatawan) | PASS | unit test RolesGuard; e2e 403 |
| 4 | Guard pada mutation GraphQL | PASS | e2e `UNAUTHENTICATED` tanpa token |
| 4 | Unit test (`npm run test`) | PASS | 32/32, `test-results/unit-test-2026-09-30.txt` |
| 4 | E2E test (`npm run test:e2e`) | PASS | 41/41 (30 September 2026), `test-results/e2e-test-2026-09-30.txt` |
| 4 | Verifikasi JWT/RBAC di server berjalan | PASS | register 201, login 200 (JWT `sub`+`role`), 401, 403, admin 201; `screenshots/01`–`05`, `test-results/jwt-rbac-evidence.txt` |
| 4 | Load test k6 | PASS | k6 v2.2.0, 50 VU 30 detik: 1500 request, 0% gagal, avg 5,79 ms, p(95) 26,58 ms; `test-results/k6-output.txt` |
| 4 | Laporan pengujian PDF | PASS | `docs/tugas-4/laporan-keamanan-testing.pdf` |

## Tugas 5 — Integrasi & Deployment Web Service

Luaran modul: Dockerfile & image + URL layanan API.

| Tugas | Requirement | Status | Evidence |
|---|---|---|---|
| 5 | `service-destinasi` & `service-reservasi` dengan `@MessagePattern` TCP | PASS | e2e gateway dengan TCP sungguhan; smoke test 37/37 |
| 5 | API Gateway dengan ClientProxy, client tidak tahu port 5001 | PASS | e2e; port microservice tidak dipublikasikan di compose |
| 5 | Agregasi `/destinasi/:id/lengkap` | PASS | e2e + request manual 200 |
| 5 | `@nestjs/config` | PASS | semua aplikasi membaca konfigurasi dari environment |
| 5 | Versioning `/v1` & `/v2` | PASS | e2e + unit test mapper + request manual |
| 5 | Dockerfile per layanan | PENDING | file ada; `docker build` belum pernah dijalankan |
| 5 | `docker-compose.yml` | PENDING | YAML valid; `docker compose up` belum dijalankan |
| 5 | Docker runtime verification | BLOCKED | Docker Desktop belum terpasang |
| 5 | Deploy ke VPS / URL aktif | BLOCKED | belum ada akses server |
| 5 | Laporan evaluasi: `npm audit` | PASS | `docs/tugas-5/evaluasi/`, dibahas di laporan bagian 7.1 |
| 5 | Laporan evaluasi: load test terbaru | PENDING | k6 v2.2.0 (binary rilis resmi, belum terpasang di PATH sistem) sudah dijalankan untuk monolit (Tugas 4); load test ke gateway belum dijalankan |
| 5 | Laporan evaluasi: potensi breaking change | PASS | laporan bagian 7.3 |
| 5 | Laporan PDF | PASS | `docs/tugas-5/laporan-tugas-5.pdf` |

## Tugas 6 — Proyek Akhir Terintegrasi

Luaran modul: source code (GitHub) + API ter-deploy + dokumentasi teknis PDF + slide + video (YouTube).

| Tugas | Requirement | Status | Evidence |
|---|---|---|---|
| 6 | Proyek terintegrasi (gateway + microservices + auth + GraphQL + versioning) | PASS | e2e `test/wisataku-flow.e2e-spec.ts` 11/11 |
| 6 | Skenario e2e Bab 8.4 | PASS | langkah 1–5 lulus |
| 6 | README | PASS | `README.md` |
| 6 | CHANGELOG | PASS | `CHANGELOG.md` |
| 6 | Dokumentasi teknis PDF | PASS | `docs/tugas-6/laporan-final.pdf` |
| 6 | Definition of Done 8.3 | PENDING | 7/8 terpenuhi; butir 6 (`docker compose up`) belum terverifikasi |
| 6 | Repository GitHub | BLOCKED | URL remote belum diberikan |
| 6 | API ter-deploy | BLOCKED | belum ada VPS |
| 6 | Slide presentasi | NOT STARTED | dikerjakan manual |
| 6 | Video demo YouTube | NOT STARTED | dikerjakan manual |
| 6 | Pengisian Google Form | NOT STARTED | dikerjakan manual setelah link GitHub/PDF tersedia |

## Verifikasi Teknis Terakhir

| Check | Result |
|---|---|
| Build 4 aplikasi | PASS |
| Typecheck | PASS |
| Unit test | PASS 32/32 |
| E2E test | PASS 41/41 (30 September 2026) |
| Prisma | PASS |
| API smoke test | PASS |
| Docker runtime | BLOCKED |
| k6 | PASS (monolit): 1500 request, 0% gagal, p(95) 26,58 ms |
| Deployment | BLOCKED |
