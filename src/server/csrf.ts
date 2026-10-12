import type { APIContext } from 'astro';
import { publicOrigin } from './config';
import { newToken, safeEqual } from './crypto';

const COOKIE = 'lab_csrf';

export function ensureCsrf(cookies: APIContext['cookies']): string {
  const existing = cookies.get(COOKIE)?.value;
  if (existing) return existing;
  const token = newToken();
  cookies.set(COOKIE, token, { path: '/', sameSite: 'lax', httpOnly: false, secure: publicOrigin().startsWith('https') });
  return token;
}

export function checkCsrf(request: Request, cookies: APIContext['cookies']): boolean {
  const origin = request.headers.get('origin');
  const expectedOrigin = publicOrigin();
  if (origin && origin !== expectedOrigin) return false;
  const cookie = cookies.get(COOKIE)?.value;
  const header = request.headers.get('x-csrf-token');
  if (!cookie || !header) return false;
  return safeEqual(cookie, header);
}
