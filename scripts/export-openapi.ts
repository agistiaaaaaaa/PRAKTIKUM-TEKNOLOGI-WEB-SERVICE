/**
 * Mengekspor dokumen OpenAPI langsung dari kode (decorator Swagger), tanpa menjalankan server.
 * Mode preview membuat Nest hanya membaca metadata modul, sehingga database tidak perlu hidup.
 *
 *   npm run openapi:export
 */
import { INestApplication, Type, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ApiInfo, buildOpenApiDocument } from '@wisataku/common';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { stringify } from 'yaml';
import { AppModule as GatewayModule } from '../gateway/src/app.module';
import { GATEWAY_API_INFO } from '../gateway/src/setup';
import { API_INFO } from '../wisataku-api/src/api-info';
import { AppModule as ApiModule } from '../wisataku-api/src/app.module';

interface Target {
  module: Type<unknown>;
  info: ApiInfo;
  outDir: string;
  fileName: string;
  prepare?: (app: INestApplication) => void;
}

const targets: Target[] = [
  { module: ApiModule, info: API_INFO, outDir: 'docs/tugas-2', fileName: 'openapi' },
  {
    module: GatewayModule,
    info: GATEWAY_API_INFO,
    outDir: 'docs/tugas-5',
    fileName: 'openapi-gateway',
    prepare: (app) => app.enableVersioning({ type: VersioningType.URI }),
  },
];

async function main() {
  for (const target of targets) {
    const app = await NestFactory.create(target.module, { preview: true, logger: false });
    target.prepare?.(app);
    const document = buildOpenApiDocument(app, target.info);
    await app.close();

    const outDir = join(process.cwd(), target.outDir);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(
      join(outDir, `${target.fileName}.json`),
      JSON.stringify(document, null, 2) + '\n',
    );
    writeFileSync(join(outDir, `${target.fileName}.yaml`), stringify(document));
    console.log(
      `${target.outDir}/${target.fileName}.{json,yaml}: ${Object.keys(document.paths).length} path`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
