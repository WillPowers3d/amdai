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
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/rx-7900-xtx'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/rx-7900-xt'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/rx-7800-xt'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/rx-9070-xt'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/rx-9060-xt'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/rx-7900-gre'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/rx-7700-xt'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/rx-7600-xt'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/rx-7600'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/rx-6800-xt'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/rx-6700-xt'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/w7900'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/w7800'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/w7700'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/gpus/w6800'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/image-gen'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/speech'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/long-context'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/rag'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/vision'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/power'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/compare/radeon-vs-nvidia'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/compare/gpus'));
    assert.ok(isRamOffloadSurface('/compare/r9700-vs-rx-9070-xt'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/models/qwen36'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/models/flash'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/models/gpt-oss-20b'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/models/gemma3-27b'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/models/llama33-70b'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/models/glm-53-flash'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/models/qwen36-27b'));
    assert.ok(RAM_OFFLOAD_SURFACES.includes('/models/qwen38-27b'));
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
