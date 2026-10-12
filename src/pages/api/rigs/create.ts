import type { APIRoute } from 'astro';
import { accountsEnabled } from '../../../lib/flags';
import { disabledJson, prerender } from '../_guard';

export { prerender };

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!accountsEnabled()) return disabledJson();
  const { checkCsrf } = await import('../../../server/csrf');
  const { getSessionUser } = await import('../../../server/session');
  const { clientIp, rateLimit } = await import('../../../server/rate-limit');
  const { insertRig, toPublic, validateRig } = await import('../../../server/rigs');
  if (!checkCsrf(request, cookies)) return Response.json({ error: 'csrf' }, { status: 403 });
  const user = await getSessionUser(cookies);
  if (!user) return Response.json({ error: 'auth' }, { status: 401 });
  const limited = rateLimit(`rigs:${clientIp(request)}`, 30, 10 * 60 * 1000);
  if (!limited.ok) return Response.json({ error: 'rate_limited' }, { status: 429 });
  try {
    const body = (await request.json()) as Parameters<typeof validateRig>[0];
    const input = validateRig(body);
    const row = await insertRig(user.id, input);
    return Response.json({ rig: toPublic(row) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'invalid' }, { status: 400 });
  }
};
