import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule, requireEnv } from '@wisataku/common';
import { DestinasiModule } from './destinasi/destinasi.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: requireEnv('DATABASE_URL') }),
    PrismaModule,
    DestinasiModule,
  ],
})
export class AppModule {}
