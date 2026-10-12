import type { APIRoute } from 'astro';
import { accountsEnabled } from '../../../lib/flags';
import { disabledJson, prerender } from '../_guard';

export { prerender };

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!accountsEnabled()) return disabledJson();
  const { checkCsrf, ensureCsrf } = await import('../../../server/csrf');
  const { clientIp, rateLimit } = await import('../../../server/rate-limit');
  const { sqlRun } = await import('../../../server/db/client');
  const { newId, newToken, sha256 } = await import('../../../server/crypto');
  const { sendMail, magicLinkUrl } = await import('../../../server/mail');
  ensureCsrf(cookies);
  if (!checkCsrf(request, cookies)) return Response.json({ error: 'csrf' }, { status: 403 });
  const ip = clientIp(request);
  const limited = rateLimit(`magic:${ip}`, 8, 10 * 60 * 1000);
  if (!limited.ok) return Response.json({ error: 'rate_limited', retryAfter: limited.retryAfter }, { status: 429 });
  const { stashNext } = await import('../../../server/next-path');
  const body = (await request.json().catch(() => ({}))) as { email?: string; next?: string };
  stashNext(cookies, body.next);
  const email = (body.email ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: 'invalid_email' }, { status: 400 });
  const emailLimit = rateLimit(`magic-email:${email}`, 4, 60 * 60 * 1000);
  if (!emailLimit.ok) return Response.json({ error: 'rate_limited' }, { status: 429 });
  const token = newToken();
  sqlRun('DELETE FROM magic_links WHERE email = ?', [email]);
  sqlRun('INSERT INTO magic_links (id, email, token_hash, expires_at) VALUES (?, ?, ?, ?)', [
    newId('ml'),
    email,
    sha256(token),
    Date.now() + 15 * 60 * 1000,
  ]);
  await sendMail(email, 'Sign in to R9700 Lab Notes', `Use this one-time link (15 minutes):\n\n${magicLinkUrl(token)}\n`);
  return Response.json({ ok: true, dev: !process.env.SMTP_HOST });
};
