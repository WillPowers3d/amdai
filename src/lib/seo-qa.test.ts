import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { indexDist } from './site-qa';
import {
  checkSeoIndex,
  extractMeta,
  formatSeoReport,
  requiredFieldsFor,
} from './seo-qa';
import {
  SEARCH_ACTION_TEMPLATE,
  SITE_ORIGIN,
  canonicalUrl,
  documentTitle,
  isSitemapExcluded,
  shouldNoindex,
} from './seo';
import { forbiddenJsonLdHits, organizationJsonLd, websiteJsonLd } from './jsonld';
import { BRAND } from './site';

describe('SEO helpers', () => {
  it('marks account, search, and login noindex and out of the sitemap', () => {
    assert.equal(shouldNoindex('/login'), true);
    assert.equal(shouldNoindex('/account/save'), true);
    assert.equal(shouldNoindex('/search'), true);
    assert.equal(shouldNoindex('/forum/inbox'), true);
    assert.equal(shouldNoindex('/faq'), false);
    assert.equal(shouldNoindex('/newsletter'), false);
    assert.equal(shouldNoindex('/newsletter/confirm'), true);
    assert.equal(isSitemapExcluded('/search'), true);
    assert.equal(isSitemapExcluded('/results'), false);
    assert.equal(isSitemapExcluded('/newsletter'), false);
    assert.equal(isSitemapExcluded('/newsletter/confirm'), true);
    assert.equal(canonicalUrl('/faq'), `${SITE_ORIGIN}/faq`);
    assert.equal(canonicalUrl('/'), `${SITE_ORIGIN}/`);
    assert.match(SEARCH_ACTION_TEMPLATE, /\/search\?q=\{search_term_string\}/);
  });

  it('builds unique AMDai titles', () => {
    assert.equal(documentTitle('/'), `${BRAND} · R9700 Lab Notes`);
    assert.ok(documentTitle('/faq').endsWith(' · AMDai'));
    assert.ok(documentTitle('/faq').length <= 60);
    assert.notEqual(documentTitle('/faq'), documentTitle('/rocm/faq'));
  });

  it('rejects price and rating keys in JSON-LD', () => {
    assert.deepEqual(forbiddenJsonLdHits(websiteJsonLd()), []);
    assert.equal(organizationJsonLd().name, BRAND);
    assert.deepEqual(forbiddenJsonLdHits({ aggregateRating: { ratingValue: 5 }, offers: { price: 1 } }), [
      'aggregateRating',
      'offers',
      'price',
      'ratingValue',
    ]);
    assert.deepEqual(requiredFieldsFor('Dataset', { name: 'x' }), [
      'creator',
      'license',
      'measurementTechnique',
      'temporalCoverage',
    ]);
    assert.deepEqual(requiredFieldsFor('SoftwareApplication', { name: 'x' }), [
      'url',
      'applicationCategory',
      'operatingSystem',
    ]);
  });
});

describe('SEO QA on dist HTML', () => {
  it('flags a duplicate title, missing canonical, and a noindex sitemap loc', () => {
    const root = join(tmpdir(), `amdai-seo-${Date.now()}`);
    mkdirSync(root, { recursive: true });
    const page = `<!doctype html><html lang="en"><head>
      <title>Same · AMDai</title>
      <meta name="description" content="This description is long enough to pass the seventy character floor for AMDai pages." />
      <meta property="og:image" content="https://amdai.net/og/default.png" />
      <script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebSite","name":"AMDai","url":"https://amdai.net","potentialAction":{"@type":"SearchAction"}}]}</script>
    </head><body><main id="main">ok</main></body></html>`;
    writeFileSync(join(root, 'index.html'), page.replace('Same', 'Home title here'));
    mkdirSync(join(root, 'a'), { recursive: true });
    mkdirSync(join(root, 'b'), { recursive: true });
    writeFileSync(join(root, 'a/index.html'), page);
    writeFileSync(join(root, 'b/index.html'), page);
    mkdirSync(join(root, 'og'), { recursive: true });
    writeFileSync(join(root, 'og/default.png'), 'png');
    writeFileSync(
      join(root, 'sitemap-0.xml'),
      `<?xml version="1.0"?><urlset><url><loc>https://amdai.net/search</loc></url></urlset>`,
    );
    writeFileSync(join(root, 'robots.txt'), 'User-agent: *\nAllow: /\n');
    const issues = checkSeoIndex(indexDist(root));
    assert.ok(issues.some((row) => row.kind === 'title' && row.message.includes('duplicate')));
    assert.ok(issues.some((row) => row.kind === 'canonical'));
    assert.ok(issues.some((row) => row.kind === 'sitemap' && row.message.includes('noindex')));
    assert.ok(issues.some((row) => row.kind === 'robots'));
  });

  it('parses meta and formats a dated report', () => {
    const meta = extractMeta(
      `<html lang="en"><head><title>FAQ · AMDai</title><meta name="description" content="Short answers." /><link rel="canonical" href="https://amdai.net/faq" /></head></html>`,
    );
    assert.equal(meta.title, 'FAQ · AMDai');
    assert.equal(meta.canonical, 'https://amdai.net/faq');
    const report = formatSeoReport({
      asOf: '2026-10-13',
      pages: 2,
      issues: [{ kind: 'title', path: '/a', message: 'missing <title>' }],
    });
    assert.match(report, /SEO QA · 2026-10-13/);
    assert.match(report, /Issues: 1/);
  });
});
