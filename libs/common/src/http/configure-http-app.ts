import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export interface ApiInfo {
  title: string;
  description: string;
  version: string;
}

export function buildOpenApiDocument(app: INestApplication, info: ApiInfo): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle(info.title)
    .setDescription(info.description)
    .setVersion(info.version)
    .addBearerAuth()
    .build();
  return SwaggerModule.createDocument(app, config);
}

/**
 * Konfigurasi yang sama untuk main.ts dan e2e test: validasi DTO global
 * dan Swagger UI di /api/docs (JSON di /api/docs-json, YAML di /api/docs-yaml).
 */
export function configureHttpApp(app: INestApplication, info: ApiInfo): void {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  SwaggerModule.setup('api/docs', app, buildOpenApiDocument(app, info));
}
