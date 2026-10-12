import type { APIRoute } from 'astro';
import { forumEnabled } from '../../../lib/flags';
import { threadPath } from '../../../lib/forum-categories';
import { disabledForum, prerender } from './_guard';

export { prerender };

export const POST: APIRoute = async ({ request, cookies, redirect, url }) => {
  if (!forumEnabled()) return disabledForum();
  const { csrfOk, readForumBody, failRedirect } = await import('../../../server/forum-http');
  const { getSessionUser } = await import('../../../server/session');
  const { clientIp, rateLimit } = await import('../../../server/rate-limit');
  const { asActor, createReply, getThreadById } = await import('../../../server/forum');
  const { fields, csrf } = await readForumBody(request);
  const thread = getThreadById(fields.thread_id ?? '');
  const back = thread ? threadPath(thread.slug) : '/forum';
  if (!csrfOk(request, cookies, csrf)) return redirect(failRedirect(url, 'csrf', back), 303);
  const user = await getSessionUser(cookies);
  if (!user) return redirect(`/login?next=${encodeURIComponent(back)}`, 303);
  if (!thread) return redirect('/forum', 303);
  const limited = rateLimit(`forum-reply:${user.id}:${clientIp(request)}`, 20, 60 * 60 * 1000);
  if (!limited.ok) return redirect(failRedirect(url, 'rate_limited', back), 303);
  const result = createReply({ actor: asActor(user), thread, body: fields.body ?? '', website: fields.website });
  if (!result.ok) return redirect(failRedirect(url, result.reason, back), 303);
  return redirect(back, 303);
};
