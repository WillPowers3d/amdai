import { motherboardPayload } from '../../../lib/motherboards';
import { motherboardsFile } from '../../../lib/motherboards-data';

export async function GET() {
  return new Response(JSON.stringify(motherboardPayload(motherboardsFile), null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
