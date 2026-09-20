# R9700 Lab Notes

A static documentation and tutorial site for running **local AI** on the **AMD Radeon AI PRO R9700** (the card people often call an “AMD R9700 Pro”) and other home-lab AMD GPUs with **ROCm**.

Audience: hobbyists and home-lab users. Not enterprise Instinct marketing.

## Stack

- [Astro](https://astro.build) 7 (static / SSG)
- MDX content collections
- TypeScript
- Tailwind CSS 4
- Shiki syntax highlighting

## Run locally

Requires **Node.js 22.12+**.

```bash
npm install
npm run dev
```

Dev server: [http://127.0.0.1:43147](http://127.0.0.1:43147)

```bash
npm run build
npm run preview
```

`npm run build` writes a static site to `dist/`. No secrets, accounts, or paid hosting are required.

When you publish, set `site` in `astro.config.mjs` to your public URL so sitemap and canonical links are correct.

## Information architecture

| URL | Content |
| --- | --- |
| `/` | Pitch, featured tutorials, official links |
| `/gpus` | Naming, PRO vs RX vs Instinct, home-practical GPUs |
| `/rocm` | What ROCm is, Linux-first install overview |
| `/local-ai` | llama.cpp, Ollama, vLLM, VRAM and power |
| `/tutorials` | Starter walkthroughs |
| `/blog` | Short notes and deep dives |

FAQ, a hardware guide, and troubleshooting are reserved in the footer as **coming later** — they are not empty routes.

## Authoring MDX

Collections live under `src/content/`:

| Folder | Collection | Routes |
| --- | --- | --- |
| `src/content/guides/` | `guides` | `/{id}` — use ids `gpus`, `rocm`, `local-ai` |
| `src/content/tutorials/` | `tutorials` | `/tutorials/{id}` |
| `src/content/blog/` | `blog` | `/blog/{id}` |

Schemas are in `src/content.config.ts`. Frontmatter examples:

```mdx
---
title: Install ROCm on a home Linux box
description: A conservative path…
minutes: 35
difficulty: starter
updated: 2026-09-20
featured: true
order: 1
---
```

```mdx
---
title: The name is Radeon AI PRO R9700
description: Why forums say “R9700 Pro”…
pubDate: 2026-09-12
tags: [naming, hardware]
---
```

In MDX you can use the shared `Callout` component (no import required):

```mdx
<Callout type="linux">Linux is the realistic ROCm path.</Callout>
```

`type` may be `note`, `warn`, `linux`, or `check`.

Site-wide names and official URLs live in `src/lib/site.ts`. Nav items are defined there so a new top-level section is one object plus a page or guide.

## Design

Dark theme by default (AMD-inspired red / near-black / warm gray). A header toggle switches to light and stores the choice in `localStorage`. No AMD logos or trademarks are used as artwork.

## Accuracy

Product figures cited from AMD’s public R9700 page are labeled as vendor-published. This repo does **not** invent benchmarks or prices. Always re-check the live [ROCm support matrix](https://rocm.docs.amd.com/projects/install-on-linux/en/latest/reference/system-requirements.html) before you install.
