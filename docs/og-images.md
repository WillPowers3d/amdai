# Open Graph / Twitter share cards

Every live AMDai page ships a 1200×630 dark ember PNG so shares of recipes, benchmarks, and GPU pages look like **AMDai**, not a blank preview.

Twitter uses the same 1.91:1 file (`twitter:card` = `summary_large_image`). A square variant is not generated.

## How a page picks an image

`src/layouts/Base.astro` sets:

- `og:image` / `twitter:image` → `https://amdai.net/og/<slug>.png`
- `og:image:alt` / `twitter:image:alt` → catalog `alt` (starts with `AMDai`)
- `og:image:width` / `og:image:height` → 1200 / 630
- `twitter:card` → `summary_large_image`
- `og:site_name` → `amdai` (lowercase; display wordmark stays `AMDai`)

`ogSlug(pathname)` in `src/lib/og.ts` maps the route. Unknown pages use `default`. Nested GPU / model / recipe pages share the `gpus` card, except `/gpus/r9700`.

## Catalog (opt in here)

Add a row to `OG_CARDS` in `src/lib/og.ts`. Set `measured: true` only when a cited UD-Q5 1× 4K llama.cpp card exists — the generator then replaces the lede with that decode (and, on compare cards, the split side). Do not invent tok/s or prices.

Required slugs (must exist): `home`, `gpus-r9700`, `benchmarks`, `compare`, `calculator`, `budget`, `setup`, `stack-lab`, `faq`, `default`.

| Slug | Live pages | Measured headline |
| --- | --- | --- |
| `home` | `/` | UD-Q5 1× 4K decode from run cards |
| `gpus-r9700` | `/gpus/r9700` | 32 GB + that decode |
| `benchmarks` | `/benchmarks` | same cited decode |
| `compare` | `/compare` | 1× vs split, same cards |
| `calculator` | `/calculator` | no — estimates, not a bench |
| `budget` | `/budget` | no |
| `setup` | `/setup` | no |
| `stack-lab` | `/stack-lab` | no |
| `faq` | `/faq` | no |
| `default` | everything else | no |
| `gpus` | `/gpus`, other `/gpus/<id>`, `/models`, `/recipes/<id>` | no |
| `compare-one-vs-two-gpu` | `/compare/one-vs-two-gpu` | 1× vs split |
| `compare-q4-q5-q6` | `/compare/q4-q5-q6` | no (Q3 stays a labeled estimate) |
| `multi-gpu` | `/multi-gpu` | no — cites measured pages; lede stays static |
| `about` | `/about` | no |
| `methodology` | `/methodology` | no |
| `contact` | `/contact` | no |
| `terms` | `/terms` | no |

Other catalog slugs (`start`, `glossary`, `results`, `qwen`, …) follow the same file.

## Rebuild the PNGs

```bash
npm run og
```

That is `tsx src/scripts/og.ts`. It screenshots catalog HTML (Geist, ember on obsidian) into `public/og/<slug>.png`. Then `npm run build` copies them into `dist/og/`.

Do not hand-draw one-off binaries. New pages opt in with a catalog row, then `npm run og`.

## QA

The SEO gate (`npm run qa:seo`, part of `npm run build`) fails if a built HTML page is missing `og:image` or `og:image:alt`, uses a relative image URL, points at a 404, or has `twitter:card` other than `summary_large_image`. The link gate also treats `og:image` / `twitter:image` as assets.

`src/lib/og.test.ts` checks required slugs, absolute `https://amdai.net/og/…` URLs, cited measured ledes, and that every catalog slug has a PNG on disk.
