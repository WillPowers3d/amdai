import { stackLabCatalogPayload } from '../lib/recipes';
import { recipes } from '../lib/recipes-data';
import { runs } from '../lib/run-card-data';

export async function GET() {
  return new Response(JSON.stringify(stackLabCatalogPayload(recipes, runs), null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
