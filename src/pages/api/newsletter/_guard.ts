import { newsletterEnabled } from '../../../lib/flags';

export const prerender = !newsletterEnabled();

export function disabledNewsletter(): Response {
  return Response.json(
    { error: 'newsletter_disabled', message: 'The digest mailer is off on this static build.' },
    { status: 404 },
  );
}
