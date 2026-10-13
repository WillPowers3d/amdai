/**
 * Consumer FAQ for /faq. Short answers that point at measured pages.
 * Do not invent tok/s, prices, or Q3 speeds. Q1/Q2 stay off the table.
 */

import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';

export const FAQ_NAME = 'AMDai FAQ';

export const FAQ_GROUPS = [
  {
    id: 'about',
    label: 'About AMDai',
    description: 'Who writes this notebook, measured vs estimate, affiliates, and the Lab Notes feed.',
  },
  {
    id: 'getting-started',
    label: 'Getting started',
    description: 'Which GPU, Ubuntu vs Windows, and Vulkan vs ROCm HIP.',
  },
  {
    id: 'models-quants',
    label: 'Models & quants',
    description: '35B vs Flash, llama.cpp vs Strata, Q6 / Q5 / Q4, and when Q3 is only an estimate.',
  },
  {
    id: 'speed-vram',
    label: 'Speed & VRAM',
    description: 'How to read the overnight matrix and one GPU vs both cards.',
  },
  {
    id: 'context-ram',
    label: 'Context & system RAM',
    description: 'Minimum system RAM needed vs RAM needed at full context.',
  },
  {
    id: 'stack-lab',
    label: 'Stack Lab',
    description: 'Open in Stack Lab, recipes, amdai-bench cards, and when a harness comes later.',
  },
  {
    id: 'troubleshooting',
    label: 'Troubleshooting',
    description: 'Cited ROCm problems, BIOS, and the glossary.',
  },
] as const;

export type FaqGroupId = (typeof FAQ_GROUPS)[number]['id'];

export type FaqLink = { href: string; label: string };

export type FaqItem = {
  id: string;
  group: FaqGroupId;
  question: string;
  answer: string;
  links: FaqLink[];
};

export const FAQ_ENTRIES: FaqItem[] = [
  {
    id: 'what-is-amdai',
    group: 'about',
    question: 'What is AMDai?',
    answer:
      'AMDai is an independent consumer notebook for local AI on AMD Radeon and ROCm. It is not an AMD publication, not a store, and not a scraped leaderboard. Official numbers come from amdai-bench/run@1 cards on the local-desktop R9700 rig unless a cell says estimate or cited. Who runs it and how we test live on About and Methodology.',
    links: [
      { href: '/about', label: 'About' },
      { href: '/methodology', label: 'How we test' },
      { href: '/contact', label: 'Contact' },
      { href: '/start', label: 'Getting started' },
    ],
  },
  {
    id: 'measured-vs-estimate',
    group: 'about',
    question: 'How do you label measured vs estimate?',
    answer:
      'A measured cell cites an official amdai-bench/run@1 card. Calculator totals, Q3 35B rows, and Windows paths stay labeled estimate unless a card says measured. Empty stays not measured. We do not invent tok/s or prices to fill a hole. The full rule set is on How we test.',
    links: [
      { href: '/methodology', label: 'How we test' },
      { href: '/results', label: 'Run cards' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/compare', label: 'Compare 35B' },
    ],
  },
  {
    id: 'affiliate-links',
    group: 'about',
    question: 'Do store buttons earn affiliate commission?',
    answer:
      'Some Check-price buttons are Amazon Associates, Rakuten (Newegg), or B&H when those IDs are set. A commission does not change the price you pay and does not change the recommendation. We do not show a live or stale price. Full program notes are on the affiliate disclosure.',
    links: [
      { href: '/disclosure', label: 'Affiliate disclosure' },
      { href: '/budget', label: 'Setup by budget' },
      { href: '/about', label: 'About' },
    ],
  },
  {
    id: 'lab-notes-rss',
    group: 'about',
    question: 'How do I follow Lab Notes without an account?',
    answer:
      'Subscribe to the Lab Notes RSS feed for posts, dated updates, and official run cards. The email digest is optional and email-only. We do not invent a social account.',
    links: [
      { href: '/rss.xml', label: 'RSS feed' },
      { href: '/newsletter', label: 'Lab Notes digest' },
      { href: '/blog', label: 'Blog' },
      { href: '/updates', label: 'Updates' },
    ],
  },
  {
    id: 'which-gpu',
    group: 'getting-started',
    question: 'Which GPU should I start with?',
    answer:
      'The measured house box is one AMD Radeon AI PRO R9700 (32 GB, gfx1201). There is no consumer RX 9700. A 16 GB RX 9070 XT is the same generation with half the VRAM. A 7900 XTX (gfx1100) is still a practical home card on a different ROCm family package — see the RX 7900 XTX recipe sheet for calculator fit estimates, not local-desktop tok/s. Confirm the SKU on the R9700 measured page and the GPU directory, then size the file on the calculator before you buy a second card.',
    links: [
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/gpus/rx7900xtx', label: 'RX 7900 XTX sheet' },
      { href: '/gpus/rx7900xt', label: 'RX 7900 XT sheet' },
      { href: '/gpus/rx7800xt', label: 'RX 7800 XT sheet' },
      { href: '/gpus', label: 'GPU directory' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/start', label: 'Getting started' },
      { href: '/hardware', label: 'Hardware' },
      { href: '/budget', label: 'Setup by budget' },
    ],
  },
  {
    id: 'pick-a-budget',
    group: 'getting-started',
    question: 'How do I pick a budget tier?',
    answer:
      'Setup by budget is four tiers from a ~16 GB card to the two-R9700 Pro rig. Size vs speed changes the pick. Buttons say Check price — we do not invent a street price. Consumer 7900 / 7800 sheets are estimates; the R9700 page is the measured north star.',
    links: [
      { href: '/budget', label: 'Setup by budget' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/disclosure', label: 'Affiliate disclosure' },
    ],
  },
  {
    id: 'ubuntu-or-windows',
    group: 'getting-started',
    question: 'Ubuntu or Windows for a first local LLM box?',
    answer:
      'Ubuntu LTS named on AMD’s current ROCm matrix is the path we write. First-run setup walks Ubuntu 24.04+ to the first token and an honest Windows path. Radeon Stack Lab follows that Ubuntu path — packages are not published yet. Vulkan llama.cpp is the honest Windows path for tokens. Full ROCm userspace is a Linux product. ROCm 10.1 lists WSL2 as a technical preview — not a measured local-desktop daily driver. We do not have Windows tok/s cards.',
    links: [
      { href: '/setup', label: 'First-run setup' },
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/start', label: 'Getting started' },
      { href: '/tutorials/install-rocm', label: 'Install ROCm' },
      { href: '/rocm-problems/windows-wsl-preview', label: 'Windows / WSL2 preview' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
  {
    id: 'vulkan-or-hip',
    group: 'getting-started',
    question: 'Vulkan or ROCm HIP?',
    answer:
      'Consumer default on AMDai is llama.cpp Vulkan for the daily-driver 35B. HIP is the ROCm compile when you need it, and it is also where gfx1201 “no binary for GPU” reports show up. If HIP configure is a mess, try Vulkan first and read the cited problem row. Engine notes live on the backends pages — llama.cpp first.',
    links: [
      { href: '/backends', label: 'Backends' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/rocm-problems/hip-no-binary-for-gpu', label: 'HIP no binary' },
    ],
  },
  {
    id: 'will-rocm-work',
    group: 'getting-started',
    question: 'Will ROCm work for a local LLM on Ubuntu in 2026?',
    answer:
      'Yes for single-GPU inference if you pin a current AMD Core SDK (10.1 line as of the weekly card) and a matching runtime. It is still not CUDA. Packaging is the hard part. Longer answers stay on What is ROCm and the ROCm FAQ — this page does not repeat those guides.',
    links: [
      { href: '/rocm', label: 'What is ROCm' },
      { href: '/rocm/faq', label: 'ROCm FAQ' },
      { href: '/', label: 'Weekly card' },
    ],
  },
  {
    id: 'apt-install-rocm',
    group: 'getting-started',
    question: 'Can I apt install rocm from Ubuntu?',
    answer:
      'You can. You should not, if you want Core SDK 10.0/10.1, gfx1201, or a current vLLM ROCm image. Canonical’s archive has lagged. Add AMD’s 10.1 repo or use ROCm CLI v0.2.0 — never both plus archive rocm. Walkthrough: Install ROCm.',
    links: [
      { href: '/tutorials/install-rocm', label: 'Install ROCm' },
      { href: '/rocm-problems/ubuntu-rocm-package-shadow', label: 'Archive shadow' },
      { href: '/start', label: 'Getting started' },
    ],
  },
  {
    id: 'r9700-pro-sku',
    group: 'getting-started',
    question: 'Is “R9700 Pro” a real SKU?',
    answer:
      'The product is the AMD Radeon AI PRO R9700. There is no consumer RX 9700 in AMD’s current lineup. The gaming sibling is the RX 9070 series. Names and gfx IDs: GPU directory.',
    links: [
      { href: '/gpus', label: 'GPU directory' },
      { href: '/gpus/r9700', label: 'R9700' },
    ],
  },
  {
    id: 'should-i-start-with-vllm',
    group: 'getting-started',
    question: 'Should I start with vLLM?',
    answer:
      'No. Consumers start on llama.cpp. vLLM is the multi-client serve try. AMD’s 10.0 supported combo is still 0.27 + PyTorch 2.13. Community / ROCm 0.31 is this week’s serve try. Default pip install vllm is CUDA. We do not invent a local-desktop 0.31 tok/s.',
    links: [
      { href: '/backends', label: 'Backends' },
      { href: '/software', label: 'AI software' },
      { href: '/updates/matrix', label: 'Version matrix' },
    ],
  },
  {
    id: '35b-or-flash',
    group: 'models-quants',
    question: '35B or Flash — which Qwen should I run first?',
    answer:
      'Daily driver: Qwen3.6-35B-A3B Unsloth UD-Q5_K_XL on one R9700, llama.cpp Vulkan, 262144 context, f16 KV, no RAM offload. Measured on our rig, 2026-10, llama-bench: 102.39 tok/s at 4K, 90.52 at 32K, 66.43 at 128K, 44.4 at 256K. Fast agents: Qwen 3.8 Flash UD-Q6_K_XL on Strata — cited pair ~32.6 tok/s versus llama.cpp ~16 tok/s at 262K. House models only. Recipe and cards: stacks, recipes, /qwen.',
    links: [
      { href: '/stacks', label: 'Stacks' },
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
      { href: '/recipes/qwen38-flash.strata.262k', label: 'Flash recipe' },
      { href: '/qwen', label: 'Qwen compare' },
      { href: '/start', label: 'Getting started' },
    ],
  },
  {
    id: 'llamacpp-vs-strata',
    group: 'models-quants',
    question: 'Why llama.cpp first instead of Strata?',
    answer:
      'AMDai’s consumer default is llama.cpp (Vulkan first) for the daily-driver 35B. Strata is the first-party Flash try on the house Pro rig — the cited pair is ~32.6 tok/s versus llama.cpp ~16 tok/s at 262K on Qwen 3.8 Flash UD-Q6_K_XL. Start on llama.cpp unless the job is that Flash pin.',
    links: [
      { href: '/backends', label: 'Backends' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/backends/strata', label: 'Strata' },
      { href: '/stacks', label: 'Stacks' },
      { href: '/harnesses', label: 'Harnesses' },
    ],
  },
  {
    id: 'q6-q5-q4',
    group: 'models-quants',
    question: 'Q6, Q5, or Q4 — what should I pick?',
    answer:
      'Those letters are GGUF quant recipes, not a speed ranking we invent. The overnight local-desktop sweep measured UD-Q5_K_XL, Q5_K_M, Q4_K_M, and Q6_K on llama.cpp Vulkan. Read the cells on /benchmarks and the side-by-side on /compare. Q6 on one card at 32K and up is partly on DDR5 — that row says so. Fit the file on the calculator.',
    links: [
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/compare', label: 'Compare 35B' },
      { href: '/compare/q4-q5-q6', label: 'Q6 / Q5 / Q4' },
      { href: '/quants', label: 'Quants' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'when-is-q3-an-estimate',
    group: 'models-quants',
    question: 'When is Q3 only an estimate?',
    answer: `UD-Q3_K_XL may appear in comparison chrome as a labeled estimate. The cited file listing is ${COMPARE_Q3_CITE}. We do not invent a Q3 tok/s. A measured Qwen 3.8 Flash Q3 run is the approved one-time exception and is labeled on that card. Q3 is not a measured 35B overnight row.`,
    links: [
      { href: '/compare', label: 'Compare 35B' },
      { href: '/compare/q4-q5-q6', label: 'Q6 / Q5 / Q4 + Q3 estimate' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/quants', label: 'Quants' },
    ],
  },
  {
    id: 'why-no-q1-q2',
    group: 'models-quants',
    question: 'Why don’t you list Q1 or Q2?',
    answer:
      'AMDai does not offer or recommend Q1 or Q2 quants. The calculator and compare pages list Q3 and up. Q3 stays a labeled estimate unless a card is measured. We will not invent a missing smaller file’s tok/s to fill a table.',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/quants', label: 'Quants' },
      { href: '/glossary', label: 'Glossary' },
    ],
  },
  {
    id: 'how-to-read-benchmarks',
    group: 'speed-vram',
    question: 'How do I read /benchmarks and /results?',
    answer:
      'llama.cpp llama-bench prints pp (prefill) and tg (decode). Decode is the chat tok/s. /benchmarks is the 33-card local-desktop overnight matrix: UD-Q5, Q5, Q4, Q6 × 4K / 32K / 128K / 256K × one GPU and split. Each cell links to its amdai-bench/run@1 card on /results — launch command, VRAM per card, VRAM total, peak system RAM. Empty stays not measured. The overnight cards recorded llama-bench, not llama-server.',
    links: [
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/results', label: 'Run cards' },
      { href: '/compare', label: 'Compare 35B' },
      { href: '/glossary', label: 'Glossary' },
    ],
  },
  {
    id: 'two-gpus-double-speed',
    group: 'speed-vram',
    question: 'Will two R9700s double decode speed?',
    answer:
      'Not automatically. On the overnight cards, one R9700 UD-Q5_K_XL at 4K decodes 102.39 tok/s; the two-card split is 82.78 tok/s. A split pays an RCCL / topology tax. Two copies of the same server can serve two requests; that is not “double one chat.” Read /multi-gpu, then measure on /compare/one-vs-two-gpu and /qwen36-dual before you buy a second card for speed.',
    links: [
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs two GPU' },
      { href: '/qwen36-dual', label: '35B on two cards' },
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'two-gpu-combo',
    group: 'speed-vram',
    question: 'What is a two-GPU Combo versus a split?',
    answer:
      'A split is one model cut across two cards (llama.cpp -sm layer on the overnight rows). A Combo on this site is two models at once — Flash on one card and 35B on the other — not a promise of 2× decode. Read Dual / multi-GPU before you buy a second card for speed.',
    links: [
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs two GPU' },
      { href: '/qwen36-dual', label: '35B on two cards' },
      { href: '/flash-daily', label: 'Flash daily' },
    ],
  },
  {
    id: 'q6-4k-two-numbers',
    group: 'speed-vram',
    question: 'Why does Q6_K 1-GPU 4K show 82.62 and 103.23 tok/s?',
    answer:
      'Two official cards disagree. 23:26 = 82.62 tok/s decode; 23:55 = 103.23 tok/s. Both stay up. Neither is averaged or dropped. Flagged for re-run. The whole 33-card sweep is measured, pending re-verify after the DDR5-5200 oops. Read both cards on /results and the caveat on /benchmarks.',
    links: [
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/results', label: 'Run cards' },
      { href: '/compare/q4-q5-q6', label: 'Q6 / Q5 / Q4' },
    ],
  },
  {
    id: 'min-ram-vs-full-context',
    group: 'context-ram',
    question: 'How much system RAM do I need at short context vs full context?',
    answer:
      'The calculator prints two lines: “Minimum system RAM needed” (the load at the context you picked) and “RAM needed at full context” (262144 for the house 35B). Overnight UD-Q5_K_XL llama-bench on one R9700 recorded peak system RAM 37.32 GB at 4K and 42.9 GB at 256K (Linux GiB labeled GB). Those are measured peaks, pending re-verify after the RAM fix — not a kit you must buy. Change context on the calculator and read the pair.',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/results/local-desktop-20261012-2311-35b-udq5kxl-1gpu-4k-llamacpp-f16', label: '4K run card' },
      { href: '/results/local-desktop-20261012-2314-35b-udq5kxl-1gpu-256k-llamacpp-f16', label: '256K run card' },
      { href: '/compare', label: 'Compare 35B' },
    ],
  },
  {
    id: 'what-is-ram-offload',
    group: 'context-ram',
    question: 'What is RAM offload and when do I use it?',
    answer:
      'When the GGUF plus KV will not stay in VRAM, layers or experts spill to DDR5 and decode falls. Q6 35B on one R9700 at 32K and up is partly offloaded on the overnight cards. Qwen 3.8 Flash does not fit in one 32 GB card — hot experts stay in VRAM, the rest on DDR5. Kit sizes and measured DIMM-speed rows live on Flash RAM offload. We do not invent an offload tok/s when the card omitted one.',
    links: [
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/flash-daily', label: 'Flash daily driver' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/benchmarks', label: 'Benchmarks' },
    ],
  },
  {
    id: 'what-is-stack-lab',
    group: 'stack-lab',
    question: 'What is Radeon Stack Lab?',
    answer:
      'An Ubuntu 24.04+ companion (Origin repo / local install — packages not published yet, no public download URL) with the same catalog as this site’s YAML. Jobs: check my rig, setup doctor, model manager, apply recipes, start a profile, live dashboard, amdai-bench, then share cards back. Profile qwen-reliable is the daily-driver 35B Q5. qwen-fast-agent is Flash on Strata. Lab Notes is the notebook; Stack Lab is the local app that records runs.',
    links: [
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/stacks', label: 'Stacks' },
      { href: '/maintain', label: 'Weekday scrape' },
    ],
  },
  {
    id: 'open-in-stack-lab',
    group: 'stack-lab',
    question: 'How does Open in Stack Lab work?',
    answer:
      'Allowlisted Lab Notes buttons use the documented amdai-stack-lab: screens (recipes, doctor, planner, library, support, profile). If the app is not installed, they fall back to Stack Lab install notes — packages are not published yet, and there is no public download URL. If Stack Lab is already running on this machine, the local app is 127.0.0.1:47321. House profiles qwen-reliable and qwen-fast-agent are the measured R9700 daily and Flash pins. They do not apply to untested consumer cards.',
    links: [
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/stack-lab#install', label: 'Install notes' },
      { href: '/recipes.json', label: 'recipes.json' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
    ],
  },
  {
    id: 'recipes-and-amdai-bench',
    group: 'stack-lab',
    question: 'How do recipes and amdai-bench connect?',
    answer:
      'A recipe is a pinned launch on a named GPU — model, quant, engine, context, gates. Stack Lab’s amdai-bench emitter writes one official test-run card per line (schema amdai-bench/run@1). Lab Notes ingests those cards onto /results. The 35B matrix on /benchmarks is built only from those cards. Do not invent tok/s in a recipe; attach a log.',
    links: [
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
      { href: '/results', label: 'Run cards' },
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/contribute', label: 'Contribute a recipe' },
    ],
  },
  {
    id: 'do-i-need-a-harness',
    group: 'stack-lab',
    question: 'Do I need a harness?',
    answer:
      'No. You need tokens on the GPU first. Hermes or OpenClaw come after a loopback /v1 works. Local Hermes on local-desktop points at Strata :8083 and llama-server. Snippets: connect. Catalog: harnesses. A slow harness is usually a backend problem, not a card-reputation problem.',
    links: [
      { href: '/harnesses', label: 'Harnesses' },
      { href: '/harnesses/connect', label: 'Connect' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/backends', label: 'Backends' },
    ],
  },
  {
    id: 'gpu-not-seen',
    group: 'troubleshooting',
    question: 'The GPU is not seen or HIP configure is a mess — where do I start?',
    answer:
      'Paste the log in the error matcher. Cited rows live on /rocm-problems: HIP no binary for GPU, Ubuntu archive packages shadowing AMD’s install, MODE1 reset / MES hang on gfx12, unofficial HSA overrides. Do not treat a community HSA_OVERRIDE as a measured fix. Walkthroughs: verify ROCm, then troubleshooting.',
    links: [
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/troubleshoot/errors', label: 'Error paste' },
      { href: '/troubleshooting', label: 'Troubleshooting' },
      { href: '/tutorials/verify-rocm', label: 'Verify ROCm' },
    ],
  },
  {
    id: 'bios-settings',
    group: 'troubleshooting',
    question: 'Which BIOS settings matter for local AI?',
    answer:
      'Cited chipset notes: Above 4G, ReBAR/SAM, CSM off, and matching GPU lane widths (x8/x8 or x16/x16 — not a leftover x4). The per-board table is empty until submissions. We do not invent a motherboard for local-desktop. Read /bios before you file “ROCm is broken” on a firmware miss.',
    links: [
      { href: '/bios', label: 'BIOS' },
      { href: '/hardware', label: 'Hardware' },
      { href: '/rocm-problems', label: 'ROCm problems' },
    ],
  },
  {
    id: 'can-i-fine-tune',
    group: 'troubleshooting',
    question: 'Can I fine-tune like a 4090 blog post?',
    answer:
      'PyTorch ROCm exists. ROCm 10.0 has a known issue: training / fine-tune GPU resets on R9700 — try TORCH_BLAS_PREFER_HIPBLASLT=0. That row is cited, not a measured tokens-per-second. Community training writeups often use older ROCm; keep inference on the pin you actually run. We do not invent a fine-tune speed.',
    links: [
      { href: '/rocm-problems/rocm-10-0-finetune-reset', label: 'Fine-tune reset' },
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/rocm', label: 'What is ROCm' },
    ],
  },
  {
    id: 'jargon-glossary',
    group: 'troubleshooting',
    question: 'What do ROCm, GGUF, and tok/s mean?',
    answer:
      'Plain-English definitions live in the glossary — A–Z, searchable, same jargon the rest of AMDai uses. ROCm-stack citations stay on the ROCm-guide glossary. This FAQ does not duplicate those entries.',
    links: [
      { href: '/glossary', label: 'Glossary' },
      { href: '/rocm/glossary', label: 'ROCm glossary' },
    ],
  },
];

export const FAQ_ITEMS: FaqItem[] = FAQ_ENTRIES;

export const REQUIRED_FAQ_HREFS = [
  '/glossary',
  '/compare',
  '/benchmarks',
  '/results',
  '/calculator',
  '/start',
  '/harnesses',
  '/backends',
  '/rocm-problems',
  '/bios',
  '/flash-ram-offload',
  '/stack-lab',
  '/recipes/qwen36-35b.llamacpp-vulkan.262k',
  '/gpus/r9700',
  '/about',
  '/methodology',
  '/contact',
  '/disclosure',
  '/rss.xml',
  '/budget',
  '/multi-gpu',
  '/amdai-bench',
] as const;

const BANNED_VISIBLE = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function faqPlainAnswer(item: FaqItem): string {
  const see = item.links.map((link) => link.label).join(', ');
  return see ? `${item.answer} See ${see}.` : item.answer;
}

export function faqHaystack(item: FaqItem): string {
  const group = FAQ_GROUPS.find((row) => row.id === item.group);
  return [item.id, item.question, item.answer, group?.label, group?.description, ...item.links.map((link) => `${link.label} ${link.href}`)]
    .join(' ')
    .toLowerCase();
}

export function parseFaqQuery(raw: string | URLSearchParams): string {
  const q = typeof raw === 'string' ? new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : raw).get('q') : raw.get('q');
  return (q ?? '').trim();
}

export function filterFaq(query: string, items: FaqItem[] = FAQ_ENTRIES): FaqItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => faqHaystack(item).includes(q));
}

export function groupFaq(items: FaqItem[] = FAQ_ENTRIES): { group: (typeof FAQ_GROUPS)[number]; items: FaqItem[] }[] {
  return FAQ_GROUPS.map((group) => ({
    group,
    items: items.filter((item) => item.group === group.id),
  })).filter((row) => row.items.length > 0);
}

export function assertFaqValid(items: FaqItem[] = FAQ_ENTRIES): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const questions = new Set<string>();
  const hrefs = new Set<string>();
  const blob = items.map((item) => `${item.question} ${item.answer} ${item.links.map((link) => link.href).join(' ')}`).join('\n');
  if (items.length < 16) errors.push(`expected at least 16 questions, got ${items.length}`);
  for (const group of FAQ_GROUPS) {
    const count = items.filter((item) => item.group === group.id).length;
    if (count < 2) errors.push(`${group.id} needs at least 2 questions`);
  }
  for (const item of items) {
    if (ids.has(item.id)) errors.push(`duplicate id ${item.id}`);
    ids.add(item.id);
    if (questions.has(item.question)) errors.push(`duplicate question ${item.question}`);
    questions.add(item.question);
    if (item.answer.length < 40) errors.push(`${item.id} answer too short`);
    if (!item.links.length) errors.push(`${item.id} has no links`);
    if (BANNED_VISIBLE.test(`${item.question} ${item.answer}`)) errors.push(`${item.id} banned model`);
    if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
    if (item.id !== 'why-no-q1-q2' && Q1Q2.test(item.answer)) errors.push(`${item.id} lists Q1/Q2`);
    if (item.id === 'when-is-q3-an-estimate') {
      if (!item.answer.includes(COMPARE_Q3)) errors.push('Q3 estimate missing UD-Q3_K_XL');
      if (!/estimate/i.test(item.answer)) errors.push('Q3 must be labeled estimate');
    }
    for (const link of item.links) {
      if (!link.href.startsWith('/') && !link.href.startsWith('http')) errors.push(`${item.id} bad href ${link.href}`);
      hrefs.add(link.href.split('?')[0] ?? link.href);
    }
  }
  for (const required of REQUIRED_FAQ_HREFS) {
    const hit = [...hrefs].some((href) => href === required || href.startsWith(`${required}/`) || href.startsWith(`${required}#`));
    if (!hit) errors.push(`missing required href ${required}`);
  }
  if (BANNED_VISIBLE.test(blob)) errors.push('banned model in FAQ');
  if (/TODO|TBD|FIXME|lorem ipsum/i.test(blob)) errors.push('leftover copy');
  for (const required of [
    'what-is-amdai',
    'measured-vs-estimate',
    'affiliate-links',
    'lab-notes-rss',
    'open-in-stack-lab',
    'llamacpp-vs-strata',
    'min-ram-vs-full-context',
    'when-is-q3-an-estimate',
  ]) {
    if (!items.some((item) => item.id === required)) errors.push(`missing ${required}`);
  }
  const about = items.find((item) => item.id === 'what-is-amdai');
  if (about && !/AMDai/.test(about.answer)) errors.push('what-is-amdai must name AMDai');
  const open = items.find((item) => item.id === 'open-in-stack-lab');
  if (open && !/amdai-stack-lab:/.test(open.answer)) errors.push('Open in Stack Lab must name the documented scheme');
  if (open && !/not published yet/i.test(open.answer)) errors.push('Open in Stack Lab must stay unpublished');
  const ram = items.find((item) => item.id === 'min-ram-vs-full-context');
  if (ram && !ram.answer.includes('Minimum system RAM needed')) errors.push('RAM answer missing min label');
  if (ram && !ram.answer.includes('RAM needed at full context')) errors.push('RAM answer missing full label');
  return [...new Set(errors)];
}
