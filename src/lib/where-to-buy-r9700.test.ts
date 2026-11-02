import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PII_TEXT } from './pii-denylist';
import { shouldNoindex } from './seo';
import {
  WHERE_TO_BUY_CHECKED,
  WHERE_TO_BUY_DESCRIPTION,
  WHERE_TO_BUY_MICRO_NOTE,
  WHERE_TO_BUY_NEWEGG_NOTE,
  WHERE_TO_BUY_PATH,
  WHERE_TO_BUY_ROWS,
  WHERE_TO_BUY_TITLE,
} from './where-to-buy-r9700';

const here = dirname(fileURLToPath(import.meta.url));

function read(rel: string): string {
  return readFileSync(join(here, rel), 'utf8');
}

describe('where to buy R9700', () => {
  it('is indexable and only shows dated Newegg prices', () => {
    assert.equal(WHERE_TO_BUY_PATH, '/where-to-buy-r9700');
    assert.equal(WHERE_TO_BUY_CHECKED, '2026-11-02');
    assert.ok(WHERE_TO_BUY_TITLE.length > 10);
    assert.ok(WHERE_TO_BUY_DESCRIPTION.length >= 70);
    assert.ok(WHERE_TO_BUY_DESCRIPTION.length <= 160);
    assert.equal(shouldNoindex(WHERE_TO_BUY_PATH), false);
    assert.match(WHERE_TO_BUY_NEWEGG_NOTE, /\$2,799\.99/);
    assert.match(WHERE_TO_BUY_MICRO_NOTE, /No Micro Center price/);
    const micro = WHERE_TO_BUY_ROWS.find((row) => row.store === 'Micro Center');
    assert.equal(micro?.price, 'No price on this page');
    assert.doesNotMatch(WHERE_TO_BUY_NEWEGG_NOTE, /hurry|limited time|act now|buy now/i);
  });

  it('wires the page, homepage, GPU sheet, and filtered Newegg hop', () => {
    const page = read('../pages/where-to-buy-r9700.astro');
    const home = read('../pages/index.astro');
    const start = read('../components/StartHere.astro');
    const r9700 = read('../pages/gpus/r9700.astro');
    const products = read('../data/products.yaml');
    const hop = read('../pages/go/[retailer]/[product].astro');
    assert.match(page, /AffiliateDisclosure/);
    assert.match(page, /Check R9700 stock at Newegg/);
    assert.match(home, /StartHere/);
    assert.match(start, /goPath\('newegg', 'r9700'/);
    assert.match(start, /home-start/);
    assert.match(r9700, /gpu-r9700-top/);
    assert.match(products, /N=100007709/);
    assert.match(hop, /utm_/);
    for (const file of [
      '../pages/where-to-buy-r9700.astro',
      '../components/StartHere.astro',
      './where-to-buy-r9700.ts',
    ]) {
      const text = read(file);
      assert.doesNotMatch(text, PII_TEXT, file);
      assert.doesNotMatch(text, /\/home\/|\/Users\//, file);
    }
  });
});
