// Load test k6 sesuai modul Bab 5.3.6: 50 pengguna virtual selama 30 detik ke GET /destinasi.
// Jalankan: k6 run load-test.js
// Target lain (misalnya gateway di VPS): k6 run -e BASE_URL=http://IP-VPS:3000 load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/destinasi`);
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
