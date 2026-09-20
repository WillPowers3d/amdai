# R9700 Lab Notes

A static documentation and tutorial site for **local AI** on the **AMD Radeon AI PRO R9700** (often called an “AMD R9700 Pro”) and other home-lab AMD GPUs with **ROCm**.

It is a **living tracker**, not a frozen manual. Version pins are dated snapshots. The home page “what works this week” card is the current recommendation.

Audience: hobbyists and home-lab users. Not enterprise Instinct marketing.

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

When you publish, set `site` in `astro.config.mjs` to your public URL.

## Information architecture

| URL | Section |
| --- | --- |
| `/` | Home + living status card |
| `/start` | Getting started (GPU → ROCm → software → harness) |
| `/gpus` | AMD GPUs / R9700 naming |
| `/rocm` | ROCm explainer + succinct version notes |
| `/software` | vLLM, llama.cpp, Ollama, TGI |
| `/abliterated` | Refusal removal / Qwen variants |
| `/harnesses` | Hermes Agent and OpenClaw |
| `/hardware` | PSU, cooling, VRAM |
| `/tutorials` | How-tos |
| `/troubleshooting` | Common failures |
| `/faq` | Short answers |
| `/blog` | Longer posts + version-note index |

`/local-ai` redirects to `/software`.

## Living updates (edit these, not the layouts)

| File | Feeds |
| --- | --- |
| `src/data/what-works.yaml` | Home status card |
| `src/data/qwen-recommendations.yaml` | Getting started / software / serve-Qwen |
| `src/data/abliterated.yaml` | Abliterated table |

Add a short dated note under `src/content/updates/` when a **line** changes (new Core SDK, new vLLM extras). Those render on `/rocm#version-notes` and the blog index.

## Authoring MDX

| Folder | Routes |
| --- | --- |
| `src/content/guides/` | `/{id}` (`rocm.mdx` is rendered by `src/pages/rocm.astro`) |
| `src/content/tutorials/` | `/tutorials/{id}` |
| `src/content/blog/` | `/blog/{id}` |
| `src/content/updates/` | Cards on `/rocm` and `/blog` |

MDX can use `<Callout>`, `<QwenPicks />`, and `<AbliteratedTable />` without imports.

Nav lives in `src/lib/site.ts`.

## Accuracy

Product figures from AMD’s public R9700 page are labeled. ROCm 10.0 / vLLM 0.29 material is a **dated snapshot**. Always re-check the live [ROCm matrix](https://rocm.docs.amd.com/projects/install-on-linux/en/latest/reference/system-requirements.html) and [vLLM GPU install](https://docs.vllm.ai/en/stable/getting_started/installation/gpu/index.html).
