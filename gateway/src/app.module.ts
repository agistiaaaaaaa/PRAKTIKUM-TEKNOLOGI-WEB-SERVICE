import { ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { AuthModule } from '@wisataku/auth';
import { graphqlOptions, PrismaModule, requireEnv } from '@wisataku/common';
import { join } from 'path';
import { DestinasiModule } from './destinasi/destinasi.module';
import { ReservasiModule } from './reservasi/reservasi.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: requireEnv('DATABASE_URL', 'JWT_SECRET') }),
    GraphQLModule.forRoot<ApolloDriverConfig>(
      graphqlOptions(join(process.cwd(), 'gateway/src/schema.gql')),
    ),
    // Gateway hanya mengakses tabel User untuk register/login
    PrismaModule,
    AuthModule,
    DestinasiModule,
    ReservasiModule,
  ],
})
export class AppModule {}
