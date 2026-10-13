import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runs } from './run-card-data';
import {
  OG_CARDS,
  OG_HEIGHT,
  OG_ORIGIN,
  OG_WIDTH,
  REQUIRED_OG_SLUGS,
  assertOgValid,
  measuredOgHeadline,
  ogCardHtml,
  ogImageAlt,
  ogImagePath,
  ogImageUrl,
  ogLede,
  ogSlug,
  renderOgCards,
} from './og';

const here = dirname(fileURLToPath(import.meta.url));
const ogDir = join(here, '../../public/og');

describe('OG catalog', () => {
  it('covers required pages and keeps house rules', () => {
    assert.deepEqual(assertOgValid(runs), []);
    assert.equal(OG_WIDTH, 1200);
    assert.equal(OG_HEIGHT, 630);
    assert.equal(OG_ORIGIN, 'https://amdai.net');
    for (const slug of REQUIRED_OG_SLUGS) {
      assert.ok(OG_CARDS.some((card) => card.slug === slug), slug);
    }
    assert.equal(ogSlug('/'), 'home');
    assert.equal(ogSlug('/gpus/r9700'), 'gpus-r9700');
    assert.equal(ogSlug('/gpus/strix-halo'), 'gpus-strix-halo');
    assert.equal(ogSlug('/gpus/rx-9070-xt'), 'gpus-rx-9070-xt');
    assert.equal(ogSlug('/gpus/rx-9060-xt'), 'gpus-rx-9060-xt');
    assert.equal(ogSlug('/benchmarks'), 'benchmarks');
    assert.equal(ogSlug('/compare'), 'compare');
    assert.equal(ogSlug('/compare/radeon-vs-nvidia'), 'compare-radeon-vs-nvidia');
    assert.equal(ogSlug('/calculator'), 'calculator');
    assert.equal(ogSlug('/budget'), 'budget');
    assert.equal(ogSlug('/setup'), 'setup');
    assert.equal(ogSlug('/setup/windows'), 'setup-windows');
    assert.equal(ogSlug('/stack-lab'), 'stack-lab');
    assert.equal(ogSlug('/faq'), 'faq');
    assert.equal(ogSlug('/models'), 'models');
    assert.equal(ogSlug('/models/qwen36'), 'models-qwen36');
    assert.equal(ogSlug('/models/flash'), 'models-flash');
    assert.equal(ogSlug('/multi-gpu'), 'multi-gpu');
    assert.equal(ogSlug('/troubleshoot'), 'troubleshoot');
    assert.equal(ogSlug('/labs'), 'labs');
    assert.equal(ogSlug('/labs/shannon'), 'labs-shannon');
    assert.equal(ogSlug('/secure-lab'), 'secure-lab');
    assert.equal(ogSlug('/autoresearch'), 'autoresearch');
    assert.equal(ogSlug('/about'), 'about');
    assert.equal(ogSlug('/methodology'), 'methodology');
    assert.equal(ogSlug('/contact'), 'contact');
    assert.equal(ogSlug('/terms'), 'terms');
    assert.equal(ogSlug('/accessibility'), 'default');
    assert.equal(ogSlug('/privacy'), 'default');
    assert.equal(ogImagePath('/setup'), '/og/setup.png');
    assert.equal(ogImageUrl('/gpus/r9700'), 'https://amdai.net/og/gpus-r9700.png');
    assert.match(ogImageUrl('/faq'), /^https:\/\/amdai\.net\/og\//);
    assert.match(ogImageAlt('/'), /^AMDai/);
    assert.match(ogImageAlt('/setup'), /^AMDai/);
  });

  it('cites the UD-Q5 1× 4K card on measured ledes and never invents tok/s', () => {
    const headline = measuredOgHeadline(runs);
    assert.ok(headline);
    assert.match(headline, /UD-Q5 1× 4K \d+(?:\.\d+)? tok\/s/);
    const home = ogLede('home', runs);
    const r9700 = ogLede('gpus-r9700', runs);
    const benches = ogLede('benchmarks', runs);
    const compare = ogLede('compare', runs);
    assert.match(home, /\d+(?:\.\d+)? tok\/s/);
    assert.match(r9700, /32 GB/);
    assert.match(r9700, /\d+(?:\.\d+)? tok\/s/);
    assert.match(benches, /\d+(?:\.\d+)? tok\/s/);
    assert.match(compare, /vs split/);
    assert.match(compare, /\d+(?:\.\d+)? tok\/s/);
    assert.equal(ogLede('setup', runs), 'Ubuntu 24.04+ to first token');
    assert.equal(ogLede('faq', runs), 'First-time Radeon local-LLM answers');
    const rendered = renderOgCards(runs);
    assert.ok(rendered.every((card) => !/\$\d/.test(card.lede)));
    assert.ok(rendered.every((card) => !/Qwen2\.5|Qwen3-8B/i.test(`${card.title} ${card.lede}`)));
  });

  it('renders a dark ember card with the AMDai wordmark', () => {
    const html = ogCardHtml({
      title: 'First-run setup',
      lede: 'Ubuntu 24.04+ to first token',
      fontHref: 'file:///fonts/geist-latin.woff2',
    });
    assert.match(html, /AMD<span class="ai">ai<\/span>/);
    assert.match(html, /#e24a2f/);
    assert.match(html, /#08080b/);
    assert.match(html, /1200px/);
    assert.match(html, /630px/);
    assert.match(html, /amdai\.net/);
    assert.doesNotMatch(html, /\$\d/);
    assert.doesNotMatch(html, /Qwen2\.5|Qwen3-8B/);
  });

  it('has a static PNG for every catalog slug', () => {
    for (const card of OG_CARDS) {
      assert.ok(existsSync(join(ogDir, `${card.slug}.png`)), card.slug);
    }
  });
});
