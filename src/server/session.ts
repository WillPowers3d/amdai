import type { APIContext } from 'astro';
import { sqlGet, sqlRun } from './db/client';
import { newId, newToken, sha256 } from './crypto';
import { publicOrigin } from './config';

const COOKIE = 'lab_session';
const WEEK = 7 * 24 * 60 * 60 * 1000;

import type { ForumRole } from '../lib/forum-perms';

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  notifyInstant: boolean;
  notifyWeekly: boolean;
  notifyReplies: boolean;
  unsubToken: string;
  role: ForumRole;
  createdAt: number;
};

type SessionRow = { user_id: string; expires_at: number };
type UserRow = {
  id: string;
  email: string;
  name: string | null;
  notify_instant: number;
  notify_weekly: number;
  notify_replies: number;
  unsub_token: string;
  role: ForumRole;
  created_at: number;
};

export async function createSession(userId: string, cookies: APIContext['cookies']): Promise<void> {
  const token = newToken();
  sqlRun('INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)', [
    newId('ses'),
    userId,
    sha256(token),
    Date.now() + WEEK,
  ]);
  cookies.set(COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: publicOrigin().startsWith('https'),
    maxAge: WEEK / 1000,
  });
}

export async function destroySession(cookies: APIContext['cookies']): Promise<void> {
  const token = cookies.get(COOKIE)?.value;
  if (token) sqlRun('DELETE FROM sessions WHERE token_hash = ?', [sha256(token)]);
  cookies.delete(COOKIE, { path: '/' });
}

export async function getSessionUser(cookies: APIContext['cookies']): Promise<SessionUser | null> {
  const token = cookies.get(COOKIE)?.value;
  if (!token) return null;
  const session = sqlGet<SessionRow>('SELECT user_id, expires_at FROM sessions WHERE token_hash = ?', [sha256(token)]);
  if (!session || session.expires_at < Date.now()) return null;
  const user = sqlGet<UserRow>(
    'SELECT id, email, name, notify_instant, notify_weekly, notify_replies, unsub_token, role, created_at FROM users WHERE id = ?',
    [session.user_id],
  );
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    notifyInstant: Boolean(user.notify_instant),
    notifyWeekly: Boolean(user.notify_weekly),
    notifyReplies: Boolean(user.notify_replies),
    unsubToken: user.unsub_token,
    role: user.role || 'user',
    createdAt: user.created_at,
  };
}
