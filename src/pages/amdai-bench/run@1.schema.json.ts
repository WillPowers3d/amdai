import { schemaDocument } from '../../lib/run-card';

export function GET() {
  return new Response(JSON.stringify(schemaDocument(), null, 2) + '\n', {
    headers: {
      'Content-Type': 'application/schema+json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
