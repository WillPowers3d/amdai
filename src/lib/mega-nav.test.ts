import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { wrapIndex } from './mega-nav';

describe('mega-nav keyboard helpers', () => {
  it('wraps left and right across the Path / Stack / Practice triggers', () => {
    assert.equal(wrapIndex(0, 3, 1), 1);
    assert.equal(wrapIndex(2, 3, 1), 0);
    assert.equal(wrapIndex(0, 3, -1), 2);
    assert.equal(wrapIndex(1, 3, -1), 0);
    assert.equal(wrapIndex(0, 0, 1), 0);
  });
});
