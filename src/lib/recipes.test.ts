import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { queryToInput } from './calculator';
import { detectGpu, detectPrimary } from './gpu-detect';
import { GPU_NAME_IDS, MODEL_PAGES, gpuCardIdFromName } from './gpu-ids';
import {
  harnessSnippetFromRecipe,
  matchRecipe,
  parseRecipe,
  parseRecipes,
  pickRecipes,
  recipesForCard,
  recipeTestedLine,
  stackLabCatalogPayload,
  withdrawalUpdates,
  type Recipe,
} from './recipes';
import { recipes } from './recipes-data';
import { primaryNav } from './site';
import { parseWanted } from './wanted';
import { FLASH_Q3_EXCEPTION } from './run-card';

const seed = Object.fromEntries(recipes.map((row) => [row.id, row]));

describe('recipe catalog', () => {
  it('seeds only the measured local desktop decode set and rejects extras', () => {
    const decodes = recipes.flatMap((row) => row.proof.map((proof) => proof.decode).filter((n): n is number => n != null));
    assert.deepEqual(
      [...new Set(decodes)].sort((a, b) => a - b),
      [16, 32.6, 44.4, 90.52, 102.39, 109.73, 117.69],
    );
    assert.ok(seed['qwen36-35b.llamacpp-vulkan.4k']);
    assert.ok(seed['qwen36-35b.llamacpp-vulkan.32k']);
    assert.ok(seed['qwen36-35b.llamacpp-vulkan.262k']);
    assert.ok(seed['qwen36-35b-q5km.llamacpp-vulkan.4k']);
    assert.ok(seed['qwen36-35b-q4km.llamacpp-vulkan.4k']);
    assert.ok(seed['qwen38-flash.strata.262k']);
    assert.ok(seed['qwen38-flash.llamacpp.262k']);
    assert.equal(recipes.every((row) => row.proof[0]?.tier === 'tested-our-rig'), true);
    assert.equal(recipes.every((row) => row.withdrawn == null), true);
    const stackLab = stackLabCatalogPayload(recipes);
    assert.ok(stackLab.recipes.length);
    assert.equal(stackLab.path, '/recipes.json');
    assert.equal(stackLab.recipes[0]?.backend, 'llamacpp');
    assert.doesNotMatch(JSON.stringify(stackLab), /Qwen2\.5|Qwen3-8B|"price"|MSRP/);
  });

  it('fails the build on Q1/Q2 and on a number without a source', () => {
    const base = structuredClone(recipes[0]) as Recipe;
    assert.throws(() => parseRecipe({ ...base, weights: { ...base.weights, quant: 'IQ2_XXS' } }, 'bad-q2'));
    assert.throws(() =>
      parseRecipe(
        {
          ...base,
          proof: [{ ...base.proof[0], decode: 99.9, source: 'ok source' }],
        },
        'unsourced-number',
      ),
    );
    assert.throws(() => parseRecipe({ ...base, model: 'Qwen2.5-7B', official: 'Qwen/Qwen2.5-7B' }, 'banned'));
    const flashQ3 = {
      ...seed['qwen38-flash.strata.262k']!,
      id: 'qwen38-flash-q3-exception',
      weights: { ...seed['qwen38-flash.strata.262k']!.weights, quant: 'UD-Q3_K_XL', filename: 'UD-Q3_K_XL (folder)' },
      notes: [`Measured on our rig, 2026-10. Exception ${FLASH_Q3_EXCEPTION}.`],
      proof: [{ ...seed['qwen38-flash.strata.262k']!.proof[0]!, decode: 12.3 }],
    };
    assert.throws(() => parseRecipe(flashQ3, 'flash-q3-unsourced'));
    const accepted = parseRecipe(flashQ3, 'flash-q3-ok', { extraProofNumbers: [12.3] });
    assert.equal(accepted.weights.quant, 'UD-Q3_K_XL');
    assert.match(accepted.notes.join(' '), /flash-q3-measured-approved/);
  });

  it('keeps llama.cpp first in pick and matches calculator presets to recipes', () => {
    const picked = pickRecipes(recipes, 'r9700', 32);
    assert.ok(picked.length > 0);
    assert.equal(picked[0]?.backend, 'llamacpp');
    assert.equal(pickRecipes(recipes, 'r9700s', 32).length, 0);

    const daily = queryToInput('?gpu=r9700&vram=32&n=1&split=0&ram=256&model=qwen36&quant=q5_k_m&ctx=262144&kv=f16');
    const hit = matchRecipe(recipes, daily);
    assert.equal(hit?.id, 'qwen36-35b.llamacpp-vulkan.262k');
    assert.match(recipeTestedLine(hit).text, /Tested: 44\.4 tok\/s/);
    assert.equal(recipeTestedLine(null).tested, false);

    const q4 = queryToInput('?gpu=r9700&vram=32&n=1&model=qwen36&quant=q4_k_m&ctx=4096&kv=f16');
    assert.equal(matchRecipe(recipes, q4)?.id, 'qwen36-35b-q4km.llamacpp-vulkan.4k');
  });

  it('turns a withdrawal into a rig update and keeps recipe history', () => {
    const withdrawn = parseRecipes([
      {
        file: 'withdrawn.json',
        data: {
          ...recipes[0],
          id: 'example-withdrawn',
          withdrawn: { date: '2026-10', reason: 'regression after a Mesa bump', source: 'https://amdai.net/updates' },
        },
      },
    ]);
    const updates = withdrawalUpdates(withdrawn);
    assert.equal(updates.length, 1);
    assert.match(updates[0]?.summary ?? '', /withdrawn/);
    assert.equal(updates[0]?.affected_gpus[0], recipes[0]?.card);
  });

  it('renders a harness snippet from the recipe port and model name', () => {
    const flash = seed['qwen38-flash.strata.262k'];
    assert.ok(flash);
    const snippet = harnessSnippetFromRecipe(flash);
    assert.match(snippet, /8083/);
    assert.match(snippet, /Qwen 3\.8 Flash/);
    assert.match(snippet, /Hermes \/ Aider \/ Cline \/ OpenCode/);
  });
});

describe('GPU detect and pages', () => {
  it('maps rocminfo names and gfx IDs without collapsing 9070 XT into a bare 9070', () => {
    const named = detectPrimary('Marketing Name: Radeon AI PRO R9700\nName: gfx1201');
    assert.equal(named?.id, 'r9700');
    assert.equal(named?.confidence, 'name');
    const xt = detectPrimary('AMD Radeon RX 9070 XT');
    assert.equal(xt?.id, 'rx9070xt');
    const xt7600 = detectPrimary('AMD Radeon RX 7600 XT');
    assert.equal(xt7600?.id, 'rx7600xt');
    const bare7600 = detectPrimary('AMD Radeon RX 7600');
    assert.equal(bare7600?.id, 'rx7600');
    const xt6800 = detectPrimary('AMD Radeon RX 6800 XT');
    assert.equal(xt6800?.id, 'rx6800xt');
    const xt6700 = detectPrimary('AMD Radeon RX 6700 XT');
    assert.equal(xt6700?.id, 'rx6700xt');
    const w6800 = detectPrimary('Radeon PRO W6800');
    assert.equal(w6800?.id, 'w6800');
    const gfxOnly = detectGpu('gfx1201');
    assert.ok(gfxOnly.some((hit) => hit.id === 'r9700'));
    assert.ok(gfxOnly.some((hit) => hit.id === 'rx9070xt'));
    assert.equal(gfxOnly.every((hit) => hit.confidence === 'gfx'), true);
  });

  it('gives every directory card a unique page id', () => {
    const file = parse(readFileSync(new URL('../data/gpus.yaml', import.meta.url), 'utf8')) as {
      cards: Array<{ name: string }>;
    };
    const ids = file.cards.map((card) => gpuCardIdFromName(card.name));
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(ids.length, file.cards.length);
    assert.ok(recipesForCard(recipes, 'r9700').length);
    assert.equal(recipesForCard(recipes, 'rx9070xt').length, 0);
    for (const name of Object.keys(GPU_NAME_IDS)) {
      assert.ok(file.cards.some((card) => card.name === name), name);
    }
    assert.deepEqual(
      MODEL_PAGES.map((row) => row.id),
      ['qwen36', 'flash', 'gpt-oss-20b', 'gemma3-27b', 'llama33-70b', 'glm-53-flash', 'qwen36-27b', 'qwen38-27b'],
    );
  });
});

describe('wanted board and nav', () => {
  it('lists gaps without bounty amounts or banned models', () => {
    const wantedFile = parseWanted(parse(readFileSync(new URL('../data/wanted.yaml', import.meta.url), 'utf8')));
    assert.ok(wantedFile.items.length >= 3);
    assert.doesNotMatch(JSON.stringify(wantedFile), /\$\d+|bounty/i);
    assert.doesNotMatch(JSON.stringify(wantedFile), /Qwen2\.5|Qwen3-8B/);
    assert.throws(() => parseWanted({ as_of: 'x', rule: 'r', items: [{ id: 'a', card: 'c', card_name: 'n', model: 'm', why: 'w', request: '$50 bounty' }] }));
    for (const href of ['/contribute', '/wanted', '/credits', '/models']) {
      assert.ok(primaryNav.some((item) => item.href === href), href);
    }
  });
});
