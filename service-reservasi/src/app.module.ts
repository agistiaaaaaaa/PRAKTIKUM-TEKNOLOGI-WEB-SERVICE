import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule, requireEnv } from '@wisataku/common';
import { ReservasiModule } from './reservasi/reservasi.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: requireEnv('DATABASE_URL') }),
    PrismaModule,
    ReservasiModule,
  ],
})
export class AppModule {}
