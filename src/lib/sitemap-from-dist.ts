/**
 * Build sitemap-0.xml from dist HTML so every indexable page is listed.
 * @astrojs/sitemap walks Astro routes and can miss live pages such as
 * /troubleshoot and /setup/windows.
 */

import type { AstroIntegration } from 'astro';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalUrl, isSitemapExcluded, lastmodFor, SITE_ORIGIN } from './seo';
import {
  indexDist,
  isRedirectHtml,
  resolveOnDisk,
  SITE_ORIGIN_DEFAULT,
  type DistIndex,
} from './site-qa';

export const EXTRA_SITEMAP_PATHS = ['/rss.xml'] as const;

export type SitemapEntry = {
  path: string;
  loc: string;
  lastmod?: string;
};

function xmlText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function hasRobotsNoindex(html: string): boolean {
  return /<meta\s[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
}

export function isIndexableBuiltPage(index: DistIndex, path: string, file: string): boolean {
  if (isSitemapExcluded(path)) return false;
  const html = readFileSync(file, 'utf8');
  if (isRedirectHtml(html) || hasRobotsNoindex(html)) return false;
  return true;
}

export function sitemapEntriesFromDist(index: DistIndex): SitemapEntry[] {
  const entries = new Map<string, SitemapEntry>();
  for (const [path, file] of index.pages) {
    if (!isIndexableBuiltPage(index, path, file)) continue;
    entries.set(path, {
      path,
      loc: canonicalUrl(path, index.origin),
      lastmod: lastmodFor(path),
    });
  }
  for (const path of EXTRA_SITEMAP_PATHS) {
    if (entries.has(path)) continue;
    if (isSitemapExcluded(path)) continue;
    if (!resolveOnDisk(index.root, path)) continue;
    entries.set(path, {
      path,
      loc: canonicalUrl(path, index.origin),
      lastmod: lastmodFor(path),
    });
  }
  return [...entries.values()].sort((a, b) => a.path.localeCompare(b.path));
}

export function renderUrlset(entries: readonly SitemapEntry[], xslHref?: string): string {
  const stylesheet = xslHref ? `<?xml-stylesheet type="text/xsl" href="${xmlText(xslHref)}"?>` : '';
  const urls = entries.map((entry) => {
    const lastmod = entry.lastmod ? `<lastmod>${xmlText(entry.lastmod)}</lastmod>` : '';
    return `<url><loc>${xmlText(entry.loc)}</loc>${lastmod}</url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>${stylesheet}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>\n`;
}

export function renderSitemapIndex(origin: string, sitemapPath = '/sitemap-0.xml', xslHref?: string): string {
  const stylesheet = xslHref ? `<?xml-stylesheet type="text/xsl" href="${xmlText(xslHref)}"?>` : '';
  const loc = canonicalUrl(sitemapPath, origin);
  return `<?xml version="1.0" encoding="UTF-8"?>${stylesheet}<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${xmlText(loc)}</loc></sitemap></sitemapindex>\n`;
}

export function writeSitemapFromDist(root: string, origin = SITE_ORIGIN): SitemapEntry[] {
  const index = indexDist(root, origin);
  const entries = sitemapEntriesFromDist(index);
  const xsl0 = existsSync(join(root, 'sitemap-0.xsl')) ? '/sitemap-0.xsl' : undefined;
  const xslIndex = existsSync(join(root, 'sitemap-index.xsl')) ? '/sitemap-index.xsl' : undefined;
  writeFileSync(join(root, 'sitemap-0.xml'), renderUrlset(entries, xsl0));
  writeFileSync(join(root, 'sitemap-index.xml'), renderSitemapIndex(origin, '/sitemap-0.xml', xslIndex));
  return entries;
}

export function sitemapFromDist(origin = process.env.SITE_URL || SITE_ORIGIN_DEFAULT): AstroIntegration {
  return {
    name: 'sitemap-from-dist',
    hooks: {
      'astro:build:done': ({ dir }) => {
        writeSitemapFromDist(fileURLToPath(dir), origin.replace(/\/$/, '') || SITE_ORIGIN);
      },
    },
  };
}
