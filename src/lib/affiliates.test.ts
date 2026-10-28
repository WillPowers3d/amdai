import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { goPath, neweggFirstFromValue, orderRetailers, sanitizeGoSrc } from './go-src';

const here = dirname(fileURLToPath(import.meta.url));

describe('affiliate /go/ helpers', () => {
  it('appends a safe src tag and leaves bare paths unchanged', () => {
    assert.equal(goPath('newegg', 'r9700'), '/go/newegg/r9700');
    assert.equal(goPath('newegg', 'ddr5-kit', 'canrun-nextstep'), '/go/newegg/ddr5-kit?src=canrun-nextstep');
    assert.equal(goPath('amazon', 'r9700', 'canrun-footer'), '/go/amazon/r9700?src=canrun-footer');
    assert.equal(goPath('newegg', 'r9700', 'canrun-nextstep-alt'), '/go/newegg/r9700?src=canrun-nextstep-alt');
    assert.equal(sanitizeGoSrc('canrun-nextstep'), 'canrun-nextstep');
    assert.equal(sanitizeGoSrc('not a tag'), '');
    assert.equal(sanitizeGoSrc('../evil'), '');
    assert.equal(goPath('newegg', 'r9700', '../evil'), '/go/newegg/r9700');
  });

  it('keeps Amazon-first retailer order unless NEWEGG_FIRST is on', () => {
    assert.equal(neweggFirstFromValue(undefined), false);
    assert.equal(neweggFirstFromValue('0'), false);
    assert.equal(neweggFirstFromValue('1'), true);
    const retailers = [{ id: 'amazon' }, { id: 'newegg' }, { id: 'bhphoto' }];
    assert.deepEqual(
      orderRetailers(retailers, false).map((row) => row.id),
      ['amazon', 'newegg', 'bhphoto'],
    );
    assert.deepEqual(
      orderRetailers(retailers, true).map((row) => row.id),
      ['newegg', 'amazon', 'bhphoto'],
    );
    const affiliates = readFileSync(join(here, './affiliates.ts'), 'utf8');
    const buttons = readFileSync(join(here, '../components/BuyButtons.astro'), 'utf8');
    assert.match(affiliates, /NEWEGG_FIRST/);
    assert.match(affiliates, /neweggFirstEnabled/);
    assert.match(buttons, /buyRetailers/);
    assert.match(buttons, /src\?:/);
  });
});
