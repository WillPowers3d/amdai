import type { APIRoute } from 'astro';
import { accountsEnabled, newsletterEnabled } from '../../../lib/flags';
import { updateTopics } from '../../../lib/newsletter';
import { disabledNewsletter, prerender } from './_guard';

export { prerender };

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!newsletterEnabled()) return disabledNewsletter();
  const { clientIp, rateLimit } = await import('../../../server/rate-limit');
  const { getNewsletterStore } = await import('../../../server/newsletter-store');
  const limited = rateLimit(`nl-topics:${clientIp(request)}`, 20, 10 * 60 * 1000);
  if (!limited.ok) return Response.json({ error: 'rate_limited', message: 'Too many tries.' }, { status: 429 });
  const body = (await request.json().catch(() => ({}))) as { token?: string; topics?: string[] };
  let email: string | undefined;
  if (accountsEnabled()) {
    const { checkCsrf } = await import('../../../server/csrf');
    const { getSessionUser } = await import('../../../server/session');
    if (cookies && checkCsrf(request, cookies)) {
      const user = await getSessionUser(cookies);
      if (user) email = user.email;
    }
  }
  const result = updateTopics(getNewsletterStore(), { token: body.token, email, topics: body.topics });
  return Response.json({ ok: result.ok, code: result.code, message: result.message }, { status: result.status });
};
