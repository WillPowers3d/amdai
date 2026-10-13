# Performance baseline — 2026-10-13

Mobile-throttled Playwright check (Moto G Power 412×823, Slow 4G, 4× CPU) plus Lighthouse v10 scoring curves (Speed Index omitted; weights LCP 30 / TBT 30 / CLS 25 / FCP 15). Static byte budgets run on every built page. Live CWV runs on the required sample plus `/gpus/*`.

This is the first committed baseline. **Before** is the `/stack-lab` dist with two font preloads and eager Mermaid. **After** is this change: one critical font preload, Mermaid loaded only when the figure is on screen, silicon SVG sized, Caddy cache notes in `docs/deploy.md`.

Budgets: content performance ≥ 90, LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 200 ms, initial JS ≤ 90 KB. Tool pages (`/calculator`, `/qwen`, `/search`, `/budget`, `/troubleshoot/errors`) use performance ≥ 80 and JS ≤ 400 KB.

| Page | Tier | Perf before → after | LCP before → after | TBT before → after | JS before → after |
| --- | --- | ---: | ---: | ---: | ---: |
| `/` | content | 93 → 93 | 1220 → 1176 ms | 17 → 31 ms | 2.4 → 2.4 KB |
| `/calculator` | tool | 91 → 93 | 1220 → 1188 ms | 132 → 91 ms | 289.8 → 289.8 KB |
| `/budget` | tool | 93 → 93 | 1220 → 1184 ms | 4 → 8 ms | 2.4 → 2.4 KB |
| `/benchmarks` | content | 92 → 93 | 1236 → 1180 ms | 0 → 6 ms | 2.4 → 2.4 KB |
| `/compare` | content | 95 → 96 | 1080 → 1028 ms | 0 → 0 ms | 2.4 → 2.4 KB |
| `/compare/one-vs-two-gpu` | content | 93 → 93 | 1212 → 1192 ms | 0 → 4 ms | 2.4 → 2.4 KB |
| `/compare/q4-q5-q6` | content | 93 → 94 | 1216 → 1172 ms | 0 → 0 ms | 2.4 → 2.4 KB |
| `/gpus` | content | 92 → 93 | 1244 → 1204 ms | 17 → 22 ms | 2.4 → 2.4 KB |
| `/gpus/r9700` | content | 93 → 93 | 1224 → 1192 ms | 7 → 8 ms | 2.4 → 2.4 KB |
| `/rocm` | content | 94 → 95 | 1156 → 1100 ms | 6 → 11 ms | 2.4 → 2.4 KB |
| `/rocm/stack` | content | 90 → 94 | 1360 → 1172 ms | 47 → 28 ms | 137.3 → 6.0 KB |
| `/setup` | content | 93 → 93 | 1212 → 1176 ms | 0 → 5 ms | 2.4 → 2.4 KB |
| `/faq` | content | 93 → 93 | 1228 → 1184 ms | 0 → 0 ms | 2.4 → 2.4 KB |
| `/stack-lab` | content | 92 → 93 | 1252 → 1192 ms | 15 → 16 ms | 2.4 → 2.4 KB |
| `/glossary` | content | 92 → 93 | 1236 → 1208 ms | 0 → 0 ms | 2.4 → 2.4 KB |
| `/tutorials/serve-qwen` | content | 92 → 93 | 1244 → 1208 ms | 13 → 21 ms | 2.4 → 2.4 KB |
| `/backends` | content | 88 → 92 | 1448 → 1248 ms | 54 → 42 ms | 137.3 → 6.0 KB |
| `/qwen` | tool | 92 → 93 | 1236 → 1196 ms | 18 → 21 ms | 8.7 → 8.7 KB |

Every `/gpus/*` directory page stayed at 95–96 after (1000–1028 ms LCP). CLS was 0.000 on the sample except `/qwen` at 0.001.

Site-wide static gate before: 265 issues (two font preloads on every page; Mermaid 137 KB on `/backends` and `/rocm/stack`; `/backends` performance 88). After: **0 issues**.

OG images stay PNG for social crawlers. There are no in-page `<img>` photos yet; new ones must use AVIF/WebP + fallback, width/height, and lazy-load below the fold.

Re-run: `npm run qa:perf` after `npm run build` (or as the last step of `npm run build`).
