#!/usr/bin/env tsx
/**
 * Fail the build on Core Web Vitals / byte-budget misses.
 * Static scan of every page, then Playwright mobile-throttled CWV
 * on the required sample. Run after astro build + pagefind.
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { existsSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';
import { indexDist, SITE_ORIGIN_DEFAULT, writeDatedReport } from '../lib/site-qa';
import {
  checkPageBytes,
  checkPageVitals,
  checkSampleCoverage,
  collectStaticPages,
  formatPerfReport,
  listLiveSample,
  performanceScore,
  type PerfPage,
  type PerfVitals,
} from '../lib/perf-qa';

const extra = process.argv.slice(2).find((arg) => !arg.startsWith('-'));
const root = join(process.cwd(), extra ?? 'dist');
const origin = process.env.SITE_URL || SITE_ORIGIN_DEFAULT;
const port = Number(process.env.PERF_PORT || 43182);
const workers = Number(process.env.PERF_WORKERS || 3);
const skipLive = process.env.PERF_STATIC_ONLY === '1';
const asOf = new Date().toISOString().slice(0, 10);

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
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

const VITALS_PROBE = `(() => {
  const out = { lcpMs: 0, fcpMs: 0, cls: 0, tbtMs: 0 };
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') out.lcpMs = entry.startTime;
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') out.fcpMs = entry.startTime;
        if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) out.cls += entry.value;
        if (entry.entryType === 'longtask') out.tbtMs += Math.max(0, entry.duration - 50);
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') out.fcpMs = entry.startTime;
      }
    }).observe({ type: 'paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) out.cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        out.tbtMs += Math.max(0, entry.duration - 50);
      }
    }).observe({ type: 'longtask', buffered: true });
  } catch {
    /* observers optional */
  }
  window.__amdaiVitals = out;
})()`;

async function measurePage(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  url: string,
): Promise<PerfVitals> {
  const context = await browser.newContext({
    viewport: { width: 412, height: 823, isMobile: true, hasTouch: true },
    userAgent:
      'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 1.75,
  });
  try {
    const page = await context.newPage();
    page.setDefaultTimeout(60_000);
    const client = await context.newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: Math.round((1.6 * 1024 * 1024) / 8),
      uploadThroughput: Math.round((750 * 1024) / 8),
      connectionType: 'cellular4g',
    });
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.addInitScript({ content: VITALS_PROBE });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2800);
    const raw = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      const paints = performance.getEntriesByType('paint');
      const fcp = paints.find((entry) => entry.name === 'first-contentful-paint')?.startTime ?? 0;
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      const lcp = lcpEntries.at(-1)?.startTime ?? 0;
      const stored = (window as unknown as { __amdaiVitals?: { lcpMs: number; fcpMs: number; cls: number; tbtMs: number } })
        .__amdaiVitals;
      return {
        lcpMs: stored?.lcpMs || lcp || nav?.loadEventEnd || 0,
        fcpMs: stored?.fcpMs || fcp || 0,
        cls: stored?.cls ?? 0,
        tbtMs: stored?.tbtMs ?? 0,
      };
    });
    return {
      ...raw,
      performance: performanceScore(raw),
    };
  } finally {
    await context.close();
  }
}

async function main() {
  if (!existsSync(join(root, 'index.html'))) {
    console.error(`perf QA: ${root}/index.html missing. Run astro build first.`);
    process.exitCode = 1;
    return;
  }

  const config = existsSync(join(process.cwd(), 'astro.config.mjs'))
    ? readFileSync(join(process.cwd(), 'astro.config.mjs'), 'utf8')
    : '';
  const index = indexDist(root, origin, config);
  const pages: PerfPage[] = collectStaticPages(index);
  const live = skipLive ? [] : listLiveSample(index);
  const issues = [
    ...pages.flatMap((page) => checkPageBytes(page.path, page.bytes)),
    ...(skipLive ? [] : checkSampleCoverage(live)),
  ];

  if (!skipLive && live.length) {
    const server = await startStaticServer();
    const browser = await chromium.launch({ headless: true });
    try {
      await mapPool(live, workers, async (path) => {
        const href = `${server.url}${path === '/' ? '/' : path}`;
        const vitals = await measurePage(browser, href);
        const page = pages.find((row) => row.path === path);
        if (page) page.vitals = vitals;
        issues.push(...checkPageVitals(path, vitals));
      });
    } finally {
      await browser.close();
      await server.close();
    }
  }

  const report = formatPerfReport({ asOf, pages, live, issues });
  console.log(report.trim());
  for (const file of writeDatedReport('perf', report, asOf)) {
    console.log(`wrote ${file}`);
  }
  const jsonPath = join(process.cwd(), 'reports', `${asOf}-perf.json`);
  try {
    mkdirSync(join(process.cwd(), 'reports'), { recursive: true });
    writeFileSync(
      jsonPath,
      `${JSON.stringify(
        {
          asOf,
          issues: issues.length,
          pages: pages.map((page) => ({
            path: page.path,
            tier: page.tier,
            js: page.bytes.js,
            css: page.bytes.css,
            images: page.bytes.images,
            fontPreload: page.bytes.fontPreload,
            fontPreloadCount: page.bytes.fontPreloadCount,
            vitals: page.vitals ?? null,
          })),
        },
        null,
        2,
      )}\n`,
    );
    console.log(`wrote ${jsonPath}`);
  } catch {
    /* reports may be unwritable */
  }
  console.log(`perf QA: ${pages.length} pages · live ${live.length} · ${issues.length} issue(s)`);
  if (issues.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
