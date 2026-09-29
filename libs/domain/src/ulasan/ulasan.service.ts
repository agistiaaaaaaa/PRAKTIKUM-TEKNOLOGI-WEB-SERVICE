import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@wisataku/common';
import { CreateUlasanInput } from './dto/create-ulasan.input';
import { Ulasan } from './entities/ulasan.entity';

@Injectable()
export class UlasanService {
  constructor(private readonly prisma: PrismaService) {}

  findByDestinasi(destinasiId: number, limit?: number): Promise<Ulasan[]> {
    return this.prisma.ulasan.findMany({
      where: { destinasiId },
      orderBy: [{ tanggal: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }

  /** Menyimpan ulasan sekaligus memperbarui ratingRata destinasi dalam satu transaksi. */
  create(userId: number, input: CreateUlasanInput): Promise<Ulasan> {
    return this.prisma.$transaction(async (tx) => {
      const destinasi = await tx.destinasi.findUnique({
        where: { id: input.destinasiId },
        select: { id: true },
      });
      if (!destinasi) {
        throw new NotFoundException(`Destinasi dengan id ${input.destinasiId} tidak ditemukan`);
      }

      const ulasan = await tx.ulasan.create({ data: { ...input, userId } });
      const { _avg } = await tx.ulasan.aggregate({
        where: { destinasiId: input.destinasiId },
        _avg: { rating: true },
      });
      await tx.destinasi.update({
        where: { id: input.destinasiId },
        data: { ratingRata: Math.round((_avg.rating ?? 0) * 10) / 10 },
      });
      return ulasan;
    });
  }
}
