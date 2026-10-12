import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { authSecret } from './config';

export function newId(prefix = ''): string {
  const body = randomBytes(16).toString('hex');
  return prefix ? `${prefix}_${body}` : body;
}

export function newToken(): string {
  return randomBytes(32).toString('hex');
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function hmac(value: string): string {
  return createHmac('sha256', authSecret()).update(value).digest('hex');
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
