/**
 * Mengubah laporan Markdown di docs/ menjadi PDF memakai Chrome/Edge headless.
 *
 *   npm run docs:pdf                                  # semua laporan
 *   npm run docs:pdf -- docs/tugas-1/laporan-tugas-1.md
 *
 * Identitas pada halaman sampul dibaca dari docs/identitas.json.
 * Lokasi browser dapat diatur dengan environment CHROME_PATH.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { marked } from 'marked';

const REPORTS = [
  'docs/tugas-1/laporan-tugas-1.md',
  'docs/tugas-3/laporan-tugas-3.md',
  'docs/tugas-4/laporan-keamanan-testing.md',
  'docs/tugas-5/laporan-tugas-5.md',
  'docs/tugas-6/laporan-final.md',
];

const BROWSERS = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const STYLE = `
  @page { size: A4; margin: 2.5cm 2.2cm 2.5cm 2.5cm; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; color: #000; }
  h1 { font-size: 15pt; margin: 1.4em 0 0.5em; break-after: avoid; }
  h2 { font-size: 13pt; margin: 1.2em 0 0.4em; break-after: avoid; }
  h3 { font-size: 12pt; margin: 1em 0 0.3em; break-after: avoid; }
  p, li { text-align: justify; }
  table { border-collapse: collapse; width: 100%; margin: 0.8em 0; font-size: 10.5pt; line-height: 1.35; break-inside: auto; }
  th, td { border: 1px solid #444; padding: 4px 6px; vertical-align: top; text-align: left; }
  th { background: #e8e8e8; }
  tr { break-inside: avoid; }
  code { font-family: Consolas, 'Courier New', monospace; font-size: 9.5pt; }
  pre { background: #f4f4f4; border: 1px solid #ccc; padding: 8px 10px; font-size: 9pt; line-height: 1.35; white-space: pre-wrap; break-inside: avoid; }
  img { display: block; max-width: 100%; max-height: 16cm; margin: 0.8em auto; }
  blockquote { border-left: 3px solid #999; margin: 0.8em 0; padding: 0.2em 0.8em; color: #333; }
  .cover { height: 24cm; display: flex; flex-direction: column; justify-content: center; text-align: center; break-after: page; }
  .cover h1 { font-size: 20pt; margin: 0 0 0.4em; }
  .cover .subtitle { font-size: 13pt; margin-bottom: 3cm; }
  .cover .identity { font-size: 12pt; line-height: 1.8; }
  .cover .date { margin-top: 3cm; }
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
  const rows = [
    ['Nama', identity.nama],
    ['NIM', identity.nim],
    ['Kelas', identity.kelas],
    ['Dosen Pengampu', identity.dosen],
  ].filter(([, value]) => value);
  const identityHtml = rows.length
    ? rows.map(([label, value]) => `${label}: ${escapeHtml(value)}`).join('<br>')
    : 'Nama / NIM: (isi docs/identitas.json lalu jalankan ulang npm run docs:pdf)';
  const date = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return `<section class="cover">
    <h1>${escapeHtml(meta.title ?? '')}</h1>
    <div class="subtitle">${escapeHtml(meta.subtitle ?? '')}</div>
    <div class="identity">${identityHtml}</div>
    <div class="date">${escapeHtml(identity.institusi ?? '')}<br>${date}</div>
  </section>`;
}

function buildPdf(browser, mdPath, identity, workDir) {
  const absolute = resolve(mdPath);
  const { meta, body } = parseFrontMatter(readFileSync(absolute, 'utf8'));
  const baseHref = pathToFileURL(dirname(absolute) + '/').href;
  const html = `<!doctype html><html lang="id"><head><meta charset="utf-8">
    <base href="${baseHref}"><title>${escapeHtml(meta.title ?? basename(mdPath))}</title>
    <style>${STYLE}</style></head><body>
    ${coverHtml(meta, identity)}
    ${marked.parse(body)}
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
