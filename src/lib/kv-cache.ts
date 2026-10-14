/**
 * Cited KV-cache shopper guide for Radeon.
 * Reuses calculator formulaKvGiB / KV_TYPES and official 35B f16 VRAM cards.
 * Do not invent tok/s, quality scores, or a Stack Lab KV A/B deep link.
 */

import {
  DEFAULT_INPUT,
  KV_TYPES,
  applyGpuPreset,
  applyModelPreset,
  compute,
  formatGiB,
  formulaKvGiB,
  systemRamNeed,
  type GpuId,
  type KvId,
  type QuantId,
} from './calculator';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { runs } from './run-card-data';
import { measuredRamHitsFromRuns, qwen36TableFromRuns } from './run-card';
import {
  COMPARE_CONTEXTS,
  COMPARE_ENGINE,
  COMPARE_MODEL,
  COMPARE_Q3,
  COMPARE_Q3_CITE,
  SWEEP_REVERIFY,
} from './local-desktop-compare';

export const KV_CACHE_PUBLISHED = '2026-10-14';
export const KV_CACHE_TITLE =
  'KV cache on a Radeon GPU: f16 vs q8_0 vs q4_0 and how much VRAM context costs';
export const KV_CACHE_DESCRIPTION =
  'Cited llama.cpp KV cache on Radeon. f16 vs q8_0 vs q4_0. Measured 35B VRAM. Estimates labeled. No invented tok/s.';
export const KV_CACHE_EMPTY = 'not measured yet';
export const KV_CACHE_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';
export const KV_CACHE_KV_LAYERS = 10;
export const KV_CACHE_KV_HEADS = 2;
export const KV_CACHE_HEAD_DIM = 256;

export type KvCacheLink = { href: string; label: string };

export type KvCacheSource = { id: string; title: string; href: string };

export const KV_CACHE_LEAD = `
  The KV cache is the key/value attention memory llama.cpp keeps while a
  prompt and chat fill the window. It is separate from the GGUF. It grows
  with -c / --ctx-size and with --parallel slots. House path is
  ${COMPARE_MODEL} on ${COMPARE_ENGINE} Vulkan, one R9700, f16 KV, -c 262144.
  That is why the daily driver stays f16: the overnight cards measured it,
  and 29.34 GB peak at 256K still sits on a 32 GB card. q8_0 and q4_0 KV
  shrink the cache on the calculator. Quality and tok/s for those types
  stay ${KV_CACHE_EMPTY}.
`.replace(/\s+/g, ' ').trim();

export const KV_CACHE_WHAT = `
  Attention stores a key vector and a value vector for every token it has
  already seen. The next token reads that store instead of recomputing the
  whole prompt. More tokens → a bigger store. Official Qwen3.6-35B-A3B
  card: 40 layers, 10 full-attention (GQA 2×256). Only those 10 layers grow
  a token-length cache — that count is the public model card, not a tape
  measure. The calculator formula is 2 × kv_layers × kv_heads × head_dim ×
  context × bytes. House numbers: 2 × ${KV_CACHE_KV_LAYERS} × ${KV_CACHE_KV_HEADS}
  × ${KV_CACHE_HEAD_DIM} × context × bytes. Bytes come from KV_TYPES on the
  calculator (f16 = 2, q8_0 = 1.0625, q4_0 = 0.5625). Those KV-only figures
  are estimates. Peak VRAM on the table is the whole load (weights + KV +
  overhead) and is measured only for f16 on the overnight UD-Q5 cards.
`.replace(/\s+/g, ' ').trim();

export const KV_CACHE_FLAGS = `
  llama.cpp CLI / server (tools/cli README and tools/server README, checked
  2026-10-14): -c / --ctx-size sets the window (default 0 = model card).
  -ctk / --cache-type-k and -ctv / --cache-type-v set the K and V types
  (default f16; listed types include f16, q8_0, q4_0). -fa / --flash-attn
  is on|off|auto (default auto). llama.cpp multi-gpu.md: flash attention is
  required when using quantized V cache and/or --split-mode tensor.
  Overnight 35B Vulkan cards recorded -fa 1 and -ctk f16 -ctv f16. That is
  the house pin. llama-server --parallel / -np sizes a slot cache per
  concurrent sequence (server default auto). A second slot is a second KV
  pool — size it on the calculator before you raise -np. House daily
  driver is one interactive user. Copy:
  --cache-type-k f16 --cache-type-v f16 -c 262144. q8_0 / q4_0 stay
  labeled estimates on this site.
`.replace(/\s+/g, ' ').trim();

export const KV_CACHE_WHY_F16 = `
  amdai’s house box runs f16 KV at the full 262144 window on one R9700
  because that is what the overnight llama-bench cards recorded, and the
  peak (29.34 GB at 256K) still fits 32 GB with 0% RAM offload. Switching
  to q8_0 or q4_0 would shrink the estimated cache. It would also leave
  the measured cards. Quality, recall, and tok/s for q8_0 / q4_0 KV are
  ${KV_CACHE_EMPTY}. Do not confuse a KV type with a weight quant — q8_0
  as cache is not “running Q8 weights.”
`.replace(/\s+/g, ' ').trim();

export const KV_CACHE_QUALITY = `
  No AMDai score ranks f16 vs q8_0 vs q4_0 KV. llama.cpp documents the
  types. It does not publish a house quality delta. Treat any “quantized
  KV is fine” claim as ${KV_CACHE_EMPTY} unless a local-desktop card says otherwise.
`.replace(/\s+/g, ' ').trim();

export const KV_CACHE_RAM = `
  When KV or weights spill off the GPU, the two shopper lines stay
  ${RAM_MIN_LABEL} (kit-size estimate with a breakdown — 192 or 256 GB
  when a 35B file spills) and ${RAM_FULL_LABEL} (measured llama.cpp peaks
  when we have them: 37.32 GB at 4K and 42.9 GB at 256K on UD-Q5, one
  R9700, f16). Those peaks are Linux GiB printed as GB. Label estimate
  unless a run card exists.
`.replace(/\s+/g, ' ').trim();

export const KV_CACHE_STACK_LAB = `
  No Stack Lab KV A/B pack (f16 vs q8_0) is allowlisted on this site.
  Do not invent a deep link. Measure a type on your box from /stack-lab
  planner and /amdai-bench after llama.cpp already serves /v1. Packages
  are not published yet.
`.replace(/\s+/g, ' ').trim();

export const KV_CACHE_SOURCES: KvCacheSource[] = [
  {
    id: 'llamacpp-cli',
    title: 'llama.cpp — CLI README (-c, -ctk/-ctv, -fa, -np)',
    href: 'https://github.com/ggml-org/llama.cpp/blob/HEAD/tools/cli/README.md',
  },
  {
    id: 'llamacpp-server',
    title: 'llama.cpp — server README (same flags; --parallel slots)',
    href: 'https://github.com/ggml-org/llama.cpp/blob/HEAD/tools/server/README.md',
  },
  {
    id: 'llamacpp-multigpu',
    title: 'llama.cpp — multi-gpu.md (flash attention required for quantized V cache)',
    href: 'https://github.com/ggml-org/llama.cpp/blob/master/docs/multi-gpu.md',
  },
  {
    id: 'qwen36-card',
    title: 'Qwen3.6-35B-A3B model card (40 layers, 10 full-attention GQA 2×256, 262144 context)',
    href: 'https://huggingface.co/Qwen/Qwen3.6-35B-A3B',
  },
  {
    id: 'unsloth-35b',
    title: 'Unsloth Qwen3.6-35B-A3B GGUF (UD-Q5_K_XL / UD-Q3_K_XL listings)',
    href: 'https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF/tree/main',
  },
];

export const KV_CACHE_FAQ = [
  {
    id: 'what-is-kv',
    question: 'What is the KV cache on llama.cpp?',
    answer:
      'Key/value attention memory that grows with the token window. Separate from the GGUF. House default is f16. The calculator estimates 2 × 10 full-attention layers × 2 heads × 256 dim × context × bytes for Qwen3.6-35B-A3B.',
    links: [
      { href: '/glossary#kv-cache', label: 'KV cache' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/long-context', label: 'Long context' },
    ],
  },
  {
    id: 'f16-vs-q8-q4',
    question: 'Should I switch from f16 KV to q8_0 or q4_0 to fit more context?',
    answer:
      'House daily driver stays f16 — overnight 35B cards recorded -ctk f16 -ctv f16, and 29.34 GB at 256K still fits one R9700. q8_0 and q4_0 shrink the estimated cache. Quality and tok/s for those types are not measured yet. llama.cpp multi-gpu.md requires flash attention for a quantized V cache. Do not confuse a KV type with a weight quant.',
    links: [
      { href: '/flash-attention', label: 'Flash Attention' },
      { href: '/quants', label: 'Quants · KV types' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'how-much-128k',
    question: 'How much VRAM does 128K context need on the house 35B?',
    answer:
      'Measured peak VRAM on UD-Q5_K_XL, llama.cpp Vulkan, f16 KV, one R9700 is 28.82 GB at 128K (and 25.97 GB at 4K, 26.7 GB at 32K, 29.34 GB at 256K). The KV-only slice at 128K is a calculator estimate (about 2.50 GB at f16). q8_0 / q4_0 totals are not measured.',
    links: [
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/results', label: 'Run cards' },
      { href: '/long-context', label: 'Long context' },
    ],
  },
  {
    id: 'parallel-slots',
    question: 'Does --parallel multiply the KV cache?',
    answer:
      'Yes on llama-server. Official --parallel / -np sizes a slot cache per concurrent sequence. Two slots at the same -c is two KV pools. House path is one interactive user. Size a second slot on the calculator before you raise -np. The shopper page is /concurrency-ab.',
    links: [
      { href: '/concurrency-ab', label: 'Parallel slots' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/tuning', label: 'Tuning flags' },
      { href: '/harnesses/connect', label: 'Connect a harness' },
    ],
  },
];

export const KV_CACHE_HUB: KvCacheLink[] = [
  { href: '/long-context', label: 'Long context' },
  { href: '/flash-attention', label: 'Flash Attention' },
  { href: '/tuning', label: 'Speed up llama.cpp' },
  { href: '/quants', label: 'Quants · KV types' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/glossary#kv-cache', label: 'Glossary · KV cache' },
  { href: '/results', label: 'Run cards' },
  { href: '/flash-ram-offload', label: 'Flash RAM offload' },
  { href: '/troubleshoot#oom-context', label: 'Long-context OOM' },
];

export const KV_CACHE_SECTIONS = [
  { id: 'what-it-is', label: 'What the KV cache is' },
  { id: 'flags', label: 'llama.cpp flags' },
  { id: 'why-f16', label: 'Why house stays f16' },
  { id: 'per-context', label: 'Per-context VRAM' },
  { id: 'fit', label: 'Fit by card' },
  { id: 'ram', label: 'System RAM' },
  { id: 'stack-lab', label: 'Stack Lab' },
  { id: 'faq', label: 'FAQ' },
  { id: 'sources', label: 'Sources' },
] as const;

export const REQUIRED_KV_CACHE_HREFS = [
  '/long-context',
  '/flash-attention',
  '/tuning',
  '/quants',
  '/calculator',
  '/gpus/r9700',
  '/backends/llamacpp',
  '/glossary#kv-cache',
  '/results',
  '/flash-ram-offload',
  '/troubleshoot#oom-context',
  '/stack-lab',
  '/amdai-bench',
] as const;

const HOUSE_KV_IDS = ['f16', 'q8_0', 'q4_0'] as const;

function kvBytes(id: (typeof HOUSE_KV_IDS)[number]): number {
  return KV_TYPES.find((row) => row.id === id)?.bytes ?? 0;
}

function measuredUdq5Vram(context: number): string | null {
  const row = qwen36TableFromRuns(runs).compare.find(
    (item) => item.quant === 'UD-Q5_K_XL' && item.context === context,
  );
  const text = row?.one.vramTotal?.trim() ?? '';
  if (!text || /not measured/i.test(text)) return null;
  return text;
}

export type KvContextRow = {
  context: number;
  label: string;
  measuredF16Vram: string;
  kvF16: string;
  kvQ8: string;
  kvQ4: string;
  measured: boolean;
};

function kvOnlyGiB(context: number, id: (typeof HOUSE_KV_IDS)[number]): number {
  return formulaKvGiB(KV_CACHE_KV_LAYERS, KV_CACHE_KV_HEADS, KV_CACHE_HEAD_DIM, context, kvBytes(id));
}

export function kvContextRows(): KvContextRow[] {
  return COMPARE_CONTEXTS.map((context) => {
    const measured = measuredUdq5Vram(context);
    return {
      context,
      label: context >= 1024 && context % 1024 === 0 ? `${context / 1024}K` : String(context),
      measuredF16Vram: measured ?? KV_CACHE_EMPTY,
      kvF16: `${formatGiB(kvOnlyGiB(context, 'f16'))} GB (estimate)`,
      kvQ8: `${formatGiB(kvOnlyGiB(context, 'q8_0'))} GB (estimate)`,
      kvQ4: `${formatGiB(kvOnlyGiB(context, 'q4_0'))} GB (estimate)`,
      measured: Boolean(measured),
    };
  });
}

export type KvFitCell = {
  text: string;
  estimate: boolean;
};

export type KvFitRow = {
  id: string;
  card: string;
  vram: string;
  href: string;
  q6: KvFitCell;
  q5: KvFitCell;
  q4: KvFitCell;
  q3: KvFitCell;
};

function houseInput(opts: {
  quantId: QuantId;
  context: number;
  kvId: KvId;
  gpuId: GpuId;
  gpuCount?: 1 | 2;
}) {
  let input = applyModelPreset('qwen36', DEFAULT_INPUT);
  input = applyGpuPreset(opts.gpuId, input);
  return {
    ...input,
    quantId: opts.quantId,
    context: opts.context,
    kvId: opts.kvId,
    gpuCount: opts.gpuCount ?? 1,
    split: (opts.gpuCount ?? 1) > 1,
  };
}

function fitCell(quantId: QuantId, gpuId: GpuId, gpuCount: 1 | 2, estimate: boolean): KvFitCell {
  const result = compute(houseInput({ quantId, context: 262144, kvId: 'f16', gpuId, gpuCount }));
  const total = `${formatGiB(result.totalGiB)} GB`;
  if (result.verdict === 'fits') {
    return { text: `Fits (calc ${total})`, estimate };
  }
  if (result.verdict === 'tight') {
    return { text: `Tight (calc ${total})`, estimate };
  }
  return {
    text: `Does not sit in VRAM (calc ${total}; ${RAM_MIN_LABEL} / ${RAM_FULL_LABEL} on the calculator)`,
    estimate: true,
  };
}

function measuredQ5Cell(): KvFitCell {
  return {
    text: 'Measured 29.34 GB peak at 256K, f16 KV, 0% RAM offload. Fits one 32 GB card.',
    estimate: false,
  };
}

export function kvHouseRamNeed() {
  return systemRamNeed(
    houseInput({ quantId: 'q5_k_m', context: 262144, kvId: 'f16', gpuId: 'r9700' }),
    measuredRamHitsFromRuns(runs),
  );
}

export function kvFitRows(): KvFitRow[] {
  const cards: Array<{
    id: string;
    card: string;
    vram: string;
    href: string;
    gpuId: GpuId;
    gpuCount: 1 | 2;
  }> = [
    { id: '12gb', card: '12 GB discrete', vram: '12 GB', href: '/gpus/rx-7700-xt', gpuId: 'rx7700xt', gpuCount: 1 },
    { id: '16gb', card: '16 GB discrete', vram: '16 GB', href: '/gpus/rx-7800-xt', gpuId: 'rx7800xt', gpuCount: 1 },
    { id: '20gb', card: '20 GB discrete', vram: '20 GB', href: '/gpus/rx-7900-xt', gpuId: 'rx7900xt', gpuCount: 1 },
    { id: '24gb', card: '24 GB discrete', vram: '24 GB', href: '/gpus/rx-7900-xtx', gpuId: 'rx7900xtx', gpuCount: 1 },
    { id: '32gb', card: '32 GB (R9700)', vram: '32 GB', href: '/gpus/r9700', gpuId: 'r9700', gpuCount: 1 },
    { id: '2x32', card: '2×32 GB (dual R9700)', vram: '2×32 GB', href: '/multi-gpu', gpuId: 'r9700', gpuCount: 2 },
  ];
  return cards.map((card) => ({
    id: card.id,
    card: card.card,
    vram: card.vram,
    href: card.href,
    q6: fitCell('q6_k', card.gpuId, card.gpuCount, true),
    q5:
      card.id === '32gb'
        ? measuredQ5Cell()
        : fitCell('q5_k_m', card.gpuId, card.gpuCount, true),
    q4: fitCell('q4_k_m', card.gpuId, card.gpuCount, true),
    q3: {
      ...fitCell('q3_k_xl', card.gpuId, card.gpuCount, true),
      text: `${COMPARE_Q3} ${COMPARE_Q3_CITE}. ${fitCell('q3_k_xl', card.gpuId, card.gpuCount, true).text} Labeled estimate — no Q3 download or run on local-desktop.`,
    },
  }));
}

export const KV_CACHE_HOWTO_STEPS = [
  {
    name: 'Read the cache as memory that grows with the window',
    text: KV_CACHE_WHAT,
  },
  {
    name: 'Set -c, --cache-type-k/v, -fa, and --parallel from llama.cpp docs',
    text: KV_CACHE_FLAGS,
  },
  {
    name: 'Stay on f16 KV for the house 35B unless the calculator says KV is the spill',
    text: KV_CACHE_WHY_F16,
  },
  {
    name: 'Size Q6 / Q5 / Q4 on the card; keep Q3 a labeled estimate',
    text: `House ladder is Q6 / Q5 / Q4. ${COMPARE_Q3} is a labeled estimate (${COMPARE_Q3_CITE}). Q1/Q2 stay off. ${KV_CACHE_RAM}`,
  },
];

export function kvCacheBlob(): string {
  return [
    KV_CACHE_TITLE,
    KV_CACHE_DESCRIPTION,
    KV_CACHE_LEAD,
    KV_CACHE_WHAT,
    KV_CACHE_FLAGS,
    KV_CACHE_WHY_F16,
    KV_CACHE_QUALITY,
    KV_CACHE_RAM,
    KV_CACHE_STACK_LAB,
    SWEEP_REVERIFY,
    ...KV_CACHE_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...kvContextRows().map(
      (row) => `${row.label} ${row.measuredF16Vram} ${row.kvF16} ${row.kvQ8} ${row.kvQ4}`,
    ),
    ...kvFitRows().map(
      (row) => `${row.card} ${row.q6.text} ${row.q5.text} ${row.q4.text} ${row.q3.text}`,
    ),
  ].join('\n');
}

export function kvCacheHrefs(): string[] {
  const links = [
    ...KV_CACHE_HUB,
    ...KV_CACHE_SOURCES.map((row) => ({ href: row.href, label: row.title })),
    ...KV_CACHE_FAQ.flatMap((row) => row.links),
    ...kvFitRows().map((row) => ({ href: row.href, label: row.card })),
    { href: '/stack-lab', label: 'Stack Lab' },
    { href: '/amdai-bench', label: 'amdai-bench' },
  ];
  return [...new Set(links.map((link) => {
    const path = (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href;
    if (path === '/glossary' || path === '/troubleshoot') return link.href.split('?')[0] ?? link.href;
    return path;
  }))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertKvCacheValid(): string[] {
  const errors: string[] = [];
  const blob = kvCacheBlob();
  const hrefs = kvCacheHrefs();
  if (KV_CACHE_TITLE !== 'KV cache on a Radeon GPU: f16 vs q8_0 vs q4_0 and how much VRAM context costs') {
    errors.push('title drifted');
  }
  if (KV_CACHE_DESCRIPTION.length < 70 || KV_CACHE_DESCRIPTION.length > 160) {
    errors.push('description length');
  }
  if (kvContextRows().length !== 4) errors.push('need 4K 32K 128K 262K rows');
  if (!kvContextRows().every((row) => row.measured)) errors.push('f16 VRAM rows must be measured');
  if (!kvContextRows().some((row) => row.measuredF16Vram.includes('25.97'))) {
    errors.push('must cite 25.97 GB at 4K');
  }
  if (!kvContextRows().some((row) => row.measuredF16Vram.includes('29.34'))) {
    errors.push('must cite 29.34 GB at 256K');
  }
  if (kvFitRows().length !== 6) errors.push('need 12/16/20/24/32/dual fit rows');
  if (!kvFitRows().every((row) => row.q3.estimate)) errors.push('Q3 fit cells must be estimates');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('RAM lines missing');
  if (!/llama\.cpp/i.test(blob)) errors.push('must say llama.cpp');
  if (!/--cache-type-k/.test(blob) || !/--cache-type-v/.test(blob)) errors.push('must cite cache-type flags');
  if (!/--flash-attn/.test(blob) && !/-fa /.test(blob)) errors.push('must cite flash attention');
  if (!/quantized V cache/.test(blob)) errors.push('must cite FA required for quantized V');
  if (!/--parallel/.test(blob)) errors.push('must cite --parallel');
  if (!/262144/.test(blob)) errors.push('must cite house context');
  if (!/q8_0/.test(blob) || !/q4_0/.test(blob)) errors.push('must name q8_0 and q4_0 KV');
  if (!blob.includes(KV_CACHE_EMPTY)) errors.push('must say not measured yet');
  if (!/Do not invent a deep link/.test(blob) && !/No Stack Lab KV A\/B/.test(blob)) {
    errors.push('must refuse invented KV A/B link');
  }
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (/\bmeasured q8_0 KV\b|\bq8_0 KV quality is\b|\bq4_0 KV quality is\b/i.test(blob)) {
    errors.push('must not invent KV quality');
  }
  for (const source of KV_CACHE_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_KV_CACHE_HREFS) {
    if (!hrefs.some((href) => href === required || href.startsWith(`${required}`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return [...new Set(errors)];
}
