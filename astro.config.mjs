// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Public URL for sitemap and canonicals. Override with SITE_URL if needed.
// Accounts / forum stay off (static SSG) until those features ship.
const accountsOn = process.env.ACCOUNTS_ENABLED === '1' || process.env.ACCOUNTS_ENABLED === 'true';
const forumOn = process.env.FORUM_ENABLED === '1' || process.env.FORUM_ENABLED === 'true';
if (accountsOn || forumOn) {
  throw new Error('ACCOUNTS_ENABLED / FORUM_ENABLED are not implemented yet. Build with both off for the static site.');
}

export default defineConfig({
  site: process.env.SITE_URL || 'https://amdai.net',
  prefetch: true,
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
