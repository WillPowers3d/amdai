import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { applyModelPreset, DEFAULT_INPUT, DIMM_KIT_GB, inputToQuery, queryToInput, roundUpToDimmKitGb } from './calculator';
import { RAM_WORTH_LEDE, RAM_WORTH_SPEED, RAM_WORTH_TIERS, RAM_WORTH_WHY_SLOW, SPEED_35B_ONE_CARD, SPEED_FLASH_Q6_OFFLOAD } from './ram-worth';
import { parseMotherboards } from './motherboards';
import {
  DEFAULT_BIG_MODELS,
  DIMM_SPEED_NOTE,
  NAMED_RAM_KITS,
  OFFICIAL_SPEED_NOTE,
  RAM_256_PRODUCT,
  RAM_32_PRODUCT,
  RAM_32_SRC,
  RAM_96_DATED_PRICE,
  RAM_96_HEADLINE,
  RAM_96_PRODUCT,
  RAM_96_SRC,
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
  it('recommends 96 GB for most builds and keeps 32 GB only for one-card 35B use', () => {
    assert.equal(DEFAULT_BIG_MODELS, false);
    assert.equal(parseBigModels('?n=1'), false);
    assert.equal(parseBigModels('?bigmodels=1'), true);
    assert.equal(parseBigModels('?bigmodels=0'), false);
    const no = ramRecommendation({ bigModels: false, needsOffload: false });
    assert.equal(no.kit, '96');
    assert.equal(no.kit_gb, 96);
    assert.match(no.title, /96 GB/);
    assert.equal(no.product_id, RAM_96_PRODUCT);
    assert.equal(no.src, RAM_96_SRC);
    assert.equal(no.go_newegg, `/go/newegg/${RAM_96_PRODUCT}?src=${RAM_96_SRC}`);
    assert.equal(no.primary.part, 'F5-5600J4040D48GX2-TZ5RK');
    assert.equal(no.only_35b_ok, true);
    assert.deepEqual(no.alternatives.map((row) => row.id), ['32']);
    assert.match(no.why, /96 GB/);
    assert.match(no.why, /32 GB/);
    assert.match(no.why, /never want Flash/);
    const yes = ramRecommendation({ bigModels: true, needsOffload: false });
    assert.equal(yes.kit, '96');
    assert.equal(yes.only_35b_ok, false);
    assert.deepEqual(yes.alternatives.map((row) => row.id), ['128', '192', '256']);
    assert.match(yes.why, /Flash Q4 at full 256K/);
    assert.match(yes.why, /67 GB/);
    assert.match(yes.why, /slower/);
    const two = ramRecommendation({ bigModels: false, needsOffload: false, gpuCount: 2 });
    assert.equal(two.kit, '96');
    assert.equal(two.only_35b_ok, false);
    assert.ok(two.alternatives.some((row) => row.product_id === RAM_256_PRODUCT));
    assert.match(RAM_96_HEADLINE, /96 GB \(2x48 DDR5\) for most builds/);
    assert.match(REPLACE_KIT_NOTE, /cannot top up a 2-DIMM kit/);
    assert.match(OFFICIAL_SPEED_NOTE, /DDR5-5600 with 2 DIMMs/);
    assert.match(OFFICIAL_SPEED_NOTE, /overclock/);
    const url = new URL('https://amdai.net/calculator');
    writeRamAskParams(url, { bigModels: true });
    assert.equal(url.searchParams.get('bigmodels'), '1');
    const qs = inputToQuery(queryToInput('?n=1'), { bigmodels: '1' });
    assert.match(qs, /bigmodels=1/);
    assert.doesNotMatch(`${no.why} ${yes.why} ${RAM_ASK_COPY.expensive}`, /\$\d|\bMSRP\b/);
  });

  it('dates the only 96 GB price and explains why more RAM is usually not worth it', () => {
    const kit96 = NAMED_RAM_KITS.find((kit) => kit.id === '96');
    assert.equal(kit96?.kit_gb, 96);
    assert.equal(kit96?.dimms, '2x48 DDR5');
    assert.equal(kit96?.dated_price?.label, '$1,549.99');
    assert.equal(RAM_96_DATED_PRICE.as_of, '2026-10-29');
    assert.ok(NAMED_RAM_KITS.filter((kit) => kit.id !== '96').every((kit) => !kit.dated_price));
    assert.deepEqual(RAM_WORTH_TIERS.map((tier) => tier.kitGb), [96, 128, 192, 256]);
    assert.ok(RAM_WORTH_TIERS.every((tier) => /^~/.test(tier.needGb)));
    assert.match(RAM_WORTH_TIERS[2]!.model, /GLM-5\.3-Flash UD-Q4/);
    assert.match(RAM_WORTH_LEDE, /usually not worth it/);
    assert.match(RAM_WORTH_LEDE, /maximum intelligence/);
    assert.match(RAM_WORTH_WHY_SLOW, /640 GB\/s/);
    assert.match(RAM_WORTH_WHY_SLOW, /estimate/);
    assert.equal(SPEED_35B_ONE_CARD.tok_s, 102.39);
    assert.equal(SPEED_FLASH_Q6_OFFLOAD.tok_s, 32.8);
    assert.match(RAM_WORTH_SPEED, /about 102 tok\/s/);
    assert.match(RAM_WORTH_SPEED, /about 33 tok\/s/);
    const runs = ['../../data/runs/local-desktop-35b-20261013.jsonl', '../../data/runs/local-desktop-amdai.jsonl']
      .map((rel) => read(rel))
      .join('\n');
    assert.ok(runs.includes(SPEED_35B_ONE_CARD.run_id));
    assert.ok(runs.includes(SPEED_FLASH_Q6_OFFLOAD.run_id));
    assert.match(read('../components/RamPick.astro'), /RamWorth/);
    assert.match(read('../pages/flash-ram-offload.astro'), /RamWorth/);
  });

  it('rounds calculator RAM up through 48 GB and 96 GB kits', () => {
    assert.ok(DIMM_KIT_GB.includes(48));
    assert.ok(DIMM_KIT_GB.includes(96));
    assert.equal(roundUpToDimmKitGb(40), 48);
    assert.equal(roundUpToDimmKitGb(67), 96);
    assert.equal(roundUpToDimmKitGb(96), 96);
    assert.equal(roundUpToDimmKitGb(97), 128);
  });

  it('auto-recommends the large kit when the setup already needs RAM offload', () => {
    const daily = DEFAULT_INPUT;
    assert.equal(setupNeedsRamOffload(daily), false);
    assert.equal(recommendLargeRam({ bigModels: false, needsOffload: false }), false);
    const flash = applyModelPreset('flash', { ...DEFAULT_INPUT, ramGb: 32, gpuCount: 1, split: false });
    assert.equal(setupNeedsRamOffload(flash), true);
    const rec = ramRecommendation({ bigModels: false, needsOffload: true });
    assert.equal(rec.kit, '96');
    assert.equal(rec.only_35b_ok, false);
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
    for (const id of [RAM_32_PRODUCT, RAM_96_PRODUCT, RAM_256_PRODUCT, 'ddr5-192', 'ddr5-128']) {
      const product = productsFile.products.find((row) => row.id === id);
      assert.ok(product, id);
      assert.ok(product.urls?.newegg, id);
      assert.doesNotMatch(product.urls?.newegg ?? '', /[?&](tag|ranMID|irclickid)=/);
    }
    const p96 = productsFile.products.find((row) => row.id === RAM_96_PRODUCT);
    assert.match(p96?.urls?.amazon ?? '', /96GB.*2x48GB/);
    assert.match(p96?.urls?.newegg ?? '', /N82E16820374483/);
    assert.ok(NAMED_RAM_KITS.every((kit) => kit.citation.url.startsWith('https://')));
    assert.match(NAMED_RAM_KITS.find((kit) => kit.id === '256')?.note ?? '', /2025 or newer BIOS/);
    const payload = ramPickPayload();
    assert.equal(payload.param, 'bigmodels');
    assert.match(payload.dimm_speed_note, /Four DIMMs/i);
    assert.match(payload.note, /invented prices/i);
    assert.equal(payload.small.src, RAM_32_SRC);
    assert.equal(payload.recommended.src, RAM_96_SRC);
    assert.equal(payload.recommended.kit_gb, 96);
    assert.deepEqual(payload.more_ram.map((row) => row.kit_gb), [128, 192, 256]);
    assert.match(payload.more_ram_worth_it.lede, /usually not worth it/);
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
