import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.env.SHOT_BASE || 'http://127.0.0.1:43147';
const out = process.env.SHOT_DIR || '/opt/cursor/artifacts/design/before';
const pages = [
  ['home', '/'],
  ['calculator', '/calculator'],
  ['budget', '/budget'],
  ['abliterated', '/abliterated'],
  ['stacks', '/stacks'],
  ['backends', '/backends'],
  ['gpus', '/gpus'],
  ['rocm', '/rocm'],
];

await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME || '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

async function shoot(width, height, suffix) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  for (const [name, path] of pages) {
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${out}/${name}-${suffix}.png`, fullPage: true });
    console.log(`wrote ${name}-${suffix}.png`);
  }
  await context.close();
}

await shoot(1440, 900, 'desktop');
await shoot(390, 844, 'mobile');
await browser.close();
