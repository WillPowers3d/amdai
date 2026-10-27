import type { APIRoute } from 'astro';
import { renderLabLogMarkdown } from '../lib/lab-log';

export const GET: APIRoute = () =>
  new Response(renderLabLogMarkdown(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
