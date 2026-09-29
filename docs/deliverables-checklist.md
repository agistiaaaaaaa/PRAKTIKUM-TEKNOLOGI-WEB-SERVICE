# Checklist Deliverables

Centang hanya jika file ada **dan** isinya sudah diperiksa. Status verifikasi teknis ada di `docs/final-audit.md`.

## Umum

- [ ] `README.md`
- [ ] `CHANGELOG.md`
- [x] `.env.example` (tanpa secret asli)
- [x] `.gitignore` (mengecualikan `.env`, `node_modules`, `dist`)
- [x] `docs/project-analysis.md`
- [ ] `docs/final-audit.md`

## Tugas 1 — Analisis Arsitektur

- [ ] `docs/tugas-1/laporan-tugas-1.md`
- [ ] `docs/tugas-1/laporan-tugas-1.pdf`
- [ ] `docs/tugas-1/arsitektur-wisataku.drawio`
- [ ] `docs/tugas-1/architecture-overview.png`

## Tugas 2 — Desain Endpoint & OpenAPI

- [ ] `docs/tugas-2/api-design.md`
- [x] `docs/tugas-2/openapi.json` (diekspor dari kode)
- [x] `docs/tugas-2/openapi.yaml`
- [ ] `docs/tugas-2/swagger-verification.md`
- [ ] Screenshot Swagger UI dari server yang berjalan

## Tugas 3 — REST & GraphQL

- [x] `prisma/schema.prisma` + folder `prisma/migrations/`
- [x] `prisma/seed.ts`
- [x] `wisataku-api/src/` (destinasi, ulasan, fasilitas, reservasi, app.module, main)
- [x] `libs/common` (PrismaModule), `libs/domain` (service, DTO, entity)
- [ ] `docs/tugas-3/laporan-tugas-3.md` + `.pdf` (termasuk perbandingan jumlah request REST vs GraphQL)
- [ ] Bukti uji REST & GraphQL (log request/response)
- [ ] Screenshot Postman / Apollo Sandbox

## Tugas 4 — Keamanan & Pengujian

- [x] `libs/auth/` (AuthService, JwtStrategy, JwtAuthGuard, GqlAuthGuard, RolesGuard, `@Roles`)
- [x] Unit test (`*.spec.ts`)
- [x] `test/destinasi.e2e-spec.ts`
- [x] `load-test.js` (root)
- [ ] `docs/tugas-4/test-results/` (output asli unit, e2e, k6) — unit & e2e ada; k6 menunggu k6 terpasang
- [ ] `docs/tugas-4/laporan-keamanan-testing.md` + `.pdf`

## Tugas 5 — Microservices & Deployment

- [x] `gateway/`, `service-destinasi/`, `service-reservasi/`
- [x] `gateway/Dockerfile`, `service-destinasi/Dockerfile`, `service-reservasi/Dockerfile`
- [x] `docker-compose.yml`
- [x] Konfigurasi via `@nestjs/config`
- [x] Versioning `/v1` & `/v2`
- [ ] `docs/tugas-5/laporan-tugas-5.md` + `.pdf` (termasuk evaluasi `npm audit`)
- [ ] `docs/tugas-5/deployment-guide.md`
- [ ] URL layanan API aktif (butuh VPS)

## Tugas 6 — Proyek Akhir

- [x] `test/wisataku-flow.e2e-spec.ts`
- [ ] `docs/tugas-6/dokumentasi-teknis-wisataku.md` + `.pdf`
- [ ] Slide presentasi (`.pptx` + `.pdf`)
- [ ] Naskah demo video
- [ ] Link repository GitHub
- [ ] URL API ter-deploy
- [ ] Link video YouTube

## Pengumpulan

- [ ] Folder `submission/` tanpa `node_modules`, `.env`, `dist`, log
- [ ] Google Form diisi per tugas (link GitHub, PDF, nomor tugas)
