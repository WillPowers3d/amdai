/**
 * Cited llama.cpp sampling settings on Radeon.
 * Official llama-server README Sampling params + /completion fields;
 * /v1/chat/completions defers to OpenAI Chat Completions plus /completion extras.
 * House llama-server does not record a sampler pin. Sampler speed stays not measured.
 * Per-model values come only from official cards. No invented tok/s. llama.cpp Vulkan first.
 */

import { officialLinks } from './site';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { COMPARE_Q3, COMPARE_Q3_CITE, q3RamNeed } from './local-desktop-compare';

export const SAM_PATH = '/sampling';
export const SAM_PUBLISHED = '2026-10-14';
export const SAM_CITED_LABEL =
  'Cited llama.cpp --temp / --top-p / --min-p · sampler speed not measured';
export const SAM_UNMEASURED = 'not measured yet';

export const SAM_TITLE = 'Sampling settings on Radeon';
export const SAM_H1 =
  'Sampling settings for local LLMs on a Radeon GPU with llama.cpp: temperature, top-p, top-k, min-p and penalties';
export const SAM_DESCRIPTION =
  'Sampling settings on a Radeon GPU with llama.cpp. Cited --temp, --top-p, --min-p. House recipes do not pin samplers. Q3 is a labeled estimate.';

export const SAM_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';
export const SAM_FLASH_FILE = 'Qwen3.8-Flash-Next-UD-Q6_K_XL.gguf';
export const SAM_PORT = 8080;
export const SAM_RAM_4K = 37.32;
export const SAM_RAM_256K = 42.9;
export const SAM_KIT_GB = 64;
export const SAM_HOUSE_SERVER_FLAGS =
  '-ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --jinja --host 127.0.0.1 --port 8080';

export const LLAMA_SERVER_README = 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md';
export const LLAMA_COMMON_H = 'https://github.com/ggml-org/llama.cpp/blob/master/common/common.h';
export const LLAMA_ARG_CPP = 'https://github.com/ggml-org/llama.cpp/blob/master/common/arg.cpp';
export const OPENAI_CHAT = 'https://platform.openai.com/docs/api-reference/chat/create';

export const SAM_Q3_RAM = q3RamNeed(1);

export type SamLink = { href: string; label: string };

export type SamSource = {
  id: string;
  title: string;
  href: string;
  official: boolean;
};

export type SamFaq = {
  id: string;
  question: string;
  answer: string;
  links: SamLink[];
};

export type SamStep = {
  id: string;
  title: string;
  body: string;
  links: SamLink[];
};

export type SamFlag = {
  id: string;
  flag: string;
  api: string;
  meaning: string;
  cite: string;
};

export type SamCardRow = {
  id: string;
  model: string;
  href: string;
  mode: string;
  values: string;
  note: string;
  onCard: boolean;
};

export type SamQuantRow = {
  quant: string;
  file: string;
  speed: string;
  ramMin: string;
  ramFull: string;
  note: string;
  estimate: boolean;
};

export const SAM_LEAD = `
  Wrong samplers are a common reason loops, repetition, and garbled output get
  blamed on a Radeon or a quant. Official llama.cpp sampling lives on
  llama-server: --temp, --top-p, --top-k, --min-p, --repeat-penalty,
  --presence-penalty, --frequency-penalty, DRY, XTC, --samplers order, and
  --seed. Matching /completion fields are temperature, top_p, top_k, min_p,
  repeat_penalty, presence_penalty, frequency_penalty, samplers, and seed.
  /v1/chat/completions follows the OpenAI Chat Completions API and also
  accepts those /completion extras (the README names mirostat). House
  llama-server recipes do not record a sampler pin — AMDai will not invent
  one. Sampler speed cost stays ${SAM_UNMEASURED}. llama.cpp Vulkan first.
  Q6/Q5/Q4 recommended; ${COMPARE_Q3} is a labeled estimate — do not download Q3
  to run. Q1/Q2 stay off.
`.replace(/\s+/g, ' ').trim();

export const SAM_WHAT = `
  A sampler picks the next token from the logits. Official --temp /
  --temperature (default 0.80; env LLAMA_ARG_TEMPERATURE) scales that
  distribution. --top-k keeps the K most likely tokens (default 40; 0
  disables; env LLAMA_ARG_TOP_K). --top-p keeps a cumulative-probability
  nucleus (default 0.95; 1.0 disables; env LLAMA_ARG_TOP_P). --min-p drops
  tokens below a fraction of the top token (default 0.05; 0.0 disables; env
  LLAMA_ARG_MIN_P). Those CLI defaults are the llama-server README Sampling
  params table and common/common.h. They are not a house pin and they are
  not a Qwen card pin.
`.replace(/\s+/g, ' ').trim();

export const SAM_PENALTIES = `
  Official --repeat-penalty penalizes repeating token sequences (CLI default
  1.00 = disabled; env LLAMA_ARG_REPEAT_PENALTY). --repeat-last-n is the
  window (default 64; 0 disables). --presence-penalty and
  --frequency-penalty are the alpha presence / frequency penalties (default
  0.00 = disabled; env LLAMA_ARG_PRESENCE_PENALTY and
  LLAMA_ARG_FREQUENCY_PENALTY). DRY is off until --dry-multiplier is set
  (default 0.00); --dry-base default 1.75, --dry-allowed-length 2,
  --dry-penalty-last-n, --dry-sequence-breaker. XTC is off until
  --xtc-probability is set (default 0.00); --xtc-threshold default 0.10.
  The /completion field repeat_penalty is documented as default 1.1 — that
  is an official README discrepancy versus the CLI 1.00 default. Cite both;
  do not invent a third number.
`.replace(/\s+/g, ' ').trim();

export const SAM_ORDER = `
  Official --samplers lists the chain in order, separated by ';' (default
  penalties;dry;top_n_sigma;top_k;typ_p;top_p;min_p;xtc;temperature).
  --sampler-seq / --sampling-seq is the short form (default edskypmxt).
  The /completion samplers field is an array; the README default listed
  there is ["dry", "top_k", "typ_p", "top_p", "min_p", "xtc",
  "temperature"]. If a sampler is omitted it is not used. -s / --seed
  defaults to -1 (random). --typical / --typical-p and --top-n-sigma are
  documented; they stay off at the official defaults (1.00 and -1.00).
`.replace(/\s+/g, ' ').trim();

export const SAM_API = `
  llama-server /completion documents temperature (default 0.8), top_k (40),
  top_p (0.95), min_p (0.05), seed (-1), repeat_penalty, presence_penalty,
  frequency_penalty, dry_*, xtc_*, typical_p, and samplers. POST
  /v1/chat/completions is the OpenAI-compatible path: the README says see
  the OpenAI Chat Completions API and that /completion-specific features
  such as mirostat are also supported. OpenAI-shaped fields that shoppers
  send are temperature, top_p, presence_penalty, frequency_penalty, and
  seed; llama.cpp extras on the same body include top_k, min_p,
  repeat_penalty, and samplers. Anthropic-shaped POST /v1/messages documents
  temperature default 1.0 and top_p default 1.0 — those are that endpoint’s
  documented defaults, not the CLI table.
`.replace(/\s+/g, ' ').trim();

export const SAM_HOUSE_NOTE = `
  House daily driver is ${SAM_HOUSE_FILE} on llama.cpp Vulkan, one R9700,
  262144 context, f16 KV, ${SAM_HOUSE_SERVER_FLAGS}. House Flash try is
  ${SAM_FLASH_FILE} on the recorded llama.cpp / Strata recipes. Neither
  house recipe records --temp, --top-p, --top-k, --min-p,
  --repeat-penalty, --presence-penalty, --frequency-penalty, --samplers,
  DRY, XTC, or --seed. Official llama.cpp defaults then apply unless a
  client sends request fields. Do not treat a Qwen card row as a house pin.
`.replace(/\s+/g, ' ').trim();

export const SAM_RAM = `
  Sampler flags do not add GGUF weight. ${RAM_MIN_LABEL} on one R9700 with
  the house UD-Q5 is a ${SAM_KIT_GB} GB kit from the measured ${SAM_RAM_4K}
  GB peak at 4K. ${RAM_FULL_LABEL} uses the measured ${SAM_RAM_256K} GB peak
  at 256K. Those are llama-bench cards, not a sampler A/B. Sampler speed
  cost stays ${SAM_UNMEASURED} — open the Stack Lab planner rather than
  guessing. ${COMPARE_Q3} is a labeled estimate (${COMPARE_Q3_CITE}). Do
  not download Q3 to run.
`.replace(/\s+/g, ' ').trim();

export const SAM_HOUSE = `# House daily driver as recorded (no --temp / --top-p / --min-p / --samplers pin).
# llama-server README Sampling params: --temp 0.80, --top-k 40, --top-p 0.95, --min-p 0.05.
# Those defaults are official docs — not a local desktop pin we will invent.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${SAM_HOUSE_FILE} \\
  ${SAM_HOUSE_SERVER_FLAGS}`;

export const SAM_FLASH = `# House Flash llama.cpp shape as recorded (no sampler pin).
# Qwen 3.8 Flash card values are below — they are not this recipe.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${SAM_FLASH_FILE} \\
  -ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --jinja \\
  --host 127.0.0.1 --port ${SAM_PORT}`;

export const SAM_DOCS = `# Official llama.cpp CLI defaults from the server README — not a house pin.
# --samplers penalties;dry;top_n_sigma;top_k;typ_p;top_p;min_p;xtc;temperature
# -s / --seed -1 (random). --repeat-penalty 1.00 disables. DRY / XTC stay off.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${SAM_HOUSE_FILE} \\
  -ngl 99 -c 262144 --temp 0.80 --top-k 40 --top-p 0.95 --min-p 0.05 \\
  --repeat-penalty 1.00 --presence-penalty 0.00 --frequency-penalty 0.00 \\
  --samplers 'penalties;dry;top_n_sigma;top_k;typ_p;top_p;min_p;xtc;temperature' \\
  --seed -1 --cache-type-k f16 --cache-type-v f16 --jinja \\
  --host 127.0.0.1 --port ${SAM_PORT}`;

export const SAM_CURL_CARD = `# Official Qwen3.6-35B-A3B thinking / general-task card values — not a house pin.
# Card: temperature=1.0, top_p=0.95, top_k=20, min_p=0.0, presence_penalty=1.5,
# repetition_penalty=1.0. llama.cpp maps repetition_penalty to repeat_penalty.
curl -s http://127.0.0.1:${SAM_PORT}/v1/chat/completions \\
  -H 'Content-Type: application/json' \\
  -d '{
    "model": "qwen",
    "messages": [{"role": "user", "content": "Reply with the single word READY."}],
    "temperature": 1.0,
    "top_p": 0.95,
    "top_k": 20,
    "min_p": 0.0,
    "presence_penalty": 1.5,
    "repeat_penalty": 1.0
  }'`;

export const SAM_FLAGS: SamFlag[] = [
  {
    id: 'temp',
    flag: '--temp, --temperature N',
    api: 'temperature',
    meaning:
      'Scales logits. Official CLI default 0.80 (env LLAMA_ARG_TEMPERATURE). /completion default 0.8. 0 is greedy.',
    cite: 'llama.cpp server README — Sampling params; /completion temperature',
  },
  {
    id: 'top-p',
    flag: '--top-p N',
    api: 'top_p',
    meaning:
      'Nucleus sampling. Official default 0.95; 1.0 disables (env LLAMA_ARG_TOP_P).',
    cite: 'llama.cpp server README — --top-p; /completion top_p',
  },
  {
    id: 'top-k',
    flag: '--top-k N',
    api: 'top_k',
    meaning:
      'Keep the K most likely tokens. Official default 40; 0 disables (env LLAMA_ARG_TOP_K).',
    cite: 'llama.cpp server README — --top-k; /completion top_k',
  },
  {
    id: 'min-p',
    flag: '--min-p N',
    api: 'min_p',
    meaning:
      'Minimum probability relative to the top token. Official default 0.05; 0.0 disables (env LLAMA_ARG_MIN_P).',
    cite: 'llama.cpp server README — --min-p; /completion min_p',
  },
  {
    id: 'repeat-penalty',
    flag: '--repeat-penalty N',
    api: 'repeat_penalty',
    meaning:
      'Penalize repeating token sequences. CLI default 1.00 = disabled (env LLAMA_ARG_REPEAT_PENALTY). /completion documents default 1.1.',
    cite: 'llama.cpp server README — --repeat-penalty vs /completion repeat_penalty',
  },
  {
    id: 'presence-penalty',
    flag: '--presence-penalty N',
    api: 'presence_penalty',
    meaning:
      'Repeat alpha presence penalty. Official default 0.00 = disabled (env LLAMA_ARG_PRESENCE_PENALTY).',
    cite: 'llama.cpp server README — --presence-penalty; /completion presence_penalty',
  },
  {
    id: 'frequency-penalty',
    flag: '--frequency-penalty N',
    api: 'frequency_penalty',
    meaning:
      'Repeat alpha frequency penalty. Official default 0.00 = disabled (env LLAMA_ARG_FREQUENCY_PENALTY).',
    cite: 'llama.cpp server README — --frequency-penalty; /completion frequency_penalty',
  },
  {
    id: 'dry',
    flag: '--dry-multiplier N (plus --dry-base, --dry-allowed-length, --dry-penalty-last-n, --dry-sequence-breaker)',
    api: 'dry_multiplier / dry_base / dry_allowed_length / dry_penalty_last_n / dry_sequence_breakers',
    meaning:
      'DRY (Don’t Repeat Yourself). Official --dry-multiplier default 0.00 = disabled. --dry-base default 1.75. Sequence breakers default newline, colon, quote, asterisk.',
    cite: 'llama.cpp server README — DRY Sampling params',
  },
  {
    id: 'xtc',
    flag: '--xtc-probability N / --xtc-threshold N',
    api: 'xtc_probability / xtc_threshold',
    meaning:
      'XTC token removal. Official --xtc-probability default 0.00 = disabled. --xtc-threshold default 0.10 (threshold > 0.5 disables XTC).',
    cite: 'llama.cpp server README — XTC Sampling params',
  },
  {
    id: 'samplers',
    flag: '--samplers SAMPLERS / --sampler-seq SEQUENCE',
    api: 'samplers',
    meaning:
      'Order of the chain. CLI default penalties;dry;top_n_sigma;top_k;typ_p;top_p;min_p;xtc;temperature. Short form default edskypmxt. API array omits unused samplers.',
    cite: 'llama.cpp server README — --samplers / --sampling-seq; /completion samplers',
  },
  {
    id: 'seed',
    flag: '-s, --seed SEED',
    api: 'seed',
    meaning: 'RNG seed. Official default -1 = random seed.',
    cite: 'llama.cpp server README — -s, --seed; /completion seed',
  },
];

export const SAM_CARDS: SamCardRow[] = [
  {
    id: 'qwen36-think',
    model: 'Qwen3.6-35B-A3B',
    href: officialLinks.qwen36,
    mode: 'Thinking · general tasks',
    values:
      'temperature=1.0, top_p=0.95, top_k=20, min_p=0.0, presence_penalty=1.5, repetition_penalty=1.0',
    note: 'Official card recommended set. Not a house llama-server pin.',
    onCard: true,
  },
  {
    id: 'qwen36-code',
    model: 'Qwen3.6-35B-A3B',
    href: officialLinks.qwen36,
    mode: 'Thinking · precise coding (e.g. WebDev)',
    values:
      'temperature=0.6, top_p=0.95, top_k=20, min_p=0.0, presence_penalty=0.0, repetition_penalty=1.0',
    note: 'Official card recommended set. Not a house llama-server pin.',
    onCard: true,
  },
  {
    id: 'qwen36-instruct',
    model: 'Qwen3.6-35B-A3B',
    href: officialLinks.qwen36,
    mode: 'Instruct / non-thinking',
    values:
      'temperature=0.7, top_p=0.80, top_k=20, min_p=0.0, presence_penalty=1.5, repetition_penalty=1.0',
    note: 'Official card recommended set. Turn thinking off on /thinking first.',
    onCard: true,
  },
  {
    id: 'flash-think',
    model: 'Qwen 3.8 Flash (Qwen3.8-Flash-Next)',
    href: officialLinks.qwenFlash,
    mode: 'Thinking',
    values:
      'temperature=1.0, top_p=0.95, top_k=20, min_p=0.0, presence_penalty=0.0, repetition_penalty=1.0',
    note: 'Official card recommended set. House Flash recipes do not record these flags.',
    onCard: true,
  },
  {
    id: 'flash-instruct',
    model: 'Qwen 3.8 Flash (Qwen3.8-Flash-Next)',
    href: officialLinks.qwenFlash,
    mode: 'Instruct / non-thinking',
    values:
      'temperature=0.7, top_p=0.80, top_k=20, min_p=0.0, presence_penalty=1.5, repetition_penalty=1.0',
    note: 'Official card recommended set. House Flash recipes do not record these flags.',
    onCard: true,
  },
  {
    id: 'qwen36-27b-think',
    model: 'Qwen3.6 27B',
    href: officialLinks.qwen36Dense,
    mode: 'Thinking · general tasks',
    values:
      'temperature=1.0, top_p=0.95, top_k=20, min_p=0.0, presence_penalty=0.0, repetition_penalty=1.0',
    note: 'Official card recommended set. Presence penalty is 0.0 on this dense card’s general thinking row.',
    onCard: true,
  },
  {
    id: 'qwen36-27b-code',
    model: 'Qwen3.6 27B',
    href: officialLinks.qwen36Dense,
    mode: 'Thinking · precise coding (e.g. WebDev)',
    values:
      'temperature=0.6, top_p=0.95, top_k=20, min_p=0.0, presence_penalty=0.0, repetition_penalty=1.0',
    note: 'Official card recommended set.',
    onCard: true,
  },
  {
    id: 'qwen36-27b-instruct',
    model: 'Qwen3.6 27B',
    href: officialLinks.qwen36Dense,
    mode: 'Instruct / non-thinking',
    values:
      'temperature=0.7, top_p=0.80, top_k=20, min_p=0.0, presence_penalty=1.5, repetition_penalty=1.0',
    note: 'Official card recommended set.',
    onCard: true,
  },
  {
    id: 'qwen38-27b-think',
    model: 'Qwen3.8 27B',
    href: officialLinks.qwen38,
    mode: 'Thinking',
    values:
      'temperature=1.0, top_p=0.95, top_k=20, min_p=0.0, presence_penalty=0.0, repetition_penalty=1.0',
    note: 'Official card recommended set.',
    onCard: true,
  },
  {
    id: 'qwen38-27b-instruct',
    model: 'Qwen3.8 27B',
    href: officialLinks.qwen38,
    mode: 'Instruct / non-thinking',
    values:
      'temperature=0.7, top_p=0.80, top_k=20, min_p=0.0, presence_penalty=1.5, repetition_penalty=1.0',
    note: 'Official card recommended set.',
    onCard: true,
  },
  {
    id: 'gpt-oss',
    model: 'gpt-oss 20B',
    href: officialLinks.gptOss20b,
    mode: 'Generation samplers',
    values: 'not on the card',
    note: 'Official openai/gpt-oss-20b card does not publish recommended temperature / top_p / top_k / min_p values. Do not invent them.',
    onCard: false,
  },
  {
    id: 'gemma3',
    model: 'Gemma 3 27B',
    href: officialLinks.gemma327b,
    mode: 'Generation samplers',
    values: 'not on the card',
    note: 'Official google/gemma-3-27b-it card does not publish a recommended temperature / top_p / top_k set. The generate snippet uses do_sample=False. Do not invent values.',
    onCard: false,
  },
  {
    id: 'llama33',
    model: 'Llama 3.3 70B',
    href: officialLinks.llama3370b,
    mode: 'Generation samplers',
    values: 'not on the card',
    note: 'Official meta-llama/Llama-3.3-70B-Instruct card does not publish recommended generation temperature / top_p / top_k values. Do not invent them.',
    onCard: false,
  },
  {
    id: 'glm53',
    model: 'GLM 5.3 Flash',
    href: officialLinks.glm53Flash,
    mode: 'Eval footnotes only',
    values: 'not a recommended shopper pin',
    note: 'Official zai-org/GLM-5.3-Flash card publishes eval footnotes (e.g. HLE temperature=1.0 top_p=0.95; DeepSWE temperature=0.95 top_p=1.0). Those are benchmark arms, not a general recommended set. Do not copy them as house defaults.',
    onCard: false,
  },
];

export const SAM_QUANTS: SamQuantRow[] = [
  {
    quant: 'Q6_K',
    file: 'Qwen3.6-35B-A3B-Q6_K.gguf',
    speed: SAM_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: peak system RAM not recorded on a sampler card`,
    ramFull: `${RAM_FULL_LABEL}: peak system RAM not recorded on a sampler card`,
    note: 'Overnight llama-bench exists. Sampler speed cost stays not measured yet.',
    estimate: false,
  },
  {
    quant: 'UD-Q5_K_XL',
    file: SAM_HOUSE_FILE,
    speed: SAM_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: ${SAM_KIT_GB} GB kit from the measured ${SAM_RAM_4K} GB peak at 4K (no sampler pin on that card)`,
    ramFull: `${RAM_FULL_LABEL}: measured ${SAM_RAM_256K} GB peak at 256K. Sampler flags do not add GGUF weight.`,
    note: 'House file. Sampler A/B is not on that llama-bench card.',
    estimate: false,
  },
  {
    quant: 'Q4_K_M',
    file: 'Qwen3.6-35B-A3B-Q4_K_M.gguf',
    speed: SAM_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: peak system RAM not recorded on a sampler card`,
    ramFull: `${RAM_FULL_LABEL}: peak system RAM not recorded on a sampler card`,
    note: 'Overnight llama-bench exists. Recommended floor for house recipes. Sampler speed stays not measured yet.',
    estimate: false,
  },
  {
    quant: COMPARE_Q3,
    file: 'Qwen3.6-35B-A3B-UD-Q3_K_XL.gguf',
    speed: SAM_UNMEASURED,
    ramMin: `${RAM_MIN_LABEL}: ${SAM_Q3_RAM.atSelected.kitGb} GB kit (labeled estimate)`,
    ramFull: `${RAM_FULL_LABEL}: ${SAM_Q3_RAM.atFullContext.kitGb} GB kit (labeled estimate)`,
    note: `Labeled estimate (${COMPARE_Q3_CITE}). Do not download Q3 to run. Q3 does not buy a sampler pin.`,
    estimate: true,
  },
];

export const SAM_TROUBLE = [
  {
    id: 'loops',
    title: 'Endless loops or repetition',
    body: 'Official Qwen cards say you can raise presence_penalty between 0 and 2 to cut endless repetition, and that a higher value may mix languages. That is a card note, not a measured AMDai quality claim. llama.cpp --presence-penalty default is 0.00. House recipes do not record a pin. Do not invent 1.1.',
    links: [
      { href: '/models/qwen36', label: 'Qwen3.6-35B' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
    ],
  },
  {
    id: 'thinking-stuck',
    title: 'Thinking never ends',
    body: 'That is a reasoning toggle, not a temperature bug. Official Qwen3.6 thinks by default. Use --reasoning off or enable_thinking: false. The shopper page is /thinking. Thinking-token counts stay not measured on the local desktop.',
    links: [
      { href: '/thinking', label: 'Thinking mode' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
    ],
  },
  {
    id: 'json',
    title: 'JSON or tool calls break',
    body: 'Do not raise temperature to “fix” broken JSON. Official GBNF / JSON Schema live on /constrained-decoding. Tool attach is /guides/tool-calling. Grammar decode versus free-form stays not measured yet — run Stack Lab grammar-ab/1 from the planner.',
    links: [
      { href: '/constrained-decoding', label: 'Constrained decoding' },
      { href: '/guides/tool-calling', label: 'Tool calling' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
    ],
  },
] as const;

export const SAM_STEPS: SamStep[] = [
  {
    id: 'house-pin',
    title: 'Keep the house Vulkan pin — do not invent a sampler flag',
    body: `Vulkan llama-server, ${SAM_HOUSE_FILE}, ${SAM_HOUSE_SERVER_FLAGS}. House recipes do not record --temp, --top-p, --min-p, or --samplers. Official llama.cpp defaults then apply. House recipes stay Q4 and up. ${COMPARE_Q3} is a labeled estimate — do not download it to run.`,
    links: [
      { href: '/setup/server', label: 'Always-on server' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/models/qwen36', label: 'Qwen3.6-35B' },
    ],
  },
  {
    id: 'cite-card',
    title: 'Copy a sampler set only from the official card',
    body: 'Qwen3.6-35B, Qwen 3.8 Flash, Qwen3.6 27B, and Qwen3.8 27B publish thinking vs instruct rows. gpt-oss 20B, Gemma 3 27B, and Llama 3.3 70B do not. GLM 5.3 Flash only footnotes eval arms. llama.cpp maps the card’s repetition_penalty to --repeat-penalty / repeat_penalty. Do not invent a missing row.',
    links: [
      { href: '/qwen', label: 'Qwen compare' },
      { href: '/models/flash', label: 'Qwen 3.8 Flash' },
      { href: '/thinking', label: 'Thinking mode' },
    ],
  },
  {
    id: 'api',
    title: 'Send OpenAI-shaped fields on /v1 — or pin the CLI',
    body: 'Official /v1/chat/completions follows the OpenAI Chat Completions API and also accepts /completion extras (temperature, top_p, top_k, min_p, presence_penalty, frequency_penalty, repeat_penalty, samplers, seed). CLI --samplers order is penalties;dry;top_n_sigma;top_k;typ_p;top_p;min_p;xtc;temperature. DRY and XTC stay off at the official defaults.',
    links: [
      { href: '/setup/server', label: 'Always-on server' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/harnesses', label: 'Harnesses' },
    ],
  },
  {
    id: 'trouble',
    title: 'Fix loops, stuck thinking, and broken JSON on the cited pages',
    body: 'Repetition: Qwen cards allow presence_penalty 0–2. Thinking that never ends: /thinking. JSON that will not parse: /constrained-decoding and /guides/tool-calling. Start from /troubleshoot. Sampler speed cost stays not measured yet.',
    links: [
      { href: '/thinking', label: 'Thinking mode' },
      { href: '/constrained-decoding', label: 'Constrained decoding' },
      { href: '/guides/tool-calling', label: 'Tool calling' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
    ],
  },
  {
    id: 'measure',
    title: 'Measure on your box — do not invent a sampler tok/s',
    body: `AMDai has not measured llama-server decode with versus without a card sampler pin on the local desktop — ${SAM_UNMEASURED}. There is no Stack Lab sampler-pack id on this site. Open the planner. Export a lab-notes-report/1 pack and ingest with npx tsx src/scripts/amdai-bench.ts ingest pack.json. Packages are not published yet.`,
    links: [
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/results', label: 'Run cards' },
      { href: '/methodology', label: 'How we test' },
    ],
  },
];

export const SAM_HOWTO_STEPS = SAM_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const SAM_FAQ: SamFaq[] = [
  {
    id: 'what-is-sampling',
    question: 'What llama.cpp sampling flags should I set on a Radeon?',
    answer:
      'Official llama-server defaults are --temp 0.80, --top-k 40, --top-p 0.95, --min-p 0.05, --repeat-penalty 1.00 (off), --presence-penalty 0.00, --frequency-penalty 0.00. House recipes do not record a pin. Copy a Qwen card row only when that card publishes one. Sampler speed stays not measured yet. Q3 is a labeled estimate. llama.cpp first.',
    links: [
      { href: '/sampling', label: 'Sampling' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/models/qwen36', label: 'Qwen3.6-35B' },
    ],
  },
  {
    id: 'card-vs-house',
    question: 'Does the house 35B use the official Qwen3.6 sampling row?',
    answer:
      'Not as recorded. House llama-server is Vulkan, UD-Q5_K_XL, 262144 context, f16 KV — no --temp / --top-p / --min-p pin. Official llama.cpp defaults then apply unless the client sends fields. The Qwen3.6-35B card has separate thinking (general and coding) and instruct rows. Those are card recommendations, not a local desktop pin.',
    links: [
      { href: '/thinking', label: 'Thinking mode' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/setup/server', label: 'Always-on server' },
    ],
  },
  {
    id: 'loops-json',
    question: 'My local model loops, or JSON breaks — is that the GPU?',
    answer:
      'Usually samplers or thinking, not the Radeon. Qwen cards allow presence_penalty 0–2 for repetition. Stuck thinking is /thinking. Broken JSON is /constrained-decoding and /guides/tool-calling. Sampler speed cost stays not measured yet — open /stack-lab. The shopper page is /sampling.',
    links: [
      { href: '/sampling', label: 'Sampling' },
      { href: '/thinking', label: 'Thinking mode' },
      { href: '/constrained-decoding', label: 'Constrained decoding' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
    ],
  },
];

export const SAM_SOURCES: SamSource[] = [
  {
    id: 'llama-server',
    title:
      'llama.cpp — llama-server README (Sampling params, /completion fields, /v1/chat/completions)',
    href: LLAMA_SERVER_README,
    official: true,
  },
  {
    id: 'llama-common',
    title: 'llama.cpp — common/common.h sampling defaults',
    href: LLAMA_COMMON_H,
    official: true,
  },
  {
    id: 'llama-arg',
    title: 'llama.cpp — common/arg.cpp (--temp, --top-p, --min-p, DRY, XTC, --samplers, --seed)',
    href: LLAMA_ARG_CPP,
    official: true,
  },
  {
    id: 'openai-chat',
    title: 'OpenAI Chat Completions API (cited by llama-server /v1/chat/completions)',
    href: OPENAI_CHAT,
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
    title: 'Qwen3.6-35B-A3B official model card (thinking vs instruct sampling)',
    href: officialLinks.qwen36,
    official: true,
  },
  {
    id: 'qwen-flash',
    title: 'Qwen3.8-Flash-Next official model card (thinking vs instruct sampling)',
    href: officialLinks.qwenFlash,
    official: true,
  },
  {
    id: 'qwen36-27b',
    title: 'Qwen3.6-27B official model card',
    href: officialLinks.qwen36Dense,
    official: true,
  },
  {
    id: 'qwen38-27b',
    title: 'Qwen3.8-27B official model card',
    href: officialLinks.qwen38,
    official: true,
  },
  {
    id: 'gpt-oss',
    title: 'openai/gpt-oss-20b official model card (no recommended sampler set)',
    href: officialLinks.gptOss20b,
    official: true,
  },
  {
    id: 'gemma3',
    title: 'google/gemma-3-27b-it official model card (no recommended sampler set)',
    href: officialLinks.gemma327b,
    official: true,
  },
  {
    id: 'llama33',
    title: 'meta-llama/Llama-3.3-70B-Instruct official model card (no recommended sampler set)',
    href: officialLinks.llama3370b,
    official: true,
  },
  {
    id: 'glm53',
    title: 'zai-org/GLM-5.3-Flash official model card (eval footnotes only)',
    href: officialLinks.glm53Flash,
    official: true,
  },
];

export const SAM_HUB_LINKS: SamLink[] = [
  { href: '/thinking', label: 'Thinking mode' },
  { href: '/constrained-decoding', label: 'Constrained decoding' },
  { href: '/guides/tool-calling', label: 'Tool calling' },
  { href: '/chat-templates', label: 'Chat templates' },
  { href: '/tuning', label: 'Speed up llama.cpp' },
  { href: '/qwen', label: 'Qwen compare' },
  { href: '/models/qwen36', label: 'Qwen3.6-35B' },
  { href: '/models/flash', label: 'Qwen 3.8 Flash' },
  { href: '/setup/server', label: 'Always-on server' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/harnesses', label: 'Harnesses' },
  { href: '/troubleshoot', label: 'Troubleshoot' },
  { href: '/stack-lab', label: 'Stack Lab' },
  { href: '/amdai-bench', label: 'amdai-bench' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/start', label: 'Getting started' },
];

export const REQUIRED_SAM_HREFS = [
  '/thinking',
  '/constrained-decoding',
  '/guides/tool-calling',
  '/chat-templates',
  '/tuning',
  '/qwen',
  '/models/qwen36',
  '/models/flash',
  '/models/gpt-oss-20b',
  '/models/gemma3-27b',
  '/models/llama33-70b',
  '/models/glm-53-flash',
  '/models/qwen36-27b',
  '/models/qwen38-27b',
  '/setup/server',
  '/backends/llamacpp',
  '/harnesses',
  '/troubleshoot',
  '/stack-lab',
  '/amdai-bench',
  '/calculator',
  '/results',
  '/methodology',
  '/faq',
  '/glossary',
] as const;

export function samBlob(): string {
  return [
    SAM_TITLE,
    SAM_H1,
    SAM_DESCRIPTION,
    SAM_LEAD,
    SAM_WHAT,
    SAM_PENALTIES,
    SAM_ORDER,
    SAM_API,
    SAM_HOUSE_NOTE,
    SAM_CITED_LABEL,
    SAM_RAM,
    SAM_HOUSE,
    SAM_FLASH,
    SAM_DOCS,
    SAM_CURL_CARD,
    ...SAM_FLAGS.map((row) => `${row.flag} ${row.api} ${row.meaning} ${row.cite}`),
    ...SAM_CARDS.map((row) => `${row.model} ${row.mode} ${row.values} ${row.note}`),
    ...SAM_STEPS.map((row) => `${row.title} ${row.body}`),
    ...SAM_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...SAM_TROUBLE.map((row) => `${row.title} ${row.body}`),
    ...SAM_QUANTS.map((row) => `${row.quant} ${row.file} ${row.speed} ${row.ramMin} ${row.ramFull} ${row.note}`),
    ...SAM_SOURCES.map((row) => `${row.title} ${row.official ? 'official' : 'unofficial'}`),
    `${RAM_MIN_LABEL} ${RAM_FULL_LABEL}`,
  ].join('\n');
}

export function samHrefs(): string[] {
  const links = [
    ...SAM_HUB_LINKS,
    ...SAM_STEPS.flatMap((step) => step.links),
    ...SAM_FAQ.flatMap((row) => row.links),
    ...SAM_TROUBLE.flatMap((row) => [...row.links]),
    ...SAM_CARDS.map((row) => ({ href: row.href, label: row.model })),
    ...SAM_SOURCES.map((source) => ({ href: source.href, label: source.title })),
    { href: '/models/gpt-oss-20b', label: 'gpt-oss 20B' },
    { href: '/models/gemma3-27b', label: 'Gemma 3 27B' },
    { href: '/models/llama33-70b', label: 'Llama 3.3 70B' },
    { href: '/models/glm-53-flash', label: 'GLM 5.3 Flash' },
    { href: '/models/qwen36-27b', label: 'Qwen3.6 27B' },
    { href: '/models/qwen38-27b', label: 'Qwen3.8 27B' },
    { href: '/faq', label: 'FAQ' },
    { href: '/glossary', label: 'Glossary' },
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertSamValid(): string[] {
  const errors: string[] = [];
  const blob = samBlob();
  if (SAM_PATH !== '/sampling') errors.push('path');
  if (SAM_PUBLISHED !== '2026-10-14') errors.push('published');
  if (SAM_TITLE.length < 8) errors.push('title short');
  if (SAM_H1.length < 40) errors.push('h1 short');
  if (SAM_DESCRIPTION.length < 70 || SAM_DESCRIPTION.length > 160) {
    errors.push(`description length ${SAM_DESCRIPTION.length}`);
  }
  if (!/AMDai/.test(blob)) errors.push('must say AMDai');
  if (!/llama\.cpp/.test(blob)) errors.push('must say llama.cpp');
  if (!/Vulkan/.test(blob)) errors.push('must say Vulkan');
  if (!/--temp/.test(blob)) errors.push('must cite --temp');
  if (!/--top-p/.test(blob)) errors.push('must cite --top-p');
  if (!/--top-k/.test(blob)) errors.push('must cite --top-k');
  if (!/--min-p/.test(blob)) errors.push('must cite --min-p');
  if (!/--repeat-penalty/.test(blob)) errors.push('must cite --repeat-penalty');
  if (!/--presence-penalty/.test(blob)) errors.push('must cite --presence-penalty');
  if (!/--frequency-penalty/.test(blob)) errors.push('must cite --frequency-penalty');
  if (!/--samplers/.test(blob)) errors.push('must cite --samplers');
  if (!/--seed/.test(blob)) errors.push('must cite --seed');
  if (!/--dry-multiplier/.test(blob)) errors.push('must cite DRY');
  if (!/--xtc-probability/.test(blob)) errors.push('must cite XTC');
  if (!/LLAMA_ARG_TEMPERATURE/.test(blob)) errors.push('must cite LLAMA_ARG_TEMPERATURE');
  if (!/LLAMA_ARG_TOP_P/.test(blob)) errors.push('must cite LLAMA_ARG_TOP_P');
  if (!/LLAMA_ARG_MIN_P/.test(blob)) errors.push('must cite LLAMA_ARG_MIN_P');
  if (!/repeat_penalty/.test(blob)) errors.push('must cite repeat_penalty API');
  if (!/\/v1\/chat\/completions/.test(blob)) errors.push('must cite /v1/chat/completions');
  if (!/OpenAI Chat Completions/.test(blob)) errors.push('must cite OpenAI chat docs');
  if (!blob.includes(SAM_HOUSE_FILE)) errors.push('house file');
  if (!blob.includes(SAM_FLASH_FILE)) errors.push('flash file');
  if (!blob.includes(SAM_HOUSE_SERVER_FLAGS)) errors.push('house server flags');
  if (!/262144/.test(blob)) errors.push('house context');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('both RAM lines');
  if (!blob.includes(COMPARE_Q3)) errors.push('q3 row');
  if (!/labeled estimate/.test(blob)) errors.push('q3 labeled');
  if (!/do not download Q3/.test(blob)) errors.push('must not recommend Q3');
  if (!/Q4 and up/.test(blob)) errors.push('must say Q4 and up');
  if (!blob.includes(SAM_UNMEASURED)) errors.push('must keep unmeasured label');
  if (!/do not record/.test(blob) && !/does not record/.test(blob)) {
    errors.push('must say house does not record a sampler pin');
  }
  if (!/not on the card/.test(blob)) errors.push('must keep missing-card rows');
  if (BANNED.test(blob)) errors.push('banned model name');
  if (Q1Q2.test(blob)) errors.push('q1/q2 visible');
  if (Q4_FLOOR.test(blob)) errors.push('q4-floor wording');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/amdai-stack-lab:(?:\/\/)?sampl/.test(blob)) {
    errors.push('must not invent a sampling deep link');
  }
  if (SAM_QUANTS.some((row) => row.speed !== SAM_UNMEASURED)) {
    errors.push('must not invent a sampler speed cell');
  }
  if (!SAM_QUANTS.some((row) => row.estimate && row.quant === COMPARE_Q3)) {
    errors.push('q3 estimate row');
  }
  if (!SAM_CARDS.some((row) => row.id === 'qwen36-think' && row.onCard)) {
    errors.push('missing qwen36 thinking card row');
  }
  if (!SAM_CARDS.some((row) => row.id === 'gpt-oss' && !row.onCard)) {
    errors.push('missing gpt-oss not-on-card row');
  }
  const hrefs = samHrefs();
  for (const required of REQUIRED_SAM_HREFS) {
    if (!hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}
