import type { APIRoute } from 'astro';
import { forumEnabled } from '../../../lib/flags';
import { threadPath } from '../../../lib/forum-categories';
import { disabledForum, prerender } from './_guard';

export { prerender };

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!forumEnabled()) return disabledForum();
  const { csrfOk, readForumBody } = await import('../../../server/forum-http');
  const { getSessionUser } = await import('../../../server/session');
  const { asActor, getThreadById, setSolved } = await import('../../../server/forum');
  const { fields, csrf } = await readForumBody(request);
  const thread = getThreadById(fields.thread_id ?? '');
  const back = thread ? threadPath(thread.slug) : '/forum';
  if (!csrfOk(request, cookies, csrf)) return redirect(back, 303);
  const user = await getSessionUser(cookies);
  if (!user || !thread) return redirect(back, 303);
  setSolved(asActor(user), thread, fields.solved !== '0');
  return redirect(back, 303);
};
