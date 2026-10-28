import { buildStacksPayload, jsonResponse } from '../../../lib/public-api';

export async function GET() {
  return jsonResponse(buildStacksPayload());
}
