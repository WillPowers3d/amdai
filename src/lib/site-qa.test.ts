import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  BANNED_MODEL_VISIBLE,
  Q1Q2_QUANT,
  classifyExternalResult,
  classifyRef,
  emptyTableCells,
  extractSitemapLocs,
  leftoverHits,
  lintHtml,
  loadRedirectsFromConfig,
  pathExists,
  indexDist,
  checkInternalLinks,
  checkSitemapAndRedirects,
  checkFooterTrustLinks,
  checkRssFeed,
  REQUIRED_FOOTER_HREFS,
} from './site-qa';

describe('site QA helpers', () => {
  it('classifies internal, hash, and external refs', () => {
    const page = classifyRef('/qwen', '/stacks', 'https://amdai.net');
    assert.equal(page.kind, 'internal');
    assert.equal(page.path, '/qwen');
    const hash = classifyRef('#table', '/qwen', 'https://amdai.net');
    assert.equal(hash.kind, 'internal');
    assert.equal(hash.path, '/qwen');
    assert.equal(hash.hash, 'table');
    const abs = classifyRef('https://amdai.net/calculator?n=1', '/qwen', 'https://amdai.net');
    assert.equal(abs.kind, 'internal');
    assert.equal(abs.path, '/calculator');
    const ext = classifyRef('https://huggingface.co/Qwen', '/qwen', 'https://amdai.net');
    assert.equal(ext.kind, 'external');
    const skip = classifyRef('mailto:hi@example.com', '/', 'https://amdai.net');
    assert.equal(skip.kind, 'skip');
    const scheme = classifyRef('amdai-stack-lab://recipes/qwen36-35b.llamacpp-vulkan.262k', '/', 'https://amdai.net');
    assert.equal(scheme.kind, 'skip');
  });

  it('reads astro redirects and sitemap locs', () => {
    const map = loadRedirectsFromConfig(`export default { redirects: { '/local-ai': '/software' } }`);
    assert.equal(map.get('/local-ai'), '/software');
    assert.deepEqual(extractSitemapLocs('<urlset><url><loc>https://amdai.net/qwen/</loc></url></urlset>'), [
      'https://amdai.net/qwen/',
    ]);
  });

  it('lints leftover copy, banned models, brand, empty cells, and glue', () => {
    const bad = `<html><head><meta property="og:site_name" content="AMDai"></head>
      <body><p>wheels.HIP is the path.</p><p>Qwen2.5 is here.</p><p>TODO later</p>
      <table><tr><td></td><td>not measured</td></tr></table></body></html>`;
    const issues = lintHtml(bad, 'page.html');
    assert.ok(issues.some((i) => i.kind === 'brand' && i.message.includes('amdai')));
    assert.ok(issues.some((i) => /Qwen2\.5|Qwen3-8B/.test(i.message) || i.message.includes('mentions')));
    assert.ok(issues.some((i) => i.message.includes('TODO')));
    assert.ok(issues.some((i) => i.message.includes('empty table')));
    assert.ok(issues.some((i) => i.message.includes('glue')));
    const good = `<html><head><meta property="og:site_name" content="amdai"></head>
      <body><p>llama.cpp first. Q3 is listed.</p><table><tr><td>not measured</td></tr></table></body></html>`;
    assert.deepEqual(lintHtml(good, 'ok.html'), []);
    assert.equal(leftoverHits('lorem ipsum dolor').length, 1);
    assert.equal(leftoverHits('FIXME later').length, 1);
    assert.equal(leftoverHits('changeme token').length, 1);
    assert.ok(BANNED_MODEL_VISIBLE.test('Qwen3-8B instruct'));
    assert.ok(Q1Q2_QUANT.test('IQ2_XXS'));
    assert.ok(Q1Q2_QUANT.test('Q1_K'));
    assert.ok(!Q1Q2_QUANT.test('Q1 / Q2 stay off'));
    assert.ok(!Q1Q2_QUANT.test('IQ1/IQ2 stay off'));
    assert.deepEqual(emptyTableCells('<td> </td><td>not measured</td>'), [1]);
  });

  it('fails a missing internal link, anchor, asset, and sitemap loc', () => {
    const root = join(tmpdir(), `amdai-qa-${Date.now()}`);
    mkdirSync(join(root, 'og'), { recursive: true });
    writeFileSync(
      join(root, 'index.html'),
      `<html><head><meta property="og:site_name" content="amdai"><meta property="og:image" content="/og/missing.png"></head>
       <body><main id="main"><a href="/nope">gone</a><a href="#missing">jump</a><p>ok.</p></main></body></html>`,
    );
    writeFileSync(join(root, 'sitemap-index.xml'), '<sitemapindex><loc>https://amdai.net/sitemap-0.xml</loc></sitemapindex>');
    writeFileSync(join(root, 'sitemap-0.xml'), '<urlset><url><loc>https://amdai.net/ghost/</loc></url></urlset>');
    const index = indexDist(root, 'https://amdai.net', `redirects: { '/old': '/gone' }`);
    const links = checkInternalLinks(index);
    assert.ok(links.some((i) => i.kind === 'link' && i.message.includes('/nope')));
    assert.ok(links.some((i) => i.kind === 'anchor' && i.message.includes('#missing')));
    assert.ok(links.some((i) => i.kind === 'asset' && i.message.includes('/og/missing.png')));
    const map = checkSitemapAndRedirects(index);
    assert.ok(map.some((i) => i.kind === 'sitemap' && i.message.includes('/ghost')));
    assert.ok(map.some((i) => i.kind === 'redirect' && i.message.includes('/old')));
    assert.equal(pathExists(index, '/'), true);
    const footer = checkFooterTrustLinks(index);
    for (const href of REQUIRED_FOOTER_HREFS) {
      assert.ok(footer.some((i) => i.message.includes(href)), href);
    }
    const feed = checkRssFeed(index);
    assert.ok(feed.some((i) => i.message.includes('/rss.xml')));
  });

  it('classifies external results without inventing citations', () => {
    assert.equal(classifyExternalResult({ ok: false, status: 404, finalUrl: null, requested: 'https://x.test', ms: 10 }).status, 'dead');
    assert.equal(
      classifyExternalResult({
        ok: true,
        status: 200,
        finalUrl: 'https://x.test/b',
        requested: 'https://x.test/a',
        ms: 20,
      }).status,
      'redirected',
    );
    assert.equal(classifyExternalResult({ ok: true, status: 200, finalUrl: 'https://x.test/a', requested: 'https://x.test/a', ms: 4000 }).status, 'slow');
    assert.equal(classifyExternalResult({ ok: true, status: 200, finalUrl: 'https://x.test/a', requested: 'https://x.test/a', ms: 100 }).status, 'ok');
  });
});
