import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard, Role, Roles, RolesGuard } from '@wisataku/auth';
import { ErrorResponse } from '@wisataku/common';
import {
  CreateDestinasiDto,
  Destinasi,
  Fasilitas,
  QueryDestinasiDto,
  toDestinasiV1,
  Ulasan,
  UpdateDestinasiDto,
} from '@wisataku/domain';
import { DestinasiClient } from '../clients/destinasi.client';
import { DestinasiLengkap } from './destinasi-lengkap.entity';

const JUMLAH_ULASAN_TERBARU = 3;

/**
 * Versi 1 (struktur lama: hargaTiket). Juga dipetakan ke path tanpa prefix versi
 * (/destinasi) supaya client yang dibuat sebelum versioning tetap berjalan.
 */
@ApiTags('Destinasi v1')
@ApiServiceUnavailableResponse({
  type: ErrorResponse,
  description: 'service-destinasi tidak dapat dihubungi',
})
@Controller({ path: 'destinasi', version: ['1', VERSION_NEUTRAL] })
export class DestinasiV1Controller {
  constructor(private readonly destinasiClient: DestinasiClient) {}

  @Get()
  @ApiOperation({ summary: 'Menampilkan daftar destinasi, dapat difilter berdasarkan kategori' })
  @ApiOkResponse({ type: [Destinasi] })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async findAll(@Query() query: QueryDestinasiDto): Promise<Destinasi[]> {
    const list = await this.destinasiClient.findAll(query);
    return list.map(toDestinasiV1);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail satu destinasi' })
  @ApiOkResponse({ type: Destinasi })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'id bukan angka' })
  @ApiNotFoundResponse({ type: ErrorResponse })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Destinasi> {
    return toDestinasiV1(await this.destinasiClient.findOne(id));
  }

  @Get(':id/lengkap')
  @ApiOperation({
    summary: 'Detail destinasi + 3 ulasan terbaru + fasilitas dalam satu respons (API composition)',
  })
  @ApiOkResponse({ type: DestinasiLengkap })
  @ApiNotFoundResponse({ type: ErrorResponse })
  async findLengkap(@Param('id', ParseIntPipe) id: number): Promise<DestinasiLengkap> {
    const [destinasi, ulasanTerbaru, fasilitas] = await Promise.all([
      this.destinasiClient.findOne(id),
      this.destinasiClient.findUlasan(id, JUMLAH_ULASAN_TERBARU),
      this.destinasiClient.findFasilitas(id),
    ]);
    return { ...toDestinasiV1(destinasi), ulasanTerbaru, fasilitas };
  }

  @Get(':id/ulasan')
  @ApiOperation({ summary: 'Ulasan milik destinasi tertentu, terbaru lebih dulu' })
  @ApiOkResponse({ type: [Ulasan] })
  @ApiNotFoundResponse({ type: ErrorResponse })
  async findUlasan(@Param('id', ParseIntPipe) id: number): Promise<Ulasan[]> {
    const [, ulasan] = await Promise.all([
      this.destinasiClient.findOne(id),
      this.destinasiClient.findUlasan(id),
    ]);
    return ulasan;
  }

  @Get(':id/fasilitas')
  @ApiOperation({ summary: 'Fasilitas yang tersedia di destinasi tertentu' })
  @ApiOkResponse({ type: [Fasilitas] })
  @ApiNotFoundResponse({ type: ErrorResponse })
  async findFasilitas(@Param('id', ParseIntPipe) id: number): Promise<Fasilitas[]> {
    const [, fasilitas] = await Promise.all([
      this.destinasiClient.findOne(id),
      this.destinasiClient.findFasilitas(id),
    ]);
    return fasilitas;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Menambahkan destinasi baru (khusus admin)' })
  @ApiCreatedResponse({ type: Destinasi })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiUnauthorizedResponse({ type: ErrorResponse })
  @ApiForbiddenResponse({ type: ErrorResponse })
  async create(@Body() dto: CreateDestinasiDto): Promise<Destinasi> {
    return toDestinasiV1(await this.destinasiClient.create(dto));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mengubah sebagian data destinasi (khusus admin)' })
  @ApiOkResponse({ type: Destinasi })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiUnauthorizedResponse({ type: ErrorResponse })
  @ApiForbiddenResponse({ type: ErrorResponse })
  @ApiNotFoundResponse({ type: ErrorResponse })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDestinasiDto,
  ): Promise<Destinasi> {
    return toDestinasiV1(await this.destinasiClient.update(id, dto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Menghapus destinasi (khusus admin)' })
  @ApiOkResponse({ schema: { example: { message: 'Destinasi berhasil dihapus' } } })
  @ApiUnauthorizedResponse({ type: ErrorResponse })
  @ApiForbiddenResponse({ type: ErrorResponse })
  @ApiNotFoundResponse({ type: ErrorResponse })
  @ApiConflictResponse({ type: ErrorResponse, description: 'Destinasi sudah memiliki reservasi' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.destinasiClient.remove(id);
  }
}
