import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { assertRelatedValid, relatedFor } from './related';
import { liveRecipes, recipesForCard } from './recipes';
import { recipes } from './recipes-data';

describe('related links', () => {
  it('builds GPU, recipe, and topic links from shared data', () => {
    assert.deepEqual(assertRelatedValid(), []);
    const r9700 = relatedFor('/gpus/r9700');
    const hrefs = r9700.map((link) => link.href);
    for (const href of ['/compare', '/compare/radeon-vs-nvidia', '/benchmarks', '/multi-gpu', '/setup']) {
      assert.ok(hrefs.includes(href), href);
    }
    const recipeIds = recipesForCard(recipes, 'r9700').map((row) => `/recipes/${row.id}`);
    assert.ok(recipeIds.some((href) => hrefs.includes(href)));
    assert.ok(!hrefs.includes('/gpus/r9700'));
    assert.ok(!hrefs.includes('/two-r9700'));
    for (const href of ['/gpus/rx7900xtx', '/gpus/rx7900xt', '/gpus/rx7800xt']) {
      assert.ok(hrefs.includes(href), href);
    }
    const xtx = relatedFor('/gpus/rx7900xtx').map((link) => link.href);
    for (const href of ['/gpus/r9700', '/calculator', '/budget', '/setup', '/stack-lab']) {
      assert.ok(xtx.includes(href), href);
    }
    assert.ok(!xtx.includes('/gpus/rx7900xtx'));
    const blob = r9700.map((link) => `${link.label} ${link.href}`).join('\n');
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
  });

  it('ties a recipe to its GPU, model, backend, and siblings', () => {
    const recipe = liveRecipes(recipes)[0];
    assert.ok(recipe);
    const links = relatedFor(`/recipes/${recipe.id}`);
    const hrefs = links.map((link) => link.href);
    assert.ok(hrefs.includes(`/gpus/${recipe.card}`));
    assert.ok(hrefs.includes(`/models/${recipe.model_id}`));
    const model = relatedFor('/models/qwen36').map((link) => link.href);
    for (const href of ['/qwen36-dual', '/compare', '/benchmarks', '/calculator', '/gpus/r9700']) {
      assert.ok(model.includes(href), href);
    }
    assert.ok(hrefs.includes(`/backends/${recipe.backend}`));
    assert.equal(relatedFor('/').length, 0);
    assert.equal(relatedFor('/404').length, 0);
  });
});
