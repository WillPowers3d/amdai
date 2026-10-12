import type { APIRoute } from 'astro';
import { accountsEnabled } from '../../lib/flags';
import { disabledJson, prerender } from './_guard';

export { prerender };

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!accountsEnabled()) return disabledJson();
  const { checkCsrf } = await import('../../server/csrf');
  const { getSessionUser } = await import('../../server/session');
  const { sqlRun } = await import('../../server/db/client');
  if (!checkCsrf(request, cookies)) return Response.json({ error: 'csrf' }, { status: 403 });
  const user = await getSessionUser(cookies);
  if (!user) return Response.json({ error: 'auth' }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { instant?: boolean; weekly?: boolean };
  sqlRun('UPDATE users SET notify_instant = ?, notify_weekly = ? WHERE id = ?', [
    body.instant ? 1 : 0,
    body.weekly ? 1 : 0,
    user.id,
  ]);
  return Response.json({ ok: true });
};
