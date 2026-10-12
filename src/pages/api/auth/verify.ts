import type { APIRoute } from 'astro';
import { accountsEnabled } from '../../../lib/flags';
import { disabledJson, prerender } from '../_guard';

export { prerender };

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  if (!accountsEnabled()) return disabledJson();
  const { sqlGet, sqlRun } = await import('../../../server/db/client');
  const { sha256 } = await import('../../../server/crypto');
  const { findOrCreateUser } = await import('../../../server/users');
  const { createSession } = await import('../../../server/session');
  const token = url.searchParams.get('token') ?? '';
  if (!token) return redirect('/login?error=missing');
  const row = sqlGet<{ id: string; email: string; expires_at: number }>(
    'SELECT id, email, expires_at FROM magic_links WHERE token_hash = ?',
    [sha256(token)],
  );
  if (!row || row.expires_at < Date.now()) return redirect('/login?error=expired');
  sqlRun('DELETE FROM magic_links WHERE id = ?', [row.id]);
  const { takeNext } = await import('../../../server/next-path');
  const user = await findOrCreateUser(row.email);
  await createSession(user.id, cookies);
  return redirect(takeNext(cookies));
};
