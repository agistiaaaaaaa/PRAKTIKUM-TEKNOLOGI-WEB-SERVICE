# Verifikasi Swagger / OpenAPI

Catatan pemeriksaan yang benar-benar dijalankan di mesin pengembangan (Windows 11, Node.js 24.15, MariaDB 12.1 lokal) pada 30 September 2026.

## 1. Swagger UI dan dokumen dari server

Aplikasi dijalankan dari hasil build (`node dist/<aplikasi>/main`), lalu setiap URL diminta dengan `curl` dan dicatat status HTTP-nya.

| URL | wisataku-api | gateway |
|---|---|---|
| `GET /api/docs` (Swagger UI) | 200 | 200 |
| `GET /api/docs-json` | 200 | 200 |
| `GET /api/docs-yaml` | 200 | 200 |

Gateway pada pemeriksaan ini dijalankan di port 3100 (`GATEWAY_PORT=3100`) karena port 3000 sedang dipakai proses lain.

## 2. Ekspor dokumen dari kode

```
$ npm run openapi:export
docs/tugas-2/openapi.{json,yaml}: 7 path
docs/tugas-5/openapi-gateway.{json,yaml}: 15 path
```

## 3. Kesesuaian dokumentasi dengan implementasi

| Pemeriksaan | Cara | Hasil |
|---|---|---|
| Setiap endpoint di OpenAPI benar-benar ada | Smoke test HTTP ke seluruh endpoint monolit (32 cek) dan gateway (37 cek) | Semua sesuai |
| Status code yang dideklarasikan benar-benar dikembalikan | e2e test memeriksa 200/201/400/401/403/404/409 (`docs/tugas-4/test-results/e2e-test-2026-09-30.txt`) | 41/41 lulus |
| Skema request sesuai validasi | e2e: body tidak valid ditolak 400 pada register, create destinasi, reservasi | Lulus |
| Endpoint admin ditandai `bearer` | Pemeriksaan `security` pada `openapi.json` | 4 operasi monolit bertanda `bearer`, sesuai endpoint yang memakai `JwtAuthGuard` |

Operasi dan status code yang tercantum di `openapi.json` (monolit):

```
POST    /auth/register              201,400,409
POST    /auth/login                 200,400,401
GET     /destinasi                  200,400
POST    /destinasi                  201,400,401,403        [bearer]
GET     /destinasi/{id}             200,400,404
PATCH   /destinasi/{id}             200,400,401,403,404    [bearer]
DELETE  /destinasi/{id}             200,401,403,404,409    [bearer]
GET     /destinasi/{id}/ulasan      200,404
GET     /destinasi/{id}/fasilitas   200,404
POST    /reservasi                  201,400,401,403,404    [bearer]
```

## 4. Contoh respons error

Semula seluruh respons error memakai contoh bawaan skema `ErrorResponse` (body 404), termasuk pada 400/401/403/409. Mulai 30 September 2026, `buildOpenApiDocument` memberi setiap respons error contoh sesuai kode statusnya, dengan pesan dari respons asli API. Perubahan hanya pada dokumen OpenAPI. Setelah perubahan: `npm run typecheck` exit 0, `npm run build` 4/4 sukses, unit test 32/32, e2e test 41/41.

## 5. Screenshot

Diambil 30 September 2026 dari Swagger UI aplikasi yang berjalan di `http://localhost:3000/api/docs` (Chrome dikendalikan Puppeteer; respons asli server):

| File | Isi |
|---|---|
| `screenshots/swagger-overview.png` | Halaman utama: tag Auth, Destinasi, Reservasi, seluruh endpoint, ikon gembok, daftar skema |
| `screenshots/swagger-destinasi.png` | "Try it out" `GET /destinasi/{id}` id = 1 → 200, beserta contoh 400 dan 404 |
| `../tugas-4/screenshots/03-post-destinasi-tanpa-token-401.png` | "Try it out" `POST /destinasi` tanpa token → 401 |
| `../tugas-4/screenshots/04-post-destinasi-wisatawan-403.png` | Authorize token wisatawan, `POST /destinasi` → 403 |
| `../tugas-4/screenshots/05-post-destinasi-admin-201.png` | Authorize token admin, `POST /destinasi` → 201 (JWT disensor) |
