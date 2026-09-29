import { Injectable } from '@nestjs/common';
import { PrismaService } from '@wisataku/common';
import { Fasilitas } from './entities/fasilitas.entity';

@Injectable()
export class FasilitasService {
  constructor(private readonly prisma: PrismaService) {}

  findByDestinasi(destinasiId: number): Promise<Fasilitas[]> {
    return this.prisma.fasilitas.findMany({ where: { destinasiId }, orderBy: { id: 'asc' } });
  }
}
