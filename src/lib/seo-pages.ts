/**
 * Register unique titles/descriptions for data-driven routes.
 */

import { backends } from './backends-data';
import { gpuPages } from './gpu-pages';
import { harnesses, harnessesFile } from './harnesses-data';
import { quizCombos, parseQuizCombo, pickHarness } from './harnesses';
import { recipes } from './recipes-data';
import { rocmProblems } from './rocm-problems-data';
import { MODEL_PAGES } from './gpu-ids';
import { runs } from './run-card-data';
import { bootstrapPageMeta, registerRunCardMeta } from './seo';

registerRunCardMeta(runs);

const extra: Array<{ path: string; title: string; description: string }> = [];

for (const page of gpuPages(recipes)) {
  if (page.id === 'r9700') continue;
  extra.push({
    path: `/gpus/${page.id}`,
    title: page.name.replace(/^AMD /, ''),
    description: `${page.name} recipes — gfx ${page.gfx}, ${page.vram_gb ?? 'unlisted'} GB VRAM, official ROCm row when listed. Launch commands from tested recipes only.`,
  });
}

for (const model of MODEL_PAGES) {
  extra.push({
    path: `/models/${model.id}`,
    title: model.name,
    description: `${model.name} on Radeon — ${model.role}. Tested recipes and calculator links, not a VRAM-math guess.`,
  });
}

for (const recipe of recipes) {
  extra.push({
    path: `/recipes/${recipe.id}`,
    title: `${recipe.weights.quant} on ${recipe.card}`,
    description: `Recipe ${recipe.id}: ${recipe.model} ${recipe.weights.quant} via ${recipe.backend} at ${recipe.ctx_label} on ${recipe.card}.`,
  });
}

for (const row of backends()) {
  extra.push({
    path: `/backends/${row.id}`,
    title: row.name,
    description: `${row.name} on a home Radeon box — ${row.short} llama.cpp stays first unless this page says otherwise.`,
  });
}

for (const row of harnesses()) {
  extra.push({
    path: `/harnesses/${row.id}`,
    title: row.title,
    description: `${row.title}: ${row.summary}`.slice(0, 200),
  });
}

const list = harnesses();
for (const combo of quizCombos()) {
  const pick = pickHarness(parseQuizCombo(combo), list);
  extra.push({
    path: `/harnesses/quiz/${combo}`,
    title: `Quiz ${combo}`,
    description: `Harness quiz ${combo} picks ${pick.primary.title}. Local llama.cpp first; hybrid stays labeled. Not a speed claim.`,
  });
}

for (const problem of rocmProblems()) {
  extra.push({
    path: `/rocm-problems/${problem.id}`,
    title: problem.title,
    description: problem.summary,
  });
}

void harnessesFile;

bootstrapPageMeta(extra);
