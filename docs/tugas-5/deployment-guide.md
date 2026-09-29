# Panduan Deployment WisataKu

Status: **belum pernah dijalankan**. Docker Desktop belum terpasang di mesin pengembangan dan belum ada akses VPS. Panduan ini adalah langkah yang disiapkan, bukan catatan deployment yang sudah dilakukan. Setelah dijalankan, isi bagian "Hasil" di bawah dengan output asli.

## 1. Uji lokal dengan Docker Desktop

Prasyarat: Docker Desktop (Compose v2), port 3000 kosong.

```bash
cp .env.example .env
# Isi minimal: JWT_SECRET, SEED_ADMIN_PASSWORD, MARIADB_ROOT_PASSWORD, MARIADB_PASSWORD
# MARIADB_PASSWORD sebaiknya hanya huruf dan angka karena dipakai di dalam DATABASE_URL

docker compose up --build -d
docker compose ps                 # migrate: Exited (0); layanan lain: running
docker compose logs migrate       # "Seed selesai. Admin: ... Destinasi: 5"
docker compose logs -f gateway    # "API Gateway berjalan di http://localhost:3000"
```

Pemeriksaan:

```bash
curl -i http://localhost:3000/destinasi              # 200, 5 destinasi seed
curl -i http://localhost:3000/v2/destinasi/1         # 200, hargaDewasa & hargaAnak
curl -i http://localhost:3000/destinasi/1/lengkap    # 200, agregasi
curl -i http://localhost:3000/api/docs               # 200, Swagger UI
# microservice tidak boleh dapat diakses dari host:
curl -m 3 http://localhost:5001 || echo "5001 tertutup (benar)"
```

Load test terhadap gateway di container:

```bash
k6 run load-test.js | tee docs/tugas-4/test-results/k6-gateway-docker.txt
```

Menghentikan: `docker compose down` (data tetap di volume `mariadb_data`), atau `docker compose down -v` untuk menghapus data.

## 2. Deployment ke VPS

Prasyarat: VPS Linux dengan Docker Engine + Compose plugin, port 3000 (atau 80/443 lewat reverse proxy) dibuka di firewall, repository sudah di-push ke GitHub.

```bash
git clone <url-repository>
cd wisataku
cp .env.example .env
nano .env                         # isi secret produksi yang berbeda dari lokal
docker compose up --build -d
docker compose ps
```

Verifikasi dari luar jaringan server:

```bash
curl -i http://<IP-atau-domain>:3000/destinasi
k6 run -e BASE_URL=http://<IP-atau-domain>:3000 load-test.js
```

Catatan produksi:

- Gunakan `JWT_SECRET` acak panjang: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
- Pasang reverse proxy (Nginx/Caddy) dengan HTTPS bila memakai domain, karena token JWT dikirim di header dan tidak boleh lewat HTTP biasa di internet.
- Swagger dan Apollo Sandbox tetap aktif di image ini untuk keperluan demo.

## 3. Hasil

| Langkah | Tanggal | Hasil |
|---|---|---|
| `docker compose up --build -d` lokal | — | belum dijalankan |
| `curl /destinasi` lewat container | — | belum dijalankan |
| k6 terhadap gateway container | — | belum dijalankan |
| Deploy VPS | — | belum dijalankan |
| URL API aktif | — | belum ada |
