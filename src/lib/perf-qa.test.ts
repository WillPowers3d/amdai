import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { indexDist } from './site-qa';
import {
  CONTENT_VITALS,
  PERF_SAMPLE,
  TOOL_PAGES,
  TOOL_VITALS,
  checkPageBytes,
  checkPageVitals,
  checkSampleCoverage,
  extractResourceBytes,
  formatPerfReport,
  listLiveSample,
  logNormalScore,
  performanceScore,
  perfTier,
} from './perf-qa';

describe('perf QA helpers', () => {
  it('keeps content pages at 90 and tools at a documented lower floor', () => {
    assert.equal(CONTENT_VITALS.performance, 90);
    assert.equal(CONTENT_VITALS.lcpMs, 2500);
    assert.equal(CONTENT_VITALS.cls, 0.1);
    assert.equal(TOOL_VITALS.performance, 80);
    assert.equal(perfTier('/setup'), 'content');
    assert.equal(perfTier('/calculator'), 'tool');
    assert.ok(TOOL_PAGES.has('/qwen'));
    assert.ok(PERF_SAMPLE.includes('/stack-lab'));
    assert.ok(PERF_SAMPLE.includes('/tutorials/serve-qwen'));
  });

  it('scores good vitals high and a slow LCP below 90', () => {
    assert.ok(logNormalScore(1200, 1200, 2400) >= 0.89);
    const good = performanceScore({ lcpMs: 1400, fcpMs: 900, cls: 0.02, tbtMs: 80 });
    const bad = performanceScore({ lcpMs: 4500, fcpMs: 2200, cls: 0.2, tbtMs: 600 });
    assert.ok(good >= 90, String(good));
    assert.ok(bad < 80, String(bad));
  });

  it('flags oversized initial JS and extra font preloads', () => {
    const root = join(tmpdir(), `amdai-perf-${Date.now()}`);
    mkdirSync(join(root, 'js'), { recursive: true });
    writeFileSync(join(root, 'js/app.js'), 'x'.repeat(200_000));
    writeFileSync(join(root, 'font-a.woff2'), 'f'.repeat(20_000));
    writeFileSync(join(root, 'font-b.woff2'), 'f'.repeat(20_000));
    const html = `<html><head>
      <script type="module" src="/js/app.js"></script>
      <link rel="preload" as="font" href="/font-a.woff2" />
      <link rel="preload" as="font" href="/font-b.woff2" />
    </head><body>ok</body></html>`;
    const bytes = extractResourceBytes(html, root);
    assert.equal(bytes.js, 200_000);
    assert.equal(bytes.fontPreloadCount, 2);
    const issues = checkPageBytes('/faq', bytes);
    assert.ok(issues.some((row) => row.kind === 'js'));
    assert.ok(issues.some((row) => row.kind === 'font'));
    assert.deepEqual(checkPageBytes('/calculator', { ...bytes, fontPreloadCount: 1, fonts: ['/font-a.woff2'] }).filter((row) => row.kind === 'js'), []);
  });

  it('fails a required sample miss and formats a dated report', () => {
    assert.ok(checkSampleCoverage(['/']).some((row) => row.path === '/setup'));
    assert.deepEqual(checkSampleCoverage([...PERF_SAMPLE]), []);
    const vitals = { lcpMs: 5000, fcpMs: 2000, cls: 0.2, tbtMs: 800, performance: 40 };
    const issues = checkPageVitals('/faq', vitals);
    assert.ok(issues.some((row) => row.kind === 'lcp'));
    assert.ok(issues.some((row) => row.kind === 'performance'));
    const report = formatPerfReport({
      asOf: '2026-10-13',
      live: ['/faq'],
      issues,
      pages: [{ path: '/faq', tier: 'content', bytes: { js: 10, css: 10, images: 0, fontPreload: 0, fontPreloadCount: 1, scripts: [], styles: [], imageFiles: [], fonts: [] }, vitals }],
    });
    assert.match(report, /Performance QA · 2026-10-13/);
    assert.match(report, /\/faq/);
  });

  it('includes GPU directory pages in the live sample', () => {
    const root = join(tmpdir(), `amdai-perf-sample-${Date.now()}`);
    mkdirSync(root, { recursive: true });
    writeFileSync(join(root, 'index.html'), '<!doctype html><html lang="en"><body><main id="main">home</main></body></html>');
    mkdirSync(join(root, 'gpus/r9700'), { recursive: true });
    writeFileSync(join(root, 'gpus/r9700/index.html'), '<!doctype html><html lang="en"><body><main id="main">gpu</main></body></html>');
    const sample = listLiveSample(indexDist(root));
    assert.ok(sample.includes('/'));
    assert.ok(sample.includes('/gpus/r9700'));
  });
});
