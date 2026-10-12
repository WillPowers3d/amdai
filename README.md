# R9700 Lab Notes

A static documentation site for **local AI on consumer AMD Radeon** — grounded in a real test rig with two **AMD Radeon AI PRO R9700** cards (32 GB, `gfx1201`) and 256 GB DDR5.

It is a **living tracker**, not a frozen manual. Version pins are dated snapshots. The home page “what works this week” card is the current recommendation.

Audience: home-lab and enthusiast users. Not enterprise Instinct marketing.

## What we run

| Role | Model | Quant | Engine | Notes |
| --- | --- | --- | --- | --- |
| Daily driver | Qwen3.6-35B-A3B | Unsloth UD-Q5_K_XL | llama.cpp Vulkan | One R9700, 262K, f16 KV, 0% RAM offload |
| Fast agent | Qwen 3.8 Flash | Unsloth UD-Q6_K_XL | Strata v0.1.42 | ~32.6 tok/s vs llama.cpp ~16 on our rig |

Exact command lines and measured VRAM stay `<!-- TODO: exact command line / measured VRAM from rig owner -->` until they are filled. Do not invent them.

House rules: prefer llama.cpp over vLLM; prefer Q5 over Q4; never below Q4; fast NVMe only; one LLM per GPU unless you deliberately combine.

## Stack

- [Astro](https://astro.build) 7 (static / SSG)
- MDX content collections
- TypeScript
- Tailwind CSS 4
- YAML data files for weekly status

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

`npm run build` runs Pagefind over `dist/` so `/search` works in preview. For `npm run dev` after a build, `npm run index` copies the index to `public/pagefind`.

Public site URL is `https://amdai.net` (`site` in `astro.config.mjs`; override with `SITE_URL`). Build with `ACCOUNTS_ENABLED=0` and `FORUM_ENABLED=0` (static SSG). Those flags are not implemented yet — leaving them on fails the build.

## Information architecture

| URL | Section |
| --- | --- |
| `/` | Home + living status card |
| `/start` | Getting started (GPU → ROCm → llama.cpp → harness) |
| `/stacks` | Recommended stack cards from the test rig |
| `/budget` | Setup by budget — size/speed, local/hybrid, standard/abliterated |
| `/calculator` | Quant + Hardware Calculator (client-side estimates, same size/speed toggle) |
| `/quants` | Q4–Q8, UD dynamic, KV types, why not below Q4 |
| `/gpus` | GPU directory — gfx IDs, VRAM, official ROCm rows |
| `/stack-lab` | Radeon Stack Lab companion (Ubuntu app, Origin repo / local) |
| `/rocm` | ROCm explainer + succinct version notes |
| `/backends` | Backend chooser — llama.cpp default |
| `/software` | llama.cpp first; vLLM / Strata as tries |
| `/abliterated` | Abliterated hub — vet files, catalog table, llama.cpp notes |
| `/harnesses` | Hermes Agent and OpenClaw (`/v1` first) |
| `/hardware` | PSU, cooling, VRAM |
| `/tutorials` | How-tos |
| `/troubleshooting` | Common failures |
| `/troubleshoot/errors` | Paste-a-log matcher, cited patterns |
| `/updates` | Dated notes + RSS + version matrix |
| `/search` | Pagefind (index built by `npm run build`) |
| `/faq` | Short answers |
| `/blog` | Longer posts + version-note index |
| `/maintain` | Weekday scrape checklist |
| `/disclosure` | Amazon Associates, Rakuten, B&H |
| `/go/{retailer}/{product}` | Affiliate / storefront redirect |

`/local-ai` redirects to `/software`.

## Living updates (edit these, not the layouts)

| File | Feeds |
| --- | --- |
| `src/data/what-works.yaml` | Home status card |
| `src/data/qwen-recommendations.yaml` | Getting started / software / serve-Qwen |
| `src/data/stacks.yaml` | `/stacks` cards |
| `src/data/gpus.yaml` | GPU directory |
| `src/data/abliterated.yaml` | Abliterated table |
| `src/data/retailers.yaml` | Storefronts + Amazon tag `amdainet-20` + Rakuten site `amdainet` / SID `4763021` |
| `src/data/products.yaml` | Check-price search URLs (no prices) |
| `src/data/budget-tiers.yaml` | `/budget` tiers; USD bands stay TODO until cited |
| `src/data/errors.yaml` | Cited troubleshooter patterns |
| `src/data/backends.yaml` | Backend chooser rows |
| `src/data/version-matrix.yaml` | ROCm × engine × card (or “no data”) |

Add a short dated note under `src/content/updates/` when a **line** changes (new Core SDK, new vLLM extras). Those render on `/rocm#version-notes` and the blog index.

Weekday procedure: [docs/weekday-scrape.md](docs/weekday-scrape.md) and `/maintain`.

**Radeon Stack Lab** is a separate Ubuntu companion (Origin repo / local app — no public domain documented here). Profiles: `qwen-reliable` (daily driver), `qwen-fast-agent` (Flash). Keep its living catalog aligned with the YAML.

## Authoring MDX

| Folder | Routes |
| --- | --- |
| `src/content/guides/` | `/{id}` (`rocm.mdx` is rendered by `src/pages/rocm.astro`) |
| `src/content/tutorials/` | `/tutorials/{id}` |
| `src/content/blog/` | `/blog/{id}` |
| `src/content/updates/` | Cards on `/rocm` and `/blog` |

MDX can use `<Callout>`, `<QwenPicks />`, `<HouseRules />`, `<GpuDirectory />`, `<BuyButtons />`, and `<AbliteratedTable />` without imports.

Nav lives in `src/lib/site.ts`. Calculator math lives in `src/lib/calculator.ts`. Affiliate wrappers live in `src/lib/affiliates.ts`. Setup: [docs/affiliates.md](docs/affiliates.md).

## Accuracy

Product figures from AMD’s public pages are labeled. Publisher GGUF sizes are Hugging Face listings, not measured VRAM. ROCm 10.0 / 10.1 / vLLM pins are **dated snapshots**. Always re-check the live [ROCm matrix](https://rocm.docs.amd.com/projects/install-on-linux/en/latest/reference/system-requirements.html) and [vLLM GPU install](https://docs.vllm.ai/en/stable/getting_started/installation/gpu/index.html).
