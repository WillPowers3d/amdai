import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { inputToQuery, queryToInput } from './calculator';
import {
  DEFAULT_COLD_LOAD,
  DEFAULT_LANES,
  DRIVES,
  FOURTH_FAMILY_Q4_GIB,
  GEN5_LOAD_NOTE,
  LOAD_EVIDENCE,
  MODEL_SETS_GIB,
  STORAGE_ASK_PARAM,
  TB_GIB,
  driveUsableGib,
  needGib,
  parseColdLoad,
  storagePickPayload,
  storageRecommendation,
  writeStorageAskParams,
} from './storage-pick';

const here = dirname(fileURLToPath(import.meta.url));
const productsFile = parse(readFileSync(new URL('../data/products.yaml', import.meta.url), 'utf8')) as {
  products: Array<{ id: string; urls?: Record<string, string> }>;
};

function read(rel: string): string {
  return readFileSync(join(here, rel), 'utf8');
}

describe('builder storage step', () => {
  it('fits the three-family Q4–Q6 set on 2 TB and steps to 4 TB for bigmodels or a fourth family', () => {
    const three = storageRecommendation({ bigModels: false, coldLoad: false });
    assert.equal(three.tb, 2);
    assert.equal(three.gen, 4);
    assert.equal(three.primary.id, '990pro-2tb');
    assert.equal(three.primary.part, 'MZ-V9P2T0BW');
    assert.equal(three.go_newegg, '/go/newegg/mz-v9p2t0bw?src=builder-ssd-990pro-2tb');
    assert.equal(three.need_gib, needGib(DEFAULT_LANES));
    assert.ok(three.need_gib > 1500 && three.need_gib < 1700);
    assert.ok(driveUsableGib(2) * 0.9 >= three.need_gib);

    const four = storageRecommendation({ bigModels: true, coldLoad: false });
    assert.equal(four.tb, 4);
    assert.equal(four.gen, 4);
    assert.equal(four.primary.id, '990pro-4tb');
    assert.ok(four.alternatives.some((row) => row.id === 'sn850x-4tb'));
    assert.match(four.why, /4 TB/);
    assert.match(four.why, /232/);

    const fourth = storageRecommendation({ bigModels: false, fourthFamily: true });
    assert.equal(fourth.tb, 4);
    assert.ok(FOURTH_FAMILY_Q4_GIB > 200);
  });

  it('offers Gen5 9100 PRO only when coldload=1 and cites the 9% mmap test', () => {
    const gen5 = storageRecommendation({ bigModels: false, coldLoad: true });
    assert.equal(gen5.gen, 5);
    assert.match(gen5.primary.name, /9100 PRO/);
    assert.equal(gen5.primary.seq_read_mbs, 14800);
    assert.match(gen5.why, /15\.2 s/);
    assert.match(gen5.why, /13\.8 s/);
    assert.match(gen5.why, /9%/);
    assert.match(GEN5_LOAD_NOTE, /15\.2 s/);
    assert.match(GEN5_LOAD_NOTE, /13\.8 s/);
    assert.ok(LOAD_EVIDENCE.some((row) => row.url.includes('craftrigs.com')));
    assert.ok(LOAD_EVIDENCE.some((row) => row.url.includes('pull/18012')));
    assert.doesNotMatch(gen5.why, /\$\d|\bMSRP\b/);
  });

  it('persists coldload on the share link and keeps Qwen as the default lanes', () => {
    assert.equal(DEFAULT_COLD_LOAD, false);
    assert.equal(parseColdLoad('?n=1'), false);
    assert.equal(parseColdLoad('?coldload=1'), true);
    const url = new URL('https://amdai.net/budget');
    writeStorageAskParams(url, { coldLoad: true });
    assert.equal(url.searchParams.get(STORAGE_ASK_PARAM), '1');
    const qs = inputToQuery(queryToInput('?n=1'), { coldload: '1' });
    assert.match(qs, /coldload=1/);
    assert.ok(Object.keys(MODEL_SETS_GIB['35b-lane']).some((name) => /Qwen3\.6-35B/.test(name)));
    assert.ok(TB_GIB > 930 && TB_GIB < 932);
  });

  it('cites datasheets, wires /go/newegg stubs, and invents no prices', () => {
    for (const drive of DRIVES) {
      assert.match(drive.citation.url, /^https:\/\//);
      assert.match(drive.citation.as_of, /^\d{4}-\d{2}-\d{2}$/);
      assert.equal(drive.nand, 'TLC');
      const product = productsFile.products.find((row) => row.id === drive.product_id);
      assert.ok(product, drive.id);
      assert.ok(product.urls?.newegg, drive.id);
      assert.match(product.urls?.newegg ?? '', /^https:\/\/www\.newegg\.com\/p\/pl\?d=/);
      assert.doesNotMatch(product.urls?.newegg ?? '', /[?&](tag|ranMID|irclickid)=/);
      assert.doesNotMatch(product.urls?.newegg ?? '', /#src=/);
      assert.doesNotMatch(`${drive.name} ${drive.citation.section}`, /\$\d|\bMSRP\b/);
    }
    const payload = storagePickPayload();
    assert.equal(payload.three_family.tb, 2);
    assert.equal(payload.four_tb.tb, 4);
    assert.equal(payload.gen5.gen, 5);
    assert.match(payload.note, /coldload=1/);
    assert.doesNotMatch(JSON.stringify(payload), /\$\d|\bMSRP\b/);
    assert.match(read('../pages/api/v1/pick.json.ts'), /storagePickPayload/);
    assert.match(read('../pages/api/v1/pick/[gpu].json.ts'), /storagePickPayload/);
    assert.match(read('../components/AskToggles.astro'), /coldload/);
    assert.match(read('../components/StoragePick.astro'), /AffiliateDisclosure/);
    assert.match(read('../pages/budget.astro'), /StoragePick/);
    assert.match(read('../pages/calculator.astro'), /StoragePick/);
    assert.match(read('../components/RigWizard.astro'), /coldload/);
  });
});
