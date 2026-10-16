import type { APIRoute } from 'astro';
import { loadNewModelsFile, renderNewModelsRss } from '../../lib/new-models';

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL('https://amdai.net')).toString().replace(/\/$/, '');
  const xml = renderNewModelsRss(loadNewModelsFile(), origin);
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
};
