/**
 * Cited llama.cpp mmap / --no-mmap / --mlock model-loading RAM on Radeon.
 * Official llama-server README: -lm / --load-mode MODE (default auto;
 * env LLAMA_ARG_LOAD_MODE). auto = mmap unless a device cannot; none replaces
 * deprecated --no-mmap; mlock / mmap+mlock replace deprecated --mlock.
 * House llama-server does not record a load-mode pin. Load time, TTFT, and
 * mmap-vs-mlock RAM stay not yet measured. Stack Lab ships a Model loading A/B
 * (mmap default vs --no-mmap vs --mlock). No invented tok/s. llama.cpp Vulkan first.
 */

import { officialLinks } from './site';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { COMPARE_Q3, COMPARE_Q3_CITE, q3RamNeed } from './local-desktop-compare';
import { REPORT_HOWTO, REPORT_SCHEMA } from './lab-notes-report';

export const MM_PATH = '/mmap';
export const MM_PUBLISHED = '2026-10-14';
export const MM_CITED_LABEL =
  'Cited llama.cpp --load-mode · mmap / --no-mmap / --mlock RAM not yet measured';
export const MM_PACK = 'Model loading A/B';
export const MM_UNMEASURED = 'not yet measured';

export const MM_TITLE = 'mmap vs --no-mmap vs --mlock on Radeon';
export const MM_H1 =
  'mmap vs --no-mmap vs --mlock: model loading RAM on a Radeon GPU with llama.cpp';
export const MM_DESCRIPTION =
  'mmap vs --no-mmap vs --mlock on a Radeon GPU with llama.cpp. Cited --load-mode. Measure Stack Lab Model loading A/B. Q3 is a labeled estimate.';

export const MM_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';
export const MM_PORT = 8080;
export const MM_RAM_4K = 37.32;
export const MM_RAM_256K = 42.9;
export const MM_KIT_GB = 64;
export const MM_VRAM_4K = 25.97;
export const MM_VRAM_256K = 29.34;
export const MM_DECODE_4K = 102.39;
export const MM_HOUSE_SERVER_FLAGS =
  '-ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --jinja --host 127.0.0.1 --port 8080';

export const LLAMA_SERVER_README = 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md';
export const LLAMA_LOAD_MODE_PR = 'https://github.com/ggml-org/llama.cpp/pull/20834';
export const LLAMA_NO_MMAP_DISC = 'https://github.com/ggml-org/llama.cpp/discussions/26469';
export const LLAMA_MLOCK_DISC = 'https://github.com/ggml-org/llama.cpp/discussions/27912';

export const MM_Q3_RAM = q3RamNeed(1);

export type MmLink = { href: string; label: string };

export type MmSource = {
  id: string;
  title: string;
  href: string;
  official: boolean;
};

export type MmFaq = {
  id: string;
  question: string;
  answer: string;
  links: MmLink[];
};

export type MmStep = {
  id: string;
  title: string;
  body: string;
  links: MmLink[];
};

export type MmQuantRow = {
  quant: string;
  file: string;
  load: string;
  ramMin: string;
  ramFull: string;
  note: string;
  estimate: boolean;
};

export type MmModeRow = {
  id: string;
  shopper: string;
  flag: string;
  load: string;
  ttft: string;
  ram: string;
  note: string;
};

export const MM_LEAD = `
  Shoppers search llama.cpp mlock, --no-mmap RAM, why is system RAM full after
  load, and mmap vs mlock LLM. Official llama.cpp maps those old flags onto
  -lm / --load-mode (default auto; env LLAMA_ARG_LOAD_MODE). auto memory-maps
  the GGUF unless a device cannot. --load-mode none is the cited replacement
  for --no-mmap. --load-mode mlock is the cited replacement for --no-mmap
  --mlock. --load-mode mmap+mlock keeps a mapped file resident. AMDai has not
  ingested a Model loading A/B card on local-desktop, so load time, TTFT, decode,
  prefill, and mmap-vs-mlock peak RAM stay ${MM_UNMEASURED}. Stack Lab’s
  ${MM_PACK} is mmap default vs --no-mmap vs --mlock. That pack is not an
  allowlisted Open-in-Stack-Lab deep link — open the planner, then ingest a
  ${REPORT_SCHEMA} pack. House daily driver is ${MM_HOUSE_FILE} on llama.cpp
  Vulkan, one R9700, 262144 context, f16 KV. House llama-server does not
  record --load-mode, --mmap, --no-mmap, or --mlock. ${COMPARE_Q3} is a
  labeled estimate (${COMPARE_Q3_CITE}) — do not download Q3 to run. Q1/Q2
  stay off. House recipes stay Q4 and up.
`.replace(/\s+/g, ' ').trim();

export const MM_WHAT = `
  mmap (memory-map) lets the kernel page the GGUF from NVMe instead of
  allocating a full anonymous copy. Official --load-mode auto is mmap unless
  a device does not support it. --load-mode mmap forces that path.
  --load-mode none reads the file into process RAM (the cited --no-mmap
  replacement — discussion #26469). --load-mode mlock locks a non-mapped copy
  in RAM so the OS cannot swap or compress it. --load-mode mmap+mlock maps
  the file and locks those pages (discussion #27912). --load-mode dio uses
  Direct I/O when available. -lzm / --lazy-mode can leave huge tensors on
  disk and read rows on demand — it requires mmap (env LLAMA_ARG_LAZY_MODE).
  llama.cpp PR #20834 folded --mmap / --no-mmap / --mlock into --load-mode.
  Those old flags are deprecated; do not combine them with --load-mode —
  only the last flag wins.
`.replace(/\s+/g, ' ').trim();

export const MM_WHEN = `
  Default mmap is the house-shaped path: the 35B file lives on NVMe and the
  kernel faults pages in. --no-mmap / --load-mode none can help when mmap
  progress looks stuck or a platform pages the map out, at the cost of a
  full RAM copy of the weights. --mlock / --load-mode mlock or mmap+mlock
  is the “keep this file in RAM” pin when the box is swapping. It does not
  shrink VRAM. It does not fix ErrorOutOfDeviceMemory — that is /out-of-vram.
  Flash expert offload is a different RAM line — see /flash-ram-offload.
  Do not copy the overnight ${MM_DECODE_4K} tok/s 4K decode cell as a
  mmap-hit figure. That number is llama-bench, one client, not a load-mode A/B.
`.replace(/\s+/g, ' ').trim();

export const MM_RAM = `
  ${RAM_MIN_LABEL} on one R9700 with the house UD-Q5 is a ${MM_KIT_GB} GB kit
  from the measured ${MM_RAM_4K} GB peak at 4K. ${RAM_FULL_LABEL} uses the
  measured ${MM_RAM_256K} GB peak at 256K. Those are llama-bench cards with
  0% RAM offload and no recorded --load-mode. --no-mmap and --mlock can grow
  process RSS for the weight file — labeled estimate unless a Model loading
  A/B card measures the peak. ${COMPARE_Q3} is a labeled estimate. Do not
  download Q3 to run.
`.replace(/\s+/g, ' ').trim();

export const MM_HOUSE = `# House daily driver as recorded (no --load-mode / --mmap / --no-mmap / --mlock pin).
# llama-server README: --load-mode default auto (mmap unless a device cannot).
# That default is official docs — not a local-desktop pin we will invent.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${MM_HOUSE_FILE} \\
  ${MM_HOUSE_SERVER_FLAGS}`;

export const MM_DOCS = `# Official llama.cpp --load-mode from the server README — not a house pin.
# auto (default; env LLAMA_ARG_LOAD_MODE) = mmap unless a device cannot.
# none replaces deprecated --no-mmap. mlock replaces --no-mmap --mlock.
# mmap+mlock maps and locks. Measure ${MM_PACK} before you keep a new pin.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${MM_HOUSE_FILE} \\
  -ngl 99 -c 262144 --load-mode auto \\
  --cache-type-k f16 --cache-type-v f16 --jinja \\
  --host 127.0.0.1 --port ${MM_PORT}`;

export const MM_NO_MMAP = `# Cited --no-mmap replacement. Official --load-mode none.
# Deprecated --no-mmap still maps here (discussion #26469). Not a house pin.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${MM_HOUSE_FILE} \\
  -ngl 99 -c 262144 --load-mode none \\
  --cache-type-k f16 --cache-type-v f16 --jinja \\
  --host 127.0.0.1 --port ${MM_PORT}`;

export const MM_MLOCK = `# Cited --mlock replacements. Not a house pin. RSS stays ${MM_UNMEASURED}.
# --load-mode mlock = no mmap + lock (old --no-mmap --mlock).
# --load-mode mmap+mlock = map + lock (discussion #27912).
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${MM_HOUSE_FILE} \\
  -ngl 99 -c 262144 --load-mode mlock \\
  --cache-type-k f16 --cache-type-v f16 --jinja \\
  --host 127.0.0.1 --port ${MM_PORT}`;

export const MM_RUN_IT = `# Stack Lab ${MM_PACK}: mmap default vs --no-mmap vs --mlock.
# Not an allowlisted deep link — open the planner.
# Record load time, TTFT, decode, prefill, peak VRAM per card + total,
# and both RAM lines. Do not hand-type tok/s.

# Export a ${REPORT_SCHEMA} pack from Stack Lab, then ingest into Lab Notes.
# Each row must be a validating amdai-bench/run@1 card.
${REPORT_HOWTO.commands.join('\n')}`;

export const MM_SOURCES: MmSource[] = [
  {
    id: 'llama-server',
    title:
      'llama.cpp — llama-server README (-lm / --load-mode, --lazy-mode, LLAMA_ARG_LOAD_MODE)',
    href: LLAMA_SERVER_README,
    official: true,
  },
  {
    id: 'llama-20834',
    title: 'llama.cpp PR #20834 — --mmap / --no-mmap / --mlock folded into --load-mode',
    href: LLAMA_LOAD_MODE_PR,
    official: true,
  },
  {
    id: 'llama-26469',
    title: 'llama.cpp discussion #26469 — --no-mmap replacement is --load-mode none',
    href: LLAMA_NO_MMAP_DISC,
    official: true,
  },
  {
    id: 'llama-27912',
    title: 'llama.cpp discussion #27912 — --load-mode mlock vs mmap+mlock',
    href: LLAMA_MLOCK_DISC,
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

export const MM_MODES: MmModeRow[] = [
  {
    id: 'mmap-default',
    shopper: 'mmap default',
    flag: '--load-mode auto (official default; mmap unless a device cannot)',
    load: MM_UNMEASURED,
    ttft: MM_UNMEASURED,
    ram: `${RAM_MIN_LABEL}: ${MM_KIT_GB} GB kit from the measured ${MM_RAM_4K} GB llama-bench peak at 4K — not a load-mode A/B`,
    note: 'House-shaped path. Overnight cards do not record --load-mode.',
  },
  {
    id: 'no-mmap',
    shopper: '--no-mmap',
    flag: '--load-mode none (cited replacement for deprecated --no-mmap)',
    load: MM_UNMEASURED,
    ttft: MM_UNMEASURED,
    ram: `${RAM_FULL_LABEL}: extra RSS for a full weight copy stays not yet measured`,
    note: 'Reads the GGUF into process RAM. Measure Model loading A/B before you keep it.',
  },
  {
    id: 'mlock',
    shopper: '--mlock',
    flag: '--load-mode mlock (no mmap + lock) or mmap+mlock (map + lock)',
    load: MM_UNMEASURED,
    ttft: MM_UNMEASURED,
    ram: `${RAM_FULL_LABEL}: locked-resident peak stays not yet measured`,
    note: 'Stops swap/compress of the weight copy. Does not free VRAM.',
  },
];

export const MM_QUANTS: MmQuantRow[] = [
  {
    quant: 'Q6_K',
    file: 'Qwen3.6-35B-A3B-Q6_K.gguf',
    load: MM_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: peak system RAM not recorded on a Model loading A/B card`,
    ramFull: `${RAM_FULL_LABEL}: peak system RAM not recorded on a Model loading A/B card`,
    note: 'Overnight llama-bench exists. mmap / --no-mmap / --mlock load RAM stays not yet measured.',
    estimate: false,
  },
  {
    quant: 'UD-Q5_K_XL',
    file: MM_HOUSE_FILE,
    load: MM_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: ${MM_KIT_GB} GB kit from the measured ${MM_RAM_4K} GB peak at 4K (no --load-mode on that card)`,
    ramFull: `${RAM_FULL_LABEL}: measured ${MM_RAM_256K} GB peak at 256K. Extra --no-mmap / --mlock RSS is a labeled estimate on top.`,
    note: `House file. One-client ${MM_DECODE_4K} tok/s decode at 4K is llama-bench, not a load-mode A/B.`,
    estimate: false,
  },
  {
    quant: 'Q4_K_M',
    file: 'Qwen3.6-35B-A3B-Q4_K_M.gguf',
    load: MM_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: peak system RAM not recorded on a Model loading A/B card`,
    ramFull: `${RAM_FULL_LABEL}: peak system RAM not recorded on a Model loading A/B card`,
    note: 'Overnight llama-bench exists. Recommended floor for house recipes. Load A/B still needs Model loading A/B.',
    estimate: false,
  },
  {
    quant: COMPARE_Q3,
    file: 'Qwen3.6-35B-A3B-UD-Q3_K_XL.gguf',
    load: MM_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: ${MM_Q3_RAM.atSelected.kitGb} GB kit (labeled estimate)`,
    ramFull: `${RAM_FULL_LABEL}: ${MM_Q3_RAM.atFullContext.kitGb} GB kit (labeled estimate)`,
    note: `Labeled estimate (${COMPARE_Q3_CITE}). Do not download Q3 to run. Q3 does not buy a mmap A/B.`,
    estimate: true,
  },
];

export const MM_STEPS: MmStep[] = [
  {
    id: 'house-pin',
    title: 'Keep the house Vulkan pin — do not invent a load-mode',
    body: `Vulkan llama-server, ${MM_HOUSE_FILE}, ${MM_HOUSE_SERVER_FLAGS}. Official --load-mode default is auto. House recipes do not record --load-mode, --mmap, --no-mmap, or --mlock. House recipes stay Q4 and up. ${COMPARE_Q3} is a labeled estimate — do not download it to run.`,
    links: [
      { href: '/setup/server', label: 'Always-on server' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/models/qwen36', label: 'Qwen3.6-35B' },
    ],
  },
  {
    id: 'map-flags',
    title: 'Map shopper flags onto --load-mode',
    body: 'mmap default is --load-mode auto. --no-mmap is --load-mode none. --mlock with --no-mmap is --load-mode mlock. mmap plus lock is --load-mode mmap+mlock. PR #20834 deprecated the old pair. Do not pass both. Load time and RSS stay not yet measured.',
    links: [
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/glossary#mmap', label: 'Glossary · mmap' },
    ],
  },
  {
    id: 'ram-lines',
    title: 'Print both RAM lines before you lock the file',
    body: `${RAM_MIN_LABEL} stays the measured 64 GB kit from 37.32 GB at 4K. ${RAM_FULL_LABEL} stays 42.9 GB at 256K. Those cards do not record --load-mode. Extra --no-mmap / --mlock RSS is a labeled estimate. Flash expert offload is /flash-ram-offload, not a load-mode pin.`,
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/kv-cache', label: 'KV cache' },
    ],
  },
  {
    id: 'not-oom',
    title: 'Do not use mlock to fix out of VRAM',
    body: 'ErrorOutOfDeviceMemory and hipErrorOutOfMemory are VRAM. --mlock only pins system RAM. Cut -c, change KV type, or step the quant — see /out-of-vram. A process that swaps or never finishes mapping weights is /troubleshoot#mmap-ram.',
    links: [
      { href: '/out-of-vram', label: 'Out of VRAM' },
      { href: '/troubleshoot#mmap-ram', label: 'System RAM too small' },
      { href: '/gpus/r9700', label: 'R9700' },
    ],
  },
  {
    id: 'measure',
    title: 'Run Stack Lab Model loading A/B — do not invent RSS',
    body: `Stack Lab ships ${MM_PACK} (mmap default vs --no-mmap vs --mlock). Record load time, TTFT, decode, prefill, peak VRAM per card and total, and both RAM lines. Export a ${REPORT_SCHEMA} pack and ingest with npx tsx src/scripts/amdai-bench.ts ingest pack.json. Packages are not published yet. Open the planner — do not invent a mmap deep link.`,
    links: [
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/results', label: 'Run cards' },
      { href: '/methodology', label: 'How we test' },
    ],
  },
];

export const MM_HOWTO_STEPS = MM_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const MM_FAQ: MmFaq[] = [
  {
    id: 'what-is-mmap',
    question: 'What is llama.cpp mmap versus --no-mmap versus --mlock on a Radeon?',
    answer:
      'Official --load-mode auto memory-maps the GGUF (mmap default). --load-mode none replaces deprecated --no-mmap and copies weights into RAM. --load-mode mlock locks a non-mapped copy; mmap+mlock locks a mapped copy. AMDai has not measured load time or RSS across those arms on local-desktop — not yet measured. Run Stack Lab Model loading A/B. Q3 is a labeled estimate. llama.cpp first.',
    links: [
      { href: '/mmap', label: 'mmap / mlock' },
      { href: '/out-of-vram', label: 'Out of VRAM' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'why-ram-full',
    question: 'Why is system RAM full after llama.cpp loads a model?',
    answer:
      'mmap still faults pages into RSS as the model runs. --no-mmap / --load-mode none copies the whole GGUF. --mlock pins that copy so it cannot page out. House measured peaks are 37.32 GB at 4K and 42.9 GB at 256K without a load-mode pin. Extra load-mode RSS stays not yet measured. Print both Minimum system RAM needed and RAM needed at full context.',
    links: [
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/kv-cache', label: 'KV cache' },
      { href: '/troubleshoot#mmap-ram', label: 'System RAM too small' },
    ],
  },
  {
    id: 'mlock-vram',
    question: 'Does --mlock fix out of VRAM?',
    answer:
      'No. Official --load-mode mlock and mmap+mlock pin system RAM. They do not free VRAM. Cited OOM strings live on /out-of-vram. House recipes stay Q4 and up. Q3 is a labeled estimate. Run Model loading A/B from the planner if you want a measured RSS delta.',
    links: [
      { href: '/out-of-vram', label: 'Out of VRAM' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/stack-lab', label: 'Stack Lab' },
    ],
  },
];

export const MM_HUB_LINKS: MmLink[] = [
  { href: '/out-of-vram', label: 'Out of VRAM' },
  { href: '/kv-cache', label: 'KV cache' },
  { href: '/flash-ram-offload', label: 'Flash RAM offload' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/tuning', label: 'Speed up llama.cpp' },
  { href: '/stack-lab', label: 'Stack Lab' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/setup/server', label: 'Always-on server' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/models/qwen36', label: 'Qwen3.6-35B' },
  { href: '/prompt-cache', label: 'Prompt cache' },
  { href: '/amdai-bench', label: 'amdai-bench' },
  { href: '/start', label: 'Getting started' },
];

export const REQUIRED_MM_HREFS = [
  '/out-of-vram',
  '/kv-cache',
  '/flash-ram-offload',
  '/calculator',
  '/tuning',
  '/stack-lab',
  '/gpus/r9700',
  '/setup/server',
  '/backends/llamacpp',
  '/models/qwen36',
  '/amdai-bench',
  '/results',
  '/methodology',
  '/troubleshoot#mmap-ram',
] as const;

export function mmBlob(): string {
  return [
    MM_TITLE,
    MM_H1,
    MM_DESCRIPTION,
    MM_LEAD,
    MM_WHAT,
    MM_WHEN,
    MM_CITED_LABEL,
    MM_RAM,
    MM_HOUSE,
    MM_DOCS,
    MM_NO_MMAP,
    MM_MLOCK,
    MM_RUN_IT,
    ...MM_STEPS.map((row) => `${row.title} ${row.body}`),
    ...MM_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...MM_QUANTS.map((row) => `${row.quant} ${row.file} ${row.load} ${row.ramMin} ${row.ramFull} ${row.note}`),
    ...MM_MODES.map((row) => `${row.shopper} ${row.flag} ${row.load} ${row.ttft} ${row.ram} ${row.note}`),
    ...MM_SOURCES.map((row) => `${row.title} ${row.official ? 'official' : 'unofficial'}`),
    `${RAM_MIN_LABEL} ${RAM_FULL_LABEL}`,
  ].join('\n');
}

export function mmHrefs(): string[] {
  const links = [
    ...MM_HUB_LINKS,
    ...MM_STEPS.flatMap((step) => step.links),
    ...MM_FAQ.flatMap((row) => row.links),
    ...MM_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertMmValid(): string[] {
  const errors: string[] = [];
  const blob = mmBlob();
  if (MM_PATH !== '/mmap') errors.push('path');
  if (MM_PUBLISHED !== '2026-10-14') errors.push('published');
  if (MM_TITLE.length < 8) errors.push('title short');
  if (MM_DESCRIPTION.length < 70 || MM_DESCRIPTION.length > 160) {
    errors.push(`description length ${MM_DESCRIPTION.length}`);
  }
  if (!/AMDai/.test(blob)) errors.push('must say AMDai');
  if (!/llama\.cpp/.test(blob)) errors.push('must say llama.cpp');
  if (!/Vulkan/.test(blob)) errors.push('must say Vulkan');
  if (!/--load-mode/.test(blob)) errors.push('must cite --load-mode');
  if (!/--no-mmap/.test(blob)) errors.push('must cite --no-mmap');
  if (!/--mlock/.test(blob)) errors.push('must cite --mlock');
  if (!/LLAMA_ARG_LOAD_MODE/.test(blob)) errors.push('must cite LLAMA_ARG_LOAD_MODE');
  if (!blob.includes(MM_PACK)) errors.push('must name Model loading A/B');
  if (!blob.includes(REPORT_SCHEMA)) errors.push('must name lab-notes-report/1');
  if (!/amdai-bench\.ts ingest/.test(blob)) errors.push('must cite ingest command');
  if (!blob.includes(MM_UNMEASURED)) errors.push('must keep unmeasured label');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('both RAM lines');
  if (!blob.includes(MM_HOUSE_FILE)) errors.push('house file');
  if (!blob.includes(MM_HOUSE_SERVER_FLAGS)) errors.push('house server flags');
  if (!/262144/.test(blob)) errors.push('house context');
  if (!blob.includes(COMPARE_Q3)) errors.push('q3 row');
  if (!/labeled estimate/.test(blob)) errors.push('q3 labeled');
  if (!/do not download Q3/.test(blob)) errors.push('must not recommend Q3');
  if (!/Q4 and up/.test(blob)) errors.push('must say Q4 and up');
  if (!/not yet measured/.test(blob)) errors.push('must say not yet measured');
  if (BANNED.test(blob)) errors.push('banned model name');
  if (Q1Q2.test(blob)) errors.push('q1/q2 visible');
  if (Q4_FLOOR.test(blob)) errors.push('q4-floor wording');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/amdai-stack-lab:(?:\/\/)?(?:mmap|model-loading)/.test(blob)) {
    errors.push('must not invent a mmap deep link');
  }
  if (!MM_QUANTS.some((row) => row.estimate && row.quant === COMPARE_Q3)) {
    errors.push('q3 estimate row');
  }
  if (MM_QUANTS.some((row) => row.load !== MM_UNMEASURED)) {
    errors.push('must not invent a load cell');
  }
  if (MM_MODES.some((row) => row.load !== MM_UNMEASURED || row.ttft !== MM_UNMEASURED)) {
    errors.push('must not invent a mode TTFT/load cell');
  }
  const hrefs = mmHrefs();
  for (const required of REQUIRED_MM_HREFS) {
    const path = required.split('#')[0] ?? required;
    if (!hrefs.includes(path) && !hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}
