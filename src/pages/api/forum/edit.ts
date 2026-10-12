import type { APIRoute } from 'astro';
import { forumEnabled } from '../../../lib/flags';
import { threadPath } from '../../../lib/forum-categories';
import { disabledForum, prerender } from './_guard';

export { prerender };

export const POST: APIRoute = async ({ request, cookies, redirect, url }) => {
  if (!forumEnabled()) return disabledForum();
  const { csrfOk, readForumBody, failRedirect } = await import('../../../server/forum-http');
  const { getSessionUser } = await import('../../../server/session');
  const { asActor, editPost, getPost, getThreadById } = await import('../../../server/forum');
  const { fields, csrf } = await readForumBody(request);
  const post = getPost(fields.post_id ?? '');
  const thread = post ? getThreadById(post.thread_id) : undefined;
  const back = thread ? threadPath(thread.slug) : '/forum';
  if (!csrfOk(request, cookies, csrf)) return redirect(failRedirect(url, 'csrf', back), 303);
  const user = await getSessionUser(cookies);
  if (!user || !post || !thread) return redirect(back, 303);
  const result = editPost({ actor: asActor(user), post, thread, body: fields.body ?? '' });
  if (!result.ok) return redirect(failRedirect(url, result.reason, back), 303);
  return redirect(back, 303);
};
