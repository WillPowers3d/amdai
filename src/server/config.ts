import { accountsEnabled } from '../lib/flags';

export function requireAccounts(): void {
  if (!accountsEnabled()) {
    throw new Error('Accounts are disabled. Set ACCOUNTS_ENABLED=1.');
  }
}

export function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('AUTH_SECRET must be set to at least 16 characters when accounts are on.');
  }
  return secret;
}

export function publicOrigin(): string {
  return (process.env.AUTH_URL || process.env.SITE_URL || 'http://127.0.0.1:43147').replace(/\/$/, '');
}

export function databasePath(): string {
  const raw = process.env.DATABASE_URL || 'file:./data/accounts.sqlite';
  return raw.replace(/^file:/, '');
}

export function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST);
}
