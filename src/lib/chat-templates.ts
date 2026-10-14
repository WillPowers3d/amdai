/**
 * Cited llama.cpp chat templates / --jinja on Radeon.
 * Official llama-server README (checked 2026-10-14): --jinja default enabled,
 * --chat-template / --chat-template-file (default: model metadata),
 * --chat-template-kwargs, --reasoning-format, --skip-chat-parsing,
 * GET /props chat_template, POST /apply-template.
 * GGUF key tokenizer.chat_template is the gguf-py tokenizer chat-template constant.
 * House llama-server records --jinja and does not record a template override.
 * No invented tok/s. llama.cpp Vulkan first.
 */

import { officialLinks } from './site';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { COMPARE_Q3, COMPARE_Q3_CITE, q3RamNeed } from './local-desktop-compare';

export const CT_PATH = '/chat-templates';
export const CT_PUBLISHED = '2026-10-14';
export const CT_CHECKED = '2026-10-14';
export const CT_CITED_LABEL =
  'Cited llama.cpp --jinja · GGUF tokenizer.chat_template · house recipes pass --jinja';
export const CT_UNMEASURED = 'not yet measured';

export const CT_TITLE = 'Chat templates on Radeon';
export const CT_H1 = 'Chat templates and --jinja on a Radeon GPU with llama.cpp';
export const CT_DESCRIPTION =
  'Chat templates and --jinja on a Radeon GPU with llama.cpp. Cited GGUF tokenizer.chat_template. House recipes pass --jinja. Q3 is a labeled estimate.';

export const CT_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';
export const CT_FLASH_FILE = 'Qwen3.8-Flash-Next-UD-Q6_K_XL.gguf';
export const CT_PORT = 8080;
export const CT_RAM_4K = 37.32;
export const CT_RAM_256K = 42.9;
export const CT_KIT_GB = 64;
export const CT_HOUSE_SERVER_FLAGS =
  '-ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --jinja --host 127.0.0.1 --port 8080';

export const LLAMA_PIN = '23deec025587a58469bdf0120313ff88a1ddcc7b';
export const LLAMA_PIN_SHORT = '23deec0';
export const LLAMA_SERVER_README =
  `https://github.com/ggml-org/llama.cpp/blob/${LLAMA_PIN}/tools/server/README.md`;
export const LLAMA_FN =
  `https://github.com/ggml-org/llama.cpp/blob/${LLAMA_PIN}/docs/function-calling.md`;
export const LLAMA_GGUF_KEYS =
  `https://github.com/ggml-org/llama.cpp/blob/${LLAMA_PIN}/gguf-py/gguf/constants.py`;
export const CT_Q3_RAM = q3RamNeed(1);

export type CtLink = { href: string; label: string };
export type CtSource = { id: string; title: string; href: string; official: boolean };
export type CtFaq = { id: string; question: string; answer: string; links: CtLink[] };
export type CtStep = { id: string; title: string; body: string; links: CtLink[] };
export type CtFlag = { id: string; flag: string; meaning: string; cite: string };
export type CtSymptom = { id: string; symptom: string; fix: string; cite: string; href: string; label: string };
export type CtModelRow = {
  id: string;
  model: string;
  href: string;
  note: string;
  card: boolean;
};
export type CtQuantRow = {
  quant: string;
  file: string;
  template: string;
  ramMin: string;
  ramFull: string;
  note: string;
  estimate: boolean;
};

export const CT_LEAD = `
  A wrong or missing chat template is a top cause of garbled output, the
  model talking to itself, leaked think tags, and tool calls that never
  fire — and people blame their Radeon or the quant. This AMDai page is
  the cited llama.cpp toggle. Shoppers search
  llama.cpp --jinja, chat template wrong llama-server, --chat-template-file,
  and GGUF chat template.   Official llama-server (checked ${CT_CHECKED}, pin ${LLAMA_PIN_SHORT})
  takes the Jinja string from the GGUF metadata unless you override it.
  The GGUF key is tokenizer.chat_template (gguf-py tokenizer chat-template constant).
  --jinja is on by default; house llama-server still passes --jinja.
  House recipes do not record --chat-template or --chat-template-file.
  Template “speed” stays ${CT_UNMEASURED}. ${COMPARE_Q3} is a labeled
  estimate (${COMPARE_Q3_CITE}) — do not download Q3 to run. Q1/Q2 stay
  off. House recipes stay Q4 and up.
`.replace(/\s+/g, ' ').trim();

export const CT_WHAT = `
  A chat template is the Jinja string that wraps roles, tools, and
  reasoning before the model sees tokens. Official llama-server README:
  --chat-template and --chat-template-file default to the template taken
  from the model’s metadata. gguf-py constants.py names that key
  tokenizer.chat_template (plus tokenizer.chat_templates and
  tokenizer.chat_template.{name}). GET /props returns chat_template and
  chat_template_caps. POST /apply-template formats messages the same way
  /v1/chat/completions does, without running inference — then you can
  send the string to raw /completion. Raw /completion does not apply the
  chat template for you.
`.replace(/\s+/g, ' ').trim();

export const CT_PICK = `
  Official --jinja / --no-jinja turns the Jinja engine on (default
  enabled; env LLAMA_ARG_JINJA). function-calling.md requires --jinja
  for OpenAI-style tools. --chat-template names a built-in (chatml,
  llama3, gemma, gpt-oss, …) and is only a short list unless --jinja
  is set first. --chat-template-file loads a Jinja file. Both override
  the GGUF metadata. --chat-template-kwargs is a JSON object string
  (env LLAMA_ARG_CHAT_TEMPLATE_KWARGS), for example
  {"enable_thinking": false}. --reasoning-format none | deepseek |
  deepseek-legacy (default auto) controls whether thought tags stay in
  message.content or move to reasoning_content. --skip-chat-parsing
  dumps reasoning and tool markup into content. Do not invent a house
  --chat-template-file path.
`.replace(/\s+/g, ' ').trim();

export const CT_HARNESS = `
  Hermes (amdai’s harness), Open WebUI, and coding tools talk to
  /v1/chat/completions. That path applies the server template. A client
  that posts a raw string to /completion must wrap roles itself — or call
  POST /apply-template first. House /v1 is http://127.0.0.1:${CT_PORT}/v1
  with model id qwen. Strata tool / template behavior is not verified
  here — see /backends. Do not invent a harness success rate.
`.replace(/\s+/g, ' ').trim();

export const CT_RAM = `
  ${RAM_MIN_LABEL} on one R9700 with the house UD-Q5 is a ${CT_KIT_GB} GB
  kit from the measured ${CT_RAM_4K} GB peak at 4K. ${RAM_FULL_LABEL}
  uses the measured ${CT_RAM_256K} GB peak at 256K. Those are llama-bench
  cards, not a template A/B. A chat template does not shrink the GGUF.
  ${COMPARE_Q3} is a labeled estimate. Do not download Q3 to run.
`.replace(/\s+/g, ' ').trim();

export const CT_HOUSE = `# House daily driver as recorded. --jinja is on the pin.
# llama-server README (checked ${CT_CHECKED}): --jinja default enabled.
# No --chat-template / --chat-template-file override is recorded.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${CT_HOUSE_FILE} \\
  ${CT_HOUSE_SERVER_FLAGS}`;

export const CT_PROPS = `# Inspect the live template. Official GET /props (server README).
curl -s http://127.0.0.1:${CT_PORT}/props | python3 -c "import json,sys; p=json.load(sys.stdin); print(p.get('chat_template','')[:400])"`;

export const CT_APPLY = `# Official POST /apply-template — format only, no inference.
# Then /completion can take the returned prompt string.
curl -s http://127.0.0.1:${CT_PORT}/apply-template \\
  -H 'Content-Type: application/json' \\
  -d '{"messages":[{"role":"system","content":"You are concise."},{"role":"user","content":"Say READY"}]}'`;

export const CT_KWARGS = `# Official --chat-template-kwargs (server README). Not a house pin.
# Qwen3.6-35B card: chat_template_kwargs {"enable_thinking": false}.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${CT_HOUSE_FILE} \\
  -ngl 99 -c 262144 --jinja \\
  --chat-template-kwargs '{"enable_thinking": false}' \\
  --cache-type-k f16 --cache-type-v f16 \\
  --host 127.0.0.1 --port ${CT_PORT}`;

export const CT_FLAGS: CtFlag[] = [
  {
    id: 'jinja',
    flag: '--jinja / --no-jinja',
    meaning:
      'Use the Jinja chat-template engine. Official default enabled (env LLAMA_ARG_JINJA). House pin still passes --jinja. function-calling.md requires it for OpenAI-style tools.',
    cite: `llama.cpp server README — --jinja (checked ${CT_CHECKED}); function-calling.md`,
  },
  {
    id: 'chat-template',
    flag: '--chat-template JINJA_TEMPLATE',
    meaning:
      'Override the GGUF metadata with a built-in name (chatml, llama3, gemma, gpt-oss, …). Default: template taken from the model metadata. Short list unless --jinja is set first. env LLAMA_ARG_CHAT_TEMPLATE.',
    cite: `llama.cpp server README — --chat-template (checked ${CT_CHECKED})`,
  },
  {
    id: 'chat-template-file',
    flag: '--chat-template-file JINJA_TEMPLATE_FILE',
    meaning:
      'Load a Jinja file instead of the GGUF metadata. Same default and built-in list as --chat-template. env LLAMA_ARG_CHAT_TEMPLATE_FILE. Do not invent a house file path.',
    cite: `llama.cpp server README — --chat-template-file (checked ${CT_CHECKED})`,
  },
  {
    id: 'kwargs',
    flag: '--chat-template-kwargs STRING',
    meaning:
      'JSON object string for the template parser, e.g. {"enable_thinking": false}. env LLAMA_ARG_CHAT_TEMPLATE_KWARGS. Same field on /v1/chat/completions.',
    cite: `llama.cpp server README — --chat-template-kwargs, chat_template_kwargs (checked ${CT_CHECKED})`,
  },
  {
    id: 'reasoning-format',
    flag: '--reasoning-format FORMAT',
    meaning:
      'none leaves thoughts in message.content. deepseek fills reasoning_content. deepseek-legacy keeps tags in content and also fills reasoning_content. Default auto. env LLAMA_ARG_THINK.',
    cite: `llama.cpp server README — --reasoning-format (checked ${CT_CHECKED})`,
  },
  {
    id: 'skip-parse',
    flag: '--skip-chat-parsing',
    meaning:
      'Force a pure content parser. Reasoning and tool markup stay in message.content. Default disabled.',
    cite: `llama.cpp server README — --skip-chat-parsing (checked ${CT_CHECKED})`,
  },
];

export const CT_SYMPTOMS: CtSymptom[] = [
  {
    id: 'garbled',
    symptom: 'Garbled or repeated turns; the model talks to itself',
    fix: 'Confirm --jinja. GET /props and read chat_template. Stay on the GGUF metadata unless the log says Chat format: Generic and tools or roles are wrong. --chat-template chatml is the documented YMMV fallback, not a house pin.',
    cite: 'llama.cpp server README — --jinja, GET /props; function-calling.md — chatml YMMV',
    href: '/troubleshoot/errors',
    label: 'Error paste',
  },
  {
    id: 'as-user',
    symptom: 'The model answers as the user',
    fix: 'The template is not wrapping roles. Compare POST /apply-template output to an official instruct turn. Do not send a raw /completion string that omits the assistant prefix.',
    cite: 'llama.cpp server README — POST /apply-template vs POST /completion',
    href: '/harnesses',
    label: 'Harnesses',
  },
  {
    id: 'think-leak',
    symptom: 'Leaked think tags in the visible reply',
    fix: 'Official --reasoning-format deepseek moves thoughts to reasoning_content. none leaves them in content. --skip-chat-parsing dumps markup into content. Qwen3.6 thinks by default — use enable_thinking false or --reasoning off. Shopper page: /thinking.',
    cite: 'llama.cpp server README — --reasoning-format; Qwen3.6-35B card — enable_thinking',
    href: '/thinking',
    label: 'Thinking mode',
  },
  {
    id: 'tools-ignored',
    symptom: 'Tool calls never fire',
    fix: 'Start llama-server with --jinja and send tools on /v1/chat/completions. Inspect /props for a tools-aware template. function-calling.md: unrecognized templates log Chat format: Generic. Do not invent a --chat-template-file for the house 35B. Shopper page: /guides/tool-calling.',
    cite: 'llama.cpp function-calling.md — --jinja, Chat format: Generic',
    href: '/guides/tool-calling',
    label: 'Tool calling',
  },
  {
    id: 'system-ignored',
    symptom: 'The system prompt is ignored',
    fix: 'Some templates drop or flatten the system role. Read GET /props chat_template for a system branch. Hermes and Open WebUI send system on /v1/chat/completions — raw /completion will not inject it.',
    cite: 'llama.cpp server README — GET /props chat_template; /v1/chat/completions vs /completion',
    href: '/setup/open-webui',
    label: 'Open WebUI',
  },
];

export const CT_MODELS: CtModelRow[] = [
  {
    id: 'qwen36',
    model: 'Qwen3.6-35B-A3B (house UD-Q5_K_XL)',
    href: '/models/qwen36',
    card: true,
    note: 'Official card thinks by default. chat_template_kwargs.enable_thinking and preserve_thinking. No /think or /nothink. House llama-server passes --jinja and does not record a template override.',
  },
  {
    id: 'flash',
    model: 'Qwen 3.8 Flash (house UD-Q6_K_XL)',
    href: '/models/flash',
    card: true,
    note: 'Official Flash card documents enable_thinking (on by default), preserve_thinking, and reasoning_effort via chat_template_kwargs. House Flash recipes do not record a --chat-template pin.',
  },
  {
    id: 'qwen36-27b',
    model: 'Qwen3.6-27B',
    href: '/models/qwen36-27b',
    card: false,
    note: 'On the site. This page does not copy a template string from that card. Do not invent one. Start from GGUF metadata and GET /props.',
  },
  {
    id: 'qwen38-27b',
    model: 'Qwen3.8-27B',
    href: '/models/qwen38-27b',
    card: false,
    note: 'On the site. This page does not copy a template string from that card. Do not invent one.',
  },
  {
    id: 'gpt-oss',
    model: 'gpt-oss 20B',
    href: '/models/gpt-oss-20b',
    card: false,
    note: 'function-calling.md lists Harmony as a native handler. Built-in --chat-template gpt-oss exists. The official openai card is not quoted here for a Jinja string.',
  },
  {
    id: 'llama33',
    model: 'Llama 3.3 70B',
    href: '/models/llama33-70b',
    card: false,
    note: 'function-calling.md lists Llama 3.x as native. Built-in --chat-template llama3 exists. The official Meta card is not quoted here for a Jinja string.',
  },
  {
    id: 'gemma3',
    model: 'Gemma 3 27B',
    href: '/models/gemma3-27b',
    card: false,
    note: 'Built-in --chat-template gemma exists. function-calling.md does not name Gemma 3 27B on the native-handler table. Do not invent a file.',
  },
  {
    id: 'glm',
    model: 'GLM 5.3 Flash',
    href: '/models/glm-53-flash',
    card: false,
    note: 'function-calling.md does not name GLM 5.3 Flash on the native-handler table. Built-in list has chatglm3 / chatglm4, not this card. Do not invent a mapping.',
  },
];

export const CT_QUANTS: CtQuantRow[] = [
  {
    quant: 'Q6_K',
    file: 'Qwen3.6-35B-A3B-Q6_K.gguf',
    template: CT_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: peak system RAM not recorded on a template card`,
    ramFull: `${RAM_FULL_LABEL}: peak system RAM not recorded on a template card`,
    note: 'A template does not change the GGUF. Recommended. Template quality stays not yet measured.',
    estimate: false,
  },
  {
    quant: 'UD-Q5_K_XL',
    file: CT_HOUSE_FILE,
    template: CT_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: ${CT_KIT_GB} GB kit from the measured ${CT_RAM_4K} GB peak at 4K (llama-bench, not a template A/B)`,
    ramFull: `${RAM_FULL_LABEL}: measured ${CT_RAM_256K} GB peak at 256K.`,
    note: 'House file. --jinja is on the recorded llama-server line. No --chat-template override.',
    estimate: false,
  },
  {
    quant: 'Q4_K_M',
    file: 'Qwen3.6-35B-A3B-Q4_K_M.gguf',
    template: CT_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: peak system RAM not recorded on a template card`,
    ramFull: `${RAM_FULL_LABEL}: peak system RAM not recorded on a template card`,
    note: 'Recommended floor for house recipes. A smaller quant does not fix a wrong template.',
    estimate: false,
  },
  {
    quant: COMPARE_Q3,
    file: 'Qwen3.6-35B-A3B-UD-Q3_K_XL.gguf',
    template: CT_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: ${CT_Q3_RAM.atSelected.kitGb} GB kit (labeled estimate)`,
    ramFull: `${RAM_FULL_LABEL}: ${CT_Q3_RAM.atFullContext.kitGb} GB kit (labeled estimate)`,
    note: `Labeled estimate (${COMPARE_Q3_CITE}). Do not download Q3 to run. Q3 does not buy a template.`,
    estimate: true,
  },
];

export const CT_STEPS: CtStep[] = [
  {
    id: 'house-pin',
    title: 'Keep the house --jinja pin — do not invent a file',
    body: `Vulkan llama-server, ${CT_HOUSE_FILE}, ${CT_HOUSE_SERVER_FLAGS}. Official --jinja default is enabled. House recipes do not record --chat-template or --chat-template-file. House recipes stay Q4 and up. ${COMPARE_Q3} is a labeled estimate — do not download it to run.`,
    links: [
      { href: '/setup/server', label: 'Always-on server' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/models/qwen36', label: 'Qwen3.6-35B' },
    ],
  },
  {
    id: 'inspect',
    title: 'Inspect GET /props before you override',
    body: 'Official GET /props returns chat_template and chat_template_caps. POST /apply-template shows the wrapped prompt. Read the server log for Chat format. A missing or Generic template is the usual garbled-turn cause — not the Radeon.',
    links: [
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/troubleshoot/errors', label: 'Error paste' },
      { href: '/glossary#chat-template', label: 'Glossary · chat template' },
    ],
  },
  {
    id: 'harness',
    title: 'Use /v1 chat completions from the harness',
    body: 'Hermes, Open WebUI, and coding tools should hit /v1/chat/completions so the server applies the template. Raw /completion will not. function-calling.md needs --jinja plus a tools array for tool_calls. Thinking leaks are /thinking. Sampler loops are /sampling.',
    links: [
      { href: '/harnesses', label: 'Harnesses' },
      { href: '/harnesses/hermes', label: 'Hermes' },
      { href: '/guides/tool-calling', label: 'Tool calling' },
      { href: '/setup/coding-assistant', label: 'Coding assistant' },
    ],
  },
  {
    id: 'qwen-kwargs',
    title: 'Copy Qwen kwargs only from the official card',
    body: 'Qwen3.6-35B and Qwen 3.8 Flash cards document chat_template_kwargs.enable_thinking and preserve_thinking. Flash also documents reasoning_effort. Those are card fields, not a local-desktop pin. Other /models pages are not quoted for a Jinja string on this page.',
    links: [
      { href: '/thinking', label: 'Thinking mode' },
      { href: '/qwen', label: 'Qwen compare' },
      { href: '/models/flash', label: 'Qwen 3.8 Flash' },
    ],
  },
  {
    id: 'not-quant',
    title: 'Do not swap the quant to fix a template',
    body: 'Stay on official instruct. Pass --jinja. Compare official GGUF metadata before any abliterated file. The /troubleshoot/errors jinja-template row is this symptom. A Q3 download does not wrap roles.',
    links: [
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/abliterated', label: 'Abliterated' },
      { href: '/rocm-problems', label: 'ROCm problems' },
    ],
  },
];

export const CT_HOWTO_STEPS = CT_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const CT_FAQ: CtFaq[] = [
  {
    id: 'what-is-template',
    question: 'What is a llama.cpp chat template, and where does it live?',
    answer:
      'The Jinja string that wraps messages, tools, and reasoning. Official default is the GGUF metadata key tokenizer.chat_template (gguf-py tokenizer chat-template constant). llama-server README (checked 2026-10-14): --chat-template / --chat-template-file override that metadata. Inspect GET /props. House recipes pass --jinja and do not record an override. Q3 is a labeled estimate. llama.cpp first.',
    links: [
      { href: '/chat-templates', label: 'Chat templates' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/glossary#chat-template', label: 'Glossary · chat template' },
    ],
  },
  {
    id: 'need-jinja',
    question: 'Do I need --jinja on llama-server?',
    answer:
      'Official default is enabled. House daily driver still passes --jinja so a rebuilt binary cannot silently drop it. function-calling.md requires --jinja for OpenAI-style tools. --no-jinja is the cited off switch. Template speed stays not yet measured.',
    links: [
      { href: '/guides/tool-calling', label: 'Tool calling' },
      { href: '/setup/server', label: 'Always-on server' },
      { href: '/thinking', label: 'Thinking mode' },
    ],
  },
  {
    id: 'wrong-template',
    question: 'Why does the model talk to itself or leak think tags?',
    answer:
      'Usually a wrong or missing template, not the GPU. Confirm --jinja, GET /props, and POST /apply-template. Leaked thoughts are --reasoning-format / enable_thinking — see /thinking. Tools ignored are /guides/tool-calling. Start from /troubleshoot/errors (jinja-template). Q3 is a labeled estimate.',
    links: [
      { href: '/thinking', label: 'Thinking mode' },
      { href: '/guides/tool-calling', label: 'Tool calling' },
      { href: '/troubleshoot/errors', label: 'Error paste' },
    ],
  },
];

export const CT_SOURCES: CtSource[] = [
  {
    id: 'llama-server',
    title:
      `llama.cpp ${LLAMA_PIN_SHORT} — llama-server README (--jinja, --chat-template, --chat-template-file, --chat-template-kwargs, --reasoning-format, GET /props, POST /apply-template)`,
    href: LLAMA_SERVER_README,
    official: true,
  },
  {
    id: 'llama-fn',
    title: `llama.cpp ${LLAMA_PIN_SHORT} — function-calling.md (--jinja, Chat format: Generic, chatml YMMV)`,
    href: LLAMA_FN,
    official: true,
  },
  {
    id: 'gguf-keys',
    title: `llama.cpp ${LLAMA_PIN_SHORT} — gguf-py constants.py (tokenizer.chat_template)`,
    href: LLAMA_GGUF_KEYS,
    official: true,
  },
  {
    id: 'qwen36',
    title: 'Qwen3.6-35B-A3B official model card (enable_thinking, preserve_thinking)',
    href: officialLinks.qwen36,
    official: true,
  },
  {
    id: 'flash',
    title: 'Qwen3.8-Flash-Next official model card (enable_thinking, preserve_thinking, reasoning_effort)',
    href: officialLinks.qwenFlash,
    official: true,
  },
];

export const CT_HUB_LINKS: CtLink[] = [
  { href: '/thinking', label: 'Thinking mode' },
  { href: '/guides/tool-calling', label: 'Tool calling' },
  { href: '/sampling', label: 'Sampling' },
  { href: '/constrained-decoding', label: 'Constrained decoding' },
  { href: '/harnesses', label: 'Harnesses' },
  { href: '/harnesses/hermes', label: 'Hermes' },
  { href: '/setup/open-webui', label: 'Open WebUI' },
  { href: '/setup/coding-assistant', label: 'Coding assistant' },
  { href: '/backends', label: 'Backends' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/qwen', label: 'Qwen compare' },
  { href: '/models/qwen36', label: 'Qwen3.6-35B' },
  { href: '/troubleshoot', label: 'Troubleshoot' },
  { href: '/rocm-problems', label: 'ROCm problems' },
];

export const REQUIRED_CT_HREFS = [
  '/thinking',
  '/guides/tool-calling',
  '/sampling',
  '/constrained-decoding',
  '/harnesses',
  '/harnesses/hermes',
  '/setup/open-webui',
  '/setup/coding-assistant',
  '/backends',
  '/backends/llamacpp',
  '/qwen',
  '/models/qwen36',
  '/models/flash',
  '/models/gpt-oss-20b',
  '/models/gemma3-27b',
  '/models/llama33-70b',
  '/models/glm-53-flash',
  '/models/qwen36-27b',
  '/models/qwen38-27b',
  '/troubleshoot',
  '/troubleshoot/errors',
  '/setup/server',
  '/tutorials/serve-qwen',
  '/abliterated',
  '/rocm-problems',
] as const;

export function ctBlob(): string {
  return [
    CT_TITLE,
    CT_H1,
    CT_DESCRIPTION,
    CT_LEAD,
    CT_WHAT,
    CT_PICK,
    CT_HARNESS,
    CT_CITED_LABEL,
    CT_RAM,
    CT_HOUSE,
    CT_PROPS,
    CT_APPLY,
    CT_KWARGS,
    ...CT_STEPS.map((row) => `${row.title} ${row.body}`),
    ...CT_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...CT_FLAGS.map((row) => `${row.flag} ${row.meaning} ${row.cite}`),
    ...CT_SYMPTOMS.map((row) => `${row.symptom} ${row.fix} ${row.cite}`),
    ...CT_MODELS.map((row) => `${row.model} ${row.note}`),
    ...CT_QUANTS.map((row) => `${row.quant} ${row.file} ${row.template} ${row.ramMin} ${row.ramFull} ${row.note}`),
    ...CT_SOURCES.map((row) => `${row.title} ${row.official ? 'official' : 'unofficial'}`),
    `${RAM_MIN_LABEL} ${RAM_FULL_LABEL}`,
  ].join('\n');
}

export function ctHrefs(): string[] {
  const links = [
    ...CT_HUB_LINKS,
    ...CT_STEPS.flatMap((step) => step.links),
    ...CT_FAQ.flatMap((row) => row.links),
    ...CT_SYMPTOMS.map((row) => ({ href: row.href, label: row.label })),
    ...CT_MODELS.map((row) => ({ href: row.href, label: row.model })),
    ...CT_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertCtValid(): string[] {
  const errors: string[] = [];
  const blob = ctBlob();
  if (CT_PATH !== '/chat-templates') errors.push('path');
  if (CT_PUBLISHED !== '2026-10-14') errors.push('published');
  if (CT_TITLE.length < 8) errors.push('title short');
  if (CT_DESCRIPTION.length < 70 || CT_DESCRIPTION.length > 160) {
    errors.push(`description length ${CT_DESCRIPTION.length}`);
  }
  if (!/AMDai/.test(blob)) errors.push('must say AMDai');
  if (!/llama\.cpp/.test(blob)) errors.push('must say llama.cpp');
  if (!/Vulkan/.test(blob)) errors.push('must say Vulkan');
  if (!blob.includes(LLAMA_PIN) && !blob.includes(LLAMA_PIN_SHORT)) {
    errors.push('must pin llama.cpp commit');
  }
  if (!/--jinja/.test(blob)) errors.push('must cite --jinja');
  if (!/--chat-template/.test(blob)) errors.push('must cite --chat-template');
  if (!/--chat-template-file/.test(blob)) errors.push('must cite --chat-template-file');
  if (!/--chat-template-kwargs/.test(blob)) errors.push('must cite --chat-template-kwargs');
  if (!/--reasoning-format/.test(blob)) errors.push('must cite --reasoning-format');
  if (!/tokenizer\.chat_template/.test(blob)) errors.push('must cite tokenizer.chat_template');
  if (!/GET \/props/.test(blob)) errors.push('must cite GET /props');
  if (!/\/apply-template/.test(blob)) errors.push('must cite /apply-template');
  if (!blob.includes(CT_UNMEASURED)) errors.push('must keep unmeasured label');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('both RAM lines');
  if (!blob.includes(CT_HOUSE_FILE)) errors.push('house file');
  if (!blob.includes(CT_HOUSE_SERVER_FLAGS)) errors.push('house server flags');
  if (!/--jinja/.test(CT_HOUSE)) errors.push('house must pass --jinja');
  const houseFlags = CT_HOUSE.split('\n').filter((line) => !line.startsWith('#')).join('\n');
  if (/--chat-template-file/.test(houseFlags)) errors.push('must not invent a house template file');
  if (!blob.includes(COMPARE_Q3)) errors.push('q3 row');
  if (!/labeled estimate/.test(blob)) errors.push('q3 labeled');
  if (!/do not download Q3/.test(blob)) errors.push('must not recommend Q3');
  if (!/Q4 and up/.test(blob)) errors.push('must say Q4 and up');
  if (BANNED.test(blob)) errors.push('banned model name');
  if (Q1Q2.test(blob)) errors.push('q1/q2 visible');
  if (Q4_FLOOR.test(blob)) errors.push('q4-floor wording');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (!CT_QUANTS.some((row) => row.estimate && row.quant === COMPARE_Q3)) {
    errors.push('q3 estimate row');
  }
  if (CT_QUANTS.some((row) => row.template !== CT_UNMEASURED)) {
    errors.push('must not invent a template quality cell');
  }
  const hrefs = ctHrefs();
  for (const required of REQUIRED_CT_HREFS) {
    const path = required.split('#')[0] ?? required;
    if (!hrefs.includes(path) && !hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}
