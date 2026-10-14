/**
 * Cited consumer guide: speed up llama.cpp on Radeon.
 * Reuse /long-context, /multi-gpu, /power, /flash-ram-offload,
 * /backends, /rocm/vulkan-hip, and /stack-lab — do not duplicate them.
 * Measured tok/s come only from existing local-desktop 35B run cards.
 * Q3 is a labeled estimate. Q1/Q2 stay off. Draft models stay Q4+.
 */

import {
  DEFAULT_INPUT,
  applyGpuPreset,
  applyModelPreset,
  systemRamNeed,
  type SystemRamNeed,
} from './calculator';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { officialLinks } from './site';
import { oneVsTwoRows, COMPARE_ENGINE, COMPARE_MODEL, COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';
import type { RunCard } from './run-card';

export const TUNING_PUBLISHED = '2026-10-14';
export const TUNING_CITED_LABEL = 'Cited llama.cpp flags · measured 35B cells only';
export const TUNING_UNMEASURED = 'not measured yet';
export const TUNING_PATH = '/tuning';

export type TuningLink = { href: string; label: string };

export type TuningSource = {
  id: string;
  title: string;
  href: string;
};

export type TuningKnob = {
  id: string;
  title: string;
  flag: string;
  what: string;
  when: string;
  tradeoff: string;
  example: string;
  exampleNote: string;
  stackLab: string;
  links: TuningLink[];
  measured: boolean;
};

export type TuningFaq = {
  id: string;
  question: string;
  answer: string;
  links: TuningLink[];
};

export type TuningQuantRow = {
  quant: string;
  kind: 'measured' | 'q3-estimate';
  decode4k: string;
  decode32k: string;
  note: string;
  runIds: string[];
};

export const TUNING_TITLE = 'Speed up llama.cpp on Radeon';
export const TUNING_DESCRIPTION =
  'Speed up llama.cpp on Radeon. Cited -ngl, threads, batch, -fa, KV, split, draft, power. Measured 35B cells only. Q3 is a labeled estimate.';

export const TUNING_LEAD =
  `These knobs are the ones people actually turn on consumer Radeon. llama.cpp first — Vulkan, then ROCm/HIP when they differ. Strata and vLLM stay on /backends; this page does not retell those stacks. Measured decode is the official local-desktop ${COMPARE_MODEL} ${COMPARE_ENGINE} sweep (UD-Q5_K_XL / Q5_K_M / Q4_K_M / Q6_K). Every other figure is cited to llama.cpp or AMD docs, or labeled ${TUNING_UNMEASURED}. ${COMPARE_Q3} is a labeled estimate (${COMPARE_Q3_CITE}). Q1/Q2 stay off. Draft / speculative models stay Q4 and up.`;

export const LLAMA_CPP = officialLinks.llamaCpp;
export const LLAMA_SERVER = 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md';
export const LLAMA_BENCH = 'https://github.com/ggml-org/llama.cpp/blob/master/tools/llama-bench/README.md';

export const TUNING_SOURCES: TuningSource[] = [
  { id: 'llama', title: 'llama.cpp repository', href: LLAMA_CPP },
  { id: 'server', title: 'llama.cpp server README', href: LLAMA_SERVER },
  { id: 'bench', title: 'llama-bench README', href: LLAMA_BENCH },
  { id: 'vulkan-hip', title: 'AMDai — Vulkan vs HIP', href: '/rocm/vulkan-hip' },
  { id: 'long-context', title: 'AMDai — long context flags', href: '/long-context' },
  { id: 'multi-gpu', title: 'AMDai — dual / multi-GPU', href: '/multi-gpu' },
  { id: 'power', title: 'AMDai — board power and PSU', href: '/power' },
  { id: 'offload', title: 'AMDai — Flash RAM offload', href: '/flash-ram-offload' },
  { id: 'backends', title: 'AMDai — backends', href: '/backends' },
];

export const TUNING_HOUSE_LAUNCH = [
  '# House daily-driver shape — /recipes/qwen36-35b.llamacpp-vulkan.262k',
  './build-vk/bin/llama-server \\',
  '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
  '  -ngl 99 \\',
  '  -c 262144 \\',
  '  --cache-type-k f16 \\',
  '  --cache-type-v f16 \\',
  '  --host 127.0.0.1 --port 8080',
].join('\n');

export const TUNING_KNOBS: TuningKnob[] = [
  {
    id: 'ngl',
    title: 'GPU layers (-ngl)',
    flag: '-ngl / --n-gpu-layers',
    what:
      '-ngl is how many transformer layers llama.cpp tries to keep on the GPU. -ngl 99 is the house “offload what fits” pin: leftover layers spill to system RAM. That is the same meaning already on the Flash RAM offload page and the Offload glossary entry.',
    when:
      'Single card: start at -ngl 99 so the file sits in VRAM when it can. Dual card: still start at -ngl 99, then read --split-mode on Dual / multi-GPU — a second card is a split, not a magic -ngl. Partial -ngl is the 16 GB / 12 GB move when Q4 still spills.',
    tradeoff:
      'More layers on GPU usually means faster decode and less DDR5 traffic. Too many layers on a small card OOMs or silently spills. Spill is system RAM — print both RAM lines below. Quality of the GGUF does not change; speed does. Partial -ngl tok/s is not measured yet on local-desktop except where a card already names --fit-target.',
    example: [
      '# Partial offload shape only — not a measured local-desktop pin.',
      './build-vk/bin/llama-server \\',
      '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
      '  -ngl 20 \\',
      '  -c 4096 \\',
      '  --cache-type-k f16 \\',
      '  --cache-type-v f16 \\',
      '  --host 127.0.0.1 --port 8080',
    ].join('\n'),
    exampleNote:
      'House daily driver on one R9700 uses -ngl 99 and 0% RAM offload. Measure a -ngl ladder on your box with Stack Lab planner and an amdai-bench card.',
    stackLab: 'Stack Lab A/B: partial offload / -ngl ladder. Measure it on your box via /stack-lab planner and /amdai-bench.',
    links: [
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/glossary#offload', label: 'Offload' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
    ],
    measured: false,
  },
  {
    id: 'threads',
    title: 'CPU threads (--threads)',
    flag: '--threads / -t',
    what:
      '--threads sets how many CPU threads llama.cpp uses for work that still runs on the host — leftover layers, some prefill helpers, and tokenization. llama.cpp documents the flag in --help and the server README. We have not measured a thread sweep on local-desktop.',
    when:
      'Single card with the file in VRAM: extra host threads rarely move decode. They matter when -ngl leaves layers on DDR5, or during prefill. Dual card: the host still owns the leftover; do not invent a per-GPU thread pin.',
    tradeoff:
      'Too few threads can stall prefill when RAM offload is in play. Too many fight the GPU for memory bandwidth. Speed vs core count is not measured yet. Quality is unchanged.',
    example: [
      '# Thread count is not measured on local-desktop. Copy nproc and measure.',
      './build-vk/bin/llama-server \\',
      '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
      '  -ngl 99 \\',
      '  -t $(nproc) \\',
      '  -c 4096 \\',
      '  --cache-type-k f16 \\',
      '  --cache-type-v f16 \\',
      '  --host 127.0.0.1 --port 8080',
    ].join('\n'),
    exampleNote: 'Measure CPU threads on your box. Empty cells stay not measured yet.',
    stackLab: 'Stack Lab A/B: CPU threads. Measure it on your box via /stack-lab planner and /amdai-bench.',
    links: [
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/amdai-bench', label: 'amdai-bench' },
    ],
    measured: false,
  },
  {
    id: 'threads-batch',
    title: 'Batch threads (--threads-batch)',
    flag: '--threads-batch',
    what:
      '--threads-batch is the host thread count for prompt / batch (prefill) work. llama.cpp lists it next to --threads. Prefill and decode are different jobs — the Prefill vs decode glossary entry already says so. We have not measured a --threads-batch sweep on local-desktop.',
    when:
      'Single card: try it when prefill feels stuck and rocm-smi / amd-smi shows the GPU idle while the GGUF is on NVMe — check the disk first (glossary). Dual card: same host flag; do not invent a per-GPU batch-thread split.',
    tradeoff:
      'More batch threads can help prefill when layers sit in RAM. They can also steal bandwidth from decode. Prefill tok/s vs --threads-batch is not measured yet. Quality is unchanged.',
    example: [
      '# Prefill thread pin is not measured on local-desktop.',
      './build-vk/bin/llama-server \\',
      '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
      '  -ngl 99 \\',
      '  -t $(nproc) \\',
      '  --threads-batch $(nproc) \\',
      '  -c 4096 \\',
      '  --cache-type-k f16 \\',
      '  --cache-type-v f16 \\',
      '  --host 127.0.0.1 --port 8080',
    ].join('\n'),
    exampleNote: 'Measure prefill tuning on your box. Do not copy a prefill figure we did not record.',
    stackLab: 'Stack Lab A/B: prefill tuning. Measure it on your box via /stack-lab planner and /amdai-bench.',
    links: [
      { href: '/glossary#prefill-decode', label: 'Prefill vs decode' },
      { href: '/long-context', label: 'Long context' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
    measured: false,
  },
  {
    id: 'batch',
    title: 'Batch sizes (-b / -ub)',
    flag: '-b / --batch-size and -ub / --ubatch-size',
    what:
      '-b is the logical batch (how much prompt llama.cpp plans for). -ub is the physical micro-batch that actually hits the GPU. llama.cpp documents both. Overnight 35B llama-bench cards record their own bench line — they are not a llama-server -b pin we will invent.',
    when:
      'Single card: raise batch only after the file fits. Dual card: batch still lives on the process; split-mode decides which GPU sees the layers. Long prompts at 128K–262K are a KV problem first — read Long context.',
    tradeoff:
      'Larger batch can raise prefill and VRAM. Smaller batch can fit a tight card and slow prefill. Batch vs tok/s is not measured yet on local-desktop llama-server. Quality is unchanged if the GGUF stays the same.',
    example: [
      '# Example values from llama.cpp --help — not a local-desktop pin.',
      './build-vk/bin/llama-server \\',
      '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
      '  -ngl 99 \\',
      '  -b 2048 \\',
      '  -ub 512 \\',
      '  -c 4096 \\',
      '  --cache-type-k f16 \\',
      '  --cache-type-v f16 \\',
      '  --host 127.0.0.1 --port 8080',
    ].join('\n'),
    exampleNote: 'Copy from llama.cpp --help, then measure. Empty prefill cells stay not measured yet.',
    stackLab: 'Stack Lab A/B: prefill tuning. Measure it on your box via /stack-lab planner and /amdai-bench.',
    links: [
      { href: '/long-context', label: 'Long context' },
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
    measured: false,
  },
  {
    id: 'fa',
    title: 'Flash attention (-fa)',
    flag: '-fa / --flash-attn',
    what:
      'Flash attention is a fused attention kernel. Overnight 35B llama-bench cards recorded -fa 1. The Long context page already cites that line and warns that llama-server flags are not on that card — copy -fa only when your build documents it.',
    when:
      'Single card: keep -fa 1 when the measured 35B recipe’s build supports it. Dual card: the split cards used the same bench family; do not invent a per-GPU -fa off switch. If your Vulkan or HIP build rejects -fa, leave it off and record the card.',
    tradeoff:
      'When it works, flash attention usually cuts attention VRAM and can help long context. Quality and tok/s for -fa 0 vs -fa 1 on llama-server are not measured yet. Do not invent a 262K delta.',
    example: [
      '# -fa 1 is on the overnight llama-bench line. Server pin is not recorded.',
      './build-vk/bin/llama-server \\',
      '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
      '  -ngl 99 \\',
      '  -fa 1 \\',
      '  -c 4096 \\',
      '  --cache-type-k f16 \\',
      '  --cache-type-v f16 \\',
      '  --host 127.0.0.1 --port 8080',
    ].join('\n'),
    exampleNote: 'Read Long context before you treat -fa as a server pin. Measure if your build differs.',
    stackLab: 'Stack Lab A/B: prefill tuning / long-context. Measure it on your box via /stack-lab planner and /amdai-bench.',
    links: [
      { href: '/long-context', label: 'Long context' },
      { href: '/results', label: 'Run cards' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
    measured: true,
  },
  {
    id: 'kv',
    title: 'KV cache type (f16 vs q8_0)',
    flag: '--cache-type-k / --cache-type-v',
    what:
      'KV cache is the per-token memory that grows with context. House default is f16 — overnight 35B cards recorded -ctk f16 -ctv f16. q8_0 is the smaller KV type the calculator already lists. Quality and tok/s for q8_0 KV are not measured yet (same sentence as Long context).',
    when:
      'Single card: stay on f16 for the house 35B daily driver. Switch to q8_0 only when 32K–262K KV is the thing that spills — size it on the calculator first. Dual card: KV still grows; split does not delete it. Read Long context for 128K–262K.',
    tradeoff:
      'q8_0 KV uses less VRAM and can raise the context you fit. It is a quality and speed unknown on local-desktop. f16 is the measured house default. When KV or weights spill, both RAM lines below apply.',
    example: [
      '# q8_0 KV is listed on the calculator — not measured on local-desktop.',
      './build-vk/bin/llama-server \\',
      '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
      '  -ngl 99 \\',
      '  -c 32768 \\',
      '  --cache-type-k q8_0 \\',
      '  --cache-type-v q8_0 \\',
      '  --host 127.0.0.1 --port 8080',
    ].join('\n'),
    exampleNote: 'House cards stay f16. q8_0 quality and decode stay not measured yet.',
    stackLab: 'Stack Lab A/B: prefill / context. Measure q8_0 KV on your box via /stack-lab planner and /amdai-bench.',
    links: [
      { href: '/kv-cache', label: 'KV cache' },
      { href: '/long-context', label: 'Long context' },
      { href: '/quants', label: 'KV types' },
      { href: '/calculator', label: 'Calculator' },
    ],
    measured: true,
  },
  {
    id: 'split',
    title: 'Multi-GPU (--split-mode / --tensor-split)',
    flag: '--split-mode / -sm and --tensor-split / -ts',
    what:
      '--split-mode layer (short -sm layer) is the documented llama.cpp multi-GPU default and the overnight 35B split on local-desktop. --split-mode row and --tensor-split are documented and not measured on local-desktop. Dual / multi-GPU already walks those flags — this page does not retell that guide.',
    when:
      'Single card: skip these flags. Dual card: start at --split-mode layer only after you decide the file cannot stay on one GPU. One R9700 usually decodes the house 35B faster than the split — that comparison lives on One vs two GPUs.',
    tradeoff:
      'A split can load a file that one card cannot. It can also slow decode versus one card that already fits. --tensor-split ratios are not a house pin. Quality of the GGUF is unchanged. Speed of row split is not measured yet.',
    example: [
      '# Overnight 35B split used -sm layer. Do not invent a -ts pair.',
      './build-vk/bin/llama-server \\',
      '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
      '  -ngl 99 \\',
      '  --split-mode layer \\',
      '  -c 4096 \\',
      '  --cache-type-k f16 \\',
      '  --cache-type-v f16 \\',
      '  --host 127.0.0.1 --port 8080',
    ].join('\n'),
    exampleNote: 'Read Dual / multi-GPU and One vs two GPUs before you split a file that already fits one card.',
    stackLab: 'Stack Lab A/B: multi-GPU. Measure it on your box via /stack-lab planner and /amdai-bench.',
    links: [
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
      { href: '/qwen36-dual', label: '35B on two cards' },
    ],
    measured: true,
  },
  {
    id: 'speculative',
    title: 'Speculative decoding / draft models',
    flag: '-md / --model-draft (server README)',
    what:
      'Speculative decoding runs a smaller draft model ahead of the target and accepts matching tokens. llama.cpp documents draft models on the server README. AMDai has not measured a draft pair on local-desktop. Draft GGUFs stay Q4 and up — Q3 draft is a labeled estimate and not a house pick. Q1/Q2 drafts stay off, including MTP heads.',
    when:
      'Single card: only if both files fit, or the draft is the thing you are willing to spill. Dual card: do not invent a “draft on GPU 1, target on GPU 2” pin we did not record. Same-family drafts only. The house ban list still applies.',
    tradeoff:
      'A good draft can raise decode. A bad draft wastes VRAM and can lose. Draft tok/s is not measured yet. Quality of accepted tokens depends on the draft — we do not invent an accept-rate. Size both files on the calculator.',
    example: [
      '# Shape only — draft decode is not measured on local-desktop. Draft stays Q4+.',
      './build-vk/bin/llama-server \\',
      '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
      '  -md ~/models/draft-Q4_K_M.gguf \\',
      '  -ngl 99 \\',
      '  -c 4096 \\',
      '  --cache-type-k f16 \\',
      '  --cache-type-v f16 \\',
      '  --host 127.0.0.1 --port 8080',
    ].join('\n'),
    exampleNote:
      'Pick a real Q4+ draft of the same family from the model card. Do not invent a filename or a speed. Measure on your box.',
    stackLab: 'Stack Lab A/B: speculative decoding. Measure it on your box via /stack-lab planner and /amdai-bench.',
    links: [
      { href: '/speculative-decoding', label: 'Speculative decoding' },
      { href: '/quants', label: 'Quants' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/amdai-bench', label: 'amdai-bench' },
    ],
    measured: false,
  },
  {
    id: 'power',
    title: 'GPU power cap',
    flag: 'vendor power cap (amd-smi / board tool)',
    what:
      'A power cap limits board watts below AMD’s published TBP. The Power guide already cites TBP and PSU minimums. This site does not invent an amd-smi set-power command or a tok/s-per-watt. amd-smi is the successor to rocm-smi on the cited ROCm 10.1 row.',
    when:
      'Single card: cap only if the room, PSU, or noise needs it — read /power first. Dual card: two TBP numbers are not a dual-card PSU SKU we invent. Decode vs watts is not measured yet on local-desktop.',
    tradeoff:
      'A lower cap can cut heat and fan noise. It can also cut clocks and decode. We do not invent either delta. TBP stays the AMD product-page cite.',
    example: [
      '# No house watt-cap command. Read /power, then your vendor tool.',
      '# amd-smi is the cited successor to rocm-smi. Do not invent a set flag.',
      './build-vk/bin/llama-server \\',
      '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
      '  -ngl 99 \\',
      '  -c 4096 \\',
      '  --cache-type-k f16 \\',
      '  --cache-type-v f16 \\',
      '  --host 127.0.0.1 --port 8080',
    ].join('\n'),
    exampleNote: 'Measure power and efficiency on your box. Empty watts-per-token cells stay not measured yet.',
    stackLab: 'Stack Lab A/B: power and efficiency. Measure it on your box via /stack-lab planner, /power, and /amdai-bench.',
    links: [
      { href: '/power', label: 'Power and PSU' },
      { href: '/hardware', label: 'Hardware' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
    ],
    measured: false,
  },
  {
    id: 'vulkan-hip',
    title: 'Vulkan vs ROCm / HIP',
    flag: 'build-vk vs build-hip (not a runtime flag)',
    what:
      'Vulkan llama.cpp is the consumer default. HIP is the ROCm path when rocminfo lists the gfx. Vulkan vs HIP already explains the split. Overnight 35B house cards are llama.cpp Vulkan. HIP decode for that sweep is not measured yet.',
    when:
      'Single card: start Vulkan. Switch to HIP only after rocminfo lists the gfx and Vulkan is the thing you are A/B-ing. Dual card: do not mix Vulkan and HIP in one process. Strata / vLLM stay on /backends.',
    tradeoff:
      'Vulkan is the measured house path. HIP can be faster or angrier depending on the gfx pin — we do not invent that delta. Same GGUF, same quality, different backend.',
    example: [
      '# HIP shape only — house 35B cards are Vulkan. HIP decode is not measured yet.',
      '# After rocminfo lists gfx1201:',
      './build-hip/bin/llama-server \\',
      '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
      '  -ngl 99 \\',
      '  -c 4096 \\',
      '  --cache-type-k f16 \\',
      '  --cache-type-v f16 \\',
      '  --host 127.0.0.1 --port 8080',
    ].join('\n'),
    exampleNote: 'Measure Vulkan vs ROCm on your box. Do not copy a HIP tok/s from this page.',
    stackLab: 'Stack Lab A/B: Vulkan vs ROCm backend. Measure it on your box via /stack-lab planner, /rocm/vulkan-hip, and /amdai-bench.',
    links: [
      { href: '/compare/vulkan-vs-rocm', label: 'Vulkan vs ROCm' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/backends', label: 'Backends' },
      { href: '/setup', label: 'First-run setup' },
    ],
    measured: false,
  },
];

export const TUNING_FAQ: TuningFaq[] = [
  {
    id: 'where-do-i-start',
    question: 'Which knob should I turn first?',
    answer:
      'Fit the file. House daily driver is Qwen3.6-35B-A3B UD-Q5_K_XL, -ngl 99, f16 KV, llama.cpp Vulkan. If it spills, read Flash RAM offload and the RAM lines on this page. Then measure one knob at a time with amdai-bench. Do not stack five unmeasured flags.',
    links: [
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/amdai-bench', label: 'amdai-bench' },
    ],
  },
  {
    id: 'why-not-strata',
    question: 'Will Strata or vLLM be faster?',
    answer:
      'Maybe for a different job. This page is llama.cpp. Strata is the house Flash try. vLLM is a multi-client serve try. Both live on /backends. We do not invent a 35B vLLM or Strata decode here.',
    links: [
      { href: '/backends', label: 'Backends' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/backends/strata', label: 'Strata' },
    ],
  },
  {
    id: 'draft-q3',
    question: 'Can the draft model be Q3?',
    answer: `${COMPARE_Q3} may appear as a labeled estimate (${COMPARE_Q3_CITE}). Draft / speculative models on this site stay Q4 and up. Q3 draft is an estimate, not a house pick. Q1/Q2 drafts stay off.`,
    links: [
      { href: '/quants', label: 'Quants' },
      { href: '/compare/q4-q5-q6', label: 'Q6 / Q5 / Q4 + Q3 estimate' },
    ],
  },
  {
    id: 'structured-json',
    question: 'How do I force valid JSON from llama.cpp?',
    answer:
      'That is constrained decoding, not a speed knob. Official --grammar / --json-schema and response_format live on /constrained-decoding. Grammar decode versus free-form is not measured on local-desktop — run Stack Lab grammar-ab/1.',
    links: [
      { href: '/constrained-decoding', label: 'Constrained decoding' },
      { href: '/setup/coding-assistant', label: 'Coding assistant' },
      { href: '/stack-lab', label: 'Stack Lab' },
    ],
  },
];

export const TUNING_SECTIONS = [
  { id: 'measured', label: 'Measured 35B' },
  { id: 'house', label: 'House launch' },
  ...TUNING_KNOBS.map((knob) => ({ id: knob.id, label: knob.title })),
  { id: 'ram', label: 'System RAM' },
  { id: 'faq', label: 'FAQ' },
  { id: 'sources', label: 'Sources' },
] as const;

export const TUNING_HUB_LINKS: TuningLink[] = [
  { href: '/speculative-decoding', label: 'Speculative decoding' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/kv-cache', label: 'KV cache' },
  { href: '/constrained-decoding', label: 'Constrained decoding' },
  { href: '/thinking', label: 'Thinking mode' },
  { href: '/long-context', label: 'Long context' },
  { href: '/multi-gpu', label: 'Dual / multi-GPU' },
  { href: '/power', label: 'Power' },
  { href: '/flash-ram-offload', label: 'Flash RAM offload' },
  { href: '/compare/vulkan-vs-rocm', label: 'Vulkan vs ROCm' },
  { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
  { href: '/stack-lab', label: 'Stack Lab' },
  { href: '/amdai-bench', label: 'amdai-bench' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/calculator', label: 'Calculator' },
];

export const REQUIRED_TUNING_HREFS = [
  '/speculative-decoding',
  '/kv-cache',
  '/long-context',
  '/multi-gpu',
  '/power',
  '/flash-ram-offload',
  '/backends',
  '/backends/llamacpp',
  '/compare/vulkan-vs-rocm',
  '/rocm/vulkan-hip',
  '/stack-lab',
  '/amdai-bench',
  '/benchmarks',
  '/results',
  '/calculator',
  '/quants',
  '/compare/one-vs-two-gpu',
  '/compare/q4-q5-q6',
  '/recipes/qwen36-35b.llamacpp-vulkan.262k',
  '/gpus/r9700',
  '/faq',
  '/constrained-decoding',
] as const;

export function tuningOffloadRamNeed(): SystemRamNeed {
  let input = applyGpuPreset('rx7800xt', { ...DEFAULT_INPUT, ramGb: 256, view: 'gpu' });
  input = applyModelPreset('qwen36', input);
  return systemRamNeed({
    ...input,
    gpuId: 'rx7800xt',
    quantId: 'q4_k_m',
    context: 32768,
    kvId: 'f16',
    backendId: 'llamacpp',
    pathId: 'vulkan',
    gpuCount: 1,
    split: false,
    fileWeightGiB: null,
  });
}

export const TUNING_RAM_NOTE =
  `When -ngl leaves layers on the host, the spill is system RAM. Shopper lines stay ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL} for house 35B Q4_K_M on a 16 GB RX 7800 XT at 32K selected and the model’s full context. Estimate unless a measured R9700 card overlays the kit. The house daily driver on one R9700 at UD-Q5_K_XL does not offload.`;

export function tuningMeasuredRows(cards: RunCard[]): TuningQuantRow[] {
  const table = oneVsTwoRows(cards);
  const quants = ['Q6_K', 'UD-Q5_K_XL', 'Q5_K_M', 'Q4_K_M'] as const;
  const rows: TuningQuantRow[] = quants.map((quant) => {
    const at4k = table.find((row) => row.quant === quant && row.context === 4096);
    const at32k = table.find((row) => row.quant === quant && row.context === 32768);
    const decode4k = at4k?.one.decode ?? TUNING_UNMEASURED;
    const decode32k = at32k?.one.decode ?? TUNING_UNMEASURED;
    const runIds = [...new Set([...(at4k?.one.runIds ?? []), ...(at32k?.one.runIds ?? [])])];
    return {
      quant,
      kind: 'measured',
      decode4k,
      decode32k,
      note: 'Official local-desktop llama.cpp Vulkan, one R9700.',
      runIds,
    };
  });
  rows.push({
    quant: COMPARE_Q3,
    kind: 'q3-estimate',
    decode4k: TUNING_UNMEASURED,
    decode32k: TUNING_UNMEASURED,
    note: `${COMPARE_Q3_CITE}. Q3 is a labeled estimate — not a local-desktop run.`,
    runIds: [],
  });
  return rows;
}

export const TUNING_HOWTO_STEPS = TUNING_KNOBS.map((knob) => ({
  name: knob.title,
  text: `${knob.what} ${knob.when} ${knob.tradeoff}`,
}));

export function tuningBlob(): string {
  return [
    TUNING_TITLE,
    TUNING_DESCRIPTION,
    TUNING_LEAD,
    TUNING_CITED_LABEL,
    TUNING_UNMEASURED,
    TUNING_HOUSE_LAUNCH,
    TUNING_RAM_NOTE,
    ...TUNING_KNOBS.map(
      (knob) =>
        `${knob.title} ${knob.flag} ${knob.what} ${knob.when} ${knob.tradeoff} ${knob.example} ${knob.stackLab} ${knob.links.map((link) => link.href).join(' ')}`,
    ),
    ...TUNING_FAQ.map((row) => `${row.question} ${row.answer} ${row.links.map((link) => link.href).join(' ')}`),
    ...TUNING_HUB_LINKS.map((link) => link.href),
    ...TUNING_SOURCES.map((source) => source.href),
    COMPARE_Q3,
    COMPARE_Q3_CITE,
    RAM_MIN_LABEL,
    RAM_FULL_LABEL,
  ].join('\n');
}

export function tuningHrefs(): string[] {
  const links: TuningLink[] = [
    ...TUNING_HUB_LINKS,
    ...TUNING_KNOBS.flatMap((knob) => knob.links),
    ...TUNING_FAQ.flatMap((row) => row.links),
    ...TUNING_SOURCES.map((source) => ({ href: source.href, label: source.title })),
    { href: '/gpus/r9700', label: 'R9700' },
    { href: '/compare/q4-q5-q6', label: 'Q6 Q5 Q4' },
    { href: '/faq', label: 'FAQ' },
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertTuningValid(cards: RunCard[] = []): string[] {
  const errors: string[] = [];
  const blob = tuningBlob();
  const hrefs = new Set(tuningHrefs());
  if (TUNING_DESCRIPTION.length < 70 || TUNING_DESCRIPTION.length > 160) errors.push('description length');
  if (TUNING_KNOBS.length < 9) errors.push('missing knobs');
  for (const id of ['ngl', 'threads', 'threads-batch', 'batch', 'fa', 'kv', 'split', 'speculative', 'power', 'vulkan-hip']) {
    if (!TUNING_KNOBS.some((knob) => knob.id === id)) errors.push(`missing knob ${id}`);
  }
  if (!/llama\.cpp/i.test(blob)) errors.push('must keep llama.cpp first');
  if (!/llama-server/.test(blob)) errors.push('must cite llama-server');
  if (!/-ngl/.test(blob) || !/--threads/.test(blob) || !/--threads-batch/.test(blob)) {
    errors.push('must name thread and ngl flags');
  }
  if (!/-b /.test(blob) || !/-ub /.test(blob)) errors.push('must name batch flags');
  if (!/-fa 1/.test(blob)) errors.push('must cite -fa 1');
  if (!/--cache-type-k/.test(blob) || !/q8_0/.test(blob)) errors.push('must cite KV types');
  if (!/--split-mode layer/.test(blob) || !/--tensor-split/.test(blob)) errors.push('must cite split flags');
  if (!/-md /.test(blob)) errors.push('must show a draft flag');
  if (!/Q4 and up/.test(blob) && !/Q4\+/.test(blob)) errors.push('draft must stay Q4+');
  if (!/Q6_K/.test(blob) || !/Q5_K_M/.test(blob) || !/Q4_K_M/.test(blob)) errors.push('must list Q6/Q5/Q4');
  if (!blob.includes(COMPARE_Q3)) errors.push('must list Q3 estimate');
  if (!/labeled estimate/.test(blob)) errors.push('Q3 must stay a labeled estimate');
  if (!/Vulkan/.test(blob) || !/HIP/.test(blob)) errors.push('must name Vulkan and HIP');
  if (!blob.includes('/backends')) errors.push('must link /backends');
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (/\b\d+(?:\.\d+)?\s*tok\/s\b/i.test(blob)) errors.push('tok/s must come from the measured table, not lib copy');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('RAM lines missing');
  if (!blob.includes(TUNING_UNMEASURED)) errors.push('must label unmeasured knobs');
  const ram = tuningOffloadRamNeed();
  if (ram.atSelected.label !== 'estimate') errors.push('16 GB Q4 RAM must stay estimate');
  for (const required of REQUIRED_TUNING_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  if (cards.length) {
    const rows = tuningMeasuredRows(cards);
    if (rows.length !== 5) errors.push('measured table must be Q6/Q5xl/Q5/Q4 + Q3');
    const q3 = rows.find((row) => row.kind === 'q3-estimate');
    if (!q3 || q3.decode4k !== TUNING_UNMEASURED) errors.push('Q3 row must stay unmeasured');
    const q5 = rows.find((row) => row.quant === 'UD-Q5_K_XL');
    if (!q5 || q5.decode4k === TUNING_UNMEASURED) errors.push('UD-Q5_K_XL 4K must stay a measured cell');
    if (!/tok\/s/.test(q5?.decode4k ?? '')) errors.push('measured cell must keep tok/s from the card');
    for (const row of rows) {
      if (row.kind === 'measured' && row.decode4k !== TUNING_UNMEASURED && !row.runIds.length) {
        errors.push(`${row.quant} measured cell missing run ids`);
      }
    }
  }
  return [...new Set(errors)];
}

export { COMPARE_Q3, COMPARE_Q3_CITE, COMPARE_MODEL, RAM_FULL_LABEL, RAM_MIN_LABEL };
