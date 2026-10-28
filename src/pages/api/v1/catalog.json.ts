import { isPublicQuant, jsonResponse } from '../../../lib/public-api';
import { catalogPayload } from '../../../lib/recipes';
import { recipes } from '../../../lib/recipes-data';
import { runs } from '../../../lib/run-card-data';

export async function GET() {
  const payload = catalogPayload(recipes, runs);
  return jsonResponse({
    ...payload,
    recipes: payload.recipes.filter((row) => isPublicQuant(String(row.quant ?? ''))),
  });
}
