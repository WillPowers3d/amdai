// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import { htmlSeparators } from './src/lib/html-separators.ts';
import { canonicalUrl, isSitemapExcluded, lastmodFor, urlPath } from './src/lib/seo.ts';

const accountsOn = process.env.ACCOUNTS_ENABLED === '1' || process.env.ACCOUNTS_ENABLED === 'true';
const newsletterOn = process.env.NEWSLETTER_ENABLED === '1' || process.env.NEWSLETTER_ENABLED === 'true';
const forumOn = process.env.FORUM_ENABLED === '1' || process.env.FORUM_ENABLED === 'true';
if (forumOn && !accountsOn) {
  throw new Error('FORUM_ENABLED requires ACCOUNTS_ENABLED=1 (same SQLite, same session).');
}

export default defineConfig({
  site: process.env.SITE_URL || 'https://amdai.net',
  compressHTML: false,
  prefetch: true,
  adapter: accountsOn || newsletterOn ? node({ mode: 'standalone' }) : undefined,
  server: {
    host: '127.0.0.1',
    port: 43147,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    mdx(),
    sitemap({
      customPages: [`${(process.env.SITE_URL || 'https://amdai.net').replace(/\/$/, '')}/rss.xml`],
      filter: (page) => !isSitemapExcluded(new URL(page).pathname),
      serialize(item) {
        const path = urlPath(new URL(item.url).pathname);
        const lastmod = lastmodFor(path);
        return {
          ...item,
          url: canonicalUrl(path),
          lastmod,
        };
      },
    }),
    htmlSeparators(),
  ],
  redirects: {
    '/local-ai': '/software',
    '/two-r9700': '/qwen36-dual',
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
