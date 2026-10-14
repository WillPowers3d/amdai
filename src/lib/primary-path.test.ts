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
    assert.match(start, /\/setup\/windows/);
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
      '/setup/windows': '../pages/setup/windows.astro',
      '/setup/fedora': '../pages/setup/fedora.astro',
      '/setup/arch': '../pages/setup/arch.astro',
      '/setup/docker': '../pages/setup/docker.astro',
      '/setup/lm-studio': '../pages/setup/lm-studio.astro',
      '/setup/coding-assistant': '../pages/setup/coding-assistant.astro',
      '/setup/ollama': '../pages/setup/ollama.astro',
      '/setup/open-webui': '../pages/setup/open-webui.astro',
      '/setup/wsl': '../pages/setup/wsl.astro',
      '/setup/comfyui': '../pages/setup/comfyui.astro',
      '/setup/multi-gpu': '../pages/setup/multi-gpu.astro',
      '/guides/buying-used-radeon': '../pages/guides/buying-used-radeon.astro',
      '/faq': '../pages/faq.astro',
      '/gpus/r9700': '../pages/gpus/r9700.astro',
      '/gpus/strix-halo': '../pages/gpus/strix-halo.astro',
      '/gpus/rx-7900-xtx': '../pages/gpus/rx-7900-xtx.astro',
      '/gpus/rx-7900-xt': '../pages/gpus/rx-7900-xt.astro',
      '/gpus/rx-7800-xt': '../pages/gpus/rx-7800-xt.astro',
      '/gpus/rx-9070-xt': '../pages/gpus/rx-9070-xt.astro',
      '/gpus/rx-9060-xt': '../pages/gpus/rx-9060-xt.astro',
      '/gpus/rx-7900-gre': '../pages/gpus/rx-7900-gre.astro',
      '/gpus/rx-7700-xt': '../pages/gpus/rx-7700-xt.astro',
      '/gpus/rx-7600-xt': '../pages/gpus/rx-7600-xt.astro',
      '/gpus/rx-7600': '../pages/gpus/rx-7600.astro',
      '/gpus/rx-6800-xt': '../pages/gpus/rx-6800-xt.astro',
      '/gpus/rx-6700-xt': '../pages/gpus/rx-6700-xt.astro',
      '/gpus/rx-9070': '../pages/gpus/rx-9070.astro',
      '/gpus/rx-9070-gre': '../pages/gpus/rx-9070-gre.astro',
      '/gpus/rx-6950-xt': '../pages/gpus/rx-6950-xt.astro',
      '/gpus/w7900': '../pages/gpus/w7900.astro',
      '/gpus/w7800': '../pages/gpus/w7800.astro',
      '/gpus/w7700': '../pages/gpus/w7700.astro',
      '/gpus/w6800': '../pages/gpus/w6800.astro',
      '/multi-gpu': '../pages/multi-gpu.astro',
      '/benchmarks': '../pages/benchmarks.astro',
      '/compare': '../pages/compare/index.astro',
      '/compare/gpus': '../pages/compare/gpus.astro',
      '/compare/models': '../pages/compare/models.astro',
      '/compare/radeon-vs-nvidia': '../pages/compare/radeon-vs-nvidia.astro',
      '/compare/radeon-vs-mac': '../pages/compare/radeon-vs-mac.astro',
      '/compare/vulkan-vs-rocm': '../pages/compare/vulkan-vs-rocm.astro',
      '/stack-lab': '../pages/stack-lab.astro',
      '/about': '../pages/about.astro',
      '/methodology': '../pages/methodology.astro',
      '/contact': '../pages/contact.astro',
      '/terms': '../pages/terms.astro',
      '/amdai-bench': '../pages/amdai-bench/index.astro',
      '/models': '../pages/models/index.astro',
      '/models/qwen36': '../pages/models/[id].astro',
      '/models/flash': '../pages/models/[id].astro',
      '/models/gpt-oss-20b': '../pages/models/[id].astro',
      '/models/gemma3-27b': '../pages/models/[id].astro',
      '/models/llama33-70b': '../pages/models/[id].astro',
      '/models/glm-53-flash': '../pages/models/[id].astro',
      '/models/qwen36-27b': '../pages/models/[id].astro',
      '/models/qwen38-27b': '../pages/models/[id].astro',
      '/troubleshoot': '../pages/troubleshoot/index.astro',
      '/image-gen': '../pages/image-gen.astro',
      '/vision': '../pages/vision.astro',
      '/speech': '../pages/speech.astro',
      '/long-context': '../pages/long-context.astro',
      '/rag': '../pages/rag.astro',
      '/power': '../pages/power.astro',
      '/fine-tuning': '../pages/fine-tuning.astro',
      '/tuning': '../pages/tuning.astro',
      '/constrained-decoding': '../pages/constrained-decoding.astro',
      '/moe': '../pages/moe.astro',
      '/can-run': '../pages/can-run/index.astro',
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
