/**
 * Cited guide: constrained decoding (JSON / GBNF) on a Radeon GPU with llama.cpp.
 * Reuse /tuning, /harnesses, /setup/coding-assistant, /backends, /moe.
 * Grammar decode is not measured on local-desktop — point at Stack Lab grammar-ab/1.
 * Q3 is a labeled estimate. Q1/Q2 stay off. Do not invent tok/s or a pack deep link.
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

export const CD_PATH = '/constrained-decoding';
export const CD_NAME = 'Constrained decoding on Radeon';
export const CD_HEADING = 'Constrained decoding (JSON / GBNF) on a Radeon GPU with llama.cpp';
export const CD_PUBLISHED = '2026-10-14';
export const CD_CITED_LABEL = 'Cited llama.cpp grammar · decode vs free-form not measured on local-desktop';
export const CD_UNMEASURED = 'not measured yet — run Stack Lab grammar-ab/1';
export const CD_PACK = 'grammar-ab/1';

export const LLAMA_CPP = officialLinks.llamaCpp;
export const LLAMA_SERVER = 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md';
export const LLAMA_GRAMMARS = 'https://github.com/ggml-org/llama.cpp/blob/master/grammars/README.md';
export const LLAMA_SCHEMA_SRC =
  'https://github.com/ggml-org/llama.cpp/blob/master/common/json-schema-to-grammar.cpp';
export const LLAMA_GRAMMAR_PERF = 'https://github.com/ggml-org/llama.cpp/issues/4218';
export const JSON_SCHEMA_ORG = 'https://json-schema.org/';

export type CdLink = { href: string; label: string };

export type CdSource = {
  id: string;
  title: string;
  href: string;
};

export type CdFlag = {
  id: string;
  flag: string;
  meaning: string;
  cite: string;
};

export type CdFaq = {
  id: string;
  question: string;
  answer: string;
  links: CdLink[];
};

export const CD_TITLE = CD_HEADING;
export const CD_DESCRIPTION =
  'Constrained decoding on Radeon with llama.cpp. Cited GBNF and JSON schema. Measure decode vs free-form on Stack Lab grammar-ab/1. Q3 is a labeled estimate.';

export const CD_LEAD =
  `Hermes, coding tools, and recipe export need JSON that actually parses. llama.cpp can force the next tokens to match a GBNF grammar or a JSON Schema (converted to GBNF). Official flags live on the llama.cpp server README and grammars/README.md (checked 2026-10-14). AMDai has not measured grammar decode versus free-form on local-desktop, so every grammar tok/s and success cell stays ${CD_UNMEASURED}. Stack Lab ships that A/B as pack ${CD_PACK} — free-form versus grammar / JSON-schema, recorded as amdai-bench metrics. That pack is not an allowlisted Open-in-Stack-Lab deep link on this site. Open the planner, then record a card. House daily driver is ${COMPARE_MODEL} UD-Q5_K_XL on ${COMPARE_ENGINE} Vulkan, one R9700, 262144 context, f16 KV. ${COMPARE_Q3} is a labeled estimate (${COMPARE_Q3_CITE}). Q1/Q2 stay off. Draft / speculative decoding is a different /tuning knob, not a grammar.`;

export const CD_WHAT =
  'Constrained decoding is grammar sampling. llama.cpp only keeps tokens that still match the grammar. GBNF (GGML BNF) is the native format. A JSON Schema is converted to GBNF — that path is official on grammars/README.md and common/json-schema-to-grammar.cpp. The schema is not injected into the prompt except during tool calling, so describe the shape in the prompt. Tool-call attach stays on /harnesses and /setup/coding-assistant; this page is the GBNF / JSON-schema how-to.';

export const CD_WHEN_SCHEMA =
  'Use a JSON Schema when the output is a JSON object or array: tool arguments, a calculator result, or a recipe export. llama-server accepts -j / --json-schema, -jf / --json-schema-file, the json_schema body field, and /v1/chat/completions response_format ({"type":"json_object"} or a schema-constrained object). Official converter notes: additionalProperties defaults to false; unsupported keywords are skipped silently; a subset of JSON Schema is supported — inspect the grammar if a field disappears.';

export const CD_WHEN_GBNF =
  'Use GBNF when the output is not JSON, or when the schema subset cannot express the shape (custom lists, chess notation, a tight enum the converter drops). Pass --grammar, --grammar-file, or the grammar body field. Samples live in llama.cpp grammars/. You can also convert a schema ahead of time and ship the GBNF.';

export const CD_COST =
  `A grammar can change decode speed and can stall on a sloppy rule. llama.cpp documents performance gotchas on grammars/README.md and issue #4218 — write x{0,N} instead of a long chain of x? x? x?. AMDai does not invent an overhead tok/s. Measure free-form versus grammar on Stack Lab ${CD_PACK} and keep the card on /amdai-bench. Quality of the GGUF does not change; the token set does.`;

export const CD_HOUSE =
  `amdai’s default is ${COMPARE_MODEL} Unsloth UD-Q5_K_XL, llama.cpp Vulkan, one R9700, 262144 context, f16 KV, no grammar flag. Add --json-schema or --grammar-file only when the client needs structured JSON. House /v1 is http://127.0.0.1:8080/v1 with model id qwen — same pin as /setup/coding-assistant. A grammar does not add GGUF weight. Fit is still Q6 / Q5 / Q4 on the calculator; ${COMPARE_Q3} stays a labeled estimate.`;

export const CD_LAUNCH = [
  '# House daily-driver shape — no grammar. Same flags as /tuning.',
  './build-vk/bin/llama-server \\',
  '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
  '  -ngl 99 \\',
  '  -c 262144 \\',
  '  --cache-type-k f16 \\',
  '  --cache-type-v f16 \\',
  '  --host 127.0.0.1 --port 8080',
].join('\n');

export const CD_LAUNCH_SCHEMA = [
  '# Shape only — grammar decode is not measured on local-desktop.',
  '# Official example schema: {"type":"object"} (server README --json-schema).',
  './build-vk/bin/llama-server \\',
  '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
  '  -ngl 99 \\',
  '  -c 4096 \\',
  '  --cache-type-k f16 \\',
  '  --cache-type-v f16 \\',
  '  --json-schema \'{"type":"object"}\' \\',
  '  --host 127.0.0.1 --port 8080',
].join('\n');

export const CD_LAUNCH_GBNF = [
  '# Shape only — GBNF file from llama.cpp grammars/. Not a measured pin.',
  './build-vk/bin/llama-cli \\',
  '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
  '  -ngl 99 \\',
  '  --grammar-file grammars/json.gbnf \\',
  '  -p \'Return one JSON object. Describe the fields in this prompt — the grammar is not injected.\'',
].join('\n');

export const CD_CURL = [
  '# Shape only. Model id qwen matches GET /v1/models on the house server.',
  '# response_format is official on the llama.cpp server README.',
  'curl http://127.0.0.1:8080/v1/chat/completions \\',
  "  -H 'Content-Type: application/json' \\",
  "  -d '{",
  '    "model": "qwen",',
  '    "messages": [{"role":"user","content":"Return one JSON object with a name string. Describe that shape here."}],',
  '    "response_format": {"type":"json_object"}',
  "  }'",
].join('\n');

export const CD_FLAGS: CdFlag[] = [
  {
    id: 'grammar',
    flag: '--grammar GRAMMAR',
    meaning:
      'Inline GBNF string. Official llama.cpp server README. Also the grammar field on completion bodies. Empty / omitted means free-form.',
    cite: 'llama.cpp server README — --grammar GRAMMAR (checked 2026-10-14)',
  },
  {
    id: 'grammar-file',
    flag: '--grammar-file FNAME',
    meaning:
      'Read GBNF from a file. Official on llama-cli, llama-completion, and llama-server. Samples live in llama.cpp grammars/.',
    cite: 'llama.cpp server README — --grammar-file FNAME; grammars/README.md',
  },
  {
    id: 'json-schema',
    flag: '-j / --json-schema SCHEMA',
    meaning:
      'JSON Schema string that llama.cpp converts to GBNF. Server README example: {"type":"object"} for any JSON object. llama-cli documents the same -j / --json path on grammars/README.md.',
    cite: 'llama.cpp server README — -j, --json-schema SCHEMA; grammars/README.md',
  },
  {
    id: 'json-schema-file',
    flag: '-jf / --json-schema-file FILE',
    meaning:
      'JSON Schema from a file. Official server README. Use this when the schema is longer than a one-liner. The file is a constraint, not prompt text.',
    cite: 'llama.cpp server README — -jf, --json-schema-file FILE',
  },
  {
    id: 'api-fields',
    flag: 'grammar / json_schema body fields',
    meaning:
      'Completion endpoints accept grammar and json_schema. Default is no grammar. See tests/test-json-schema-to-grammar.cpp for the supported subset.',
    cite: 'llama.cpp server README — grammar and json_schema request fields',
  },
  {
    id: 'response-format',
    flag: 'response_format (OpenAI-shaped /v1/chat/completions)',
    meaning:
      'Official server README: {"type":"json_object"} for JSON, or a schema-constrained object ({"type":"json_object","schema":…} or {"type":"json_schema","schema":…}). Same idea as other OpenAI-inspired servers.',
    cite: 'llama.cpp server README — response_format (checked 2026-10-14)',
  },
];

export const CD_SOURCES: CdSource[] = [
  { id: 'server', title: 'llama.cpp server README (grammar / JSON schema)', href: LLAMA_SERVER },
  { id: 'grammars', title: 'llama.cpp GBNF guide', href: LLAMA_GRAMMARS },
  { id: 'schema-src', title: 'llama.cpp json-schema-to-grammar.cpp', href: LLAMA_SCHEMA_SRC },
  { id: 'perf', title: 'llama.cpp issue #4218 (grammar performance)', href: LLAMA_GRAMMAR_PERF },
  { id: 'json-schema', title: 'JSON Schema', href: JSON_SCHEMA_ORG },
  { id: 'llama', title: 'llama.cpp repository', href: LLAMA_CPP },
  { id: 'tuning', title: 'AMDai — speed up llama.cpp', href: '/tuning' },
  { id: 'harnesses', title: 'AMDai — harnesses', href: '/harnesses' },
  { id: 'coding', title: 'AMDai — coding assistant', href: '/setup/coding-assistant' },
  { id: 'backends', title: 'AMDai — backends', href: '/backends' },
  { id: 'llamacpp', title: 'AMDai — llama.cpp', href: '/backends/llamacpp' },
  { id: 'moe', title: 'AMDai — MoE', href: '/moe' },
  { id: 'stack-lab', title: 'AMDai — Stack Lab', href: '/stack-lab' },
  { id: 'bench', title: 'AMDai — amdai-bench', href: '/amdai-bench' },
];

export const CD_FAQ: CdFaq[] = [
  {
    id: 'gbnf-or-schema',
    question: 'GBNF or JSON Schema — which should I pass?',
    answer:
      'JSON Schema when the output is JSON (tool args, calculator, recipe export). GBNF when the output is not JSON, or the official schema subset cannot express the shape. llama.cpp converts a supported schema to GBNF. Describe the shape in the prompt — the schema is not injected except during tool calling.',
    links: [
      { href: '/setup/coding-assistant', label: 'Coding assistant' },
      { href: '/harnesses', label: 'Harnesses' },
      { href: '/glossary#gbnf', label: 'GBNF' },
    ],
  },
  {
    id: 'does-it-slow-decode',
    question: 'Does a grammar slow decode on a Radeon?',
    answer: `AMDai has not measured it. Official llama.cpp notes performance gotchas (issue #4218). Empty cells stay ${CD_UNMEASURED}. Do not copy a free-form 35B tok/s as a grammar figure.`,
    links: [
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
    ],
  },
  {
    id: 'can-q3-use-grammar',
    question: 'Can I constrain a Q3 file?',
    answer: `${COMPARE_Q3} may appear as a labeled estimate (${COMPARE_Q3_CITE}). House files stay Q6 / Q5 / Q4. A grammar does not change that. Q1/Q2 stay off.`,
    links: [
      { href: '/quants', label: 'Quants' },
      { href: '/compare/q4-q5-q6', label: 'Q6 / Q5 / Q4 + Q3 estimate' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
];

export const CD_HOWTO_STEPS = [
  {
    name: 'Fit the file first',
    text: 'Load the house 35B (or the file you actually run) on llama.cpp Vulkan without a grammar. Size Q6/Q5/Q4 on the calculator. Q3 stays a labeled estimate. If the file already spills, fix offload before you add a constraint.',
  },
  {
    name: 'Describe the shape in the prompt',
    text: 'Official grammars/README.md: the JSON schema is not injected into the prompt except during tool calling. Name the fields in the user or system message so the model has something to follow.',
  },
  {
    name: 'Pick JSON Schema or GBNF',
    text: 'Schema for JSON objects and arrays. GBNF for custom / non-JSON output, or when the converter subset fails. Official flags: --json-schema / -j, --json-schema-file / -jf, --grammar, --grammar-file.',
  },
  {
    name: 'Launch llama-server or llama-cli',
    text: 'House /v1 is 127.0.0.1:8080, model id qwen. Pass a schema, a GBNF file, or response_format on /v1/chat/completions. Shape only — not a measured tok/s.',
  },
  {
    name: 'Measure free-form versus grammar',
    text: `Run Stack Lab ${CD_PACK} and record an amdai-bench card. Keep the constraint only if your card shows a win on parse success. Do not invent an overhead.`,
  },
];

export const CD_SECTIONS = [
  { id: 'what', label: 'What a grammar does' },
  { id: 'when', label: 'GBNF vs JSON Schema' },
  { id: 'cost', label: 'Cost vs free-form' },
  { id: 'house', label: 'House launch' },
  { id: 'flags', label: 'llama.cpp flags' },
  { id: 'measured', label: 'Measured 35B' },
  { id: 'fit', label: 'VRAM fit' },
  { id: 'ram', label: 'System RAM' },
  { id: 'faq', label: 'FAQ' },
  { id: 'sources', label: 'Sources' },
];

export const CD_HUB_LINKS: CdLink[] = [
  { href: '/tuning', label: 'Speed up llama.cpp' },
  { href: '/harnesses', label: 'Harnesses' },
  { href: '/setup/coding-assistant', label: 'Coding assistant' },
  { href: '/backends', label: 'Backends' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/moe', label: 'MoE' },
  { href: '/compare/vulkan-vs-rocm', label: 'Vulkan vs ROCm' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/stack-lab', label: 'Stack Lab' },
  { href: '/amdai-bench', label: 'amdai-bench' },
  { href: '/sampling', label: 'Sampling' },
];

export const REQUIRED_CD_HREFS = [
  '/tuning',
  '/harnesses',
  '/setup/coding-assistant',
  '/backends',
  '/backends/llamacpp',
  '/moe',
  '/compare/vulkan-vs-rocm',
  '/calculator',
  '/quants',
  '/compare/q4-q5-q6',
  '/stack-lab',
  '/amdai-bench',
  '/sampling',
  '/benchmarks',
  '/results',
  '/gpus/r9700',
  '/recipes/qwen36-35b.llamacpp-vulkan.262k',
  '/faq',
  '/glossary',
] as const;

export type CdQuantRow = {
  quant: string;
  kind: 'measured' | 'q3-estimate';
  decode4k: string;
  decode32k: string;
  note: string;
  runIds: string[];
};

export function cdMeasuredRows(cards: RunCard[]): CdQuantRow[] {
  const table = oneVsTwoRows(cards);
  const quants = ['Q6_K', 'UD-Q5_K_XL', 'Q5_K_M', 'Q4_K_M'] as const;
  const rows: CdQuantRow[] = quants.map((quant) => {
    const at4k = table.find((row) => row.quant === quant && row.context === 4096);
    const at32k = table.find((row) => row.quant === quant && row.context === 32768);
    const decode4k = at4k?.one.decode ?? CD_UNMEASURED;
    const decode32k = at32k?.one.decode ?? CD_UNMEASURED;
    const runIds = [...new Set([...(at4k?.one.runIds ?? []), ...(at32k?.one.runIds ?? [])])];
    return {
      quant,
      kind: 'measured',
      decode4k,
      decode32k,
      note: 'Official local-desktop llama.cpp Vulkan, one R9700. Free-form — no grammar flag.',
      runIds,
    };
  });
  rows.push({
    quant: COMPARE_Q3,
    kind: 'q3-estimate',
    decode4k: CD_UNMEASURED,
    decode32k: CD_UNMEASURED,
    note: `${COMPARE_Q3_CITE}. Q3 is a labeled estimate — not a local-desktop run, not a grammar.`,
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

export type CdFitRow = {
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
  if (left <= 0) return 'no leftover — offload (estimate)';
  return `${formatGiB(left)} GB leftover (estimate)`;
}

export function cdFitRows(gpuCount: 1 | 2 = 1, context = 32768): CdFitRow[] {
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

export function cdOffloadRamNeed(): SystemRamNeed {
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

export function cdQ3RamNeed(): SystemRamNeed {
  return q3RamNeed(1);
}

export function cdDailyRamNeed() {
  return houseSystemRam('daily');
}

export const CD_RAM_NOTE =
  `A grammar or schema does not add GGUF weight. When -ngl leaves layers on the host, the spill is still system RAM. Shopper lines stay ${RAM_MIN_LABEL} (full-system estimate rounded to a real kit size, with a breakdown — labeled estimate until a card overlays it) and ${RAM_FULL_LABEL} (cache included when measured llama.cpp peaks exist). House 35B UD-Q5_K_XL on one 32 GB R9700 does not offload. The 16 GB example below is house 35B Q4_K_M on an RX 7800 XT at 32K selected — estimate unless a measured card overlays the kit.`;

export function cdFitNote(): string {
  return `Calculator estimate for ${COMPARE_MODEL} on llama.cpp, f16 KV. A grammar does not change weights or KV. Leftover is usable VRAM minus total (weights + KV + overhead). ${COMPARE_Q3} is a labeled estimate. Do not read leftover as a grammar-speed cell.`;
}

export const CD_STACK_LAB =
  `Stack Lab ships an opt-in grammar A/B as pack ${CD_PACK} (free-form versus grammar / JSON-schema, amdai-bench metrics). That pack is not allowlisted for Open in Stack Lab on this site. Do not invent a deep-link href for the pack. Open the planner or doctor, then record a card on /amdai-bench. Packages are not published yet.`;

export function cdBlob(cards: RunCard[] = []): string {
  const measured = cdMeasuredRows(cards);
  const fit = cdFitRows(1, 32768);
  return [
    CD_TITLE,
    CD_DESCRIPTION,
    CD_LEAD,
    CD_WHAT,
    CD_WHEN_SCHEMA,
    CD_WHEN_GBNF,
    CD_COST,
    CD_HOUSE,
    CD_LAUNCH,
    CD_LAUNCH_SCHEMA,
    CD_LAUNCH_GBNF,
    CD_CURL,
    CD_RAM_NOTE,
    CD_STACK_LAB,
    cdFitNote(),
    CD_CITED_LABEL,
    CD_UNMEASURED,
    CD_PACK,
    COMPARE_MODEL,
    COMPARE_ENGINE,
    COMPARE_Q3,
    COMPARE_Q3_CITE,
    RAM_MIN_LABEL,
    RAM_FULL_LABEL,
    'Q6_K',
    'Q5_K_M',
    'Q4_K_M',
    ...CD_FLAGS.map((row) => `${row.flag} ${row.meaning} ${row.cite}`),
    ...CD_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...CD_HOWTO_STEPS.map((row) => `${row.name} ${row.text}`),
    ...CD_HUB_LINKS.map((link) => link.href),
    ...CD_SOURCES.map((source) => source.href),
    ...measured.map((row) => `${row.quant} ${row.decode4k} ${row.decode32k} ${row.note}`),
    ...fit.map((row) => `${row.quant} ${row.leftover}`),
  ].join('\n');
}

export function cdHrefs(): string[] {
  const links: CdLink[] = [
    ...CD_HUB_LINKS,
    ...CD_FAQ.flatMap((row) => row.links),
    ...CD_SOURCES.map((source) => ({ href: source.href, label: source.title })),
    { href: CD_PATH, label: CD_NAME },
    { href: '/gpus/r9700', label: 'R9700' },
    { href: '/compare/q4-q5-q6', label: 'Q6 Q5 Q4' },
    { href: '/quants', label: 'Quants' },
    { href: '/faq', label: 'FAQ' },
    { href: '/glossary', label: 'Glossary' },
    { href: '/results', label: 'Results' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: 'Daily recipe' },
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertConstrainedValid(cards: RunCard[] = []): string[] {
  const errors: string[] = [];
  const blob = cdBlob(cards);
  const hrefs = new Set(cdHrefs());
  if (CD_DESCRIPTION.length < 70 || CD_DESCRIPTION.length > 160) errors.push('description length');
  if (CD_NAME.length + ' · AMDai'.length > 60) errors.push('document title too long');
  if (!/llama\.cpp/i.test(blob)) errors.push('must keep llama.cpp first');
  if (!/llama-server/.test(blob)) errors.push('must cite llama-server');
  if (!/--grammar/.test(blob) || !/--grammar-file/.test(blob)) errors.push('must cite --grammar / --grammar-file');
  if (!/--json-schema/.test(blob) || !/--json-schema-file/.test(blob)) {
    errors.push('must cite --json-schema / --json-schema-file');
  }
  if (!/json_schema/.test(blob)) errors.push('must cite json_schema');
  if (!/response_format/.test(blob)) errors.push('must cite response_format');
  if (!/GBNF/.test(blob)) errors.push('must name GBNF');
  if (!blob.includes(CD_PACK)) errors.push('must name grammar-ab/1');
  if (!/#4218/.test(blob)) errors.push('must cite grammar performance issue');
  if (!/not injected/.test(blob)) errors.push('must say the schema is not injected');
  if (!/Q6_K/.test(blob) || !/Q5_K_M/.test(blob) || !/Q4_K_M/.test(blob)) errors.push('must list Q6/Q5/Q4');
  if (!blob.includes(COMPARE_Q3)) errors.push('must list Q3 estimate');
  if (!/labeled estimate/.test(blob)) errors.push('Q3 must stay a labeled estimate');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('RAM lines missing');
  if (!blob.includes(CD_UNMEASURED)) errors.push('must keep the unmeasured grammar-ab/1 label');
  if (!/Vulkan/.test(blob)) errors.push('must name Vulkan');
  if (blob.includes('/speculative-decoding')) errors.push('must not href /speculative-decoding on this branch');
  if (/amdai-stack-lab:(?:\/\/)?[a-z]+\/grammar-ab/.test(blob)) {
    errors.push('must not invent a grammar-ab deep link');
  }
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');

  const ram = cdOffloadRamNeed();
  const q3 = cdQ3RamNeed();
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
  if (!cdDailyRamNeed()) errors.push('daily house RAM missing');

  const fit = cdFitRows();
  if (fit.length !== 4) errors.push('fit table must be Q6/Q5/Q4 + Q3');
  if (fit.some((row) => row.kind === 'q3-estimate' && row.quant !== COMPARE_Q3)) {
    errors.push('Q3 fit row drifted');
  }

  for (const required of REQUIRED_CD_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }

  if (cards.length) {
    const rows = cdMeasuredRows(cards);
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
