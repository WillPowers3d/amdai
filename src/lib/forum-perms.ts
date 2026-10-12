export type ForumRole = 'user' | 'mod' | 'admin';

export const NEW_ACCOUNT_QUIET_MS = 10 * 60 * 1000;
export const NEW_ACCOUNT_WINDOW_MS = 24 * 60 * 60 * 1000;
export const NEW_ACCOUNT_MAX_THREADS = 3;
export const NEW_ACCOUNT_MAX_REPLIES = 10;
export const NEW_USER_LINK_DAYS = 7;
export const NEW_USER_MAX_LINKS = 2;
export const TITLE_MAX = 140;
export const BODY_MIN = 8;
export const BODY_MAX = 20_000;

export type ForumActor = {
  id: string;
  email: string;
  role: ForumRole;
  createdAt: number;
};

export function parseAdminEmails(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

export function roleFromEnv(email: string, adminRaw?: string, modRaw?: string): ForumRole {
  const e = email.toLowerCase();
  if (parseAdminEmails(adminRaw).includes(e)) return 'admin';
  if (parseAdminEmails(modRaw).includes(e)) return 'mod';
  return 'user';
}

export function mergeRole(existing: ForumRole, fromEnv: ForumRole): ForumRole {
  const rank = { user: 0, mod: 1, admin: 2 };
  return rank[fromEnv] > rank[existing] ? fromEnv : existing;
}

export function isMod(actor: ForumActor | null | undefined): boolean {
  return actor?.role === 'mod' || actor?.role === 'admin';
}

export function isAdmin(actor: ForumActor | null | undefined): boolean {
  return actor?.role === 'admin';
}

export function canPost(actor: ForumActor | null | undefined, now = Date.now()): { ok: boolean; reason?: string } {
  if (!actor) return { ok: false, reason: 'auth' };
  if (now - actor.createdAt < NEW_ACCOUNT_QUIET_MS) return { ok: false, reason: 'new_account' };
  return { ok: true };
}

export function canReply(actor: ForumActor | null | undefined, thread: { locked: boolean; hidden: boolean }, now = Date.now()) {
  if (thread.hidden && !isMod(actor)) return { ok: false, reason: 'hidden' };
  if (thread.locked && !isMod(actor)) return { ok: false, reason: 'locked' };
  return canPost(actor, now);
}

export function canEdit(
  actor: ForumActor | null | undefined,
  post: { authorId: string; hidden: boolean },
  thread: { locked: boolean },
): boolean {
  if (!actor) return false;
  if (isMod(actor)) return true;
  if (thread.locked) return false;
  return actor.id === post.authorId && !post.hidden;
}

export function canSolve(actor: ForumActor | null | undefined, thread: { authorId: string }): boolean {
  if (!actor) return false;
  return actor.id === thread.authorId || isMod(actor);
}

export function canVote(actor: ForumActor | null | undefined, post: { authorId: string }): boolean {
  if (!actor) return false;
  return actor.id !== post.authorId;
}

export function canModerate(actor: ForumActor | null | undefined): boolean {
  return isMod(actor);
}

export function canViewHidden(actor: ForumActor | null | undefined): boolean {
  return isMod(actor);
}

export function honeypotTripped(website: string | null | undefined): boolean {
  return Boolean(website && website.trim());
}

export function newUserLinkLimited(actor: ForumActor, linkCount: number, now = Date.now()): boolean {
  const ageMs = now - actor.createdAt;
  if (ageMs >= NEW_USER_LINK_DAYS * 24 * 60 * 60 * 1000) return false;
  return linkCount > NEW_USER_MAX_LINKS;
}

export function newAccountQuotaExceeded(
  actor: ForumActor,
  already: { threads: number; replies: number },
  kind: 'thread' | 'reply',
  now = Date.now(),
): boolean {
  if (now - actor.createdAt >= NEW_ACCOUNT_WINDOW_MS) return false;
  if (kind === 'thread') return already.threads >= NEW_ACCOUNT_MAX_THREADS;
  return already.replies >= NEW_ACCOUNT_MAX_REPLIES;
}

export const FORUM_ERROR_COPY: Record<string, string> = {
  csrf: 'That form expired. Reload and try once more.',
  auth: 'Sign in to post.',
  new_account: 'New accounts wait 10 minutes before the first post — a spam throttle, not a judgment.',
  locked: 'This thread is locked.',
  hidden: 'This thread is hidden.',
  link_limit: 'Accounts younger than 7 days may include at most two links.',
  quota: 'New accounts are limited to 3 threads and 10 replies in the first day.',
  body_short: 'Write a bit more — at least a sentence.',
  body_long: 'That post is over the 20,000 character cap.',
  title_short: 'Titles need at least 8 characters.',
  title_long: 'Titles cap at 140 characters.',
  category: 'Pick a real category.',
  rate_limited: 'Slow down. The rate limit will lift within an hour.',
  forbidden: 'You cannot do that on this post.',
  reason: 'Add a short report reason.',
};

export function forumErrorCopy(code: string | null | undefined): string | null {
  if (!code) return null;
  return FORUM_ERROR_COPY[code] ?? null;
}

export function validateComposer(input: { title?: string; body: string; category?: string; categories: string[] }): {
  ok: true;
  title?: string;
  body: string;
  category?: string;
} | { ok: false; reason: string } {
  const body = input.body.trim();
  if (body.length < BODY_MIN) return { ok: false, reason: 'body_short' };
  if (body.length > BODY_MAX) return { ok: false, reason: 'body_long' };
  if (input.category !== undefined) {
    if (!input.categories.includes(input.category)) return { ok: false, reason: 'category' };
  }
  if (input.title !== undefined) {
    const title = input.title.trim();
    if (title.length < 8) return { ok: false, reason: 'title_short' };
    if (title.length > TITLE_MAX) return { ok: false, reason: 'title_long' };
    return { ok: true, title, body, category: input.category };
  }
  return { ok: true, body, category: input.category };
}
