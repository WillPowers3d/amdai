import { jsonResponse } from '../../../lib/public-api';
import { buildServingPayload } from '../../../lib/serving';

export async function GET() {
  return jsonResponse(buildServingPayload());
}
