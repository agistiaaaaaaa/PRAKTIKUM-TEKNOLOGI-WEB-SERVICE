# Checklist Deliverables

Dicentang hanya bila luaran sudah ada **dan** sudah diperiksa. Bukti per butir ada di `docs/final-audit.md`.

## Sampul Tugas 1–4

- [x] Format sampul laporan praktikum STMIK Lombok, sama untuk semua tugas
- [x] Identitas mahasiswa — Baiq Agestia Cahya Ilami, NIM TI21240005

## TUGAS 1 — Analisis Arsitektur

- [x] Laporan PDF — `docs/tugas-1/laporan-tugas-1.pdf`
- [x] Diagram draw.io — `docs/tugas-1/arsitektur-wisataku.drawio` (+ PNG)

## TUGAS 2 — Desain Endpoint & OpenAPI

- [x] OpenAPI JSON — `docs/tugas-2/openapi.json`
- [x] OpenAPI YAML — `docs/tugas-2/openapi.yaml`
- [x] Laporan PDF — `docs/tugas-2/laporan-tugas-2.pdf`
- [x] Swagger evidence — `docs/tugas-2/screenshots/swagger-overview.png`, `swagger-destinasi.png` (Try it out, respons asli)

## TUGAS 3 — REST & GraphQL

- [x] REST implementation
- [x] GraphQL implementation
- [x] API test evidence (log) — `docs/tugas-3/rest-api-evidence.txt`, `graphql-evidence.txt`, `docs/tugas-4/test-results/e2e-test-2026-09-30.txt`
- [x] Postman collection — `docs/tugas-3/postman/` dijalankan dengan Newman (8 request, 13/13 assertion); screenshot aplikasi Postman GUI belum diambil (opsional, modul menerima Postman/Apollo Sandbox)
- [x] Screenshot Apollo Sandbox — `docs/tugas-3/screenshots/apollo-query.png`, `apollo-mutation.png`
- [x] Laporan — `docs/tugas-3/laporan-tugas-3.pdf`

## TUGAS 4 — Keamanan & Pengujian

- [x] JWT
- [x] RBAC
- [x] Unit tests — 32/32
- [x] E2E tests — 41/41 PASS (30 September 2026)
- [x] Screenshot JWT/RBAC — `docs/tugas-4/screenshots/01`–`05` (register 201, login 200, 401, 403, admin 201; JWT disensor)
- [x] k6 — 1500 request, 0% gagal, avg 5,79 ms, p(95) 26,58 ms (`docs/tugas-4/test-results/k6-output.txt`)
- [x] Testing report — `docs/tugas-4/laporan-keamanan-testing.pdf`

## TUGAS 5 — Integrasi & Deployment

- [x] Microservices
- [x] API Gateway
- [x] Dockerfile (3 layanan) — dibuat, belum di-build
- [x] docker-compose.yml — dibuat, YAML valid
- [ ] Docker runtime verification — **BLOCKED: Docker Desktop belum terpasang**
- [ ] Deployment / URL layanan API — **BLOCKED: belum ada VPS**
- [x] Laporan — `docs/tugas-5/laporan-tugas-5.pdf`, `deployment-guide.md`, `evaluasi/`

## TUGAS 6 — Proyek Akhir

- [x] Final source code — repository Git lokal
- [x] Final PDF — `docs/tugas-6/laporan-final.pdf`
- [ ] GitHub — **BLOCKED: URL remote belum diberikan**
- [ ] Deployed API — **BLOCKED: belum ada VPS**
- [ ] Slides — belum dibuat
- [ ] Video — belum dibuat

## Umum

- [x] `README.md`
- [x] `CHANGELOG.md`
- [x] `.env.example` tanpa secret asli
- [x] `.gitignore` mengecualikan `.env`, `node_modules`, `dist`, log
- [x] `docs/final-audit.md`

## Pengumpulan

- [ ] Google Form diisi per tugas (link GitHub, PDF, nomor tugas) — dilakukan manual setelah link GitHub tersedia
