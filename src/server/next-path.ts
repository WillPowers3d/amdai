import type { APIContext } from 'astro';
import { safeNextPath } from '../lib/forum-categories';

const COOKIE = 'lab_next';

export function stashNext(cookies: APIContext['cookies'], next: string | null | undefined): void {
  const safe = safeNextPath(next);
  if (!safe) return;
  cookies.set(COOKIE, safe, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 900 });
}

export function takeNext(cookies: APIContext['cookies']): string {
  const next = safeNextPath(cookies.get(COOKIE)?.value);
  cookies.delete(COOKIE, { path: '/' });
  return next || '/account';
}
