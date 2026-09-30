/**
 * Mengubah laporan Markdown di docs/ menjadi PDF memakai Chrome/Edge headless.
 *
 *   npm run docs:pdf                                  # semua laporan
 *   npm run docs:pdf -- docs/tugas-1/laporan-tugas-1.md
 *
 * Sampul mengikuti format laporan praktikum STMIK Lombok. Nomor tugas dan judul
 * diambil dari front matter (tugas, judul, subjudul); nama dan NIM dari
 * docs/identitas.json. Lokasi browser dapat diatur dengan environment CHROME_PATH.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { marked } from 'marked';

const REPORTS = [
  'docs/tugas-1/laporan-tugas-1.md',
  'docs/tugas-2/laporan-tugas-2.md',
  'docs/tugas-3/laporan-tugas-3.md',
  'docs/tugas-4/laporan-keamanan-testing.md',
  'docs/tugas-5/laporan-tugas-5.md',
  'docs/tugas-6/laporan-final.md',
];

const LOGO = resolve('docs/assets/logo-stmik-lombok.png');

const INSTITUSI = [
  'PROGRAM STUDI TEKNIK INFORMATIKA',
  'SEKOLAH TINGGI MANAJEMEN INFORMATIKA DAN KOMPUTER',
  'STMIK LOMBOK',
  'PRAYA',
];

const BROWSERS = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

// Margin dan tipografi mengikuti laporan praktikum acuan: A4, kiri 4 cm, sisi lain 3 cm,
// Times New Roman 12 pt, spasi 1,5. Sampul tidak bernomor; isi dimulai dari halaman 1.
const STYLE = `
  @page {
    size: A4;
    margin: 3cm 3cm 3cm 4cm;
    @bottom-center { content: counter(page); font-family: 'Times New Roman', Times, serif; font-size: 11pt; }
  }
  @page cover {
    counter-increment: page 0;
    @bottom-center { content: none; }
  }
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; color: #000; margin: 0; }
  h1 { font-size: 14pt; margin: 1.3em 0 0.5em; break-after: avoid; }
  h2 { font-size: 12pt; margin: 1.1em 0 0.4em; break-after: avoid; }
  h3 { font-size: 12pt; font-style: italic; margin: 1em 0 0.3em; break-after: avoid; }
  p, li { text-align: justify; orphans: 2; widows: 2; }
  table { border-collapse: collapse; width: 100%; margin: 0.8em 0; font-size: 10.5pt; line-height: 1.35; break-inside: auto; }
  th, td { border: 1px solid #000; padding: 4px 6px; vertical-align: top; text-align: left; }
  th { background: #efefef; }
  tr { break-inside: avoid; }
  thead { display: table-header-group; }
  code { font-family: Consolas, 'Courier New', monospace; font-size: 9.5pt; overflow-wrap: anywhere; }
  td code, th code { overflow-wrap: break-word; }
  pre { border: 1px solid #999; padding: 8px 10px; font-size: 9pt; line-height: 1.35; white-space: pre-wrap; break-inside: avoid; }
  img { display: block; max-width: 100%; max-height: 15cm; margin: 0.8em auto; break-inside: avoid; }
  blockquote { border-left: 3px solid #999; margin: 0.8em 0; padding: 0.2em 0.8em; }

  .cover { page: cover; height: 23.6cm; display: flex; flex-direction: column; align-items: center; text-align: center; break-after: page; line-height: 1.15; }
  .cover .judul { font-size: 16pt; font-weight: bold; text-transform: uppercase; }
  .cover .judul p { margin: 0; text-align: center; }
  .cover .judul .tugas { margin-top: 0; }
  .cover .judul .utama { margin-top: 12pt; }
  .cover img.logo { width: 11.25cm; max-height: none; margin: 24pt auto 6pt; }
  .cover .penyusun { margin-top: 18pt; line-height: 1.5; }
  .cover .penyusun p { margin: 0; text-align: center; }
  .cover .penyusun .nama, .cover .penyusun .nim { font-weight: bold; }
  .cover .institusi { margin-top: auto; font-weight: bold; line-height: 1.5; }
  .cover .institusi p { margin: 0; text-align: center; }
`;

function findBrowser() {
  const browser = BROWSERS.find((path) => existsSync(path));
  if (!browser) {
    throw new Error('Chrome/Edge tidak ditemukan. Atur CHROME_PATH ke lokasi browser.');
  }
  return browser;
}

function parseFrontMatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    return { meta: {}, body: source };
  }
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^(\w+):\s*"?(.*?)"?\s*$/);
    if (pair) meta[pair[1]] = pair[2];
  }
  return { meta, body: source.slice(match[0].length) };
}

function escapeHtml(text) {
  return String(text).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );
}

function coverHtml(meta, identity) {
  const nama = identity.nama?.trim() || '[NAMA MAHASISWA]';
  const nim = identity.nim?.trim() || '[NIM]';
  const tahun = identity.tahun?.trim() || String(new Date().getFullYear());
  const judul = (meta.judul ?? '').split('|').map((line) => `<p>${escapeHtml(line.trim())}</p>`);

  return `<section class="cover">
    <div class="judul">
      <p>LAPORAN PRAKTIKUM</p>
      <p class="tugas">TUGAS ${escapeHtml(meta.tugas ?? '')}</p>
      <div class="utama">${judul.join('')}</div>
      <p>${escapeHtml(meta.subjudul ?? '')}</p>
    </div>
    <img class="logo" src="${pathToFileURL(LOGO).href}" alt="Logo STMIK Lombok">
    <div class="penyusun">
      <p>Disusun oleh:</p>
      <p class="nama">${escapeHtml(nama)}</p>
      <p class="nim">NIM: ${escapeHtml(nim)}</p>
    </div>
    <div class="institusi">
      ${INSTITUSI.map((line) => `<p>${line}</p>`).join('')}
      <p>${escapeHtml(tahun)}</p>
    </div>
  </section>`;
}

// Path seperti /destinasi/:id/fasilitas di kolom tabel yang sempit hanya boleh
// terpotong setelah "/", bukan di tengah kata.
function allowBreakAfterSlash(html) {
  return html.replace(/<table>[\s\S]*?<\/table>/g, (table) =>
    table.replace(
      /<code>([^<]*)<\/code>/g,
      (_, code) => `<code>${code.replaceAll('/', '/<wbr>')}</code>`,
    ),
  );
}

function buildPdf(browser, mdPath, identity, workDir) {
  const absolute = resolve(mdPath);
  const { meta, body } = parseFrontMatter(readFileSync(absolute, 'utf8'));
  if (!meta.tugas || !meta.judul) {
    throw new Error(`${mdPath}: front matter "tugas" dan "judul" wajib diisi`);
  }
  const baseHref = pathToFileURL(dirname(absolute) + '/').href;
  const html = `<!doctype html><html lang="id"><head><meta charset="utf-8">
    <base href="${baseHref}"><title>Laporan Praktikum Tugas ${escapeHtml(meta.tugas)}</title>
    <style>${STYLE}</style></head><body>
    ${coverHtml(meta, identity)}
    ${allowBreakAfterSlash(marked.parse(body))}
    </body></html>`;

  const htmlPath = join(workDir, basename(mdPath, '.md') + '.html');
  const pdfPath = absolute.replace(/\.md$/, '.pdf');
  writeFileSync(htmlPath, html);
  execFileSync(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--allow-file-access-from-files',
      `--user-data-dir=${join(workDir, 'profile')}`,
      '--no-pdf-header-footer',
      `--print-to-pdf=${pdfPath}`,
      pathToFileURL(htmlPath).href,
    ],
    { stdio: 'ignore', timeout: 120_000 },
  );
  if (!existsSync(pdfPath)) {
    throw new Error(`PDF gagal dibuat: ${pdfPath}`);
  }
  console.log(`${mdPath} -> ${pdfPath.slice(process.cwd().length + 1)}`);
}

const identityFile = resolve('docs/identitas.json');
const identity = existsSync(identityFile) ? JSON.parse(readFileSync(identityFile, 'utf8')) : {};
const targets = process.argv.slice(2).length ? process.argv.slice(2) : REPORTS;
const browser = findBrowser();
const workDir = mkdtempSync(join(tmpdir(), 'wisataku-pdf-'));
try {
  for (const target of targets) buildPdf(browser, target, identity, workDir);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
