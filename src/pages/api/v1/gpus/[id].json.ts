import { recipes } from '../../../../lib/recipes-data';
import { gpuPageById, gpuPages } from '../../../../lib/gpu-pages';
import { proofTokS } from '../../../../lib/recipes';
import { runs } from '../../../../lib/run-card-data';
import { isPublicQuant, jsonResponse } from '../../../../lib/public-api';

export function getStaticPaths() {
  return gpuPages(recipes).map((page) => ({ params: { id: page.id } }));
}

export async function GET({ params }: { params: { id: string } }) {
  const page = gpuPageById(recipes, params.id);
  if (!page) {
    return jsonResponse({ error: 'unknown GPU' });
  }
  return jsonResponse({
    id: page.id,
    name: page.name,
    gfx: page.gfx,
    vram_gb: page.vram_gb,
    support: page.support,
    recipes: page.recipes
      .filter((row) => isPublicQuant(row.weights.quant))
      .map((row) => ({
        id: row.id,
        model: row.model,
        quant: row.weights.quant,
        backend: row.backend,
        ctx: row.ctx,
        decode: proofTokS(row, runs),
        calculator: row.calculator,
      })),
  });
}
