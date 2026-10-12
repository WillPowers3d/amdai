import type { APIRoute } from 'astro';
import { accountsEnabled } from '../../lib/flags';
import { disabledJson, prerender } from './_guard';

export { prerender };

export const GET: APIRoute = async ({ cookies }) => {
  if (!accountsEnabled()) return disabledJson();
  const { ensureCsrf } = await import('../../server/csrf');
  const token = ensureCsrf(cookies);
  return Response.json({ csrf: token });
};
