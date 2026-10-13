#!/usr/bin/env tsx
/**
 * Build 1200×630 OG / Twitter share PNGs from the OG_CARDS catalog.
 * Measured ledes come from official run cards. Never invent tok/s.
 *
 *   npm run og
 */

import { existsSync } from 'node:fs';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { OG_HEIGHT, OG_WIDTH, assertOgValid, ogCardHtml, renderOgCards } from '../lib/og';
import { runs } from '../lib/run-card-data';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = join(root, 'public/og');
const fontFile = join(root, 'public/fonts/geist-latin.woff2');
const chrome = '/usr/local/bin/google-chrome';

async function launchBrowser() {
  const args = ['--no-sandbox', '--disable-dev-shm-usage'];
  if (existsSync(chrome)) {
    return chromium.launch({ executablePath: chrome, args });
  }
  return chromium.launch({ args });
}

async function main() {
  const errors = assertOgValid(runs);
  if (errors.length) {
    console.error(`og: catalog invalid\n${errors.map((row) => `  ${row}`).join('\n')}`);
    process.exitCode = 1;
    return;
  }
  if (!existsSync(fontFile)) {
    console.error(`og: missing ${fontFile}`);
    process.exitCode = 1;
    return;
  }

  await mkdir(outDir, { recursive: true });
  const cards = renderOgCards(runs);
  const fontHref = `file://${fontFile}`;
  const browser = await launchBrowser();
  const page = await browser.newPage({
    viewport: { width: OG_WIDTH, height: OG_HEIGHT },
    deviceScaleFactor: 1,
  });

  try {
    for (const card of cards) {
      const tmp = join(tmpdir(), `amdai-og-${card.slug}.html`);
      await writeFile(tmp, ogCardHtml({ title: card.title, lede: card.lede, fontHref }));
      await page.goto(`file://${tmp}`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: join(outDir, `${card.slug}.png`), type: 'png' });
      await unlink(tmp).catch(() => {});
      console.log(`og ${card.slug} · ${card.lede}`);
    }
  } finally {
    await browser.close();
  }
  console.log(`og: wrote ${cards.length} cards to public/og/ (${OG_WIDTH}×${OG_HEIGHT})`);
}

await main();
