import { Prisma } from '@prisma/client';

export const withKategori = { kategori: true } satisfies Prisma.DestinasiInclude;

type DestinasiRow = Prisma.DestinasiGetPayload<{ include: typeof withKategori }>;

/**
 * Bentuk data destinasi di lapisan domain (termasuk hargaAnak).
 * Lapisan presentasi memilih field yang ditampilkan: v1 lewat toDestinasiV1,
 * v2 lewat toDestinasiV2 di gateway.
 */
export interface DestinasiRecord {
  id: number;
  nama: string;
  kategori: string;
  lokasi: string | null;
  deskripsi: string | null;
  hargaTiket: number;
  hargaAnak: number | null;
  ratingRata: number;
  createdAt: Date;
}

/** Data masukan untuk membuat/mengubah destinasi, tidak bergantung versi API. */
export interface DestinasiInput {
  nama: string;
  kategori: string;
  lokasi?: string;
  deskripsi?: string;
  hargaTiket: number;
  hargaAnak?: number;
}

export function toDestinasiRecord(row: DestinasiRow): DestinasiRecord {
  return {
    id: row.id,
    nama: row.nama,
    kategori: row.kategori.namaKategori,
    lokasi: row.lokasi,
    deskripsi: row.deskripsi,
    hargaTiket: row.hargaTiket,
    hargaAnak: row.hargaAnak,
    ratingRata: row.ratingRata,
    createdAt: row.createdAt,
  };
}
