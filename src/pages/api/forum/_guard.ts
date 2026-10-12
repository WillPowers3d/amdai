import { forumEnabled } from '../../../lib/flags';

export const prerender = !forumEnabled();

export function disabledForum(): Response {
  return Response.json({ error: 'forum_disabled', message: 'Forum is off on this static build.' }, { status: 404 });
}
