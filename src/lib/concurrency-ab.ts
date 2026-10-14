/**
 * Cited llama-server parallel slots (-np) on Radeon.
 * Official source: llama.cpp server README (-np / --parallel, --kv-unified-per-slot).
 * Stack Lab ships concurrency-ab/1 (amdai-bench ab-concurrency). No -np tok/s on the local desktop.
 * Two-card copies stay on /qwen36-dual — those cards are not one-GPU -np.
 * No invented tok/s, prices, or Open-in-Stack-Lab pack deep links. llama.cpp Vulkan first.
 */

import { officialLinks } from './site';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';

export const NP_PATH = '/concurrency-ab';
export const NP_PUBLISHED = '2026-10-14';
export const NP_CITED_LABEL = 'Cited llama.cpp --parallel · slots not measured on the local desktop';
export const NP_PACK = 'concurrency-ab/1';
export const NP_UNMEASURED = 'not measured yet — run Stack Lab concurrency-ab/1';

export const NP_TITLE = 'Parallel slots (-np) on Radeon';
export const NP_DESCRIPTION =
  'Parallel slots (-np) on a Radeon GPU with llama.cpp. Cited --parallel. Measure Stack Lab concurrency-ab/1. Q3 is a labeled estimate.';

export const NP_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';
export const NP_PORT = 8080;
export const NP_RAM_4K = 37.32;
export const NP_RAM_256K = 42.9;
export const NP_KIT_GB = 64;
export const NP_VRAM_4K = 25.97;
export const NP_VRAM_256K = 29.34;
export const NP_DECODE_4K = 102.39;

export const LLAMA_SERVER_README = 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md';

export type NpLink = { href: string; label: string };

export type NpSource = {
  id: string;
  title: string;
  href: string;
  official: boolean;
};

export type NpFaq = {
  id: string;
  question: string;
  answer: string;
  links: NpLink[];
};

export type NpStep = {
  id: string;
  title: string;
  body: string;
  links: NpLink[];
};

export type NpQuantRow = {
  quant: string;
  file: string;
  note: string;
  estimate: boolean;
};

export const NP_LEAD = `
  Hermes, Open WebUI, and coding tools often share one llama-server. Official
  llama.cpp -np / --parallel sets how many slots that process accepts.
  AMDai has not measured -np 1/2/4/8 on one R9700, so every multi-client
  tok/s and TTFT cell stays ${NP_UNMEASURED}. Stack Lab’s A/B is pack
  ${NP_PACK} (amdai-bench ab-concurrency) with that many simultaneous
  streaming clients. That pack is not an allowlisted Open-in-Stack-Lab
  deep link — open the planner, then record a card. House daily driver is
  ${NP_HOUSE_FILE} on llama.cpp Vulkan, one R9700, 262144 context, f16 KV,
  one interactive slot. ${COMPARE_Q3} is a labeled estimate (${COMPARE_Q3_CITE}).
  Q1/Q2 stay off. Two copies on two cards are /qwen36-dual, not -np.
`.replace(/\s+/g, ' ').trim();

export const NP_WHAT = `
  A slot is one concurrent sequence on llama-server. -np N / --parallel N
  is the official slot count (default -1 = auto; env LLAMA_ARG_N_PARALLEL).
  GET /health reports total_slots from that flag. Continuous batching
  (-cb) is on by default so idle slots can join a running decode. House
  path is one interactive user until a card says otherwise.
`.replace(/\s+/g, ' ').trim();

export const NP_CTX = `
  Size context per slot, then the pool. Official --kv-unified-per-slot N
  is the context limit per parallel slot; when set without -c / --ctx-size,
  llama.cpp sizes the shared KV pool to n_parallel × N. If you keep one
  -c and raise -np, treat usable context per client as total ctx / np
  unless you also raise -c or set --kv-unified-per-slot. --kv-unified
  (-kvu) shares one KV buffer across sequences (default on when slots are
  auto). A second slot is still more KV — size it on the calculator
  before you raise -np. Overnight house cards used -c 262144 and one
  client: peak VRAM ${NP_VRAM_4K} GB at 4K and ${NP_VRAM_256K} GB at 256K
  on a 32 GB R9700. Those are llama-bench, not a slot A/B.
`.replace(/\s+/g, ' ').trim();

export const NP_TRADEOFF = `
  More slots raise aggregate decode when several clients stream at once.
  Each client usually waits longer for first token (TTFT) and sees a
  slower personal decode. Fewer slots win for one Hermes chat, one
  coding tool, or thinking mode — hidden thought tokens burn the same
  window. More slots win when Open WebUI, Hermes, and a phone share one
  always-on unit. Do not copy the overnight ${NP_DECODE_4K} tok/s 4K
  UD-Q5 cell as an -np 4 figure. Do not copy the two-card 172 / 177
  tok/s soak as one-GPU slots. Measure ${NP_PACK}.
`.replace(/\s+/g, ' ').trim();

export const NP_RAM = `
  ${RAM_MIN_LABEL} on one R9700 with the house UD-Q5 is a ${NP_KIT_GB} GB
  kit from the measured ${NP_RAM_4K} GB peak at 4K. ${RAM_FULL_LABEL} uses
  the measured ${NP_RAM_256K} GB peak at 256K. Those are llama-bench cards
  for one client, GPU RAM plus total system DDR — not a file-cache versus
  anonymous split, and not an -np 4 measurement. Extra slots grow KV on
  the same kit. ${COMPARE_Q3} is a labeled estimate.
`.replace(/\s+/g, ' ').trim();

export const NP_ONE = `# One interactive user (house daily driver).
# llama-server README: -np / --parallel N (default -1 = auto).
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${NP_HOUSE_FILE} \\
  -ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --jinja \\
  -np 1 --host 127.0.0.1 --port ${NP_PORT}`;

export const NP_SHARED = `# Shared server: size per-slot context first.
# Official --kv-unified-per-slot N is the context limit per slot.
# When set without -c, the shared KV pool is n_parallel × N.
# Shopper rule: usable context per client ≈ total -c / -np unless you
# raise -c or set --kv-unified-per-slot.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${NP_HOUSE_FILE} \\
  -ngl 99 --kv-unified-per-slot 32768 -np 4 \\
  --cache-type-k f16 --cache-type-v f16 --jinja \\
  --host 127.0.0.1 --port ${NP_PORT}`;

export const NP_SOURCES: NpSource[] = [
  {
    id: 'llama-server',
    title: 'llama.cpp — llama-server README (-np / --parallel, --kv-unified-per-slot, GET /health total_slots)',
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

export const NP_QUANTS: NpQuantRow[] = [
  {
    quant: 'Q6_K',
    file: 'Qwen3.6-35B-A3B-Q6_K.gguf',
    note: 'Overnight one-client llama-bench exists. -np 2/4/8 stays not measured yet.',
    estimate: false,
  },
  {
    quant: 'UD-Q5_K_XL',
    file: NP_HOUSE_FILE,
    note: `House file. One-client ${NP_DECODE_4K} tok/s at 4K is llama-bench, not a slot A/B.`,
    estimate: false,
  },
  {
    quant: 'Q4_K_M',
    file: 'Qwen3.6-35B-A3B-Q4_K_M.gguf',
    note: 'Overnight one-client llama-bench exists. Raising -np still needs a concurrency-ab/1 card.',
    estimate: false,
  },
  {
    quant: COMPARE_Q3,
    file: 'Qwen3.6-35B-A3B-UD-Q3_K_XL.gguf',
    note: `Labeled estimate (${COMPARE_Q3_CITE}). Q3 does not buy free slots on a 32 GB card.`,
    estimate: true,
  },
];

export const NP_STEPS: NpStep[] = [
  {
    id: 'one-slot',
    title: 'Start with one slot on the house 35B',
    body: `Vulkan llama-server, ${NP_HOUSE_FILE}, -c 262144, f16 KV, -np 1, loopback :${NP_PORT}. That matches the overnight one-client cards. Q6/Q5/Q4 first. ${COMPARE_Q3} is a labeled estimate.`,
    links: [
      { href: '/setup/server', label: 'Always-on server' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/models/qwen36', label: 'Qwen3.6-35B' },
    ],
  },
  {
    id: 'size-ctx',
    title: 'Size context per slot before you raise -np',
    body: 'Official --kv-unified-per-slot N is the per-slot limit. Usable context per client is total ctx / np unless you raise -c or set that flag. Overnight 256K already peaks at 29.34 GB VRAM on a 32 GB R9700 — a second slot at the same -c will not fit. Calculator first.',
    links: [
      { href: '/kv-cache', label: 'KV cache' },
      { href: '/long-context', label: 'Long context' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'when-fewer',
    title: 'Leave -np 1 when one chat owns the GPU',
    body: 'Fewer slots win for one Hermes session, one coding tool, or thinking mode. Hidden thought tokens consume the same window. The house 35B already decodes fast on one R9700 — extra slots only help when several clients stream at once.',
    links: [
      { href: '/thinking', label: 'Thinking mode' },
      { href: '/guides/tool-calling', label: 'Tool calling' },
      { href: '/harnesses', label: 'Harnesses' },
    ],
  },
  {
    id: 'when-more',
    title: 'Raise -np only when several clients share one server',
    body: 'Open WebUI + Hermes + a phone on one systemd unit is the shopper case. Start at -np 2 with a smaller per-slot window (32K is the example, not a measured pin). Confirm GET /health total_slots. Continuous batching stays on unless you pass --no-cont-batching.',
    links: [
      { href: '/setup/server', label: 'Always-on server' },
      { href: '/setup/open-webui', label: 'Open WebUI' },
      { href: '/harnesses/connect', label: 'Connect a harness' },
    ],
  },
  {
    id: 'not-two-cards',
    title: 'Do not confuse slots with two GPU copies',
    body: 'Two llama-server processes on two R9700s are /qwen36-dual (measured soak). -np keeps one process and one weight file. We do not copy the two-card 172 / 177 tok/s totals onto this page as a slot result.',
    links: [
      { href: '/qwen36-dual', label: '35B on two cards' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp' },
    ],
  },
  {
    id: 'measure',
    title: 'Measure Stack Lab concurrency-ab/1 — do not invent tok/s',
    body: `Stack Lab ships ${NP_PACK} (amdai-bench ab-concurrency): -np 1/2/4/8 with that many simultaneous streaming clients. Record TTFT and aggregate decode. Packages are not published yet and there is no public download. Open the planner — do not invent a concurrency-ab deep link.`,
    links: [
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/methodology', label: 'How we test' },
    ],
  },
];

export const NP_HOWTO_STEPS = NP_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const NP_FAQ: NpFaq[] = [
  {
    id: 'what-is-np',
    question: 'What does llama-server -np / --parallel do?',
    answer:
      'Official llama.cpp flag for the number of server slots (default -1 = auto). Each slot is one concurrent sequence. GET /health prints total_slots. AMDai has not measured -np 2/4/8 on one R9700. Run Stack Lab concurrency-ab/1. Q3 is a labeled estimate. llama.cpp first.',
    links: [
      { href: '/concurrency-ab', label: 'Parallel slots' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/setup/server', label: 'Always-on server' },
    ],
  },
  {
    id: 'ctx-per-slot',
    question: 'How much context does each -np slot get?',
    answer:
      'Shopper rule: usable context per client is total ctx / np unless you raise -c or set official --kv-unified-per-slot. That flag is the context limit per slot; without -c, the shared KV pool is n_parallel × N. Two slots at the house 262K window will not fit one 32 GB R9700. Calculator first.',
    links: [
      { href: '/kv-cache', label: 'KV cache' },
      { href: '/long-context', label: 'Long context' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'fewer-win',
    question: 'When do fewer parallel slots win on a Radeon?',
    answer:
      'When one interactive user owns the GPU — one Hermes chat, one coding tool, or thinking mode. Extra slots raise aggregate decode only if several clients stream at once, and they usually worsen per-client TTFT. Prompt / prefix cache is the other TTFT lever — see /prompt-cache. Measure concurrency-ab/1. Do not copy a one-client 35B tok/s as an -np 4 figure.',
    links: [
      { href: '/thinking', label: 'Thinking mode' },
      { href: '/harnesses', label: 'Harnesses' },
      { href: '/prompt-cache', label: 'Prompt cache' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
    ],
  },
];

export const NP_HUB_LINKS: NpLink[] = [
  { href: '/setup/server', label: 'Always-on server' },
  { href: '/kv-cache', label: 'KV cache' },
  { href: '/long-context', label: 'Long context' },
  { href: '/tuning', label: 'Speed up llama.cpp' },
  { href: '/flash-attention', label: 'Flash Attention' },
  { href: '/prefill', label: 'Prefill' },
  { href: '/prompt-cache', label: 'Prompt cache' },
  { href: '/thinking', label: 'Thinking mode' },
  { href: '/guides/tool-calling', label: 'Tool calling' },
  { href: '/constrained-decoding', label: 'Constrained decoding' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/harnesses', label: 'Harnesses' },
  { href: '/models/qwen36', label: 'Qwen3.6-35B' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/amdai-bench', label: 'amdai-bench' },
  { href: '/stack-lab', label: 'Stack Lab' },
  { href: '/qwen36-dual', label: '35B on two cards' },
  { href: '/start', label: 'Getting started' },
];

export const REQUIRED_NP_HREFS = [
  '/setup/server',
  '/kv-cache',
  '/long-context',
  '/tuning',
  '/flash-attention',
  '/prefill',
  '/prompt-cache',
  '/thinking',
  '/guides/tool-calling',
  '/constrained-decoding',
  '/backends/llamacpp',
  '/harnesses',
  '/models/qwen36',
  '/gpus/r9700',
  '/benchmarks',
  '/amdai-bench',
  '/stack-lab',
  '/calculator',
  '/qwen36-dual',
] as const;

export function npBlob(): string {
  return [
    NP_TITLE,
    NP_DESCRIPTION,
    NP_LEAD,
    NP_WHAT,
    NP_CTX,
    NP_TRADEOFF,
    NP_CITED_LABEL,
    NP_RAM,
    NP_ONE,
    NP_SHARED,
    ...NP_STEPS.map((row) => `${row.title} ${row.body}`),
    ...NP_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...NP_QUANTS.map((row) => `${row.quant} ${row.file} ${row.note}`),
    ...NP_SOURCES.map((row) => `${row.title} ${row.official ? 'official' : 'unofficial'}`),
    `${RAM_MIN_LABEL} ${RAM_FULL_LABEL}`,
  ].join('\n');
}

export function npHrefs(): string[] {
  const links = [
    ...NP_HUB_LINKS,
    ...NP_STEPS.flatMap((step) => step.links),
    ...NP_FAQ.flatMap((row) => row.links),
    ...NP_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertNpValid(): string[] {
  const errors: string[] = [];
  const blob = npBlob();
  if (NP_PATH !== '/concurrency-ab') errors.push('path');
  if (NP_PUBLISHED !== '2026-10-14') errors.push('published');
  if (NP_TITLE.length < 8) errors.push('title short');
  if (NP_DESCRIPTION.length < 70 || NP_DESCRIPTION.length > 160) {
    errors.push(`description length ${NP_DESCRIPTION.length}`);
  }
  if (!/AMDai/.test(blob)) errors.push('must say AMDai');
  if (!/llama\.cpp/.test(blob)) errors.push('must say llama.cpp');
  if (!/Vulkan/.test(blob)) errors.push('must say Vulkan');
  if (!/--parallel/.test(blob)) errors.push('must cite --parallel');
  if (!/-np/.test(blob)) errors.push('must cite -np');
  if (!/--kv-unified-per-slot/.test(blob)) errors.push('must cite --kv-unified-per-slot');
  if (!blob.includes(NP_PACK)) errors.push('must name concurrency-ab/1');
  if (!/ab-concurrency/.test(blob)) errors.push('must name amdai-bench ab-concurrency');
  if (!blob.includes(NP_UNMEASURED)) errors.push('must keep unmeasured label');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('both RAM lines');
  if (!blob.includes(NP_HOUSE_FILE)) errors.push('house file');
  if (!/262144/.test(blob)) errors.push('house context');
  if (!blob.includes(COMPARE_Q3)) errors.push('q3 row');
  if (!/labeled estimate/.test(blob)) errors.push('q3 labeled');
  if (!/not measured/.test(blob)) errors.push('must say not measured');
  if (!/total ctx \/ np|ctx \/ np/.test(blob)) errors.push('must explain ctx / np');
  if (!/TTFT/.test(blob)) errors.push('must mention TTFT');
  if (BANNED.test(blob)) errors.push('banned model name');
  if (Q1Q2.test(blob)) errors.push('q1/q2 visible');
  if (Q4_FLOOR.test(blob)) errors.push('q4-floor wording');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/amdai-stack-lab:(?:\/\/)?concurrency-ab/.test(blob)) {
    errors.push('must not invent a concurrency-ab deep link');
  }
  if (!NP_QUANTS.some((row) => row.estimate && row.quant === COMPARE_Q3)) {
    errors.push('q3 estimate row');
  }
  const hrefs = npHrefs();
  for (const required of REQUIRED_NP_HREFS) {
    if (!hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}
