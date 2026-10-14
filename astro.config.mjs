// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import { htmlSeparators } from './src/lib/html-separators.ts';
import { canonicalUrl, isSitemapExcluded, lastmodFor, urlPath } from './src/lib/seo.ts';
import { sitemapFromDist } from './src/lib/sitemap-from-dist.ts';
import { canRunRedirects } from './src/lib/can-run.ts';
import { gpuCompareRedirects } from './src/lib/gpu-compare.ts';
import { modelCompareRedirects } from './src/lib/model-compare.ts';

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
    sitemapFromDist(),
  ],
  redirects: {
    '/local-ai': '/software',
    '/two-r9700': '/qwen36-dual',
    '/gpus/rx9070xt': '/gpus/rx-9070-xt',
    '/gpus/rx9070-xt': '/gpus/rx-9070-xt',
    '/gpus/rx9060xt': '/gpus/rx-9060-xt',
    '/gpus/rx9060-xt': '/gpus/rx-9060-xt',
    '/gpus/rx7900gre': '/gpus/rx-7900-gre',
    '/gpus/rx7900-gre': '/gpus/rx-7900-gre',
    '/gpus/rx7700xt': '/gpus/rx-7700-xt',
    '/gpus/rx7700-xt': '/gpus/rx-7700-xt',
    '/gpus/rx7600xt': '/gpus/rx-7600-xt',
    '/gpus/rx7600-xt': '/gpus/rx-7600-xt',
    '/gpus/rx7600': '/gpus/rx-7600',
    '/gpus/rx7600-8gb': '/gpus/rx-7600',
    '/gpus/rx7900xtx': '/gpus/rx-7900-xtx',
    '/gpus/rx7900-xtx': '/gpus/rx-7900-xtx',
    '/gpus/rx-7900xtx': '/gpus/rx-7900-xtx',
    '/gpus/rx7900xt': '/gpus/rx-7900-xt',
    '/gpus/rx7900-xt': '/gpus/rx-7900-xt',
    '/gpus/rx-7900xt': '/gpus/rx-7900-xt',
    '/gpus/rx7800xt': '/gpus/rx-7800-xt',
    '/gpus/rx7800-xt': '/gpus/rx-7800-xt',
    '/gpus/rx-7800xt': '/gpus/rx-7800-xt',
    '/gpus/rx6800xt': '/gpus/rx-6800-xt',
    '/gpus/rx6800-xt': '/gpus/rx-6800-xt',
    '/gpus/rx-6800xt': '/gpus/rx-6800-xt',
    '/gpus/rx6700xt': '/gpus/rx-6700-xt',
    '/gpus/rx6700-xt': '/gpus/rx-6700-xt',
    '/gpus/rx-6700xt': '/gpus/rx-6700-xt',
    '/gpus/w-7900': '/gpus/w7900',
    '/gpus/radeon-pro-w7900': '/gpus/w7900',
    '/gpus/pro-w7900': '/gpus/w7900',
    '/gpus/w-7800': '/gpus/w7800',
    '/gpus/radeon-pro-w7800': '/gpus/w7800',
    '/gpus/pro-w7800': '/gpus/w7800',
    '/gpus/w-7700': '/gpus/w7700',
    '/gpus/radeon-pro-w7700': '/gpus/w7700',
    '/gpus/pro-w7700': '/gpus/w7700',
    '/gpus/w-6800': '/gpus/w6800',
    '/gpus/radeon-pro-w6800': '/gpus/w6800',
    '/gpus/pro-w6800': '/gpus/w6800',
    '/embeddings': '/rag',
    ...gpuCompareRedirects(),
    ...modelCompareRedirects(),
    ...canRunRedirects(),
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
