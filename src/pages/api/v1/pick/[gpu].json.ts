import { pickRecipes, catalogPayload } from '../../../../lib/recipes';
import { recipes } from '../../../../lib/recipes-data';
import { gpuPages } from '../../../../lib/gpu-pages';

export function getStaticPaths() {
  return gpuPages(recipes).map((page) => ({ params: { gpu: page.id } }));
}

export async function GET({ params }: { params: { gpu: string } }) {
  const picked = pickRecipes(recipes, params.gpu, null);
  return new Response(
    JSON.stringify(
      {
        gpu: params.gpu,
        as_of: catalogPayload(recipes).as_of,
        recipes: picked,
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );
}
