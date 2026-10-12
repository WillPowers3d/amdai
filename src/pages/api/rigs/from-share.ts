import type { APIRoute } from 'astro';
import { accountsEnabled } from '../../../lib/flags';
import { disabledJson, prerender } from '../_guard';

export { prerender };

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!accountsEnabled()) return disabledJson();
  const { checkCsrf } = await import('../../../server/csrf');
  const { getSessionUser } = await import('../../../server/session');
  const { shareToRigDraft } = await import('../../../lib/share-to-rig');
  const { insertRig, toPublic, validateRig } = await import('../../../server/rigs');
  if (!checkCsrf(request, cookies)) return Response.json({ error: 'csrf' }, { status: 403 });
  const user = await getSessionUser(cookies);
  if (!user) return Response.json({ error: 'auth' }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { search?: string; from?: 'calculator' | 'budget' };
  try {
    const draft = shareToRigDraft(body.search ?? '', body.from === 'budget' ? 'budget' : 'calculator');
    const row = await insertRig(user.id, validateRig(draft));
    return Response.json({ rig: toPublic(row) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'invalid' }, { status: 400 });
  }
};
