import type { APIRoute } from 'astro';
import { accountsEnabled } from '../../lib/flags';
import { disabledJson, prerender } from './_guard';

export { prerender };

export const GET: APIRoute = async ({ cookies }) => {
  if (!accountsEnabled()) return disabledJson();
  const { getSessionUser } = await import('../../server/session');
  const { listRigs, toMatch, toPublic } = await import('../../server/rigs');
  const { updatesForRig } = await import('../../lib/rig-match');
  const { stackUpdates } = await import('../../lib/stack-updates');
  const user = await getSessionUser(cookies);
  if (!user) return Response.json({ user: null }, { status: 401 });
  const { getNewsletterStore } = await import('../../server/newsletter-store');
  const newsletter = getNewsletterStore().getByEmail(user.email);
  const rows = await listRigs(user.id);
  const catalog = stackUpdates();
  return Response.json({
    user: {
      email: user.email,
      name: user.name,
      notifyInstant: user.notifyInstant,
      notifyWeekly: user.notifyWeekly,
      notifyReplies: user.notifyReplies,
      role: user.role,
      newsletterTopics: newsletter?.confirmed ? newsletter.topics : [],
      newsletterConfirmed: Boolean(newsletter?.confirmed),
    },
    rigs: rows.map((row) => ({
      ...toPublic(row),
      updates: updatesForRig(toMatch(row), catalog),
    })),
  });
};
