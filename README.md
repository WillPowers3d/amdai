# AMDai · R9700 Lab Notes

A static documentation site for **local AI on consumer AMD Radeon** — grounded in a real test rig with two **AMD Radeon AI PRO R9700** cards (32 GB, `gfx1201`) and 256 GB DDR5.

Independent living notes. **Not affiliated with AMD.** The wordmark is `AMDai` with a chip we drew; we do not use AMD’s logo as a lockup.

Visual system: [docs/design.md](docs/design.md). Dark-first ember-on-obsidian theme, Geist + Geist Mono (self-hosted in `public/fonts/`), mega-menu, ⌘K search, and per-page OG images ([docs/og-images.md](docs/og-images.md) — `npm run og` rebuilds the 1200×630 catalog).

It is a **living tracker**, not a frozen manual. Version pins are dated snapshots. The home page “what works this week” card is the current recommendation.

Audience: home-lab and enthusiast users. Not enterprise Instinct marketing.

## What we run

| Role | Model | Quant | Engine | Notes |
| --- | --- | --- | --- | --- |
| Daily driver | Qwen3.6-35B-A3B | Unsloth UD-Q5_K_XL | llama.cpp Vulkan | One R9700, 262K, f16 KV, 0% RAM offload. Measured on our rig, 2026-10: 102.39 tok/s short / 90.52 at 32K / 66.43 at 128K / 44.4 at 256K |
| Fast agent | Qwen 3.8 Flash | Unsloth UD-Q6_K_XL | Strata v0.1.42 | Two-card 262K: 32.8 tok/s at 8K/32K, 31.8 at 100K. Prior first-party ~32.6 vs llama.cpp ~16 — Measured on our rig, 2026-10 |

Official llama-bench cards (c060ca974 Vulkan, f16 KV, overnight sweep 2026-10-12) live in `data/runs/`. Credited to amdai / local-desktop. UD-Q5_K_XL peak VRAM is 25.97 GB at 4K / 29.34 GB at 256K. Sibling 35B points: Q5_K_M 109.73 tok/s (24.68 GB VRAM); Q4_K_M 117.69 tok/s decode, 1902.1 tok/s prefill at 32K. Q6_K 1-GPU 4K keeps both repeats (82.62 and 103.23). The whole sweep is measured, pending re-verify after the DDR5-5200 RAM fix. Flash / Strata / Q3 are pending a DDR5 rerun.

House rules: prefer llama.cpp over vLLM; prefer Q5 over Q4; Q3 is listed as estimate/community unless measured; Q1/Q2 stay off; fast NVMe only; one LLM per GPU unless you deliberately combine.

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

`npm run build` runs Pagefind over `dist/`, then the site QA gate (`npm run qa:links` / `tsx src/scripts/check-site.ts`), the SEO gate (`npm run qa:seo` / `tsx src/scripts/check-seo.ts`), the accessibility gate (`npm run qa:a11y` / `tsx src/scripts/check-a11y.ts`), then the performance gate (`npm run qa:perf` / `tsx src/scripts/check-perf.ts`). The link gate checks every internal link, `#` anchor, image, OG image, and asset in the built HTML, sitemap and redirect targets included, plus an orphan and link-depth check: every sitemap page must be linked from another page and reachable within three clicks of the homepage. Content lint fails the build on sentence glue, leftover TODO/TBD/FIXME/changeme/lorem, broken tokens, empty table cells, banned model names, Q4-floor phrases, Q1/Q2 quants, and `og:site_name` that is not exactly `amdai` (display wordmark stays `AMDai`). The SEO gate fails on missing or duplicate titles and descriptions, missing canonicals, missing OG images or `og:image:alt`, relative or 404 `og:image` / `twitter:image` URLs, a `twitter:card` other than `summary_large_image`, invalid JSON-LD (including price/rating fields), or a noindex URL in `sitemap.xml`. The a11y gate runs axe-core on every built page in dark and light themes and fails on serious or critical issues. The perf gate fails the build when a page exceeds the mobile CWV budget (content performance ≥ 90, LCP ≤ 2.5 s, CLS ≤ 0.1; calculator / Qwen table / search have a documented tool floor) or the per-page JS/CSS/image/font-preload byte budget. All four gates write dated reports under `artifacts/link-reports/`, `reports/`, and `/opt/cursor/artifacts/link-reports/`. Mobile screenshot helpers: `npm run qa:a11y:shots -- before` or `after`. For `npm run dev` after a build, `npm run index` copies the index to `public/pagefind`. Chromium is required for `qa:a11y` and `qa:perf` (`npx playwright install chromium`). Caddy cache headers for hashed `/_astro/` assets: [docs/deploy.md](docs/deploy.md). Baseline: [docs/perf-baseline.md](docs/perf-baseline.md).

Outbound citations are a separate, network-using pass: `npm run check:links:external` (alias `npm run qa:links:external`). It is not part of the default build. It writes a dated report next to the internal one and does not remove citations. Flaky externals do not fail `npm run build`.

Public site URL is `https://amdai.net` (`site` in `astro.config.mjs`; override with `SITE_URL`). Default build is `ACCOUNTS_ENABLED=0` `FORUM_ENABLED=0` `NEWSLETTER_ENABLED=0` (static SSG, no database). Set `ACCOUNTS_ENABLED=1` for optional login, saved rigs, and `npm run notify`. Set `NEWSLETTER_ENABLED=1` (or accounts) for the email-only Lab Notes digest APIs. `NEWSLETTER_SEND` stays off; `npm run digest` drafts HTML + text under `artifacts/newsletter/` and only mails with `NEWSLETTER_SEND=1` plus `--send`. `FORUM_ENABLED=1` also requires accounts (same SQLite) and turns on `/forum`. Admins are the comma-separated list in `ADMIN_EMAILS`. Optional `MOD_EMAILS` promotes moderators. Optional `CONTACT_EMAIL` prints a mailto on `/contact`; unset or invalid renders no inbox.

## Information architecture

| URL | Section |
| --- | --- |
| `/` | Home + living status card |
| `/start` | Short hub — Ubuntu setup, measured recipe, benchmarks, optional Stack Lab |
| `/setup` | First-run setup — Ubuntu 24.04+ (measured) and Windows (honest limits) |
| `/stacks` | Recommended stack cards from the test rig |
| `/qwen` | Master 3.6 / 3.8 comparison table — one row per model × quant, measured tok/s from run cards |
| `/compare` | Cited 35B decisions from local-desktop cards — one vs split, Q6 / Q5 / Q4 plus a Q3 estimate |
| `/compare/one-vs-two-gpu` | One R9700 vs split: decode, prefill, VRAM, system RAM |
| `/compare/q4-q5-q6` | Same 35B quants side by side; Q3 column labeled estimate |
| `/qwen36-dual` | 35B on two R9700s — split vs two copies, measured soak |
| `/multi-gpu` | Dual / multi-GPU — when a second R9700 helps, llama.cpp flags, cited PCIe and PSU |
| `/flash-daily` | Flash daily driver — Q3–Q6 VRAM + DDR5 offload at 262K |
| `/flash-ram-offload` | Flash on DDR5 — system RAM at 262K, 128/192/256 kits, measured DIMM speed, expert-offload launch |
| `/backends/strata` | Strata deep dive — expert cache, prefill limits, MTP is Q2 |
| `/budget` | Setup by budget — size/speed, local/hybrid, standard/abliterated |
| `/calculator` | Quant + Hardware Calculator — size a model, ask what a Radeon can run, or read a speed floor (Q3 through BF16, client-side) |
| `/quants` | Q3–Q8, UD dynamic, KV types, why Q1/Q2 stay off |
| `/gpus` | GPU directory — gfx IDs, VRAM, official ROCm rows, links to `/gpus/<id>` |
| `/gpus/r9700` | Radeon AI PRO R9700 measured hero — 32 GB, 35B llama.cpp tables, Start → setup → recipe → Stack Lab |
| `/gpus/<id>` | One card: recipe table, launch command, or “no tested recipe yet” |
| `/models` | House Qwen models with reverse recipe tables |
| `/recipes/<id>` | One launch: gates, command, RAM, withdrawal |
| `/contribute` | Download recipe JSON (log required) |
| `/wanted` | Card × model gaps — no bounty amounts |
| `/credits` | Sybil / 0xSero MIT notice and local-desktop first-party set |
| `/about` | Who runs AMDai, the published local-desktop kit, editorial independence, affiliate links |
| `/methodology` | How we test — amdai-bench/run@1 cards, labeled estimates, citations, corrections |
| `/contact` | Honest routes — contribute, ROCm problems; email only if `CONTACT_EMAIL` is set |
| `/terms` | Short terms of use — informational, no warranty, hardware/BIOS at your risk |
| `/amdai-bench` | Schema hub — run@1 JSON, runs dump, links to results and methodology |
| `/rss.xml` | Lab Notes RSS — blog posts, dated updates, and official run cards |
| `/benchmarks/methodology` | Our pass/fail suite in our words |
| `/api/v1/catalog.json` | Static recipe catalog |
| `/api/v1/gpus/<id>.json` | Per-card JSON |
| `/api/v1/pick.json` | Static pick table (query strings are not evaluated here) |
| `/stack-lab` | Radeon Stack Lab — Ubuntu 24.04+ companion (packages not published yet). Allowlisted `amdai-stack-lab:` handoff from Lab Notes |
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
| `/benchmarks` | First-party tok/s from the R9700 rig — methodology + local-desktop table |
| `/results` | Official `amdai-bench/run@1` cards — credited to the submitter, page per run |
| `/results/<id>` | One test-run card, including the exact launch command |
| `/bios` | Motherboard BIOS for local AI on Radeon — cited chipset notes, empty board table |
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
| `/newsletter` | Email-only Lab Notes digest (double opt-in; no account) |
| `/account` | Optional saved rigs (off unless `ACCOUNTS_ENABLED=1`) |
| `/privacy` | What optional accounts and the digest store |
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
| `/faq` | Consumer FAQ — grouped Q&A into measured pages, sticky nav, `?q=` filter |
| `/glossary` | Consumer jargon — A–Z, search, deep links; ROCm citations stay on `/rocm/glossary` |
| `/accessibility` | What we test for keyboard, screen readers, and phones — report via /contact, /forum, or /contribute |
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
| `src/data/local-desktop-dual.yaml` | `/qwen36-dual` two-card 35B soak |
| `src/data/flash-daily.yaml` | `/flash-daily` Q3–Q6 RAM + measured Q6 |
| `src/data/strata-deep.yaml` | `/backends/strata` deep dive + dated community cites |
| `src/data/benchmarks.yaml` | `/benchmarks` first-party tok/s |
| `data/runs/*.jsonl` | Official `amdai-bench/run@1` cards (overnight local-desktop drops). Schema: `docs/amdai-bench-run.schema.json` |
| `src/data/amdai-bench.v1.json` | Derived 35B-only compatibility snapshot — live `/amdai-bench.v1.json` comes from the run cards |
| `src/data/bios.yaml` | `/bios` chipset notes + community board table |
| `src/data/version-matrix.yaml` | ROCm × engine × card (or “no data”) |

Add a short dated note under `src/content/updates/` when a **line** changes (new Core SDK, new vLLM extras). Those render on `/rocm/versions` and the blog index.

Weekday procedure: [docs/weekday-scrape.md](docs/weekday-scrape.md) and `/maintain`.

**Radeon Stack Lab** is a separate Ubuntu companion (Origin repo / local app — no public domain documented here). Profiles: `qwen-reliable` (daily driver), `qwen-fast-agent` (Flash). Keep its living catalog aligned with the YAML. Its **amdai-bench** emitter must write `amdai-bench/run@1` (see `npx tsx src/scripts/amdai-bench.ts`).

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
