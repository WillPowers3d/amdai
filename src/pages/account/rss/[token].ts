import type { APIRoute } from 'astro';
import { accountsEnabled } from '../../../lib/flags';

export const prerender = !accountsEnabled();

export function getStaticPaths() {
  return [];
}

export const GET: APIRoute = async ({ params }) => {
  if (!accountsEnabled()) return new Response('accounts disabled', { status: 404 });
  const { findRigByRss, toMatch } = await import('../../../server/rigs');
  const { updatesForRig } = await import('../../../lib/rig-match');
  const { stackUpdates } = await import('../../../lib/stack-updates');
  const { publicOrigin } = await import('../../../server/config');
  const row = findRigByRss(params.token ?? '');
  if (!row) return new Response('not found', { status: 404 });
  const items = updatesForRig(toMatch(row), stackUpdates());
  const origin = publicOrigin();
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>Updates for ${escapeXml(row.name)}</title>
    <link>${origin}/account</link>
    <description>Stack updates matched to this saved rig. Independent notes — not affiliated with AMD.</description>
    ${items
      .map(
        (item) => `<item>
      <title>${escapeXml(item.summary.slice(0, 80))}</title>
      <link>${escapeXml(item.source_url)}</link>
      <guid>${escapeXml(item.id)}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <description>${escapeXml(item.summary)}${item.todo ? ' not recorded' : ''}</description>
    </item>`,
      )
      .join('\n')}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } });
};

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
