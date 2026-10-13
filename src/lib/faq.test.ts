import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  FAQ_ENTRIES,
  FAQ_GROUPS,
  FAQ_ITEMS,
  REQUIRED_FAQ_HREFS,
  assertFaqValid,
  faqHaystack,
  faqPlainAnswer,
  filterFaq,
  groupFaq,
  parseFaqQuery,
} from './faq';
import { faqPageJsonLd } from './jsonld';
import { ROCM_FAQ_ALL } from './rocm-faq';
import { ROCM_GLOSSARY } from './rocm-glossary';
import { COMPARE_Q3 } from './local-desktop-compare';

describe('FAQ source', () => {
  it('covers required groups, outbound links, and house rules', () => {
    assert.deepEqual(assertFaqValid(), []);
    assert.ok(FAQ_ENTRIES.length >= 16);
    assert.equal(FAQ_ITEMS.length, FAQ_ENTRIES.length);
    assert.equal(FAQ_GROUPS.length, 7);
    assert.ok(FAQ_ENTRIES.some((item) => item.id === 'what-is-amdai'));
    assert.ok(FAQ_ENTRIES.some((item) => item.id === 'open-in-stack-lab'));
    assert.ok(FAQ_ENTRIES.some((item) => item.id === 'radeon-vs-nvidia'));
    assert.ok(FAQ_ENTRIES.some((item) => item.id === 'affiliate-links'));
    const questions = FAQ_ENTRIES.map((item) => item.question);
    assert.equal(new Set(questions).size, questions.length);
    const blob = FAQ_ENTRIES.map((item) => `${item.question} ${item.answer}`).join('\n');
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /TODO|TBD|FIXME|lorem ipsum/i);
    const q3 = FAQ_ENTRIES.find((item) => item.id === 'when-is-q3-an-estimate');
    assert.ok(q3);
    assert.match(q3.answer, /estimate/i);
    assert.match(q3.answer, new RegExp(COMPARE_Q3));
    const hrefs = new Set(FAQ_ENTRIES.flatMap((item) => item.links.map((link) => link.href.split('?')[0] ?? link.href)));
    for (const required of REQUIRED_FAQ_HREFS) {
      assert.ok(
        [...hrefs].some((href) => href === required || href.startsWith(`${required}/`)),
        required,
      );
    }
  });

  it('filters, shares ?q=, and groups sections', () => {
    assert.equal(parseFaqQuery('?q=vulkan'), 'vulkan');
    assert.equal(parseFaqQuery(new URLSearchParams('q=system+RAM')), 'system RAM');
    assert.equal(parseFaqQuery(''), '');
    const vulkan = filterFaq('vulkan');
    assert.ok(vulkan.some((item) => item.id === 'vulkan-or-hip'));
    const ram = filterFaq('full context');
    assert.ok(ram.some((item) => item.id === 'min-ram-vs-full-context'));
    assert.ok(filterFaq('rakuten').some((item) => item.id === 'affiliate-links'));
    assert.ok(filterFaq('open in stack lab').some((item) => item.id === 'open-in-stack-lab'));
    assert.ok(filterFaq('what is amdai').some((item) => item.id === 'what-is-amdai'));
    assert.ok(filterFaq('nvidia').some((item) => item.id === 'radeon-vs-nvidia'));
    assert.equal(filterFaq('zzzz-no-such-faq').length, 0);
    assert.equal(filterFaq('').length, FAQ_ENTRIES.length);
    const grouped = groupFaq();
    assert.equal(grouped.length, FAQ_GROUPS.length);
    const gpu = FAQ_ENTRIES.find((item) => item.id === 'which-gpu');
    assert.ok(gpu && faqHaystack(gpu).includes('gpu'));
    assert.match(faqPlainAnswer(gpu!), /See /);
  });

  it('builds FAQPage JSON-LD without price or rating keys', () => {
    const ld = faqPageJsonLd(FAQ_ITEMS, 'https://amdai.net/faq');
    assert.equal(ld['@type'], 'FAQPage');
    assert.equal(ld.url, 'https://amdai.net/faq');
    assert.ok(Array.isArray(ld.mainEntity));
    assert.equal((ld.mainEntity as unknown[]).length, FAQ_ITEMS.length);
    const first = (ld.mainEntity as Array<{ '@type': string; name: string; acceptedAnswer: { text: string } }>)[0];
    assert.equal(first?.['@type'], 'Question');
    assert.ok((first?.acceptedAnswer.text.length ?? 0) > 20);
    const encoded = JSON.stringify(ld);
    assert.doesNotMatch(encoded, /aggregateRating|offers|"price"/i);
    assert.doesNotMatch(encoded, /Qwen2\.5|Qwen3-8B/);
  });

  it('keeps ROCm FAQ and glossary in shared modules', () => {
    assert.ok(ROCM_FAQ_ALL.length >= 10);
    assert.ok(ROCM_GLOSSARY.some((term) => term.term === 'ROCm'));
    assert.ok(ROCM_GLOSSARY.some((term) => term.term === 'Radeon AI PRO R9700'));
    assert.doesNotMatch(ROCM_FAQ_ALL.map((item) => item.answer).join(' '), /Qwen2\.5|Qwen3-8B/);
  });
});
