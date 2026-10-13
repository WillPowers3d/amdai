import type { APIRoute } from 'astro';
import { collectFeedItems, renderRss } from '../lib/feed';
import { runs } from '../lib/run-card-data';

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL('https://amdai.net')).toString().replace(/\/$/, '');
  const xml = renderRss(collectFeedItems(runs), origin);
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
};
