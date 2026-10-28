import { pickRecipes, catalogPayload } from '../../../../lib/recipes';
import { recipes } from '../../../../lib/recipes-data';
import { gpuPages } from '../../../../lib/gpu-pages';
import { isPublicQuant, jsonResponse, planFitInput } from '../../../../lib/public-api';
import { ramPickPayload, ramRecommendation, setupNeedsRamOffload } from '../../../../lib/ram-kit';

export function getStaticPaths() {
  return gpuPages(recipes).map((page) => ({ params: { gpu: page.id } }));
}

export async function GET({ params }: { params: { gpu: string } }) {
  const picked = pickRecipes(recipes, params.gpu, null).filter((row) => isPublicQuant(row.weights.quant));
  const sample = planFitInput({ gpu: params.gpu });
  const needsOffload = setupNeedsRamOffload(sample);
  return jsonResponse({
    gpu: params.gpu,
    as_of: catalogPayload(recipes).as_of,
    ram: {
      ...ramPickPayload(),
      recommended: ramRecommendation({ bigModels: false, needsOffload }),
    },
    recipes: picked,
  });
}
