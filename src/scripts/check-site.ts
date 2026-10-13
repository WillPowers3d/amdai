#!/usr/bin/env tsx
/**
 * Fail the build on internal 404s, missing anchors/assets, sitemap/redirect
 * misses, and content lint. Run after `astro build` + pagefind.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { formatQaReport, runSiteQa, SITE_ORIGIN_DEFAULT } from '../lib/site-qa';

const root = join(process.cwd(), process.argv[2] ?? 'dist');
const origin = process.env.SITE_URL || SITE_ORIGIN_DEFAULT;
const config = readFileSync(join(process.cwd(), 'astro.config.mjs'), 'utf8');
const issues = runSiteQa(root, origin, config);
const report = formatQaReport(issues);
console.log(report);
if (issues.length) {
  process.exitCode = 1;
}
