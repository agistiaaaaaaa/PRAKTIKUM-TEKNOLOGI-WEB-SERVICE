import { INestApplication, VersioningType } from '@nestjs/common';
import { ApiInfo, configureHttpApp } from '@wisataku/common';

export const GATEWAY_API_INFO: ApiInfo = {
  title: 'WisataKu API Gateway',
  description:
    'Titik masuk tunggal WisataKu. Meneruskan request ke service-destinasi dan ' +
    'service-reservasi melalui TCP. Mendukung URI versioning: /v1 (hargaTiket) dan ' +
    '/v2 (hargaDewasa, hargaAnak); path tanpa prefix versi setara v1.',
  version: '2.0',
};

/** Dipakai main.ts dan e2e test. Versioning harus aktif sebelum dokumen Swagger dibuat. */
export function setupGateway(app: INestApplication): void {
  app.enableVersioning({ type: VersioningType.URI });
  configureHttpApp(app, GATEWAY_API_INFO);
}
