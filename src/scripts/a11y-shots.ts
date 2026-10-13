#!/usr/bin/env tsx
/**
 * Before/after mobile screenshots of the widest pages.
 * Usage: tsx src/scripts/a11y-shots.ts before|after
 */

import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';
import { A11Y_SHOT_PAGES, A11Y_SHOT_WIDTHS } from '../lib/a11y-qa';

const label = (process.argv[2] === 'after' ? 'after' : 'before') as 'before' | 'after';
const root = join(process.cwd(), 'dist');
const port = Number(process.env.A11Y_SHOT_PORT || 43175);
const dirs = [
  '/opt/cursor/artifacts/a11y-screenshots',
  join(process.cwd(), 'artifacts/a11y-screenshots'),
];

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.json': 'application/json',
};

function resolveFile(pathname: string): string | null {
  const clean = decodeURIComponent(pathname.split('?')[0] ?? '/');
  const rel = clean.replace(/^\/+/, '');
  const candidates = rel
    ? [join(root, rel), join(root, rel, 'index.html'), join(root, `${rel}.html`)]
    : [join(root, 'index.html')];
  for (const file of candidates) {
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
}

async function main() {
  if (!existsSync(join(root, 'index.html'))) {
    console.error('a11y shots: dist/index.html missing');
    process.exitCode = 1;
    return;
  }
  for (const dir of dirs) mkdirSync(dir, { recursive: true });

  const server = createServer((req, res) => {
    const file = resolveFile(req.url ?? '/');
    if (!file) {
      res.statusCode = 404;
      res.end('not found');
      return;
    }
    res.setHeader('content-type', MIME[extname(file)] ?? 'application/octet-stream');
    res.end(readFileSync(file));
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve());
  });

  const browser = await chromium.launch({ headless: true });
  const written: string[] = [];
  try {
    for (const path of A11Y_SHOT_PAGES) {
      for (const width of A11Y_SHOT_WIDTHS) {
        const page = await browser.newPage({
          viewport: { width, height: width < 768 ? 800 : 1024 },
          deviceScaleFactor: 1,
        });
        await page.goto(`http://127.0.0.1:${port}${path}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(120);
        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        const slug = `${label}-${path.replace(/^\//, '').replaceAll('/', '-') || 'home'}-${width}`;
        for (const dir of dirs) {
          const file = join(dir, `${slug}.png`);
          await page.screenshot({ path: file, fullPage: false, animations: 'disabled' });
          written.push(file);
        }
        if (overflow.scrollWidth > overflow.clientWidth + 1) {
          console.log(`overflow ${path} @${width}: ${overflow.scrollWidth} > ${overflow.clientWidth}`);
        }
        await page.close();
      }
    }
  } finally {
    await browser.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  const index = [`# a11y screenshots · ${label}`, '', ...written.map((file) => `- ${file}`), ''].join('\n');
  for (const dir of dirs) writeFileSync(join(dir, `${label}-index.md`), index);
  console.log(`wrote ${written.length} ${label} screenshots`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
