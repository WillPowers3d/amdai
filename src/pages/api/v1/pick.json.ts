import { catalogPayload, pickRecipes } from '../../../lib/recipes';
import { recipes } from '../../../lib/recipes-data';
import { gpuPages } from '../../../lib/gpu-pages';
import { isPublicQuant, jsonResponse } from '../../../lib/public-api';
import { ramPickPayload } from '../../../lib/ram-kit';

export async function GET() {
  const picks = Object.fromEntries(
    gpuPages(recipes).map((page) => [
      page.id,
      pickRecipes(recipes, page.id, page.vram_gb)
        .filter((row) => isPublicQuant(row.weights.quant))
        .map((row) => row.id),
    ]),
  );
  return jsonResponse({
    as_of: catalogPayload(recipes).as_of,
    note: 'Static lookup. Use /api/v1/pick/<gpu>.json or filter catalog.json. Query strings are not evaluated on this host.',
    ram: ramPickPayload(),
    picks,
  });
}
