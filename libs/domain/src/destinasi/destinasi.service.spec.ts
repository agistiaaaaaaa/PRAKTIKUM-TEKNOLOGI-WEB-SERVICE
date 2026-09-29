import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@wisataku/common';
import { DestinasiService } from './destinasi.service';

const row = {
  id: 1,
  nama: 'Pantai Kuta Mandalika',
  kategoriId: 1,
  kategori: { id: 1, namaKategori: 'Pantai' },
  lokasi: 'Kuta, Lombok Tengah',
  deskripsi: null,
  hargaTiket: 15000,
  hargaAnak: 10000,
  ratingRata: 4.5,
  createdAt: new Date('2026-09-29T10:00:00Z'),
};

describe('DestinasiService', () => {
  const prismaMock = {
    destinasi: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const service = new DestinasiService(prismaMock as unknown as PrismaService);

  beforeEach(() => jest.resetAllMocks());

  it('findAll memfilter berdasarkan nama kategori dan meratakan field kategori', async () => {
    prismaMock.destinasi.findMany.mockResolvedValue([row]);

    const result = await service.findAll({ kategori: 'Pantai' });

    expect(prismaMock.destinasi.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { kategori: { namaKategori: 'Pantai' } } }),
    );
    expect(result[0].kategori).toBe('Pantai');
  });

  it('findAll menghitung skip dari page dan limit', async () => {
    prismaMock.destinasi.findMany.mockResolvedValue([]);

    await service.findAll({ page: 3, limit: 10 });

    expect(prismaMock.destinasi.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10, skip: 20 }),
    );
  });

  it('findOne melempar NotFoundException jika id tidak ada', async () => {
    prismaMock.destinasi.findUnique.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('create menghubungkan kategori berdasarkan nama (dibuat jika belum ada)', async () => {
    prismaMock.destinasi.create.mockResolvedValue(row);

    await service.create({ nama: row.nama, kategori: 'Pantai', hargaTiket: 15000 });

    const { data } = prismaMock.destinasi.create.mock.calls[0][0];
    expect(data.kategori).toEqual({
      connectOrCreate: { where: { namaKategori: 'Pantai' }, create: { namaKategori: 'Pantai' } },
    });
  });

  it('update melempar NotFoundException tanpa menyentuh database jika id tidak ada', async () => {
    prismaMock.destinasi.findUnique.mockResolvedValue(null);

    await expect(service.update(999, { hargaTiket: 1 })).rejects.toThrow(NotFoundException);
    expect(prismaMock.destinasi.update).not.toHaveBeenCalled();
  });

  it('remove mengubah pelanggaran foreign key reservasi menjadi 409', async () => {
    prismaMock.destinasi.findUnique.mockResolvedValue(row);
    prismaMock.destinasi.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', {
        code: 'P2003',
        clientVersion: 'test',
      }),
    );

    await expect(service.remove(1)).rejects.toThrow(ConflictException);
  });
});
