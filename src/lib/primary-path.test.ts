import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { navGroups, primaryNav } from './site';
import {
  DAILY_RECIPE,
  HIGH_TRAFFIC_PATHS,
  NAV_SURFACED,
  PINNED_NAV,
  PRIMARY_PATH,
  REQUIRED_HOME_START_HREFS,
  assertPrimaryPathValid,
  nextStepsFor,
  primaryPathHrefs,
} from './primary-path';

const here = dirname(fileURLToPath(import.meta.url));

function read(rel: string): string {
  return readFileSync(join(here, rel), 'utf8');
}

describe('primary path and nav IA', () => {
  it('keeps one conversion path with only real routes', () => {
    assert.deepEqual(assertPrimaryPathValid(), []);
    assert.equal(DAILY_RECIPE, '/recipes/qwen36-35b.llamacpp-vulkan.262k');
    assert.ok(PRIMARY_PATH.some((step) => step.href === '/setup'));
    assert.ok(PRIMARY_PATH.some((step) => step.href === '/gpus/r9700'));
    assert.ok(PRIMARY_PATH.some((step) => step.href === '/stack-lab'));
    assert.ok(primaryPathHrefs().includes('/budget'));
    assert.ok(primaryPathHrefs().includes('/qwen36-dual'));
    assert.doesNotMatch(PRIMARY_PATH.map((step) => step.href).join(' '), /two-r9700/);
    const blob = PRIMARY_PATH.map((step) => `${step.label} ${step.body}`).join('\n');
    assert.match(blob, /not published yet/i);
    assert.doesNotMatch(blob, /upcoming|coming soon/i);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\$\d/);
  });

  it('puts the required hrefs on home and /start', () => {
    const home = read('../pages/index.astro');
    const start = read('../pages/start.astro');
    const blob = `${home}\n${start}`;
    for (const href of REQUIRED_HOME_START_HREFS) {
      assert.ok(blob.includes(`href="${href}"`) || blob.includes(`href: '${href}'`) || blob.includes(`](${href})`) || blob.includes(`"${href}"`), href);
    }
    assert.match(home, /href="\/start"/);
    assert.match(home, /href="\/setup"/);
    assert.match(home, /href="\/benchmarks"/);
    assert.match(home, /PrimaryPath/);
    assert.match(start, /PrimaryPath/);
    assert.match(home, /NextSteps/);
    assert.match(start, /NextSteps/);
    assert.match(start, /measuredOgHeadline/);
    assert.match(start, /Ubuntu 24\.04\+/);
    assert.match(start, /setup#windows/);
    assert.doesNotMatch(start, /The longer map/);
    assert.doesNotMatch(blob, /\/two-r9700/);
    assert.doesNotMatch(blob, /upcoming|coming soon/i);
  });

  it('surfaces Path / Tools / Learn routes in nav, not only the footer', () => {
    assert.deepEqual(
      navGroups.map((group) => group.id),
      ['path', 'tools', 'learn'],
    );
    assert.deepEqual(
      navGroups.map((group) => group.label),
      ['Path', 'Tools', 'Learn'],
    );
    for (const href of NAV_SURFACED) {
      const item = primaryNav.find((row) => row.href === href);
      assert.ok(item, href);
    }
    assert.equal(primaryNav.find((row) => row.href === '/setup')?.group, 'path');
    assert.equal(primaryNav.find((row) => row.href === '/calculator')?.group, 'tools');
    assert.equal(primaryNav.find((row) => row.href === '/faq')?.group, 'learn');
    assert.equal(primaryNav.find((row) => row.href === '/stack-lab')?.group, 'path');
    const header = read('../components/Header.astro');
    assert.match(header, /PINNED_NAV/);
    for (const href of PINNED_NAV) {
      assert.ok(primaryNav.some((row) => row.href === href), href);
    }
    assert.match(header, /href="\/start"/);
  });

  it('gives each high-traffic page a Next steps block to real routes', () => {
    const files: Record<string, string> = {
      '/': '../pages/index.astro',
      '/start': '../pages/start.astro',
      '/setup': '../pages/setup.astro',
      '/faq': '../pages/faq.astro',
      '/gpus/r9700': '../pages/gpus/r9700.astro',
      '/gpus/rx7900xtx': '../pages/gpus/[id].astro',
      '/gpus/rx7900xt': '../pages/gpus/[id].astro',
      '/gpus/rx7800xt': '../pages/gpus/[id].astro',
      '/multi-gpu': '../pages/multi-gpu.astro',
      '/benchmarks': '../pages/benchmarks.astro',
      '/compare': '../pages/compare/index.astro',
      '/stack-lab': '../pages/stack-lab.astro',
      '/about': '../pages/about.astro',
      '/methodology': '../pages/methodology.astro',
      '/contact': '../pages/contact.astro',
      '/terms': '../pages/terms.astro',
      '/amdai-bench': '../pages/amdai-bench/index.astro',
    };
    assert.deepEqual(HIGH_TRAFFIC_PATHS.sort(), Object.keys(files).sort());
    for (const [path, rel] of Object.entries(files)) {
      const src = read(rel);
      assert.match(src, /NextSteps/, path);
      for (const link of nextStepsFor(path)) {
        assert.match(link.href, /^\//);
        assert.doesNotMatch(link.href, /two-r9700/);
      }
    }
  });
});
