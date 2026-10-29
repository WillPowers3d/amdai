import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import {
  DRAFT_GO_SLUGS,
  MIN_BUDGET_WARNING,
  REUSED_GO_SLUG,
  allBuildLists,
  buildList,
  buildListKey,
  buildListPayload,
  compactBuildMaps,
  goSlugForProduct,
  partGo,
} from './build-list';

const here = dirname(fileURLToPath(import.meta.url));
const productsFile = parse(readFileSync(new URL('../data/products.yaml', import.meta.url), 'utf8')) as {
  products: Array<{ id: string; urls?: Record<string, string> }>;
};

function read(rel: string): string {
  return readFileSync(join(here, rel), 'utf8');
}

describe('one-answer parts list', () => {
  it('returns GPU, board, CPU, RAM, PSU, and SSD lines through /go/newegg slugs', () => {
    const list = buildList({ gpuCount: 1, minBudget: false, expandGpu: true, bigModels: false });
    assert.equal(list.parts.length, 6);
    assert.deepEqual(
      list.parts.map((row) => row.role),
      ['GPU', 'Motherboard', 'CPU', 'RAM', 'PSU', 'Storage'],
    );
    assert.match(list.parts[0]!.part, /R9700/);
    assert.equal(list.parts[0]!.go, '/go/newegg/r9700?src=builder-list-gpu');
    assert.ok(list.parts.every((row) => /^\/go\/newegg\/[a-z0-9-]+(\?src=[a-z0-9-]+)?$/.test(row.go)));
    assert.ok(list.parts.every((row) => !/newegg\.com/.test(row.go)));
    assert.match(list.parts[5]!.part, /990 PRO 2TB/);
    assert.match(list.parts[5]!.go, /\/go\/newegg\/mz-v9p2t0bw/);
    assert.equal(list.warnings.length, 0);
    assert.doesNotMatch(JSON.stringify(list), /\$\d|\bMSRP\b/);
  });

  it('warns when Minimum budget limits a second GPU and steps RAM/PSU/SSD with the answers', () => {
    const cheap = buildList({ gpuCount: 1, minBudget: true, expandGpu: false, bigModels: false });
    assert.ok(cheap.warnings.includes(MIN_BUDGET_WARNING));
    assert.match(cheap.parts.find((row) => row.role === 'Motherboard')!.part, /B650/);

    const dual = buildList({ gpuCount: 2, minBudget: false, expandGpu: true, bigModels: true });
    assert.match(dual.parts.find((row) => row.role === 'GPU')!.part, /x2/);
    assert.match(dual.parts.find((row) => row.role === 'RAM')!.part, /256 GB/);
    assert.match(dual.parts.find((row) => row.role === 'PSU')!.part, /1200W/);
    assert.match(dual.parts.find((row) => row.role === 'CPU')!.part, /9900X/);
    assert.match(dual.parts.find((row) => row.role === 'Storage')!.part, /4TB/);
  });

  it('ships the nine draft /go/newegg slugs plus the live R9700 stub', () => {
    assert.equal(DRAFT_GO_SLUGS.length, 9);
    assert.equal(REUSED_GO_SLUG, 'r9700');
    const ids = new Set(productsFile.products.map((row) => row.id));
    for (const slug of [...DRAFT_GO_SLUGS, REUSED_GO_SLUG]) {
      const product = productsFile.products.find((row) => row.id === slug);
      assert.ok(product, slug);
      assert.ok(ids.has(slug), slug);
      assert.match(product!.urls?.newegg ?? '', /^https:\/\/www\.newegg\.com\/p\/pl\?d=/);
      assert.doesNotMatch(product!.urls?.newegg ?? '', /[?&](tag|ranMID|irclickid)=|#src=/);
    }
    assert.equal(goSlugForProduct('ryzen-5-9600x'), 'amd-ryzen-5-9600x');
    assert.equal(goSlugForProduct('corsair-rm850x'), 'cp-9020270-na');
    assert.equal(goSlugForProduct('ddr5-32'), 'f5-6000j3038f16gx2-fx5');
    assert.match(partGo('r9700'), /^\/go\/newegg\/r9700/);
    const maps = allBuildLists();
    const key = buildListKey({ gpuCount: 1, minBudget: false, expandGpu: true, bigModels: false });
    assert.ok(maps[key]);
    assert.equal(Object.keys(maps).length, 64);
    const compact = compactBuildMaps(key, maps);
    assert.ok(compact.strings.length < 80);
    assert.ok(JSON.stringify(compact).length < 20_000);
    assert.ok(JSON.stringify(maps).length > 50_000);
    const defaultRow = compact.builds[key]!;
    assert.equal(compact.strings[defaultRow.p[0]![0]!], 'GPU');
    assert.match(compact.strings[defaultRow.p[0]![1]!] ?? '', /R9700/);
  });

  it('wires the box on /budget and into pick + recommend_stack', () => {
    const payload = buildListPayload();
    assert.equal(payload.default.parts.length, 6);
    assert.match(read('../pages/budget.astro'), /BuildList/);
    assert.match(read('../components/BuildList.astro'), /AffiliateDisclosure/);
    assert.match(read('../components/BuildList.astro'), /compactBuildMaps/);
    assert.match(read('../pages/api/v1/pick.json.ts'), /buildListPayload/);
    assert.match(read('../pages/api/v1/pick/[gpu].json.ts'), /buildList/);
    assert.match(read('../lib/public-api.ts'), /parts:/);
    assert.match(read('../../mcp/tools.mjs'), /parts:/);
    assert.doesNotMatch(read('../components/BuildList.astro'), /newegg\.com/);
    assert.doesNotMatch(read('../pages/budget.astro'), /newegg\.com\/p\/pl\?.*(#src=|&src=|&tag=)/);
  });
});
