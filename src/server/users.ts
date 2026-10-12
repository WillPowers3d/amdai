import { sqlGet, sqlRun } from './db/client';
import { newId, newToken } from './crypto';

export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  github_id: string | null;
  notify_instant: number;
  notify_weekly: number;
  unsub_token: string;
};

export async function findOrCreateUser(email: string, extras?: { name?: string; githubId?: string }) {
  const existing = sqlGet<UserRow>('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  if (existing) {
    if (extras?.githubId && !existing.github_id) {
      sqlRun('UPDATE users SET github_id = ?, name = COALESCE(?, name) WHERE id = ?', [
        extras.githubId,
        extras.name ?? null,
        existing.id,
      ]);
    }
    return existing;
  }
  const row = {
    id: newId('usr'),
    email: email.toLowerCase(),
    name: extras?.name ?? null,
    github_id: extras?.githubId ?? null,
    created_at: Date.now(),
    notify_instant: 0,
    notify_weekly: 0,
    unsub_token: newToken(),
  };
  sqlRun(
    'INSERT INTO users (id, email, name, github_id, created_at, notify_instant, notify_weekly, unsub_token) VALUES (?, ?, ?, ?, ?, 0, 0, ?)',
    [row.id, row.email, row.name, row.github_id, row.created_at, row.unsub_token],
  );
  return { ...row, notify_instant: 0, notify_weekly: 0 };
}
