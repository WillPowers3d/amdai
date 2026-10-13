/**
 * Performance + Core Web Vitals budget for the built dist.
 * Static byte budgets run on every page. Live mobile-throttled CWV
 * runs on the required sample (Playwright + Lighthouse scoring curves).
 * Do not invent tok/s or prices here.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { listAuditPages } from './a11y-qa';
import type { DistIndex } from './site-qa';

export const PERF_SAMPLE = [
  '/',
  '/calculator',
  '/budget',
  '/benchmarks',
  '/compare',
  '/compare/one-vs-two-gpu',
  '/compare/q4-q5-q6',
  '/rocm',
  '/rocm/stack',
  '/setup',
  '/faq',
  '/stack-lab',
  '/glossary',
  '/tutorials/serve-qwen',
  '/backends',
  '/qwen',
] as const;

export type PerfTier = 'content' | 'tool';

export type ByteBudget = {
  js: number;
  css: number;
  images: number;
  fontPreload: number;
  fontPreloadCount: number;
};

export type VitalBudget = {
  performance: number;
  lcpMs: number;
  cls: number;
  tbtMs: number;
};

export const CONTENT_BYTES: ByteBudget = {
  js: 90_000,
  css: 90_000,
  images: 80_000,
  fontPreload: 40_000,
  fontPreloadCount: 1,
};

export const TOOL_BYTES: ByteBudget = {
  js: 400_000,
  css: 90_000,
  images: 80_000,
  fontPreload: 40_000,
  fontPreloadCount: 1,
};

export const CONTENT_VITALS: VitalBudget = {
  performance: 90,
  lcpMs: 2500,
  cls: 0.1,
  tbtMs: 200,
};

export const TOOL_VITALS: VitalBudget = {
  performance: 80,
  lcpMs: 4000,
  cls: 0.1,
  tbtMs: 400,
};

/** Interactive tools that ship a justified larger JS island. */
export const TOOL_PAGES = new Set([
  '/calculator',
  '/qwen',
  '/search',
  '/budget',
  '/troubleshoot/errors',
]);

export const TOOL_REASONS: Record<string, string> = {
  '/calculator': 'Client-side quant + hardware calculator (shareable URL, no server).',
  '/qwen': 'Client filter/sort over the full 3.6 / 3.8 comparison table.',
  '/search': 'Pagefind full-text index loaded only on /search.',
  '/budget': 'Tier picker that rewrites the comparison without a round-trip.',
  '/troubleshoot/errors': 'Log paste matcher runs the cited pattern catalog in the page.',
};

export type ResourceBytes = {
  js: number;
  css: number;
  images: number;
  fontPreload: number;
  fontPreloadCount: number;
  scripts: string[];
  styles: string[];
  imageFiles: string[];
  fonts: string[];
};

export type PerfVitals = {
  lcpMs: number;
  fcpMs: number;
  cls: number;
  tbtMs: number;
  performance: number;
};

export type PerfPage = {
  path: string;
  tier: PerfTier;
  bytes: ResourceBytes;
  vitals?: PerfVitals;
};

export type PerfIssue = {
  kind: 'js' | 'css' | 'image' | 'font' | 'lcp' | 'cls' | 'tbt' | 'performance' | 'sample';
  path: string;
  message: string;
};

export function perfTier(path: string): PerfTier {
  return TOOL_PAGES.has(path) ? 'tool' : 'content';
}

export function byteBudgetFor(path: string): ByteBudget {
  return perfTier(path) === 'tool' ? TOOL_BYTES : CONTENT_BYTES;
}

export function vitalBudgetFor(path: string): VitalBudget {
  return perfTier(path) === 'tool' ? TOOL_VITALS : CONTENT_VITALS;
}

export function resolveDistFile(root: string, href: string): string | null {
  const clean = decodeURIComponent((href.split('?')[0] ?? '/').replace(/#.*$/, ''));
  if (!clean.startsWith('/') || clean.startsWith('//')) return null;
  const rel = clean.replace(/^\/+/, '');
  const candidates = [join(root, rel), join(root, rel, 'index.html'), join(root, `${rel}.html`)];
  for (const file of candidates) {
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
}

function fileSize(root: string, href: string): number {
  const file = resolveDistFile(root, href);
  if (!file) return 0;
  return statSync(file).size;
}

const ATTR = (tag: string, name: string): string | null => {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'));
  return match?.[2] ?? null;
};

export function extractResourceBytes(html: string, root: string): ResourceBytes {
  const scripts: string[] = [];
  const styles: string[] = [];
  const imageFiles: string[] = [];
  const fonts: string[] = [];

  for (const match of html.matchAll(/<script\b([^>]*)>/gi)) {
    const src = ATTR(match[1] ?? '', 'src');
    if (src && src.startsWith('/')) scripts.push(src);
  }
  for (const match of html.matchAll(/<link\b([^>]*)>/gi)) {
    const attrs = match[1] ?? '';
    const rel = (ATTR(attrs, 'rel') ?? '').toLowerCase();
    const href = ATTR(attrs, 'href');
    const as = (ATTR(attrs, 'as') ?? '').toLowerCase();
    if (!href || !href.startsWith('/')) continue;
    if (rel === 'stylesheet' || (rel === 'preload' && as === 'style')) styles.push(href);
    if (rel === 'modulepreload') scripts.push(href);
    if (rel === 'preload' && as === 'font') fonts.push(href);
  }
  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    const src = ATTR(match[1] ?? '', 'src');
    if (src && src.startsWith('/')) imageFiles.push(src);
  }

  const unique = (list: string[]) => [...new Set(list)];
  const scriptList = unique(scripts);
  const styleList = unique(styles);
  const imageList = unique(imageFiles);
  const fontList = unique(fonts);

  return {
    js: scriptList.reduce((sum, href) => sum + fileSize(root, href), 0),
    css: styleList.reduce((sum, href) => sum + fileSize(root, href), 0),
    images: imageList.reduce((sum, href) => sum + fileSize(root, href), 0),
    fontPreload: fontList.reduce((sum, href) => sum + fileSize(root, href), 0),
    fontPreloadCount: fontList.length,
    scripts: scriptList,
    styles: styleList,
    imageFiles: imageList,
    fonts: fontList,
  };
}

export function listPerfPages(index: DistIndex): string[] {
  return listAuditPages(index);
}

export function listLiveSample(index: DistIndex): string[] {
  const pages = new Set<string>(PERF_SAMPLE);
  for (const path of listAuditPages(index)) {
    if (path === '/gpus' || path.startsWith('/gpus/')) pages.add(path);
  }
  return [...pages].filter((path) => index.pages.has(path)).sort();
}

/** Lighthouse log-normal score. Lower observed values score higher. */
export function logNormalScore(value: number, p10: number, median: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const location = Math.log(median);
  const logRatio = Math.log(p10) - location;
  const stddev = Math.abs(logRatio) / 1.2815515655446004;
  if (stddev < 1e-9) return value <= median ? 1 : 0;
  const z = (Math.log(value) - location) / stddev;
  return clamp01(1 - standardNormalCdf(z));
}

function standardNormalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const a = Math.abs(x);
  const p = 0.3275911;
  const t = 1 / (1 + p * a);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-a * a);
  return sign * y;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/**
 * Performance score from CWV using Lighthouse v10 curves.
 * Speed Index is omitted (not observed in Playwright); remaining weights
 * renormalize to 100: LCP 30, TBT 30, CLS 25, FCP 15.
 */
export function performanceScore(input: { lcpMs: number; fcpMs: number; cls: number; tbtMs: number }): number {
  const lcp = logNormalScore(input.lcpMs, 1200, 2400);
  const fcp = logNormalScore(input.fcpMs || input.lcpMs, 900, 1600);
  const tbt = logNormalScore(Math.max(input.tbtMs, 1), 150, 350);
  const cls = logNormalScore(Math.max(input.cls, 0.001), 0.1, 0.25);
  return Math.round(100 * (0.3 * lcp + 0.3 * tbt + 0.25 * cls + 0.15 * fcp));
}

export function checkPageBytes(path: string, bytes: ResourceBytes): PerfIssue[] {
  const budget = byteBudgetFor(path);
  const issues: PerfIssue[] = [];
  if (bytes.js > budget.js) {
    issues.push({
      kind: 'js',
      path,
      message: `initial JS ${bytes.js} B exceeds ${budget.js} B (${perfTier(path)})`,
    });
  }
  if (bytes.css > budget.css) {
    issues.push({
      kind: 'css',
      path,
      message: `CSS ${bytes.css} B exceeds ${budget.css} B`,
    });
  }
  if (bytes.images > budget.images) {
    issues.push({
      kind: 'image',
      path,
      message: `in-body images ${bytes.images} B exceed ${budget.images} B`,
    });
  }
  if (bytes.fontPreloadCount > budget.fontPreloadCount) {
    issues.push({
      kind: 'font',
      path,
      message: `preloads ${bytes.fontPreloadCount} fonts; budget is ${budget.fontPreloadCount} (critical face only)`,
    });
  }
  if (bytes.fontPreload > budget.fontPreload) {
    issues.push({
      kind: 'font',
      path,
      message: `preloaded fonts ${bytes.fontPreload} B exceed ${budget.fontPreload} B`,
    });
  }
  return issues;
}

export function checkPageVitals(path: string, vitals: PerfVitals): PerfIssue[] {
  const budget = vitalBudgetFor(path);
  const issues: PerfIssue[] = [];
  if (vitals.performance < budget.performance) {
    issues.push({
      kind: 'performance',
      path,
      message: `performance ${vitals.performance} < ${budget.performance} (${perfTier(path)})`,
    });
  }
  if (vitals.lcpMs > budget.lcpMs) {
    issues.push({ kind: 'lcp', path, message: `LCP ${Math.round(vitals.lcpMs)} ms > ${budget.lcpMs} ms` });
  }
  if (vitals.cls > budget.cls + 1e-6) {
    issues.push({ kind: 'cls', path, message: `CLS ${vitals.cls.toFixed(3)} > ${budget.cls}` });
  }
  if (vitals.tbtMs > budget.tbtMs) {
    issues.push({ kind: 'tbt', path, message: `TBT ${Math.round(vitals.tbtMs)} ms > ${budget.tbtMs} ms` });
  }
  return issues;
}

export function checkSampleCoverage(live: string[]): PerfIssue[] {
  const issues: PerfIssue[] = [];
  for (const path of PERF_SAMPLE) {
    if (!live.includes(path)) {
      issues.push({ kind: 'sample', path, message: 'required live CWV sample page was not measured' });
    }
  }
  return issues;
}

export function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function formatPerfReport(input: {
  asOf: string;
  pages: PerfPage[];
  live: string[];
  issues: PerfIssue[];
}): string {
  const lines = [
    `# Performance QA · ${input.asOf}`,
    '',
    `Static byte budgets on ${input.pages.length} built pages. Live mobile-throttled CWV on ${input.live.length} pages (Playwright + Lighthouse v10 scoring curves; Speed Index omitted).`,
    `Issues: ${input.issues.length}.`,
    '',
    '## Budgets',
    '',
    `- Content pages: performance ≥ ${CONTENT_VITALS.performance}, LCP ≤ ${CONTENT_VITALS.lcpMs} ms, CLS ≤ ${CONTENT_VITALS.cls}, TBT ≤ ${CONTENT_VITALS.tbtMs} ms, JS ≤ ${formatKb(CONTENT_BYTES.js)}, CSS ≤ ${formatKb(CONTENT_BYTES.css)}.`,
    `- Tool pages (justified exceptions): performance ≥ ${TOOL_VITALS.performance}, LCP ≤ ${TOOL_VITALS.lcpMs} ms, TBT ≤ ${TOOL_VITALS.tbtMs} ms, JS ≤ ${formatKb(TOOL_BYTES.js)}.`,
    '',
    '## Tool exceptions',
    '',
  ];
  for (const [path, reason] of Object.entries(TOOL_REASONS)) {
    lines.push(`- \`${path}\` — ${reason}`);
  }
  lines.push('', '## Live sample', '');
  const livePages = input.pages.filter((page) => page.vitals);
  if (!livePages.length) {
    lines.push('None.');
  } else {
    lines.push('| Page | Tier | Perf | LCP | CLS | TBT | JS | CSS |');
    lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |');
    for (const page of livePages) {
      const v = page.vitals!;
      lines.push(
        `| ${page.path} | ${page.tier} | ${v.performance} | ${Math.round(v.lcpMs)} ms | ${v.cls.toFixed(3)} | ${Math.round(v.tbtMs)} ms | ${formatKb(page.bytes.js)} | ${formatKb(page.bytes.css)} |`,
      );
    }
  }
  if (input.issues.length) {
    lines.push('', '## Issues', '');
    for (const issue of input.issues) {
      lines.push(`- [${issue.kind}] ${issue.path}: ${issue.message}`);
    }
  }
  return `${lines.join('\n')}\n`;
}

export function collectStaticPages(index: DistIndex): PerfPage[] {
  return listPerfPages(index).map((path) => {
    const file = index.pages.get(path);
    const html = file ? readFileSync(file, 'utf8') : '';
    return {
      path,
      tier: perfTier(path),
      bytes: extractResourceBytes(html, index.root),
    };
  });
}

export function htmlDir(file: string): string {
  return dirname(file);
}
