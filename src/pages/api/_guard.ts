import { accountsEnabled } from '../../lib/flags';

export const prerender = !accountsEnabled();

export function disabledJson(): Response {
  return Response.json({ error: 'accounts_disabled', message: 'Accounts are off on this static build.' }, { status: 404 });
}
