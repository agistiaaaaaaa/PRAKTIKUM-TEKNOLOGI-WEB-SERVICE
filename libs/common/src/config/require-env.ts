/**
 * Validasi sederhana untuk ConfigModule.forRoot({ validate }):
 * aplikasi langsung berhenti dengan pesan jelas bila variabel wajib belum diisi.
 */
export function requireEnv(...keys: string[]) {
  return (config: Record<string, unknown>) => {
    const missing = keys.filter((key) => !config[key]);
    if (missing.length > 0) {
      throw new Error(`Environment variable wajib belum diisi: ${missing.join(', ')}`);
    }
    return config;
  };
}
