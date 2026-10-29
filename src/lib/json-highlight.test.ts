import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  apiEndpointStem,
  hashFromStem,
  isPlainActivate,
  isSafeApiPreviewPath,
  stemFromHash,
} from './api-preview';
import {
  escapeHtml,
  highlightJson,
  highlightPrettyJson,
  prettyJson,
  tokenizeJson,
} from './json-highlight';

const here = dirname(fileURLToPath(import.meta.url));

describe('JSON highlighter', () => {
  it('assigns distinct token kinds for keys, strings, numbers, keywords, and punctuation', () => {
    const source = prettyJson({
      name: 'R9700',
      vram_gb: 32,
      ok: true,
      note: null,
      nested: { flag: false, scores: [1, -2.5, 1e3] },
    });
    const kinds = new Set(tokenizeJson(source).map((token) => token.kind));
    assert.deepEqual(
      [...kinds].sort(),
      ['key', 'keyword', 'number', 'punct', 'space', 'string'].sort(),
    );
    const html = highlightJson(source);
    assert.match(html, /<span class="json-key">&quot;name&quot;<\/span>/);
    assert.match(html, /<span class="json-string">&quot;R9700&quot;<\/span>/);
    assert.match(html, /<span class="json-number">32<\/span>/);
    assert.match(html, /<span class="json-keyword">true<\/span>/);
    assert.match(html, /<span class="json-keyword">false<\/span>/);
    assert.match(html, /<span class="json-keyword">null<\/span>/);
    assert.match(html, /<span class="json-punct">\{<\/span>/);
    assert.match(html, /<span class="json-punct">:<\/span>/);
    assert.equal(html.includes('json-key">&quot;ok&quot;'), true);
    assert.equal(html.includes('json-string">&quot;ok&quot;'), false);
    assert.equal(highlightPrettyJson({ a: 1 }), highlightJson(prettyJson({ a: 1 })));
  });

  it('escapes HTML inside strings and treats escaped quotes as part of the string', () => {
    assert.equal(escapeHtml('<&">'), '&lt;&amp;&quot;&gt;');
    const html = highlightJson(prettyJson({ hint: 'use <code> & "quotes"' }));
    assert.match(html, /&lt;code&gt;/);
    assert.match(html, /&amp;/);
    assert.doesNotMatch(html, /<code>/);
    const escaped = tokenizeJson('"say \\"hi\\""');
    assert.equal(escaped.length, 1);
    assert.equal(escaped[0]!.kind, 'string');
    assert.equal(escaped[0]!.text, '"say \\"hi\\""');
  });

  it('does not treat the keyword true as a key when it is a value', () => {
    const tokens = tokenizeJson('{"true": true}');
    const words = tokens.filter((token) => token.kind !== 'space' && token.kind !== 'punct');
    assert.deepEqual(
      words.map((token) => [token.kind, token.text]),
      [
        ['key', '"true"'],
        ['keyword', 'true'],
      ],
    );
  });
});

describe('API preview helpers', () => {
  it('maps /api/v1/*.json paths to shareable hashes and rejects other hrefs', () => {
    assert.equal(apiEndpointStem('/api/v1/pick.json'), 'pick');
    assert.equal(apiEndpointStem('/api/v1/rocm-issues.json?x=1'), 'rocm-issues');
    assert.equal(apiEndpointStem('/api/v1/../secret.json'), null);
    assert.equal(isSafeApiPreviewPath('/api/v1/gpus.json'), true);
    assert.equal(isSafeApiPreviewPath('https://amdai.net/api/v1/gpus.json'), false);
    assert.equal(hashFromStem('pick'), '#pick');
    assert.equal(stemFromHash('#pick'), 'pick');
    assert.equal(isPlainActivate({ button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }), true);
    assert.equal(isPlainActivate({ button: 0, metaKey: true, ctrlKey: false, shiftKey: false, altKey: false }), false);
    assert.equal(isPlainActivate({ button: 1, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }), false);
  });

  it('keeps plain endpoint links as the no-JS fallback on the docs page', () => {
    const page = readFileSync(join(here, '../pages/api/index.astro'), 'utf8');
    assert.match(page, /<aside\b[^>]*id="api-preview"/);
    assert.match(page, /data-api-backdrop/);
    assert.match(page, /aria-live="polite"/);
    assert.match(page, /data-api-endpoint/);
    assert.match(page, /href={row\.path}/);
    assert.match(page, /data-api-copy/);
    assert.match(page, /data-api-raw/);
    assert.match(page, /data-api-close/);
    assert.doesNotMatch(page, /href={`#\$\{/);
  });
});
