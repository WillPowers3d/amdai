import { buildGpusPayload, jsonResponse } from '../../../lib/public-api';

export async function GET() {
  return jsonResponse(buildGpusPayload());
}
