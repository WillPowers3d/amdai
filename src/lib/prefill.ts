/**
 * Cited llama.cpp prompt processing (prefill) on Radeon: -b vs -ub.
 * Official: server README -b / --batch-size logical (default 2048, LLAMA_ARG_BATCH);
 * -ub / --ubatch-size physical (default 512, LLAMA_ARG_UBATCH).
 * House llama-server does not record a -b / -ub pin. Overnight 35B llama-bench
 * prefill cells are not a llama-server A/B. Stack Lab ships prefill-ab/1
 * (amdai-bench ab-prefill). No invented speedups. llama.cpp Vulkan first.
 */

import { officialLinks } from './site';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { COMPARE_Q3, COMPARE_Q3_CITE, q3RamNeed } from './local-desktop-compare';

export const PP_PATH = '/prefill';
export const PP_PUBLISHED = '2026-10-14';
export const PP_CITED_LABEL = 'Cited llama.cpp --batch-size / --ubatch-size · llama-server -b / -ub not measured';
export const PP_PACK = 'prefill-ab/1';
export const PP_UNMEASURED = 'not measured yet, run amdai-bench ab-prefill';
export const PP_BENCH_ID = 'ab-prefill';

export const PP_TITLE = 'Faster prompt processing (prefill) on Radeon';
export const PP_DESCRIPTION =
  'Faster prompt processing (prefill) on a Radeon GPU with llama.cpp. Cited -b / -ub. Measure Stack Lab prefill-ab/1. Q3 is a labeled estimate.';

export const PP_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';
export const PP_PORT = 8080;
export const PP_RAM_4K = 37.32;
export const PP_RAM_256K = 42.9;
export const PP_KIT_GB = 64;
export const PP_VRAM_4K = 25.97;
export const PP_VRAM_256K = 29.34;
export const PP_DECODE_4K = 102.39;
export const PP_HOUSE_BENCH =
  '-dev Vulkan1 -sm layer -ngl 99 -fitt 1024 -fa 1 -ctk f16 -ctv f16';
export const PP_HOUSE_SERVER_FLAGS =
  '-ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --jinja --host 127.0.0.1 --port 8080';

export const LLAMA_CLI_README = 'https://github.com/ggml-org/llama.cpp/blob/HEAD/tools/cli/README.md';
export const LLAMA_MULTI_GPU_MD = 'https://github.com/ggml-org/llama.cpp/blob/master/docs/multi-gpu.md';
export const LLAMA_SERVER_README = 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md';
export const LLAMA_ISSUE_14836 = 'https://github.com/ggml-org/llama.cpp/issues/14836';

export const PP_Q3_RAM = q3RamNeed(1);

export type PpLink = { href: string; label: string };

export type PpSource = {
  id: string;
  title: string;
  href: string;
  official: boolean;
};

export type PpFaq = {
  id: string;
  question: string;
  answer: string;
  links: PpLink[];
};

export type PpStep = {
  id: string;
  title: string;
  body: string;
  links: PpLink[];
};

export type PpQuantRow = {
  quant: string;
  file: string;
  prefill: string;
  vram: string;
  ramMin: string;
  ramFull: string;
  note: string;
  estimate: boolean;
};

export type PpCardRow = {
  id: string;
  name: string;
  vramGb: number;
  href: string;
  note: string;
};

export type PpPrefillCell = {
  quant: string;
  at4k: string;
  at32k: string;
  at128k: string;
  at256k: string;
  note: string;
};

export const PP_LEAD = `
  Long Hermes, coding-tool, and RAG prompts are bound by prefill (prompt
  processing), not decode. Official llama.cpp -b / --batch-size is the
  logical maximum batch (default 2048; env LLAMA_ARG_BATCH). -ub /
  --ubatch-size is the physical micro-batch that hits the GPU (default 512;
  env LLAMA_ARG_UBATCH). AMDai has not measured llama-server -b / -ub on
  local desktop, so every server batch delta stays ${PP_UNMEASURED}. Stack Lab’s
  A/B is pack ${PP_PACK} (amdai-bench ${PP_BENCH_ID}). That pack is not an
  allowlisted Open-in-Stack-Lab deep link — open the planner, then record a
  card. House daily driver is ${PP_HOUSE_FILE} on llama.cpp Vulkan, one
  R9700, 262144 context, f16 KV. House llama-server does not record a -b /
  -ub pin.   ${COMPARE_Q3} is a labeled estimate (${COMPARE_Q3_CITE}) — do not
  download Q3 to run. Q1/Q2 stay off.
`.replace(/\s+/g, ' ').trim();

export const PP_WHAT = `
  -b is how much prompt llama.cpp plans for. -ub is the chunk the GPU
  actually computes. Official llama-server README: -b / --batch-size N is
  the logical maximum batch size (default 2048; env LLAMA_ARG_BATCH). -ub /
  --ubatch-size N is the physical maximum batch size (default 512; env
  LLAMA_ARG_UBATCH). The CLI README documents the same pair. A larger -b
  with a smaller -ub still processes the prompt in -ub-sized pieces. House
  recipes do not pin either flag — the binary default applies unless you
  set one. Do not treat the overnight llama-bench prefill cell as a
  llama-server -b pin.
`.replace(/\s+/g, ' ').trim();

export const PP_FA = `
  Flash attention is a fused attention kernel. Official CLI is -fa /
  --flash-attn on|off|auto (default auto; env LLAMA_ARG_FLASH_ATTN).
  Overnight house 35B Vulkan llama-bench recorded -fa 1 on the same line
  as the cited prefill cells. llama.cpp multi-gpu.md requires flash
  attention for --split-mode tensor and/or a quantized V cache. When FA
  works it usually cuts attention VRAM, which can leave more room for a
  larger -ub — that leftover is not measured as a -b / -ub delta. llama-server
  FA on versus off stays ${PP_UNMEASURED}. Shopper page: /flash-attention.
`.replace(/\s+/g, ' ').trim();

export const PP_KV = `
  House default is f16 KV: overnight cards recorded -ctk f16 -ctv f16
  (same as --cache-type-k f16 --cache-type-v f16). q8_0 and q4_0 shrink the
  estimated cache and can free VRAM for a bigger physical micro-batch.
  llama.cpp multi-gpu.md requires FA for a quantized V cache — turn -fa on
  before -ctv q8_0 or -ctv q4_0. Quality and tok/s for those KV types stay
  not measured yet. Overnight peak VRAM on UD-Q5 is ${PP_VRAM_4K} GB at 4K
  and ${PP_VRAM_256K} GB at 256K on a 32 GB R9700. Those cards already have
  -fa 1 and f16 KV. They are not a -b / -ub A/B.
`.replace(/\s+/g, ' ').trim();

export const PP_CTX = `
  Context size grows the KV cache. House window is 262144. Official UD-Q5
  one-GPU VRAM is ${PP_VRAM_4K} GB at 4K and ${PP_VRAM_256K} GB at 256K —
  leftover on a 32 GB R9700 shrinks as -c rises. A larger -ub needs a
  bigger transient compute buffer. llama.cpp #14836 failed to allocate
  Vulkan compute pp buffers at -b 4096 -ub 4096. Cut -ub when the log
  shows that allocate, then measure ${PP_PACK}. Do not invent a 262K
  speedup.
`.replace(/\s+/g, ' ').trim();

export const PP_VRAM = `
  Unused VRAM after weights + KV is the shopper headroom for a bigger -ub.
  Official /gpus VRAM is the published card size, not a measured -ub pin.
  House 32 GB R9700 at 256K UD-Q5 leaves about 2.7 GB after the measured
  ${PP_VRAM_256K} GB peak. A 48 GB W7900 publishes more unused VRAM than
  that 32 GB class. A 24 GB RX 7900 XTX cannot hold the house 256K UD-Q5
  peak (29.34 GB). House 4K Q4_K_M is 21.43 GB — that already misses 20 GB
  and 16 GB cards. Do not invent an -ub that fits a SKU we did not measure.
`.replace(/\s+/g, ' ').trim();

export const PP_TRADEOFF = `
  Larger -ub can raise prefill when the GPU has unused VRAM for the
  compute buffer. Smaller -ub can fit a tight card and slow prompt ingest.
  Quality is unchanged if the GGUF stays the same. AMDai has not measured
  llama-server -b / -ub, so every server prefill, VRAM, and RAM delta stays
  ${PP_UNMEASURED}. Overnight llama-bench prefill cells below are one-client
  Vulkan cards with ${PP_HOUSE_BENCH} — not a -b / -ub sweep. Do not copy
  2761.6 tok/s at 4K as a “bigger batch” figure.
`.replace(/\s+/g, ' ').trim();

export const PP_RAM = `
  ${RAM_MIN_LABEL} on one R9700 with the house UD-Q5 is a ${PP_KIT_GB} GB
  kit from the measured ${PP_RAM_4K} GB peak at 4K (weights + KV +
  overhead on GPU RAM plus total system DDR — not a file-cache versus
  anonymous split). ${RAM_FULL_LABEL} uses the measured ${PP_RAM_256K} GB
  peak at 256K. Those are llama-bench cards with 0% RAM offload, one
  client. They are not a llama-server -b / -ub measurement. Q6_K at 32K
  and up is partly on DDR5 (--fit-target 1024) — both RAM labels appear
  there; the peak kit on those cells is not recorded. ${COMPARE_Q3} is a
  labeled estimate. Do not download Q3 to run.
`.replace(/\s+/g, ' ').trim();

export const PP_HOUSE = `# House daily driver as recorded (no -b / -ub pin).
# llama-server README defaults: -b 2048 (LLAMA_ARG_BATCH), -ub 512 (LLAMA_ARG_UBATCH).
# Those defaults are official docs — not a local desktop pin we will invent.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${PP_HOUSE_FILE} \\
  ${PP_HOUSE_SERVER_FLAGS}`;

export const PP_DOCS = `# Official llama.cpp defaults from the server README — not a house pin.
# Measure ${PP_PACK} (amdai-bench ${PP_BENCH_ID}) before you keep a new -b / -ub.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${PP_HOUSE_FILE} \\
  -ngl 99 -c 262144 -b 2048 -ub 512 \\
  --cache-type-k f16 --cache-type-v f16 --jinja \\
  --host 127.0.0.1 --port ${PP_PORT}`;

export const PP_BENCH = `# Overnight 35B llama-bench recorded this Vulkan line (not llama-server).
# No -b / -ub on the card. Prefill cells are llama-bench pp, not a batch A/B.
./build-vk/bin/llama-bench \\
  -m /path/to/nvme/${PP_HOUSE_FILE} \\
  ${PP_HOUSE_BENCH}`;

export const PP_FLASH = `# Hermes Flash llama.cpp shape as recorded. -b / -ub not recorded.
# Exact -ot tensor regex and --n-cpu-moe N are not recorded from the rig owner.
# Strata Flash stays on 127.0.0.1:8083 so llama-server can keep :8080.
# Flash prefill: ${PP_UNMEASURED}.
./build-vk/bin/llama-server \\
  -m ~/models/UD-Q6_K_XL \\
  -ngl 99 \\
  -c 262144 \\
  --n-cpu-moe not recorded \\
  -ot not recorded \\
  --cache-type-k f16 \\
  --cache-type-v f16 \\
  --host 127.0.0.1 --port ${PP_PORT}`;

export const PP_SOURCES: PpSource[] = [
  {
    id: 'llama-server',
    title: 'llama.cpp — llama-server README (-b / --batch-size, -ub / --ubatch-size, LLAMA_ARG_BATCH / LLAMA_ARG_UBATCH)',
    href: LLAMA_SERVER_README,
    official: true,
  },
  {
    id: 'llama-cli',
    title: 'llama.cpp — CLI README (same -b / -ub pair)',
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
    id: 'llama-14836',
    title: 'llama.cpp #14836 — failed to allocate compute pp buffers at -b 4096 -ub 4096',
    href: LLAMA_ISSUE_14836,
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

export const PP_PREFILL_CELLS: PpPrefillCell[] = [
  {
    quant: 'UD-Q5_K_XL',
    at4k: '2761.6',
    at32k: '1937.9',
    at128k: '942.8',
    at256k: '519.2',
    note: 'House file. llama-bench, one R9700, f16 KV, -fa 1. Not a llama-server -b / -ub A/B.',
  },
  {
    quant: 'Q6_K',
    at4k: '2623.6',
    at32k: '1683',
    at128k: '800.3',
    at256k: '471.6',
    note: 'llama-bench. A second 4K card recorded 2621.7 tok/s. 32K and up partly on DDR5 (--fit-target 1024).',
  },
  {
    quant: 'Q5_K_M',
    at4k: '2710.8',
    at32k: '1902.6',
    at128k: '940.3',
    at256k: '541.7',
    note: 'llama-bench, one R9700, f16 KV. Not a llama-server -b / -ub A/B.',
  },
  {
    quant: 'Q4_K_M',
    at4k: '2733.9',
    at32k: '1902.1',
    at128k: '942.1',
    at256k: '558.5',
    note: 'llama-bench, one R9700, f16 KV. Recommended floor for house recipes.',
  },
];

export const PP_QUANTS: PpQuantRow[] = [
  {
    quant: 'Q6_K',
    file: 'Qwen3.6-35B-A3B-Q6_K.gguf',
    prefill: '2623.6 / 1683 / 800.3 / 471.6 tok/s at 4K / 32K / 128K / 256K (llama-bench)',
    vram: '29.26 GB at 4K (sibling 29.32) · 29.3 GB at 256K',
    ramMin: `${RAM_MIN_LABEL}: not recorded on the Q6 cells — ${PP_UNMEASURED}`,
    ramFull: `${RAM_FULL_LABEL}: 32K and up partly on DDR5 (--fit-target 1024); peak kit not recorded`,
    note: 'RAM offload appears at 32K and up. llama-server -b / -ub stays not measured yet.',
    estimate: false,
  },
  {
    quant: 'UD-Q5_K_XL',
    file: PP_HOUSE_FILE,
    prefill: '2761.6 / 1937.9 / 942.8 / 519.2 tok/s at 4K / 32K / 128K / 256K (llama-bench)',
    vram: `${PP_VRAM_4K} GB at 4K · ${PP_VRAM_256K} GB at 256K`,
    ramMin: `${RAM_MIN_LABEL}: ${PP_KIT_GB} GB kit from the measured ${PP_RAM_4K} GB peak at 4K`,
    ramFull: `${RAM_FULL_LABEL}: measured ${PP_RAM_256K} GB peak at 256K (0% RAM offload)`,
    note: `House file. One-client ${PP_DECODE_4K} tok/s decode at 4K is llama-bench, not a batch A/B.`,
    estimate: false,
  },
  {
    quant: 'Q4_K_M',
    file: 'Qwen3.6-35B-A3B-Q4_K_M.gguf',
    prefill: '2733.9 / 1902.1 / 942.1 / 558.5 tok/s at 4K / 32K / 128K / 256K (llama-bench)',
    vram: '21.43 GB at 4K · 27.03 GB at 256K',
    ramMin: `${RAM_MIN_LABEL}: peak system RAM not recorded on the Q4 cells`,
    ramFull: `${RAM_FULL_LABEL}: peak system RAM not recorded on the Q4 cells`,
    note: 'Recommended floor for house recipes. More unused VRAM than UD-Q5 at the same -c.',
    estimate: false,
  },
  {
    quant: COMPARE_Q3,
    file: 'Qwen3.6-35B-A3B-UD-Q3_K_XL.gguf',
    prefill: 'not measured',
    vram: `Publisher listing 16.8 GB (${COMPARE_Q3_CITE})`,
    ramMin: `${RAM_MIN_LABEL}: ${PP_Q3_RAM.atSelected.kitGb} GB kit (labeled estimate)`,
    ramFull: `${RAM_FULL_LABEL}: ${PP_Q3_RAM.atFullContext.kitGb} GB kit (labeled estimate)`,
    note: `Labeled estimate (${COMPARE_Q3_CITE}). Do not download Q3 to run. Q3 does not buy a prefill tok/s.`,
    estimate: true,
  },
];

export const PP_CARDS: PpCardRow[] = [
  {
    id: 'r9700',
    name: 'Radeon AI PRO R9700',
    vramGb: 32,
    href: '/gpus/r9700',
    note: `House card. Measured UD-Q5 peak ${PP_VRAM_4K} GB at 4K and ${PP_VRAM_256K} GB at 256K — about 2.7 GB leftover at 256K for a bigger -ub experiment.`,
  },
  {
    id: 'w7900',
    name: 'Radeon PRO W7900',
    vramGb: 48,
    href: '/gpus/w7900',
    note: 'Published 48 GB. More unused VRAM than the house 32 GB class after the same measured 29.34 GB 256K UD-Q5 peak. -ub still unmeasured.',
  },
  {
    id: 'w7800',
    name: 'Radeon PRO W7800',
    vramGb: 32,
    href: '/gpus/w7800',
    note: 'Published 32 GB — same VRAM class as the house R9700. Do not copy the R9700 leftover as a measured pin on this SKU.',
  },
  {
    id: 'rx-7900-xtx',
    name: 'Radeon RX 7900 XTX',
    vramGb: 24,
    href: '/gpus/rx-7900-xtx',
    note: 'Published 24 GB. House 256K UD-Q5 peak 29.34 GB does not fit. House 4K Q4_K_M is 21.43 GB — a little leftover, not a measured -ub.',
  },
  {
    id: 'rx-7900-xt',
    name: 'Radeon RX 7900 XT',
    vramGb: 20,
    href: '/gpus/rx-7900-xt',
    note: 'Published 20 GB. House 4K Q4_K_M is 21.43 GB — that file does not fit. Do not raise -ub on a card that cannot hold the weights + KV.',
  },
  {
    id: 'rx-9070-xt',
    name: 'Radeon RX 9070 XT',
    vramGb: 16,
    href: '/gpus/rx-9070-xt',
    note: 'Published 16 GB. House 4K Q4_K_M is 21.43 GB — 35B Q4 and up miss this class. Size a smaller model on the calculator.',
  },
];

export const PP_STEPS: PpStep[] = [
  {
    id: 'house-pin',
    title: 'Keep the house Vulkan pin — do not invent -b / -ub',
    body: `Vulkan llama-server, ${PP_HOUSE_FILE}, ${PP_HOUSE_SERVER_FLAGS}. That is the recorded house line. Official docs default to -b 2048 -ub 512 if you omit both. House recipes stay Q4 and up. ${COMPARE_Q3} is a labeled estimate — do not download it to run.`,
    links: [
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/models/qwen36', label: 'Qwen3.6-35B' },
    ],
  },
  {
    id: 'logical-vs-physical',
    title: 'Treat -b as logical and -ub as physical',
    body: 'Official llama-server README: -b / --batch-size is the logical maximum (default 2048; env LLAMA_ARG_BATCH). -ub / --ubatch-size is the physical maximum (default 512; env LLAMA_ARG_UBATCH). The CLI README documents the same pair. The GPU sees -ub-sized chunks. Copy the docs example only as a starting point, then measure.',
    links: [
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/setup/server', label: 'Always-on server' },
      { href: '/glossary#batch', label: 'Batch (-b)' },
    ],
  },
  {
    id: 'fa-kv-ctx',
    title: 'Size -fa, KV type, and -c before you raise -ub',
    body: 'Overnight cards already used -fa 1 and f16 KV. llama.cpp multi-gpu.md requires FA for tensor split and/or a quantized V cache. Larger -c grows KV and shrinks leftover VRAM — house UD-Q5 is 25.97 GB at 4K and 29.34 GB at 256K. llama.cpp #14836 failed compute pp buffers at -b 4096 -ub 4096. Cut -ub when that allocate appears.',
    links: [
      { href: '/flash-attention', label: 'Flash Attention' },
      { href: '/kv-cache', label: 'KV cache' },
      { href: '/long-context', label: 'Long context' },
    ],
  },
  {
    id: 'vram-headroom',
    title: 'Use leftover VRAM, not a guessed -ub, to pick a card',
    body: 'Published /gpus VRAM minus measured weights+KV is the only headroom we will quote. A 48 GB W7900 publishes more unused VRAM than the house 32 GB R9700 after the 29.34 GB 256K peak. 24 GB and below miss that 256K UD-Q5 cell. Do not invent an -ub that fits a SKU we did not measure.',
    links: [
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/gpus', label: 'GPU directory' },
      { href: '/out-of-vram', label: 'Out of VRAM' },
    ],
  },
  {
    id: 'hermes-rag',
    title: 'Long Hermes, tools, and RAG prompts are prefill-bound',
    body: 'Decode tok/s is chat feel. Prefill tok/s is prompt ingest. Official UD-Q5 4K is 2761.6 tok/s prefill and 102.39 decode; at 256K the same file is 519.2 / 44.4. Those are llama-bench, not a batch A/B. Flash / Hermes llama.cpp does not record -b / -ub. Flash prefill stays not measured yet, run amdai-bench ab-prefill.',
    links: [
      { href: '/rag', label: 'RAG' },
      { href: '/harnesses/hermes', label: 'Hermes' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
    ],
  },
  {
    id: 'measure',
    title: 'Measure Stack Lab prefill-ab/1 — do not invent tok/s',
    body: `Stack Lab ships ${PP_PACK} (amdai-bench ${PP_BENCH_ID}). Record decode, prefill, peak VRAM per card, and both RAM lines on one GPU and on all GPUs. Packages are not published yet and there is no public download. Open the planner — do not invent a prefill-ab deep link.`,
    links: [
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/results', label: 'Run cards' },
      { href: '/methodology', label: 'How we test' },
    ],
  },
];

export const PP_HOWTO_STEPS = PP_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const PP_FAQ: PpFaq[] = [
  {
    id: 'what-is-b-ub',
    question: 'What is the difference between llama.cpp -b and -ub?',
    answer:
      'Official llama-server README: -b / --batch-size is the logical maximum batch (default 2048; env LLAMA_ARG_BATCH). -ub / --ubatch-size is the physical micro-batch that hits the GPU (default 512; env LLAMA_ARG_UBATCH). House llama-server does not record a pin. llama-server -b / -ub stays not measured yet, run amdai-bench ab-prefill. Q3 is a labeled estimate. House recipes stay Q4 and up. llama.cpp first.',
    links: [
      { href: '/prefill', label: 'Prefill' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
  {
    id: 'when-raise-ub',
    question: 'When should I raise -ub on a Radeon?',
    answer:
      'After the file and KV fit, and only if unused VRAM remains for the compute buffer. Overnight UD-Q5 on one 32 GB R9700 peaks at 29.34 GB at 256K. llama.cpp #14836 failed compute pp buffers at -b 4096 -ub 4096. AMDai has not measured a larger -ub on the local desktop — run Stack Lab prefill-ab/1. Do not copy a llama-bench prefill cell as a batch speedup.',
    links: [
      { href: '/out-of-vram', label: 'Out of VRAM' },
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/stack-lab', label: 'Stack Lab' },
    ],
  },
  {
    id: 'prefill-vs-decode',
    question: 'Why do long Hermes and RAG prompts feel stuck when decode is fine?',
    answer:
      'Prefill ingests the prompt; decode streams the reply. Official UD-Q5 4K on one R9700 is 2761.6 tok/s prefill and 102.39 decode. At 256K the same file is 519.2 / 44.4. Those are llama-bench, not a llama-server -b / -ub A/B. Flash prefill stays not measured yet, run amdai-bench ab-prefill. The shopper page is /prefill.',
    links: [
      { href: '/glossary#prefill-decode', label: 'Prefill vs decode' },
      { href: '/rag', label: 'RAG' },
      { href: '/long-context', label: 'Long context' },
    ],
  },
];

export const PP_HUB_LINKS: PpLink[] = [
  { href: '/tuning', label: 'Speed up llama.cpp' },
  { href: '/flash-attention', label: 'Flash Attention' },
  { href: '/concurrency-ab', label: 'Parallel slots' },
  { href: '/long-context', label: 'Long context' },
  { href: '/kv-cache', label: 'KV cache' },
  { href: '/rag', label: 'RAG' },
  { href: '/out-of-vram', label: 'Out of VRAM' },
  { href: '/setup/server', label: 'Always-on server' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/models/qwen36', label: 'Qwen3.6-35B' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/amdai-bench', label: 'amdai-bench' },
  { href: '/stack-lab', label: 'Stack Lab' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/quants', label: 'Quants · KV types' },
  { href: '/start', label: 'Getting started' },
];

export const REQUIRED_PP_HREFS = [
  '/tuning',
  '/flash-attention',
  '/concurrency-ab',
  '/long-context',
  '/kv-cache',
  '/rag',
  '/out-of-vram',
  '/setup/server',
  '/backends/llamacpp',
  '/models/qwen36',
  '/gpus/r9700',
  '/benchmarks',
  '/amdai-bench',
  '/stack-lab',
  '/calculator',
  '/quants',
  '/results',
  '/harnesses/hermes',
] as const;

export function ppBlob(): string {
  return [
    PP_TITLE,
    PP_DESCRIPTION,
    PP_LEAD,
    PP_WHAT,
    PP_FA,
    PP_KV,
    PP_CTX,
    PP_VRAM,
    PP_TRADEOFF,
    PP_CITED_LABEL,
    PP_RAM,
    PP_HOUSE,
    PP_DOCS,
    PP_BENCH,
    PP_FLASH,
    ...PP_STEPS.map((row) => `${row.title} ${row.body}`),
    ...PP_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...PP_QUANTS.map((row) => `${row.quant} ${row.file} ${row.prefill} ${row.vram} ${row.ramMin} ${row.ramFull} ${row.note}`),
    ...PP_PREFILL_CELLS.map((row) => `${row.quant} ${row.at4k} ${row.at32k} ${row.at128k} ${row.at256k} ${row.note}`),
    ...PP_CARDS.map((row) => `${row.name} ${row.vramGb} ${row.note}`),
    ...PP_SOURCES.map((row) => `${row.title} ${row.official ? 'official' : 'unofficial'}`),
    `${RAM_MIN_LABEL} ${RAM_FULL_LABEL}`,
  ].join('\n');
}

export function ppHrefs(): string[] {
  const links = [
    ...PP_HUB_LINKS,
    ...PP_STEPS.flatMap((step) => step.links),
    ...PP_FAQ.flatMap((row) => row.links),
    ...PP_CARDS.map((row) => ({ href: row.href, label: row.name })),
    ...PP_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertPpValid(): string[] {
  const errors: string[] = [];
  const blob = ppBlob();
  if (PP_PATH !== '/prefill') errors.push('path');
  if (PP_PUBLISHED !== '2026-10-14') errors.push('published');
  if (PP_TITLE.length < 8) errors.push('title short');
  if (PP_DESCRIPTION.length < 70 || PP_DESCRIPTION.length > 160) {
    errors.push(`description length ${PP_DESCRIPTION.length}`);
  }
  if (!/AMDai/.test(blob)) errors.push('must say AMDai');
  if (!/llama\.cpp/.test(blob)) errors.push('must say llama.cpp');
  if (!/Vulkan/.test(blob)) errors.push('must say Vulkan');
  if (!/--batch-size/.test(blob)) errors.push('must cite --batch-size');
  if (!/--ubatch-size/.test(blob)) errors.push('must cite --ubatch-size');
  if (!/-b /.test(blob)) errors.push('must cite -b');
  if (!/-ub /.test(blob)) errors.push('must cite -ub');
  if (!/LLAMA_ARG_BATCH/.test(blob)) errors.push('must cite LLAMA_ARG_BATCH');
  if (!/LLAMA_ARG_UBATCH/.test(blob)) errors.push('must cite LLAMA_ARG_UBATCH');
  if (!/logical/.test(blob)) errors.push('must say logical');
  if (!/physical/.test(blob)) errors.push('must say physical');
  if (!blob.includes(PP_PACK)) errors.push('must name prefill-ab/1');
  if (!blob.includes(PP_BENCH_ID)) errors.push('must name amdai-bench ab-prefill');
  if (!blob.includes(PP_UNMEASURED)) errors.push('must keep unmeasured label');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('both RAM lines');
  if (!blob.includes(PP_HOUSE_FILE)) errors.push('house file');
  if (!blob.includes(PP_HOUSE_SERVER_FLAGS)) errors.push('house server flags');
  if (!blob.includes(PP_HOUSE_BENCH)) errors.push('house bench line');
  if (!/262144/.test(blob)) errors.push('house context');
  if (!blob.includes(COMPARE_Q3)) errors.push('q3 row');
  if (!/labeled estimate/.test(blob)) errors.push('q3 labeled');
  if (!/do not download Q3/.test(blob)) errors.push('must not recommend Q3');
  if (!/Q4 and up/.test(blob)) errors.push('must say Q4 and up');
  if (!/not measured/.test(blob)) errors.push('must say not measured');
  if (!/f16/.test(blob)) errors.push('must cite f16 KV');
  if (!/2761\.6/.test(blob)) errors.push('must cite measured UD-Q5 4K prefill');
  if (!/1937\.9/.test(blob)) errors.push('must cite measured UD-Q5 32K prefill');
  if (!/--n-cpu-moe not recorded/.test(blob)) errors.push('must not invent Flash --n-cpu-moe');
  if (!/-ot not recorded/.test(blob)) errors.push('must not invent Flash -ot');
  if (BANNED.test(blob)) errors.push('banned model name');
  if (Q1Q2.test(blob)) errors.push('q1/q2 visible');
  if (Q4_FLOOR.test(blob)) errors.push('q4-floor wording');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/amdai-stack-lab:(?:\/\/)?prefill/.test(blob)) {
    errors.push('must not invent a prefill-ab deep link');
  }
  if (!PP_QUANTS.some((row) => row.estimate && row.quant === COMPARE_Q3)) {
    errors.push('q3 estimate row');
  }
  if (PP_QUANTS.some((row) => /Q[12]_/.test(row.quant))) errors.push('q1/q2 quant row');
  const hrefs = ppHrefs();
  for (const required of REQUIRED_PP_HREFS) {
    if (!hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}
