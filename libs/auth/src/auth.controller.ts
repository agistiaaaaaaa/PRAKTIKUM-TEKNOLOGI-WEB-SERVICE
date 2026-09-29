import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponse } from '@wisataku/common';
import { AuthService } from './auth.service';
import { LoginResponse, RegisterResponse } from './dto/auth-response';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrasi akun wisatawan baru' })
  @ApiCreatedResponse({ type: RegisterResponse })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Data tidak valid' })
  @ApiConflictResponse({ type: ErrorResponse, description: 'Email sudah terdaftar' })
  register(@Body() dto: RegisterDto): Promise<RegisterResponse> {
    return this.authService.register(dto.nama, dto.email, dto.password);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login dan menerima token JWT' })
  @ApiOkResponse({ type: LoginResponse })
  @ApiBadRequestResponse({ type: ErrorResponse, description: 'Data tidak valid' })
  @ApiUnauthorizedResponse({ type: ErrorResponse, description: 'Email atau password salah' })
  login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(dto.email, dto.password);
  }
}
