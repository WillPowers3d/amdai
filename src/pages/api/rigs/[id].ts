import type { APIRoute } from 'astro';
import { accountsEnabled } from '../../../lib/flags';
import { disabledJson, prerender } from '../_guard';

export { prerender };

export function getStaticPaths() {
  return [];
}

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  if (!accountsEnabled()) return disabledJson();
  const { checkCsrf } = await import('../../../server/csrf');
  const { getSessionUser } = await import('../../../server/session');
  const { updateRig, validateRig } = await import('../../../server/rigs');
  if (!checkCsrf(request, cookies)) return Response.json({ error: 'csrf' }, { status: 403 });
  const user = await getSessionUser(cookies);
  if (!user) return Response.json({ error: 'auth' }, { status: 401 });
  try {
    const input = validateRig((await request.json()) as Parameters<typeof validateRig>[0]);
    await updateRig(user.id, params.id!, input);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'invalid' }, { status: 400 });
  }
};

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  if (!accountsEnabled()) return disabledJson();
  const { checkCsrf } = await import('../../../server/csrf');
  const { getSessionUser } = await import('../../../server/session');
  const { deleteRig } = await import('../../../server/rigs');
  if (!checkCsrf(request, cookies)) return Response.json({ error: 'csrf' }, { status: 403 });
  const user = await getSessionUser(cookies);
  if (!user) return Response.json({ error: 'auth' }, { status: 401 });
  await deleteRig(user.id, params.id!);
  return Response.json({ ok: true });
};
