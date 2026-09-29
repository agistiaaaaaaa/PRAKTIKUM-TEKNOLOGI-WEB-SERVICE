import { ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { AuthModule } from '@wisataku/auth';
import { graphqlOptions, PrismaModule, requireEnv } from '@wisataku/common';
import { join } from 'path';
import { DestinasiModule } from './destinasi/destinasi.module';
import { FasilitasModule } from './fasilitas/fasilitas.module';
import { ReservasiModule } from './reservasi/reservasi.module';
import { UlasanModule } from './ulasan/ulasan.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: requireEnv('DATABASE_URL', 'JWT_SECRET') }),
    GraphQLModule.forRoot<ApolloDriverConfig>(
      graphqlOptions(join(process.cwd(), 'wisataku-api/src/schema.gql')),
    ),
    PrismaModule,
    AuthModule,
    DestinasiModule,
    UlasanModule,
    FasilitasModule,
    ReservasiModule,
  ],
})
export class AppModule {}
