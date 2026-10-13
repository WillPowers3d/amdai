import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { site } from '../../lib/site';

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL('https://amdai.net');
  const updates = (await getCollection('updates')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const items = updates
    .map((note) => {
      const link = new URL('/updates', origin).toString();
      const date = note.data.date.toUTCString();
      return `<item>
      <title>${escapeXml(note.data.title)}</title>
      <link>${link}#${escapeXml(note.id)}</link>
      <guid isPermaLink="false">${escapeXml(note.id)}</guid>
      <pubDate>${date}</pubDate>
      <description>${escapeXml(note.data.summary)}</description>
    </item>`;
    })
    .join('\n    ');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(`${site.wordmark} · ${site.name} — updates`)}</title>
    <link>${new URL('/updates', origin).toString()}</link>
    <description>Dated ROCm / llama.cpp / vLLM snapshots from the living tracker.</description>
    ${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
};
