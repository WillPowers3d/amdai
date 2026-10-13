import type { APIRoute } from 'astro';
import { newsletterEnabled } from '../../../lib/flags';
import { subscribe } from '../../../lib/newsletter';
import { disabledNewsletter, prerender } from './_guard';

export { prerender };

export const POST: APIRoute = async ({ request }) => {
  if (!newsletterEnabled()) return disabledNewsletter();
  const { clientIp, rateLimit } = await import('../../../server/rate-limit');
  const { getNewsletterStore } = await import('../../../server/newsletter-store');
  const { sendMail, unsubscribeUrl } = await import('../../../server/mail');
  const { publicOrigin } = await import('../../../server/config');
  const ip = clientIp(request);
  const ipLimit = rateLimit(`nl-sub-ip:${ip}`, 5, 10 * 60 * 1000);
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    topics?: string[];
    website?: string;
  };
  const emailLimit = rateLimit(`nl-sub-email:${(body.email ?? '').toLowerCase()}`, 3, 60 * 60 * 1000);
  const result = subscribe(
    getNewsletterStore(),
    { email: body.email, topics: body.topics, website: body.website, ip },
    {
      origin: publicOrigin(),
      emailLimit: () => emailLimit,
      ipLimit: () => ipLimit,
    },
  );
  if (result.mail) {
    const token = result.subscriber?.unsubToken;
    await sendMail(result.mail.to, result.mail.subject, result.mail.text, {
      unsubUrl: token ? unsubscribeUrl(token) : undefined,
    });
  }
  return Response.json(
    { ok: result.ok, code: result.code, message: result.message },
    { status: result.status },
  );
};
