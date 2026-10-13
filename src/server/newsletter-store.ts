import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  createMemoryStore,
  normalizeEmail,
  type NewsletterStore,
  type NewsletterSubscriber,
} from '../lib/newsletter';

export function newsletterFilePath(): string {
  const raw = process.env.NEWSLETTER_STORE || './data/newsletter.json';
  return resolve(raw.replace(/^file:/, ''));
}

function readRows(path: string): NewsletterSubscriber[] {
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8')) as { subscribers?: NewsletterSubscriber[] };
    return Array.isArray(raw.subscribers) ? raw.subscribers : [];
  } catch {
    return [];
  }
}

export function fileNewsletterStore(path = newsletterFilePath()): NewsletterStore {
  const memory = createMemoryStore(readRows(path));
  const persist = () => {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify({ subscribers: memory.listAll() }, null, 2)}\n`);
  };
  return {
    getByEmail: (email) => memory.getByEmail(email),
    getByConfirmToken: (token) => memory.getByConfirmToken(token),
    getByUnsubToken: (token) => memory.getByUnsubToken(token),
    listAll: () => memory.listAll(),
    listConfirmed: () => memory.listConfirmed(),
    remove(email) {
      memory.remove(email);
      persist();
    },
    upsert(sub) {
      memory.upsert(sub);
      persist();
    },
  };
}

let cached: NewsletterStore | null = null;

export function getNewsletterStore(): NewsletterStore {
  if (!cached) cached = fileNewsletterStore();
  return cached;
}

export function resetNewsletterStoreForTests(): void {
  cached = null;
}

export function publicSubscriber(sub: NewsletterSubscriber) {
  return {
    email: normalizeEmail(sub.email),
    confirmed: sub.confirmed,
    topics: sub.topics,
    createdAt: sub.createdAt,
    confirmedAt: sub.confirmedAt,
    updatedAt: sub.updatedAt,
  };
}
