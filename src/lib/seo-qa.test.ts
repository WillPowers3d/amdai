import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { indexDist } from './site-qa';
import {
  checkSeoIndex,
  checkSeoPage,
  extractMeta,
  formatSeoReport,
  requiredFieldsFor,
} from './seo-qa';
import {
  SEARCH_ACTION_TEMPLATE,
  SITE_ORIGIN,
  breadcrumbsFor,
  canonicalUrl,
  documentTitle,
  isSitemapExcluded,
  shouldNoindex,
} from './seo';
import { breadcrumbJsonLd, forbiddenJsonLdHits, organizationJsonLd, pageJsonLd, personJsonLdHits, websiteJsonLd } from './jsonld';
import { BRAND, site } from './site';

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

  it('builds Home + page breadcrumbs for every path below the homepage', () => {
    assert.deepEqual(breadcrumbsFor('/'), []);
    const about = breadcrumbsFor('/about');
    assert.equal(about.length, 2);
    assert.equal(about[0]?.href, '/');
    assert.equal(about[0]?.name, 'Home');
    assert.equal(about[1]?.href, '/about');
    assert.equal(about[1]?.name, 'About');
    for (const path of ['/setup', '/faq', '/compare', '/benchmarks', '/multi-gpu', '/glossary', '/contact', '/terms']) {
      const crumbs = breadcrumbsFor(path);
      assert.equal(crumbs[0]?.href, '/');
      assert.equal(crumbs.at(-1)?.href, path);
      assert.ok(crumbs.length >= 2, path);
    }
    const gpu = breadcrumbsFor('/gpus/r9700');
    assert.ok(gpu.length >= 3);
    assert.equal(gpu[0]?.href, '/');
    assert.equal(gpu[1]?.href, '/gpus');
    assert.equal(gpu.at(-1)?.href, '/gpus/r9700');
    const nodes = pageJsonLd({ pathname: '/about', title: 'About · AMDai', description: 'Who runs AMDai.' });
    assert.ok(nodes.some((node) => node['@type'] === 'BreadcrumbList'));
    const list = breadcrumbJsonLd(about);
    assert.equal((list.itemListElement as { position: number }[]).length, 2);
  });

  it('builds unique AMDai titles', () => {
    assert.equal(documentTitle('/'), `${BRAND} · R9700 Lab Notes`);
    assert.ok(documentTitle('/faq').endsWith(' · AMDai'));
    assert.ok(documentTitle('/faq').length <= 60);
    assert.notEqual(documentTitle('/faq'), documentTitle('/rocm/faq'));
  });

  it('rejects price and rating keys in JSON-LD', () => {
    assert.deepEqual(forbiddenJsonLdHits(websiteJsonLd()), []);
    assert.deepEqual(personJsonLdHits(organizationJsonLd()), []);
    assert.deepEqual(personJsonLdHits(pageJsonLd({ pathname: '/', title: 'AMDai', description: site.description })), []);
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
      <meta property="og:image:alt" content="AMDai — independent Radeon AI notes. Not affiliated with AMD." />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="https://amdai.net/og/default.png" />
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
    assert.equal(meta.ogImage, null);
    assert.equal(meta.ogImageAlt, null);
    const report = formatSeoReport({
      asOf: '2026-10-13',
      pages: 2,
      issues: [{ kind: 'title', path: '/a', message: 'missing <title>' }],
    });
    assert.match(report, /SEO QA · 2026-10-13/);
    assert.match(report, /Issues: 1/);
  });

  it('fails relative og:image, missing alt, and 404 share assets', () => {
    const root = join(tmpdir(), `amdai-seo-og-${Date.now()}`);
    mkdirSync(join(root, 'og'), { recursive: true });
    writeFileSync(join(root, 'og/default.png'), 'png');
    const base = {
      path: '/faq',
      file: join(root, 'faq/index.html'),
      title: 'FAQ · AMDai',
      description:
        'This description is long enough to pass the seventy character floor for AMDai pages.',
      canonical: 'https://amdai.net/faq',
      ogImage: 'https://amdai.net/og/default.png',
      ogImageAlt: 'AMDai FAQ — first-time Radeon local-LLM answers',
      twitterCard: 'summary_large_image',
      twitterImage: 'https://amdai.net/og/default.png',
      robots: null,
      lang: 'en',
      noindex: false,
      jsonld: ['{"@type":"WebSite","name":"AMDai","url":"https://amdai.net","potentialAction":{}}'],
    };
    assert.equal(checkSeoPage(base, root).filter((row) => row.kind === 'og').length, 0);
    assert.ok(
      checkSeoPage({ ...base, ogImage: '/og/default.png' }, root).some((row) =>
        row.message.includes('absolute https'),
      ),
    );
    assert.ok(
      checkSeoPage({ ...base, ogImage: 'https://amdai.net/og/missing.png' }, root).some((row) =>
        row.message.includes('missing on disk'),
      ),
    );
    assert.ok(
      checkSeoPage({ ...base, ogImageAlt: null }, root).some((row) => row.message.includes('og:image:alt')),
    );
    assert.ok(
      checkSeoPage({ ...base, twitterCard: 'summary' }, root).some((row) =>
        row.message.includes('summary_large_image'),
      ),
    );
    assert.ok(
      checkSeoPage({ ...base, twitterImage: '/og/default.png' }, root).some((row) =>
        row.message.includes('twitter:image must be an absolute https'),
      ),
    );
  });
});
