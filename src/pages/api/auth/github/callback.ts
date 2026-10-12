import type { APIRoute } from 'astro';
import { accountsEnabled } from '../../../../lib/flags';
import { disabledJson, prerender } from '../../_guard';

export { prerender };

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  if (!accountsEnabled()) return disabledJson();
  const { GitHub } = await import('arctic');
  const { publicOrigin } = await import('../../../../server/config');
  const { sqlGet, sqlRun } = await import('../../../../server/db/client');
  const { findOrCreateUser } = await import('../../../../server/users');
  const { createSession } = await import('../../../../server/session');
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = cookies.get('lab_oauth')?.value;
  if (!code || !state || !cookieState || state !== cookieState) return redirect('/login?error=oauth');
  const row = sqlGet<{ id: string; expires_at: number }>('SELECT id, expires_at FROM oauth_states WHERE id = ?', [state]);
  if (!row || row.expires_at < Date.now()) return redirect('/login?error=oauth');
  sqlRun('DELETE FROM oauth_states WHERE id = ?', [state]);
  const github = new GitHub(process.env.GITHUB_ID!, process.env.GITHUB_SECRET!, `${publicOrigin()}/api/auth/github/callback`);
  const tokens = await github.validateAuthorizationCode(code);
  const access = tokens.accessToken();
  const profile = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${access}`, 'User-Agent': 'amdai-net' },
  }).then((r) => r.json());
  const emails = (await fetch('https://api.github.com/user/emails', {
    headers: { Authorization: `Bearer ${access}`, 'User-Agent': 'amdai-net' },
  }).then((r) => r.json())) as { email: string; primary: boolean; verified: boolean }[];
  const email = emails.find((e) => e.primary && e.verified)?.email || emails.find((e) => e.verified)?.email;
  if (!email) return redirect('/login?error=github_email');
  const user = await findOrCreateUser(email, { name: profile.name || profile.login, githubId: String(profile.id) });
  const { takeNext } = await import('../../../../server/next-path');
  await createSession(user.id, cookies);
  cookies.delete('lab_oauth', { path: '/' });
  return redirect(takeNext(cookies));
};
