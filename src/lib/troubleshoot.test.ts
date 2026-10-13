import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { faqPageJsonLd, howToJsonLd } from './jsonld';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import {
  FIRST_PARTY_CITES,
  REQUIRED_TROUBLE_HREFS,
  TROUBLESHOOT_GROUP_IDS,
  TROUBLESHOOT_HOWTO_STEPS,
  TROUBLESHOOT_HUB_LINKS,
  TROUBLESHOOT_PUBLISHED,
  assertTroubleshootValid,
  citationIsGrounded,
  filterSymptoms,
  groupSymptoms,
  loadTroubleshootFile,
  parseTroubleshootQuery,
  publishedSymptoms,
  symptomHaystack,
  troubleshootBlob,
  troubleshootFaqItems,
  troubleshootHrefs,
} from './troubleshoot';

const here = dirname(fileURLToPath(import.meta.url));
const file = loadTroubleshootFile();
const published = publishedSymptoms(file);

describe('troubleshoot catalog', () => {
  it('publishes cited symptoms and excludes needs_source rows', () => {
    assert.deepEqual(assertTroubleshootValid(file), []);
    assert.equal(file.as_of, TROUBLESHOOT_PUBLISHED);
    assert.ok(published.length >= 12);
    assert.ok(file.symptoms.some((row) => row.needs_source && row.id === 'mesa-radv-version'));
    assert.ok(!published.some((row) => row.id === 'mesa-radv-version'));
    assert.ok(!published.some((row) => row.needs_source));
    for (const id of TROUBLESHOOT_GROUP_IDS) {
      assert.ok(file.groups.some((group) => group.id === id), id);
      assert.ok(published.some((row) => row.group === id), `published ${id}`);
    }
    const ids = published.map((row) => row.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it('requires a citation and an internal link on every published symptom', () => {
    for (const item of published) {
      assert.ok(item.citations.some((cite) => citationIsGrounded(cite.href)), item.id);
      assert.ok(item.links.some((link) => link.href.startsWith('/')), item.id);
      assert.ok(item.checks.length >= 1, item.id);
      assert.ok(item.causes.length >= 1, item.id);
      for (const cite of item.citations) {
        assert.ok(citationIsGrounded(cite.href), `${item.id} ${cite.href}`);
        assert.match(cite.href, /^(https:\/\/|\/)/);
      }
    }
    for (const href of FIRST_PARTY_CITES) {
      assert.match(href, /^\/[a-z0-9/-]+$/);
    }
    const hrefs = new Set(troubleshootHrefs(file));
    for (const required of REQUIRED_TROUBLE_HREFS) {
      assert.ok(
        [...hrefs].some((href) => href === required || href.startsWith(`${required}/`) || href.startsWith(`${required}#`)),
        required,
      );
    }
  });

  it('keeps house rules and filters with ?q=', () => {
    const blob = troubleshootBlob(file);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
    assert.doesNotMatch(blob, /\bTODO\b|\bTBD\b|\bFIXME\b/);
    assert.match(blob, /Q3 is a labeled estimate/);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /DDR5-5200/);
    assert.match(blob, /00:14 CT/);
    assert.doesNotMatch(blob, /vulkaninfo/);
    assert.equal(parseTroubleshootQuery('?q=MODE1'), 'MODE1');
    assert.equal(parseTroubleshootQuery(new URLSearchParams('q=render+video')), 'render video');
    assert.equal(parseTroubleshootQuery(''), '');
    assert.ok(filterSymptoms('rocminfo').some((row) => row.id === 'rocminfo-empty'));
    assert.ok(filterSymptoms('MODE1').some((row) => row.id === 'mode1-hang'));
    assert.ok(filterSymptoms('windows').some((row) => row.id === 'windows-rocm'));
    assert.ok(filterSymptoms('two cards').some((row) => row.id === 'two-cards-slower'));
    assert.ok(filterSymptoms('DDR5').some((row) => row.id === 'ddr5-expo'));
    assert.equal(filterSymptoms('zzzz-no-such-symptom').length, 0);
    assert.equal(filterSymptoms('').length, published.length);
    const grouped = groupSymptoms();
    assert.equal(grouped.length, TROUBLESHOOT_GROUP_IDS.length);
    const first = published[0];
    assert.ok(first && symptomHaystack(first).includes(first.id));
  });

  it('builds HowTo and FAQPage JSON-LD without price or rating keys', () => {
    const faq = troubleshootFaqItems();
    assert.equal(faq.length, published.length);
    const faqLd = faqPageJsonLd(faq, 'https://amdai.net/troubleshoot');
    assert.equal(faqLd['@type'], 'FAQPage');
    assert.equal((faqLd.mainEntity as unknown[]).length, published.length);
    const howTo = howToJsonLd({
      name: 'Troubleshoot local AI on Radeon',
      description: 'Symptom-first checks for a home Radeon box.',
      url: 'https://amdai.net/troubleshoot',
      published: TROUBLESHOOT_PUBLISHED,
      modified: TROUBLESHOOT_PUBLISHED,
      steps: TROUBLESHOOT_HOWTO_STEPS,
    });
    assert.equal(howTo['@type'], 'HowTo');
    assert.equal((howTo.step as unknown[]).length, TROUBLESHOOT_HOWTO_STEPS.length);
    const encoded = `${JSON.stringify(faqLd)}\n${JSON.stringify(howTo)}`;
    assert.doesNotMatch(encoded, /aggregateRating|offers|"price"/i);
    assert.doesNotMatch(encoded, /Qwen2\.5|Qwen3-8B/);
    assert.equal(shouldNoindex('/troubleshoot'), false);
    assert.equal(isSitemapExcluded('/troubleshoot'), false);
    assert.ok(primaryNav.some((item) => item.href === '/troubleshoot'));
    assert.ok(TROUBLESHOOT_HUB_LINKS.some((link) => link.href === '/troubleshoot/errors'));
  });

  it('keeps hub commands in code blocks and leaves /troubleshoot/errors working', () => {
    const hub = readFileSync(join(here, '../pages/troubleshoot/index.astro'), 'utf8');
    const errors = readFileSync(join(here, '../pages/troubleshoot/errors.astro'), 'utf8');
    assert.match(hub, /<pre[\s\S]*<code>/);
    assert.match(hub, /check\.command/);
    assert.match(hub, /forumEnabled/);
    assert.match(hub, /HOUSE_STACK_LAB\.doctor/);
    assert.match(hub, /NextSteps/);
    assert.match(hub, /name="q"/);
    assert.match(hub, /method="get"/);
    assert.match(errors, /errorPatterns/);
    assert.match(errors, /href="\/troubleshoot"/);
    assert.match(errors, /forumEnabled/);
  });
});
