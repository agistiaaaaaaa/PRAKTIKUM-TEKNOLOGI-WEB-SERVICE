# Recovery Status

Audit dilakukan 2026-09-30 setelah laptop mati mendadak (sekitar pukul 00.44, berdasarkan timestamp terakhir `dist/` dan `mariadb.log`). Seluruh status di bawah berasal dari pemeriksaan file dan perintah yang benar-benar dijalankan saat audit.

## Environment

- workspace: folder project `wisataku`
- project ditemukan: `wisataku/` (Nest CLI monorepo: `wisataku-api`, `gateway`, `service-destinasi`, `service-reservasi`, `libs/{common,auth,domain}`)
- runtime lokal: `.wisataku-local/` di luar project (data MariaDB 12.1 port 3307, npm cache, log). Di-ignore oleh `.gitignore`.
- git repository: **tidak ada** (belum `git init`)
- branch: -
- last commit: -
- uncommitted changes: seluruh project belum pernah di-commit
- Node.js v24.15.0, npm 11.12.1
- Docker: tidak terpasang di mesin ini
- k6: tidak terpasang di mesin ini

## Existing Implementation

### Tugas 1
- status: NOT STARTED (dokumen)
- files: hanya `docs/project-analysis.md` (analisis modul & requirement matrix, sudah lengkap)
- evidence: `docs/tugas-1/` belum ada; laporan PDF dan diagram draw.io belum dibuat

### Tugas 2
- status: PENDING
- files: DTO di `libs/domain/src/**/dto`, `libs/auth/src/dto`, `libs/common/src/http/configure-http-app.ts` (Swagger `/api/docs`, `addBearerAuth`, `ValidationPipe({ whitelist, transform })`)
- evidence: `GET /api/docs-json` = 200 di monolit dan gateway. Script `npm run openapi:export` menunjuk `scripts/export-openapi.ts` yang **belum ada** (folder `scripts/` kosong). `docs/tugas-2/` belum ada.

### Tugas 3
- status: PENDING (kode PASS, dokumen belum)
- files: `prisma/schema.prisma`, 4 migrasi (`init`, `add_user`, `add_reservasi`, `add_harga_anak`), `prisma/seed.ts`, `wisataku-api/src/**`, `libs/domain/src/**`
- evidence: smoke test monolit 32/32 lulus (CRUD, filter kategori, 400 `ParseIntPipe`, 404, GraphQL `destinasi(id)` + `ulasan` + `fasilitas`, `cariDestinasi`, `tambahUlasan`). Laporan dan screenshot belum ada.

### Tugas 4
- status: PENDING (keamanan PASS, pengujian otomatis belum ada)
- files: `libs/auth/src/**` (AuthService bcrypt, JwtStrategy, JwtAuthGuard, GqlAuthGuard, RolesGuard, `@Roles`)
- evidence: smoke test: register 201, duplikat 409, password salah 401, JWT berisi `sub` + `role`, tanpa token 401, token invalid 401, wisatawan 403, admin 201/200. Password tersimpan sebagai hash `$2b$10$...`. **Tidak ada satu pun file `*.spec.ts`**, folder `test/` kosong, `test/jest-e2e.json` (dirujuk `npm run test:e2e`) tidak ada, `load-test.js` tidak ada.

### Tugas 5
- status: PENDING (microservices & versioning PASS, Docker belum)
- files: `gateway/src/**`, `service-destinasi/src/**`, `service-reservasi/src/**`, `libs/common/src/rpc/**`
- evidence: smoke test gateway 37/37 lulus lewat TCP sungguhan (5001/5002), termasuk `/v1` vs `/v2`, `/destinasi/:id/lengkap`, error 404 diteruskan dari microservice. `Dockerfile`, `docker-compose.yml`, `CHANGELOG.md`, `docs/tugas-5/` belum ada.

### Tugas 6
- status: NOT STARTED
- files: -
- evidence: `README.md`, `test/wisataku-flow.e2e-spec.ts`, dokumentasi teknis, slide belum ada

## Technical Verification

- dependency installation: PASS (`node_modules` utuh, build & typecheck berjalan)
- TypeScript: PASS (`tsc --noEmit` exit 0)
- NestJS build: PASS (`npm run build`, 4 aplikasi webpack sukses)
- Prisma: PASS (`prisma validate` valid, `prisma migrate status` = up to date, 4 migrasi)
- MariaDB: PASS (instance lokal port 3307 pulih dari crash: "Crash table recovery finished"; data seed utuh: 5 destinasi, 6 kategori, 12 fasilitas)
- REST: PASS (smoke test monolit & gateway)
- GraphQL: PASS (query bertingkat & mutation terhubung ke database)
- Authentication: PASS (smoke test)
- Authorization: PASS (401/403 sesuai)
- Unit test: NOT STARTED saat audit → PASS setelah sesi lanjutan (lihat bawah)
- E2E test: NOT STARTED saat audit → PASS setelah sesi lanjutan
- k6: NOT STARTED saat audit → skrip dibuat; eksekusi BLOCKED (k6 belum terpasang)
- Microservices: PASS (smoke test gateway → TCP → service)
- API Gateway: PASS
- Docker: NOT STARTED saat audit → file dibuat; eksekusi BLOCKED (Docker belum terpasang)
- API versioning: PASS (`/v1` `hargaTiket`, `/v2` `hargaDewasa` + `hargaAnak`); CHANGELOG belum ada

### Catatan teknis dari audit

- Migrasi `add_user` dan `add_harga_anak` memakai nama tabel huruf kecil (`ulasan`, `destinasi`) karena dibuat di MariaDB Windows (`lower_case_table_names=1`). Di Linux/Docker nama tabel case-sensitive, sehingga container MariaDB perlu `--lower-case-table-names=1`. Migrasi yang sudah diterapkan **tidak diubah**.
- `docs/deliverables-checklist.md` dan `docs/project-analysis.md` merujuk `docs/final-audit.md` yang belum ada.

## Last Known Progress

Seluruh kode aplikasi Bab 1–7 (monolit, gateway, dua microservice, auth, RBAC, GraphQL, versioning) serta schema, migrasi, dan seed sudah selesai dan terverifikasi berjalan. Pekerjaan terakhir sebelum mati adalah build dan smoke test manual (terlihat dari user `smoke*`, `gw*`, `gq*` di database dan `dist/` pukul 00.44). Belum ada test otomatis, Docker, OpenAPI export, README/CHANGELOG, maupun dokumen per tugas.

## Sesi Lanjutan (2026-09-30, setelah audit)

Dikerjakan setelah audit di atas:

| Pekerjaan | File | Verifikasi |
|---|---|---|
| Unit test (8 suite) | `libs/**/*.spec.ts`, `gateway/src/**/*.spec.ts`, `tsconfig.spec.json` | PASS, 32/32 (`docs/tugas-4/test-results/unit-test.txt`) |
| E2E monolit | `test/destinasi.e2e-spec.ts`, `test/helpers.ts`, `test/jest-e2e.json` | PASS |
| E2E alur Bab 8.4 lewat gateway + TCP | `test/wisataku-flow.e2e-spec.ts`, `test/gateway-test-env.ts` | PASS; total e2e 41/41 (`docs/tugas-4/test-results/e2e-test.txt`) |
| Load test k6 | `load-test.js` | PENDING, k6 belum terpasang |
| Ekspor OpenAPI | `scripts/export-openapi.ts` → `docs/tugas-2/openapi.{json,yaml}`, `docs/tugas-5/openapi-gateway.{json,yaml}` | PASS (7 path monolit, 15 path gateway) |
| Docker | `gateway/Dockerfile`, `service-destinasi/Dockerfile`, `service-reservasi/Dockerfile`, `.dockerignore`, `docker-compose.yml` | YAML valid; `docker compose up` BLOCKED (Docker belum terpasang) |

Perbaikan yang diperlukan selama sesi ini:

- Jest awalnya crash "Zone Allocation failed - process out of memory": 16 CPU → ~15 worker ts-jest yang masing-masing melakukan type-check penuh, sementara RAM bebas ~3 GB. Solusi: `tsconfig.spec.json` (`isolatedModules`, transpile saja) dan `maxWorkers: 50%`. Type-check tetap dijalankan `npm run typecheck` yang mencakup file spec.
- E2E gateway awalnya 503: `import` di-hoist sehingga `ConfigModule.forRoot` memvalidasi port dari `.env` sebelum override port test. Override dipindah ke `test/gateway-test-env.ts` yang diimpor pertama.

Keputusan Docker yang berbeda dari contoh modul (beserta alasannya):

- `node:22-alpine`, bukan `node:20-alpine`: Node 20 sudah EOL (April 2026).
- Build context = root repo karena `libs/` dipakai bersama; tiap Dockerfile hanya mem-build aplikasinya sendiri.
- Service `migrate` sekali jalan (`prisma migrate deploy` + seed) sebelum microservice naik.
- MariaDB tidak dipublikasikan ke host (port 3306 host juga sudah dipakai layanan MySQL lain) dan memakai `--lower-case-table-names=1`.
- Secret dibaca dari `.env` (`${VAR:?}`), tidak ada nilai rahasia di `docker-compose.yml`.

Data smoke test sesi recovery (user `recovery*@example.com`, ulasan dan reservasinya) sudah dihapus dan `ratingRata` destinasi terkait dihitung ulang. Data smoke test dari sesi sebelum crash (`smoke*`, `gw*`, `gq*`, `dn*`, `rc*` @example.com) dibiarkan.

## Finalisasi (2026-09-30)

- Git diinisialisasi; commit `f501da5` "chore: checkpoint verified WisataKu implementation".
- README, CHANGELOG, `docs/final-audit.md`, dan laporan Tugas 1–6 (Markdown + PDF) dibuat. PDF dibangun dengan `npm run docs:pdf`.
- MariaDB lokal (port 3307) dihentikan oleh sistem karena memori rendah. Jalankan ulang sebelum `npm run test:e2e`.
- Gateway diverifikasi manual di port 3100 karena port 3000 dipakai proses `wisataku-api` lain yang bukan dijalankan sesi ini.

## Next Action

1. Tugas 4: pasang k6 (`winget install k6 --source winget`), jalankan `k6 run load-test.js` terhadap monolit lalu gateway, simpan output ke `docs/tugas-4/test-results/`.
2. Tugas 5: pasang Docker Desktop, jalankan `docker compose up --build -d`, verifikasi `curl http://localhost:3000/destinasi`.
3. Dokumentasi: `README.md`, `CHANGELOG.md` (v1 → v2, kebijakan deprecation), lalu laporan Tugas 1–6.
4. `git init` + commit pertama agar progres tidak bergantung pada satu salinan disk.
