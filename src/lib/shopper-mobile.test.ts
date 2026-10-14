import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { documentTitle, pageDescription } from './seo';
import { ogImagePath } from './og';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const SHOPPER = [
  '/',
  '/start',
  '/calculator',
  '/budget',
  '/can-run',
  '/compare/gpus',
  '/compare/models',
  '/gpus/r9700',
  '/gpus/rx-9070-xt',
  '/setup',
  '/benchmarks',
] as const;

describe('shopper mobile polish', () => {
  it('keeps header and code cards from blowing out a 375px viewport', () => {
    const css = readFileSync(join(root, 'styles/global.css'), 'utf8');
    const header = readFileSync(join(root, 'components/Header.astro'), 'utf8');
    assert.match(css, /overflow-x:\s*clip/);
    assert.match(css, /#main article/);
    assert.match(css, /min-width:\s*0/);
    assert.match(header, /overflow-x:\s*clip/);
    assert.match(header, /min-w-0/);
    assert.match(header, /px-3 text-sm sm:px-4 lg:hidden/);
  });

  it('uses the existing field tap target on shopper pickers', () => {
    for (const file of ['pages/can-run/index.astro', 'pages/compare/gpus.astro', 'pages/compare/models.astro']) {
      const src = readFileSync(join(root, file), 'utf8');
      assert.match(src, /class="field mt-1"/);
      assert.doesNotMatch(src, /<select[^>]+py-2 text-ink/);
    }
  });

  it('keeps unique title, description, and OG on shopper routes', () => {
    const titles = new Set<string>();
    const descs = new Set<string>();
    for (const path of SHOPPER) {
      const title = documentTitle(path);
      const desc = pageDescription(path);
      assert.ok(title.length > 8, path);
      assert.ok(desc.length > 20, path);
      assert.equal(titles.has(title), false, `duplicate title ${title}`);
      assert.equal(descs.has(desc), false, `duplicate description ${path}`);
      titles.add(title);
      descs.add(desc);
      assert.match(ogImagePath(path), /\.png$/);
    }
  });
});
