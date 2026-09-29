import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@wisataku/common';
import { ReservasiService } from './reservasi.service';

function tanggal(offsetHari: number): string {
  return new Date(Date.now() + offsetHari * 86_400_000).toISOString().slice(0, 10);
}

describe('ReservasiService', () => {
  const prismaMock = {
    destinasi: { findUnique: jest.fn() },
    reservasi: { create: jest.fn() },
  };
  const service = new ReservasiService(prismaMock as unknown as PrismaService);

  beforeEach(() => jest.resetAllMocks());

  it('menghitung totalHarga dari harga tiket di database', async () => {
    const tanggalKunjungan = tanggal(30);
    prismaMock.destinasi.findUnique.mockResolvedValue({ hargaTiket: 15000 });
    prismaMock.reservasi.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 1, status: 'dipesan', createdAt: new Date(), ...data }),
    );

    const result = await service.create(2, { destinasiId: 1, tanggalKunjungan, jumlahTiket: 3 });

    expect(result.totalHarga).toBe(45000);
    expect(result.userId).toBe(2);
    expect(result.tanggalKunjungan).toBe(tanggalKunjungan);
  });

  it('menolak tanggal kunjungan yang sudah lewat', async () => {
    await expect(
      service.create(2, { destinasiId: 1, tanggalKunjungan: tanggal(-1), jumlahTiket: 1 }),
    ).rejects.toThrow(BadRequestException);
    expect(prismaMock.reservasi.create).not.toHaveBeenCalled();
  });

  it('menolak destinasi yang tidak ada', async () => {
    prismaMock.destinasi.findUnique.mockResolvedValue(null);

    await expect(
      service.create(2, { destinasiId: 999, tanggalKunjungan: tanggal(1), jumlahTiket: 1 }),
    ).rejects.toThrow(NotFoundException);
  });
});
