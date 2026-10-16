import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { extractSitemapLocs, indexDist, checkSitemapAndRedirects } from './site-qa';
import {
  EXTRA_SITEMAP_PATHS,
  sitemapEntriesFromDist,
  writeSitemapFromDist,
} from './sitemap-from-dist';
import { isSitemapExcluded } from './seo';

function page(body: string, extraHead = ''): string {
  return `<html><head><meta property="og:site_name" content="AMDai">${extraHead}</head><body><main id="main">${body}</main></body></html>`;
}

describe('sitemap from built pages', () => {
  it('writes every indexable built page including /troubleshoot and /setup/windows', () => {
    const root = join(tmpdir(), `amdai-sitemap-${Date.now()}`);
    mkdirSync(join(root, 'troubleshoot'), { recursive: true });
    mkdirSync(join(root, 'setup/windows'), { recursive: true });
    mkdirSync(join(root, 'search'), { recursive: true });
    writeFileSync(join(root, 'index.html'), page('<a href="/troubleshoot">Troubleshoot</a><a href="/setup/windows">Windows</a>'));
    writeFileSync(join(root, 'troubleshoot/index.html'), page('<p>Symptom-first fixes.</p>'));
    writeFileSync(join(root, 'setup/windows/index.html'), page('<p>Cited Windows first-run.</p>'));
    writeFileSync(join(root, 'search/index.html'), page('<p>Pagefind search.</p>', '<meta name="robots" content="noindex,nofollow">'));
    writeFileSync(join(root, 'rss.xml'), '<rss><channel><title>AMDai</title></channel></rss>');
    writeFileSync(
      join(root, 'sitemap-0.xml'),
      '<urlset><url><loc>https://amdai.net/</loc><lastmod>2026-10-13</lastmod></url></urlset>',
    );

    const before = checkSitemapAndRedirects(indexDist(root, 'https://amdai.net'));
    assert.ok(before.some((row) => row.message.includes('built page missing from sitemap: /troubleshoot')));
    assert.ok(before.some((row) => row.message.includes('built page missing from sitemap: /setup/windows')));
    assert.ok(!before.some((row) => row.message.includes('/search')));

    const entries = writeSitemapFromDist(root, 'https://amdai.net');
    const paths = entries.map((row) => row.path);
    assert.ok(paths.includes('/'));
    assert.ok(paths.includes('/troubleshoot'));
    assert.ok(paths.includes('/setup/windows'));
    assert.ok(paths.includes('/rss.xml'));
    assert.ok(!paths.includes('/search'));
    assert.equal(isSitemapExcluded('/troubleshoot'), false);
    assert.equal(isSitemapExcluded('/setup/windows'), false);
    assert.deepEqual(EXTRA_SITEMAP_PATHS, ['/rss.xml', '/llms.txt', '/llms-full.txt']);

    const xml = readFileSync(join(root, 'sitemap-0.xml'), 'utf8');
    const locs = extractSitemapLocs(xml);
    assert.ok(locs.includes('https://amdai.net/troubleshoot'));
    assert.ok(locs.includes('https://amdai.net/setup/windows'));
    assert.ok(locs.includes('https://amdai.net/rss.xml'));
    assert.ok(!locs.includes('https://amdai.net/search'));
    assert.match(xml, /<lastmod>/);
    assert.match(readFileSync(join(root, 'sitemap-index.xml'), 'utf8'), /sitemap-0\.xml/);

    const after = checkSitemapAndRedirects(indexDist(root, 'https://amdai.net'));
    assert.ok(!after.some((row) => row.message.includes('missing from sitemap')));
    assert.ok(sitemapEntriesFromDist(indexDist(root, 'https://amdai.net')).every((row) => row.loc.startsWith('https://amdai.net')));
  });
});
