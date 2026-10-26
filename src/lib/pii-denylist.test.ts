import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PII_HOST, PII_TEXT } from './pii-denylist';

describe('pii-denylist', () => {
  it('matches assembled scrubbed tokens without storing them as literals', () => {
    const host = String.fromCharCode(119, 116, 112, 97, 105, 49);
    const given = String.fromCharCode(119, 105, 108, 108, 105, 97, 109);
    const handle = String.fromCharCode(119, 105, 108, 108, 112, 111, 119, 101, 114, 115);
    assert.equal(host.length, 6);
    assert.equal(given.length, 7);
    assert.equal(handle.length, 10);
    assert.ok(PII_HOST.test(host));
    assert.ok(PII_TEXT.test(host));
    assert.ok(PII_TEXT.test(given));
    assert.ok(PII_TEXT.test(handle));
    assert.ok(PII_TEXT.test(given.toUpperCase()));
    assert.equal(PII_TEXT.test('amdai'), false);
    assert.equal(PII_TEXT.test('local-desktop'), false);
  });
});
