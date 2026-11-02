import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ramButtonForNeedGb } from './ram-button';

describe('RAM size-matched buy button', () => {
  it('maps full-context kit size to an existing /go/ product', () => {
    assert.equal(ramButtonForNeedGb(48)?.productId, 'ddr5-kit');
    assert.equal(ramButtonForNeedGb(64)?.productId, 'ddr5-kit');
    assert.equal(ramButtonForNeedGb(96)?.productId, 'ddr5-96');
    assert.equal(ramButtonForNeedGb(128)?.productId, 'ddr5-128');
    assert.equal(ramButtonForNeedGb(160)?.productId, 'ddr5-192');
    assert.equal(ramButtonForNeedGb(192)?.productId, 'ddr5-192');
    assert.equal(ramButtonForNeedGb(256)?.productId, 'ddr5-256');
    assert.equal(ramButtonForNeedGb(300), null);
    assert.equal(ramButtonForNeedGb(null), null);
    assert.match(ramButtonForNeedGb(192)?.label ?? '', /192 GB/);
    assert.doesNotMatch(ramButtonForNeedGb(192)?.label ?? '', /\$\d/);
  });
});
