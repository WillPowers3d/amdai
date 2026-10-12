// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

const accountsOn = process.env.ACCOUNTS_ENABLED === '1' || process.env.ACCOUNTS_ENABLED === 'true';
const forumOn = process.env.FORUM_ENABLED === '1' || process.env.FORUM_ENABLED === 'true';
if (forumOn && !accountsOn) {
  throw new Error('FORUM_ENABLED requires ACCOUNTS_ENABLED=1 (same SQLite, same session).');
}

export default defineConfig({
  site: process.env.SITE_URL || 'https://amdai.net',
  prefetch: true,
  adapter: accountsOn ? node({ mode: 'standalone' }) : undefined,
  server: {
    host: '127.0.0.1',
    port: 43147,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [mdx(), sitemap()],
  redirects: {
    '/local-ai': '/software',
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'houston',
      },
      defaultColor: false,
      wrap: true,
    },
  },
});
