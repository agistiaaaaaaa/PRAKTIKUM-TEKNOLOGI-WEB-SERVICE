// Harus diimpor sebelum AppModule: ConfigModule.forRoot membaca environment saat modul dimuat.
// Port khusus test agar tidak bentrok dengan stack development yang mungkin sedang berjalan.
export const TEST_DESTINASI_PORT = 15001;
export const TEST_RESERVASI_PORT = 15002;

process.env.SERVICE_DESTINASI_HOST = '127.0.0.1';
process.env.SERVICE_DESTINASI_PORT = String(TEST_DESTINASI_PORT);
process.env.SERVICE_RESERVASI_HOST = '127.0.0.1';
process.env.SERVICE_RESERVASI_PORT = String(TEST_RESERVASI_PORT);
