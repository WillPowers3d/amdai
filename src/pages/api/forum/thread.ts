import type { APIRoute } from 'astro';
import { forumEnabled } from '../../../lib/flags';
import { threadPath } from '../../../lib/forum-categories';
import { disabledForum, prerender } from './_guard';

export { prerender };

export const POST: APIRoute = async ({ request, cookies, redirect, url }) => {
  if (!forumEnabled()) return disabledForum();
  const { csrfOk, readForumBody, failRedirect, rigSnapshotForUser } = await import('../../../server/forum-http');
  const { getSessionUser } = await import('../../../server/session');
  const { clientIp, rateLimit } = await import('../../../server/rate-limit');
  const { asActor, createThread } = await import('../../../server/forum');
  const { fields, csrf } = await readForumBody(request);
  if (!csrfOk(request, cookies, csrf)) return redirect(failRedirect(url, 'csrf', '/forum/new'), 303);
  const user = await getSessionUser(cookies);
  if (!user) return redirect('/login?next=/forum/new', 303);
  const limited = rateLimit(`forum-thread:${user.id}:${clientIp(request)}`, 5, 60 * 60 * 1000);
  if (!limited.ok) return redirect(failRedirect(url, 'rate_limited', '/forum/new'), 303);
  const result = await createThread({
    actor: asActor(user),
    title: fields.title ?? '',
    body: fields.body ?? '',
    category: fields.category ?? '',
    website: fields.website,
    rig: await rigSnapshotForUser(user.id, fields.rig_id),
    errorPatternId: fields.error_pattern_id || null,
  });
  if (!result.ok) return redirect(failRedirect(url, result.reason, '/forum/new'), 303);
  if (result.ignored || !result.slug) return redirect('/forum', 303);
  return redirect(threadPath(result.slug), 303);
};
