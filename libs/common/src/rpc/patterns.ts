// Nama message pattern dipakai bersama oleh gateway (pengirim) dan microservice (penerima),
// sehingga salah ketik terdeteksi saat kompilasi.

export const DESTINASI_PATTERNS = {
  findAll: 'destinasi.findAll',
  findOne: 'destinasi.findOne',
  create: 'destinasi.create',
  update: 'destinasi.update',
  remove: 'destinasi.remove',
} as const;

export const ULASAN_PATTERNS = {
  findByDestinasi: 'ulasan.findByDestinasi',
  create: 'ulasan.create',
} as const;

export const FASILITAS_PATTERNS = {
  findByDestinasi: 'fasilitas.findByDestinasi',
} as const;

export const RESERVASI_PATTERNS = {
  create: 'reservasi.create',
} as const;
