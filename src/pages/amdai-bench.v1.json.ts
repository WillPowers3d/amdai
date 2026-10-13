import { amdaiBenchFile } from '../lib/results-data';

export function GET() {
  return new Response(JSON.stringify(amdaiBenchFile, null, 2) + '\n', {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
