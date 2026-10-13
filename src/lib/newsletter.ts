/**
 * AMDai Lab Notes digest — email-only signup.
 * Store email, confirm state, topic choices, and timestamps. No tracking pixels.
 */

import { randomBytes } from 'node:crypto';
import { honeypotTripped } from './forum-perms';

export const NEWSLETTER_NAME = 'AMDai Lab Notes digest';
export const NEWSLETTER_CADENCE =
  'About once a week, and only when run cards, guides, ROCm problems, or Stack Lab actually changed. Not a daily drip.';
export const NEWSLETTER_SEND_FLAG = 'NEWSLETTER_SEND';
export const NEWSLETTER_ENABLED_FLAG = 'NEWSLETTER_ENABLED';

export const NEWSLETTER_TOPICS = [
  {
    id: 'runs',
    label: 'New measured run cards',
    href: '/results',
    description: 'Official amdai-bench/run@1 cards as they land on /results.',
  },
  {
    id: 'guides',
    label: 'Guides and tutorials',
    href: '/tutorials',
    description: 'New or updated getting-started notes, tutorials, and blog posts.',
  },
  {
    id: 'problems',
    label: 'ROCm problem updates',
    href: '/rocm-problems',
    description: 'Cited /rocm-problems rows when status or workaround changes.',
  },
  {
    id: 'stack-lab',
    label: 'Stack Lab releases',
    href: '/stack-lab',
    description: 'Radeon Stack Lab companion notes — Ubuntu 24.04+, packages not published yet.',
  },
] as const;

export type NewsletterTopicId = (typeof NEWSLETTER_TOPICS)[number]['id'];
export const NEWSLETTER_TOPIC_IDS = NEWSLETTER_TOPICS.map((topic) => topic.id);

export type NewsletterSubscriber = {
  email: string;
  confirmed: boolean;
  topics: NewsletterTopicId[];
  createdAt: number;
  confirmedAt: number | null;
  updatedAt: number;
  confirmToken: string;
  unsubToken: string;
};

export type NewsletterStore = {
  getByEmail(email: string): NewsletterSubscriber | undefined;
  getByConfirmToken(token: string): NewsletterSubscriber | undefined;
  getByUnsubToken(token: string): NewsletterSubscriber | undefined;
  upsert(sub: NewsletterSubscriber): void;
  listAll(): NewsletterSubscriber[];
  listConfirmed(): NewsletterSubscriber[];
  remove(email: string): void;
};

export type RateCheck = { ok: boolean; retryAfter: number };
export type RateLimiter = (key: string) => RateCheck;

export type NewsletterResult = {
  ok: boolean;
  status: number;
  code: string;
  message: string;
  subscriber?: NewsletterSubscriber;
  mail?: { to: string; subject: string; text: string };
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function newNewsletterToken(): string {
  return randomBytes(32).toString('hex');
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(normalizeEmail(email));
}

export function parseTopics(raw: unknown): NewsletterTopicId[] {
  const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(',') : [];
  const ids = list
    .map((item) => String(item).trim())
    .filter((item): item is NewsletterTopicId => (NEWSLETTER_TOPIC_IDS as readonly string[]).includes(item));
  return [...new Set(ids)];
}

export function createMemoryStore(seed: NewsletterSubscriber[] = []): NewsletterStore {
  const byEmail = new Map<string, NewsletterSubscriber>();
  for (const row of seed) byEmail.set(row.email, { ...row, topics: [...row.topics] });
  const snapshot = () => [...byEmail.values()].map((row) => ({ ...row, topics: [...row.topics] }));
  return {
    getByEmail(email) {
      const hit = byEmail.get(normalizeEmail(email));
      return hit ? { ...hit, topics: [...hit.topics] } : undefined;
    },
    getByConfirmToken(token) {
      return snapshot().find((row) => row.confirmToken === token);
    },
    getByUnsubToken(token) {
      return snapshot().find((row) => row.unsubToken === token);
    },
    upsert(sub) {
      byEmail.set(sub.email, { ...sub, topics: [...sub.topics] });
    },
    listAll() {
      return snapshot();
    },
    listConfirmed() {
      return snapshot().filter((row) => row.confirmed);
    },
    remove(email) {
      byEmail.delete(normalizeEmail(email));
    },
  };
}

export function memoryRateLimiter(limit: number, windowMs: number, now: () => number = Date.now): RateLimiter {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  return (key: string): RateCheck => {
    const t = now();
    const existing = buckets.get(key);
    if (!existing || existing.resetAt <= t) {
      buckets.set(key, { count: 1, resetAt: t + windowMs });
      return { ok: true, retryAfter: 0 };
    }
    if (existing.count >= limit) {
      return { ok: false, retryAfter: Math.ceil((existing.resetAt - t) / 1000) };
    }
    existing.count += 1;
    return { ok: true, retryAfter: 0 };
  };
}

const PENDING_MESSAGE = 'Check your inbox for a confirm link. If nothing arrives, look at the server console on a local build.';

export function subscribe(
  store: NewsletterStore,
  input: {
    email?: string;
    topics?: unknown;
    website?: string | null;
    ip?: string;
  },
  opts: {
    now?: number;
    token?: () => string;
    emailLimit?: RateLimiter;
    ipLimit?: RateLimiter;
    origin?: string;
  } = {},
): NewsletterResult {
  if (honeypotTripped(input.website)) {
    return { ok: true, status: 200, code: 'ignored', message: PENDING_MESSAGE };
  }
  const email = normalizeEmail(input.email ?? '');
  if (!isValidEmail(email)) {
    return { ok: false, status: 400, code: 'invalid_email', message: 'Enter a valid email address.' };
  }
  const ipKey = input.ip || 'local';
  const emailLimit = opts.emailLimit?.(`email:${email}`);
  const ipLimit = opts.ipLimit?.(`ip:${ipKey}`);
  if (emailLimit && !emailLimit.ok) {
    return { ok: false, status: 429, code: 'rate_limited', message: 'Too many tries. Wait a few minutes.' };
  }
  if (ipLimit && !ipLimit.ok) {
    return { ok: false, status: 429, code: 'rate_limited', message: 'Too many tries. Wait a few minutes.' };
  }
  const now = opts.now ?? Date.now();
  const token = opts.token ?? newNewsletterToken;
  const topics = parseTopics(input.topics);
  const chosen = topics.length ? topics : [...NEWSLETTER_TOPIC_IDS];
  const existing = store.getByEmail(email);
  const confirmToken = token();
  const subscriber: NewsletterSubscriber = existing
    ? {
        ...existing,
        topics: chosen,
        updatedAt: now,
        confirmToken: existing.confirmed ? existing.confirmToken : confirmToken,
      }
    : {
        email,
        confirmed: false,
        topics: chosen,
        createdAt: now,
        confirmedAt: null,
        updatedAt: now,
        confirmToken,
        unsubToken: token(),
      };
  store.upsert(subscriber);
  const origin = (opts.origin ?? 'https://amdai.net').replace(/\/$/, '');
  if (subscriber.confirmed) {
    return {
      ok: true,
      status: 200,
      code: 'already',
      message: PENDING_MESSAGE,
      subscriber,
      mail: {
        to: email,
        subject: `${NEWSLETTER_NAME} is already confirmed`,
        text: [
          `You are already on the ${NEWSLETTER_NAME}.`,
          `Topics: ${subscriber.topics.join(', ') || 'none'}.`,
          `Manage topics: ${origin}/newsletter`,
          `Unsubscribe: ${origin}/unsubscribe?token=${encodeURIComponent(subscriber.unsubToken)}`,
          '',
          'This mail has no tracking pixel.',
        ].join('\n'),
      },
    };
  }
  return {
    ok: true,
    status: 200,
    code: 'pending',
    message: PENDING_MESSAGE,
    subscriber,
    mail: {
      to: email,
      subject: `Confirm the ${NEWSLETTER_NAME}`,
      text: [
        `Confirm the ${NEWSLETTER_NAME} for ${email}.`,
        `${NEWSLETTER_CADENCE}`,
        `Confirm: ${origin}/newsletter/confirm?token=${encodeURIComponent(subscriber.confirmToken)}`,
        `If you did not request this, ignore the email.`,
        `Unsubscribe: ${origin}/unsubscribe?token=${encodeURIComponent(subscriber.unsubToken)}`,
        '',
        'This mail has no tracking pixel.',
      ].join('\n'),
    },
  };
}

export function confirm(store: NewsletterStore, token: string | undefined, now = Date.now()): NewsletterResult {
  if (!token) return { ok: false, status: 400, code: 'missing', message: 'That confirm link is missing a token.' };
  const subscriber = store.getByConfirmToken(token);
  if (!subscriber) return { ok: false, status: 400, code: 'invalid', message: 'That confirm link is invalid or already used.' };
  const next = { ...subscriber, confirmed: true, confirmedAt: subscriber.confirmedAt ?? now, updatedAt: now };
  store.upsert(next);
  return { ok: true, status: 200, code: 'confirmed', message: 'You are on the digest. One-click unsubscribe is in every issue.', subscriber: next };
}

export function unsubscribeNewsletter(store: NewsletterStore, token: string | undefined): NewsletterResult {
  if (!token) return { ok: false, status: 400, code: 'missing', message: 'That unsubscribe link is missing a token.' };
  const subscriber = store.getByUnsubToken(token);
  if (!subscriber) return { ok: false, status: 400, code: 'invalid', message: 'That unsubscribe link is invalid.' };
  store.remove(subscriber.email);
  return { ok: true, status: 200, code: 'unsubscribed', message: 'You will not get the Lab Notes digest.', subscriber };
}

export function updateTopics(
  store: NewsletterStore,
  input: { token?: string; email?: string; topics?: unknown },
  now = Date.now(),
): NewsletterResult {
  const subscriber = input.token
    ? store.getByUnsubToken(input.token)
    : input.email
      ? store.getByEmail(input.email)
      : undefined;
  if (!subscriber || !subscriber.confirmed) {
    return { ok: false, status: 400, code: 'invalid', message: 'Confirm the digest before changing topics.' };
  }
  const topics = parseTopics(input.topics);
  const next = { ...subscriber, topics, updatedAt: now };
  store.upsert(next);
  return { ok: true, status: 200, code: 'updated', message: 'Topics saved.', subscriber: next };
}
