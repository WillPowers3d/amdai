import type { APIRoute } from 'astro';
import { accountsEnabled } from '../../../lib/flags';
import { disabledJson, prerender } from '../_guard';

export { prerender };

export const POST: APIRoute = async ({ cookies, redirect, request }) => {
  if (!accountsEnabled()) return disabledJson();
  const { checkCsrf } = await import('../../../server/csrf');
  const { destroySession } = await import('../../../server/session');
  if (!checkCsrf(request, cookies)) return Response.json({ error: 'csrf' }, { status: 403 });
  await destroySession(cookies);
  if (request.headers.get('accept')?.includes('text/html')) return redirect('/');
  return Response.json({ ok: true });
};
