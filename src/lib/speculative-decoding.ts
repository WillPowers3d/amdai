/**
 * Cited guide: speculative decoding on a Radeon GPU with llama.cpp.
 * Reuse /tuning, /backends, /glossary, /models, /long-context, /multi-gpu.
 * Draft decode is not measured on local-desktop. Draft GGUFs stay Q4+.
 * Main-model Q3 is a labeled estimate. Q1/Q2 and MTP heads stay off.
 */

import {
  DEFAULT_INPUT,
  DIMM_KIT_GB,
  applyGpuPreset,
  applyModelPreset,
  compute,
  formatGiB,
  systemRamNeed,
  type QuantId,
  type SystemRamNeed,
} from './calculator';
import { houseSystemRam } from './house-ram';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { officialLinks } from './site';
import {
  COMPARE_ENGINE,
  COMPARE_MODEL,
  COMPARE_Q3,
  COMPARE_Q3_CITE,
  oneVsTwoRows,
  q3RamNeed,
} from './local-desktop-compare';
import type { RunCard } from './run-card';

export const SPEC_PATH = '/speculative-decoding';
export const SPEC_NAME = 'Speculative decoding on Radeon';
export const SPEC_HEADING = 'Speculative decoding on a Radeon GPU with llama.cpp';
export const SPEC_PUBLISHED = '2026-10-14';
export const SPEC_CITED_LABEL = 'Cited llama.cpp flags · draft decode not measured on local-desktop';
export const SPEC_UNMEASURED = 'not measured yet on local-desktop — run the Stack Lab speculative decoding A/B';
export const SPEC_DRAFT_RULE = 'Draft / speculative models stay Q4 and up';

export const LLAMA_CPP = officialLinks.llamaCpp;
export const LLAMA_SERVER = 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md';
export const LLAMA_BUILD_MD = 'https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md';

export type SpecLink = { href: string; label: string };

export type SpecSource = {
  id: string;
  title: string;
  href: string;
};

export type SpecFlag = {
  id: string;
  flag: string;
  meaning: string;
  cite: string;
};

export type SpecFaq = {
  id: string;
  question: string;
  answer: string;
  links: SpecLink[];
};

export const SPEC_TITLE = SPEC_HEADING;
export const SPEC_DESCRIPTION =
  'Speculative decoding on Radeon with llama.cpp. Cited -md flags. Measured 35B only. Draft speed not measured on local-desktop. Q3 is a labeled estimate.';

export const SPEC_LEAD =
  `A draft model guesses the next tokens; the target accepts or rejects them. llama.cpp documents that path on the server README. AMDai has not measured a draft pair on local-desktop, so every speed-up cell stays ${SPEC_UNMEASURED}. House daily driver is ${COMPARE_MODEL} UD-Q5_K_XL on llama.cpp Vulkan, one R9700, 262144 context, f16 KV — decode in the table, no draft. Hermes’s Flash path is Strata UD-Q6_K_XL with no MTP (cited pair ~32.6 tok/s versus llama.cpp ~16 tok/s at 262K on /models/flash). ${SPEC_DRAFT_RULE}. ${COMPARE_Q3} is a labeled estimate for the main file (${COMPARE_Q3_CITE}). Q1/Q2 stay off, including MTP heads. vLLM and other engines stay on /backends — we do not invent a speculative vLLM 35B number.`;

export const SPEC_WHAT =
  'The draft is a smaller same-family GGUF that runs ahead of the target. llama.cpp proposes draft tokens, then the target checks them in one forward pass. Accepted tokens are free decode; rejected tokens fall back to the target. Acceptance is a measured rate on your box, not a number we invent. A bad draft wastes VRAM and can lose. Size both files plus KV before you launch.';

export const SPEC_WHEN_HELPS =
  'It can help when the draft agrees often: code, boilerplate, and repetitive prose. Same-family drafts only. Both files must fit, or the draft is the thing you are willing to spill. Measure acceptance with the Stack Lab speculative decoding A/B and an amdai-bench card.';

export const SPEC_WHEN_NOT =
  `It often does not help on MoE A3B-class models that already decode fast on one R9700 — the house 35B is that class. Low acceptance burns draft VRAM for no tok/s. Dual-card split of a file that already fits one card is often slower at short context (measured split tax on /compare/one-vs-two-gpu). We do not invent a “draft on GPU 1, target on GPU 2” pin. Flash stays the Strata no-MTP path, not a draft-model try.`;

export const SPEC_HOUSE =
  `amdai’s default is ${COMPARE_MODEL} Unsloth UD-Q5_K_XL, llama.cpp Vulkan, one R9700, 262144 context, f16 KV. That launch has no -md. Hermes’s Flash runs on Strata UD-Q6_K_XL with no MTP. Do not turn on a 2-bit / Q2-class MTP head to “make Flash faster.”`;

export const SPEC_LAUNCH = [
  '# Shape only — draft decode is not measured on local-desktop. Draft stays Q4+.',
  '# Pick a real Q4+ same-family draft from the model card. Do not invent a filename.',
  './build-vk/bin/llama-server \\',
  '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
  '  -md ~/models/draft-Q4_K_M.gguf \\',
  '  --spec-draft-n-max 3 \\',
  '  --spec-draft-n-min 0 \\',
  '  -ngl 99 \\',
  '  -ngld 99 \\',
  '  -c 4096 \\',
  '  --cache-type-k f16 \\',
  '  --cache-type-v f16 \\',
  '  --host 127.0.0.1 --port 8080',
].join('\n');

export const SPEC_FLAGS: SpecFlag[] = [
  {
    id: 'model-draft',
    flag: '-md / --model-draft / --spec-draft-model',
    meaning:
      'Path to the draft GGUF. Official llama.cpp server README. Unused unless you pass a file. Draft stays Q4 and up on this site.',
    cite: 'llama.cpp server README — --spec-draft-model, -md, --model-draft',
  },
  {
    id: 'draft-n-max',
    flag: '--spec-draft-n-max',
    meaning:
      'How many tokens the draft may propose (default 3 on the README). Official docs say --draft-max / --draft-n were removed; use --spec-draft-n-max.',
    cite: 'llama.cpp server README — --spec-draft-n-max (replaces removed --draft-max)',
  },
  {
    id: 'draft-n-min',
    flag: '--spec-draft-n-min',
    meaning:
      'Minimum draft tokens to use (default 0). Official docs say --draft-min was removed; use --spec-draft-n-min.',
    cite: 'llama.cpp server README — --spec-draft-n-min (replaces removed --draft-min)',
  },
  {
    id: 'ngld',
    flag: '-ngld / --n-gpu-layers-draft / --spec-draft-ngl',
    meaning:
      'How many draft layers sit in VRAM (exact count, auto, or all). Same idea as -ngl, for the draft. Leaving layers on the host is RAM offload — print both shopper RAM lines.',
    cite: 'llama.cpp server README — --spec-draft-ngl, -ngld, --n-gpu-layers-draft',
  },
  {
    id: 'device-draft',
    flag: '-devd / --device-draft / --spec-draft-device',
    meaning:
      'Comma-separated devices for the draft (none = do not offload; default follows --device). We have not recorded a dual-R9700 pin. Do not invent one.',
    cite: 'llama.cpp server README — --spec-draft-device, -devd, --device-draft',
  },
];

export const SPEC_SOURCES: SpecSource[] = [
  { id: 'server', title: 'llama.cpp server README (draft flags)', href: LLAMA_SERVER },
  { id: 'llama', title: 'llama.cpp repository', href: LLAMA_CPP },
  { id: 'build', title: 'llama.cpp build.md', href: LLAMA_BUILD_MD },
  { id: 'tuning', title: 'AMDai — speed up llama.cpp', href: '/tuning' },
  { id: 'backends', title: 'AMDai — backends', href: '/backends' },
  { id: 'llamacpp', title: 'AMDai — llama.cpp', href: '/backends/llamacpp' },
  { id: 'vulkan', title: 'AMDai — Vulkan vs ROCm', href: '/compare/vulkan-vs-rocm' },
  { id: 'strata', title: 'AMDai — Strata (no MTP)', href: '/backends/strata' },
  { id: 'flash', title: 'AMDai — Flash model page', href: '/models/flash' },
  { id: 'stack-lab', title: 'AMDai — Stack Lab', href: '/stack-lab' },
  { id: 'bench', title: 'AMDai — amdai-bench', href: '/amdai-bench' },
];

export const SPEC_FAQ: SpecFaq[] = [
  {
    id: 'have-we-measured-it',
    question: 'Did AMDai measure a draft speed-up on the R9700?',
    answer: `No. Draft decode and acceptance stay ${SPEC_UNMEASURED}. Baseline 35B decode (no draft) is the official local-desktop llama.cpp Vulkan sweep in the table. Open the Stack Lab planner, then record an amdai-bench card.`,
    links: [
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/benchmarks', label: 'Benchmarks' },
    ],
  },
  {
    id: 'can-draft-be-q3',
    question: 'Can the draft model be Q3?',
    answer: `${SPEC_DRAFT_RULE}. ${COMPARE_Q3} may appear as a labeled estimate for the main 35B file (${COMPARE_Q3_CITE}). A Q3 draft is not a house pick. Q1/Q2 drafts stay off, including MTP heads.`,
    links: [
      { href: '/quants', label: 'Quants' },
      { href: '/compare/q4-q5-q6', label: 'Q6 / Q5 / Q4 + Q3 estimate' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
    ],
  },
  {
    id: 'will-it-help-35b',
    question: 'Will a draft speed up the house 35B-A3B?',
    answer:
      'Maybe, maybe not. That file already decodes fast on one R9700 because only a 3B-class slice is active. A draft still costs VRAM and KV. We will not invent an accept-rate. Measure it on your box.',
    links: [
      { href: '/moe', label: 'MoE on Radeon' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
];

export const SPEC_HOWTO_STEPS = [
  {
    name: 'Fit the target first',
    text: 'Load the house 35B (or the file you actually run) on llama.cpp Vulkan without a draft. Size Q6/Q5/Q4 on the calculator. Q3 stays a labeled estimate. If the target already spills, fix offload before you add a draft.',
  },
  {
    name: 'Pick a Q4+ same-family draft',
    text: 'Use a real GGUF from the model card. Drafts stay Q4 and up. Do not invent a filename or a tiny banned-head pick. Do not turn on a 2-bit MTP head.',
  },
  {
    name: 'Launch llama-server with cited flags',
    text: 'Pass -md / --model-draft, --spec-draft-n-max, --spec-draft-n-min, and -ngld. Official server README. Old --draft-max / --draft-min were removed. Shape only — not a measured tok/s.',
  },
  {
    name: 'Size main + draft + KV',
    text: 'Draft weights and draft KV add to the target. Leftover VRAM in the table is a calculator estimate. If layers spill, print Minimum system RAM needed and RAM needed at full context.',
  },
  {
    name: 'Measure the A/B',
    text: 'Draft off versus draft on, plus acceptance rate. Use the Stack Lab speculative decoding A/B and record an amdai-bench card. Keep the draft only if your card shows a win.',
  },
];

export const SPEC_SECTIONS = [
  { id: 'what', label: 'What a draft does' },
  { id: 'house', label: 'House context' },
  { id: 'flags', label: 'llama.cpp flags' },
  { id: 'measured', label: 'Measured 35B (no draft)' },
  { id: 'fit', label: 'VRAM fit' },
  { id: 'when', label: 'When it helps' },
  { id: 'two-gpu', label: 'One vs two GPUs' },
  { id: 'ram', label: 'System RAM' },
  { id: 'faq', label: 'FAQ' },
  { id: 'sources', label: 'Sources' },
] as const;

export const SPEC_HUB_LINKS: SpecLink[] = [
  { href: '/tuning', label: 'Speed up llama.cpp' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/compare/vulkan-vs-rocm', label: 'Vulkan vs ROCm' },
  { href: '/backends', label: 'Backends' },
  { href: '/backends/strata', label: 'Strata (no MTP)' },
  { href: '/models/flash', label: 'Flash' },
  { href: '/moe', label: 'MoE' },
  { href: '/multi-gpu', label: 'Dual / multi-GPU' },
  { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
  { href: '/long-context', label: 'Long context' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/stack-lab', label: 'Stack Lab' },
  { href: '/amdai-bench', label: 'amdai-bench' },
];

export const REQUIRED_SPEC_HREFS = [
  '/tuning',
  '/backends',
  '/backends/llamacpp',
  '/compare/vulkan-vs-rocm',
  '/backends/strata',
  '/models/flash',
  '/moe',
  '/multi-gpu',
  '/compare/one-vs-two-gpu',
  '/long-context',
  '/calculator',
  '/quants',
  '/compare/q4-q5-q6',
  '/stack-lab',
  '/amdai-bench',
  '/benchmarks',
  '/results',
  '/gpus/r9700',
  '/recipes/qwen36-35b.llamacpp-vulkan.262k',
  '/faq',
  '/glossary',
] as const;

export type SpecQuantRow = {
  quant: string;
  kind: 'measured' | 'q3-estimate';
  decode4k: string;
  decode32k: string;
  note: string;
  runIds: string[];
};

export function specMeasuredRows(cards: RunCard[]): SpecQuantRow[] {
  const table = oneVsTwoRows(cards);
  const quants = ['Q6_K', 'UD-Q5_K_XL', 'Q5_K_M', 'Q4_K_M'] as const;
  const rows: SpecQuantRow[] = quants.map((quant) => {
    const at4k = table.find((row) => row.quant === quant && row.context === 4096);
    const at32k = table.find((row) => row.quant === quant && row.context === 32768);
    return {
      quant,
      kind: 'measured',
      decode4k: at4k?.one.decode ?? SPEC_UNMEASURED,
      decode32k: at32k?.one.decode ?? SPEC_UNMEASURED,
      note: 'Official local-desktop llama.cpp Vulkan, one R9700. No draft.',
      runIds: [...new Set([...(at4k?.one.runIds ?? []), ...(at32k?.one.runIds ?? [])])],
    };
  });
  rows.push({
    quant: COMPARE_Q3,
    kind: 'q3-estimate',
    decode4k: 'not measured',
    decode32k: 'not measured',
    note: `${COMPARE_Q3_CITE}. Q3 is a labeled estimate — not a local-desktop run, not a draft.`,
    runIds: [],
  });
  return rows;
}

const FIT_QUANTS: { id: QuantId; label: string; kind: 'estimate' | 'q3-estimate' }[] = [
  { id: 'q6_k', label: 'Q6_K', kind: 'estimate' },
  { id: 'q5_k_m', label: 'Q5_K_M / UD-Q5_K_XL', kind: 'estimate' },
  { id: 'q4_k_m', label: 'Q4_K_M', kind: 'estimate' },
  { id: 'q3_k_xl', label: COMPARE_Q3, kind: 'q3-estimate' },
];

export type SpecFitRow = {
  quant: string;
  kind: 'estimate' | 'q3-estimate';
  contextLabel: string;
  weightsGb: string;
  totalGb: string;
  usableGb: string;
  leftover: string;
  verdictLabel: string;
};

function mainFitInput(quantId: QuantId, context: number, gpuCount: 1 | 2) {
  let input = applyGpuPreset('r9700', {
    ...DEFAULT_INPUT,
    ramGb: gpuCount === 2 ? 192 : 64,
    vramGb: 32,
    kind: 'discrete',
    usablePct: 100,
    view: 'gpu',
  });
  input = applyModelPreset('qwen36', input);
  return {
    ...input,
    gpuId: 'r9700' as const,
    vramGb: 32,
    ramGb: gpuCount === 2 ? 192 : 64,
    kind: 'discrete' as const,
    usablePct: 100,
    quantId,
    context,
    kvId: 'f16' as const,
    backendId: 'llamacpp' as const,
    pathId: 'vulkan' as const,
    gpuCount,
    split: gpuCount === 2,
    fileWeightGiB: null,
  };
}

function leftoverLabel(usable: number, total: number): string {
  const left = usable - total;
  if (left <= 0) return 'no leftover — a draft would offload (estimate)';
  return `${formatGiB(left)} GB leftover for a Q4+ draft (estimate)`;
}

export function specFitRows(gpuCount: 1 | 2 = 1, context = 32768): SpecFitRow[] {
  return FIT_QUANTS.map((quant) => {
    const result = compute(mainFitInput(quant.id, context, gpuCount));
    return {
      quant: quant.label,
      kind: quant.kind,
      contextLabel: context === 262144 ? '262K' : '32K',
      weightsGb: `${formatGiB(result.weightsGiB)} GB`,
      totalGb: `${formatGiB(result.totalGiB)} GB`,
      usableGb: `${formatGiB(result.usableVramGb)} GB`,
      leftover: leftoverLabel(result.usableVramGb, result.totalGiB),
      verdictLabel: result.verdictLabel,
    };
  });
}

export function dense27bQ4WeightsGb(): string {
  let input = applyGpuPreset('r9700', { ...DEFAULT_INPUT, ramGb: 64, view: 'gpu' });
  input = applyModelPreset('qwen36-27b', input);
  const result = compute({
    ...input,
    gpuId: 'r9700',
    quantId: 'q4_k_m',
    context: 4096,
    kvId: 'f16',
    backendId: 'llamacpp',
    pathId: 'vulkan',
    gpuCount: 1,
    split: false,
    fileWeightGiB: null,
  });
  return `${formatGiB(result.weightsGiB)} GB`;
}

export function specOffloadRamNeed(): SystemRamNeed {
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

export function specQ3RamNeed(): SystemRamNeed {
  return q3RamNeed(1);
}

export function specDailyRamNeed() {
  return houseSystemRam('daily');
}

export const SPEC_RAM_NOTE =
  `When -ngl or -ngld leaves layers on the host, the spill is system RAM. Shopper lines stay ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL}. House 35B UD-Q5_K_XL on one 32 GB R9700 does not offload. The 16 GB example below is house 35B Q4_K_M on an RX 7800 XT at 32K selected — estimate unless a measured card overlays the kit. A draft that does not fit leftover VRAM adds more host weight.`;

export function specFitNote(): string {
  return `Calculator estimate for ${COMPARE_MODEL} on llama.cpp, f16 KV. Leftover is usable VRAM minus target total (weights + KV + overhead). It is not a measured draft file. A dense same-family 27B Q4_K_M is ${dense27bQ4WeightsGb()} of weights on the calculator — usually larger than leftover on one 32 GB card after the house 35B. Pick a real smaller Q4+ draft from the card, then size it. ${COMPARE_Q3} is a labeled estimate.`;
}

export function specBlob(cards: RunCard[] = []): string {
  const measured = specMeasuredRows(cards);
  const fit = specFitRows(1, 32768);
  return [
    SPEC_TITLE,
    SPEC_DESCRIPTION,
    SPEC_LEAD,
    SPEC_WHAT,
    SPEC_WHEN_HELPS,
    SPEC_WHEN_NOT,
    SPEC_HOUSE,
    SPEC_LAUNCH,
    SPEC_RAM_NOTE,
    specFitNote(),
    SPEC_CITED_LABEL,
    SPEC_UNMEASURED,
    SPEC_DRAFT_RULE,
    COMPARE_MODEL,
    COMPARE_ENGINE,
    COMPARE_Q3,
    COMPARE_Q3_CITE,
    RAM_MIN_LABEL,
    RAM_FULL_LABEL,
    'Q6_K',
    'Q5_K_M',
    'Q4_K_M',
    ...SPEC_FLAGS.map((row) => `${row.flag} ${row.meaning} ${row.cite}`),
    ...SPEC_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...SPEC_HOWTO_STEPS.map((row) => `${row.name} ${row.text}`),
    ...SPEC_HUB_LINKS.map((link) => link.href),
    ...SPEC_SOURCES.map((source) => source.href),
    ...measured.map((row) => `${row.quant} ${row.decode4k} ${row.decode32k} ${row.note}`),
    ...fit.map((row) => `${row.quant} ${row.leftover}`),
  ].join('\n');
}

export function specHrefs(): string[] {
  const links: SpecLink[] = [
    ...SPEC_HUB_LINKS,
    ...SPEC_FAQ.flatMap((row) => row.links),
    ...SPEC_SOURCES.map((source) => ({ href: source.href, label: source.title })),
    { href: SPEC_PATH, label: SPEC_NAME },
    { href: '/gpus/r9700', label: 'R9700' },
    { href: '/compare/q4-q5-q6', label: 'Q6 Q5 Q4' },
    { href: '/quants', label: 'Quants' },
    { href: '/faq', label: 'FAQ' },
    { href: '/glossary', label: 'Glossary' },
    { href: '/results', label: 'Results' },
    { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: 'Daily recipe' },
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertSpecValid(cards: RunCard[] = []): string[] {
  const errors: string[] = [];
  const blob = specBlob(cards);
  const hrefs = new Set(specHrefs());
  if (SPEC_DESCRIPTION.length < 70 || SPEC_DESCRIPTION.length > 160) errors.push('description length');
  if (SPEC_NAME.length + ' · AMDai'.length > 60) errors.push('document title too long');
  if (!/llama\.cpp/i.test(blob)) errors.push('must keep llama.cpp first');
  if (!/llama-server/.test(blob)) errors.push('must cite llama-server');
  if (!/-md /.test(blob) || !/--model-draft/.test(blob)) errors.push('must cite -md / --model-draft');
  if (!/--spec-draft-n-max/.test(blob) || !/--spec-draft-n-min/.test(blob)) {
    errors.push('must cite current spec-draft-n flags');
  }
  if (!/-ngld/.test(blob)) errors.push('must cite -ngld');
  if (!/--device-draft/.test(blob)) errors.push('must cite --device-draft');
  if (!/removed/.test(blob)) errors.push('must note removed --draft-max / --draft-min');
  if (!blob.includes(SPEC_DRAFT_RULE)) errors.push('draft rule missing');
  if (!/Q6_K/.test(blob) || !/Q5_K_M/.test(blob) || !/Q4_K_M/.test(blob)) errors.push('must list Q6/Q5/Q4');
  if (!blob.includes(COMPARE_Q3)) errors.push('must list Q3 estimate');
  if (!/labeled estimate/.test(blob)) errors.push('Q3 must stay a labeled estimate');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('RAM lines missing');
  if (!blob.includes(SPEC_UNMEASURED)) errors.push('must keep the unmeasured A/B label');
  if (!/no MTP/.test(blob)) errors.push('must say Flash has no MTP');
  if (!/32\.6/.test(blob) || !/~16/.test(blob)) errors.push('must cite the existing Flash pair');
  if (!/Vulkan/.test(blob)) errors.push('must name Vulkan');
  if (!/vLLM/.test(blob) && !blob.includes('/backends')) errors.push('must keep other engines on /backends');
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (/fim-qwen/i.test(blob)) errors.push('must not cite the Qwen 2.5 FIM spec preset');

  const ram = specOffloadRamNeed();
  const q3 = specQ3RamNeed();
  for (const [name, need] of [
    ['offload', ram],
    ['q3', q3],
  ] as const) {
    if (!(DIMM_KIT_GB as readonly number[]).includes(need.atSelected.kitGb)) {
      errors.push(`${name} min kit ${need.atSelected.kitGb} is not a real DIMM size`);
    }
    if (!(DIMM_KIT_GB as readonly number[]).includes(need.atFullContext.kitGb)) {
      errors.push(`${name} full kit ${need.atFullContext.kitGb} is not a real DIMM size`);
    }
  }
  if (ram.atSelected.label !== 'estimate') errors.push('16 GB Q4 RAM must stay estimate');
  if (!specDailyRamNeed()) errors.push('daily house RAM missing');

  const fit = specFitRows();
  if (fit.length !== 4) errors.push('fit table must be Q6/Q5/Q4 + Q3');
  if (fit.some((row) => row.kind === 'q3-estimate' && row.quant !== COMPARE_Q3)) {
    errors.push('Q3 fit row drifted');
  }

  for (const required of REQUIRED_SPEC_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }

  if (cards.length) {
    const rows = specMeasuredRows(cards);
    if (rows.length !== 5) errors.push('measured table must be Q6/Q5xl/Q5/Q4 + Q3');
    const q5 = rows.find((row) => row.quant === 'UD-Q5_K_XL');
    if (q5?.decode4k !== '102.39 tok/s') errors.push('UD-Q5 1× 4K drifted');
    if (!q5?.runIds.length) errors.push('UD-Q5 measured cell missing run ids');
    const q3row = rows.find((row) => row.kind === 'q3-estimate');
    if (!q3row || /tok\/s/.test(q3row.decode4k)) errors.push('Q3 row must stay unmeasured');
  }

  return [...new Set(errors)];
}

export { COMPARE_Q3, COMPARE_Q3_CITE, COMPARE_MODEL, COMPARE_ENGINE, RAM_FULL_LABEL, RAM_MIN_LABEL };
