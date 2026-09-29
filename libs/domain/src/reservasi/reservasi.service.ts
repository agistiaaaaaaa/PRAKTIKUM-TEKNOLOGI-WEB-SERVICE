import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@wisataku/common';
import { CreateReservasiDto } from './dto/create-reservasi.dto';
import { Reservasi, toReservasi } from './entities/reservasi.entity';

@Injectable()
export class ReservasiService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateReservasiDto): Promise<Reservasi> {
    // Perbandingan string aman karena keduanya berformat YYYY-MM-DD (tanggal UTC).
    const hariIni = new Date().toISOString().slice(0, 10);
    if (dto.tanggalKunjungan < hariIni) {
      throw new BadRequestException('tanggalKunjungan tidak boleh sebelum hari ini');
    }

    const destinasi = await this.prisma.destinasi.findUnique({
      where: { id: dto.destinasiId },
      select: { hargaTiket: true },
    });
    if (!destinasi) {
      throw new NotFoundException(`Destinasi dengan id ${dto.destinasiId} tidak ditemukan`);
    }

    const row = await this.prisma.reservasi.create({
      data: {
        userId,
        destinasiId: dto.destinasiId,
        tanggalKunjungan: new Date(dto.tanggalKunjungan),
        jumlahTiket: dto.jumlahTiket,
        totalHarga: destinasi.hargaTiket * dto.jumlahTiket,
      },
    });
    return toReservasi(row);
  }
}
