/**
 * Cited shopper guide: biggest context on a Radeon GPU with llama.cpp.
 * Stack Lab ships ctx-ceiling/1 (amdai-bench ab-ctx-ceiling). docs/ctx-ceiling.md
 * is the companion write-up and is not checked into Lab Notes — cite /stack-lab
 * and the in-repo lab-notes-report/1 path. No invented tok/s, VRAM, RAM, ceiling,
 * or prices. House overnight 35B llama-bench windows are not a ctx-ceiling pack.
 * llama.cpp Vulkan first. Q3 is a labeled estimate. Q1/Q2 stay off.
 */

import { officialLinks } from './site';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { COMPARE_Q3, COMPARE_Q3_CITE, q3RamNeed } from './local-desktop-compare';
import { REPORT_HOWTO, REPORT_SCHEMA } from './lab-notes-report';

export const CX_PATH = '/context-ceiling';
export const CX_PUBLISHED = '2026-10-14';
export const CX_CITED_LABEL =
  'Cited Stack Lab ctx-ceiling/1 · house 262K llama-bench · finder not yet ingested';
export const CX_PACK = 'ctx-ceiling/1';
export const CX_BENCH_ID = 'ab-ctx-ceiling';
export const CX_UI = '#ctx-ceiling';
export const CX_UNMEASURED = 'not yet measured';

export const CX_TITLE = 'Biggest context on Radeon';
export const CX_H1 = "What's the biggest context I can run on a Radeon GPU with llama.cpp";
export const CX_DESCRIPTION =
  'What is the biggest context I can run on a Radeon GPU with llama.cpp. Measure Stack Lab ctx-ceiling/1. Q3 is a labeled estimate.';

export const CX_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';
export const CX_PORT = 8080;
export const CX_RAM_4K = 37.32;
export const CX_RAM_256K = 42.9;
export const CX_KIT_GB = 64;
export const CX_VRAM_4K = 25.97;
export const CX_VRAM_256K = 29.34;
export const CX_DECODE_4K = 102.39;
export const CX_DECODE_32K = 90.52;
export const CX_DECODE_128K = 66.43;
export const CX_DECODE_256K = 44.4;
export const CX_NATIVE = 262144;
export const CX_HOUSE_SERVER_FLAGS =
  '-ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --jinja --host 127.0.0.1 --port 8080';

export const LLAMA_SERVER_README = 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md';
export const CX_Q3_RAM = q3RamNeed(1);

export type CxLink = { href: string; label: string };

export type CxSource = {
  id: string;
  title: string;
  href: string;
  official: boolean;
};

export type CxFaq = {
  id: string;
  question: string;
  answer: string;
  links: CxLink[];
};

export type CxStep = {
  id: string;
  title: string;
  body: string;
  links: CxLink[];
};

export type CxQuantRow = {
  quant: string;
  file: string;
  ceiling: string;
  ramMin: string;
  ramFull: string;
  note: string;
  estimate: boolean;
};

export type CxArmRow = {
  id: string;
  shopper: string;
  what: string;
  winner: string;
  ram: string;
  note: string;
};

export const CX_LEAD = `
  Shoppers search max context Radeon, 262K VRAM, how much context fits on
  32 GB, and llama.cpp context length AMD. Native max is the window the
  model card publishes. The real ceiling is the largest -c that still
  loads and serves on your box. Stack Lab’s finder is pack ${CX_PACK}
  (amdai-bench ${CX_BENCH_ID}, UI ${CX_UI}, deeplink names context-ceiling
  and max-context). That pack is not an allowlisted Open-in-Stack-Lab deep
  link — open the planner, then ingest a ${REPORT_SCHEMA} pack. AMDai has
  not ingested a ${CX_PACK} card on the local desktop, so the finder winner, first
  fail reason, and per-step VRAM stay ${CX_UNMEASURED}. House overnight
  llama-bench did run ${CX_NATIVE} on ${CX_HOUSE_FILE}, llama.cpp Vulkan,
  one R9700, f16 KV — that is not a ctx-ceiling winner. ${COMPARE_Q3} is a
  labeled estimate (${COMPARE_Q3_CITE}) — do not download Q3 to run. Q1/Q2
  stay off. House recipes stay Q4 and up.
`.replace(/\s+/g, ' ').trim();

export const CX_WHAT = `
  Context length is the token window of prompt plus chat. llama.cpp sets
  it with -c / --ctx-size. The Qwen3.6-35B-A3B card lists ${CX_NATIVE}
  native context. A 32 GB card that loads at 4K can still fail at 128K
  because the KV cache grew. The ceiling finder climbs a lean ladder
  toward that native max and stops at the first load or serve failure
  (OOM, alloc, or the process never comes up). It records decode, prefill,
  peak VRAM per card and total, and peak system RAM on every passing step,
  then the first fail reason. Do not copy the overnight ${CX_DECODE_4K}
  tok/s 4K decode cell as a ctx-ceiling winner. That number is llama-bench,
  one client, not ${CX_PACK}.
`.replace(/\s+/g, ' ').trim();

export const CX_LADDER = `
  Lean ladder starts at a short window — the same short-context load that
  feeds ${RAM_MIN_LABEL} — and climbs toward the card’s native max. Native
  max is what the vendor published, not what your VRAM holds. One-GPU
  arm uses a single card. All-GPUs arm uses every visible device. The
  first OOM or load failure stops that climb; the last passing step is
  the winner. AMDai does not invent the step list — run ${CX_BENCH_ID}
  and read docs/ctx-ceiling.md in Stack Lab. A winner is not ingested
  on this site yet.
`.replace(/\s+/g, ' ').trim();

export const CX_RAM = `
  ${RAM_MIN_LABEL} on one R9700 with the house UD-Q5 is a ${CX_KIT_GB} GB
  kit from the measured ${CX_RAM_4K} GB llama-bench peak at 4K (lean /
  short-context). Breakdown: offloaded weights 0% on the house in-VRAM
  path + OS / cache / headroom → ${CX_KIT_GB} GB. That kit round is a
  labeled estimate until a ${CX_PACK} lean step is ingested. ${RAM_FULL_LABEL}
  uses the measured ${CX_RAM_256K} GB peak at 256K as the primary number;
  the kit-round secondary stays ${CX_KIT_GB} GB. A ${CX_PACK} winner peak
  is ${CX_UNMEASURED}. ${COMPARE_Q3} is a labeled estimate. Do not
  download Q3 to run.
`.replace(/\s+/g, ' ').trim();

export const CX_HOUSE = `# House daily driver as recorded (262144 ran on overnight llama-bench — not a ctx-ceiling winner).
# Official llama.cpp: -c / --ctx-size. Qwen3.6-35B-A3B card native max is 262144.
# Do not invent a ${CX_PACK} pin. Measure amdai-bench ${CX_BENCH_ID} on your box.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${CX_HOUSE_FILE} \\
  ${CX_HOUSE_SERVER_FLAGS}`;

export const CX_LEAN = `# Lean / short-context load — the kit line, not a local desktop pin.
# Size -c on the calculator before you copy it. 4096 is the house 4K llama-bench window.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${CX_HOUSE_FILE} \\
  -ngl 99 -c 4096 --cache-type-k f16 --cache-type-v f16 --jinja \\
  --host 127.0.0.1 --port ${CX_PORT}`;

export const CX_RUN_IT = `# Stack Lab pack ${CX_PACK}. Not an allowlisted deep link — open the planner.
# UI hash ${CX_UI}. Deeplink names context-ceiling / max-context are Stack Lab
# screens, not Lab Notes amdai-stack-lab: buttons. Do not invent those hrefs.
amdai-bench ${CX_BENCH_ID}

# Export a ${REPORT_SCHEMA} pack from Stack Lab, then ingest into Lab Notes.
# Each row must be a validating amdai-bench/run@1 card. Do not hand-type tok/s.
# Companion write-up: Stack Lab docs/ctx-ceiling.md (not in this repo).
${REPORT_HOWTO.commands.join('\n')}`;

export const CX_SOURCES: CxSource[] = [
  {
    id: 'lab-notes-report',
    title: 'AMDai lab-notes-report/1 schema (ingest path for Stack Lab packs)',
    href: '/amdai-bench/lab-notes-report@1.schema.json',
    official: true,
  },
  {
    id: 'amdai-bench',
    title: 'AMDai amdai-bench (run@1 cards; ctx-ceiling/1 is not yet ingested)',
    href: '/amdai-bench',
    official: true,
  },
  {
    id: 'stack-lab-ctx',
    title: 'Stack Lab docs/ctx-ceiling.md (companion write-up; not checked into Lab Notes)',
    href: '/stack-lab',
    official: false,
  },
  {
    id: 'llama-server',
    title: 'llama.cpp — llama-server README (-c / --ctx-size)',
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
    title: 'Qwen3.6-35B-A3B official model card (262144 native context)',
    href: officialLinks.qwen36,
    official: true,
  },
];

export const CX_ARMS: CxArmRow[] = [
  {
    id: 'lean',
    shopper: 'Lean / short-context load',
    what: 'First ladder step. Feeds Minimum system RAM needed after a kit round (64 / 96 / 128 / 192 / 256 GB).',
    winner: CX_UNMEASURED,
    ram: `${RAM_MIN_LABEL}: ${CX_KIT_GB} GB kit from the measured ${CX_RAM_4K} GB llama-bench peak at 4K — labeled estimate until a ${CX_PACK} lean step lands`,
    note: 'House 4K llama-bench is not a ctx-ceiling lean card. Breakdown: 0% offload + OS / cache / headroom → 64 GB.',
  },
  {
    id: 'one-gpu',
    shopper: 'One GPU',
    what: 'Climb on a single card toward native max. Stop at the first OOM or load failure.',
    winner: CX_UNMEASURED,
    ram: `${RAM_FULL_LABEL}: ${CX_UNMEASURED} on ${CX_PACK}. Overnight house peak at 256K is ${CX_RAM_256K} GB (llama-bench, not the finder).`,
    note: `House overnight ran ${CX_NATIVE} on one R9700 with UD-Q5, f16 KV. That is not a ${CX_PACK} winner.`,
  },
  {
    id: 'all-gpus',
    shopper: 'All GPUs',
    what: 'Same climb across every visible device. Peak VRAM is per card and total.',
    winner: CX_UNMEASURED,
    ram: `${RAM_FULL_LABEL}: ${CX_UNMEASURED} on ${CX_PACK}. Do not copy a split llama-bench cell as an all-GPUs ceiling.`,
    note: 'One vs split decode lives on /compare/one-vs-two-gpu. Those cards are not ctx-ceiling.',
  },
];

export const CX_QUANTS: CxQuantRow[] = [
  {
    quant: 'Q6_K',
    file: 'Qwen3.6-35B-A3B-Q6_K.gguf',
    ceiling: CX_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: lean-step peak not recorded on a ${CX_PACK} card`,
    ramFull: `${RAM_FULL_LABEL}: winner peak not recorded on a ${CX_PACK} card`,
    note: 'Overnight llama-bench exists. Recommended. A ctx-ceiling winner stays not yet measured.',
    estimate: false,
  },
  {
    quant: 'UD-Q5_K_XL',
    file: CX_HOUSE_FILE,
    ceiling: CX_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: ${CX_KIT_GB} GB kit from the measured ${CX_RAM_4K} GB peak at 4K (llama-bench, not ${CX_PACK})`,
    ramFull: `${RAM_FULL_LABEL}: measured ${CX_RAM_256K} GB peak at 256K. ${CX_PACK} winner peak stays not yet measured.`,
    note: `House file. One-client decode ${CX_DECODE_4K} / ${CX_DECODE_32K} / ${CX_DECODE_128K} / ${CX_DECODE_256K} tok/s at 4K / 32K / 128K / 256K is llama-bench, not a ceiling finder.`,
    estimate: false,
  },
  {
    quant: 'Q4_K_M',
    file: 'Qwen3.6-35B-A3B-Q4_K_M.gguf',
    ceiling: CX_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: lean-step peak not recorded on a ${CX_PACK} card`,
    ramFull: `${RAM_FULL_LABEL}: winner peak not recorded on a ${CX_PACK} card`,
    note: 'Overnight llama-bench exists. Recommended floor for house recipes. Do not treat Q4 as a smaller-ceiling trick without a card.',
    estimate: false,
  },
  {
    quant: COMPARE_Q3,
    file: 'Qwen3.6-35B-A3B-UD-Q3_K_XL.gguf',
    ceiling: CX_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: ${CX_Q3_RAM.atSelected.kitGb} GB kit (labeled estimate)`,
    ramFull: `${RAM_FULL_LABEL}: ${CX_Q3_RAM.atFullContext.kitGb} GB kit (labeled estimate)`,
    note: `Labeled estimate (${COMPARE_Q3_CITE}). Do not download Q3 to run. Q3 does not buy a measured ceiling.`,
    estimate: true,
  },
];

export const CX_STEPS: CxStep[] = [
  {
    id: 'house-pin',
    title: 'Keep the house Vulkan pin — do not invent a ceiling',
    body: `Vulkan llama-server, ${CX_HOUSE_FILE}, ${CX_HOUSE_SERVER_FLAGS}. Overnight llama-bench ran ${CX_NATIVE}. That is not a ${CX_PACK} winner. House recipes stay Q4 and up. ${COMPARE_Q3} is a labeled estimate — do not download it to run.`,
    links: [
      { href: '/setup/server', label: 'Always-on server' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/models/qwen36', label: 'Qwen3.6-35B' },
    ],
  },
  {
    id: 'native-vs-lean',
    title: 'Separate native max from the lean ladder',
    body: `The Qwen3.6-35B-A3B card lists ${CX_NATIVE}. Lean starts short and climbs. Size -c on the calculator before you copy a 262K line onto a 16 GB card. Long-context shopper numbers live on /long-context.`,
    links: [
      { href: '/long-context', label: 'Long context' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/glossary#context-length', label: 'Glossary · context length' },
    ],
  },
  {
    id: 'one-vs-all',
    title: 'Run one GPU and all GPUs as separate arms',
    body: `${CX_PACK} records both. Peak VRAM is per card plus total. Do not blend a split llama-bench cell into an all-GPUs ceiling. Dual-card how-to is /multi-gpu. One vs split cards are /compare/one-vs-two-gpu.`,
    links: [
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
      { href: '/gpus/r9700', label: 'R9700' },
    ],
  },
  {
    id: 'oom-stops',
    title: 'Let OOM or a load failure stop the climb',
    body: 'The first fail reason is the answer, not a guessed next step. Cited ErrorOutOfDeviceMemory and hipErrorOutOfMemory live on /out-of-vram. Cutting -c is usually cheaper than a new card. KV type is /kv-cache.',
    links: [
      { href: '/out-of-vram', label: 'Out of VRAM' },
      { href: '/kv-cache', label: 'KV cache' },
      { href: '/troubleshoot#oom-context', label: 'Long-context OOM' },
    ],
  },
  {
    id: 'ram-lines',
    title: 'Map the winner onto the two RAM labels',
    body: `${RAM_MIN_LABEL} is the lean / short-context load rounded up to a real kit (64 / 96 / 128 / 192 / 256 GB) with a short breakdown — labeled estimate until measured. ${RAM_FULL_LABEL} is the winner’s measured peak first, kit round second. House numbers today are ${CX_RAM_4K} GB at 4K and ${CX_RAM_256K} GB at 256K from llama-bench, not ${CX_PACK}.`,
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/results', label: 'Run cards' },
    ],
  },
  {
    id: 'measure',
    title: 'Run amdai-bench ab-ctx-ceiling — do not invent a winner',
    body: `Stack Lab ships ${CX_PACK} (amdai-bench ${CX_BENCH_ID}, UI ${CX_UI}). Record decode, prefill, peak VRAM per card and total, peak system RAM per passing step, and the first fail reason. Export a ${REPORT_SCHEMA} pack and ingest with npx tsx src/scripts/amdai-bench.ts ingest pack.json. Packages are not published yet. Open the planner — do not invent a context-ceiling or max-context deep link. Companion write-up: docs/ctx-ceiling.md in Stack Lab.`,
    links: [
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/amdai-bench/lab-notes-report@1.schema.json', label: 'lab-notes-report/1' },
      { href: '/methodology', label: 'How we test' },
    ],
  },
];

export const CX_HOWTO_STEPS = CX_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const CX_FAQ: CxFaq[] = [
  {
    id: 'what-is-ceiling',
    question: "What's the biggest context I can run on a Radeon GPU with llama.cpp?",
    answer:
      'Native max is the model-card window (Qwen3.6-35B-A3B lists 262144). The real ceiling is the largest -c that still loads and serves on your box. Stack Lab ctx-ceiling/1 (amdai-bench ab-ctx-ceiling) climbs a lean ladder on one GPU and on all GPUs and stops at the first OOM or load failure. AMDai has not ingested a winner on the local desktop — not yet measured. House overnight llama-bench did run 262144 on UD-Q5, one R9700, f16 KV. Q3 is a labeled estimate. llama.cpp first.',
    links: [
      { href: '/context-ceiling', label: 'Context ceiling' },
      { href: '/long-context', label: 'Long context' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/stack-lab', label: 'Stack Lab' },
    ],
  },
  {
    id: 'ram-labels',
    question: 'How do Minimum system RAM needed and RAM needed at full context map to the ceiling finder?',
    answer:
      'Minimum system RAM needed is the lean / short-context load rounded up to a 64 / 96 / 128 / 192 / 256 GB kit, with a short breakdown, labeled estimate until a ctx-ceiling/1 lean step is ingested. House 4K llama-bench peak is 37.32 GB → 64 GB kit (0% offload + OS / cache / headroom). RAM needed at full context is the winner’s measured peak first; kit round second. House 256K llama-bench peak is 42.9 GB. A ctx-ceiling winner peak stays not yet measured.',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/long-context', label: 'Long context' },
      { href: '/kv-cache', label: 'KV cache' },
    ],
  },
  {
    id: '32gb-262k',
    question: 'Does 32 GB VRAM hold 262K?',
    answer:
      'On the measured house path, yes: UD-Q5_K_XL on one R9700, llama.cpp Vulkan, f16 KV, -c 262144, 0% RAM offload. Peak VRAM is 25.97 GB at 4K and 29.34 GB at 256K. That is llama-bench, not a ctx-ceiling/1 winner. A 16 GB or 12 GB card is a different fit — size it on the calculator and run ab-ctx-ceiling. Do not download Q3 to force 262K. Q3 is a labeled estimate.',
    links: [
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/out-of-vram', label: 'Out of VRAM' },
      { href: '/can-run', label: 'Can my Radeon run it?' },
    ],
  },
];

export const CX_HUB_LINKS: CxLink[] = [
  { href: '/long-context', label: 'Long context' },
  { href: '/kv-cache', label: 'KV cache' },
  { href: '/out-of-vram', label: 'Out of VRAM' },
  { href: '/multi-gpu', label: 'Dual / multi-GPU' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/stack-lab', label: 'Stack Lab' },
  { href: '/amdai-bench', label: 'amdai-bench' },
  { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
  { href: '/models/qwen36', label: 'Qwen3.6-35B' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
];

export const REQUIRED_CX_HREFS = [
  '/long-context',
  '/kv-cache',
  '/out-of-vram',
  '/multi-gpu',
  '/calculator',
  '/benchmarks',
  '/gpus/r9700',
  '/stack-lab',
  '/amdai-bench',
  '/amdai-bench/lab-notes-report@1.schema.json',
  '/compare/one-vs-two-gpu',
  '/models/qwen36',
  '/backends/llamacpp',
  '/troubleshoot#oom-context',
  '/results',
  '/methodology',
] as const;

export function cxBlob(): string {
  return [
    CX_TITLE,
    CX_H1,
    CX_DESCRIPTION,
    CX_LEAD,
    CX_WHAT,
    CX_LADDER,
    CX_CITED_LABEL,
    CX_RAM,
    CX_HOUSE,
    CX_LEAN,
    CX_RUN_IT,
    ...CX_STEPS.map((row) => `${row.title} ${row.body}`),
    ...CX_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...CX_QUANTS.map((row) => `${row.quant} ${row.file} ${row.ceiling} ${row.ramMin} ${row.ramFull} ${row.note}`),
    ...CX_ARMS.map((row) => `${row.shopper} ${row.what} ${row.winner} ${row.ram} ${row.note}`),
    ...CX_SOURCES.map((row) => `${row.title} ${row.official ? 'official' : 'unofficial'}`),
    `${RAM_MIN_LABEL} ${RAM_FULL_LABEL}`,
  ].join('\n');
}

export function cxHrefs(): string[] {
  const links = [
    ...CX_HUB_LINKS,
    ...CX_STEPS.flatMap((step) => step.links),
    ...CX_FAQ.flatMap((row) => row.links),
    ...CX_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertCxValid(): string[] {
  const errors: string[] = [];
  const blob = cxBlob();
  if (CX_PATH !== '/context-ceiling') errors.push('path');
  if (CX_PUBLISHED !== '2026-10-14') errors.push('published');
  if (CX_TITLE.length < 8) errors.push('title short');
  if (CX_DESCRIPTION.length < 70 || CX_DESCRIPTION.length > 160) {
    errors.push(`description length ${CX_DESCRIPTION.length}`);
  }
  if (!/AMDai/.test(blob)) errors.push('must say AMDai');
  if (!/llama\.cpp/.test(blob)) errors.push('must say llama.cpp');
  if (!/Vulkan/.test(blob)) errors.push('must say Vulkan');
  if (!/amdai-bench/.test(blob)) errors.push('must say amdai-bench');
  if (!blob.includes(CX_PACK)) errors.push('must name ctx-ceiling/1');
  if (!blob.includes(CX_BENCH_ID)) errors.push('must name ab-ctx-ceiling');
  if (!blob.includes(CX_UI)) errors.push('must name #ctx-ceiling');
  if (!/docs\/ctx-ceiling\.md/.test(blob)) errors.push('must cite docs/ctx-ceiling.md');
  if (!blob.includes(REPORT_SCHEMA)) errors.push('must name lab-notes-report/1');
  if (!/amdai-bench\.ts ingest/.test(blob)) errors.push('must cite ingest command');
  if (!blob.includes(CX_UNMEASURED)) errors.push('must keep unmeasured label');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('both RAM lines');
  if (!blob.includes(CX_HOUSE_FILE)) errors.push('house file');
  if (!blob.includes(CX_HOUSE_SERVER_FLAGS)) errors.push('house server flags');
  if (!/262144/.test(blob)) errors.push('house context');
  if (!blob.includes(COMPARE_Q3)) errors.push('q3 row');
  if (!/labeled estimate/.test(blob)) errors.push('q3 labeled');
  if (!/do not download Q3/.test(blob)) errors.push('must not recommend Q3');
  if (!/Q4 and up/.test(blob)) errors.push('must say Q4 and up');
  if (!/not yet measured/.test(blob)) errors.push('must say not yet measured');
  if (!/lean/.test(blob)) errors.push('must explain lean ladder');
  if (!/native max/.test(blob)) errors.push('must explain native max');
  if (!/one GPU/.test(blob)) errors.push('must explain one GPU');
  if (!/all GPU/i.test(blob)) errors.push('must explain all GPUs');
  if (BANNED.test(blob)) errors.push('banned model name');
  if (Q1Q2.test(blob)) errors.push('q1/q2 visible');
  if (Q4_FLOOR.test(blob)) errors.push('q4-floor wording');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/amdai-stack-lab:(?:\/\/)?(?:context-ceiling|max-context|ctx-ceiling)/.test(blob)) {
    errors.push('must not invent a context-ceiling deep link');
  }
  if (!CX_QUANTS.some((row) => row.estimate && row.quant === COMPARE_Q3)) {
    errors.push('q3 estimate row');
  }
  if (CX_QUANTS.some((row) => row.ceiling !== CX_UNMEASURED)) {
    errors.push('must not invent a ceiling cell');
  }
  if (CX_ARMS.some((row) => row.winner !== CX_UNMEASURED)) {
    errors.push('must not invent an arm winner');
  }
  const hrefs = cxHrefs();
  for (const required of REQUIRED_CX_HREFS) {
    const path = required.split('#')[0] ?? required;
    if (!hrefs.includes(path) && !hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}
