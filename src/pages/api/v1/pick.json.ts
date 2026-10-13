import { catalogPayload, pickRecipes } from '../../../lib/recipes';
import { recipes } from '../../../lib/recipes-data';
import { gpuPages } from '../../../lib/gpu-pages';

export async function GET() {
  const picks = Object.fromEntries(
    gpuPages(recipes).map((page) => [
      page.id,
      pickRecipes(recipes, page.id, page.vram_gb).map((row) => row.id),
    ]),
  );
  return new Response(
    JSON.stringify(
      {
        as_of: catalogPayload(recipes).as_of,
        note: 'Static lookup. Use /api/v1/pick/<gpu>.json or filter catalog.json. Query strings are not evaluated on this host.',
        picks,
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );
}
