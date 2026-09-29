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
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard, Role, Roles, RolesGuard } from '@wisataku/auth';
import { ErrorResponse } from '@wisataku/common';
import { DestinasiInput, QueryDestinasiDto } from '@wisataku/domain';
import { DestinasiClient } from '../../clients/destinasi.client';
import { CreateDestinasiV2Dto, fromDestinasiV2Dto, UpdateDestinasiV2Dto } from './destinasi-v2.dto';
import { DestinasiV2, toDestinasiV2 } from './destinasi-v2.entity';

/**
 * Versi 2 hanya mencakup resource destinasi itu sendiri.
 * Sub-resource (ulasan, fasilitas, lengkap) tidak berubah sehingga tetap di v1.
 */
@ApiTags('Destinasi v2')
@Controller({ path: 'destinasi', version: '2' })
export class DestinasiV2Controller {
  constructor(private readonly destinasiClient: DestinasiClient) {}

  @Get()
  @ApiOperation({ summary: 'Daftar destinasi dengan struktur harga v2' })
  @ApiOkResponse({ type: [DestinasiV2] })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async findAll(@Query() query: QueryDestinasiDto): Promise<DestinasiV2[]> {
    const list = await this.destinasiClient.findAll(query);
    return list.map(toDestinasiV2);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail destinasi dengan hargaDewasa dan hargaAnak' })
  @ApiOkResponse({ type: DestinasiV2 })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiNotFoundResponse({ type: ErrorResponse })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DestinasiV2> {
    return toDestinasiV2(await this.destinasiClient.findOne(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Menambahkan destinasi (khusus admin)' })
  @ApiCreatedResponse({ type: DestinasiV2 })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiUnauthorizedResponse({ type: ErrorResponse })
  @ApiForbiddenResponse({ type: ErrorResponse })
  async create(@Body() dto: CreateDestinasiV2Dto): Promise<DestinasiV2> {
    const input = fromDestinasiV2Dto(dto) as DestinasiInput;
    return toDestinasiV2(await this.destinasiClient.create(input));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mengubah sebagian data destinasi (khusus admin)' })
  @ApiOkResponse({ type: DestinasiV2 })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiUnauthorizedResponse({ type: ErrorResponse })
  @ApiForbiddenResponse({ type: ErrorResponse })
  @ApiNotFoundResponse({ type: ErrorResponse })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDestinasiV2Dto,
  ): Promise<DestinasiV2> {
    return toDestinasiV2(await this.destinasiClient.update(id, fromDestinasiV2Dto(dto)));
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
  @ApiConflictResponse({ type: ErrorResponse })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.destinasiClient.remove(id);
  }
}
