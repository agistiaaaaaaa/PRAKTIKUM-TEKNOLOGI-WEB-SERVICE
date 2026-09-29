import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthUser, CurrentUser, JwtAuthGuard, Role, Roles, RolesGuard } from '@wisataku/auth';
import { ErrorResponse } from '@wisataku/common';
import { CreateReservasiDto, Reservasi, ReservasiService } from '@wisataku/domain';

@ApiTags('Reservasi')
@ApiBearerAuth()
@Controller('reservasi')
export class ReservasiController {
  constructor(private readonly reservasiService: ReservasiService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Wisatawan)
  @ApiOperation({ summary: 'Membuat reservasi tiket kunjungan (wisatawan login)' })
  @ApiCreatedResponse({ type: Reservasi })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Data tidak valid / tanggal lampau' })
  @ApiUnauthorizedResponse({ type: ErrorResponse })
  @ApiForbiddenResponse({ type: ErrorResponse, description: 'Hanya role wisatawan' })
  @ApiNotFoundResponse({ type: ErrorResponse, description: 'Destinasi tidak ditemukan' })
  create(@Body() dto: CreateReservasiDto, @CurrentUser() user: AuthUser): Promise<Reservasi> {
    return this.reservasiService.create(user.userId, dto);
  }
}
