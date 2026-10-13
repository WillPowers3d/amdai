import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  REQUIRED_STACK_LAB_HREFS,
  STACK_LAB_CLI,
  STACK_LAB_INSTALL,
  STACK_LAB_JOBS,
  STACK_LAB_NAME,
  STACK_LAB_PUBLISHED,
  assertStackLabValid,
  stackLabBlob,
  stackLabHrefs,
} from './stack-lab';
import { softwareApplicationJsonLd } from './jsonld';
import { primaryNav } from './site';
import { documentTitle, isSitemapExcluded, pageDescription, shouldNoindex } from './seo';

describe('Radeon Stack Lab', () => {
  it('keeps Ubuntu first, packages unpublished, and required links', () => {
    assert.deepEqual(assertStackLabValid(), []);
    assert.equal(STACK_LAB_NAME, 'Radeon Stack Lab');
    assert.equal(STACK_LAB_PUBLISHED, '2026-10-13');
    assert.equal(STACK_LAB_INSTALL.published, false);
    assert.equal(STACK_LAB_JOBS.length, 8);
    const hrefs = stackLabHrefs();
    for (const required of REQUIRED_STACK_LAB_HREFS) {
      assert.ok(hrefs.includes(required), required);
    }
    const blob = stackLabBlob();
    assert.match(blob, /packages not published yet/i);
    assert.match(blob, /no public download/i);
    assert.match(blob, /Ubuntu 24\.04/);
    assert.match(blob, /Check my rig/);
    assert.match(blob, /Setup doctor/);
    assert.match(blob, /amdai-bench\.ts/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /stacklab:\/\//i);
    assert.match(blob, /amdai-stack-lab:/);
    assert.doesNotMatch(blob, /coming soon/i);
    assert.ok(STACK_LAB_CLI.commands.every((cmd) => cmd.includes('amdai-bench.ts')));
  });

  it('builds SoftwareApplication JSON-LD without price or rating keys', () => {
    const ld = softwareApplicationJsonLd({
      name: STACK_LAB_NAME,
      description: 'Ubuntu 24.04+ companion for AMDai Lab Notes.',
      url: 'https://amdai.net/stack-lab',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Linux',
    });
    assert.equal(ld['@type'], 'SoftwareApplication');
    assert.equal(ld.name, STACK_LAB_NAME);
    assert.equal(ld.url, 'https://amdai.net/stack-lab');
    assert.doesNotMatch(JSON.stringify(ld), /aggregateRating|offers|"price"/i);
    assert.equal(shouldNoindex('/stack-lab'), false);
    assert.equal(isSitemapExcluded('/stack-lab'), false);
    assert.ok(primaryNav.some((item) => item.href === '/stack-lab'));
    assert.ok(documentTitle('/stack-lab').endsWith(' · AMDai'));
    assert.match(pageDescription('/stack-lab'), /not published yet/);
  });
});
