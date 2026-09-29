import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { DESTINASI_PATTERNS, FASILITAS_PATTERNS, ULASAN_PATTERNS } from '@wisataku/common';
import {
  CreateUlasanInput,
  CreateUlasanPayload,
  DestinasiInput,
  DestinasiRecord,
  Fasilitas,
  QueryDestinasiDto,
  Ulasan,
  UlasanByDestinasiPayload,
  UpdateDestinasiPayload,
} from '@wisataku/domain';
import { sendRpc } from './rpc';
import { DESTINASI_SERVICE } from './service-tokens';

/** Pembungkus ClientProxy ke service-destinasi agar controller & resolver tidak menulis pattern berulang. */
@Injectable()
export class DestinasiClient {
  private readonly timeoutMs: number;

  constructor(
    @Inject(DESTINASI_SERVICE) private readonly proxy: ClientProxy,
    config: ConfigService,
  ) {
    this.timeoutMs = Number(config.get('RPC_TIMEOUT_MS', 5000));
  }

  findAll(query: QueryDestinasiDto): Promise<DestinasiRecord[]> {
    return this.send(DESTINASI_PATTERNS.findAll, query);
  }

  findOne(id: number): Promise<DestinasiRecord> {
    return this.send(DESTINASI_PATTERNS.findOne, id);
  }

  create(input: DestinasiInput): Promise<DestinasiRecord> {
    return this.send(DESTINASI_PATTERNS.create, input);
  }

  update(id: number, data: Partial<DestinasiInput>): Promise<DestinasiRecord> {
    const payload: UpdateDestinasiPayload = { id, data };
    return this.send(DESTINASI_PATTERNS.update, payload);
  }

  remove(id: number): Promise<{ message: string }> {
    return this.send(DESTINASI_PATTERNS.remove, id);
  }

  async findUlasan(destinasiId: number, limit?: number): Promise<Ulasan[]> {
    const payload: UlasanByDestinasiPayload = { destinasiId, limit };
    const list = await this.send<Ulasan[]>(ULASAN_PATTERNS.findByDestinasi, payload);
    return list.map(reviveTanggal);
  }

  async createUlasan(userId: number, input: CreateUlasanInput): Promise<Ulasan> {
    const payload: CreateUlasanPayload = { userId, input };
    return reviveTanggal(await this.send<Ulasan>(ULASAN_PATTERNS.create, payload));
  }

  findFasilitas(destinasiId: number): Promise<Fasilitas[]> {
    return this.send(FASILITAS_PATTERNS.findByDestinasi, destinasiId);
  }

  private send<T>(pattern: string, data: unknown): Promise<T> {
    return sendRpc<T>(this.proxy, pattern, data, this.timeoutMs);
  }
}

// Date berubah menjadi string ISO saat melewati TCP (JSON), sedangkan scalar
// DateTime GraphQL hanya menerima objek Date.
function reviveTanggal(ulasan: Ulasan): Ulasan {
  return { ...ulasan, tanggal: new Date(ulasan.tanggal) };
}
