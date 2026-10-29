import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { inputToQuery, queryToInput } from './calculator';
import {
  APU_WARNING,
  CPUS,
  CPU_ASK_PARAM,
  DEFAULT_CPU_WORK,
  FABRIC_NOTE,
  cpuPickPayload,
  cpuRecommendation,
  parseCpuWork,
  writeCpuAskParams,
} from './cpu-pick';

const here = dirname(fileURLToPath(import.meta.url));
const productsFile = parse(readFileSync(new URL('../data/products.yaml', import.meta.url), 'utf8')) as {
  products: Array<{ id: string; urls?: Record<string, string> }>;
};

function read(rel: string): string {
  return readFileSync(join(here, rel), 'utf8');
}

describe('builder CPU step', () => {
  it('picks 9600X in VRAM and 9900X / 9950X for DDR5 offload', () => {
    const inVram = cpuRecommendation({ bigModels: false, needsOffload: false });
    assert.equal(inVram.id, '9600x');
    assert.match(inVram.title, /9600X/);
    assert.equal(inVram.src, 'builder-cpu-9600x');
    assert.equal(inVram.go_newegg, '/go/newegg/ryzen-5-9600x?src=builder-cpu-9600x');
    assert.equal(inVram.alt, null);

    const offload = cpuRecommendation({ bigModels: true, needsOffload: false });
    assert.equal(offload.id, '9900x');
    assert.match(offload.why, /theoretical/);
    assert.match(offload.why, /96 GB\/s/);
    assert.match(offload.why, /64 GB\/s/);
    assert.equal(offload.alt?.id, '9950x');
    assert.equal(offload.alt?.src, 'builder-cpu-9950x');

    const jobs = cpuRecommendation({ bigModels: true, needsOffload: false, cpuWork: true });
    assert.equal(jobs.id, '9950x');
    assert.equal(jobs.alt?.id, '9900x');
  });

  it('persists cpuwork on the share link and labels fabric as theoretical', () => {
    assert.equal(DEFAULT_CPU_WORK, false);
    assert.equal(parseCpuWork('?n=1'), false);
    assert.equal(parseCpuWork('?cpuwork=1'), true);
    const url = new URL('https://amdai.net/calculator');
    writeCpuAskParams(url, { cpuWork: true });
    assert.equal(url.searchParams.get(CPU_ASK_PARAM), '1');
    const qs = inputToQuery(queryToInput('?n=1'), { cpuwork: '1' });
    assert.match(qs, /cpuwork=1/);
    assert.match(FABRIC_NOTE, /theoretical/);
    assert.match(FABRIC_NOTE, /not measurements/);
    assert.match(APU_WARNING, /8000G/);
    assert.match(APU_WARNING, /8700G/);
    assert.match(APU_WARNING, /8500G/);
    assert.doesNotMatch(`${FABRIC_NOTE} ${APU_WARNING}`, /\$\d|\bMSRP\b/);
  });

  it('cites AMD product pages and wires buy stubs', () => {
    for (const cpu of CPUS) {
      assert.match(cpu.citation.url, /^https:\/\/www\.amd\.com\//);
      assert.match(cpu.citation.as_of, /^\d{4}-\d{2}-\d{2}$/);
      assert.match(cpu.citation.section, /24/);
      const product = productsFile.products.find((row) => row.id === cpu.product_id);
      assert.ok(product, cpu.id);
      assert.ok(product.urls?.newegg, cpu.id);
      assert.doesNotMatch(product.urls?.newegg ?? '', /[?&](tag|ranMID|irclickid)=/);
    }
    const payload = cpuPickPayload();
    assert.equal(payload.in_vram.id, '9600x');
    assert.equal(payload.offload.id, '9900x');
    assert.equal(payload.cpu_jobs.id, '9950x');
    assert.match(read('../pages/api/v1/pick.json.ts'), /cpuPickPayload/);
    assert.match(read('../pages/api/v1/pick/[gpu].json.ts'), /cpuPickPayload/);
    assert.match(read('../components/AskToggles.astro'), /cpuwork/);
    assert.match(read('../components/CpuPick.astro'), /AffiliateDisclosure/);
    assert.match(read('../pages/budget.astro'), /CpuPick/);
    assert.match(read('../pages/calculator.astro'), /CpuPick/);
    assert.match(read('../components/RigWizard.astro'), /cpuwork/);
  });
});
