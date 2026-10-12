# amdai · R9700 Lab Notes

A static documentation site for **local AI on consumer AMD Radeon** — grounded in a real test rig with two **AMD Radeon AI PRO R9700** cards (32 GB, `gfx1201`) and 256 GB DDR5.

Independent living notes. **Not affiliated with AMD.** The wordmark is `amdai` with a chip we drew; we do not use AMD’s logo as a lockup.

Visual system: [docs/design.md](docs/design.md). Dark-first ember-on-obsidian theme, Geist + Geist Mono (self-hosted in `public/fonts/`), mega-menu, ⌘K search, and per-page OG images.

It is a **living tracker**, not a frozen manual. Version pins are dated snapshots. The home page “what works this week” card is the current recommendation.

Audience: home-lab and enthusiast users. Not enterprise Instinct marketing.

## What we run

| Role | Model | Quant | Engine | Notes |
| --- | --- | --- | --- | --- |
| Daily driver | Qwen3.6-35B-A3B | Unsloth UD-Q5_K_XL | llama.cpp Vulkan | One R9700, 262K, f16 KV, 0% RAM offload. Measured on our rig, 2026-10: 100.8 tok/s short / ~88 at 32K / ~50 at 256K |
| Fast agent | Qwen 3.8 Flash | Unsloth UD-Q6_K_XL | Strata v0.1.42 | ~32.6 tok/s vs llama.cpp ~16 — Measured on our rig, 2026-10 |

Exact command lines and UD-Q5_K_XL VRAM stay `<!-- TODO: exact command line / measured VRAM from rig owner -->` until they are filled. Do not invent them. Sibling 35B points: Q5_K_M 108.3 tok/s (28.5 GB VRAM); Q4_K_M 116.5 tok/s decode, 1814 tok/s prefill at 32K.

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

Public site URL is `https://amdai.net` (`site` in `astro.config.mjs`; override with `SITE_URL`). Default build is `ACCOUNTS_ENABLED=0` `FORUM_ENABLED=0` (static SSG, no database). Set `ACCOUNTS_ENABLED=1` for optional login, saved rigs, and `npm run notify`. `FORUM_ENABLED=1` also requires accounts (same SQLite) and turns on `/forum`. Admins are the comma-separated list in `ADMIN_EMAILS`. Optional `MOD_EMAILS` promotes moderators.

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
| `/rocm` | What is ROCm — multi-page consumer deep dive |
| `/rocm/stack` | Layer-by-layer stack + mermaid diagram |
| `/rocm/gfx` | GPU architectures, gfx IDs, HSA_OVERRIDE |
| `/rocm/vulkan-hip` | ROCm vs Vulkan vs HIP for local LLMs |
| `/rocm/versions` | Cadence, official vs works, 10.1, ROCm CLI |
| `/rocm/history` | Cited timeline |
| `/rocm/glossary` | Terms |
| `/rocm/faq` | Misconceptions + FAQ |
| `/rocm-problems` | Cited consumer ROCm problems + how you can help |
| `/rocm-problems/{id}` | One problem, workaround, upstream, Discuss in forum |
| `/rocm-problems/help` | Bug reports, nightlies, benches, AMD / GitHub |
| `/rocm-problems/report` | Report template + collect-rocm-report.sh |
| `/rocm-problems/works` | Works on my rig (saved-rig form) |
| `/rocm-problems/contribute` | Contributor guidelines for this site |
| `/backends` | Inference engines compared — table + flowchart, llama.cpp default |
| `/backends/{id}` | Deep dive: architecture, ROCm, quants, install, sources |
| `/software` | llama.cpp first; vLLM / Strata as tries |
| `/abliterated` | Abliterated hub — vet files, catalog table, method/variant cards, llama.cpp notes |
| `/forum` | Community forum (off unless `FORUM_ENABLED=1` with accounts) |
| `/forum/rules` | Code of conduct (always static) |
| `/forum/c/{slug}` | Category listing |
| `/forum/t/{slug}` | Thread (SSR when the forum is on; no JS to read) |
| `/forum/new` | New thread, optional saved-rig badge |
| `/forum/search` | Title/body search |
| `/forum/mod` | Reports + audit log (mods/admins) |
| `/account` | Optional saved rigs (off unless `ACCOUNTS_ENABLED=1`) |
| `/privacy` | What optional accounts store |
| `/harnesses` | Harnesses & frontends — what to plug your local model into |
| `/harnesses/agents` | Agent harnesses (Hermes used on our rig, OpenHands, Aider, …) |
| `/harnesses/chat` | Chat UIs (Open WebUI, LM Studio, llama.cpp web UI, …) |
| `/harnesses/image` | ComfyUI on ROCm |
| `/harnesses/compare` | Comparison table |
| `/harnesses/quiz` | Pick a harness (GET, no JS required) |
| `/harnesses/connect` | Copy-paste :8080 / :8083 snippets |
| `/harnesses/{id}` | One harness: endpoint, tools, ROCm notes, hybrid |
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
| `src/data/abliterated.yaml` | Abliterated table + method/variant cards |
| `src/data/stack-updates.yaml` | Cited stack updates matched to saved rigs |
| `src/data/retailers.yaml` | Storefronts + Amazon tag `amdainet-20` + Rakuten site `amdainet` / SID `4763021` |
| `src/data/products.yaml` | Check-price search URLs (no prices) |
| `src/data/budget-tiers.yaml` | `/budget` tiers; USD bands stay TODO until cited |
| `src/data/errors.yaml` | Cited troubleshooter patterns |
| `src/data/rocm-problems.yaml` | Cited `/rocm-problems` tracker (TODO if unverified) |
| `src/data/harnesses.yaml` | Cited `/harnesses` catalog (no invented features) |
| `src/data/backends.yaml` | `/backends` comparison + per-engine deep dives |
| `src/data/version-matrix.yaml` | ROCm × engine × card (or “no data”) |

Add a short dated note under `src/content/updates/` when a **line** changes (new Core SDK, new vLLM extras). Those render on `/rocm/versions` and the blog index.

Weekday procedure: [docs/weekday-scrape.md](docs/weekday-scrape.md) and `/maintain`.

**Radeon Stack Lab** is a separate Ubuntu companion (Origin repo / local app — no public domain documented here). Profiles: `qwen-reliable` (daily driver), `qwen-fast-agent` (Flash). Keep its living catalog aligned with the YAML.

## Authoring MDX

| Folder | Routes |
| --- | --- |
| `src/content/guides/` | `/{id}` (`rocm.mdx`, `abliterated.mdx`, and `harnesses.mdx` are excluded) |
| `src/content/tutorials/` | `/tutorials/{id}` |
| `src/content/blog/` | `/blog/{id}` |
| `src/content/updates/` | Cards on `/rocm/versions` and `/blog` |

MDX can use `<Callout>`, `<QwenPicks />`, `<HouseRules />`, `<GpuDirectory />`, `<BuyButtons />`, and `<AbliteratedTable />` without imports.

Nav lives in `src/lib/site.ts`. Calculator math lives in `src/lib/calculator.ts`. Affiliate wrappers live in `src/lib/affiliates.ts`. Setup: [docs/affiliates.md](docs/affiliates.md).

## Accuracy

Product figures from AMD’s public pages are labeled. Publisher GGUF sizes are Hugging Face listings, not measured VRAM. ROCm 10.0 / 10.1 / vLLM pins are **dated snapshots**. Always re-check the live [ROCm matrix](https://rocm.docs.amd.com/projects/install-on-linux/en/latest/reference/system-requirements.html) and [vLLM GPU install](https://docs.vllm.ai/en/stable/getting_started/installation/gpu/index.html).
