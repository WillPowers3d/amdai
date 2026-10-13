import type { APIRoute } from 'astro';
import { accountsEnabled, newsletterEnabled } from '../../lib/flags';
import { unsubscribeNewsletter } from '../../lib/newsletter';
import { disabledJson } from './_guard';

export const prerender = !accountsEnabled() && !newsletterEnabled();

export const POST: APIRoute = async ({ request }) => {
  if (!accountsEnabled() && !newsletterEnabled()) return disabledJson();
  const { clientIp, rateLimit } = await import('../../server/rate-limit');
  const limited = rateLimit(`unsub:${clientIp(request)}`, 20, 10 * 60 * 1000);
  if (!limited.ok) return Response.json({ error: 'rate_limited' }, { status: 429 });
  const body = (await request.json().catch(() => ({}))) as { token?: string };
  if (!body.token) return Response.json({ error: 'missing' }, { status: 400 });
  let newsletterOk = false;
  if (newsletterEnabled()) {
    const { getNewsletterStore } = await import('../../server/newsletter-store');
    const result = unsubscribeNewsletter(getNewsletterStore(), body.token);
    newsletterOk = result.ok;
  }
  if (accountsEnabled()) {
    const { sqlRun } = await import('../../server/db/client');
    sqlRun('UPDATE users SET notify_instant = 0, notify_weekly = 0 WHERE unsub_token = ?', [body.token]);
  }
  if (newsletterOk || accountsEnabled()) return Response.json({ ok: true });
  return Response.json({ error: 'invalid' }, { status: 400 });
};
