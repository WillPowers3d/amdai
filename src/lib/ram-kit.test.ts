import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { applyModelPreset, DEFAULT_INPUT, inputToQuery, queryToInput } from './calculator';
import { parseMotherboards } from './motherboards';
import {
  DEFAULT_BIG_MODELS,
  DIMM_SPEED_NOTE,
  NAMED_RAM_KITS,
  OFFICIAL_SPEED_NOTE,
  RAM_256_PRODUCT,
  RAM_256_SRC,
  RAM_32_PRODUCT,
  RAM_32_SRC,
  RAM_ASK_COPY,
  REPLACE_KIT_NOTE,
  parseBigModels,
  ramCapFlag,
  ramPickPayload,
  ramRecommendation,
  recommendLargeRam,
  setupNeedsRamOffload,
  writeRamAskParams,
} from './ram-kit';

const here = dirname(fileURLToPath(import.meta.url));
const file = parseMotherboards(parse(readFileSync(new URL('../data/motherboards.yaml', import.meta.url), 'utf8')));
const productsFile = parse(readFileSync(new URL('../data/products.yaml', import.meta.url), 'utf8')) as {
  products: Array<{ id: string; urls?: Record<string, string> }>;
};

function read(rel: string): string {
  return readFileSync(join(here, rel), 'utf8');
}

describe('builder RAM ask', () => {
  it('defaults to 32 GB and persists bigmodels on the share link', () => {
    assert.equal(DEFAULT_BIG_MODELS, false);
    assert.equal(parseBigModels('?n=1'), false);
    assert.equal(parseBigModels('?bigmodels=1'), true);
    assert.equal(parseBigModels('?bigmodels=0'), false);
    const no = ramRecommendation({ bigModels: false, needsOffload: false });
    assert.equal(no.kit, '32');
    assert.equal(no.kit_gb, 32);
    assert.match(no.title, /32 GB/);
    assert.equal(no.product_id, RAM_32_PRODUCT);
    assert.equal(no.src, RAM_32_SRC);
    assert.equal(no.go_newegg, `/go/newegg/${RAM_32_PRODUCT}?src=${RAM_32_SRC}`);
    const yes = ramRecommendation({ bigModels: true, needsOffload: false });
    assert.equal(yes.kit, '256');
    assert.deepEqual(yes.kit_gb, [192, 256]);
    assert.match(yes.title, /192 GB or 256 GB/);
    assert.match(yes.primary.name, /G\.SKILL Flare X5 192 GB/);
    assert.equal(yes.primary.part, 'F5-6000J2836G48GX4-FX5');
    assert.equal(yes.src, 'builder-ram-192');
    const two = ramRecommendation({ bigModels: true, needsOffload: false, gpuCount: 2 });
    assert.match(two.primary.name, /Trident Z5 Neo 256 GB/);
    assert.equal(two.product_id, RAM_256_PRODUCT);
    assert.equal(two.src, RAM_256_SRC);
    assert.ok(yes.alternatives.some((row) => row.id === '128'));
    assert.match(REPLACE_KIT_NOTE, /cannot top up a 2x16/);
    assert.match(OFFICIAL_SPEED_NOTE, /DDR5-5600 with 2 DIMMs/);
    assert.match(OFFICIAL_SPEED_NOTE, /overclock/);
    const url = new URL('https://amdai.net/calculator');
    writeRamAskParams(url, { bigModels: true });
    assert.equal(url.searchParams.get('bigmodels'), '1');
    const qs = inputToQuery(queryToInput('?n=1'), { bigmodels: '1' });
    assert.match(qs, /bigmodels=1/);
    assert.doesNotMatch(`${no.why} ${yes.why} ${RAM_ASK_COPY.expensive}`, /\$\d|\bMSRP\b/);
  });

  it('auto-recommends the large kit when the setup already needs RAM offload', () => {
    const daily = DEFAULT_INPUT;
    assert.equal(setupNeedsRamOffload(daily), false);
    assert.equal(recommendLargeRam({ bigModels: false, needsOffload: false }), false);
    const flash = applyModelPreset('flash', { ...DEFAULT_INPUT, ramGb: 32, gpuCount: 1, split: false });
    assert.equal(setupNeedsRamOffload(flash), true);
    const rec = ramRecommendation({ bigModels: false, needsOffload: true });
    assert.equal(rec.kit, '256');
    assert.match(rec.why, /already need RAM offload/i);
    assert.equal(recommendLargeRam({ bigModels: false, needsOffload: true }), true);
  });

  it('flags vetted boards whose maker spec cannot take 256 GB', () => {
    assert.ok(file.boards.every((board) => Number.isFinite(board.max_ram_gb) && board.dimms >= 2));
    const x670e = file.boards.find((board) => board.id === 'asus-proart-x670e-creator');
    assert.equal(x670e?.max_ram_gb, 192);
    assert.match(x670e?.citation.section ?? '', /192GB|192 GB/);
    assert.match(ramCapFlag(192) ?? '', /cannot take 256 GB/);
    assert.equal(ramCapFlag(256), null);
    assert.ok(file.boards.filter((board) => board.max_ram_gb < 256).length >= 1);
    assert.ok(file.boards.some((board) => board.max_ram_gb >= 256));
  });

  it('wires buy stubs, disclosure, pick JSON, and the DIMM speed note', () => {
    for (const id of [RAM_32_PRODUCT, RAM_256_PRODUCT, 'ddr5-192', 'ddr5-128']) {
      const product = productsFile.products.find((row) => row.id === id);
      assert.ok(product, id);
      assert.ok(product.urls?.newegg, id);
      assert.doesNotMatch(product.urls?.newegg ?? '', /[?&](tag|ranMID|irclickid)=/);
    }
    assert.ok(NAMED_RAM_KITS.every((kit) => kit.citation.url.startsWith('https://')));
    assert.match(NAMED_RAM_KITS.find((kit) => kit.id === '256')?.note ?? '', /2025 or newer BIOS/);
    const payload = ramPickPayload();
    assert.equal(payload.param, 'bigmodels');
    assert.match(payload.dimm_speed_note, /Four DIMMs/i);
    assert.match(payload.note, /invented prices/i);
    assert.equal(payload.small.src, RAM_32_SRC);
    assert.equal(payload.large.src, 'builder-ram-192');
    assert.match(payload.official_speed_note ?? '', /overclock/);
    assert.match(payload.replace_note ?? '', /cannot top up/);
    assert.match(DIMM_SPEED_NOTE, /Four DIMMs/);
    assert.match(read('../pages/api/v1/pick.json.ts'), /ramPickPayload/);
    assert.match(read('../pages/api/v1/pick/[gpu].json.ts'), /ramPickPayload/);
    assert.match(read('../components/AskToggles.astro'), /RAM_ASK_COPY\.question/);
    assert.match(read('../components/RamPick.astro'), /NAMED_RAM_KITS|builder-ram-32|ddr5-32/);
    assert.match(read('../components/RamPick.astro'), /AffiliateDisclosure/);
    assert.match(read('../pages/budget.astro'), /RamPick/);
    assert.match(read('../pages/calculator.astro'), /RamPick/);
    assert.match(read('../components/RigWizard.astro'), /bigmodels/);
    assert.equal(RAM_ASK_COPY.question, 'Will you run larger models later?');
  });
});
