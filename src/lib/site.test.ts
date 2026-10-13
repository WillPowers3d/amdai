import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BRAND, HERO_HEADLINE, OG_SITE_NAME, ogSlug, primaryNav, site } from './site';
import { AMDAI_BENCH_SCHEMA } from './results';

describe('AMDai brand and hero', () => {
  it('uses the exact AMDai wordmark and title form', () => {
    assert.equal(BRAND, 'AMDai');
    assert.equal(site.wordmark, 'AMDai');
    assert.equal(site.shortName, 'AMDai');
    assert.equal(`${site.wordmark} · ${site.name}`, 'AMDai · R9700 Lab Notes');
    assert.notEqual(site.wordmark, 'amdai');
    assert.notEqual(site.wordmark, 'AMDAi');
    assert.notEqual(site.wordmark, 'AMDAI');
    assert.equal(OG_SITE_NAME, 'AMDai');
    assert.equal(OG_SITE_NAME, BRAND);
  });

  it('keeps the exact hero headline and leaves lowercase product ids alone', () => {
    assert.equal(HERO_HEADLINE, 'Local Qwen on a R9700. Reliably.');
    assert.notEqual(HERO_HEADLINE, 'Local Qwen on a real R9700. Not a brochure.');
    assert.equal(AMDAI_BENCH_SCHEMA, 'amdai-bench');
    assert.match(site.tagline, /R9700/);
    const calc = primaryNav.find((item) => item.href === '/calculator');
    const quants = primaryNav.find((item) => item.href === '/quants');
    const glossary = primaryNav.find((item) => item.href === '/glossary');
    assert.match(calc?.description ?? '', /Q3/);
    assert.doesNotMatch(calc?.description ?? '', /Q4\+|Q4 floor|below Q4/i);
    assert.match(quants?.description ?? '', /Q3/);
    assert.doesNotMatch(quants?.description ?? '', /below Q4|Q4 floor/i);
    assert.ok(glossary);
    assert.match(glossary?.description ?? '', /Q3/);
    assert.doesNotMatch(glossary?.description ?? '', /below Q4|Q4 floor/i);
  });
});

describe('accessibility statement', () => {
  it('is a real page and is linked from the footer', async () => {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const { dirname, join } = await import('node:path');
    const here = dirname(fileURLToPath(import.meta.url));
    const footer = readFileSync(join(here, '../components/Footer.astro'), 'utf8');
    const page = readFileSync(join(here, '../pages/accessibility.astro'), 'utf8');
    assert.match(footer, /TRUST_FOOTER_LINKS/);
    assert.match(footer, /href="\/newsletter"/);
    assert.match(footer, /href="\/setup"/);
    assert.match(page, /13 October 2026/);
    assert.match(page, /\/forum/);
    assert.match(page, /\/contribute/);
    assert.match(page, /\/contact/);
    assert.doesNotMatch(page, /@amdai\.|mailto:/i);
    assert.equal(ogSlug('/accessibility'), 'default');
    assert.equal(ogSlug('/about'), 'about');
    assert.equal(ogSlug('/methodology'), 'methodology');
    assert.equal(ogSlug('/contact'), 'contact');
    assert.equal(ogSlug('/terms'), 'terms');
    assert.equal(ogSlug('/compare'), 'compare');
    assert.equal(ogSlug('/compare/q4-q5-q6'), 'compare-q4-q5-q6');
    assert.equal(ogSlug('/results'), 'results');
    assert.equal(ogSlug('/bios'), 'bios');
    assert.equal(ogSlug('/qwen'), 'qwen');
    assert.equal(ogSlug('/flash-daily'), 'flash-daily');
    assert.equal(ogSlug('/flash-ram-offload'), 'flash-ram-offload');
    assert.equal(ogSlug('/qwen36-dual'), 'qwen36-dual');
    assert.equal(ogSlug('/multi-gpu'), 'multi-gpu');
    assert.equal(ogSlug('/benchmarks'), 'benchmarks');
    assert.equal(ogSlug('/gpus/r9700'), 'gpus-r9700');
    assert.equal(ogSlug('/gpus/strix-halo'), 'gpus-strix-halo');
    assert.equal(ogSlug('/gpus/rx-9070-xt'), 'gpus-rx-9070-xt');
    assert.equal(ogSlug('/gpus/rx-9060-xt'), 'gpus-rx-9060-xt');
    assert.equal(ogSlug('/gpus/rx-7900-gre'), 'gpus-rx-7900-gre');
    assert.equal(ogSlug('/gpus/rx-7700-xt'), 'gpus-rx-7700-xt');
    assert.equal(ogSlug('/gpus'), 'gpus');
    assert.equal(ogSlug('/rocm/faq'), 'rocm');
    assert.equal(ogSlug('/setup'), 'setup');
    assert.equal(ogSlug('/setup/windows'), 'setup-windows');
    assert.equal(ogSlug('/stack-lab'), 'stack-lab');
    assert.equal(ogSlug('/faq'), 'faq');
    assert.equal(ogSlug('/models'), 'models');
    assert.equal(ogSlug('/models/qwen36'), 'models-qwen36');
    assert.equal(ogSlug('/models/flash'), 'models-flash');
    assert.equal(ogSlug('/troubleshoot'), 'troubleshoot');
    assert.equal(ogSlug('/labs/shannon'), 'labs-shannon');
    assert.equal(ogSlug('/secure-lab'), 'secure-lab');
    assert.equal(ogSlug('/autoresearch'), 'autoresearch');
  });
});
