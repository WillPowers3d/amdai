/**
 * Cited thinking / reasoning mode on Radeon with llama.cpp.
 * Official sources: llama.cpp server README, official Qwen3.6-35B-A3B card.
 * Thinking-token counts and wall-clock stay not measured on local-desktop.
 * No invented tok/s, prices, or Stack Lab pack ids. llama.cpp Vulkan first.
 */

import { officialLinks } from './site';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';

export const THINK_PATH = '/thinking';
export const THINK_PUBLISHED = '2026-10-14';
export const THINK_CITED_LABEL = 'Cited llama.cpp + Qwen3.6 card · tokens not measured on local-desktop';

export const THINK_TITLE = 'Thinking / reasoning mode on Radeon';
export const THINK_DESCRIPTION =
  'Thinking / reasoning mode on a Radeon GPU with llama.cpp. Cited --reasoning and Qwen3.6 enable_thinking. Tokens not measured on local-desktop.';

export const THINK_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';
export const THINK_PORT = 8080;
export const THINK_RAM_4K = 37.32;
export const THINK_RAM_256K = 42.9;
export const THINK_KIT_GB = 64;

export const LLAMA_SERVER_README = 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md';
export const QWEN36_CARD = officialLinks.qwen36;

export type ThinkLink = { href: string; label: string };

export type ThinkSource = {
  id: string;
  title: string;
  href: string;
  official: boolean;
};

export type ThinkFaq = {
  id: string;
  question: string;
  answer: string;
  links: ThinkLink[];
};

export type ThinkStep = {
  id: string;
  title: string;
  body: string;
  links: ThinkLink[];
};

export const THINK_LEAD = `
  Official Qwen3.6 cards think by default. Hidden thought tokens burn context
  and wall-clock on the same llama-server that already serves the house 35B.
  This AMDai page is the cited llama.cpp toggle: --reasoning, reasoning_effort,
  and chat_template_kwargs.enable_thinking. Thinking-token counts stay not
  measured on local-desktop. llama.cpp Vulkan first. Q6/Q5/Q4 recommended; Q3 is a
  labeled estimate. Q1/Q2 stay off.
`.replace(/\s+/g, ' ').trim();

export const THINK_SOURCES: ThinkSource[] = [
  {
    id: 'llama-server',
    title: 'llama.cpp — llama-server README (--reasoning, --reasoning-effort, chat_template_kwargs)',
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
    title: 'Qwen3.6-35B-A3B official model card (thinks by default; no /think /nothink)',
    href: QWEN36_CARD,
    official: true,
  },
];

export const THINK_OFF = `# Turn thinking off. House 35B, Vulkan llama-server, loopback.
# llama-server README: --reasoning on|off|auto (default auto).
# Request body: reasoning_effort none, and/or chat_template_kwargs {"enable_thinking": false}.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${THINK_HOUSE_FILE} \\
  -ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --jinja \\
  --reasoning off --host 127.0.0.1 --port ${THINK_PORT}`;

export const THINK_ON = `# Leave thinking on (Qwen3.6 card default). --reasoning auto detects the template.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${THINK_HOUSE_FILE} \\
  -ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --jinja \\
  --reasoning auto --host 127.0.0.1 --port ${THINK_PORT}`;

export const THINK_CURL_OFF = `curl -s http://127.0.0.1:${THINK_PORT}/v1/chat/completions \\
  -H 'Content-Type: application/json' \\
  -d '{
    "model": "qwen",
    "messages": [{"role": "user", "content": "Reply with the single word READY and nothing else."}],
    "max_tokens": 32,
    "reasoning_effort": "none",
    "chat_template_kwargs": {"enable_thinking": false}
  }'`;

export const THINK_CURL_ON = `curl -s http://127.0.0.1:${THINK_PORT}/v1/chat/completions \\
  -H 'Content-Type: application/json' \\
  -d '{
    "model": "qwen",
    "messages": [{"role": "user", "content": "Say READY after a short plan."}],
    "max_tokens": 256,
    "chat_template_kwargs": {"enable_thinking": true}
  }'`;

export const THINK_BUDGET = `# llama-server README: --reasoning-budget N
# -1 unrestricted (default). 0 ends thinking immediately. N>0 is a token budget.
# --reasoning-format none | deepseek | deepseek-legacy (default auto).
# --reasoning-preserve is on by default; --no-reasoning-preserve drops history traces.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${THINK_HOUSE_FILE} \\
  -ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --jinja \\
  --reasoning on --reasoning-budget 0 --host 127.0.0.1 --port ${THINK_PORT}`;

export const THINK_STEPS: ThinkStep[] = [
  {
    id: 'tokens-first',
    title: 'Get tokens on loopback before you toggle thinking',
    body: `Ubuntu 24.04+ bare metal is the measured AMDai path. Build llama.cpp Vulkan, load ${THINK_HOUSE_FILE} on one R9700, and confirm curl http://127.0.0.1:${THINK_PORT}/v1/models from /tutorials/serve-qwen. House flags: -ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --jinja --host 127.0.0.1 --port ${THINK_PORT}. llama.cpp first. Q6/Q5/Q4 recommended; Q3 is a labeled estimate. Q1/Q2 stay off.`,
    links: [
      { href: '/setup', label: 'Ubuntu setup' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
    ],
  },
  {
    id: 'default-on',
    title: 'Official Qwen3.6 thinks by default',
    body: 'The official Qwen3.6-35B-A3B card thinks before it answers. Thought blocks come first; the final answer follows. The card does not officially support the Qwen3 soft switch /think or /nothink. Do not type those tags and expect a toggle. llama.cpp --reasoning defaults to auto and follows the template. Flash thinking on Strata is not verified here.',
    links: [
      { href: '/models/qwen36', label: 'Qwen3.6-35B' },
      { href: '/qwen', label: 'Qwen compare' },
      { href: '/flash-daily', label: 'Flash daily' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
  {
    id: 'turn-off',
    title: 'Turn thinking off with cited flags',
    body: 'llama-server README: --reasoning off (or -rea off). Per request, reasoning_effort none disables thinking when the template honors it. The same README documents chat_template_kwargs, for example {"enable_thinking": false} — that is the official Qwen3.6 instruct path. Use one or more; do not invent a third flag. Confirm with a short curl that returns READY without a long thought block.',
    links: [
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/harnesses/connect', label: 'Connect a harness' },
    ],
  },
  {
    id: 'turn-on',
    title: 'Leave it on, or force it on',
    body: 'House default for official instruct is the card default: thinking on. llama-server --reasoning on forces it; --reasoning auto detects the template. Per request, chat_template_kwargs {"enable_thinking": true}. --reasoning-format deepseek fills message.reasoning_content; none leaves thoughts in message.content. Those are README formats, not a measured quality rank.',
    links: [
      { href: '/harnesses', label: 'Harnesses' },
      { href: '/harnesses/hermes', label: 'Hermes' },
      { href: '/setup/open-webui', label: 'Open WebUI' },
      { href: '/setup/coding-assistant', label: 'Coding assistant' },
    ],
  },
  {
    id: 'budget',
    title: 'Budget and preserve — cited, not measured',
    body: 'llama-server README: --reasoning-budget -1 is unrestricted (default), 0 ends thinking immediately, N>0 is a token budget. --reasoning-budget-message injects text when the budget is exhausted. --reasoning-preserve (default on) keeps traces in history when the template supports it; --no-reasoning-preserve does not. The official Qwen3.6 card documents preserve_thinking the same way. AMDai has not measured a budget tok/s or a preserve RAM delta.',
    links: [
      { href: '/long-context', label: 'Long context' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/amdai-bench', label: 'amdai-bench' },
    ],
  },
  {
    id: 'ram',
    title: 'Both RAM lines — thinking eats context, not a new kit',
    body: `Where context and offload appear, AMDai prints ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL}. Overnight UD-Q5 one-GPU peaks are ${THINK_RAM_4K} GB at 4K and ${THINK_RAM_256K} GB at 256K — measured llama-bench on local-desktop, Linux GB. Round ${RAM_MIN_LABEL} to a ${THINK_KIT_GB} GB kit for this file on one R9700. Thinking tokens consume the same context window; we do not invent a thinking-token count or a second RAM number. Q3 stays a labeled estimate.`,
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/long-context', label: 'Long context' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
    ],
  },
  {
    id: 'never-ends',
    title: 'When thinking never ends',
    body: 'Stay on official instruct. Fix --jinja before you change the GGUF. --reasoning off or reasoning_effort none is the cited stop. --reasoning-budget 0 ends the thought block immediately. llama-server also documents reasoning_control plus POST /v1/chat/completions/control with action reasoning_end — unofficial to treat as a harness button until you have tried the flags. Do not grab an abliterated file to “fix” a template. Start from /troubleshoot.',
    links: [
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/abliterated', label: 'Abliterated' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    id: 'measure',
    title: 'Measure on your box — do not copy a screenshot',
    body: 'Thinking-token counts and wall-clock stay not measured on local-desktop. Overnight 35B numbers are llama-bench decode, not a thinking A/B. Use amdai-bench and the Stack Lab planner on Ubuntu — packages are not published yet and there is no public download. Do not invent a Stack Lab pack id. Q3 is a labeled estimate.',
    links: [
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/methodology', label: 'How we test' },
    ],
  },
];

export const THINK_HOWTO_STEPS = THINK_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const THINK_FAQ: ThinkFaq[] = [
  {
    id: 'turn-off',
    question: 'How do I turn thinking / reasoning mode off on llama.cpp?',
    answer:
      'Cited path: llama-server --reasoning off, and/or reasoning_effort none, and/or chat_template_kwargs {"enable_thinking": false}. Official Qwen3.6 card thinks by default and does not support /think or /nothink. Thinking-token counts and wall-clock stay not measured on local-desktop. Q3 is a labeled estimate. llama.cpp first.',
    links: [
      { href: '/thinking', label: 'Thinking mode' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
    ],
  },
  {
    id: 'default',
    question: 'Does the house 35B think by default?',
    answer:
      'Yes. The official Qwen3.6-35B-A3B card thinks before it answers. llama.cpp --reasoning defaults to auto. Leave it on for hard prompts; turn it off for short chat. We do not invent a thinking tok/s.',
    links: [
      { href: '/models/qwen36', label: 'Qwen3.6-35B' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/gpus/r9700', label: 'R9700' },
    ],
  },
  {
    id: 'ram',
    question: 'Does thinking need more system RAM?',
    answer: `${RAM_MIN_LABEL} on one R9700 with the house UD-Q5 is a ${THINK_KIT_GB} GB kit from the measured ${THINK_RAM_4K} GB peak at 4K. ${RAM_FULL_LABEL} uses the measured ${THINK_RAM_256K} GB peak at 256K. Thinking tokens consume context inside that window — not a second kit. Those are llama-bench cards, not a thinking measurement. Q3 is a labeled estimate.`,
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/long-context', label: 'Long context' },
    ],
  },
];

export const THINK_HUB_LINKS: ThinkLink[] = [
  { href: '/setup', label: 'Ubuntu setup (measured)' },
  { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
  { href: '/tuning', label: 'Speed up llama.cpp' },
  { href: '/moe', label: 'MoE on Radeon' },
  { href: '/long-context', label: 'Long context' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/harnesses', label: 'Harnesses' },
  { href: '/prompt-cache', label: 'Prompt cache' },
  { href: '/sampling', label: 'Sampling' },
  { href: '/models/qwen36', label: 'Qwen3.6-35B' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/amdai-bench', label: 'amdai-bench' },
  { href: '/stack-lab', label: 'Stack Lab' },
  { href: '/start', label: 'Getting started' },
];

export const REQUIRED_THINK_HREFS = [
  '/setup',
  '/tutorials/serve-qwen',
  '/tuning',
  '/backends/llamacpp',
  '/gpus/r9700',
  '/models/qwen36',
  '/long-context',
  '/calculator',
  '/harnesses',
  '/prompt-cache',
  '/sampling',
  '/stack-lab',
  '/amdai-bench',
  '/benchmarks',
  '/troubleshoot',
  '/faq',
] as const;

export function thinkBlob(): string {
  return [
    THINK_TITLE,
    THINK_DESCRIPTION,
    THINK_LEAD,
    THINK_CITED_LABEL,
    THINK_OFF,
    THINK_ON,
    THINK_CURL_OFF,
    THINK_CURL_ON,
    THINK_BUDGET,
    ...THINK_STEPS.map((row) => `${row.title} ${row.body}`),
    ...THINK_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...THINK_SOURCES.map((row) => `${row.title} ${row.official ? 'official' : 'unofficial'}`),
  ].join('\n');
}

export function thinkHrefs(): string[] {
  const links = [
    ...THINK_HUB_LINKS,
    ...THINK_STEPS.flatMap((step) => step.links),
    ...THINK_FAQ.flatMap((row) => row.links),
    ...THINK_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertThinkValid(): string[] {
  const errors: string[] = [];
  const blob = thinkBlob();
  if (THINK_PATH !== '/thinking') errors.push('path');
  if (THINK_PUBLISHED !== '2026-10-14') errors.push('published');
  if (THINK_TITLE.length < 8) errors.push('title short');
  if (THINK_DESCRIPTION.length < 70 || THINK_DESCRIPTION.length > 160) {
    errors.push(`description length ${THINK_DESCRIPTION.length}`);
  }
  if (!/AMDai/.test(blob)) errors.push('must say AMDai');
  if (!/llama\.cpp/.test(blob)) errors.push('must say llama.cpp');
  if (!/Vulkan/.test(blob)) errors.push('must say Vulkan');
  if (!/--reasoning/.test(blob)) errors.push('must cite --reasoning');
  if (!/enable_thinking/.test(blob)) errors.push('must cite enable_thinking');
  if (!/reasoning_effort/.test(blob)) errors.push('must cite reasoning_effort');
  if (!/\/think/.test(blob) || !/nothink/.test(blob)) errors.push('must cite missing /think /nothink');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('both RAM lines');
  if (!blob.includes(THINK_HOUSE_FILE)) errors.push('house file');
  if (!/262144/.test(blob)) errors.push('house context');
  if (!/Q3 is a labeled estimate/.test(blob) && !/Q3 stays a labeled estimate/.test(blob)) {
    errors.push('q3 labeled');
  }
  if (!/not measured/.test(blob)) errors.push('must say not measured');
  if (BANNED.test(blob)) errors.push('banned model name');
  if (Q1Q2.test(blob)) errors.push('q1/q2 visible');
  if (Q4_FLOOR.test(blob)) errors.push('q4-floor wording');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\/guides\/tool-calling|\/setup\/server|\/speculative-decoding|\/rocm\/upgrade|\/gpus\/ryzen-igpu/.test(blob)) {
    errors.push('href not on this branch');
  }
  const hrefs = thinkHrefs();
  for (const required of REQUIRED_THINK_HREFS) {
    if (!hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}
