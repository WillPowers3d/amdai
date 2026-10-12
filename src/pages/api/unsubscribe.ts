import type { APIRoute } from 'astro';
import { accountsEnabled } from '../../lib/flags';
import { disabledJson, prerender } from './_guard';

export { prerender };

export const POST: APIRoute = async ({ request }) => {
  if (!accountsEnabled()) return disabledJson();
  const { sqlRun } = await import('../../server/db/client');
  const { clientIp, rateLimit } = await import('../../server/rate-limit');
  const limited = rateLimit(`unsub:${clientIp(request)}`, 20, 10 * 60 * 1000);
  if (!limited.ok) return Response.json({ error: 'rate_limited' }, { status: 429 });
  const body = (await request.json().catch(() => ({}))) as { token?: string };
  if (!body.token) return Response.json({ error: 'missing' }, { status: 400 });
  sqlRun('UPDATE users SET notify_instant = 0, notify_weekly = 0 WHERE unsub_token = ?', [body.token]);
  return Response.json({ ok: true });
};
