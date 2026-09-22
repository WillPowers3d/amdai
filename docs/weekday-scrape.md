# Weekday scrape → `src/data/*.yaml`

This is the maintainer checklist. The in-site version is [/maintain](/maintain) once the site is running.

## Why YAML, not pages

Layouts read `src/data/what-works.yaml`, `src/data/qwen-recommendations.yaml`, and `src/data/abliterated.yaml`. A weekday refresh should not touch Tailwind or nav unless the IA changed.

## Procedure

1. Open the sources listed on `/maintain` (ROCm 10 notes, AMD vLLM page, vLLM releases, official Qwen cards).
2. If nothing material moved, **stop**. Leave `as_of` alone.
3. If something moved: bump `as_of`, rewrite `headline` in one sentence, update the relevant keys. Do not invent tok/s, prices, or download counts.
4. Keep **reliability** = official instruct (`qwen-reliable` in [Radeon Stack Lab](../src/content/guides/stack-lab.mdx)). Cutting-edge Qwen3 stays `qwen3-8b-try`.
5. Add `src/content/updates/YYYY-MM-DD-*.mdx` only when a **line** changed (new Core SDK or extras index).
6. Align FAQ / start “this week” sentences, or point them at the home card.
7. `npm run build`, then commit on `main`.

## Optional Hermes overnight

Attach Hermes to a working local OpenAI `/v1` (see `/harnesses`). Ask it to draft a YAML diff from the source list. A human still verifies smoke tests and commits.

## Companion app

Radeon Stack Lab is an Ubuntu **Origin repo / local app** with a living catalog and those two profiles. No public domain is documented here. When the YAML moves, refresh the app catalog the same day if you run both.
