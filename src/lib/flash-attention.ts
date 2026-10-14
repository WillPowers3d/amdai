/**
 * Cited llama.cpp Flash Attention (-fa) on Radeon.
 * Official: CLI -fa / --flash-attn [on|off|auto] (default auto);
 * multi-gpu.md requires FA for --split-mode tensor and/or quantized V cache.
 * Overnight 35B Vulkan llama-bench recorded -fa 1. llama-server FA on/off
 * deltas stay not measured. Stack Lab ships a Flash Attention A/B and a
 * Prefill tuning A/B — cite those names, do not invent a pack id or tok/s.
 * No invented watts or acceptance rates. llama.cpp Vulkan first.
 */

import { officialLinks } from './site';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';

export const FA_PATH = '/flash-attention';
export const FA_PUBLISHED = '2026-10-14';
export const FA_CITED_LABEL = 'Cited llama.cpp --flash-attn · llama-server FA on/off not measured';
export const FA_AB = 'Flash Attention A/B';
export const FA_PREFILL_AB = 'Prefill tuning A/B';
export const FA_UNMEASURED = 'not measured yet — run Stack Lab Flash Attention A/B';

export const FA_TITLE = 'Flash Attention (-fa) on Radeon';
export const FA_DESCRIPTION =
  'Flash Attention (-fa) on a Radeon GPU with llama.cpp. Cited on|off|auto. Overnight -fa 1. Server FA deltas not measured. Q3 is a labeled estimate.';

export const FA_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';
export const FA_PORT = 8080;
export const FA_RAM_4K = 37.32;
export const FA_RAM_256K = 42.9;
export const FA_KIT_GB = 64;
export const FA_VRAM_4K = 25.97;
export const FA_VRAM_256K = 29.34;
export const FA_DECODE_4K = 102.39;
export const FA_HOUSE_BENCH =
  '-dev Vulkan1 -sm layer -ngl 99 -fitt 1024 -fa 1 -ctk f16 -ctv f16';

export const LLAMA_CLI_README = 'https://github.com/ggml-org/llama.cpp/blob/HEAD/tools/cli/README.md';
export const LLAMA_MULTI_GPU_MD = 'https://github.com/ggml-org/llama.cpp/blob/master/docs/multi-gpu.md';
export const LLAMA_SERVER_README = 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md';

export type FaLink = { href: string; label: string };

export type FaSource = {
  id: string;
  title: string;
  href: string;
  official: boolean;
};

export type FaFaq = {
  id: string;
  question: string;
  answer: string;
  links: FaLink[];
};

export type FaStep = {
  id: string;
  title: string;
  body: string;
  links: FaLink[];
};

export type FaQuantRow = {
  quant: string;
  file: string;
  note: string;
  estimate: boolean;
};

export const FA_LEAD = `
  Shoppers search llama.cpp flash attention AMD, -fa Vulkan, and flash attn
  ROCm. Official llama.cpp -fa / --flash-attn is on|off|auto (default auto;
  env LLAMA_ARG_FLASH_ATTN). Overnight house 35B Vulkan llama-bench cards
  recorded -fa 1 on ${FA_HOUSE_FILE}, one R9700, f16 KV. That line is already
  on the cards — do not treat ${FA_DECODE_4K} tok/s at 4K as an FA-off
  baseline. llama-server FA on versus off stays ${FA_UNMEASURED}. Stack Lab
  ships a ${FA_AB} (on vs off) and a ${FA_PREFILL_AB} that includes FA, with
  decode, prefill, peak VRAM per card, and total / peak system RAM on one
  GPU and on all GPUs. Those packs are not allowlisted Open-in-Stack-Lab
  deep links — open the planner, then record a card. House recipes stay Q4
  and up. ${COMPARE_Q3} is a labeled estimate (${COMPARE_Q3_CITE}) — do not
  download Q3 to run. Q1/Q2 stay off. HIP / ROCm is the cited second compile.
`.replace(/\s+/g, ' ').trim();

export const FA_WHAT = `
  Flash attention is a fused attention kernel. Official CLI values are on,
  off, or auto (default auto). Overnight house llama-bench used the numeric
  form -fa 1. Copy -fa on or -fa 1 when your Vulkan or HIP build documents
  it. If the build rejects the flag, leave it off and record the card.
  llama.cpp multi-gpu.md requires flash attention when using --split-mode
  tensor and/or a quantized V cache. Tensor mode hard-errors if FA is off.
  House overnight used --split-mode layer and f16 KV, so that requirement
  did not apply to the recorded 35B line.
`.replace(/\s+/g, ' ').trim();

export const FA_KV = `
  House default is f16 KV: overnight cards recorded -ctk f16 -ctv f16
  (same as --cache-type-k f16 --cache-type-v f16). q8_0 and q4_0 shrink the
  estimated cache. llama.cpp multi-gpu.md requires FA for a quantized V
  cache — turn -fa on before you try -ctv q8_0 or -ctv q4_0. Quality and
  tok/s for q8_0 / q4_0 KV stay not measured yet. Do not confuse a KV type
  with a weight quant. Overnight peak VRAM on UD-Q5 is ${FA_VRAM_4K} GB at
  4K and ${FA_VRAM_256K} GB at 256K — those cards already have -fa 1.
`.replace(/\s+/g, ' ').trim();

export const FA_BACKENDS = `
  Vulkan is the house path. The recorded overnight line is llama.cpp
  Vulkan: ${FA_HOUSE_BENCH}. llama.cpp documents the same -fa /
  --flash-attn and --cache-type-k/v flags on the HIP / ROCm compile. HIP
  FA on versus off for the house 35B sweep stays not measured on local-desktop.
  Do not invent a HIP flash-attn delta, a watt figure, or an acceptance
  rate. If a Vulkan or HIP build rejects -fa, leave it off and record
  the card.
`.replace(/\s+/g, ' ').trim();

export const FA_TRADEOFF = `
  When it works, flash attention usually cuts attention VRAM and can help
  long context. AMDai has not measured llama-server FA on versus off, so
  every server decode, prefill, VRAM, and RAM delta stays ${FA_UNMEASURED}.
  Stack Lab’s ${FA_AB} records those cells on one GPU and on all GPUs.
  The ${FA_PREFILL_AB} includes FA among the prefill knobs. Do not copy
  the overnight ${FA_DECODE_4K} tok/s 4K UD-Q5 cell as an FA-off figure.
`.replace(/\s+/g, ' ').trim();

export const FA_RAM = `
  ${RAM_MIN_LABEL} on one R9700 with the house UD-Q5 is a ${FA_KIT_GB} GB
  kit from the measured ${FA_RAM_4K} GB peak at 4K (weights + KV +
  overhead on GPU RAM plus total system DDR — not a file-cache versus
  anonymous split). ${RAM_FULL_LABEL} uses the measured ${FA_RAM_256K} GB
  peak at 256K. Those are llama-bench cards with -fa 1, one client, 0%
  RAM offload. They are not an FA-off measurement. ${COMPARE_Q3} is a
  labeled estimate. Do not download Q3 to run.
`.replace(/\s+/g, ' ').trim();

export const FA_BENCH = `# Overnight 35B llama-bench recorded this Vulkan line (not llama-server).
# Official CLI: -fa / --flash-attn [on|off|auto] (default auto).
./build-vk/bin/llama-bench \\
  -m /path/to/nvme/${FA_HOUSE_FILE} \\
  ${FA_HOUSE_BENCH}`;

export const FA_SERVER = `# llama-server FA on/off is not on the overnight card.
# Official values: on | off | auto (default auto; env LLAMA_ARG_FLASH_ATTN).
# Copy -fa on when your build documents it. House recipes stay Q4 and up.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${FA_HOUSE_FILE} \\
  -ngl 99 -c 262144 -fa on \\
  --cache-type-k f16 --cache-type-v f16 --jinja \\
  --host 127.0.0.1 --port ${FA_PORT}`;

export const FA_SOURCES: FaSource[] = [
  {
    id: 'llama-cli',
    title: 'llama.cpp — CLI README (-fa / --flash-attn on|off|auto)',
    href: LLAMA_CLI_README,
    official: true,
  },
  {
    id: 'llama-multi-gpu',
    title: 'llama.cpp — multi-gpu.md (FA required for tensor split and/or quantized V cache)',
    href: LLAMA_MULTI_GPU_MD,
    official: true,
  },
  {
    id: 'llama-server',
    title: 'llama.cpp — llama-server README',
    href: LLAMA_SERVER_README,
    official: true,
  },
  {
    id: 'llama-repo',
    title: 'llama.cpp repository',
    href: officialLinks.llamaCpp,
    official: true,
  },
  {
    id: 'qwen36',
    title: 'Qwen3.6-35B-A3B official model card',
    href: officialLinks.qwen36,
    official: true,
  },
];

export const FA_QUANTS: FaQuantRow[] = [
  {
    quant: 'Q6_K',
    file: 'Qwen3.6-35B-A3B-Q6_K.gguf',
    note: 'Overnight one-client llama-bench exists with -fa 1. llama-server FA on/off stays not measured yet.',
    estimate: false,
  },
  {
    quant: 'UD-Q5_K_XL',
    file: FA_HOUSE_FILE,
    note: `House file. One-client ${FA_DECODE_4K} tok/s at 4K is llama-bench with -fa 1, not an FA-off A/B.`,
    estimate: false,
  },
  {
    quant: 'Q4_K_M',
    file: 'Qwen3.6-35B-A3B-Q4_K_M.gguf',
    note: 'Overnight one-client llama-bench exists with -fa 1. Recommended floor for house recipes. FA on/off still needs a Flash Attention A/B card.',
    estimate: false,
  },
  {
    quant: COMPARE_Q3,
    file: 'Qwen3.6-35B-A3B-UD-Q3_K_XL.gguf',
    note: `Labeled estimate (${COMPARE_Q3_CITE}). Do not download Q3 to run. Q3 does not buy flash attention.`,
    estimate: true,
  },
];

export const FA_STEPS: FaStep[] = [
  {
    id: 'house-pin',
    title: 'Keep the house Vulkan pin with -fa 1',
    body: `Vulkan llama.cpp, ${FA_HOUSE_FILE}, -c 262144, f16 KV, -fa 1 (or -fa on). That matches the overnight llama-bench line. Q6/Q5/Q4 first. House recipes stay Q4 and up. ${COMPARE_Q3} is a labeled estimate — do not download it to run.`,
    links: [
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/models/qwen36', label: 'Qwen3.6-35B' },
    ],
  },
  {
    id: 'on-off-auto',
    title: 'Use on, off, or auto — default is auto',
    body: 'Official CLI is -fa / --flash-attn [on|off|auto] (default auto; env LLAMA_ARG_FLASH_ATTN). Overnight cards used the numeric form -fa 1. Copy -fa on when the current build documents the enum. If the build rejects the flag, leave it off and record the card.',
    links: [
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/setup/server', label: 'Always-on server' },
      { href: '/concurrency-ab', label: 'Parallel slots' },
      { href: '/prefill', label: 'Prefill' },
    ],
  },
  {
    id: 'quantized-v',
    title: 'Turn FA on before a quantized V cache or tensor split',
    body: 'llama.cpp multi-gpu.md requires flash attention for --split-mode tensor and/or quantized V cache. Tensor mode hard-errors if FA is off. House overnight used layer split and f16 KV. Size q8_0 / q4_0 KV on the calculator first — quality and tok/s stay not measured yet.',
    links: [
      { href: '/kv-cache', label: 'KV cache' },
      { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'vulkan-hip',
    title: 'Vulkan first; HIP / ROCm is the cited second compile',
    body: 'The recorded 35B line is Vulkan. llama.cpp documents the same -fa flags on HIP. HIP FA on versus off for the house 35B sweep stays not measured on local-desktop. Do not invent a HIP delta, watts, or an acceptance rate.',
    links: [
      { href: '/compare/vulkan-vs-rocm', label: 'Vulkan vs ROCm' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/long-context', label: 'Long context' },
    ],
  },
  {
    id: 'measure',
    title: 'Measure Stack Lab Flash Attention A/B — do not invent tok/s',
    body: `Stack Lab ships a ${FA_AB} (on vs off) and a ${FA_PREFILL_AB} that includes FA. Those A/Bs record decode, prefill, peak VRAM per card, and total / peak system RAM on one GPU and on all GPUs. Packages are not published yet and there is no public download. Open the planner — do not invent a flash-attention deep link.`,
    links: [
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/results', label: 'Run cards' },
      { href: '/methodology', label: 'How we test' },
    ],
  },
];

export const FA_HOWTO_STEPS = FA_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const FA_FAQ: FaFaq[] = [
  {
    id: 'what-is-fa',
    question: 'What does llama.cpp -fa / --flash-attn do?',
    answer:
      'Official fused attention flag. Values are on, off, or auto (default auto; env LLAMA_ARG_FLASH_ATTN). Overnight 35B Vulkan llama-bench recorded -fa 1. llama-server FA on versus off is not measured on local-desktop — run Stack Lab Flash Attention A/B. Q3 is a labeled estimate. House recipes stay Q4 and up. llama.cpp first.',
    links: [
      { href: '/flash-attention', label: 'Flash Attention' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
  {
    id: 'when-required',
    question: 'When is flash attention required on llama.cpp?',
    answer:
      'llama.cpp multi-gpu.md requires FA for --split-mode tensor and/or a quantized V cache. Tensor mode hard-errors if FA is off. House overnight used layer split and f16 KV. Turn -fa on before -ctv q8_0 or -ctv q4_0. Quality and tok/s for those KV types stay not measured yet.',
    links: [
      { href: '/kv-cache', label: 'KV cache' },
      { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp' },
      { href: '/long-context', label: 'Long context' },
    ],
  },
  {
    id: 'vulkan-vs-hip',
    question: 'Does Flash Attention work the same on Vulkan and HIP?',
    answer:
      'llama.cpp documents the same -fa / --flash-attn flags on both compiles. The house 35B overnight line is Vulkan with -fa 1. HIP FA on versus off stays not measured on local-desktop. Do not invent a HIP flash-attn delta. Measure Stack Lab Flash Attention A/B.',
    links: [
      { href: '/compare/vulkan-vs-rocm', label: 'Vulkan vs ROCm' },
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/amdai-bench', label: 'amdai-bench' },
    ],
  },
];

export const FA_HUB_LINKS: FaLink[] = [
  { href: '/tuning', label: 'Speed up llama.cpp' },
  { href: '/kv-cache', label: 'KV cache' },
  { href: '/long-context', label: 'Long context' },
  { href: '/compare/vulkan-vs-rocm', label: 'Vulkan vs ROCm' },
  { href: '/concurrency-ab', label: 'Parallel slots' },
  { href: '/setup/server', label: 'Always-on server' },
  { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/models/qwen36', label: 'Qwen3.6-35B' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/amdai-bench', label: 'amdai-bench' },
  { href: '/stack-lab', label: 'Stack Lab' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/out-of-vram', label: 'Out of VRAM' },
  { href: '/prefill', label: 'Prefill' },
  { href: '/quants', label: 'Quants · KV types' },
  { href: '/start', label: 'Getting started' },
];

export const REQUIRED_FA_HREFS = [
  '/tuning',
  '/kv-cache',
  '/long-context',
  '/compare/vulkan-vs-rocm',
  '/concurrency-ab',
  '/setup/server',
  '/setup/multi-gpu',
  '/backends/llamacpp',
  '/models/qwen36',
  '/gpus/r9700',
  '/benchmarks',
  '/amdai-bench',
  '/stack-lab',
  '/calculator',
  '/out-of-vram',
  '/prefill',
  '/quants',
  '/results',
] as const;

export function faBlob(): string {
  return [
    FA_TITLE,
    FA_DESCRIPTION,
    FA_LEAD,
    FA_WHAT,
    FA_KV,
    FA_BACKENDS,
    FA_TRADEOFF,
    FA_CITED_LABEL,
    FA_RAM,
    FA_BENCH,
    FA_SERVER,
    ...FA_STEPS.map((row) => `${row.title} ${row.body}`),
    ...FA_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...FA_QUANTS.map((row) => `${row.quant} ${row.file} ${row.note}`),
    ...FA_SOURCES.map((row) => `${row.title} ${row.official ? 'official' : 'unofficial'}`),
    `${RAM_MIN_LABEL} ${RAM_FULL_LABEL}`,
  ].join('\n');
}

export function faHrefs(): string[] {
  const links = [
    ...FA_HUB_LINKS,
    ...FA_STEPS.flatMap((step) => step.links),
    ...FA_FAQ.flatMap((row) => row.links),
    ...FA_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertFaValid(): string[] {
  const errors: string[] = [];
  const blob = faBlob();
  if (FA_PATH !== '/flash-attention') errors.push('path');
  if (FA_PUBLISHED !== '2026-10-14') errors.push('published');
  if (FA_TITLE.length < 8) errors.push('title short');
  if (FA_DESCRIPTION.length < 70 || FA_DESCRIPTION.length > 160) {
    errors.push(`description length ${FA_DESCRIPTION.length}`);
  }
  if (!/AMDai/.test(blob)) errors.push('must say AMDai');
  if (!/llama\.cpp/.test(blob)) errors.push('must say llama.cpp');
  if (!/Vulkan/.test(blob)) errors.push('must say Vulkan');
  if (!/HIP/.test(blob)) errors.push('must say HIP');
  if (!/--flash-attn/.test(blob)) errors.push('must cite --flash-attn');
  if (!/-fa /.test(blob) && !/-fa 1/.test(blob)) errors.push('must cite -fa');
  if (!/on\|off\|auto/.test(blob)) errors.push('must cite on|off|auto');
  if (!/LLAMA_ARG_FLASH_ATTN/.test(blob)) errors.push('must cite LLAMA_ARG_FLASH_ATTN');
  if (!/quantized V cache/.test(blob)) errors.push('must cite quantized V cache');
  if (!/--split-mode tensor/.test(blob)) errors.push('must cite tensor split');
  if (!blob.includes(FA_AB)) errors.push('must name Flash Attention A/B');
  if (!blob.includes(FA_PREFILL_AB)) errors.push('must name Prefill tuning A/B');
  if (!blob.includes(FA_UNMEASURED)) errors.push('must keep unmeasured label');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('both RAM lines');
  if (!blob.includes(FA_HOUSE_FILE)) errors.push('house file');
  if (!/262144/.test(blob)) errors.push('house context');
  if (!blob.includes(FA_HOUSE_BENCH)) errors.push('house bench line');
  if (!blob.includes(COMPARE_Q3)) errors.push('q3 row');
  if (!/labeled estimate/.test(blob)) errors.push('q3 labeled');
  if (!/do not download Q3/.test(blob)) errors.push('must not recommend Q3');
  if (!/Q4 and up/.test(blob)) errors.push('must say Q4 and up');
  if (!/not measured/.test(blob)) errors.push('must say not measured');
  if (!/f16/.test(blob)) errors.push('must cite f16 KV');
  if (!/q8_0/.test(blob) || !/q4_0/.test(blob)) errors.push('must cite q8_0/q4_0 KV');
  if (BANNED.test(blob)) errors.push('banned model name');
  if (Q1Q2.test(blob)) errors.push('q1/q2 visible');
  if (Q4_FLOOR.test(blob)) errors.push('q4-floor wording');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/amdai-stack-lab:(?:\/\/)?flash-attn/.test(blob)) {
    errors.push('must not invent a flash-attention deep link');
  }
  if (!FA_QUANTS.some((row) => row.estimate && row.quant === COMPARE_Q3)) {
    errors.push('q3 estimate row');
  }
  const hrefs = faHrefs();
  for (const required of REQUIRED_FA_HREFS) {
    if (!hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}
