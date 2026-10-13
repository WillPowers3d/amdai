import { catalogPayload } from '../../../lib/recipes';
import { recipes } from '../../../lib/recipes-data';

export async function GET() {
  return new Response(JSON.stringify(catalogPayload(recipes), null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
