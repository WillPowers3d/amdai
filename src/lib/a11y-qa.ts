/**
 * Accessibility QA for the built dist.
 * axe-core serious/critical findings fail the default build (npm run qa:a11y).
 */

import { readFileSync } from 'node:fs';
import { isRedirectHtml, type DistIndex } from './site-qa';

export const A11Y_THEMES = ['dark', 'light'] as const;
export type A11yTheme = (typeof A11Y_THEMES)[number];

export const FAILING_IMPACTS = new Set(['critical', 'serious']);

export const A11Y_SHOT_PAGES = [
  '/qwen',
  '/benchmarks',
  '/newsletter',
  '/faq',
  '/backends',
  '/calculator',
  '/compare/one-vs-two-gpu',
  '/budget',
  '/results',
];

export const A11Y_SHOT_WIDTHS = [360, 390, 768] as const;

export type A11yViolation = {
  id: string;
  impact: string;
  help: string;
  helpUrl: string;
  theme: A11yTheme;
  path: string;
  nodes: number;
  targets: string[];
};

export function isFailingImpact(impact: string | null | undefined): boolean {
  return FAILING_IMPACTS.has(String(impact ?? '').toLowerCase());
}

export function isAffiliateHop(path: string): boolean {
  return path === '/go' || path.startsWith('/go/');
}

export function hasMetaRefresh(html: string): boolean {
  return /http-equiv=["']refresh["']/i.test(html);
}

export function listAuditPages(index: DistIndex): string[] {
  const pages: string[] = [];
  for (const [path, file] of [...index.pages.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const html = readFileSync(file, 'utf8');
    if (isRedirectHtml(html) || hasMetaRefresh(html) || isAffiliateHop(path)) continue;
    if (path.split('/').includes('pagefind')) continue;
    pages.push(path);
  }
  return pages;
}

export function summarizeA11y(violations: A11yViolation[]): {
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  failing: number;
  total: number;
} {
  const critical = violations.filter((row) => row.impact === 'critical').length;
  const serious = violations.filter((row) => row.impact === 'serious').length;
  const moderate = violations.filter((row) => row.impact === 'moderate').length;
  const minor = violations.filter((row) => row.impact === 'minor').length;
  return {
    critical,
    serious,
    moderate,
    minor,
    failing: critical + serious,
    total: violations.length,
  };
}

function countBy(items: A11yViolation[], key: (row: A11yViolation) => string): [string, number][] {
  const map = new Map<string, number>();
  for (const row of items) {
    const id = key(row);
    map.set(id, (map.get(id) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export function formatA11yReport(input: {
  asOf: string;
  pages: number;
  themes: readonly string[];
  violations: A11yViolation[];
}): string {
  const summary = summarizeA11y(input.violations);
  const failing = input.violations.filter((row) => isFailingImpact(row.impact));
  const lines = [
    `# Accessibility QA · ${input.asOf}`,
    '',
    `Scanned ${input.pages} built pages × ${input.themes.join(' + ')} themes with axe-core (WCAG 2.2 A/AA).`,
    `Serious/critical: ${summary.failing}. Moderate: ${summary.moderate}. Minor: ${summary.minor}.`,
    '',
    '## Impact counts',
    '',
    `- critical: ${summary.critical}`,
    `- serious: ${summary.serious}`,
    `- moderate: ${summary.moderate}`,
    `- minor: ${summary.minor}`,
    '',
    '## Serious and critical by rule',
    '',
  ];
  if (!failing.length) {
    lines.push('None.');
  } else {
    for (const [id, n] of countBy(failing, (row) => row.id)) {
      lines.push(`- ${id}: ${n}`);
    }
    lines.push('', '## Serious and critical by page', '');
    for (const [page, n] of countBy(failing, (row) => `${row.path} (${row.theme})`)) {
      lines.push(`- ${page}: ${n}`);
    }
    lines.push('', '## Violations', '');
    for (const row of failing) {
      lines.push(
        `- [${row.impact}] ${row.id} on ${row.path} (${row.theme}) — ${row.help} (${row.nodes} node${row.nodes === 1 ? '' : 's'})`,
      );
      if (row.targets.length) lines.push(`  - ${row.targets.slice(0, 4).join(', ')}`);
    }
  }
  return `${lines.join('\n')}\n`;
}
