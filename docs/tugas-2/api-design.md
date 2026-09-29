# Tugas 2 — Desain Endpoint & Dokumentasi API WisataKu

Dokumen ini menjelaskan rancangan endpoint REST WisataKu dan cara dokumentasinya dihasilkan. Seluruh isi diambil dari implementasi aplikasi monolitik `wisataku-api` (tahap Tugas 2–4). Dokumen OpenAPI lengkap ada di `openapi.json` dan `openapi.yaml` pada folder ini; keduanya diekspor langsung dari decorator di kode dengan `npm run openapi:export`, bukan ditulis manual.

## 1. Konvensi URI

Mengikuti Bab 2.3.1 modul:

| Aturan | Penerapan |
|---|---|
| Kata benda, bukan kata kerja | `/destinasi`, bukan `/getDestinasi` |
| Huruf kecil | `/destinasi`, `/reservasi`, `/auth/login` |
| Hierarki untuk relasi | `/destinasi/:id/ulasan`, `/destinasi/:id/fasilitas` |
| Filter & pagination lewat query string | `/destinasi?kategori=Pantai&page=1&limit=10` |
| Aksi pada resource lewat method HTTP | `POST /destinasi` membuat, `PATCH /destinasi/:id` mengubah |

Nama resource memakai bahasa Indonesia sesuai modul. `destinasi` dipakai apa adanya untuk bentuk jamak karena bahasa Indonesia tidak memiliki penanda jamak yang lazim dipakai pada URI. Pengecualian kata kerja hanya pada `/auth/register` dan `/auth/login`, yang merupakan operasi autentikasi, bukan resource.

## 2. Daftar Endpoint

| Method | URI | Deskripsi | Akses | Request | Respons sukses |
|---|---|---|---|---|---|
| POST | `/auth/register` | Registrasi akun wisatawan | Publik | `RegisterDto` | 201 `RegisterResponse` |
| POST | `/auth/login` | Login, menerima JWT | Publik | `LoginDto` | 200 `LoginResponse` |
| GET | `/destinasi` | Daftar destinasi, filter kategori, pagination | Publik | query `kategori`, `page`, `limit` | 200 `Destinasi[]` |
| GET | `/destinasi/:id` | Detail destinasi | Publik | path `id` (integer) | 200 `Destinasi` |
| GET | `/destinasi/:id/ulasan` | Ulasan destinasi, terbaru lebih dulu | Publik | path `id` | 200 `Ulasan[]` |
| GET | `/destinasi/:id/fasilitas` | Fasilitas destinasi | Publik | path `id` | 200 `Fasilitas[]` |
| POST | `/destinasi` | Tambah destinasi | Admin | `CreateDestinasiDto` | 201 `Destinasi` |
| PATCH | `/destinasi/:id` | Ubah sebagian data destinasi | Admin | `UpdateDestinasiDto` | 200 `Destinasi` |
| DELETE | `/destinasi/:id` | Hapus destinasi | Admin | path `id` | 200 `{ message }` |
| POST | `/reservasi` | Buat reservasi tiket | Wisatawan | `CreateReservasiDto` | 201 `Reservasi` |

Enam endpoint destinasi pertama sama dengan rancangan pada tabel Bab 2.3.1 modul. Endpoint `fasilitas`, `auth`, dan `reservasi` ditambahkan karena dibutuhkan oleh Bab 4 (perbandingan REST vs GraphQL), Bab 5, dan Bab 8.

`DELETE` membalas 200 dengan pesan konfirmasi, bukan 204, agar client mendapat konfirmasi yang dapat ditampilkan.

## 3. Status Code per Endpoint

| Endpoint | 200 | 201 | 400 | 401 | 403 | 404 | 409 |
|---|---|---|---|---|---|---|---|
| `POST /auth/register` | | ✓ | ✓ | | | | ✓ email terdaftar |
| `POST /auth/login` | ✓ | | ✓ | ✓ kredensial salah | | | |
| `GET /destinasi` | ✓ | | ✓ query tidak valid | | | | |
| `GET /destinasi/:id` | ✓ | | ✓ id bukan angka | | | ✓ | |
| `GET /destinasi/:id/ulasan` | ✓ | | | | | ✓ | |
| `GET /destinasi/:id/fasilitas` | ✓ | | | | | ✓ | |
| `POST /destinasi` | | ✓ | ✓ | ✓ | ✓ bukan admin | | |
| `PATCH /destinasi/:id` | ✓ | | ✓ | ✓ | ✓ | ✓ | |
| `DELETE /destinasi/:id` | ✓ | | | ✓ | ✓ | ✓ | ✓ sudah ada reservasi |
| `POST /reservasi` | | ✓ | ✓ tanggal lampau | ✓ | ✓ bukan wisatawan | ✓ destinasi | |

Tabel ini sama dengan respons yang dideklarasikan di `openapi.json` dan diuji oleh e2e test (`test/destinasi.e2e-spec.ts`).

`POST /auth/login` memakai `@HttpCode(200)` karena login tidak membuat resource baru. Status ini juga yang diharapkan skenario e2e Bab 8.4.

## 4. DTO dan Validasi

DTO didefinisikan sebagai kelas dengan decorator `class-validator` dan `@ApiProperty`, sehingga satu kelas menjadi kontrak validasi sekaligus skema OpenAPI. `ValidationPipe({ whitelist: true, transform: true })` dipasang global: field yang tidak dikenal dibuang, dan query string dikonversi ke tipe yang benar.

| DTO | Field | Aturan |
|---|---|---|
| `CreateDestinasiDto` | `nama` | string, wajib, maks 150 |
| | `kategori` | string, wajib, maks 50; kategori baru dibuat otomatis |
| | `lokasi`, `deskripsi` | opsional |
| | `hargaTiket` | number ≥ 0, wajib |
| `UpdateDestinasiDto` | semua field `CreateDestinasiDto` | opsional (`PartialType`) |
| `QueryDestinasiDto` | `kategori` | opsional |
| | `page` | integer ≥ 1 |
| | `limit` | integer 1–100; tanpa `limit` seluruh data dikembalikan |
| `RegisterDto` | `nama` | string, wajib, maks 100 |
| | `email` | format email, maks 150 |
| | `password` | 8–72 karakter (72 adalah batas input bcrypt) |
| `LoginDto` | `email`, `password` | wajib |
| `CreateReservasiDto` | `destinasiId` | integer ≥ 1 |
| | `tanggalKunjungan` | `YYYY-MM-DD`, tidak boleh sebelum hari ini |
| | `jumlahTiket` | integer 1–20 |

`totalHarga` pada reservasi tidak diterima dari client; server menghitungnya dari `hargaTiket` di database dikali `jumlahTiket`.

Parameter `:id` divalidasi dengan `ParseIntPipe`, sehingga `GET /destinasi/abc` langsung ditolak 400 sebelum menyentuh database.

## 5. Format Error

Semua error memakai format bawaan NestJS, didokumentasikan di Swagger sebagai skema `ErrorResponse`:

```json
{ "statusCode": 404, "message": "Destinasi dengan id 999 tidak ditemukan", "error": "Not Found" }
```

Untuk error validasi, `message` berupa array pesan:

```json
{ "statusCode": 400, "message": ["hargaTiket must not be less than 0"], "error": "Bad Request" }
```

## 6. Autentikasi pada Dokumentasi

`DocumentBuilder().addBearerAuth()` menambahkan skema keamanan `bearer`. Endpoint yang dilindungi diberi `@ApiBearerAuth()` sehingga di Swagger UI muncul ikon gembok dan tombol **Authorize** untuk memasukkan token hasil `POST /auth/login`. Pada `openapi.json`, empat operasi memiliki `security: [{ bearer: [] }]`: `POST /destinasi`, `PATCH /destinasi/{id}`, `DELETE /destinasi/{id}`, dan `POST /reservasi`. Dokumen gateway menandai operasi yang sama beserta varian `/v1` dan `/v2`-nya.

## 7. Dokumentasi yang Dihasilkan

| File / URL | Isi |
|---|---|
| `docs/tugas-2/openapi.json` | OpenAPI 3.0.0, "WisataKu API" versi 1.0, 7 path / 10 operasi |
| `docs/tugas-2/openapi.yaml` | Isi sama dalam format YAML |
| `http://localhost:3000/api/docs` | Swagger UI (saat aplikasi berjalan) |
| `http://localhost:3000/api/docs-json`, `/api/docs-yaml` | Dokumen yang sama dari server |
| `docs/tugas-5/openapi-gateway.{json,yaml}` | Dokumen API Gateway (Tugas 5), termasuk `/v1`, `/v2`, `/lengkap` |

Modul Bab 2.4 langkah 5 menyimpan `openapi.json` dari dalam `main.ts` setiap aplikasi dijalankan. Proyek ini memakai skrip terpisah (`scripts/export-openapi.ts`) yang membangun aplikasi dalam *preview mode*, sehingga dokumen dapat diekspor tanpa database dan tanpa menulis file setiap server start.

Bukti verifikasi Swagger ada di `swagger-verification.md`.
