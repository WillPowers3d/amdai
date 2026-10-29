import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GPU_PRESETS, MODEL_PRESETS } from './calculator';
import { loadLabLogFile } from './lab-log';
import { PII_TEXT } from './pii-denylist';
import {
  API_SCHEMA_VERSION,
  apiEndpoints,
  apiFilenames,
  assertPublicApiValid,
  bestPublicQuant,
  buildPublicApi,
  calculatorShareUrl,
  compareGpus,
  gpuPrices,
  isPublicQuant,
  loadBackendsFile,
  loadGpuDirectory,
  loadRocmProblems,
  loadStacksGuide,
  lookupRocmIssue,
  planFitInput,
  publicQuants,
  recommendStack,
} from './public-api';

const here = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT = join(here, '../../mcp/snapshot');

function writeSnapshot(catalog: ReturnType<typeof buildPublicApi>) {
  mkdirSync(SNAPSHOT, { recursive: true });
  for (const name of apiFilenames()) {
    writeFileSync(join(SNAPSHOT, `${name}.json`), `${JSON.stringify(catalog[name], null, 2)}\n`);
  }
}

describe('public static API generator', () => {
  const catalog = buildPublicApi();
  writeSnapshot(catalog);

  it('matches schema version, as_of, and endpoint list', () => {
    assert.deepEqual(assertPublicApiValid(catalog), []);
    assert.equal(catalog.index.schema_version, API_SCHEMA_VERSION);
    assert.match(catalog.index.as_of, /^\d{4}-\d{2}-\d{2}/);
    const paths = catalog.index.endpoints.map((row) => row.path);
    for (const path of [
      '/api/v1/index.json',
      '/api/v1/gpus.json',
      '/api/v1/models.json',
      '/api/v1/stacks.json',
      '/api/v1/measured.json',
      '/api/v1/rocm-issues.json',
      '/api/v1/backends.json',
    ]) {
      assert.ok(paths.includes(path), path);
    }
    assert.equal(apiEndpoints().length, catalog.index.endpoints.length);
  });

  it('keeps source arrays populated when the catalogs have rows', () => {
    const gpuDirectory = loadGpuDirectory();
    const stacksGuide = loadStacksGuide();
    const rocmProblems = loadRocmProblems();
    const backends = loadBackendsFile();
    assert.ok(gpuDirectory.cards.length > 0);
    assert.equal(catalog.gpus.gpus.length, gpuDirectory.cards.length);
    assert.ok(catalog.models.models.length >= 8);
    assert.equal(catalog.stacks.stacks.length, stacksGuide.stacks.length);
    assert.ok(catalog.measured.runs.length > 0);
    assert.ok(loadLabLogFile().entries.length > 0);
    assert.equal(catalog['rocm-issues'].issues.length, rocmProblems.problems.length);
    assert.ok(rocmProblems.problems.length > 0);
    assert.equal(catalog.backends.engines.length, backends.engines.length);
    assert.ok(backends.engines.length > 0);
  });

  it('lists Qwen first, flags older families, and omits quants below Q4', () => {
    assert.match(catalog.models.models[0]!.name, /Qwen/i);
    assert.ok(catalog.models.models.some((row) => row.older === true));
    assert.ok(catalog.models.models.some((row) => row.older === false && /qwen/i.test(row.id)));
    assert.ok(publicQuants().every((row) => isPublicQuant(row.id)));
    assert.ok(!publicQuants().some((row) => /q3|iq3|q2|q1|iq2|iq1/i.test(row.id)));
    for (const model of catalog.models.models) {
      assert.ok(model.quants.length > 0, model.id);
      assert.ok(model.quants.every((quant) => isPublicQuant(quant.id)));
      assert.ok(isPublicQuant(model.default_quant));
    }
  });

  it('ships dated R9700 prices with source and site buy URLs', () => {
    const r9700 = catalog.gpus.gpus.find((row) => row.id === 'r9700');
    assert.ok(r9700);
    assert.equal(r9700!.vram_gb, 32);
    assert.equal(r9700!.bandwidth_gbs, 640);
    assert.ok(r9700!.prices.length >= 2);
    for (const price of r9700!.prices) {
      assert.match(price.usd, /^\d+\.\d{2}$/);
      assert.match(price.date, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(price.source.includes('r9700-street-price'));
      assert.match(price.source_href, /\/lab-log/);
      assert.match(price.note, /affiliate|invented|dated/i);
    }
    assert.ok(r9700!.buy.length >= 3);
    assert.ok(r9700!.buy.every((link) => link.path.startsWith('/go/')));
    assert.ok(r9700!.buy.every((link) => link.href.startsWith('https://amdai.net/go/')));
    const priced = gpuPrices('r9700');
    assert.ok(priced.disclosure.toLowerCase().includes('affiliate'));
    assert.ok(priced.gpus[0]!.prices[0]!.date);
  });

  it('does not invent prices for cards without a dated snapshot', () => {
    const others = catalog.gpus.gpus.filter((row) => row.id !== 'r9700');
    assert.ok(others.length > 0);
    assert.ok(others.every((row) => row.prices.length === 0));
  });

  it('recommends llama.cpp and a Q4+ stack with a calculator share URL', () => {
    const daily = recommendStack({ gpus: ['r9700'], vram_gb: 32, ram_gb: 256, goal: 'daily' });
    assert.equal(daily.backend, 'llama.cpp');
    assert.ok(isPublicQuant(daily.quant));
    assert.match(daily.calculator, /^https:\/\/amdai\.net\/calculator\?/);
    assert.match(daily.calculator, /model=qwen36/);
    assert.ok(daily.ram);
    assert.match(String(daily.ram.kit_gb), /32|192|256/);
    assert.doesNotMatch(daily.ram.why, /\$\d|\bMSRP\b/);
    assert.ok(daily.cpu);
    assert.match(daily.cpu.title, /Ryzen/);
    assert.match(daily.cpu.src, /builder-cpu-/);
    assert.ok(daily.psu);
    assert.ok(daily.psu.picks.length >= 1);
    assert.match(daily.psu.picks[0]!.src, /builder-psu-/);
    assert.ok(daily.storage);
    assert.ok(daily.storage.tb === 2 || daily.storage.tb === 4);
    assert.ok(daily.case);
    assert.match(daily.case.primary.name, /Torrent/);
    assert.ok(daily.cooler);
    assert.match(daily.cooler.go, /\/go\/newegg\//);
    assert.ok(daily.parts);
    assert.equal(daily.parts.parts.length, 8);
    assert.ok(daily.parts.parts.every((row) => row.go.startsWith('/go/newegg/')));
    assert.doesNotMatch(`${daily.cpu.why} ${daily.psu.why} ${daily.storage.why} ${daily.case.why} ${daily.cooler.why}`, /\$\d|\bMSRP\b/);
    assert.match(daily.href, /\/stacks/);
    const input = planFitInput({ gpu: 'r9700', model: 'qwen36', quant: 'q5_k_m' });
    const share = calculatorShareUrl(input);
    assert.match(share, /gpu=r9700/);
    assert.match(share, /quant=q5_k_m/);
    const best = bestPublicQuant(input);
    assert.ok(best);
    assert.ok(isPublicQuant(best!.id));
    const q3 = planFitInput({ gpu: 'r9700', model: 'qwen36', quant: 'q3_k_m' });
    assert.equal(q3.quantId, 'q4_k_m');
  });

  it('compares GPUs and looks up ROCm issues from existing rows', () => {
    const compared = compareGpus(['r9700', 'rx7900xtx']);
    assert.equal(compared.gpus.length, 2);
    assert.match(compared.href, /\/compare\/gpus/);
    assert.ok(compared.gpus[0]!.vram_gb);
    const hits = lookupRocmIssue('Ollama ROCm R9700 Windows');
    assert.ok(hits.issues.length >= 1);
    assert.match(hits.issues[0]!.href, /\/rocm-problems\//);
  });

  it('keeps PII and /home/ paths out of the payloads', () => {
    const blob = JSON.stringify(catalog);
    assert.equal(PII_TEXT.test(blob), false);
    assert.equal(/\/home\/|\/Users\/|C:\\Users\\/i.test(blob), false);
    assert.ok(MODEL_PRESETS.length > 0);
    assert.ok(GPU_PRESETS.length > 0);
  });
});
