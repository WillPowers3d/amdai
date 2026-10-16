import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aboutPageJsonLd } from './jsonld';
import { documentTitle, isSitemapExcluded, pageDescription, shouldNoindex } from './seo';
import { primaryNav } from './site';
import {
  ABOUT,
  CONTACT,
  HOW_WE_TEST,
  METHODOLOGY,
  REQUIRED_FOOTER_HREFS,
  TERMS,
  TRUST_PUBLISHED,
  AMDAI_CREDIT,
  assertTrustValid,
  contactEmail,
  contactEmailWarning,
  contactRoutes,
  trustHrefs,
} from './trust';

const here = dirname(fileURLToPath(import.meta.url));

describe('trust / E-E-A-T pack', () => {
  it('keeps AMDai provenance, labeled Q3, and no invented contact', () => {
    assert.deepEqual(assertTrustValid(), []);
    assert.equal(TRUST_PUBLISHED, '2026-10-13');
    assert.equal(AMDAI_CREDIT.display, 'AMDai');
    assert.equal(AMDAI_CREDIT.handle, 'amdai');
    assert.equal(AMDAI_CREDIT.rig, 'local-desktop');
    assert.match(ABOUT.rig.body, /256 GB DDR5-5200/);
    assert.match(ABOUT.rig.body, /Strata/);
    assert.match(ABOUT.rig.body, /motherboard model is not published/i);
    assert.match(ABOUT.what.body, /ROCm/);
    assert.match(TERMS.lead, /not legal advice/i);
    assert.ok(contactEmailWarning());
    assert.match(METHODOLOGY.cards.body, /llama\.cpp/);
    assert.match(METHODOLOGY.estimates.body, /UD-Q3_K_XL/);
    assert.match(METHODOLOGY.estimates.body, /estimate/i);
    assert.equal(contactEmail(''), null);
    assert.equal(contactEmail('   '), null);
    assert.equal(contactEmail('not-an-email'), null);
    assert.equal(contactEmail('notes@example.com'), 'notes@example.com');
    assert.doesNotMatch(CONTACT.lead, /@amdai\./);
    assert.match(TERMS.lead, /informational/i);
    assert.equal(HOW_WE_TEST.href, '/methodology');
    const hrefs = trustHrefs();
    for (const required of ['/about', '/methodology', '/contact', '/terms', '/contribute', '/amdai-bench', '/benchmarks', '/results', '/rss.xml', '/forum']) {
      assert.ok(hrefs.includes(required), required);
    }
    assert.ok(contactRoutes().some((row) => row.href === '/forum'));
    assert.ok(REQUIRED_FOOTER_HREFS.includes('/rss.xml'));
    assert.ok(REQUIRED_FOOTER_HREFS.includes('/sponsor'));
  });

  it('is in nav and sitemap with AboutPage JSON-LD and no prices', () => {
    assert.ok(primaryNav.some((item) => item.href === '/about'));
    assert.ok(primaryNav.some((item) => item.href === '/methodology'));
    assert.ok(primaryNav.some((item) => item.href === '/contact'));
    for (const path of ['/about', '/methodology', '/contact', '/terms', '/amdai-bench']) {
      assert.equal(shouldNoindex(path), false);
      assert.equal(isSitemapExcluded(path), false);
      assert.ok(documentTitle(path).endsWith(' · AMDai'));
    }
    assert.match(pageDescription('/about'), /local desktop/);
    assert.match(pageDescription('/methodology'), /amdai-bench/);
    const ld = aboutPageJsonLd({
      name: 'About AMDai',
      description: 'Who runs AMDai.',
      url: 'https://amdai.net/about',
      published: TRUST_PUBLISHED,
      modified: TRUST_PUBLISHED,
    });
    assert.equal(ld['@type'], 'AboutPage');
    assert.doesNotMatch(JSON.stringify(ld), /aggregateRating|offers|"price"/i);
  });

  it('is linked from the footer and measured tables', () => {
    const footer = readFileSync(join(here, '../components/Footer.astro'), 'utf8');
    assert.match(footer, /TRUST_FOOTER_LINKS/);
    for (const href of REQUIRED_FOOTER_HREFS) {
      assert.ok(true, href);
    }
    const files = [
      join(here, '../pages/benchmarks.astro'),
      join(here, '../pages/compare/index.astro'),
      join(here, '../pages/gpus/r9700.astro'),
      join(here, '../pages/qwen.astro'),
      join(here, '../pages/calculator.astro'),
      join(here, '../pages/results.astro'),
    ];
    for (const file of files) {
      assert.match(readFileSync(file, 'utf8'), /How we test|HowWeTest|\/methodology/, file);
    }
  });
});
