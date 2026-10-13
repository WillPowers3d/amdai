import { runs } from '../../lib/run-card-data';
import { RUN_SCHEMA } from '../../lib/run-card';

export function GET() {
  return new Response(
    JSON.stringify(
      {
        schema: RUN_SCHEMA,
        as_of: '2026-10',
        source: 'data/runs/*.jsonl',
        runs,
      },
      null,
      2,
    ) + '\n',
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    },
  );
}
