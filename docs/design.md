# Design brief — amdai.net

Independent consumer notes for local AI on Radeon. The visual system has to feel like a lab instrument: precise, dark, a little warm, never corporate-AMD and never generic “AI purple.” Budget is not a constraint on taste; it is a constraint on weight. Every decorative pixel has to earn a Lighthouse score.

This site is **not affiliated with AMD**. Ember is a color, not a lockup. Product names stay nominative. The wordmark is **AMDai**, with a chip motif we drew ourselves.

## Moodboard

| Site | Why it is here |
| --- | --- |
| [vercel.com](https://vercel.com) | Restraint as brand. Near-black canvas, one accent, huge tight type, product as the hero. No decorative nebula. |
| [linear.app](https://linear.app) | Speed as a feeling: 1px hairlines, muted chrome, instant hover. Product UI used as marketing. |
| [docs.stripe.com](https://docs.stripe.com) | Docs that look designed. Density without clutter. Code as a first-class surface. Warm light theme. |
| [raycast.com](https://raycast.com) | Command palette as identity. Keyboard-first. Soft materials around a sharp tool. |
| [framer.com](https://www.framer.com) | Editorial scale and spatial composition. Motion that is compositional, not spinner-for-its-own-sake. |
| [amd.com Radeon AI PRO R9700](https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9700.html) | Hardware seriousness, spec stacks, ember-adjacent accent. Take the gravity, not the logo. |
| [nvidia.com GeForce / RTX](https://www.nvidia.com/en-us/geforce/) | Dark theater lighting and stacked specs. Take the stage, not the green. |
| [tailwindcss.com/docs](https://tailwindcss.com/docs) | ⌘K search, copy-on-code, dual theme both actually good, nav that scales. |
| [astro.build](https://astro.build) | Performance as personality. Distinctive mark, docs IA, islands of JS. |
| [arc.net](https://arc.net) | Spatial browser chrome, command bar, color with a point of view. |
| [Awwwards — Sites of the Year](https://www.awwwards.com/websites/sites_of_the_year/) | Calibration set for craft, not a style to clone. |
| [CSS Design Awards](https://www.cssdesignawards.com/) | Interaction quality bar. |
| [FWA](https://thefwa.com/) | Motion and material quality bar. |

## Principles taken from each

### Vercel
- One surface, one accent, lots of air.
- Headlines that read like a claim, not a category label.
- Ship HTML first; motion is optional garnish.

### Linear
- Chrome stays quiet so content can be loud.
- Hairline borders and 8px rhythm. Hover states are immediate, not theatrical.
- Status (fits / tight / no) should feel like issue states: color + word, never a pie chart.

### Stripe docs
- Left-to-right reading gravity. Tables, callouts, and code blocks are designed objects.
- Light theme is a first-class product, not an invert filter.
- Every control has a caption that tells you what it does.

### Raycast
- ⌘K is the second navigation, not a hidden Easter egg.
- The keyboard is a first-class input. Visible shortcut chips.

### Framer
- Hero can be a composition (grid + type + a single interactive object).
- Motion has a curve and a purpose. Honor `prefers-reduced-motion`.

### AMD product pages
- Specs in a grid. The card is the object.
- Ember used as a strike, not a wash. Never the AMD logo or a “powered by AMD” lockup.

### NVIDIA product pages
- Dark stage, product in the light, numbers set in tabular figures.
- We keep ember, not green. Measured tok/s get the same gravity as a clock speed.

### Tailwind docs
- Self-hosted fonts. Copy buttons on every code block.
- Search that works offline (Pagefind) and from the keyboard.
- Components (badge, callout, table) are consistent enough to disappear.

### Astro
- JS only where it is the product (calculator, wizard, palette).
- Distinctive mark (chip + wordmark) instead of a stock robot.

### Arc
- A command bar that feels like part of the chrome.
- Soft raised surfaces on a deep field. Personality without stickers.

## Identity

**Name.** AMDai — spoken “am-dye.” The longer title “R9700 Lab Notes” stays next to the wordmark in document titles and the footer.

**Mark.** A 5×5 die with corner pads (a chip, not a chevron, not the AMD arrow). Wordmark is `AMDai` in the UI sans, tracking slightly tight, with the `ai` in ember.

**Voice in the UI.** Short, specific, adult. “Estimate, not a bench.” “Tested on our rig.” “Independent, not affiliated with AMD.”

## Color

Deep near-black canvas (`#08080b`), raised panels a step up (`#111114`). Ink is warm paper (`#f4efe8`), not pure white. Ember (`#e24a2f`) is the only saturated accent — a lab-heater color, not AMD corporate red (`#ed1c24`) and not a gradient. Supporting: amber warn, chlorophyll ok, hairline `line`.

Light theme is limestone paper (`#f3efe6`) with the same ember, darker ink, and no washed-out gray.

Tokens live as CSS variables on `:root` / `[data-theme]`. No stock purple-to-cyan meshes.

## Type

- **UI / display:** Geist (self-hosted, variable). Tight tracking on H1, never a second display family unless a pull quote needs italic.
- **Code / kicker:** Geist Mono. Kickers are 11–12px, uppercase, wide tracking.
- Scale: 12 / 14 / 16 / 18 / 24 / 32 / 40 / 56 / 72. Body 16/26. Display 56–72 on desktop, 36–40 on mobile.

## Space and motion

4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96. Cards `rounded-2xl`, buttons `rounded-full`, fields 44px min-height.

Motion is 180–280ms `cubic-bezier(0.22, 1, 0.36, 1)`. The hero grid breathes; it does not spin. `prefers-reduced-motion: reduce` freezes every loop and shortens hovers to 1ms.

## Components

Cards, primary/secondary/ghost buttons, BuyButtons, badges (`Tested on our rig`, estimate, TODO), tables, callouts, code blocks with copy, tabs, segmented toggles, sliders, stacked VRAM bar, command palette, mega-menu.

Iconography is crisp 24px SVG, 1.5px stroke, no emoji in chrome (theme toggle is an SVG sun/moon).

## Quality bars

Lighthouse 95+ on performance, accessibility, best practices, SEO. WCAG AA contrast. No layout shift: reserved header, font `size-adjust`, images with dimensions. Fonts self-hosted. Independent footer line on every page.
