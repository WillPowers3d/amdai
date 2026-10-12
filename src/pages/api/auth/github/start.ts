import type { APIRoute } from 'astro';
import { accountsEnabled } from '../../../../lib/flags';
import { disabledJson, prerender } from '../../_guard';

export { prerender };

export const GET: APIRoute = async ({ cookies, redirect }) => {
  if (!accountsEnabled()) return disabledJson();
  if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) return redirect('/login?error=github_unset');
  const { GitHub, generateState } = await import('arctic');
  const { publicOrigin } = await import('../../../../server/config');
  const { sqlRun } = await import('../../../../server/db/client');
  const github = new GitHub(process.env.GITHUB_ID, process.env.GITHUB_SECRET, `${publicOrigin()}/api/auth/github/callback`);
  const state = generateState();
  sqlRun('INSERT INTO oauth_states (id, expires_at) VALUES (?, ?)', [state, Date.now() + 10 * 60 * 1000]);
  cookies.set('lab_oauth', state, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 600 });
  return redirect(github.createAuthorizationURL(state, ['user:email']).toString());
};
