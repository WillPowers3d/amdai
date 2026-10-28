import { pickRecipes, catalogPayload } from '../../../../lib/recipes';
import { recipes } from '../../../../lib/recipes-data';
import { gpuPages } from '../../../../lib/gpu-pages';
import { isPublicQuant, jsonResponse } from '../../../../lib/public-api';

export function getStaticPaths() {
  return gpuPages(recipes).map((page) => ({ params: { gpu: page.id } }));
}

export async function GET({ params }: { params: { gpu: string } }) {
  const picked = pickRecipes(recipes, params.gpu, null).filter((row) => isPublicQuant(row.weights.quant));
  return jsonResponse({
    gpu: params.gpu,
    as_of: catalogPayload(recipes).as_of,
    recipes: picked,
  });
}
