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
  return withErrorExamples(SwaggerModule.createDocument(app, config));
}

/**
 * Semua respons error memakai skema ErrorResponse yang contohnya 404. Agar contoh 400/401/403/409
 * di Swagger tidak menampilkan body 404, setiap respons error diberi contoh sesuai kodenya
 * (pesan diambil dari respons asli API). Hanya dokumentasi; perilaku API tidak berubah.
 */
function withErrorExamples(document: OpenAPIObject): OpenAPIObject {
  for (const [path, item] of Object.entries(document.paths)) {
    for (const [method, operation] of Object.entries(item)) {
      const op = operation as { responses?: Record<string, any>; requestBody?: unknown };
      if (!op?.responses) continue;
      for (const [status, response] of Object.entries(op.responses)) {
        const example = errorExample(method, path, Number(status), Boolean(op.requestBody));
        const media = response?.content?.['application/json'];
        if (example && media) media.example = example;
      }
    }
  }
  return document;
}

/** Pesan validasi 400 per endpoint (prefix /v1 gateway disamakan dengan monolit). */
const BAD_REQUEST_MESSAGES: Record<string, string | string[]> = {
  'post /auth/register': [
    'email must be an email',
    'password must be longer than or equal to 8 characters',
  ],
  'post /auth/login': ['email must be an email', 'password should not be empty'],
  'get /destinasi': ['limit must not be greater than 100', 'limit must be an integer number'],
  'post /destinasi': ['nama should not be empty', 'hargaTiket must not be less than 0'],
  'patch /destinasi/{id}': ['hargaTiket must not be less than 0'],
  'post /reservasi': 'tanggalKunjungan tidak boleh sebelum hari ini',
};

function errorExample(
  method: string,
  path: string,
  status: number,
  hasBody: boolean,
): object | undefined {
  switch (status) {
    case 400: {
      const message =
        BAD_REQUEST_MESSAGES[`${method} ${path.replace(/^\/v1(?=\/)/, '')}`] ??
        (!hasBody && path.includes('{id}')
          ? 'Validation failed (numeric string is expected)'
          : undefined);
      return message ? { message, error: 'Bad Request', statusCode: 400 } : undefined;
    }
    case 401:
      return path.endsWith('/auth/login')
        ? { message: 'Email atau password salah', error: 'Unauthorized', statusCode: 401 }
        : { message: 'Unauthorized', statusCode: 401 };
    case 403:
      return {
        message: 'Anda tidak berwenang mengakses resource ini',
        error: 'Forbidden',
        statusCode: 403,
      };
    case 409:
      return path.endsWith('/auth/register')
        ? { message: 'Email sudah terdaftar', error: 'Conflict', statusCode: 409 }
        : {
            message: 'Destinasi tidak dapat dihapus karena sudah memiliki reservasi',
            error: 'Conflict',
            statusCode: 409,
          };
    case 503:
      return {
        message: 'Layanan internal sedang tidak dapat dihubungi',
        error: 'Service Unavailable',
        statusCode: 503,
      };
    default:
      return undefined;
  }
}

/**
 * Konfigurasi yang sama untuk main.ts dan e2e test: validasi DTO global
 * dan Swagger UI di /api/docs (JSON di /api/docs-json, YAML di /api/docs-yaml).
 */
export function configureHttpApp(app: INestApplication, info: ApiInfo): void {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  SwaggerModule.setup('api/docs', app, buildOpenApiDocument(app, info));
}
