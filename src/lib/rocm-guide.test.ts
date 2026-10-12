import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  citations,
  citeNumber,
  rocmNeighbors,
  rocmPage,
  rocmPages,
  type CiteKey,
} from './rocm-guide';

describe('ROCm guide map', () => {
  it('has eight unique pages starting at /rocm', () => {
    assert.equal(rocmPages.length, 8);
    const hrefs = rocmPages.map((page) => page.href);
    assert.deepEqual(hrefs, [
      '/rocm',
      '/rocm/stack',
      '/rocm/gfx',
      '/rocm/vulkan-hip',
      '/rocm/versions',
      '/rocm/history',
      '/rocm/glossary',
      '/rocm/faq',
    ]);
    assert.equal(new Set(hrefs).size, hrefs.length);
    assert.equal(new Set(rocmPages.map((page) => page.id)).size, 8);
  });

  it('neighbors wrap only at the ends', () => {
    assert.equal(rocmNeighbors('overview').prev, null);
    assert.equal(rocmNeighbors('overview').next?.id, 'stack');
    assert.equal(rocmNeighbors('faq').next, null);
    assert.equal(rocmNeighbors('faq').prev?.id, 'glossary');
    assert.equal(rocmPage('gfx').href, '/rocm/gfx');
  });

  it('numbers citations in page order and rejects missing keys', () => {
    const used = ['rocmHome', 'rocm101Notes'] as const satisfies readonly CiteKey[];
    assert.equal(citeNumber(used, 'rocmHome'), 1);
    assert.equal(citeNumber(used, 'rocm101Notes'), 2);
    assert.throws(() => citeNumber(used, 'hipWhat'));
  });

  it('keeps every citation on an http(s) URL', () => {
    for (const [key, row] of Object.entries(citations)) {
      assert.match(row.href, /^https:\/\//, key);
      assert.ok(row.title.length > 3, key);
      assert.ok(row.publisher.length > 1, key);
    }
  });
});
