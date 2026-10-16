/**
 * Site-wide link + content QA for the built dist.
 * Internal crawl and content lint fail the default build.
 * External citation checks live in check-links-external (offline-safe CI).
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { OG_SITE_NAME } from './site';
import { gluedSentenceHits, htmlToVisibleText } from './html-text';
import { isRamOffloadSurface, missingRamLabels } from './ram-surfaces';
import { isAllowlistedStackLabHref } from './stack-lab-open';
import { isSitemapExcluded } from './seo';

export const SITE_ORIGIN_DEFAULT = 'https://amdai.net';

export const Q4_FLOOR_PHRASES = [
  /floor is q4/i,
  /q4 floor/i,
  /q4 and up only/i,
  /never (?:go |drop )?below q4/i,
  /do not drop below q4/i,
  /why not below q4/i,
];

export const BANNED_MODEL_VISIBLE = /Qwen2\.5|Qwen3-8B/i;
export const Q1Q2_QUANT = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
export const BROKEN_TOKEN = /\bundefined\b|\bNaN\b|\[object Object\]/;
export const LEFTOVER_COPY =
  /\bTODO\b|\bTBD\b|\bFIXME\b|\bchangeme\b|\blorem ipsum\b|\bplaceholder text\b|\byour text here\b|\bwelcome to your app\b/i;

const CAMEL_ALLOW = [
  'OpenAI',
  'JavaScript',
  'TypeScript',
  'GraphQL',
  'WebGPU',
  'GitHub',
  'YouTube',
  'PyTorch',
  'OpenCL',
  'OpenGL',
  'HuggingFace',
  'ChatGPT',
  'MacOS',
  'macOS',
  'iGPU',
  'nGram',
  'Pagefind',
  'WebUI',
  'OpenCode',
  'OpenClaw',
  'LibreChat',
  'AnythingLLM',
  'SillyTavern',
  'Coolify',
  'Herdr',
  'Thermite',
  'Proxmox',
  'Prometheus',
  'Grafana',
  'Adrenalin',
  'LunarG',
];

const SKIP_HREF = /^(mailto:|tel:|javascript:|data:|amdai-stack-lab:)/i;

export type QaIssue = {
  kind: 'link' | 'anchor' | 'asset' | 'sitemap' | 'redirect' | 'content' | 'brand';
  file: string;
  message: string;
};

export type DistIndex = {
  root: string;
  origin: string;
  files: Set<string>;
  pages: Map<string, string>;
  redirects: Map<string, string>;
  ids: Map<string, Set<string>>;
};

export function walkFiles(dir: string, out: string[] = [], skip = new Set(['pagefind'])): string[] {
  for (const name of readdirSync(dir)) {
    if (skip.has(name) && statSync(join(dir, name)).isDirectory()) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkFiles(full, out, skip);
    else out.push(full);
  }
  return out;
}

export function isRedirectHtml(html: string): boolean {
  return /http-equiv=["']refresh["']/i.test(html) && /Redirecting to:/i.test(html);
}

function stripQuery(path: string): string {
  return path.split('?')[0] ?? path;
}

export function urlPath(pathname: string): string {
  let path = pathname || '/';
  if (!path.startsWith('/')) path = `/${path}`;
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return path || '/';
}

export function fileToUrlPath(root: string, file: string): string {
  const rel = file.slice(root.length).replaceAll('\\', '/').replace(/^\//, '');
  if (rel === 'index.html') return '/';
  if (rel === '404.html') return '/404';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'/index.html'.length)}`;
  if (rel.endsWith('.html')) return `/${rel.slice(0, -'.html'.length)}`;
  return `/${rel}`;
}

export function candidateFiles(root: string, path: string): string[] {
  const clean = stripQuery(urlPath(path));
  const rel = clean === '/' ? '' : clean.replace(/^\//, '');
  const names = rel
    ? [join(root, rel), join(root, rel, 'index.html'), join(root, `${rel}.html`)]
    : [join(root, 'index.html')];
  return names;
}

export function resolveOnDisk(root: string, path: string): string | null {
  for (const file of candidateFiles(root, path)) {
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
}

export function parseRedirectTarget(html: string): string | null {
  const refresh = html.match(/url=([^"' >]+)/i);
  if (refresh?.[1]) return refresh[1];
  const href = html.match(/<a\s+[^>]*href=["']([^"']+)["']/i);
  return href?.[1] ?? null;
}

export function loadRedirectsFromConfig(configSource: string): Map<string, string> {
  const map = new Map<string, string>();
  const block = configSource.match(/redirects:\s*\{([\s\S]*?)\}/);
  if (!block) return map;
  for (const match of block[1].matchAll(/['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g)) {
    map.set(urlPath(match[1]!), urlPath(match[2]!));
  }
  return map;
}

export function collectIds(html: string): Set<string> {
  const ids = new Set<string>();
  for (const match of html.matchAll(/\sid=["']([^"']+)["']/gi)) ids.add(match[1]!);
  for (const match of html.matchAll(/<(?:a|area)\s[^>]*\sname=["']([^"']+)["']/gi)) ids.add(match[1]!);
  return ids;
}

export function extractSitemapLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((m) => m[1]!.trim());
}

export function parseSrcset(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim().split(/\s+/)[0])
    .filter((part): part is string => !!part);
}

function markupForRefs(html: string): string {
  return html
    .replace(/<(script|style|template|noscript)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
}

function usableRef(value: string): boolean {
  return !!value && !value.includes('${') && !/%7B/i.test(value) && !value.includes('`');
}

export function extractRefs(html: string): { hrefs: string[]; assets: string[] } {
  const hrefs: string[] = [];
  const assets: string[] = [];
  const scan = markupForRefs(html);
  for (const match of scan.matchAll(/\s(?:href|src|poster|data-src)=["']([^"']+)["']/gi)) {
    const value = match[1]!;
    if (!usableRef(value)) continue;
    if (/\ssrc=|\sposter=|\sdata-src=/i.test(match[0])) assets.push(value);
    else hrefs.push(value);
  }
  for (const match of scan.matchAll(/\ssrcset=["']([^"']+)["']/gi)) {
    assets.push(...parseSrcset(match[1]!).filter(usableRef));
  }
  for (const match of scan.matchAll(/<meta\s[^>]*(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*>/gi)) {
    const content = match[0].match(/content=["']([^"']+)["']/i);
    if (content?.[1] && usableRef(content[1])) assets.push(content[1]);
  }
  return { hrefs, assets };
}

export function classifyRef(
  raw: string,
  fromPath: string,
  origin: string,
): { kind: 'internal' | 'external' | 'skip'; path: string; hash: string; originHref: string } {
  const trimmed = raw.trim();
  if (!trimmed || SKIP_HREF.test(trimmed)) {
    return { kind: 'skip', path: '', hash: '', originHref: trimmed };
  }
  if (trimmed.startsWith('#')) {
    return { kind: 'internal', path: fromPath, hash: trimmed.slice(1), originHref: trimmed };
  }
  try {
    const base = `${origin}${fromPath === '/' ? '/' : `${fromPath}/`}`;
    const url = new URL(trimmed, base);
    const hash = url.hash.replace(/^#/, '');
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      if (url.origin === origin) {
        return { kind: 'internal', path: urlPath(url.pathname), hash, originHref: trimmed };
      }
      return { kind: 'external', path: url.href, hash, originHref: trimmed };
    }
    if (url.protocol === 'file:') {
      return { kind: 'internal', path: urlPath(url.pathname), hash, originHref: trimmed };
    }
  } catch {
    return { kind: 'skip', path: '', hash: '', originHref: trimmed };
  }
  return { kind: 'skip', path: '', hash: '', originHref: trimmed };
}

export function indexDist(root: string, origin = SITE_ORIGIN_DEFAULT, configSource = ''): DistIndex {
  const files = new Set(walkFiles(root, [], new Set()));
  const pages = new Map<string, string>();
  const redirects = loadRedirectsFromConfig(configSource);
  const ids = new Map<string, Set<string>>();

  for (const file of files) {
    if (!file.endsWith('.html')) continue;
    const relDir = dirname(file).slice(root.length).replaceAll('\\', '/');
    if (relDir.split('/').includes('pagefind')) continue;
    const path = urlPath(fileToUrlPath(root, file));
    const html = readFileSync(file, 'utf8');
    pages.set(path, file);
    if (isRedirectHtml(html)) {
      const target = parseRedirectTarget(html);
      if (target) redirects.set(path, urlPath(stripQuery(target)));
    }
    ids.set(path, collectIds(html));
  }

  return { root, origin, files, pages, redirects, ids };
}

function followRedirect(index: DistIndex, path: string, seen = new Set<string>()): string {
  let current = urlPath(path);
  while (index.redirects.has(current) && !seen.has(current)) {
    seen.add(current);
    current = index.redirects.get(current)!;
  }
  return current;
}

export function pathExists(index: DistIndex, path: string): boolean {
  const dest = followRedirect(index, path);
  if (index.pages.has(dest)) return true;
  return resolveOnDisk(index.root, dest) != null;
}

function issue(kind: QaIssue['kind'], file: string, message: string): QaIssue {
  return { kind, file, message };
}

export function checkInternalLinks(index: DistIndex): QaIssue[] {
  const issues: QaIssue[] = [];
  for (const [path, file] of index.pages) {
    const html = readFileSync(file, 'utf8');
    if (isRedirectHtml(html)) continue;
    const { hrefs, assets } = extractRefs(html);
    for (const href of hrefs) {
      const ref = classifyRef(href, path, index.origin);
      if (ref.kind !== 'internal') continue;
      if (!pathExists(index, ref.path)) {
        issues.push(issue('link', file, `internal 404 ${href} → ${ref.path}`));
        continue;
      }
      if (ref.hash) {
        const dest = followRedirect(index, ref.path);
        const destIds = index.ids.get(dest);
        if (!destIds?.has(ref.hash)) {
          issues.push(issue('anchor', file, `missing heading id #${ref.hash} on ${dest} (from ${href})`));
        }
      }
    }
    for (const src of assets) {
      const ref = classifyRef(src, path, index.origin);
      if (ref.kind !== 'internal') continue;
      if (!pathExists(index, ref.path)) {
        issues.push(issue('asset', file, `missing asset ${src} → ${ref.path}`));
      }
    }
  }
  return issues;
}

export function checkSitemapAndRedirects(index: DistIndex): QaIssue[] {
  const issues: QaIssue[] = [];
  const sitemapIndex = join(index.root, 'sitemap-index.xml');
  const sitemap0 = join(index.root, 'sitemap-0.xml');
  if (!existsSync(sitemapIndex)) issues.push(issue('sitemap', sitemapIndex, 'sitemap-index.xml missing'));
  if (!existsSync(sitemap0)) issues.push(issue('sitemap', sitemap0, 'sitemap-0.xml missing'));
  if (existsSync(sitemapIndex)) {
    for (const loc of extractSitemapLocs(readFileSync(sitemapIndex, 'utf8'))) {
      const ref = classifyRef(loc, '/', index.origin);
      if (ref.kind === 'internal' && !pathExists(index, ref.path)) {
        issues.push(issue('sitemap', sitemapIndex, `sitemap index loc 404 ${loc}`));
      }
    }
  }
  if (existsSync(sitemap0)) {
    for (const loc of extractSitemapLocs(readFileSync(sitemap0, 'utf8'))) {
      const ref = classifyRef(loc, '/', index.origin);
      if (ref.kind !== 'internal') continue;
      if (!pathExists(index, ref.path)) {
        issues.push(issue('sitemap', sitemap0, `sitemap loc 404 ${loc}`));
      }
    }
  }
  const listed = new Set(sitemapPaths(index));
  for (const [path, file] of index.pages) {
    if (isSitemapExcluded(path)) continue;
    const html = readFileSync(file, 'utf8');
    if (isRedirectHtml(html)) continue;
    if (/<meta\s[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;
    if (!listed.has(path)) {
      issues.push(issue('sitemap', file, `built page missing from sitemap: ${path}`));
    }
  }
  for (const [from, to] of index.redirects) {
    if (!pathExists(index, to)) {
      issues.push(issue('redirect', from, `redirect target 404 ${from} → ${to}`));
    }
  }
  return issues;
}

function maskCamel(text: string): string {
  let out = text;
  for (const token of CAMEL_ALLOW) out = out.replaceAll(token, 'X'.repeat(token.length));
  return out;
}

export function leftoverHits(text: string): string[] {
  const hits: string[] = [];
  const re = new RegExp(LEFTOVER_COPY.source, 'gi');
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) hits.push(match[0]);
  return hits;
}

export function emptyTableCells(html: string): number[] {
  const hits: number[] = [];
  const re = /<td\b([^>]*)>([\s\S]*?)<\/td>/gi;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = re.exec(html))) {
    i += 1;
    const inner = match[2] ?? '';
    if (/<(img|input|svg|button|a|select)\b/i.test(inner)) continue;
    const text = inner
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
    if (text === '') hits.push(i);
  }
  return hits;
}

export function lintHtml(html: string, file: string): QaIssue[] {
  if (isRedirectHtml(html)) return [];
  const issues: QaIssue[] = [];
  const visible = htmlToVisibleText(html);

  const siteName = html.match(/property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i)
    ?? html.match(/content=["']([^"']+)["'][^>]*property=["']og:site_name["']/i);
  if (siteName) {
    if (siteName[1] !== OG_SITE_NAME) {
      issues.push(issue('brand', file, `og:site_name='${siteName[1]}' must be exactly '${OG_SITE_NAME}'`));
    }
  }

  const masked = maskCamel(visible);
  for (const hit of gluedSentenceHits(masked)) {
    issues.push(issue('content', file, `sentence glue “${hit.match}” … ${hit.snippet}`));
  }

  if (BANNED_MODEL_VISIBLE.test(visible) || BANNED_MODEL_VISIBLE.test(markupForRefs(html))) {
    issues.push(issue('content', file, 'mentions Qwen2.5 or Qwen3-8B'));
  }
  for (const pat of Q4_FLOOR_PHRASES) {
    if (pat.test(visible)) issues.push(issue('content', file, `banned Q4-floor phrase (${pat})`));
  }
  const q1 = visible.match(Q1Q2_QUANT);
  if (q1) issues.push(issue('content', file, `Q1/Q2 quant listed: ${q1[0]}`));

  if (BROKEN_TOKEN.test(visible)) {
    issues.push(issue('content', file, 'broken token undefined / NaN / [object Object] in visible text'));
  }
  for (const leftover of leftoverHits(visible)) {
    issues.push(issue('content', file, `leftover copy “${leftover}”`));
  }
  const empty = emptyTableCells(html);
  if (empty.length) {
    issues.push(issue('content', file, `empty table cell(s) #${empty.slice(0, 8).join(', ')} — use a value or “not measured”`));
  }
  return issues;
}

export function checkRamOffloadSurfaces(index: DistIndex): QaIssue[] {
  const issues: QaIssue[] = [];
  for (const [path, file] of index.pages) {
    if (!isRamOffloadSurface(path)) continue;
    const html = readFileSync(file, 'utf8');
    if (isRedirectHtml(html)) continue;
    for (const label of missingRamLabels(html)) {
      issues.push(issue('content', file, `RAM-offload surface ${path} missing “${label}”`));
    }
  }
  return issues;
}

export function checkContent(index: DistIndex): QaIssue[] {
  const issues: QaIssue[] = [];
  for (const [, file] of index.pages) {
    issues.push(...lintHtml(readFileSync(file, 'utf8'), file));
  }
  issues.push(...checkRamOffloadSurfaces(index));
  return issues;
}

export const REQUIRED_FOOTER_HREFS = [
  '/about',
  '/methodology',
  '/contact',
  '/sponsor',
  '/terms',
  '/privacy',
  '/disclosure',
  '/accessibility',
  '/credits',
  '/rss.xml',
] as const;

export function checkFooterTrustLinks(index: DistIndex): QaIssue[] {
  const home = index.pages.get('/');
  if (!home) return [issue('link', '/', 'homepage missing — cannot check footer trust links')];
  const html = readFileSync(home, 'utf8');
  const issues: QaIssue[] = [];
  for (const href of REQUIRED_FOOTER_HREFS) {
    const found = html.includes(`href="${href}"`) || html.includes(`href='${href}'`);
    if (!found) issues.push(issue('link', home, `footer missing required trust link ${href}`));
  }
  return issues;
}

export function checkStackLabHrefs(index: DistIndex): QaIssue[] {
  const issues: QaIssue[] = [];
  for (const [path, file] of index.pages) {
    const html = readFileSync(file, 'utf8');
    if (isRedirectHtml(html)) continue;
    const { hrefs } = extractRefs(html);
    for (const href of hrefs) {
      if (!/^amdai-stack-lab:/i.test(href)) continue;
      if (!isAllowlistedStackLabHref(href)) {
        issues.push(issue('link', file, `Stack Lab href is not allowlisted: ${href} (from ${path})`));
      }
    }
  }
  return issues;
}

export function checkRssFeed(index: DistIndex): QaIssue[] {
  const file = resolveOnDisk(index.root, '/rss.xml');
  if (!file) return [issue('link', '/rss.xml', 'Lab Notes feed /rss.xml missing')];
  const xml = readFileSync(file, 'utf8');
  const issues: QaIssue[] = [];
  if (!xml.trimStart().startsWith('<?xml')) issues.push(issue('content', file, 'feed is not XML'));
  if (!/<rss version="2.0"/i.test(xml)) issues.push(issue('content', file, 'feed must be RSS 2.0'));
  if (!/<atom:link[^>]+rel=["']self["']/i.test(xml)) issues.push(issue('content', file, 'feed missing atom self link'));
  if (!/<item>/i.test(xml)) issues.push(issue('content', file, 'feed has no items'));
  if (!/AMDai/.test(xml)) issues.push(issue('brand', file, 'feed must name AMDai'));
  if (!/\/blog\//.test(xml)) issues.push(issue('content', file, 'feed missing Lab Notes posts'));
  if (!/\/results\//.test(xml)) issues.push(issue('content', file, 'feed missing run cards'));
  if (BANNED_MODEL_VISIBLE.test(xml)) issues.push(issue('content', file, 'feed mentions Qwen2.5 or Qwen3-8B'));
  for (const pat of Q4_FLOOR_PHRASES) {
    if (pat.test(xml)) issues.push(issue('content', file, `feed banned Q4-floor phrase (${pat})`));
  }
  return issues;
}

export const MAX_LINK_DEPTH = 3;

export function sitemapPaths(index: DistIndex): string[] {
  const locs: string[] = [];
  for (const name of ['sitemap-0.xml', 'sitemap.xml']) {
    const file = join(index.root, name);
    if (existsSync(file)) locs.push(...extractSitemapLocs(readFileSync(file, 'utf8')));
  }
  const paths = new Set<string>();
  for (const loc of locs) {
    const ref = classifyRef(loc, '/', index.origin);
    if (ref.kind === 'internal') paths.add(ref.path);
  }
  return [...paths];
}

export function internalOutlinks(index: DistIndex, path: string): string[] {
  const file = index.pages.get(path);
  if (!file) return [];
  const html = readFileSync(file, 'utf8');
  if (isRedirectHtml(html)) return [];
  const { hrefs } = extractRefs(html);
  const out = new Set<string>();
  for (const href of hrefs) {
    const ref = classifyRef(href, path, index.origin);
    if (ref.kind !== 'internal') continue;
    const dest = followRedirect(index, ref.path);
    if (dest && dest !== path) out.add(dest);
  }
  return [...out];
}

export function checkOrphansAndDepth(index: DistIndex): QaIssue[] {
  const issues: QaIssue[] = [];
  const sitemap = sitemapPaths(index);
  const inbound = new Map<string, Set<string>>();
  const graph = new Map<string, string[]>();

  for (const [path] of index.pages) {
    const outs = internalOutlinks(index, path);
    graph.set(path, outs);
    for (const dest of outs) {
      const set = inbound.get(dest) ?? new Set<string>();
      set.add(path);
      inbound.set(dest, set);
    }
  }

  const depth = new Map<string, number>();
  const queue = ['/'];
  depth.set('/', 0);
  while (queue.length) {
    const current = queue.shift()!;
    const here = depth.get(current)!;
    for (const next of graph.get(current) ?? []) {
      if (depth.has(next)) continue;
      depth.set(next, here + 1);
      queue.push(next);
    }
  }

  for (const path of sitemap) {
    if (path === '/') continue;
    const from = inbound.get(path);
    if (!from || from.size === 0) {
      issues.push(issue('link', path, `orphan: ${path} is in the sitemap but no other page links to it`));
    }
    const hops = depth.get(path);
    if (hops == null) {
      issues.push(issue('link', path, `unreachable from homepage: ${path}`));
    } else if (hops > MAX_LINK_DEPTH) {
      issues.push(issue('link', path, `link depth ${hops} from homepage (max ${MAX_LINK_DEPTH}): ${path}`));
    }
  }
  return issues;
}

export function runSiteQa(root: string, origin = SITE_ORIGIN_DEFAULT, configSource = ''): QaIssue[] {
  const index = indexDist(root, origin, configSource);
  return [
    ...checkInternalLinks(index),
    ...checkSitemapAndRedirects(index),
    ...checkContent(index),
    ...checkFooterTrustLinks(index),
    ...checkRssFeed(index),
    ...checkStackLabHrefs(index),
    ...checkOrphansAndDepth(index),
  ];
}

export function formatQaReport(issues: QaIssue[]): string {
  if (!issues.length) return 'Site QA: 0 issues.';
  const lines = [`Site QA: ${issues.length} issue(s).`, ''];
  for (const item of issues) {
    lines.push(`- [${item.kind}] ${item.file}: ${item.message}`);
  }
  return lines.join('\n');
}

export function qaReportDirs(): string[] {
  return [
    '/opt/cursor/artifacts/link-reports',
    join(process.cwd(), 'artifacts/link-reports'),
    join(process.cwd(), 'reports'),
  ];
}

export function writeDatedReport(slug: string, body: string, asOf = new Date().toISOString().slice(0, 10)): string[] {
  const filename = `${asOf}-${slug}.md`;
  const written: string[] = [];
  for (const dir of qaReportDirs()) {
    try {
      mkdirSync(dir, { recursive: true });
      const path = join(dir, filename);
      writeFileSync(path, body.endsWith('\n') ? body : `${body}\n`);
      written.push(path);
    } catch {
      /* directory may be unwritable in some CI images */
    }
  }
  return written;
}

export function extractExternalHrefs(index: DistIndex): { href: string; pages: string[] }[] {
  const map = new Map<string, Set<string>>();
  for (const [path, file] of index.pages) {
    const html = readFileSync(file, 'utf8');
    if (isRedirectHtml(html)) continue;
    const { hrefs, assets } = extractRefs(html);
    for (const raw of [...hrefs, ...assets]) {
      const ref = classifyRef(raw, path, index.origin);
      if (ref.kind !== 'external') continue;
      const list = map.get(ref.path) ?? new Set<string>();
      list.add(path);
      map.set(ref.path, list);
    }
  }
  return [...map.entries()]
    .map(([href, pages]) => ({ href, pages: [...pages].sort() }))
    .sort((a, b) => a.href.localeCompare(b.href));
}

export type ExternalLinkRow = {
  href: string;
  pages: string[];
  status: 'ok' | 'dead' | 'redirected' | 'slow' | 'error';
  http: number | null;
  finalUrl: string | null;
  ms: number;
  note: string;
};

export function classifyExternalResult(input: {
  ok: boolean;
  status: number | null;
  finalUrl: string | null;
  requested: string;
  ms: number;
  error?: string;
  slowMs?: number;
}): Omit<ExternalLinkRow, 'href' | 'pages'> {
  const slowMs = input.slowMs ?? 2500;
  if (input.error) return { status: 'error', http: input.status, finalUrl: input.finalUrl, ms: input.ms, note: input.error };
  if (input.status != null && input.status >= 400) {
    return { status: 'dead', http: input.status, finalUrl: input.finalUrl, ms: input.ms, note: `HTTP ${input.status}` };
  }
  const redirected = !!(input.finalUrl && originPath(input.finalUrl) !== originPath(input.requested));
  if (redirected) {
    return { status: 'redirected', http: input.status, finalUrl: input.finalUrl, ms: input.ms, note: `redirects to ${input.finalUrl}` };
  }
  if (input.ms >= slowMs) {
    return { status: 'slow', http: input.status, finalUrl: input.finalUrl, ms: input.ms, note: `${input.ms}ms` };
  }
  return { status: 'ok', http: input.status, finalUrl: input.finalUrl, ms: input.ms, note: 'ok' };
}

function originPath(href: string): string {
  try {
    const url = new URL(href);
    return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
  } catch {
    return href;
  }
}

export function formatExternalReport(rows: ExternalLinkRow[], asOf: string): string {
  const flagged = rows.filter((row) => row.status !== 'ok');
  const lines = [
    `# External link report · ${asOf}`,
    '',
    `Checked ${rows.length} outbound URLs. Flagged ${flagged.length}. Citations were not removed.`,
    '',
  ];
  if (!flagged.length) {
    lines.push('No dead, redirected, or slow outbound links in this pass.');
    return `${lines.join('\n')}\n`;
  }
  for (const status of ['dead', 'error', 'redirected', 'slow'] as const) {
    const group = flagged.filter((row) => row.status === status);
    if (!group.length) continue;
    lines.push(`## ${status}`, '');
    for (const row of group) {
      lines.push(`- ${row.href}`);
      lines.push(`  - ${row.note} (${row.ms}ms${row.http != null ? `, HTTP ${row.http}` : ''})`);
      lines.push(`  - pages: ${row.pages.join(', ')}`);
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}
