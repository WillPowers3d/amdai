import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertHtmlTextSeparated,
  gluedSentenceHits,
  htmlToVisibleText,
  insertBlockSeparators,
} from './html-text';

describe('html sentence separators', () => {
  it('inserts a space after a citation before the next word', () => {
    const raw = '<p>inside that platform.<sup class="rocm-cite"><a href="#c">[2]</a></sup><strong>Vulkan</strong> is</p>';
    const fixed = insertBlockSeparators(raw);
    const text = htmlToVisibleText(fixed);
    assert.match(text, /\[2\] Vulkan/);
    assert.doesNotMatch(text, /\[2\]Vulkan/);
    assert.deepEqual(assertHtmlTextSeparated(fixed), []);
  });

  it('inserts a space after a period before the next inline tag', () => {
    const raw = '<p>libraries, wheels.<strong>HIP</strong> is the C++ API.</p>';
    const fixed = insertBlockSeparators(raw);
    assert.match(htmlToVisibleText(fixed), /wheels\. HIP/);
    assert.deepEqual(gluedSentenceHits(htmlToVisibleText(fixed)), []);
  });

  it('inserts a newline between adjacent blocks so list items do not glue', () => {
    const raw = '<ul><li>weekend path.</li><li>Windows. A full HIP userspace.</li></ul>';
    const glued = htmlToVisibleText(raw);
    assert.ok(gluedSentenceHits(glued).some((hit) => hit.match === 'h.W'));
    const fixed = insertBlockSeparators(raw);
    assert.deepEqual(assertHtmlTextSeparated(fixed), []);
  });

  it('flags the amdai glue patterns and leaves measured numbers alone', () => {
    const hits = gluedSentenceHits('wheels.HIP is the API.[2]Vulkan is 100.8 tok/s and gfx1201.');
    assert.ok(hits.some((hit) => hit.match === 's.H'));
    assert.ok(hits.some((hit) => hit.match === ']V'));
    assert.ok(!hits.some((hit) => hit.match.includes('100')));
  });
});
