import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  REQUIRED_SETUP_HREFS,
  SETUP_HOWTO_STEPS,
  SETUP_PATHS,
  SETUP_PUBLISHED,
  assertSetupValid,
  setupBlob,
  setupHrefs,
} from './setup';
import { howToJsonLd } from './jsonld';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';

describe('first-run setup', () => {
  it('keeps Ubuntu measured, Windows estimated, and required links', () => {
    assert.deepEqual(assertSetupValid(), []);
    assert.equal(SETUP_PATHS[0]?.id, 'ubuntu');
    assert.equal(SETUP_PATHS[1]?.id, 'windows');
    assert.ok(SETUP_PATHS[0]?.steps.every((step) => step.measured));
    assert.ok(SETUP_PATHS[1]?.steps.every((step) => !step.measured));
    const hrefs = setupHrefs();
    for (const required of REQUIRED_SETUP_HREFS) {
      assert.ok(hrefs.includes(required), required);
    }
    const blob = setupBlob();
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /no public download/i);
  });

  it('builds HowTo JSON-LD from the Ubuntu steps and stays in the sitemap', () => {
    const ld = howToJsonLd({
      name: 'First-run setup',
      description: 'Ubuntu 24.04+ first token on a Radeon.',
      url: 'https://amdai.net/setup',
      published: SETUP_PUBLISHED,
      modified: SETUP_PUBLISHED,
      steps: SETUP_HOWTO_STEPS,
    });
    assert.equal(ld['@type'], 'HowTo');
    assert.ok(Array.isArray(ld.step));
    assert.equal((ld.step as unknown[]).length, SETUP_PATHS[0]?.steps.length);
    assert.doesNotMatch(JSON.stringify(ld), /aggregateRating|offers|"price"/i);
    assert.equal(shouldNoindex('/setup'), false);
    assert.equal(isSitemapExcluded('/setup'), false);
    assert.ok(primaryNav.some((item) => item.href === '/setup'));
  });
});
