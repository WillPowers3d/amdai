import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  NEWSLETTER_NAME,
  NEWSLETTER_TOPIC_IDS,
  confirm,
  createMemoryStore,
  memoryRateLimiter,
  parseTopics,
  subscribe,
  unsubscribeNewsletter,
  updateTopics,
} from './newsletter';
import { collectDigestItems } from './newsletter-collect';
import { buildDigest, newsletterSendAllowed } from './newsletter-digest';

function tokens() {
  let n = 0;
  return () => `tok${++n}`;
}

describe('newsletter signup', () => {
  it('double opt-in, confirm, topics, and one-click unsubscribe', () => {
    const store = createMemoryStore();
    const pending = subscribe(
      store,
      { email: 'Reader@amdai.example', topics: ['runs', 'guides'], ip: '1.1.1.1' },
      { now: 1_000, token: tokens(), origin: 'https://amdai.net' },
    );
    assert.equal(pending.ok, true);
    assert.equal(pending.code, 'pending');
    assert.equal(pending.subscriber?.confirmed, false);
    assert.deepEqual(pending.subscriber?.topics, ['runs', 'guides']);
    assert.match(pending.mail?.text ?? '', /newsletter\/confirm\?token=tok1/);
    assert.doesNotMatch(pending.mail?.text ?? '', /<img/i);

    const before = confirm(store, 'bad');
    assert.equal(before.ok, false);

    const ok = confirm(store, 'tok1', 2_000);
    assert.equal(ok.ok, true);
    assert.equal(ok.subscriber?.confirmed, true);
    assert.equal(store.getByEmail('reader@amdai.example')?.confirmed, true);

    const topics = updateTopics(store, { token: 'tok2', topics: ['problems', 'stack-lab'] }, 3_000);
    assert.equal(topics.ok, true);
    assert.deepEqual(topics.subscriber?.topics, ['problems', 'stack-lab']);

    const gone = unsubscribeNewsletter(store, 'tok2');
    assert.equal(gone.ok, true);
    assert.equal(store.getByEmail('reader@amdai.example'), undefined);
  });

  it('rate-limits and trips the honeypot without storing', () => {
    const store = createMemoryStore();
    const ipLimit = memoryRateLimiter(2, 60_000, () => 10_000);
    const first = subscribe(store, { email: 'a@amdai.example', ip: '9.9.9.9' }, { token: tokens(), ipLimit });
    const second = subscribe(store, { email: 'b@amdai.example', ip: '9.9.9.9' }, { token: tokens(), ipLimit });
    const third = subscribe(store, { email: 'c@amdai.example', ip: '9.9.9.9' }, { token: tokens(), ipLimit });
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    assert.equal(third.status, 429);
    assert.equal(store.listConfirmed().length, 0);

    const honey = subscribe(store, { email: 'bot@amdai.example', website: 'https://spam.example', ip: '8.8.8.8' }, { token: tokens() });
    assert.equal(honey.ok, true);
    assert.equal(honey.code, 'ignored');
    assert.equal(store.getByEmail('bot@amdai.example'), undefined);

    const bad = subscribe(store, { email: 'not-an-email', ip: '7.7.7.7' }, { token: tokens() });
    assert.equal(bad.status, 400);
  });

  it('defaults topics and never invents Q1/Q2 or banned models', () => {
    assert.deepEqual(parseTopics(['runs', 'nope', 'guides']), ['runs', 'guides']);
    const store = createMemoryStore();
    const row = subscribe(store, { email: 'all@amdai.example' }, { token: tokens() });
    assert.deepEqual(row.subscriber?.topics, [...NEWSLETTER_TOPIC_IDS]);
    const blob = JSON.stringify({ name: NEWSLETTER_NAME, topics: NEWSLETTER_TOPIC_IDS, row });
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
  });
});

describe('newsletter digest', () => {
  it('drafts HTML + text from fixtures and keeps send off without the switch', () => {
    const issue = buildDigest({
      since: '2026-10-01',
      until: '2026-10-13',
      items: [
        {
          topic: 'runs',
          title: 'UD-Q5_K_XL 4K llama.cpp card',
          href: 'https://amdai.net/results/local-desktop-20261012-2311-35b-udq5kxl-1gpu-4k-llamacpp-f16',
          date: '2026-10-12',
          summary: 'Official amdai-bench/run@1 card on local-desktop.',
        },
        {
          topic: 'guides',
          title: 'Getting started',
          href: 'https://amdai.net/start',
          date: '2026-09-01',
          summary: 'Too old — must drop.',
        },
        {
          topic: 'problems',
          title: 'HIP configure mess',
          href: 'https://amdai.net/rocm-problems/hip-configure',
          date: '2026-10-10',
          summary: 'Cited workaround on /rocm-problems.',
        },
        {
          topic: 'stack-lab',
          title: 'Radeon Stack Lab',
          href: 'https://www.amazon.com/dp/example',
          date: '2026-10-11',
          summary: 'Companion notes. Retailer link forces the affiliate line.',
        },
      ],
      unsubUrl: 'https://amdai.net/unsubscribe?token=tok',
    });
    assert.equal(issue.items.length, 3);
    assert.ok(!issue.items.some((item) => item.title === 'Getting started'));
    assert.equal(issue.hasAffiliateLinks, true);
    assert.match(issue.text, /Amazon Associate/);
    assert.match(issue.html, /Unsubscribe/);
    assert.doesNotMatch(issue.html, /<img/i);
    assert.doesNotMatch(issue.text, /Qwen2\.5|Qwen3-8B/);

    assert.equal(newsletterSendAllowed({ NEWSLETTER_SEND: undefined }, ['node', 'digest']).allowed, false);
    assert.equal(newsletterSendAllowed({ NEWSLETTER_SEND: '1' }, ['node', 'digest']).allowed, false);
    assert.equal(newsletterSendAllowed({ NEWSLETTER_SEND: '0' }, ['node', 'digest', '--send']).allowed, false);
    assert.equal(newsletterSendAllowed({ NEWSLETTER_SEND: '1' }, ['node', 'digest', '--send']).allowed, true);
  });

  it('collects dated repo items without inventing tok/s or banned models', () => {
    const items = collectDigestItems();
    assert.ok(items.length > 0);
    const blob = JSON.stringify(items);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    for (const item of items) {
      assert.match(item.date, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(item.href.startsWith('/') || item.href.startsWith('http'));
      assert.ok(item.title.length > 0);
    }
    const issue = buildDigest({ since: '2000-01-01', until: '2099-01-01', items });
    assert.doesNotMatch(issue.html, /<img/i);
  });
});
