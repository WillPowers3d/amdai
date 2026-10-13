/**
 * SEO + structured-data QA for the built dist.
 * Fails on missing/duplicate titles and descriptions, missing canonical or OG
 * image, invalid JSON-LD, noindex URLs in the sitemap, or price/rating markup.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  collectJsonLdKeys,
  FORBIDDEN_JSONLD_KEYS,
  forbiddenJsonLdHits,
} from './jsonld';
import {
  DESC_MAX,
  DESC_MIN,
  isSitemapExcluded,
  SITE_ORIGIN,
  TITLE_MAX,
  TITLE_SUFFIX,
  urlPath,
} from './seo';
import { BRAND } from './site';
import {
  extractSitemapLocs,
  isRedirectHtml,
  type DistIndex,
} from './site-qa';
import { hasMetaRefresh, isAffiliateHop } from './a11y-qa';

export type SeoIssue = {
  kind:
    | 'title'
    | 'description'
    | 'canonical'
    | 'og'
    | 'jsonld'
    | 'robots'
    | 'sitemap'
    | 'lang';
  path: string;
  message: string;
};

export type SeoPage = {
  path: string;
  file: string;
  title: string | null;
  description: string | null;
  canonical: string | null;
  ogImage: string | null;
  robots: string | null;
  lang: string | null;
  noindex: boolean;
  jsonld: unknown[];
};

const ATTR = (tag: string, name: string): string | null => {
  const re = new RegExp(`${name}=["']([^"']+)["']`, 'i');
  return tag.match(re)?.[1] ?? null;
};

export function extractMeta(html: string): Omit<SeoPage, 'path' | 'file'> {
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, ' ').trim() ?? null;
  const descTag =
    html.match(/<meta\s[^>]*name=["']description["'][^>]*>/i)?.[0] ??
    html.match(/<meta\s[^>]*content=["'][^"']+["'][^>]*name=["']description["'][^>]*>/i)?.[0];
  const description = descTag ? ATTR(descTag, 'content') : null;
  const canonTag = html.match(/<link\s[^>]*rel=["']canonical["'][^>]*>/i)?.[0];
  const canonical = canonTag ? ATTR(canonTag, 'href') : null;
  const ogTag =
    html.match(/<meta\s[^>]*property=["']og:image["'][^>]*>/i)?.[0] ??
    html.match(/<meta\s[^>]*content=["'][^"']+["'][^>]*property=["']og:image["'][^>]*>/i)?.[0];
  const ogImage = ogTag ? ATTR(ogTag, 'content') : null;
  const robotsTag =
    html.match(/<meta\s[^>]*name=["']robots["'][^>]*>/i)?.[0] ??
    html.match(/<meta\s[^>]*content=["'][^"']+["'][^>]*name=["']robots["'][^>]*>/i)?.[0];
  const robots = robotsTag ? ATTR(robotsTag, 'content') : null;
  const lang = html.match(/<html\b[^>]*\slang=["']([^"']+)["']/i)?.[1] ?? null;
  const noindex = /noindex/i.test(robots ?? '');
  const jsonld: unknown[] = [];
  for (const match of html.matchAll(/<script\s[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    jsonld.push(match[1]);
  }
  return { title, description, canonical, ogImage, robots, lang, noindex, jsonld };
}

export function listSeoPages(index: DistIndex): SeoPage[] {
  const pages: SeoPage[] = [];
  for (const [path, file] of [...index.pages.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const html = readFileSync(file, 'utf8');
    if (isRedirectHtml(html) || hasMetaRefresh(html) || isAffiliateHop(path)) continue;
    if (path.split('/').includes('pagefind')) continue;
    pages.push({ path, file, ...extractMeta(html) });
  }
  return pages;
}

function parseJsonLdBlocks(raw: unknown[]): { ok: unknown[]; errors: string[] } {
  const ok: unknown[] = [];
  const errors: string[] = [];
  for (const block of raw) {
    if (typeof block !== 'string') {
      errors.push('JSON-LD script is not text');
      continue;
    }
    try {
      ok.push(JSON.parse(block));
    } catch (err) {
      errors.push(`JSON-LD parse error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return { ok, errors };
}

function typesOf(node: unknown): string[] {
  if (!node || typeof node !== 'object') return [];
  const rec = node as Record<string, unknown>;
  const own = rec['@type'];
  const types = Array.isArray(own) ? own.map(String) : own ? [String(own)] : [];
  if (Array.isArray(rec['@graph'])) {
    for (const child of rec['@graph']) types.push(...typesOf(child));
  }
  return types;
}

function graphNodes(docs: unknown[]): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  for (const doc of docs) {
    if (!doc || typeof doc !== 'object') continue;
    const rec = doc as Record<string, unknown>;
    if (Array.isArray(rec['@graph'])) {
      for (const child of rec['@graph']) {
        if (child && typeof child === 'object') out.push(child as Record<string, unknown>);
      }
    } else {
      out.push(rec);
    }
  }
  return out;
}

export function requiredFieldsFor(type: string, node: Record<string, unknown>): string[] {
  const missing: string[] = [];
  const need = (key: string) => {
    if (node[key] == null || node[key] === '') missing.push(key);
  };
  switch (type) {
    case 'WebSite':
      need('name');
      need('url');
      if (!node.potentialAction) missing.push('potentialAction');
      break;
    case 'Organization':
      need('name');
      need('url');
      break;
    case 'BreadcrumbList':
      if (!Array.isArray(node.itemListElement) || node.itemListElement.length < 2) {
        missing.push('itemListElement');
      }
      break;
    case 'FAQPage':
      if (!Array.isArray(node.mainEntity) || node.mainEntity.length < 1) missing.push('mainEntity');
      break;
    case 'TechArticle':
      need('headline');
      need('datePublished');
      need('dateModified');
      break;
    case 'HowTo':
      need('name');
      if (!Array.isArray(node.step) || node.step.length < 1) missing.push('step');
      need('datePublished');
      need('dateModified');
      break;
    case 'DefinedTermSet':
      need('name');
      if (!Array.isArray(node.hasDefinedTerm) || node.hasDefinedTerm.length < 1) missing.push('hasDefinedTerm');
      break;
    case 'Dataset':
      need('name');
      need('creator');
      need('license');
      need('measurementTechnique');
      need('temporalCoverage');
      break;
    default:
      break;
  }
  return missing;
}

export function assetExists(root: string, href: string): boolean {
  try {
    const url = new URL(href, SITE_ORIGIN);
    const path = decodeURIComponent(url.pathname);
    const rel = path.replace(/^\/+/, '');
    const candidates = [join(root, rel), join(root, rel, 'index.html')];
    return candidates.some((file) => existsSync(file));
  } catch {
    return false;
  }
}

export function checkSeoPage(page: SeoPage, root: string): SeoIssue[] {
  const issues: SeoIssue[] = [];
  const indexable = !page.noindex;

  if (page.lang !== 'en') {
    issues.push({ kind: 'lang', path: page.path, message: `lang='${page.lang ?? ''}' must be en` });
  }

  if (indexable) {
    if (!page.title) issues.push({ kind: 'title', path: page.path, message: 'missing <title>' });
    else {
      if (page.title.length > TITLE_MAX + 4) {
        issues.push({ kind: 'title', path: page.path, message: `title is ${page.title.length} chars (want ≤${TITLE_MAX})` });
      }
      if (page.path !== '/' && !page.title.endsWith(TITLE_SUFFIX)) {
        issues.push({ kind: 'title', path: page.path, message: `title must end with '${TITLE_SUFFIX}'` });
      }
      if (page.path === '/' && !page.title.includes(BRAND)) {
        issues.push({ kind: 'title', path: page.path, message: 'homepage title must include AMDai' });
      }
    }
    if (!page.description) {
      issues.push({ kind: 'description', path: page.path, message: 'missing meta description' });
    } else if (page.description.length < DESC_MIN || page.description.length > DESC_MAX) {
      issues.push({
        kind: 'description',
        path: page.path,
        message: `description is ${page.description.length} chars (want ${DESC_MIN}–${DESC_MAX})`,
      });
    }
    if (!page.canonical) {
      issues.push({ kind: 'canonical', path: page.path, message: 'missing canonical' });
    } else {
      const expected = page.path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${page.path}`;
      const got = page.canonical.replace(/\/$/, '') === `${SITE_ORIGIN}` ? `${SITE_ORIGIN}/` : page.canonical.replace(/\/+$/, '');
      const want = expected.replace(/\/+$/, '') || SITE_ORIGIN;
      if (urlPath(new URL(page.canonical, SITE_ORIGIN).pathname) !== page.path) {
        issues.push({ kind: 'canonical', path: page.path, message: `canonical ${page.canonical} is not self-referencing` });
      }
      if (!page.canonical.startsWith(SITE_ORIGIN)) {
        issues.push({ kind: 'canonical', path: page.path, message: `canonical must start with ${SITE_ORIGIN}` });
      }
      void got;
      void want;
    }
    if (!page.ogImage) {
      issues.push({ kind: 'og', path: page.path, message: 'missing og:image' });
    } else if (!assetExists(root, page.ogImage)) {
      issues.push({ kind: 'og', path: page.path, message: `og:image missing on disk ${page.ogImage}` });
    }
    if (!page.jsonld.length) {
      issues.push({ kind: 'jsonld', path: page.path, message: 'missing JSON-LD' });
    }
  }

  const parsed = parseJsonLdBlocks(page.jsonld);
  for (const err of parsed.errors) {
    issues.push({ kind: 'jsonld', path: page.path, message: err });
  }
  for (const doc of parsed.ok) {
    for (const key of forbiddenJsonLdHits(doc)) {
      issues.push({ kind: 'jsonld', path: page.path, message: `forbidden JSON-LD field ${key}` });
    }
    for (const node of graphNodes([doc])) {
      for (const type of typesOf(node).filter((t) => t !== 'ListItem' && t !== 'Question' && t !== 'Answer' && t !== 'HowToStep' && t !== 'DefinedTerm' && t !== 'SearchAction' && t !== 'EntryPoint' && t !== 'Person')) {
        const missing = requiredFieldsFor(type, node);
        if (missing.length) {
          issues.push({ kind: 'jsonld', path: page.path, message: `${type} missing ${missing.join(', ')}` });
        }
      }
    }
  }

  return issues;
}

export function checkSeoIndex(index: DistIndex): SeoIssue[] {
  const pages = listSeoPages(index);
  const issues: SeoIssue[] = [];
  const titles = new Map<string, string[]>();
  const descs = new Map<string, string[]>();

  for (const page of pages) {
    issues.push(...checkSeoPage(page, index.root));
    if (page.noindex) continue;
    if (page.title) {
      const list = titles.get(page.title) ?? [];
      list.push(page.path);
      titles.set(page.title, list);
    }
    if (page.description) {
      const list = descs.get(page.description) ?? [];
      list.push(page.path);
      descs.set(page.description, list);
    }
  }

  for (const [title, paths] of titles) {
    if (paths.length > 1) {
      for (const path of paths) {
        issues.push({ kind: 'title', path, message: `duplicate title “${title}” on ${paths.join(', ')}` });
      }
    }
  }
  for (const [desc, paths] of descs) {
    if (paths.length > 1) {
      for (const path of paths) {
        issues.push({ kind: 'description', path, message: `duplicate description on ${paths.join(', ')}` });
      }
    }
  }

  const sitemapFiles = [join(index.root, 'sitemap-0.xml'), join(index.root, 'sitemap.xml')];
  const locs: string[] = [];
  for (const file of sitemapFiles) {
    if (existsSync(file)) locs.push(...extractSitemapLocs(readFileSync(file, 'utf8')));
  }
  for (const loc of locs) {
    let path = loc;
    try {
      path = urlPath(new URL(loc).pathname);
    } catch {
      path = urlPath(loc);
    }
    if (isSitemapExcluded(path)) {
      issues.push({ kind: 'sitemap', path, message: `noindex URL appears in sitemap: ${loc}` });
    }
    if (!loc.includes('<lastmod') && !readSitemapHasLastmod(index.root, loc)) {
      /* lastmod checked once below */
    }
  }

  const sitemap0 = join(index.root, 'sitemap-0.xml');
  if (existsSync(sitemap0)) {
    const xml = readFileSync(sitemap0, 'utf8');
    const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
    for (const block of urlBlocks) {
      const loc = block.match(/<loc>\s*([^<]+)\s*<\/loc>/i)?.[1]?.trim();
      if (!loc) continue;
      if (!/<lastmod>/i.test(block)) {
        issues.push({ kind: 'sitemap', path: loc, message: `sitemap entry missing lastmod: ${loc}` });
      }
    }
  }

  const robots = join(index.root, 'robots.txt');
  if (!existsSync(robots)) {
    issues.push({ kind: 'robots', path: '/robots.txt', message: 'robots.txt missing' });
  } else {
    const text = readFileSync(robots, 'utf8');
    if (!/sitemap:\s*https:\/\/amdai\.net\/sitemap/i.test(text)) {
      issues.push({ kind: 'robots', path: '/robots.txt', message: 'robots.txt must point at the amdai.net sitemap' });
    }
  }

  void collectJsonLdKeys;
  void FORBIDDEN_JSONLD_KEYS;
  return issues;
}

function readSitemapHasLastmod(root: string, loc: string): boolean {
  const file = join(root, 'sitemap-0.xml');
  if (!existsSync(file)) return false;
  const xml = readFileSync(file, 'utf8');
  const escaped = loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = xml.match(new RegExp(`<url>[\\s\\S]*?<loc>\\s*${escaped}\\s*</loc>[\\s\\S]*?</url>`));
  return !!block && /<lastmod>/i.test(block[0]);
}

export function formatSeoReport(input: { asOf: string; pages: number; issues: SeoIssue[] }): string {
  const lines = [
    `# SEO QA · ${input.asOf}`,
    '',
    `Checked ${input.pages} built pages.`,
    `Issues: ${input.issues.length}.`,
    '',
  ];
  if (!input.issues.length) {
    lines.push('No title, description, canonical, OG, JSON-LD, or sitemap issues.');
    return `${lines.join('\n')}\n`;
  }
  const byKind = new Map<string, SeoIssue[]>();
  for (const issue of input.issues) {
    const list = byKind.get(issue.kind) ?? [];
    list.push(issue);
    byKind.set(issue.kind, list);
  }
  for (const [kind, rows] of [...byKind.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(`## ${kind} (${rows.length})`, '');
    for (const row of rows) {
      lines.push(`- ${row.path}: ${row.message}`);
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}
