import { reportSchemaDocument } from '../../lib/lab-notes-report';

export function GET() {
  return new Response(JSON.stringify(reportSchemaDocument(), null, 2) + '\n', {
    headers: {
      'Content-Type': 'application/schema+json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
