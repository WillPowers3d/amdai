import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { documentTitle, isSitemapExcluded, pageDescription, shouldNoindex } from './seo';
import { pageJsonLd, personJsonLdHits } from './jsonld';
import {
  ALLOWED_QUANT_BANDS,
  EMPTY_NEW_MODELS,
  FIT_VRAM,
  GGUF_PACKAGERS,
  NEW_MODELS_DESCRIPTION,
  NEW_MODELS_FEED,
  NEW_MODELS_H1,
  NEW_MODELS_JSON,
  NEW_MODELS_MEASUREMENT,
  NEW_MODELS_PATH,
  NEW_MODELS_PUBLISHED,
  NEW_MODELS_SCHEMA,
  NEW_MODELS_TITLE,
  NEW_MODELS_WINDOW_DAYS,
  allowedQuants,
  assertNewModelsValid,
  deriveRunsOn,
  estimateQ4KMGIB,
  fitForQ4,
  fitVerdict,
  loadNewModelsFile,
  newModelsFeedItems,
  normalizeRunsOn,
  quantBand,
  renderNewModelsRss,
  rowAnchor,
  sizeBand,
  temporalCoverage,
  type NewModelRow,
  type NewModelsFile,
} from './new-models';
import {
  RUN_ENGINE_IDS,
  loadEngineCatalogs,
  ollamaFamilySlug,
  strataFlashHit,
} from './new-model-engines';

const here = dirname(fileURLToPath(import.meta.url));

function sampleRow(over: Partial<NewModelRow> = {}): NewModelRow {
  return {
    id: 'LiquidAI/LFM2.5-24B-A2B',
    name: 'LFM2.5-24B-A2B',
    href: 'https://huggingface.co/LiquidAI/LFM2.5-24B-A2B',
    maker: 'LiquidAI',
    released: '2026-10-12',
    updated: '2026-10-12',
    params_b: 24,
    active_params_b: 2,
    architecture: 'Lfm2MoeForCausalLM',
    context: 131072,
    license: 'other',
    modalities: ['text'],
    pipeline: 'text-generation',
    downloads: 1000,
    likes: 100,
    trending: true,
    known_org: true,
    gguf: [
      {
        org: 'unsloth',
        repo: 'unsloth/LFM2.5-24B-A2B-GGUF',
        href: 'https://huggingface.co/unsloth/LFM2.5-24B-A2B-GGUF',
        quants: ['Q8_0', 'Q6_K', 'Q5_K_M', 'Q4_K_M', 'Q3_K_M'],
      },
    ],
    q4_k_m_gib: 13.5,
    q4_k_m_kind: 'estimate',
    fit: fitForQ4(13.5),
    size_band: '20-40B',
    runs_on: deriveRunsOn({
      id: 'LiquidAI/LFM2.5-24B-A2B',
      name: 'LFM2.5-24B-A2B',
      architecture: 'Lfm2MoeForCausalLM',
      gguf: [{}],
    }),
    ...over,
  };
}

describe('new open-weight models table', () => {
  it('keeps schema, fit math, and Q3–Q8 only', () => {
    assert.equal(NEW_MODELS_PATH, '/new-models');
    assert.equal(NEW_MODELS_JSON, '/data/new-models.json');
    assert.equal(NEW_MODELS_FEED, '/new-models/rss.xml');
    assert.equal(NEW_MODELS_SCHEMA, 'amdai-new-models/1');
    assert.equal(NEW_MODELS_WINDOW_DAYS, 90);
    assert.equal(NEW_MODELS_PUBLISHED, '2026-10-16');
    assert.equal(NEW_MODELS_TITLE, 'New open-weight models');
    assert.equal(NEW_MODELS_H1, 'New open-weight models');
    assert.ok(NEW_MODELS_DESCRIPTION.length >= 70);
    assert.ok(NEW_MODELS_DESCRIPTION.length <= 160);
    assert.match(NEW_MODELS_MEASUREMENT, /Hugging Face Hub/);
    assert.match(NEW_MODELS_MEASUREMENT, /Not llama-bench/);
    assert.match(NEW_MODELS_MEASUREMENT, /vLLM/);
    assert.match(NEW_MODELS_MEASUREMENT, /Ollama/);
    assert.match(NEW_MODELS_MEASUREMENT, /MLX is excluded/);
    assert.doesNotMatch(NEW_MODELS_DESCRIPTION, /MLX/);
    assert.deepEqual([...ALLOWED_QUANT_BANDS], ['Q8', 'Q6', 'Q5', 'Q4', 'Q3']);
    assert.deepEqual([...GGUF_PACKAGERS], ['unsloth', 'bartowski', 'lmstudio-community', 'ggml-org']);
    assert.deepEqual(FIT_VRAM, { '16': 16, '24': 24, '32': 32, '2x32': 64 });
    assert.equal(sizeBand(7), '<8B');
    assert.equal(sizeBand(24), '20-40B');
    assert.equal(sizeBand(null), 'unknown');
    assert.ok((estimateQ4KMGIB(8) ?? 0) > 4);
    assert.equal(fitVerdict(10, 16), 'fits');
    assert.equal(fitVerdict(20, 16), 'no');
    assert.equal(quantBand('Q2_K'), null);
    assert.equal(quantBand('IQ1_S'), null);
    assert.deepEqual(allowedQuants(['Q4_K_M', 'Q2_K', 'Q8_0', 'Q4_K_M']), ['Q4_K_M', 'Q8_0']);
    assert.equal(rowAnchor('LiquidAI/LFM2.5-24B-A2B'), 'LiquidAI--LFM2.5-24B-A2B');
    assert.deepEqual(assertNewModelsValid(EMPTY_NEW_MODELS), []);
  });

  it('validates the seeded Hub file and never invents a banned row', () => {
    const file = loadNewModelsFile();
    assert.deepEqual(assertNewModelsValid(file), []);
    assert.equal(file.schema, NEW_MODELS_SCHEMA);
    assert.match(file.source, /huggingface\.co\/api\/models/);
    const blob = JSON.stringify(file);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /local-desktop|amdai|amdai/i);
    assert.doesNotMatch(blob, /\b(?:IQ[12][_-]|Q[12][_-])/i);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
    for (const day of file.days) {
      for (const row of day.models) {
        assert.match(row.released, /^\d{4}-\d{2}-\d{2}$/);
        assert.ok(row.href.startsWith('https://huggingface.co/'));
        for (const pack of row.gguf) {
          assert.ok(GGUF_PACKAGERS.includes(pack.org as (typeof GGUF_PACKAGERS)[number]));
          assert.ok(pack.quants.every((q) => quantBand(q)));
        }
        const runs = normalizeRunsOn(row.runs_on);
        assert.equal(runs.length, RUN_ENGINE_IDS.length);
        assert.deepEqual(runs.map((hit) => hit.id), [...RUN_ENGINE_IDS]);
        assert.ok(runs.every((hit) => hit.status === 'yes' || hit.status === 'unknown'));
        assert.ok(!runs.some((hit) => String(hit.id) === 'mlx'));
      }
    }
  });

  it('builds RSS and Dataset coverage from real or empty files', () => {
    const fixture: NewModelsFile = {
      ...EMPTY_NEW_MODELS,
      as_of: '2026-10-16T12:00:00.000Z',
      days: [{ date: '2026-10-12', models: [sampleRow()] }],
    };
    assert.deepEqual(assertNewModelsValid(fixture), []);
    assert.equal(temporalCoverage(fixture), '2026-10-12/2026-10-12');
    const items = newModelsFeedItems(fixture);
    assert.equal(items.length, 1);
    assert.match(items[0]!.href, /#LiquidAI--LFM2\.5-24B-A2B/);
    const xml = renderNewModelsRss(fixture);
    assert.match(xml, /<\?xml/);
    assert.match(xml, /<rss version="2.0"/);
    assert.match(xml, /rel="self"/);
    assert.match(xml, /LFM2\.5-24B-A2B/);
    assert.doesNotMatch(xml, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(xml, /\bQ2_K\b/);
  });

  it('wires the page, nav, RSS route, and Dataset JSON-LD', () => {
    const page = readFileSync(join(here, '../pages/new-models.astro'), 'utf8');
    assert.match(page, /NEW_MODELS_H1/);
    assert.match(page, /nm-filters/);
    assert.match(page, /fits my GPU/i);
    assert.match(page, /Runs on/);
    assert.match(page, /data-filter="engine"/);
    assert.match(page, /llama\.cpp/);
    assert.match(page, /MLX is off/);
    assert.match(page, /NEW_MODELS_JSON/);
    assert.match(page, /NEW_MODELS_FEED/);
    assert.match(page, /NextSteps/);
    assert.match(page, /hydrate/);
    const rss = readFileSync(join(here, '../pages/new-models/rss.xml.ts'), 'utf8');
    assert.match(rss, /renderNewModelsRss/);
    const sync = readFileSync(join(here, '../../scripts/new-models-sync.mjs'), 'utf8');
    assert.match(sync, /\/api\/models/);
    assert.match(sync, /NEW_MODELS_OUT/);
    assert.match(sync, /unsloth/);
    assert.doesNotMatch(sync, /HF_TOKEN|HUGGING_FACE_HUB_TOKEN/);
    assert.equal(shouldNoindex(NEW_MODELS_PATH), false);
    assert.equal(isSitemapExcluded(NEW_MODELS_PATH), false);
    assert.ok(primaryNav.some((item) => item.href === NEW_MODELS_PATH));
    assert.ok(documentTitle(NEW_MODELS_PATH).endsWith(' · AMDai'));
    assert.ok(pageDescription(NEW_MODELS_PATH).length <= 160);
    const ld = pageJsonLd({
      pathname: NEW_MODELS_PATH,
      title: documentTitle(NEW_MODELS_PATH),
      description: pageDescription(NEW_MODELS_PATH),
    });
    assert.equal(personJsonLdHits(ld).length, 0);
    const dataset = ld.find((node) => node['@type'] === 'Dataset');
    assert.ok(dataset);
    assert.ok(dataset.name);
    assert.ok(dataset.creator);
    assert.ok(dataset.license);
    assert.equal(dataset.measurementTechnique, NEW_MODELS_MEASUREMENT);
    assert.ok(dataset.temporalCoverage);
    assert.match(String(dataset.measurementTechnique), /Hugging Face Hub/);
    assert.match(String(dataset.measurementTechnique), /Not llama-bench/);
  });

  it('derives Runs on from evidence and leaves the rest unknown', () => {
    const catalogs = {
      as_of: '2026-10-16T00:00:00.000Z',
      llamacpp: ['Qwen3ForCausalLM', 'Lfm2MoeForCausalLM'],
      vllm: ['Qwen3ForCausalLM', 'LlamaForCausalLM'],
      ollama: ['qwen3', 'llama3.1', 'lfm2.5'],
      sglang: ['Qwen3ForCausalLM'],
    };
    const ggufYes = deriveRunsOn(
      { id: 'Qwen/Qwen3-32B', name: 'Qwen3-32B', architecture: 'Qwen3ForCausalLM', gguf: [{}] },
      catalogs,
    );
    assert.equal(ggufYes.find((hit) => hit.id === 'llamacpp')?.status, 'yes');
    assert.equal(ggufYes.find((hit) => hit.id === 'llamacpp')?.evidence, 'gguf');
    assert.equal(ggufYes.find((hit) => hit.id === 'lmstudio')?.status, 'yes');
    assert.equal(ggufYes.find((hit) => hit.id === 'lemonade')?.status, 'yes');
    assert.equal(ggufYes.find((hit) => hit.id === 'vllm')?.status, 'yes');
    assert.equal(ggufYes.find((hit) => hit.id === 'vllm')?.evidence, 'vllm-arch');
    assert.equal(ggufYes.find((hit) => hit.id === 'ollama')?.status, 'yes');
    assert.equal(ggufYes.find((hit) => hit.id === 'sglang')?.status, 'yes');
    assert.equal(ggufYes.find((hit) => hit.id === 'strata')?.status, 'unknown');
    assert.ok(!ggufYes.some((hit) => String(hit.id) === 'mlx'));

    const archOnly = deriveRunsOn(
      { id: 'Qwen/Qwen3-14B', name: 'Qwen3-14B', architecture: 'Qwen3ForCausalLM', gguf: [] },
      catalogs,
    );
    assert.equal(archOnly.find((hit) => hit.id === 'llamacpp')?.evidence, 'llamacpp-arch');
    assert.equal(archOnly.find((hit) => hit.id === 'lmstudio')?.status, 'unknown');
    assert.equal(archOnly.find((hit) => hit.id === 'lemonade')?.status, 'unknown');

    const novel = deriveRunsOn(
      { id: 'example/NeverHeard-9B', name: 'NeverHeard-9B', architecture: 'NeverHeardForCausalLM', gguf: [] },
      catalogs,
    );
    assert.ok(novel.every((hit) => hit.status === 'unknown'));

    const flash = deriveRunsOn(
      { id: 'Qwen/Qwen3.8-Flash-Next', name: 'Qwen3.8-Flash-Next', architecture: 'NeverHeardForCausalLM', gguf: [] },
      catalogs,
    );
    assert.equal(flash.find((hit) => hit.id === 'strata')?.status, 'yes');
    assert.equal(flash.find((hit) => hit.id === 'strata')?.evidence, 'backends-strata');
    assert.equal(strataFlashHit('Qwen/Qwen3-32B', 'Qwen3-32B'), false);
    assert.equal(ollamaFamilySlug('Qwen/Qwen3-32B', 'Qwen3-32B'), 'qwen3');
    assert.equal(ollamaFamilySlug('Qwen/Qwen3.6-35B-A3B', 'Qwen3.6-35B-A3B'), 'qwen3.6');
    assert.equal(ollamaFamilySlug('meta-llama/Llama-3.1-8B-Instruct', 'Llama-3.1-8B-Instruct'), 'llama-3.1');
    const missOllama = deriveRunsOn(
      { id: 'Qwen/Qwen3.6-35B-A3B', name: 'Qwen3.6-35B-A3B', architecture: null, gguf: [] },
      catalogs,
    );
    assert.equal(missOllama.find((hit) => hit.id === 'ollama')?.status, 'unknown');

    const live = loadEngineCatalogs();
    assert.ok(live.llamacpp.includes('Qwen3ForCausalLM') || live.llamacpp.length === 0);
    assert.ok(!live.ollama.includes('mlx'));
    const xml = renderNewModelsRss({
      ...EMPTY_NEW_MODELS,
      days: [{ date: '2026-10-12', models: [sampleRow()] }],
    });
    assert.match(xml, /Runs on:/);
    assert.doesNotMatch(xml, /\bmlx\b/i);
  });
});
