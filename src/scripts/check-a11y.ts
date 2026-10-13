#!/usr/bin/env tsx
/**
 * Fail the build on axe-core serious/critical issues.
 * Walks every built HTML page in dark and light themes.
 * Run after `astro build` + pagefind + check-site.
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync as read } from 'node:fs';
import {
  A11Y_THEMES,
  formatA11yReport,
  isFailingImpact,
  listAuditPages,
  summarizeA11y,
  type A11yTheme,
  type A11yViolation,
} from '../lib/a11y-qa';
import { indexDist, SITE_ORIGIN_DEFAULT, writeDatedReport } from '../lib/site-qa';

const extra = process.argv.slice(2).find((arg) => !arg.startsWith('-'));
const root = join(process.cwd(), extra ?? 'dist');
const origin = process.env.SITE_URL || SITE_ORIGIN_DEFAULT;
const port = Number(process.env.A11Y_PORT || 43174);
const workers = Number(process.env.A11Y_WORKERS || 4);
const asOf = new Date().toISOString().slice(0, 10);

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.xml': 'application/xml; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
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

function startStaticServer(): Promise<{ close: () => Promise<void>; url: string }> {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const file = resolveFile(req.url ?? '/');
    if (!file) {
      res.statusCode = 404;
      res.end('not found');
      return;
    }
    res.statusCode = 200;
    res.setHeader('content-type', MIME[extname(file)] ?? 'application/octet-stream');
    res.end(readFileSync(file));
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () =>
          new Promise((done, fail) => {
            server.close((err) => (err ? fail(err) : done()));
          }),
      });
    });
  });
}

async function mapPool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor;
      cursor += 1;
      out[i] = await fn(items[i]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, () => worker()));
  return out;
}

async function main() {
  if (!existsSync(join(root, 'index.html'))) {
    console.error(`a11y QA: ${root}/index.html missing. Run astro build first.`);
    process.exitCode = 1;
    return;
  }

  const config = existsSync(join(process.cwd(), 'astro.config.mjs'))
    ? read(join(process.cwd(), 'astro.config.mjs'), 'utf8')
    : '';
  const index = indexDist(root, origin, config);
  const pages = listAuditPages(index);
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const violations: A11yViolation[] = [];

  try {
    await mapPool(pages, workers, async (path) => {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 900 },
      });
      const page = await context.newPage();
      page.setDefaultTimeout(90_000);
      await page.route('**/*', (route) => {
        const url = route.request().url();
        if (url.startsWith(server.url) || url.startsWith('data:') || url.startsWith('blob:')) {
          return route.continue();
        }
        return route.abort();
      });
      const href = `${server.url}${path === '/' ? '/' : path}`;
      await page.goto(href, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(50);
      for (const theme of A11Y_THEMES) {
        await page.evaluate((next: A11yTheme) => {
          document.documentElement.dataset.theme = next;
          document.documentElement.style.colorScheme = next;
          try {
            localStorage.setItem('theme', next);
          } catch {
            /* ignore */
          }
        }, theme);
        await page.waitForTimeout(80);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .exclude('.silicon')
          .exclude('.mermaid')
          .exclude('.astro-code')
          .analyze();
        for (const item of results.violations) {
          violations.push({
            id: item.id,
            impact: item.impact ?? 'moderate',
            help: item.help,
            helpUrl: item.helpUrl,
            theme,
            path,
            nodes: item.nodes.length,
            targets: item.nodes.slice(0, 6).flatMap((node) => node.target.map(String)),
          });
        }
      }
      await context.close();
    });
  } finally {
    await browser.close();
    await server.close();
  }

  const summary = summarizeA11y(violations);
  const report = formatA11yReport({ asOf, pages: pages.length, themes: A11Y_THEMES, violations });
  console.log(report.trim());
  for (const file of writeDatedReport('a11y', report, asOf)) {
    console.log(`wrote ${file}`);
  }
  console.log(
    `a11y QA: ${pages.length} pages × ${A11Y_THEMES.length} themes · critical ${summary.critical} · serious ${summary.serious} · moderate ${summary.moderate} · minor ${summary.minor}`,
  );
  if (violations.some((row) => isFailingImpact(row.impact))) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
