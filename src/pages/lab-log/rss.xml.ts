import type { APIRoute } from 'astro';
import { renderLabLogRss } from '../../lib/lab-log';

export const GET: APIRoute = () =>
  new Response(renderLabLogRss(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
