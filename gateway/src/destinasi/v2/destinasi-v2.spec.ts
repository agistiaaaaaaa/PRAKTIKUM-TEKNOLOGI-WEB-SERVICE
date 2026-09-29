import { DestinasiRecord, toDestinasiV1 } from '@wisataku/domain';
import { fromDestinasiV2Dto } from './destinasi-v2.dto';
import { toDestinasiV2 } from './destinasi-v2.entity';

const record: DestinasiRecord = {
  id: 1,
  nama: 'Pantai Kuta Mandalika',
  kategori: 'Pantai',
  lokasi: 'Kuta, Lombok Tengah',
  deskripsi: null,
  hargaTiket: 15000,
  hargaAnak: 10000,
  ratingRata: 4.5,
  createdAt: new Date('2026-09-29T10:00:00Z'),
};

describe('Destinasi v1 vs v2', () => {
  it('v1 menampilkan hargaTiket dan tidak menampilkan hargaAnak', () => {
    const v1 = toDestinasiV1(record);
    expect(v1.hargaTiket).toBe(15000);
    expect(v1).not.toHaveProperty('hargaAnak');
  });

  it('v2 mengganti hargaTiket dengan hargaDewasa dan hargaAnak', () => {
    const v2 = toDestinasiV2(record);
    expect(v2).toMatchObject({ hargaDewasa: 15000, hargaAnak: 10000 });
    expect(v2).not.toHaveProperty('hargaTiket');
  });

  it('input v2 hargaDewasa disimpan ke kolom hargaTiket', () => {
    expect(fromDestinasiV2Dto({ nama: 'Baru', hargaDewasa: 20000, hargaAnak: 5000 })).toEqual({
      nama: 'Baru',
      hargaTiket: 20000,
      hargaAnak: 5000,
    });
  });

  it('PATCH v2 tanpa hargaDewasa tidak mengubah hargaTiket', () => {
    expect(fromDestinasiV2Dto({ hargaAnak: 7000 })).toEqual({ hargaAnak: 7000 });
  });
});
