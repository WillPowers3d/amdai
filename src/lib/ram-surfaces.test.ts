import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DIMM_KIT_GB } from './calculator';
import { houseSystemRam } from './house-ram';
import {
  RAM_FULL_LABEL,
  RAM_MIN_LABEL,
  RAM_OFFLOAD_SURFACES,
  assertRamSurfacesValid,
  isRamOffloadSurface,
  missingRamLabels,
} from './ram-surfaces';

describe('shopper RAM labels', () => {
  it('keeps the two labels stable and lists the offload surfaces', () => {
    assert.deepEqual(assertRamSurfacesValid(), []);
    assert.equal(RAM_MIN_LABEL, 'Minimum system RAM needed');
    assert.equal(RAM_FULL_LABEL, 'RAM needed at full context');
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/r9700'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/strix-halo'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/rx7900xtx'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/rx7900xt'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/rx7800xt'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/rx-9070-xt'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/rx-9060-xt'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/compare/radeon-vs-nvidia'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/models/qwen36'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/models/flash'));
    assert.ok(isRamOffloadSurface('/recipes/qwen36-35b.llamacpp-vulkan.262k'));
    assert.equal(isRamOffloadSurface('/results'), false);
    assert.deepEqual(missingRamLabels('<p>peak system RAM 42.9 GB</p>'), [RAM_MIN_LABEL, RAM_FULL_LABEL]);
    assert.deepEqual(
      missingRamLabels(`<p>${RAM_MIN_LABEL}</p><p>${RAM_FULL_LABEL}</p>`),
      [],
    );
  });

  it('builds house daily and Flash kit lines from recipes, not invented numbers', () => {
    const daily = houseSystemRam('daily');
    const flash = houseSystemRam('flash');
    assert.ok(daily);
    assert.ok(flash);
    assert.ok((DIMM_KIT_GB as readonly number[]).includes(daily.atSelected.kitGb));
    assert.ok(daily.atFullContext.kitGb >= daily.atSelected.kitGb);
    assert.ok((DIMM_KIT_GB as readonly number[]).includes(daily.atFullContext.kitGb));
    assert.ok((DIMM_KIT_GB as readonly number[]).includes(flash.atFullContext.kitGb));
    assert.match(daily.atSelected.note + daily.atFullContext.note, /GB/);
    assert.doesNotMatch(JSON.stringify(daily), /Qwen2\.5|Qwen3-8B|"price"/);
  });
});
