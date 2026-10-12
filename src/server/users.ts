import { mergeRole, roleFromEnv, type ForumRole } from '../lib/forum-perms';
import { adminEmails, modEmails } from './config';
import { sqlGet, sqlRun } from './db/client';
import { newId, newToken } from './crypto';

export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  github_id: string | null;
  created_at: number;
  notify_instant: number;
  notify_weekly: number;
  notify_replies: number;
  unsub_token: string;
  role: ForumRole;
};

function applyEnvRole(email: string, existing?: ForumRole): ForumRole {
  const fromEnv = roleFromEnv(email, adminEmails().join(','), modEmails().join(','));
  return mergeRole(existing ?? 'user', fromEnv);
}

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
    const role = applyEnvRole(existing.email, existing.role ?? 'user');
    if (role !== existing.role) {
      sqlRun('UPDATE users SET role = ? WHERE id = ?', [role, existing.id]);
      existing.role = role;
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
    notify_replies: 0,
    unsub_token: newToken(),
    role: applyEnvRole(email.toLowerCase()),
  };
  sqlRun(
    'INSERT INTO users (id, email, name, github_id, created_at, notify_instant, notify_weekly, unsub_token, role, notify_replies) VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, 0)',
    [row.id, row.email, row.name, row.github_id, row.created_at, row.unsub_token, row.role],
  );
  return row;
}
