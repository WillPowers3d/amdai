import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { autolinkHtml, autolinkPhrases } from './autolink';

describe('first-mention autolink', () => {
  it('links distinctive backend, model, GPU, and glossary phrases once', () => {
    const phrases = autolinkPhrases();
    assert.ok(phrases.some((row) => row.href === '/backends/llamacpp' && row.phrase === 'llama.cpp'));
    assert.ok(phrases.some((row) => row.href === '/models/qwen36'));
    assert.ok(phrases.some((row) => row.href === '/gpus/r9700' && row.phrase === 'R9700'));
    assert.ok(phrases.some((row) => row.href === '/glossary#rocm' && row.phrase === 'ROCm'));
    assert.ok(!phrases.some((row) => row.phrase === 'AMDai'));
    assert.ok(!phrases.some((row) => row.phrase === 'engine' || row.phrase === '4K'));

    const html = `<html><head><meta name="description" content="Run llama.cpp first on the R9700." /></head><body>
      <header><a href="/">Home</a> llama.cpp in the header</header>
      <h1>ROCm on a R9700</h1>
      <main>
        <p>Run llama.cpp first on the R9700. Then more llama.cpp.</p>
        <p>ROCm sits next to CUDA. A second ROCm mention stays plain.</p>
        <pre><code>llama.cpp --help</code></pre>
        <p>See <a href="/software">llama.cpp notes</a>.</p>
        <img src="/og/gpus-r9700.png" alt="Radeon AI PRO R9700 card" />
      </main>
    </body></html>`;
    const out = autolinkHtml(html, '/setup');
    assert.match(out, /data-autolink="backend:llamacpp"/);
    assert.match(out, /data-autolink="gpu:r9700"/);
    assert.match(out, /data-autolink="glossary:rocm"/);
    assert.equal((out.match(/data-autolink="backend:llamacpp"/g) || []).length, 1);
    assert.equal((out.match(/data-autolink="gpu:r9700"/g) || []).length, 1);
    assert.doesNotMatch(out, /data-autolink="gpu:r9700"><a /);
    assert.match(out, /content="Run llama.cpp first on the R9700."/);
    assert.match(out, /src="\/og\/gpus-r9700.png"/);
    assert.match(out, /alt="Radeon AI PRO R9700 card"/);
    assert.match(out, /<h1>ROCm on a R9700<\/h1>/);
    assert.match(out, /<pre><code>llama\.cpp --help<\/code><\/pre>/);
    assert.doesNotMatch(out, /Qwen2\.5|Qwen3-8B/);
  });

  it('does not link a page to itself and skips glossary terms on /glossary', () => {
    const backend = autolinkHtml('<main><p>llama.cpp first.</p></main>', '/backends/llamacpp');
    assert.doesNotMatch(backend, /data-autolink="backend:llamacpp"/);
    const glossary = autolinkHtml('<main><p>ROCm is the stack.</p></main>', '/glossary');
    assert.doesNotMatch(glossary, /data-autolink="glossary:rocm"/);
  });
});
