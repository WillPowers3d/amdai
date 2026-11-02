import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buyButtonAriaLabel, buyButtonLabel, buyLinkRel } from './buy-label';

const here = dirname(fileURLToPath(import.meta.url));

describe('buy button labels', () => {
  it('keeps visible text short and names the product in aria-label', () => {
    assert.equal(buyButtonLabel('Newegg'), 'Newegg: check price');
    assert.equal(buyButtonAriaLabel('AMD Radeon AI PRO R9700', 'Newegg'), 'Check AMD Radeon AI PRO R9700 price at Newegg (opens in a new tab)');
    assert.equal(buyLinkRel(true), 'sponsored nofollow noopener');
    assert.equal(buyLinkRel(false), 'noopener');
  });

  it('passes the buy-label lint selftest', () => {
    const script = join(here, '../../scripts/buy_label_lint.py');
    const out = execFileSync('python3', [script, '--selftest'], { encoding: 'utf8' });
    assert.match(out, /PASS/);
  });
});
