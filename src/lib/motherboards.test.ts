import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { inputToQuery, queryToInput } from './calculator';
import {
  CHEAP_BOARD_NOTE,
  DUAL_BADGE,
  EXPAND_GPU_COPY,
  MIN_BUDGET_COPY,
  MOTHERBOARDS_PATH,
  WHY_DUAL_X8X8,
  assertMotherboardsValid,
  boardsForAsk,
  defaultExpandGpu,
  motherboardPayload,
  parseExpandGpu,
  parseMinBudget,
  parseMotherboards,
  recommendDualX8X8,
  writeMotherboardAskParams,
} from './motherboards';
import { documentTitle, isSitemapExcluded, pageDescription, shouldNoindex } from './seo';
import { primaryNav } from './site';

const here = dirname(fileURLToPath(import.meta.url));
const file = parseMotherboards(parse(readFileSync(new URL('../data/motherboards.yaml', import.meta.url), 'utf8')));
const productsFile = parse(readFileSync(new URL('../data/products.yaml', import.meta.url), 'utf8')) as {
  products: Array<{ id: string; urls?: Record<string, string> }>;
};
const productsById = new Map(productsFile.products.map((row) => [row.id, row]));

function read(rel: string): string {
  return readFileSync(join(here, rel), 'utf8');
}

describe('vetted dual x8/x8 motherboards', () => {
  it('requires a citation URL and as_of on every board row', () => {
    assert.deepEqual(assertMotherboardsValid(file), []);
    assert.ok(file.boards.length >= 3);
    for (const board of file.boards) {
      assert.match(board.citation.url, /^https:\/\//, board.id);
      assert.match(board.citation.as_of, /^\d{4}-\d{2}-\d{2}$/, board.id);
      assert.ok(board.citation.section.trim(), board.id);
      assert.match(board.manual.url, /^https:\/\//, board.id);
      assert.match(board.manual.as_of, /^\d{4}-\d{2}-\d{2}$/, board.id);
      assert.ok(board.product_id);
      const product = productsById.get(board.product_id);
      assert.ok(product, `${board.id} missing /go/ product`);
      assert.ok(product.urls?.newegg, `${board.id} needs a Newegg stub`);
      assert.doesNotMatch(product.urls?.newegg ?? '', /[?&](tag|ranMID|irclickid|utm_)=/);
    }
    const local = file.boards.filter((board) => board.local_desktop);
    assert.equal(local.length, 1);
    assert.equal(local[0]?.id, 'asrock-x870-taichi-creator');
    assert.equal(local[0]?.dual_ready, true);
    assert.match(local[0]?.citation.section ?? '', /x8\/x8/);
  });

  it('never shows a non-x8/x8 board for a dual-GPU build', () => {
    const shown = boardsForAsk(file.boards, { gpuCount: 2, minBudget: true, expandGpu: false });
    assert.ok(shown.length >= 1);
    assert.ok(shown.every((board) => board.dual_ready));
    assert.ok(shown.every((board) => /x8\/x8/i.test(`${board.split} ${board.citation.section}`)));
    assert.equal(
      recommendDualX8X8({ gpuCount: 2, minBudget: true, expandGpu: false }),
      true,
    );
    assert.ok(!shown.some((board) => board.id === 'asrock-b650m-pro-rs'));
    assert.ok(!shown.some((board) => board.id === 'msi-b650-gaming-plus-wifi'));
  });

  it('defaults single-GPU builds to dual x8/x8 unless Minimum budget is on', () => {
    assert.equal(defaultExpandGpu(false), true);
    assert.equal(defaultExpandGpu(true), false);
    assert.equal(recommendDualX8X8({ gpuCount: 1, minBudget: false, expandGpu: false }), true);
    assert.equal(recommendDualX8X8({ gpuCount: 1, minBudget: false, expandGpu: true }), true);
    const recommended = boardsForAsk(file.boards, { gpuCount: 1, minBudget: false, expandGpu: false });
    assert.ok(recommended.every((board) => board.dual_ready));
    assert.ok(recommended.some((board) => board.id === 'asrock-x870-taichi-creator'));
  });

  it('toggles the single-GPU expand question and Minimum budget path', () => {
    const later = boardsForAsk(file.boards, { gpuCount: 1, minBudget: true, expandGpu: true });
    assert.ok(later.every((board) => board.dual_ready));
    const cheap = boardsForAsk(file.boards, { gpuCount: 1, minBudget: true, expandGpu: false });
    assert.ok(cheap.length >= 1);
    assert.ok(cheap.every((board) => !board.dual_ready));
    assert.ok(cheap.every((board) => /x16\/x4|x4/i.test(`${board.split} ${board.citation.section}`)));
    assert.match(CHEAP_BOARD_NOTE, /limits a later|leftover x4|not a CPU-lane x8/i);
    assert.match(WHY_DUAL_X8X8, /1×16 or 2×8/);
    assert.match(WHY_DUAL_X8X8, /chipset leftover/i);
  });

  it('round-trips Minimum budget and the expand question through the share link', () => {
    const dualShare = '?n=2&minbudget=0&expandgpu=1&priority=speed&usage=local&style=standard';
    assert.equal(parseMinBudget(dualShare), false);
    assert.equal(parseExpandGpu(dualShare), true);
    assert.equal(queryToInput(dualShare).gpuCount, 2);
    assert.ok(
      boardsForAsk(file.boards, {
        gpuCount: 2,
        minBudget: parseMinBudget(dualShare),
        expandGpu: parseExpandGpu(dualShare),
      }).every((board) => board.dual_ready),
    );

    const minShare = '?n=1&minbudget=1&expandgpu=0&priority=speed&usage=local&style=standard';
    assert.equal(parseMinBudget(minShare), true);
    assert.equal(parseExpandGpu(minShare), false);
    const cheap = boardsForAsk(file.boards, {
      gpuCount: 1,
      minBudget: true,
      expandGpu: false,
    });
    assert.ok(cheap.every((board) => !board.dual_ready));

    const laterShare = '?n=1&minbudget=1&expandgpu=1';
    assert.equal(parseMinBudget(laterShare), true);
    assert.equal(parseExpandGpu(laterShare), true);
    assert.ok(
      boardsForAsk(file.boards, { gpuCount: 1, minBudget: true, expandGpu: true }).every(
        (board) => board.dual_ready,
      ),
    );

    const url = new URL('https://amdai.net/calculator');
    writeMotherboardAskParams(url, { minBudget: true, expandGpu: false });
    assert.equal(url.searchParams.get('minbudget'), '1');
    assert.equal(url.searchParams.get('expandgpu'), '0');
    assert.equal(parseMinBudget(url.search), true);
    assert.equal(parseExpandGpu(url.search), false);

    const qs = inputToQuery(queryToInput(minShare), {
      priority: 'speed',
      usage: 'local',
      style: 'standard',
      minbudget: '1',
      expandgpu: '0',
    });
    assert.match(qs, /minbudget=1/);
    assert.match(qs, /expandgpu=0/);
    assert.equal(parseMinBudget(`?${qs}`), true);
    assert.equal(parseExpandGpu(`?${qs}`), false);

    const omitted = '?n=1';
    assert.equal(parseMinBudget(omitted), false);
    assert.equal(parseExpandGpu(omitted), true);
  });

  it('is wired from the builder, inbound pages, nav, and the JSON API', () => {
    assert.ok(primaryNav.some((item) => item.href === MOTHERBOARDS_PATH));
    assert.equal(shouldNoindex(MOTHERBOARDS_PATH), false);
    assert.equal(isSitemapExcluded(MOTHERBOARDS_PATH), false);
    assert.ok(documentTitle(MOTHERBOARDS_PATH).endsWith(' · AMDai'));
    assert.match(pageDescription(MOTHERBOARDS_PATH), /x8\/x8/);
    assert.match(pageDescription(MOTHERBOARDS_PATH), /invented prices|no invented/i);

    const page = read('../pages/motherboards.astro');
    assert.match(page, /Dual x8\/x8/);
    assert.match(page, /\{DUAL_BADGE\}/);
    assert.equal(DUAL_BADGE, 'Dual x8/x8 ✓');
    assert.match(page, /AffiliateDisclosure/);
    assert.match(page, /local desktop board/);
    assert.doesNotMatch(page, /\$\d|\bMSRP\b/);

    const inbound = [
      '../pages/budget.astro',
      '../pages/calculator.astro',
      '../pages/bios.astro',
      '../pages/multi-gpu.astro',
      '../content/guides/hardware.mdx',
      '../components/AskToggles.astro',
      '../components/RigWizard.astro',
      '../components/MotherboardPick.astro',
    ];
    for (const rel of inbound) {
      assert.match(read(rel), /\/motherboards|MotherboardPick|minbudget/, rel);
    }
    const askToggles = read('../components/AskToggles.astro');
    assert.match(askToggles, /MIN_BUDGET_COPY/);
    assert.match(askToggles, /EXPAND_GPU_COPY\.question/);
    assert.match(askToggles, /minbudget/);
    assert.match(askToggles, /expandgpu/);
    assert.equal(MIN_BUDGET_COPY.minimum.label, 'Minimum budget');
    assert.equal(EXPAND_GPU_COPY.question, 'Might you add a second GPU later?');
    assert.match(read('../components/RigWizard.astro'), /minbudget/);
    assert.match(read('../pages/api/v1/motherboards.json.ts'), /motherboardPayload/);

    const payload = motherboardPayload(file);
    assert.equal(payload.boards.length, file.boards.length);
    assert.ok(payload.boards.every((board) => board.citation.url.startsWith('https://')));
    assert.match(payload.note, /minbudget=1/);
  });
});
