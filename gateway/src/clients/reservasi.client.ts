import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { RESERVASI_PATTERNS } from '@wisataku/common';
import { CreateReservasiDto, CreateReservasiPayload, Reservasi } from '@wisataku/domain';
import { sendRpc } from './rpc';
import { RESERVASI_SERVICE } from './service-tokens';

@Injectable()
export class ReservasiClient {
  private readonly timeoutMs: number;

  constructor(
    @Inject(RESERVASI_SERVICE) private readonly proxy: ClientProxy,
    config: ConfigService,
  ) {
    this.timeoutMs = Number(config.get('RPC_TIMEOUT_MS', 5000));
  }

  create(userId: number, dto: CreateReservasiDto): Promise<Reservasi> {
    const payload: CreateReservasiPayload = { userId, dto };
    return sendRpc(this.proxy, RESERVASI_PATTERNS.create, payload, this.timeoutMs);
  }
}
