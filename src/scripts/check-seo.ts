#!/usr/bin/env tsx
/**
 * Fail the build on SEO / structured-data issues.
 * Run after astro build + pagefind.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkSeoIndex, formatSeoReport, listSeoPages } from '../lib/seo-qa';
import { indexDist, SITE_ORIGIN_DEFAULT, writeDatedReport } from '../lib/site-qa';

const extra = process.argv.slice(2).find((arg) => !arg.startsWith('-'));
const root = join(process.cwd(), extra ?? 'dist');
const origin = process.env.SITE_URL || SITE_ORIGIN_DEFAULT;
const asOf = new Date().toISOString().slice(0, 10);

if (!existsSync(join(root, 'index.html'))) {
  console.error(`seo QA: ${root}/index.html missing. Run astro build first.`);
  process.exitCode = 1;
} else {
  const config = existsSync(join(process.cwd(), 'astro.config.mjs'))
    ? readFileSync(join(process.cwd(), 'astro.config.mjs'), 'utf8')
    : '';
  const index = indexDist(root, origin, config);
  const pages = listSeoPages(index);
  const issues = checkSeoIndex(index);
  const report = formatSeoReport({ asOf, pages: pages.length, issues });
  console.log(report.trim());
  for (const file of writeDatedReport('seo', report, asOf)) {
    console.log(`wrote ${file}`);
  }
  console.log(`seo QA: ${pages.length} pages · ${issues.length} issue(s)`);
  if (issues.length) process.exitCode = 1;
}
