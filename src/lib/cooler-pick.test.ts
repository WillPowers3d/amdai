import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import {
  AMD_NO_BOX_COOLER,
  COOLER_GO_SLUGS,
  COOLERS,
  INTAKE_AIO_WARNING,
  caseHasTop360,
  coolerPickPayload,
  coolerRecommendation,
} from './cooler-pick';
import { CASES } from './case-pick';

const here = dirname(fileURLToPath(import.meta.url));
const productsFile = parse(readFileSync(new URL('../data/products.yaml', import.meta.url), 'utf8')) as {
  products: Array<{ id: string; urls?: Record<string, string> }>;
};

function read(rel: string): string {
  return readFileSync(join(here, rel), 'utf8');
}

describe('builder CPU-cooler step', () => {
  it('gives 65 W chips the Peerless Assassin 120 SE', () => {
    const pick = coolerRecommendation({ cpuId: '9600x', caseId: 'fractal-torrent', gpuCount: 1 });
    assert.equal(pick.id, 'pa120se');
    assert.equal(pick.name, 'Thermalright Peerless Assassin 120 SE');
    assert.equal(pick.type, 'air');
    assert.equal(pick.go, '/go/newegg/thermalright-peerless-assassin-120-se?src=builder-cooler-pa120se');
    assert.match(pick.why, /65 W/);
    assert.match(AMD_NO_BOX_COOLER, /Not included/);
    assert.equal(pick.alt, null);
    assert.doesNotMatch(JSON.stringify(pick), /\$\d|\bMSRP\b/);
  });

  it('gives 9900X and 9950X the NH-D15 G2 and keeps AIO off the Torrent intake', () => {
    const air = coolerRecommendation({ cpuId: '9900x', caseId: 'fractal-torrent', gpuCount: 2 });
    assert.equal(air.id, 'nhd15g2');
    assert.equal(air.go, '/go/newegg/noctua-nh-d15-g2?src=builder-cooler-nhd15g2');
    assert.equal(air.alt, null);
    assert.equal(caseHasTop360('fractal-torrent'), false);

    const preferIntake = coolerRecommendation({
      cpuId: '9950x',
      caseId: 'fractal-torrent',
      gpuCount: 2,
      preferAio: true,
    });
    assert.equal(preferIntake.id, 'nhd15g2');
    assert.ok(preferIntake.warnings.includes(INTAKE_AIO_WARNING));
  });

  it('suggests a 360 AIO only when the case has a top radiator mount', () => {
    assert.equal(caseHasTop360('fractal-meshify-2'), true);
    assert.equal(caseHasTop360('phanteks-enthoo-pro-2-server'), true);
    const suggest = coolerRecommendation({ cpuId: '9900x', caseId: 'fractal-meshify-2', gpuCount: 2 });
    assert.equal(suggest.id, 'nhd15g2');
    assert.equal(suggest.alt?.id, 'lf3pro360');
    assert.match(suggest.alt?.why ?? '', /top radiator mount/);
    const aio = coolerRecommendation({
      cpuId: '9950x',
      caseId: 'fractal-meshify-2',
      gpuCount: 2,
      preferAio: true,
    });
    assert.equal(aio.id, 'lf3pro360');
    assert.equal(aio.type, 'aio');
    assert.equal(aio.go, '/go/newegg/arctic-liquid-freezer-iii-pro-360?src=builder-cooler-lf3pro360');
    assert.ok(aio.warnings.some((row) => /M\.2/.test(row)));
    for (const cs of CASES) {
      for (const cooler of COOLERS) {
        if (cooler.height_mm) assert.ok(cooler.height_mm <= cs.cpu_cooler_max_mm, `${cooler.id} in ${cs.id}`);
      }
    }
  });

  it('wires /go/newegg stubs, cites maker pages, and invents no prices', () => {
    assert.equal(COOLER_GO_SLUGS.length, 3);
    for (const slug of COOLER_GO_SLUGS) {
      const product = productsFile.products.find((row) => row.id === slug);
      assert.ok(product, slug);
      assert.match(product!.urls?.newegg ?? '', /^https:\/\/www\.newegg\.com\/p\/pl\?d=/);
      assert.doesNotMatch(product!.urls?.newegg ?? '', /[?&](tag|ranMID|irclickid)=|#src=/);
    }
    const payload = coolerPickPayload();
    assert.equal(payload.air_65w.id, 'pa120se');
    assert.equal(payload.air_120w.id, 'nhd15g2');
    assert.equal(payload.aio_when_top.alt?.id, 'lf3pro360');
    assert.doesNotMatch(JSON.stringify(payload), /\$\d|\bMSRP\b/);
    assert.match(read('../pages/api/v1/pick.json.ts'), /coolerPickPayload/);
    assert.match(read('../pages/api/v1/pick/[gpu].json.ts'), /coolerPickPayload/);
    assert.match(read('../components/CoolerPick.astro'), /AffiliateDisclosure/);
    assert.match(read('../pages/budget.astro'), /CoolerPick/);
    assert.match(read('../pages/calculator.astro'), /CoolerPick/);
    assert.match(read('../components/RigWizard.astro'), /CoolerPick/);
    assert.doesNotMatch(read('../components/CoolerPick.astro'), /newegg\.com/);
  });
});
