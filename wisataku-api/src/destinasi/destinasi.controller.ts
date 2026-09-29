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
import {
  CreateDestinasiDto,
  Destinasi,
  DestinasiService,
  Fasilitas,
  FasilitasService,
  QueryDestinasiDto,
  toDestinasiV1,
  Ulasan,
  UlasanService,
  UpdateDestinasiDto,
} from '@wisataku/domain';

@ApiTags('Destinasi')
@Controller('destinasi')
export class DestinasiController {
  constructor(
    private readonly destinasiService: DestinasiService,
    private readonly ulasanService: UlasanService,
    private readonly fasilitasService: FasilitasService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Menampilkan daftar destinasi, dapat difilter berdasarkan kategori' })
  @ApiOkResponse({ type: [Destinasi] })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Query parameter tidak valid' })
  async findAll(@Query() query: QueryDestinasiDto): Promise<Destinasi[]> {
    const list = await this.destinasiService.findAll(query);
    return list.map(toDestinasiV1);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail satu destinasi' })
  @ApiOkResponse({ type: Destinasi })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'id bukan angka' })
  @ApiNotFoundResponse({ type: ErrorResponse })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Destinasi> {
    return toDestinasiV1(await this.destinasiService.findOne(id));
  }

  @Get(':id/ulasan')
  @ApiOperation({ summary: 'Ulasan milik destinasi tertentu, terbaru lebih dulu' })
  @ApiOkResponse({ type: [Ulasan] })
  @ApiNotFoundResponse({ type: ErrorResponse })
  async findUlasan(@Param('id', ParseIntPipe) id: number): Promise<Ulasan[]> {
    await this.destinasiService.findOne(id);
    return this.ulasanService.findByDestinasi(id);
  }

  @Get(':id/fasilitas')
  @ApiOperation({ summary: 'Fasilitas yang tersedia di destinasi tertentu' })
  @ApiOkResponse({ type: [Fasilitas] })
  @ApiNotFoundResponse({ type: ErrorResponse })
  async findFasilitas(@Param('id', ParseIntPipe) id: number): Promise<Fasilitas[]> {
    await this.destinasiService.findOne(id);
    return this.fasilitasService.findByDestinasi(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Menambahkan destinasi baru (khusus admin)' })
  @ApiCreatedResponse({ type: Destinasi })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Data tidak valid' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Token tidak ada/tidak valid' })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Bukan admin' })
  async create(@Body() dto: CreateDestinasiDto): Promise<Destinasi> {
    return toDestinasiV1(await this.destinasiService.create(dto));
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
    return toDestinasiV1(await this.destinasiService.update(id, dto));
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
    return this.destinasiService.remove(id);
  }
}
