import type { APIRoute } from 'astro';
import { accountsEnabled } from '../../lib/flags';
import { disabledJson, prerender } from './_guard';

export { prerender };

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!accountsEnabled()) return disabledJson();
  const { checkCsrf } = await import('../../server/csrf');
  const { getSessionUser } = await import('../../server/session');
  const { sqlRun } = await import('../../server/db/client');
  if (!checkCsrf(request, cookies)) return Response.json({ error: 'csrf' }, { status: 403 });
  const user = await getSessionUser(cookies);
  if (!user) return Response.json({ error: 'auth' }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as {
    instant?: boolean;
    weekly?: boolean;
    replies?: boolean;
    newsletterTopics?: string[];
  };
  sqlRun('UPDATE users SET notify_instant = ?, notify_weekly = ?, notify_replies = ? WHERE id = ?', [
    body.instant ? 1 : 0,
    body.weekly ? 1 : 0,
    body.replies ? 1 : 0,
    user.id,
  ]);
  if (Array.isArray(body.newsletterTopics)) {
    const { getNewsletterStore } = await import('../../server/newsletter-store');
    const { confirm, subscribe, updateTopics } = await import('../../lib/newsletter');
    const store = getNewsletterStore();
    const existing = store.getByEmail(user.email);
    if (!existing) {
      const pending = subscribe(store, { email: user.email, topics: body.newsletterTopics, ip: 'account' });
      if (pending.subscriber) confirm(store, pending.subscriber.confirmToken);
    } else if (!existing.confirmed) {
      confirm(store, existing.confirmToken);
      updateTopics(store, { email: user.email, topics: body.newsletterTopics });
    } else {
      updateTopics(store, { email: user.email, topics: body.newsletterTopics });
    }
  }
  return Response.json({ ok: true });
};
