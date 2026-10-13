import { forumCategories, slugifyTitle, type ForumCategory } from '../lib/forum-categories';
import type { RigSnapshot } from '../lib/forum-types';
export type { RigSnapshot };
import { countLinks } from '../lib/forum-sanitize';
import {
  canEdit,
  canModerate,
  canPost,
  canReply,
  canSolve,
  canVote,
  canViewHidden,
  honeypotTripped,
  newAccountQuotaExceeded,
  newUserLinkLimited,
  validateComposer,
  type ForumActor,
} from '../lib/forum-perms';
import { publicOrigin } from './config';
import { newId } from './crypto';
import { sqlAll, sqlGet, sqlRun } from './db/client';
import { sendMail } from './mail';
import type { SessionUser } from './session';

export type ThreadRow = {
  id: string;
  slug: string;
  category: string;
  title: string;
  author_id: string;
  rig_snapshot: string | null;
  error_pattern_id: string | null;
  solved: number;
  locked: number;
  pinned: number;
  hidden: number;
  created_at: number;
  updated_at: number;
  last_reply_at: number;
  author_name?: string | null;
  author_email?: string;
  reply_count?: number;
};

export type PostRow = {
  id: string;
  thread_id: string;
  author_id: string;
  body: string;
  is_op: number;
  hidden: number;
  created_at: number;
  updated_at: number;
  author_name?: string | null;
  author_email?: string;
  votes?: number;
};

export type NoticeRow = {
  id: string;
  user_id: string;
  thread_id: string;
  post_id: string;
  kind: string;
  read: number;
  created_at: number;
  title?: string;
  slug?: string;
};

export function asActor(user: SessionUser): ForumActor {
  return { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt };
}

export function displayName(name: string | null | undefined, email?: string): string {
  if (name && name.trim()) return name.trim();
  if (email) return email.split('@')[0] ?? 'member';
  return 'member';
}

export function parseRigSnapshot(json: string | null): RigSnapshot | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as RigSnapshot;
  } catch {
    return null;
  }
}

function uniqueSlug(title: string): string {
  const base = slugifyTitle(title);
  let slug = `${base}-${newId('').slice(0, 6)}`;
  while (sqlGet('SELECT id FROM forum_threads WHERE slug = ?', [slug])) {
    slug = `${base}-${newId('').slice(0, 6)}`;
  }
  return slug;
}

function recentCounts(userId: string, since: number): { threads: number; replies: number } {
  const threads = sqlGet<{ n: number }>('SELECT COUNT(*) as n FROM forum_threads WHERE author_id = ? AND created_at >= ?', [
    userId,
    since,
  ]);
  const replies = sqlGet<{ n: number }>(
    'SELECT COUNT(*) as n FROM forum_posts WHERE author_id = ? AND is_op = 0 AND created_at >= ?',
    [userId, since],
  );
  return { threads: threads?.n ?? 0, replies: replies?.n ?? 0 };
}

export function listCategoryStats(actor: ForumActor | null): Array<ForumCategory & { threads: number; lastAt: number | null }> {
  const hidden = canViewHidden(actor) ? '' : 'WHERE hidden = 0';
  const rows = sqlAll<{ category: string; n: number; last_at: number }>(
    `SELECT category, COUNT(*) as n, MAX(last_reply_at) as last_at FROM forum_threads ${hidden} GROUP BY category`,
  );
  const map = new Map(rows.map((row) => [row.category, row]));
  return forumCategories.map((cat) => {
    const hit = map.get(cat.slug);
    return { ...cat, threads: hit?.n ?? 0, lastAt: hit?.last_at ?? null };
  });
}

export function listThreads(opts: {
  category?: string;
  q?: string;
  errorPatternId?: string;
  actor: ForumActor | null;
  limit?: number;
}): ThreadRow[] {
  const limit = Math.min(80, opts.limit ?? 40);
  const where: string[] = [];
  const params: unknown[] = [];
  if (!canViewHidden(opts.actor)) where.push('t.hidden = 0');
  if (opts.category) {
    where.push('t.category = ?');
    params.push(opts.category);
  }
  if (opts.errorPatternId) {
    where.push('t.error_pattern_id = ?');
    params.push(opts.errorPatternId);
  }
  if (opts.q) {
    where.push('(t.title LIKE ? OR EXISTS (SELECT 1 FROM forum_posts px WHERE px.thread_id = t.id AND px.body LIKE ?))');
    const like = `%${opts.q.replace(/[%_]/g, '')}%`;
    params.push(like, like);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  params.push(limit);
  return sqlAll<ThreadRow>(
    `SELECT t.*, u.name as author_name, u.email as author_email,
            (SELECT COUNT(*) FROM forum_posts fp WHERE fp.thread_id = t.id) as reply_count
     FROM forum_threads t
     JOIN users u ON u.id = t.author_id
     ${clause}
     ORDER BY t.pinned DESC, t.last_reply_at DESC
     LIMIT ?`,
    params,
  );
}

export function getThreadBySlug(slug: string): ThreadRow | undefined {
  return sqlGet<ThreadRow>(
    `SELECT t.*, u.name as author_name, u.email as author_email
     FROM forum_threads t JOIN users u ON u.id = t.author_id WHERE t.slug = ?`,
    [slug],
  );
}

export function getThreadById(id: string): ThreadRow | undefined {
  return sqlGet<ThreadRow>('SELECT * FROM forum_threads WHERE id = ?', [id]);
}

export function listPosts(threadId: string, actor: ForumActor | null): PostRow[] {
  const hidden = canViewHidden(actor) ? '' : 'AND p.hidden = 0';
  return sqlAll<PostRow>(
    `SELECT p.*, u.name as author_name, u.email as author_email,
            (SELECT COUNT(*) FROM forum_votes v WHERE v.post_id = p.id) as votes
     FROM forum_posts p JOIN users u ON u.id = p.author_id
     WHERE p.thread_id = ? ${hidden}
     ORDER BY p.created_at ASC`,
    [threadId],
  );
}

export function getPost(id: string): PostRow | undefined {
  return sqlGet<PostRow>('SELECT * FROM forum_posts WHERE id = ?', [id]);
}

export function createThread(input: {
  actor: ForumActor;
  title: string;
  body: string;
  category: string;
  website?: string;
  rig?: RigSnapshot | null;
  errorPatternId?: string | null;
}): { ok: true; slug: string; ignored?: boolean } | { ok: false; reason: string } {
  if (honeypotTripped(input.website)) return { ok: true, slug: '', ignored: true };
  const gate = canPost(input.actor);
  if (!gate.ok) return { ok: false, reason: gate.reason ?? 'auth' };
  const parsed = validateComposer({
    title: input.title,
    body: input.body,
    category: input.category,
    categories: forumCategories.map((c) => c.slug),
  });
  if (!parsed.ok) return parsed;
  if (newUserLinkLimited(input.actor, countLinks(parsed.body))) return { ok: false, reason: 'link_limit' };
  if (newAccountQuotaExceeded(input.actor, recentCounts(input.actor.id, Date.now() - 24 * 60 * 60 * 1000), 'thread')) {
    return { ok: false, reason: 'quota' };
  }
  const now = Date.now();
  const id = newId('thr');
  const slug = uniqueSlug(parsed.title!);
  sqlRun(
    `INSERT INTO forum_threads (id, slug, category, title, author_id, rig_snapshot, error_pattern_id, solved, locked, pinned, hidden, created_at, updated_at, last_reply_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, ?, ?)`,
    [
      id,
      slug,
      parsed.category,
      parsed.title,
      input.actor.id,
      input.rig ? JSON.stringify(input.rig) : null,
      input.errorPatternId || null,
      now,
      now,
      now,
    ],
  );
  sqlRun(
    `INSERT INTO forum_posts (id, thread_id, author_id, body, is_op, hidden, created_at, updated_at)
     VALUES (?, ?, ?, ?, 1, 0, ?, ?)`,
    [newId('pst'), id, input.actor.id, parsed.body, now, now],
  );
  return { ok: true, slug };
}

export function createReply(input: {
  actor: ForumActor;
  thread: ThreadRow;
  body: string;
  website?: string;
}): { ok: true; slug: string } | { ok: false; reason: string } {
  if (honeypotTripped(input.website)) return { ok: true, slug: input.thread.slug };
  const gate = canReply(input.actor, { locked: Boolean(input.thread.locked), hidden: Boolean(input.thread.hidden) });
  if (!gate.ok) return { ok: false, reason: gate.reason ?? 'auth' };
  const parsed = validateComposer({ body: input.body, categories: [] });
  if (!parsed.ok) return parsed;
  if (newUserLinkLimited(input.actor, countLinks(parsed.body))) return { ok: false, reason: 'link_limit' };
  if (newAccountQuotaExceeded(input.actor, recentCounts(input.actor.id, Date.now() - 24 * 60 * 60 * 1000), 'reply')) {
    return { ok: false, reason: 'quota' };
  }
  const now = Date.now();
  const postId = newId('pst');
  sqlRun(
    `INSERT INTO forum_posts (id, thread_id, author_id, body, is_op, hidden, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, 0, ?, ?)`,
    [postId, input.thread.id, input.actor.id, parsed.body, now, now],
  );
  sqlRun('UPDATE forum_threads SET last_reply_at = ?, updated_at = ? WHERE id = ?', [now, now, input.thread.id]);
  notifyReply(input.thread, postId, input.actor).catch((error) => console.error('[forum] notify', error));
  return { ok: true, slug: input.thread.slug };
}

async function notifyReply(thread: ThreadRow, postId: string, actor: ForumActor): Promise<void> {
  if (thread.author_id === actor.id) return;
  const op = sqlGet<{ id: string; email: string; notify_replies: number }>(
    'SELECT id, email, notify_replies FROM users WHERE id = ?',
    [thread.author_id],
  );
  if (!op || !op.notify_replies) return;
  sqlRun(
    `INSERT INTO forum_notices (id, user_id, thread_id, post_id, kind, read, created_at)
     VALUES (?, ?, ?, ?, 'reply', 0, ?)`,
    [newId('ntc'), op.id, thread.id, postId, Date.now()],
  );
  const url = `${publicOrigin()}/forum/t/${thread.slug}`;
  await sendMail(
    op.email,
    `Reply on: ${thread.title}`,
    `Someone replied to your thread on AMDai.\n\n${url}\n\nTurn reply mail off under Account → alerts.`,
  );
}

export function editPost(input: { actor: ForumActor; post: PostRow; thread: ThreadRow; body: string }): { ok: true } | { ok: false; reason: string } {
  if (!canEdit(input.actor, { authorId: input.post.author_id, hidden: Boolean(input.post.hidden) }, { locked: Boolean(input.thread.locked) })) {
    return { ok: false, reason: 'forbidden' };
  }
  const parsed = validateComposer({ body: input.body, categories: [] });
  if (!parsed.ok) return parsed;
  if (newUserLinkLimited(input.actor, countLinks(parsed.body))) return { ok: false, reason: 'link_limit' };
  sqlRun('UPDATE forum_posts SET body = ?, updated_at = ? WHERE id = ?', [parsed.body, Date.now(), input.post.id]);
  if (canModerate(input.actor) && input.actor.id !== input.post.author_id) {
    writeAudit(input.actor.id, 'edit', 'post', input.post.id, { by: 'mod' });
  }
  return { ok: true };
}

export function setSolved(actor: ForumActor, thread: ThreadRow, solved: boolean): { ok: true } | { ok: false; reason: string } {
  if (!canSolve(actor, { authorId: thread.author_id })) return { ok: false, reason: 'forbidden' };
  sqlRun('UPDATE forum_threads SET solved = ?, updated_at = ? WHERE id = ?', [solved ? 1 : 0, Date.now(), thread.id]);
  return { ok: true };
}

export function toggleVote(actor: ForumActor, post: PostRow): { ok: true; on: boolean } | { ok: false; reason: string } {
  if (!canVote(actor, { authorId: post.author_id })) return { ok: false, reason: 'forbidden' };
  const existing = sqlGet('SELECT user_id FROM forum_votes WHERE user_id = ? AND post_id = ?', [actor.id, post.id]);
  if (existing) {
    sqlRun('DELETE FROM forum_votes WHERE user_id = ? AND post_id = ?', [actor.id, post.id]);
    return { ok: true, on: false };
  }
  sqlRun('INSERT INTO forum_votes (user_id, post_id, created_at) VALUES (?, ?, ?)', [actor.id, post.id, Date.now()]);
  return { ok: true, on: true };
}

export function reportPost(actor: ForumActor, post: PostRow, reason: string): { ok: true } | { ok: false; reason: string } {
  const text = reason.trim().slice(0, 500);
  if (text.length < 4) return { ok: false, reason: 'reason' };
  sqlRun(
    'INSERT INTO forum_reports (id, post_id, reporter_id, reason, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [newId('rpt'), post.id, actor.id, text, 'open', Date.now()],
  );
  return { ok: true };
}

export function writeAudit(actorId: string, action: string, targetType: string, targetId: string, meta?: Record<string, unknown>): void {
  sqlRun(
    'INSERT INTO forum_audit (id, actor_id, action, target_type, target_id, meta_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [newId('aud'), actorId, action, targetType, targetId, meta ? JSON.stringify(meta) : null, Date.now()],
  );
}

export function moderateThread(
  actor: ForumActor,
  thread: ThreadRow,
  action: 'hide' | 'unhide' | 'lock' | 'unlock' | 'pin' | 'unpin' | 'move',
  category?: string,
): { ok: true } | { ok: false; reason: string } {
  if (!canModerate(actor)) return { ok: false, reason: 'forbidden' };
  const now = Date.now();
  if (action === 'move') {
    if (!category || !forumCategories.some((c) => c.slug === category)) return { ok: false, reason: 'category' };
    sqlRun('UPDATE forum_threads SET category = ?, updated_at = ? WHERE id = ?', [category, now, thread.id]);
  } else {
    const column = action === 'hide' || action === 'unhide' ? 'hidden' : action === 'lock' || action === 'unlock' ? 'locked' : 'pinned';
    const value = action === 'hide' || action === 'lock' || action === 'pin' ? 1 : 0;
    sqlRun(`UPDATE forum_threads SET ${column} = ?, updated_at = ? WHERE id = ?`, [value, now, thread.id]);
  }
  writeAudit(actor.id, action, 'thread', thread.id, { category });
  return { ok: true };
}

export function hidePost(actor: ForumActor, post: PostRow, hidden: boolean): { ok: true } | { ok: false; reason: string } {
  if (!canModerate(actor)) return { ok: false, reason: 'forbidden' };
  sqlRun('UPDATE forum_posts SET hidden = ?, updated_at = ? WHERE id = ?', [hidden ? 1 : 0, Date.now(), post.id]);
  writeAudit(actor.id, hidden ? 'hide' : 'unhide', 'post', post.id);
  return { ok: true };
}

export function listReports(): Array<{ id: string; reason: string; status: string; created_at: number; body: string; slug: string; title: string }> {
  return sqlAll(
    `SELECT r.id, r.reason, r.status, r.created_at, p.body, t.slug, t.title
     FROM forum_reports r
     JOIN forum_posts p ON p.id = r.post_id
     JOIN forum_threads t ON t.id = p.thread_id
     WHERE r.status = 'open'
     ORDER BY r.created_at DESC
     LIMIT 50`,
  );
}

export function listAudit(limit = 40) {
  return sqlAll<{ id: string; actor_id: string; action: string; target_type: string; target_id: string; meta_json: string | null; created_at: number }>(
    'SELECT * FROM forum_audit ORDER BY created_at DESC LIMIT ?',
    [limit],
  );
}

export function listNotices(userId: string): NoticeRow[] {
  return sqlAll<NoticeRow>(
    `SELECT n.*, t.title, t.slug FROM forum_notices n
     JOIN forum_threads t ON t.id = n.thread_id
     WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT 40`,
    [userId],
  );
}

export function unreadNoticeCount(userId: string): number {
  return sqlGet<{ n: number }>('SELECT COUNT(*) as n FROM forum_notices WHERE user_id = ? AND read = 0', [userId])?.n ?? 0;
}

export function markNoticesRead(userId: string): void {
  sqlRun('UPDATE forum_notices SET read = 1 WHERE user_id = ?', [userId]);
}

export function closeReport(actor: ForumActor, reportId: string): void {
  if (!canModerate(actor)) return;
  sqlRun("UPDATE forum_reports SET status = 'closed' WHERE id = ?", [reportId]);
  writeAudit(actor.id, 'close_report', 'report', reportId);
}
