import type { APIRoute } from 'astro';
import { newsletterEnabled } from '../../../lib/flags';
import { confirm } from '../../../lib/newsletter';
import { disabledNewsletter, prerender } from './_guard';

export { prerender };

export const POST: APIRoute = async ({ request }) => {
  if (!newsletterEnabled()) return disabledNewsletter();
  const { clientIp, rateLimit } = await import('../../../server/rate-limit');
  const { getNewsletterStore } = await import('../../../server/newsletter-store');
  const limited = rateLimit(`nl-confirm:${clientIp(request)}`, 20, 10 * 60 * 1000);
  if (!limited.ok) return Response.json({ error: 'rate_limited', message: 'Too many tries.' }, { status: 429 });
  const body = (await request.json().catch(() => ({}))) as { token?: string };
  const result = confirm(getNewsletterStore(), body.token);
  return Response.json({ ok: result.ok, code: result.code, message: result.message }, { status: result.status });
};
