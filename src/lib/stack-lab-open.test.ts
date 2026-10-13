import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isQ4PlusQuant } from './quant-guard';
import { stackLabCatalogPayload } from './recipes';
import { recipes } from './recipes-data';
import {
  HOUSE_STACK_LAB,
  STACK_LAB_FALLBACK_HREF,
  STACK_LAB_HOUSE_RECIPES,
  STACK_LAB_LOCAL_ORIGIN,
  STACK_LAB_OPEN_LABEL,
  STACK_LAB_SCHEME,
  assertStackLabOpenValid,
  isAllowlistedStackLabHref,
  knownStackLabRecipeIds,
  openInStackLab,
  openInStackLabForRecipe,
  parseStackLabHref,
  stackLabHref,
  stackLabLocalHref,
} from './stack-lab-open';

describe('Open in Stack Lab helper', () => {
  it('builds documented scheme links and rejects everything else', () => {
    assert.deepEqual(assertStackLabOpenValid(), []);
    const daily = openInStackLab(HOUSE_STACK_LAB.daily);
    assert.ok(daily);
    assert.equal(daily.label, STACK_LAB_OPEN_LABEL);
    assert.equal(daily.fallbackHref, STACK_LAB_FALLBACK_HREF);
    assert.equal(daily.href, `${STACK_LAB_SCHEME}:recipes/${STACK_LAB_HOUSE_RECIPES[0]}`);
    assert.equal(daily.localHref, `${STACK_LAB_LOCAL_ORIGIN}/#recipes/${STACK_LAB_HOUSE_RECIPES[0]}`);
    assert.ok(isAllowlistedStackLabHref(daily.href));
    const parsedDaily = parseStackLabHref(daily.href);
    assert.ok(parsedDaily);
    assert.equal(parsedDaily.id, HOUSE_STACK_LAB.daily.id);

    const recipesHub = openInStackLab(HOUSE_STACK_LAB.recipes);
    assert.ok(recipesHub);
    assert.equal(recipesHub.href, `${STACK_LAB_SCHEME}:recipes`);
    assert.equal(recipesHub.localHref, `${STACK_LAB_LOCAL_ORIGIN}/#recipes`);

    const doctor = openInStackLab(HOUSE_STACK_LAB.doctor);
    assert.ok(doctor);
    assert.equal(doctor.href, `${STACK_LAB_SCHEME}:doctor`);
    assert.equal(doctor.localHref, `${STACK_LAB_LOCAL_ORIGIN}/#doctor`);

    const planner = openInStackLab(HOUSE_STACK_LAB.planner);
    assert.ok(planner);
    assert.equal(planner.href, stackLabHref('planner'));
    assert.equal(planner.localHref, stackLabLocalHref('planner'));

    const profile = openInStackLab(HOUSE_STACK_LAB.reliable);
    assert.ok(profile);
    assert.equal(profile.href, `${STACK_LAB_SCHEME}:profile/qwen-reliable`);

    assert.equal(openInStackLab({ screen: 'recipes', id: 'https://evil.example' }), null);
    assert.equal(openInStackLab({ screen: 'profile', id: 'qwen-abliterated' }), null);
    assert.equal(openInStackLab({ screen: 'recipes', id: 'qwen2.5-7b.llamacpp' }), null);
    assert.equal(openInStackLab({ screen: 'recipes', id: 'not-a-recipe' }), null);
    assert.equal(isAllowlistedStackLabHref('https://example.com/stack-lab'), false);
    assert.equal(isAllowlistedStackLabHref('stacklab://recipes/x'), false);
    assert.equal(isAllowlistedStackLabHref('amdai-stack-lab://recipes/qwen36-35b.llamacpp-vulkan.262k'), false);
    assert.equal(isAllowlistedStackLabHref('radeon-stack-lab:recipes'), false);
  });

  it('hands off only real Q4+ recipe ids and refuses below-Q4 / banned models', () => {
    const ids = knownStackLabRecipeIds();
    assert.ok(ids.includes(STACK_LAB_HOUSE_RECIPES[0]));
    assert.ok(ids.includes(STACK_LAB_HOUSE_RECIPES[1]));
    for (const id of ids) {
      const link = openInStackLab({ screen: 'recipes', id });
      assert.ok(link, id);
      assert.equal(link.href, `${STACK_LAB_SCHEME}:recipes/${id}`);
    }
    const catalog = stackLabCatalogPayload(recipes);
    assert.ok(catalog.recipes.length);
    assert.equal(catalog.recipes[0]?.backend, 'llamacpp');
    assert.doesNotMatch(JSON.stringify(catalog), /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(JSON.stringify(catalog), /"price"|MSRP|\$\d/);
    for (const row of catalog.recipes) {
      assert.ok(isQ4PlusQuant(row.quant), row.id);
      assert.ok(openInStackLabForRecipe(recipes.find((item) => item.id === row.id)!));
    }
    const q3ish = {
      id: 'qwen36-35b-q3.llamacpp-vulkan.4k',
      model: 'Qwen3.6-35B-A3B',
      official: 'Qwen/Qwen3.6-35B-A3B',
      weights: { quant: 'UD-Q3_K_XL' as const },
    };
    assert.equal(openInStackLabForRecipe(q3ish), null);
    assert.equal(
      openInStackLabForRecipe({
        id: 'banned',
        model: 'Qwen2.5-7B',
        official: 'Qwen/Qwen2.5-7B',
        weights: { quant: 'Q4_K_M' },
      }),
      null,
    );
  });
});
