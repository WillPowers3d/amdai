import { recipes } from '../../../../lib/recipes-data';
import { gpuPageById, gpuPages } from '../../../../lib/gpu-pages';
import { proofTokS } from '../../../../lib/recipes';
import { runs } from '../../../../lib/run-card-data';

export function getStaticPaths() {
  return gpuPages(recipes).map((page) => ({ params: { id: page.id } }));
}

export async function GET({ params }: { params: { id: string } }) {
  const page = gpuPageById(recipes, params.id);
  if (!page) {
    return new Response(JSON.stringify({ error: 'unknown GPU' }), { status: 404 });
  }
  return new Response(
    JSON.stringify(
      {
        id: page.id,
        name: page.name,
        gfx: page.gfx,
        vram_gb: page.vram_gb,
        support: page.support,
        recipes: page.recipes.map((row) => ({
          id: row.id,
          model: row.model,
          quant: row.weights.quant,
          backend: row.backend,
          ctx: row.ctx,
          decode: proofTokS(row, runs),
          calculator: row.calculator,
        })),
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );
}
