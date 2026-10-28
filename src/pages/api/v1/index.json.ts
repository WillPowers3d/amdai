import { buildIndexPayload, jsonResponse } from '../../../lib/public-api';

export async function GET() {
  return jsonResponse(buildIndexPayload());
}
