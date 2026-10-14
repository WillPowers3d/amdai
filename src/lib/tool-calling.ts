/**
 * Cited guide: tool calling and structured JSON with llama.cpp on Radeon.
 * Reuse /harnesses, /setup/coding-assistant, /setup/open-webui, /backends, /tuning.
 * Tool-call success and grammar decode are not measured on local-desktop.
 * Q3 is a labeled estimate. Q1/Q2 stay off. No Qwen2.5 / Qwen3-8B names.
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

export const TC_PATH = '/guides/tool-calling';
export const TC_NAME = 'Tool calling on Radeon';
export const TC_HEADING = 'Tool calling and structured JSON with llama.cpp on a Radeon GPU';
export const TC_PUBLISHED = '2026-10-14';
export const TC_CITED_LABEL = 'Cited llama.cpp --jinja · tool-call success not measured on local-desktop';
export const TC_UNMEASURED = 'not measured yet — run Stack Lab grammar-ab/1';
export const TC_PACK = 'grammar-ab/1';

export const LLAMA_CPP = officialLinks.llamaCpp;
export const LLAMA_SERVER = 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md';
export const LLAMA_FN = 'https://github.com/ggml-org/llama.cpp/blob/master/docs/function-calling.md';
export const LLAMA_GRAMMARS = 'https://github.com/ggml-org/llama.cpp/blob/master/grammars/README.md';
export const LLAMA_SCHEMA_SRC =
  'https://github.com/ggml-org/llama.cpp/blob/master/common/json-schema-to-grammar.cpp';
export const QWEN36_CARD = officialLinks.qwen36;
export const LLAMA3370_CARD = officialLinks.llama3370b;
export const GPTOSS_CARD = officialLinks.gptOss20b;

export type TcLink = { href: string; label: string };
export type TcSource = { id: string; title: string; href: string };
export type TcFlag = { id: string; flag: string; meaning: string; cite: string };
export type TcFaq = { id: string; question: string; answer: string; links: TcLink[] };
export type TcTrouble = { id: string; title: string; body: string };

export const TC_TITLE = TC_HEADING;
export const TC_DESCRIPTION =
  'Tool calling on Radeon with llama.cpp. Cited --jinja, tools, JSON schema, GBNF. Measure grammar cost on Stack Lab grammar-ab/1. Q3 is a labeled estimate.';

export const TC_LEAD =
  `Hermes, Cline, Continue, and Roo need OpenAI-style tool calls and JSON that parses. llama.cpp documents that path in docs/function-calling.md and the server README (checked 2026-10-14): start llama-server with --jinja, send tools on /v1/chat/completions, and optionally constrain the body with response_format, a JSON Schema, or GBNF. AMDai has not measured tool-call success or grammar decode on local-desktop, so those cells stay ${TC_UNMEASURED}. Stack Lab pack ${TC_PACK} is the free-form versus grammar / JSON-schema A/B. It is not an allowlisted Open-in-Stack-Lab deep link — open the planner, then record an amdai-bench card. House daily driver is ${COMPARE_MODEL} UD-Q5_K_XL on ${COMPARE_ENGINE} Vulkan, one R9700, 262144 context, f16 KV. ${COMPARE_Q3} is a labeled estimate (${COMPARE_Q3_CITE}). Q1/Q2 stay off.`;

export const TC_WHAT =
  'A tool call is an OpenAI-shaped /v1/chat/completions request that includes a tools array. The model returns tool_calls instead of (or before) a normal message. llama.cpp parses that when --jinja is on and the chat template understands tools. Function-calling.md: native handlers exist for several families (Llama 3.1 / 3.3, GPT-OSS Harmony, Hermes 2/3, Functionary, Mistral Nemo, Command R7B, DeepSeek R1). Unrecognized templates fall back to Generic — logs say Chat format: Generic. Generic may use more tokens. Parallel / multiple tool calls stay off unless the payload sets "parallel_tool_calls": true, and only some templates support them.';

export const TC_JINJA =
  'function-calling.md: start llama-server with --jinja. The server README (checked 2026-10-14) lists --jinja / --no-jinja and says the default is enabled. The house pin still passes --jinja so a rebuilt binary cannot silently drop it. The template comes from the GGUF metadata unless you override it. --chat-template-file loads a Jinja file. --chat-template names a built-in (chatml is the documented “many models, YMMV” fallback when there is no official tool_use template). Inspect GET /props for chat_template and chat_template_tool_use. --skip-chat-parsing dumps reasoning and tool markup into content instead of parsing them.';

export const TC_HOUSE_TEMPLATE =
  `Official ${COMPARE_MODEL} card documents tool use (vLLM / sglang parsers on that card). llama.cpp function-calling.md does not name this 3.6 file in the native-handler table. After launch, read the server log for Chat format and GET http://127.0.0.1:8080/props. Do not invent a handler name or a --chat-template-file path for the house GGUF. Llama 3.3 70B is listed as Llama 3.x native. GPT-OSS is listed as Harmony. Gemma 3 27B and GLM 5.3 Flash are not named on that table — treat them as not documented there.`;

export const TC_STRUCTURED =
  'Tool calling injects the tool schema into the prompt. Constrained decoding is a different knob: it forces the next tokens to match a grammar. Official grammars/README.md: JSON Schema converts to GBNF via json-schema-to-grammar; the schema is not injected except during tool calling, so describe a free-form JSON shape in the prompt. Use response_format {"type":"json_object"} or a schema-constrained object when the whole reply must be JSON (calculator output, recipe export) and you are not in a tool loop. Use --grammar / --grammar-file when the output is not JSON. Use tools + --jinja when the harness expects tool_calls. A grammar can stall — llama.cpp issue #4218. Do not invent an overhead tok/s; measure ${TC_PACK}.';

export const TC_HOUSE =
  `amdai’s default is ${COMPARE_MODEL} Unsloth UD-Q5_K_XL, llama.cpp Vulkan, one R9700, 262144 context, f16 KV. Add --jinja for tools. House /v1 is http://127.0.0.1:8080/v1 with model id qwen — same pin as /setup/coding-assistant. function-calling.md cautions that extreme KV quants (example: q4_0 KV) can degrade tool calling. House KV stays f16. A tools payload and multi-turn history eat context — size -c on /long-context.`;

export const TC_STRATA =
  'House Hermes on local-desktop also talks to Strata on :8083 for the Flash fast-agent path. llama.cpp function-calling.md does not document Strata. Treat Strata tool calls as not verified here. Attach notes stay on /harnesses/hermes and /backends/strata.';

export const TC_LAUNCH = [
  '# House daily-driver shape with --jinja. Not a measured tool-call pin.',
  './build-vk/bin/llama-server \\',
  '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
  '  --jinja \\',
  '  -ngl 99 \\',
  '  -c 262144 \\',
  '  --cache-type-k f16 \\',
  '  --cache-type-v f16 \\',
  '  --host 127.0.0.1 --port 8080',
].join('\n');

export const TC_CURL_TOOLS = [
  '# Shape only. Official tools payload from docs/function-calling.md,',
  '# pointed at the house /v1 (model id qwen). Not a measured success rate.',
  'curl http://127.0.0.1:8080/v1/chat/completions \\',
  "  -H 'Content-Type: application/json' \\",
  "  -d '{",
  '    "model": "qwen",',
  '    "messages": [{"role":"user","content":"What is the weather in Istanbul?"}],',
  '    "tools": [{',
  '      "type": "function",',
  '      "function": {',
  '        "name": "get_current_weather",',
  '        "description": "Get the current weather in a given location",',
  '        "parameters": {',
  '          "type": "object",',
  '          "properties": {',
  '            "location": {"type":"string","description":"City and country/state"}',
  '          },',
  '          "required": ["location"]',
  '        }',
  '      }',
  '    }]',
  "  }'",
].join('\n');

export const TC_CURL_SCHEMA = [
  '# Shape only. response_format from the llama.cpp server README.',
  '# Describe the fields in the prompt — the schema is not injected.',
  'curl http://127.0.0.1:8080/v1/chat/completions \\',
  "  -H 'Content-Type: application/json' \\",
  "  -d '{",
  '    "model": "qwen",',
  '    "messages": [{"role":"user","content":"Return one JSON object with a name string."}],',
  '    "response_format": {"type":"json_object"}',
  "  }'",
].join('\n');

export const TC_FLAGS: TcFlag[] = [
  {
    id: 'jinja',
    flag: '--jinja / --no-jinja',
    meaning:
      'Use the Jinja chat-template engine. function-calling.md requires --jinja for OpenAI-style tools. Server README default is enabled (checked 2026-10-14). House pin still passes --jinja.',
    cite: 'llama.cpp function-calling.md; server README — --jinja (checked 2026-10-14)',
  },
  {
    id: 'chat-template',
    flag: '--chat-template / --chat-template-file',
    meaning:
      'Override the GGUF metadata template. Built-in names include chatml (documented YMMV fallback). A file path loads a custom Jinja. Inspect /props for chat_template and chat_template_tool_use before you invent a filename.',
    cite: 'llama.cpp server README — --chat-template, --chat-template-file; function-calling.md',
  },
  {
    id: 'skip-parse',
    flag: '--skip-chat-parsing',
    meaning:
      'Force a pure content parser. Reasoning and tool markup stay in message.content instead of being split out. Useful when think-tags leak into a harness that expects tool_calls.',
    cite: 'llama.cpp server README — --skip-chat-parsing',
  },
  {
    id: 'parallel',
    flag: 'parallel_tool_calls (request body)',
    meaning:
      'Multiple / parallel tool calls. Official default is off. Enable with "parallel_tool_calls": true. Only some templates support it; verification is based on the Jinja template.',
    cite: 'llama.cpp function-calling.md; server README — parallel_tool_calls',
  },
  {
    id: 'response-format',
    flag: 'response_format / json_schema / grammar',
    meaning:
      'Constrain the whole reply to JSON or a GBNF grammar. Server README: {"type":"json_object"} or a schema object. -j / --json-schema and --grammar-file on the CLI. Not a substitute for a tools array.',
    cite: 'llama.cpp server README — response_format, json_schema, grammar; grammars/README.md',
  },
];

export const TC_TROUBLE: TcTrouble[] = [
  {
    id: 'ignored',
    title: 'Tools ignored',
    body: 'Confirm --jinja, then GET /props for a tools-aware chat_template / chat_template_tool_use. Read the log for Chat format: Generic versus a native handler. A missing or default-only template often means the model writes prose. Do not invent a --chat-template-file for the house 35B — start from the GGUF metadata.',
  },
  {
    id: 'malformed',
    title: 'Malformed JSON',
    body: 'Tool arguments are model text unless you also constrain them. For a whole-reply JSON object, use response_format or --json-schema. For a custom shape, use GBNF. Measure parse success on Stack Lab grammar-ab/1. Do not copy a free-form 35B tok/s as a grammar figure.',
  },
  {
    id: 'think-tags',
    title: 'Think-tags leaking into tool calls',
    body: 'Reasoning tokens can land in content when the parser and the template disagree. Official server README: --skip-chat-parsing keeps everything in content; reasoning_effort none disables thinking when the template honors it. The official Qwen3.6 card documents enable_thinking on other engines — that is their cite, not a llama.cpp flag we invent.',
  },
  {
    id: 'template',
    title: 'Template mismatch',
    body: 'function-calling.md: override with --chat-template-file, or try --chat-template chatml when there is no official tool_use template (YMMV). Wrong template is the usual “tools ignored” or “markup in content” cause. Check /props after every override.',
  },
  {
    id: 'drift',
    title: 'Long-context drift',
    body: 'Tool schemas and multi-turn tool results sit in the KV cache. Official UD-Q5 1-GPU llama.cpp decode already drops from 102.39 tok/s at 4K to 44.4 at 256K — same file, no tools. Size -c on /long-context. Extreme KV quants can degrade tool calling (function-calling.md). House KV stays f16.',
  },
];

export const TC_SOURCES: TcSource[] = [
  { id: 'fn', title: 'llama.cpp function-calling.md', href: LLAMA_FN },
  { id: 'server', title: 'llama.cpp server README', href: LLAMA_SERVER },
  { id: 'grammars', title: 'llama.cpp GBNF guide', href: LLAMA_GRAMMARS },
  { id: 'schema-src', title: 'llama.cpp json-schema-to-grammar.cpp', href: LLAMA_SCHEMA_SRC },
  { id: 'qwen36', title: 'Qwen3.6-35B-A3B model card', href: QWEN36_CARD },
  { id: 'llama33', title: 'Llama 3.3 70B model card', href: LLAMA3370_CARD },
  { id: 'gptoss', title: 'gpt-oss-20b model card', href: GPTOSS_CARD },
  { id: 'llama', title: 'llama.cpp repository', href: LLAMA_CPP },
  { id: 'coding', title: 'AMDai — coding assistant', href: '/setup/coding-assistant' },
  { id: 'harnesses', title: 'AMDai — harnesses', href: '/harnesses' },
  { id: 'webui', title: 'AMDai — Open WebUI', href: '/setup/open-webui' },
  { id: 'backends', title: 'AMDai — backends', href: '/backends' },
  { id: 'llamacpp', title: 'AMDai — llama.cpp', href: '/backends/llamacpp' },
  { id: 'strata', title: 'AMDai — Strata', href: '/backends/strata' },
  { id: 'hermes', title: 'AMDai — Hermes', href: '/harnesses/hermes' },
  { id: 'tuning', title: 'AMDai — speed up llama.cpp', href: '/tuning' },
  { id: 'long', title: 'AMDai — long context', href: '/long-context' },
  { id: 'stack-lab', title: 'AMDai — Stack Lab', href: '/stack-lab' },
  { id: 'bench', title: 'AMDai — amdai-bench', href: '/amdai-bench' },
];

export const TC_FAQ: TcFaq[] = [
  {
    id: 'need-jinja',
    question: 'Do I need --jinja for tool calls?',
    answer:
      'Yes for the documented OpenAI-style path. function-calling.md starts llama-server with --jinja. The server README default is enabled (checked 2026-10-14); the house pin still passes the flag. Then send a tools array on /v1/chat/completions.',
    links: [
      { href: '/setup/coding-assistant', label: 'Coding assistant' },
      { href: '/harnesses', label: 'Harnesses' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
  {
    id: 'schema-or-tools',
    question: 'Tools array or JSON Schema — which one?',
    answer:
      'Use tools + --jinja when the harness expects tool_calls (Hermes, Cline, Continue). Use response_format / --json-schema / GBNF when the whole reply must be one JSON object and you are not in a tool loop. The schema is not injected except during tool calling. Grammar cost stays not measured yet — run Stack Lab grammar-ab/1.',
    links: [
      { href: '/glossary#gbnf', label: 'GBNF' },
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/amdai-bench', label: 'amdai-bench' },
    ],
  },
  {
    id: 'can-q3-call-tools',
    question: 'Can a Q3 file call tools?',
    answer: `${COMPARE_Q3} may appear as a labeled estimate (${COMPARE_Q3_CITE}). House files stay Q6 / Q5 / Q4. A template flag does not change that. Q1/Q2 stay off.`,
    links: [
      { href: '/quants', label: 'Quants' },
      { href: '/compare/q4-q5-q6', label: 'Q6 / Q5 / Q4 + Q3 estimate' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
];

export const TC_HOWTO_STEPS = [
  {
    name: 'Fit the house file',
    text: 'Load Qwen3.6-35B-A3B UD-Q5_K_XL on llama.cpp Vulkan without tools first. Size Q6/Q5/Q4 on the calculator. Q3 stays a labeled estimate.',
  },
  {
    name: 'Start llama-server with --jinja',
    text: 'House pin: --jinja, -ngl 99, -c 262144, f16 KV, 127.0.0.1:8080. Confirm GET /v1/models and GET /props for chat_template.',
  },
  {
    name: 'Send a tools request',
    text: 'POST /v1/chat/completions with a tools array. Official shape from function-calling.md. Model id qwen. Parallel calls stay off unless you set parallel_tool_calls.',
  },
  {
    name: 'Constrain JSON when you are not in a tool loop',
    text: 'response_format json_object, --json-schema, or GBNF. Describe the shape in the prompt. Measure grammar-ab/1 versus free-form.',
  },
  {
    name: 'Point the harness at :8080/v1',
    text: 'Aider, Cline, Continue, and Hermes attach notes are on /setup/coding-assistant and /harnesses. Strata :8083 tool calls are not verified here.',
  },
];

export const TC_SECTIONS = [
  { id: 'what', label: 'What a tool call is' },
  { id: 'jinja', label: '--jinja and templates' },
  { id: 'structured', label: 'Structured JSON' },
  { id: 'house', label: 'House launch' },
  { id: 'trouble', label: 'Troubleshooting' },
  { id: 'measured', label: 'Measured 35B' },
  { id: 'fit', label: 'VRAM fit' },
  { id: 'ram', label: 'System RAM' },
  { id: 'faq', label: 'FAQ' },
  { id: 'sources', label: 'Sources' },
];

export const TC_HUB_LINKS: TcLink[] = [
  { href: '/setup/coding-assistant', label: 'Coding assistant' },
  { href: '/harnesses', label: 'Harnesses' },
  { href: '/harnesses/hermes', label: 'Hermes' },
  { href: '/setup/open-webui', label: 'Open WebUI' },
  { href: '/backends', label: 'Backends' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/tuning', label: 'Speed up llama.cpp' },
  { href: '/long-context', label: 'Long context' },
  { href: '/speculative-decoding', label: 'Speculative decoding' },
  { href: '/stack-lab', label: 'Stack Lab' },
  { href: '/amdai-bench', label: 'amdai-bench' },
  { href: '/sampling', label: 'Sampling' },
];

export const REQUIRED_TC_HREFS = [
  '/setup/coding-assistant',
  '/harnesses',
  '/harnesses/hermes',
  '/setup/open-webui',
  '/backends',
  '/backends/llamacpp',
  '/backends/strata',
  '/tuning',
  '/long-context',
  '/speculative-decoding',
  '/stack-lab',
  '/amdai-bench',
  '/sampling',
  '/calculator',
  '/quants',
  '/compare/q4-q5-q6',
  '/benchmarks',
  '/results',
  '/gpus/r9700',
  '/recipes/qwen36-35b.llamacpp-vulkan.262k',
  '/faq',
  '/glossary',
] as const;

export type TcQuantRow = {
  quant: string;
  kind: 'measured' | 'q3-estimate';
  decode4k: string;
  decode32k: string;
  note: string;
  runIds: string[];
};

export function tcMeasuredRows(cards: RunCard[]): TcQuantRow[] {
  const table = oneVsTwoRows(cards);
  const quants = ['Q6_K', 'UD-Q5_K_XL', 'Q5_K_M', 'Q4_K_M'] as const;
  const rows: TcQuantRow[] = quants.map((quant) => {
    const at4k = table.find((row) => row.quant === quant && row.context === 4096);
    const at32k = table.find((row) => row.quant === quant && row.context === 32768);
    return {
      quant,
      kind: 'measured',
      decode4k: at4k?.one.decode ?? TC_UNMEASURED,
      decode32k: at32k?.one.decode ?? TC_UNMEASURED,
      note: 'Official local-desktop llama.cpp Vulkan, one R9700. Free-form — no tools array.',
      runIds: [...new Set([...(at4k?.one.runIds ?? []), ...(at32k?.one.runIds ?? [])])],
    };
  });
  rows.push({
    quant: COMPARE_Q3,
    kind: 'q3-estimate',
    decode4k: TC_UNMEASURED,
    decode32k: TC_UNMEASURED,
    note: `${COMPARE_Q3_CITE}. Q3 is a labeled estimate — not a local-desktop run, not a tool-call card.`,
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

export type TcFitRow = {
  quant: string;
  kind: 'estimate' | 'q3-estimate';
  weightsGb: string;
  totalGb: string;
  usableGb: string;
  leftover: string;
};

function mainFitInput(quantId: QuantId, context: number) {
  let input = applyGpuPreset('r9700', {
    ...DEFAULT_INPUT,
    ramGb: 64,
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
    ramGb: 64,
    kind: 'discrete' as const,
    usablePct: 100,
    quantId,
    context,
    kvId: 'f16' as const,
    backendId: 'llamacpp' as const,
    pathId: 'vulkan' as const,
    gpuCount: 1 as const,
    split: false,
    fileWeightGiB: null,
  };
}

function leftoverLabel(usable: number, total: number): string {
  const left = usable - total;
  if (left <= 0) return 'no leftover — offload (estimate)';
  return `${formatGiB(left)} GB leftover (estimate)`;
}

export function tcFitRows(context = 32768): TcFitRow[] {
  return FIT_QUANTS.map((quant) => {
    const result = compute(mainFitInput(quant.id, context));
    return {
      quant: quant.label,
      kind: quant.kind,
      weightsGb: `${formatGiB(result.weightsGiB)} GB`,
      totalGb: `${formatGiB(result.totalGiB)} GB`,
      usableGb: `${formatGiB(result.usableVramGb)} GB`,
      leftover: leftoverLabel(result.usableVramGb, result.totalGiB),
    };
  });
}

export function tcOffloadRamNeed(): SystemRamNeed {
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

export function tcQ3RamNeed(): SystemRamNeed {
  return q3RamNeed(1);
}

export function tcDailyRamNeed() {
  return houseSystemRam('daily');
}

export const TC_RAM_NOTE =
  `A tools array does not add GGUF weight; it does add prompt tokens. When -ngl leaves layers on the host, shopper lines stay ${RAM_MIN_LABEL} (full-system estimate rounded to a real kit, with a breakdown — labeled estimate until a card overlays it) and ${RAM_FULL_LABEL} (cache included when measured llama.cpp peaks exist). House 35B UD-Q5_K_XL on one 32 GB R9700 does not offload. The 16 GB example is house 35B Q4_K_M on an RX 7800 XT at 32K selected — estimate unless a measured card overlays the kit.`;

export function tcFitNote(): string {
  return `Calculator estimate for ${COMPARE_MODEL} on llama.cpp, f16 KV. A tools payload does not change weights. ${COMPARE_Q3} is a labeled estimate. Do not read leftover as a tool-call speed cell.`;
}

export const TC_STACK_LAB =
  `Stack Lab ships an opt-in grammar A/B as pack ${TC_PACK} (free-form versus grammar / JSON-schema, amdai-bench metrics). That pack is not allowlisted for Open in Stack Lab. Do not invent a deep-link href for the pack. Open the planner or doctor, then record a card on /amdai-bench. Packages are not published yet.`;

export function tcBlob(cards: RunCard[] = []): string {
  const measured = tcMeasuredRows(cards);
  const fit = tcFitRows();
  return [
    TC_TITLE,
    TC_DESCRIPTION,
    TC_LEAD,
    TC_WHAT,
    TC_JINJA,
    TC_HOUSE_TEMPLATE,
    TC_STRUCTURED,
    TC_HOUSE,
    TC_STRATA,
    TC_LAUNCH,
    TC_CURL_TOOLS,
    TC_CURL_SCHEMA,
    TC_RAM_NOTE,
    TC_STACK_LAB,
    tcFitNote(),
    TC_CITED_LABEL,
    TC_UNMEASURED,
    TC_PACK,
    COMPARE_MODEL,
    COMPARE_ENGINE,
    COMPARE_Q3,
    COMPARE_Q3_CITE,
    RAM_MIN_LABEL,
    RAM_FULL_LABEL,
    'Q6_K',
    'Q5_K_M',
    'Q4_K_M',
    ...TC_FLAGS.map((row) => `${row.flag} ${row.meaning} ${row.cite}`),
    ...TC_TROUBLE.map((row) => `${row.title} ${row.body}`),
    ...TC_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...TC_HOWTO_STEPS.map((row) => `${row.name} ${row.text}`),
    ...TC_HUB_LINKS.map((link) => link.href),
    ...TC_SOURCES.map((source) => source.href),
    ...measured.map((row) => `${row.quant} ${row.decode4k} ${row.decode32k} ${row.note}`),
    ...fit.map((row) => `${row.quant} ${row.leftover}`),
  ].join('\n');
}

export function tcHrefs(): string[] {
  const links: TcLink[] = [
    ...TC_HUB_LINKS,
    ...TC_FAQ.flatMap((row) => row.links),
    ...TC_SOURCES.map((source) => ({ href: source.href, label: source.title })),
    { href: TC_PATH, label: TC_NAME },
    { href: '/gpus/r9700', label: 'R9700' },
    { href: '/compare/q4-q5-q6', label: 'Q6 Q5 Q4' },
    { href: '/quants', label: 'Quants' },
    { href: '/faq', label: 'FAQ' },
    { href: '/glossary', label: 'Glossary' },
    { href: '/results', label: 'Results' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: 'Daily recipe' },
    { href: '/models/llama33-70b', label: 'Llama 3.3 70B' },
    { href: '/models/gpt-oss-20b', label: 'gpt-oss-20b' },
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertToolCallingValid(cards: RunCard[] = []): string[] {
  const errors: string[] = [];
  const blob = tcBlob(cards);
  const hrefs = new Set(tcHrefs());
  if (TC_DESCRIPTION.length < 70 || TC_DESCRIPTION.length > 160) errors.push('description length');
  if (TC_NAME.length + ' · AMDai'.length > 60) errors.push('document title too long');
  if (!/llama\.cpp/i.test(blob)) errors.push('must keep llama.cpp first');
  if (!/llama-server/.test(blob)) errors.push('must cite llama-server');
  if (!/--jinja/.test(blob)) errors.push('must cite --jinja');
  if (!/--chat-template/.test(blob)) errors.push('must cite --chat-template');
  if (!/function-calling\.md/.test(blob)) errors.push('must cite function-calling.md');
  if (!/response_format/.test(blob)) errors.push('must cite response_format');
  if (!/json_schema|--json-schema/.test(blob)) errors.push('must cite json_schema');
  if (!/GBNF/.test(blob)) errors.push('must name GBNF');
  if (!/parallel_tool_calls/.test(blob)) errors.push('must cite parallel_tool_calls');
  if (!blob.includes(TC_PACK)) errors.push('must name grammar-ab/1');
  if (!/Generic/.test(blob)) errors.push('must name Generic fallback');
  if (!/not verified/.test(blob)) errors.push('must mark Strata as not verified');
  if (!/Q6_K/.test(blob) || !/Q5_K_M/.test(blob) || !/Q4_K_M/.test(blob)) errors.push('must list Q6/Q5/Q4');
  if (!blob.includes(COMPARE_Q3)) errors.push('must list Q3 estimate');
  if (!/labeled estimate/.test(blob)) errors.push('Q3 must stay a labeled estimate');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('RAM lines missing');
  if (!blob.includes(TC_UNMEASURED)) errors.push('must keep the unmeasured grammar-ab/1 label');
  if (!/Vulkan/.test(blob)) errors.push('must name Vulkan');
  if (blob.includes('/constrained-decoding')) errors.push('must not href /constrained-decoding on this branch');
  if (/amdai-stack-lab:(?:\/\/)?[a-z]+\/grammar-ab/.test(blob)) {
    errors.push('must not invent a grammar-ab deep link');
  }
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');

  const ram = tcOffloadRamNeed();
  const q3 = tcQ3RamNeed();
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
  if (!tcDailyRamNeed()) errors.push('daily house RAM missing');

  const fit = tcFitRows();
  if (fit.length !== 4) errors.push('fit table must be Q6/Q5/Q4 + Q3');
  if (fit.some((row) => row.kind === 'q3-estimate' && row.quant !== COMPARE_Q3)) {
    errors.push('Q3 fit row drifted');
  }

  for (const required of REQUIRED_TC_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }

  if (cards.length) {
    const rows = tcMeasuredRows(cards);
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
