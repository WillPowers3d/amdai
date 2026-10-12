import type { APIRoute } from 'astro';
import { forumEnabled } from '../../../lib/flags';
import { threadPath } from '../../../lib/forum-categories';
import { disabledForum, prerender } from './_guard';

export { prerender };

const THREAD_ACTIONS = new Set(['hide', 'unhide', 'lock', 'unlock', 'pin', 'unpin', 'move']);

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!forumEnabled()) return disabledForum();
  const { csrfOk, readForumBody } = await import('../../../server/forum-http');
  const { getSessionUser } = await import('../../../server/session');
  const { asActor, closeReport, getPost, getThreadById, hidePost, moderateThread } = await import('../../../server/forum');
  const { isMod } = await import('../../../lib/forum-perms');
  const { fields, csrf } = await readForumBody(request);
  if (!csrfOk(request, cookies, csrf)) return redirect('/forum/mod', 303);
  const user = await getSessionUser(cookies);
  if (!user || !isMod(asActor(user))) return redirect('/forum', 303);
  const actor = asActor(user);
  if (fields.report_id) {
    closeReport(actor, fields.report_id);
    return redirect('/forum/mod', 303);
  }
  if (fields.post_id) {
    const post = getPost(fields.post_id);
    if (post) hidePost(actor, post, fields.action !== 'unhide');
    const thread = post ? getThreadById(post.thread_id) : undefined;
    return redirect(thread ? threadPath(thread.slug) : '/forum/mod', 303);
  }
  const thread = getThreadById(fields.thread_id ?? '');
  if (thread && THREAD_ACTIONS.has(fields.action ?? '')) {
    moderateThread(actor, thread, fields.action as 'hide' | 'unhide' | 'lock' | 'unlock' | 'pin' | 'unpin' | 'move', fields.category);
    return redirect(threadPath(thread.slug), 303);
  }
  return redirect('/forum/mod', 303);
};
