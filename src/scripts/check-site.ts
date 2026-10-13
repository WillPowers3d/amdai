#!/usr/bin/env tsx
/**
 * Fail the build on internal 404s, missing anchors/assets, sitemap/redirect
 * misses, and content lint. Run after `astro build` + pagefind.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { formatQaReport, runSiteQa, SITE_ORIGIN_DEFAULT, writeDatedReport } from '../lib/site-qa';
import { contactEmailWarning } from '../lib/trust';

const root = join(process.cwd(), process.argv[2] ?? 'dist');
const origin = process.env.SITE_URL || SITE_ORIGIN_DEFAULT;
const config = readFileSync(join(process.cwd(), 'astro.config.mjs'), 'utf8');
const issues = runSiteQa(root, origin, config);
const warning = contactEmailWarning();
const asOf = new Date().toISOString().slice(0, 10);
const warningBlock = warning
  ? ['', '## Warnings (not a build failure)', '', `- ${warning}`, '']
  : [];
const report = [`# Internal site QA · ${asOf}`, '', formatQaReport(issues), ...warningBlock].join('\n');
console.log(formatQaReport(issues));
if (warning) {
  console.log(`Site QA warning (not a failure): ${warning}`);
}
for (const path of writeDatedReport('internal', report, asOf)) {
  console.log(`wrote ${path}`);
}
if (issues.length) {
  process.exitCode = 1;
}
