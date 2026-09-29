// Bentuk payload message pattern antara gateway dan microservice.
import { DestinasiInput } from './destinasi/destinasi.record';
import { CreateReservasiDto } from './reservasi/dto/create-reservasi.dto';
import { CreateUlasanInput } from './ulasan/dto/create-ulasan.input';

export interface UpdateDestinasiPayload {
  id: number;
  data: Partial<DestinasiInput>;
}

export interface UlasanByDestinasiPayload {
  destinasiId: number;
  limit?: number;
}

export interface CreateUlasanPayload {
  userId: number;
  input: CreateUlasanInput;
}

export interface CreateReservasiPayload {
  userId: number;
  dto: CreateReservasiDto;
}
