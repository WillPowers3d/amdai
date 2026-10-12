import type { APIRoute } from 'astro';
import { forumEnabled } from '../../../lib/flags';
import { threadPath } from '../../../lib/forum-categories';
import { disabledForum, prerender } from './_guard';

export { prerender };

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!forumEnabled()) return disabledForum();
  const { csrfOk, readForumBody } = await import('../../../server/forum-http');
  const { getSessionUser } = await import('../../../server/session');
  const { clientIp, rateLimit } = await import('../../../server/rate-limit');
  const { asActor, getPost, getThreadById, toggleVote } = await import('../../../server/forum');
  const { fields, csrf } = await readForumBody(request);
  const post = getPost(fields.post_id ?? '');
  const thread = post ? getThreadById(post.thread_id) : undefined;
  const back = thread ? `${threadPath(thread.slug)}#${post?.id ?? ''}` : '/forum';
  if (!csrfOk(request, cookies, csrf)) return redirect(back, 303);
  const user = await getSessionUser(cookies);
  if (!user) return redirect(`/login?next=${encodeURIComponent(back)}`, 303);
  if (!post) return redirect('/forum', 303);
  const limited = rateLimit(`forum-vote:${user.id}:${clientIp(request)}`, 40, 60 * 60 * 1000);
  if (!limited.ok) return redirect(back, 303);
  toggleVote(asActor(user), post);
  return redirect(back, 303);
};
