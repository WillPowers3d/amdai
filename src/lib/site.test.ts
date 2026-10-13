import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BRAND, HERO_HEADLINE, OG_SITE_NAME, primaryNav, site } from './site';
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
    assert.equal(OG_SITE_NAME, 'amdai');
    assert.notEqual(OG_SITE_NAME, BRAND);
  });

  it('keeps the exact hero headline and leaves lowercase product ids alone', () => {
    assert.equal(HERO_HEADLINE, 'Local Qwen on a R9700. Reliably.');
    assert.notEqual(HERO_HEADLINE, 'Local Qwen on a real R9700. Not a brochure.');
    assert.equal(AMDAI_BENCH_SCHEMA, 'amdai-bench');
    assert.match(site.tagline, /R9700/);
    const calc = primaryNav.find((item) => item.href === '/calculator');
    const quants = primaryNav.find((item) => item.href === '/quants');
    assert.match(calc?.description ?? '', /Q3/);
    assert.doesNotMatch(calc?.description ?? '', /Q4\+|Q4 floor|below Q4/i);
    assert.match(quants?.description ?? '', /Q3/);
    assert.doesNotMatch(quants?.description ?? '', /below Q4|Q4 floor/i);
  });
});
