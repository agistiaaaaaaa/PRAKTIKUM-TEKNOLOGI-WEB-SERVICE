import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@wisataku/common';
import {
  DestinasiInput,
  DestinasiRecord,
  toDestinasiRecord,
  withKategori,
} from './destinasi.record';
import { QueryDestinasiDto } from './dto/query-destinasi.dto';

@Injectable()
export class DestinasiService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryDestinasiDto = {}): Promise<DestinasiRecord[]> {
    const { kategori, page = 1, limit } = query;
    const rows = await this.prisma.destinasi.findMany({
      where: kategori ? { kategori: { namaKategori: kategori } } : undefined,
      include: withKategori,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
      skip: limit ? (page - 1) * limit : undefined,
    });
    return rows.map(toDestinasiRecord);
  }

  async findOne(id: number): Promise<DestinasiRecord> {
    const row = await this.prisma.destinasi.findUnique({ where: { id }, include: withKategori });
    if (!row) {
      throw new NotFoundException(`Destinasi dengan id ${id} tidak ditemukan`);
    }
    return toDestinasiRecord(row);
  }

  async create(input: DestinasiInput): Promise<DestinasiRecord> {
    const { kategori, ...data } = input;
    const row = await this.prisma.destinasi.create({
      data: { ...data, kategori: connectKategori(kategori) },
      include: withKategori,
    });
    return toDestinasiRecord(row);
  }

  async update(id: number, input: Partial<DestinasiInput>): Promise<DestinasiRecord> {
    await this.findOne(id);
    const { kategori, ...data } = input;
    const row = await this.prisma.destinasi.update({
      where: { id },
      data: kategori ? { ...data, kategori: connectKategori(kategori) } : data,
      include: withKategori,
    });
    return toDestinasiRecord(row);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);
    try {
      await this.prisma.destinasi.delete({ where: { id } });
    } catch (error) {
      // Reservasi memakai onDelete: Restrict agar riwayat pemesanan tidak ikut terhapus.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new ConflictException(
          'Destinasi tidak dapat dihapus karena sudah memiliki reservasi',
        );
      }
      throw error;
    }
    return { message: 'Destinasi berhasil dihapus' };
  }
}

/** Kategori disimpan di tabel terpisah; nama kategori baru dibuat otomatis. */
function connectKategori(namaKategori: string) {
  return { connectOrCreate: { where: { namaKategori }, create: { namaKategori } } };
}
