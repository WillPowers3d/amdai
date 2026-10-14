/**
 * Cited llama.cpp prompt / prefix cache on Radeon.
 * Official llama-server README: --cache-prompt (default on), --cache-reuse N
 * (default 0), -cram / --cache-ram N (default 8192 MiB), --slot-save-path,
 * --cache-idle-slots, cache_prompt on the completion API, POST /slots save/restore.
 * House llama-server does not record a cache pin. TTFT stays not yet measured.
 * Stack Lab ships prompt-cache-ab/1 (amdai-bench ab-prompt-cache, plus
 * ab-prompt-cache-status). No invented tok/s. llama.cpp Vulkan first.
 */

import { officialLinks } from './site';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { COMPARE_Q3, COMPARE_Q3_CITE, q3RamNeed } from './local-desktop-compare';
import { REPORT_HOWTO, REPORT_SCHEMA } from './lab-notes-report';

export const PC_PATH = '/prompt-cache';
export const PC_PUBLISHED = '2026-10-14';
export const PC_CITED_LABEL =
  'Cited llama.cpp --cache-prompt / --cache-reuse · llama-server TTFT not yet measured';
export const PC_PACK = 'prompt-cache-ab/1';
export const PC_BENCH_ID = 'ab-prompt-cache';
export const PC_STATUS_ID = 'ab-prompt-cache-status';
export const PC_UNMEASURED = 'not yet measured';

export const PC_TITLE = 'Prompt / prefix cache on Radeon';
export const PC_DESCRIPTION =
  'Prompt / prefix cache on a Radeon GPU with llama.cpp. Cited --cache-reuse and slot save. Measure Stack Lab prompt-cache-ab/1. Q3 is a labeled estimate.';

export const PC_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';
export const PC_PORT = 8080;
export const PC_RAM_4K = 37.32;
export const PC_RAM_256K = 42.9;
export const PC_KIT_GB = 64;
export const PC_VRAM_4K = 25.97;
export const PC_VRAM_256K = 29.34;
export const PC_DECODE_4K = 102.39;
export const PC_CACHE_RAM_MIB = 8192;
export const PC_HOUSE_SERVER_FLAGS =
  '-ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --jinja --host 127.0.0.1 --port 8080';

export const LLAMA_SERVER_README = 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md';
export const LLAMA_CACHE_RAM_PR = 'https://github.com/ggml-org/llama.cpp/pull/16391';

export const PC_Q3_RAM = q3RamNeed(1);

export type PcLink = { href: string; label: string };

export type PcSource = {
  id: string;
  title: string;
  href: string;
  official: boolean;
};

export type PcFaq = {
  id: string;
  question: string;
  answer: string;
  links: PcLink[];
};

export type PcStep = {
  id: string;
  title: string;
  body: string;
  links: PcLink[];
};

export type PcQuantRow = {
  quant: string;
  file: string;
  ttft: string;
  ramMin: string;
  ramFull: string;
  note: string;
  estimate: boolean;
};

export const PC_LEAD = `
  Hermes, coding tools, and chat UIs resend a long system prompt every turn.
  Official llama.cpp prompt caching reuses the common prefix so only the new
  suffix is prefilled. Shoppers search llama.cpp prompt cache AMD, llama-server
  cache-reuse, slot save restore, and why time to first token is slow. AMDai
  has not measured llama-server TTFT with versus without the cache on the local desktop,
  so every cache hit, miss, and first-token cell stays ${PC_UNMEASURED}. Stack
  Lab’s A/B is pack ${PC_PACK} (amdai-bench ${PC_BENCH_ID}, plus
  ${PC_STATUS_ID}). That pack is not an allowlisted Open-in-Stack-Lab deep
  link — open the planner, then ingest a ${REPORT_SCHEMA} pack. House daily
  driver is ${PC_HOUSE_FILE} on llama.cpp Vulkan, one R9700, 262144 context,
  f16 KV. House llama-server does not record --cache-reuse, --cache-ram, or
  --slot-save-path. ${COMPARE_Q3} is a labeled estimate (${COMPARE_Q3_CITE})
  — do not download Q3 to run. Q1/Q2 stay off.
`.replace(/\s+/g, ' ').trim();

export const PC_WHAT = `
  Prompt cache (also called prefix cache) keeps processed prompt tokens so a
  later request that shares a prefix skips that prefill. Official llama-server
  README: --cache-prompt / --no-cache-prompt enables it (default enabled;
  env LLAMA_ARG_CACHE_PROMPT). The completion API field cache_prompt does the
  same per request (default true): the common prefix is not re-processed, only
  the suffix. Official docs warn that logits are not guaranteed bit-for-bit
  identical across batch sizes, so enabling cache_prompt can be
  nondeterministic. --cache-reuse N is the min chunk size for reuse via KV
  shifting (default 0 = disabled; env LLAMA_ARG_CACHE_REUSE). It requires
  prompt caching to be on. n_cache_reuse on the API matches that flag.
`.replace(/\s+/g, ' ').trim();

export const PC_RAM_CACHE = `
  Official -cram / --cache-ram N sets the maximum prompt-cache size in MiB
  (default ${PC_CACHE_RAM_MIB}, -1 no limit, 0 disable; env LLAMA_ARG_CACHE_RAM).
  llama.cpp PR #16391 is the cited write-up. That ceiling is system RAM for
  cached prefixes, not VRAM for weights. House overnight UD-Q5 peaks stay
  ${PC_RAM_4K} GB at 4K and ${PC_RAM_256K} GB at 256K — those cards do not
  record --cache-ram. Adding the official ${PC_CACHE_RAM_MIB} MiB default on
  top of that process is a labeled estimate until a card measures it.
  --cache-idle-slots / --no-cache-idle-slots saves idle slots into the prompt
  cache on a new task and clears them when using unified KV (default enabled;
  requires cache-ram; env LLAMA_ARG_CACHE_IDLE_SLOTS).
`.replace(/\s+/g, ' ').trim();

export const PC_SLOTS = `
  Official --slot-save-path PATH enables saving a slot’s KV / prompt cache to
  disk (default disabled; env LLAMA_ARG_SLOT_SAVE_PATH). POST
  /slots/{id_slot}?action=save and action=restore take a filename under that
  directory. -np / --parallel is the slot count. -kvu / --kv-unified shares
  one KV buffer across sequences (default on when slots are auto).
  --cache-idle-slots then parks an idle slot into the prompt cache so a
  unified buffer can take the next task. House daily driver stays one
  interactive slot. Slot save/restore TTFT stays ${PC_UNMEASURED}. Shopper
  page for slots: /concurrency-ab.
`.replace(/\s+/g, ' ').trim();

export const PC_WHEN = `
  The cache helps when the prefix is stable: a long Hermes system prompt, a
  coding-tool preamble, thinking-mode instructions, or RAG with a fixed
  lead-in. The next turn then prefills only the new user text. It does not
  help a one-shot prompt, and it does not help when the prefix changes every
  request (rotating tools, a rewritten system message, or a RAG pack that
  prepends different chunks). Do not copy the overnight ${PC_DECODE_4K} tok/s
  4K decode cell as a cache-hit TTFT. That number is llama-bench, one client,
  not a prefix-cache A/B.
`.replace(/\s+/g, ' ').trim();

export const PC_RAM = `
  ${RAM_MIN_LABEL} on one R9700 with the house UD-Q5 is a ${PC_KIT_GB} GB kit
  from the measured ${PC_RAM_4K} GB peak at 4K. ${RAM_FULL_LABEL} uses the
  measured ${PC_RAM_256K} GB peak at 256K. Those are llama-bench cards with
  0% RAM offload and no recorded --cache-ram. Official default --cache-ram
  ${PC_CACHE_RAM_MIB} MiB can grow system RAM for cached prefixes — labeled
  estimate unless a card measures the peak. ${COMPARE_Q3} is a labeled
  estimate. Do not download Q3 to run.
`.replace(/\s+/g, ' ').trim();

export const PC_HOUSE = `# House daily driver as recorded (no --cache-reuse / --cache-ram / --slot-save-path pin).
# llama-server README: --cache-prompt default on; --cache-reuse 0; --cache-ram 8192 MiB.
# Those defaults are official docs — not a local desktop pin we will invent.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${PC_HOUSE_FILE} \\
  ${PC_HOUSE_SERVER_FLAGS}`;

export const PC_DOCS = `# Official llama.cpp defaults from the server README — not a house pin.
# --cache-prompt (default on; env LLAMA_ARG_CACHE_PROMPT).
# --cache-reuse 0 disables KV-shift reuse (env LLAMA_ARG_CACHE_REUSE).
# --cache-ram 8192 MiB (0 disables, -1 unlimited; env LLAMA_ARG_CACHE_RAM).
# Measure ${PC_PACK} (amdai-bench ${PC_BENCH_ID}) before you keep a new pin.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${PC_HOUSE_FILE} \\
  -ngl 99 -c 262144 --cache-prompt --cache-reuse 0 --cache-ram ${PC_CACHE_RAM_MIB} \\
  --cache-type-k f16 --cache-type-v f16 --jinja \\
  --host 127.0.0.1 --port ${PC_PORT}`;

export const PC_SLOT_SAVE = `# Slot save/restore. Official --slot-save-path default is disabled.
# POST /slots/{id_slot}?action=save and action=restore write under this directory.
# Not a local desktop pin. Slot TTFT stays ${PC_UNMEASURED}.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${PC_HOUSE_FILE} \\
  -ngl 99 -c 262144 --slot-save-path /path/to/slot-cache \\
  --cache-type-k f16 --cache-type-v f16 --jinja \\
  --host 127.0.0.1 --port ${PC_PORT}`;

export const PC_RUN_IT = `# Stack Lab pack ${PC_PACK}. Not an allowlisted deep link — open the planner.
amdai-bench ${PC_BENCH_ID}
amdai-bench ${PC_STATUS_ID}

# Export a ${REPORT_SCHEMA} pack from Stack Lab, then ingest into Lab Notes.
# Each row must be a validating amdai-bench/run@1 card. Do not hand-type tok/s.
${REPORT_HOWTO.commands.join('\n')}`;

export const PC_SOURCES: PcSource[] = [
  {
    id: 'llama-server',
    title:
      'llama.cpp — llama-server README (--cache-prompt, --cache-reuse, --cache-ram, --slot-save-path, cache_prompt, POST /slots save/restore)',
    href: LLAMA_SERVER_README,
    official: true,
  },
  {
    id: 'llama-16391',
    title: 'llama.cpp PR #16391 — --cache-ram prompt-cache size limit',
    href: LLAMA_CACHE_RAM_PR,
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

export const PC_QUANTS: PcQuantRow[] = [
  {
    quant: 'Q6_K',
    file: 'Qwen3.6-35B-A3B-Q6_K.gguf',
    ttft: PC_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: peak system RAM not recorded on a prompt-cache card`,
    ramFull: `${RAM_FULL_LABEL}: peak system RAM not recorded on a prompt-cache card`,
    note: 'Overnight llama-bench exists. Prompt-cache TTFT stays not yet measured.',
    estimate: false,
  },
  {
    quant: 'UD-Q5_K_XL',
    file: PC_HOUSE_FILE,
    ttft: PC_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: ${PC_KIT_GB} GB kit from the measured ${PC_RAM_4K} GB peak at 4K (no --cache-ram on that card)`,
    ramFull: `${RAM_FULL_LABEL}: measured ${PC_RAM_256K} GB peak at 256K. Official --cache-ram ${PC_CACHE_RAM_MIB} MiB is a labeled estimate on top.`,
    note: `House file. One-client ${PC_DECODE_4K} tok/s decode at 4K is llama-bench, not a cache-hit TTFT.`,
    estimate: false,
  },
  {
    quant: 'Q4_K_M',
    file: 'Qwen3.6-35B-A3B-Q4_K_M.gguf',
    ttft: PC_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: peak system RAM not recorded on a prompt-cache card`,
    ramFull: `${RAM_FULL_LABEL}: peak system RAM not recorded on a prompt-cache card`,
    note: 'Overnight llama-bench exists. Recommended floor for house recipes. Cache A/B still needs prompt-cache-ab/1.',
    estimate: false,
  },
  {
    quant: COMPARE_Q3,
    file: 'Qwen3.6-35B-A3B-UD-Q3_K_XL.gguf',
    ttft: PC_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: ${PC_Q3_RAM.atSelected.kitGb} GB kit (labeled estimate)`,
    ramFull: `${RAM_FULL_LABEL}: ${PC_Q3_RAM.atFullContext.kitGb} GB kit (labeled estimate)`,
    note: `Labeled estimate (${COMPARE_Q3_CITE}). Do not download Q3 to run. Q3 does not buy a prompt-cache TTFT.`,
    estimate: true,
  },
];

export const PC_STEPS: PcStep[] = [
  {
    id: 'house-pin',
    title: 'Keep the house Vulkan pin — do not invent a cache flag',
    body: `Vulkan llama-server, ${PC_HOUSE_FILE}, ${PC_HOUSE_SERVER_FLAGS}. Official --cache-prompt is on by default. House recipes do not record --cache-reuse, --cache-ram, or --slot-save-path. House recipes stay Q4 and up. ${COMPARE_Q3} is a labeled estimate — do not download it to run.`,
    links: [
      { href: '/setup/server', label: 'Always-on server' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/models/qwen36', label: 'Qwen3.6-35B' },
    ],
  },
  {
    id: 'prefix',
    title: 'Reuse a stable prefix — skip a changing one',
    body: 'Official cache_prompt reuses the common prefix and prefills only the suffix. That helps Hermes, a coding tool, thinking instructions, or RAG with a fixed preamble. It does not help a one-shot prompt or a prefix that changes every turn. TTFT with versus without the cache stays not yet measured.',
    links: [
      { href: '/harnesses', label: 'Harnesses' },
      { href: '/thinking', label: 'Thinking mode' },
      { href: '/rag', label: 'RAG' },
    ],
  },
  {
    id: 'reuse-ram',
    title: 'Cite --cache-reuse and --cache-ram before you raise them',
    body: `Official --cache-reuse N is the min chunk for KV-shift reuse (default 0 = off). --cache-ram N is the MiB ceiling (default ${PC_CACHE_RAM_MIB}; 0 disables; -1 unlimited). ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL} stay the measured 64 GB kit from 37.32 / 42.9 GB unless a card records a cache-ram peak — extra cache RAM is a labeled estimate.`,
    links: [
      { href: '/kv-cache', label: 'KV cache' },
      { href: '/long-context', label: 'Long context' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'slots',
    title: 'Size slots before you save them to disk',
    body: 'Official --slot-save-path enables POST /slots save and restore. -np is the slot count. --kv-unified shares one KV buffer; --cache-idle-slots parks an idle slot into the prompt cache. House path is one interactive user. Slot TTFT stays not yet measured. Do not copy a one-client 35B tok/s as a restore figure.',
    links: [
      { href: '/concurrency-ab', label: 'Parallel slots' },
      { href: '/setup/server', label: 'Always-on server' },
      { href: '/kv-cache', label: 'KV cache' },
    ],
  },
  {
    id: 'measure',
    title: 'Run amdai-bench ab-prompt-cache — do not invent TTFT',
    body: `Stack Lab ships ${PC_PACK} (amdai-bench ${PC_BENCH_ID}, plus ${PC_STATUS_ID}). Record TTFT on a cache hit versus a miss, peak VRAM, and both RAM lines. Export a ${REPORT_SCHEMA} pack and ingest with npx tsx src/scripts/amdai-bench.ts ingest pack.json. Packages are not published yet. Open the planner — do not invent a prompt-cache deep link.`,
    links: [
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/results', label: 'Run cards' },
      { href: '/methodology', label: 'How we test' },
    ],
  },
];

export const PC_HOWTO_STEPS = PC_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const PC_FAQ: PcFaq[] = [
  {
    id: 'what-is-prompt-cache',
    question: 'What does llama.cpp prompt / prefix cache do on a Radeon?',
    answer:
      'Official llama-server reuses processed prefix tokens so a later request only prefills the new suffix. --cache-prompt is on by default. --cache-reuse N is KV-shift reuse (default 0 = off). AMDai has not measured TTFT with versus without the cache on the local desktop — not yet measured. Run Stack Lab prompt-cache-ab/1 (amdai-bench ab-prompt-cache). Q3 is a labeled estimate. llama.cpp first.',
    links: [
      { href: '/prompt-cache', label: 'Prompt cache' },
      { href: '/kv-cache', label: 'KV cache' },
      { href: '/prefill', label: 'Prefill' },
    ],
  },
  {
    id: 'when-helps',
    question: 'When does prompt cache help Hermes or a coding tool?',
    answer:
      'When the system prompt stays put across turns. Official cache_prompt skips that prefix. It does not help a one-shot prompt or a prefix that changes every request. House llama-server does not record a --cache-reuse pin. TTFT stays not yet measured — run amdai-bench ab-prompt-cache. The shopper page is /prompt-cache.',
    links: [
      { href: '/harnesses', label: 'Harnesses' },
      { href: '/thinking', label: 'Thinking mode' },
      { href: '/setup/server', label: 'Always-on server' },
    ],
  },
  {
    id: 'cache-ram-slots',
    question: 'Does --cache-ram or slot save change system RAM?',
    answer:
      'Official --cache-ram default is 8192 MiB of prompt-cache ceiling (0 disables, -1 unlimited). Slot save writes KV to --slot-save-path on disk. House measured peaks are 37.32 GB at 4K and 42.9 GB at 256K without a cache-ram pin. Extra cache RAM is a labeled estimate unless a card measures it. Print both Minimum system RAM needed and RAM needed at full context.',
    links: [
      { href: '/concurrency-ab', label: 'Parallel slots' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/stack-lab', label: 'Stack Lab' },
    ],
  },
];

export const PC_HUB_LINKS: PcLink[] = [
  { href: '/kv-cache', label: 'KV cache' },
  { href: '/long-context', label: 'Long context' },
  { href: '/harnesses', label: 'Harnesses' },
  { href: '/concurrency-ab', label: 'Parallel slots' },
  { href: '/thinking', label: 'Thinking mode' },
  { href: '/setup/server', label: 'Always-on server' },
  { href: '/prefill', label: 'Prefill' },
  { href: '/rag', label: 'RAG' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/models/qwen36', label: 'Qwen3.6-35B' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/amdai-bench', label: 'amdai-bench' },
  { href: '/stack-lab', label: 'Stack Lab' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/start', label: 'Getting started' },
];

export const REQUIRED_PC_HREFS = [
  '/kv-cache',
  '/long-context',
  '/harnesses',
  '/concurrency-ab',
  '/thinking',
  '/setup/server',
  '/prefill',
  '/rag',
  '/backends/llamacpp',
  '/models/qwen36',
  '/gpus/r9700',
  '/benchmarks',
  '/amdai-bench',
  '/stack-lab',
  '/calculator',
  '/results',
  '/methodology',
] as const;

export function pcBlob(): string {
  return [
    PC_TITLE,
    PC_DESCRIPTION,
    PC_LEAD,
    PC_WHAT,
    PC_RAM_CACHE,
    PC_SLOTS,
    PC_WHEN,
    PC_CITED_LABEL,
    PC_RAM,
    PC_HOUSE,
    PC_DOCS,
    PC_SLOT_SAVE,
    PC_RUN_IT,
    ...PC_STEPS.map((row) => `${row.title} ${row.body}`),
    ...PC_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...PC_QUANTS.map((row) => `${row.quant} ${row.file} ${row.ttft} ${row.ramMin} ${row.ramFull} ${row.note}`),
    ...PC_SOURCES.map((row) => `${row.title} ${row.official ? 'official' : 'unofficial'}`),
    `${RAM_MIN_LABEL} ${RAM_FULL_LABEL}`,
  ].join('\n');
}

export function pcHrefs(): string[] {
  const links = [
    ...PC_HUB_LINKS,
    ...PC_STEPS.flatMap((step) => step.links),
    ...PC_FAQ.flatMap((row) => row.links),
    ...PC_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertPcValid(): string[] {
  const errors: string[] = [];
  const blob = pcBlob();
  if (PC_PATH !== '/prompt-cache') errors.push('path');
  if (PC_PUBLISHED !== '2026-10-14') errors.push('published');
  if (PC_TITLE.length < 8) errors.push('title short');
  if (PC_DESCRIPTION.length < 70 || PC_DESCRIPTION.length > 160) {
    errors.push(`description length ${PC_DESCRIPTION.length}`);
  }
  if (!/AMDai/.test(blob)) errors.push('must say AMDai');
  if (!/llama\.cpp/.test(blob)) errors.push('must say llama.cpp');
  if (!/Vulkan/.test(blob)) errors.push('must say Vulkan');
  if (!/--cache-prompt/.test(blob)) errors.push('must cite --cache-prompt');
  if (!/--cache-reuse/.test(blob)) errors.push('must cite --cache-reuse');
  if (!/--cache-ram/.test(blob)) errors.push('must cite --cache-ram');
  if (!/--slot-save-path/.test(blob)) errors.push('must cite --slot-save-path');
  if (!/LLAMA_ARG_CACHE_PROMPT/.test(blob)) errors.push('must cite LLAMA_ARG_CACHE_PROMPT');
  if (!/LLAMA_ARG_CACHE_REUSE/.test(blob)) errors.push('must cite LLAMA_ARG_CACHE_REUSE');
  if (!/LLAMA_ARG_CACHE_RAM/.test(blob)) errors.push('must cite LLAMA_ARG_CACHE_RAM');
  if (!/LLAMA_ARG_SLOT_SAVE_PATH/.test(blob)) errors.push('must cite LLAMA_ARG_SLOT_SAVE_PATH');
  if (!/cache_prompt/.test(blob)) errors.push('must cite cache_prompt API');
  if (!/\/slots\//.test(blob)) errors.push('must cite /slots save/restore');
  if (!blob.includes(PC_PACK)) errors.push('must name prompt-cache-ab/1');
  if (!blob.includes(PC_BENCH_ID)) errors.push('must name amdai-bench ab-prompt-cache');
  if (!blob.includes(PC_STATUS_ID)) errors.push('must name ab-prompt-cache-status');
  if (!blob.includes(REPORT_SCHEMA)) errors.push('must name lab-notes-report/1');
  if (!/amdai-bench\.ts ingest/.test(blob)) errors.push('must cite ingest command');
  if (!blob.includes(PC_UNMEASURED)) errors.push('must keep unmeasured label');
  if (!/TTFT/.test(blob)) errors.push('must mention TTFT');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('both RAM lines');
  if (!blob.includes(PC_HOUSE_FILE)) errors.push('house file');
  if (!blob.includes(PC_HOUSE_SERVER_FLAGS)) errors.push('house server flags');
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
  if (/amdai-stack-lab:(?:\/\/)?prompt-cache/.test(blob)) {
    errors.push('must not invent a prompt-cache deep link');
  }
  if (!PC_QUANTS.some((row) => row.estimate && row.quant === COMPARE_Q3)) {
    errors.push('q3 estimate row');
  }
  if (PC_QUANTS.some((row) => row.ttft !== PC_UNMEASURED)) {
    errors.push('must not invent a TTFT cell');
  }
  const hrefs = pcHrefs();
  for (const required of REQUIRED_PC_HREFS) {
    if (!hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}
