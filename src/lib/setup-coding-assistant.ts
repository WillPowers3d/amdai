/**
 * Cited local coding-assistant path on Radeon.
 * llama-server flags and 35B decode are measured on llama.cpp on local-desktop.
 * Aider / Cline / Continue attach is cited from each tool’s docs — not measured.
 * Official sources only. No invented tok/s, prices, or Qwen2.5 / Qwen3-8B.
 */

import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';

export const SETUP_CODING_PUBLISHED = '2026-10-14';
export const SETUP_CODING_CITED_LABEL = 'Cited attach; llama.cpp measured on local-desktop';

export const SETUP_CODING_SERVER = 'http://127.0.0.1:8080/v1';
export const SETUP_CODING_HOST = '127.0.0.1';
export const SETUP_CODING_PORT = 8080;
export const SETUP_CODING_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';
export const SETUP_CODING_CONTEXT = 262144;
export const SETUP_CODING_MODEL = 'qwen';
export const SETUP_CODING_API_KEY = 'local-not-a-secret';

export const SETUP_CODING_SERVER_CMD = [
  './build-vk/bin/llama-server',
  `-m ~/${'models'}/${SETUP_CODING_HOUSE_FILE}`,
  '-ngl 99',
  `-c ${SETUP_CODING_CONTEXT}`,
  '--cache-type-k f16',
  '--cache-type-v f16',
  `--host ${SETUP_CODING_HOST}`,
  `--port ${SETUP_CODING_PORT}`,
].join(' ');

export type SetupCodingLink = { href: string; label: string };

export type SetupCodingSource = {
  id: string;
  title: string;
  href: string;
};

export type SetupCodingTrack = {
  id: 'llamacpp' | 'secondary';
  title: string;
  recommend: boolean;
  body: string;
};

export type SetupCodingStep = {
  id: string;
  title: string;
  body: string;
  links: SetupCodingLink[];
};

export type SetupCodingQuant = {
  quant: string;
  role: string;
  note: string;
  estimate: boolean;
};

export type SetupCodingTier = {
  id: string;
  vram: string;
  title: string;
  body: string;
  href: string;
};

export type SetupCodingClient = {
  id: 'aider' | 'cline' | 'continue';
  title: string;
  docs: string;
  lang: 'bash' | 'text' | 'yaml';
  filename?: string;
  body: string;
  note: string;
};

export const SETUP_CODING_SOURCES: SetupCodingSource[] = [
  {
    id: 'llamacpp-server',
    title: 'llama.cpp — llama-server README (OpenAI-shaped /v1)',
    href: 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md',
  },
  {
    id: 'aider-openai',
    title: 'Aider — OpenAI compatible APIs',
    href: 'https://aider.chat/docs/llms/openai-compat.html',
  },
  {
    id: 'aider-settings',
    title: 'Aider — advanced model settings',
    href: 'https://aider.chat/docs/config/adv-model-settings.html',
  },
  {
    id: 'cline-openai',
    title: 'Cline — OpenAI Compatible',
    href: 'https://docs.cline.bot/provider-config/openai-compatible',
  },
  {
    id: 'continue-openai',
    title: 'Continue — OpenAI / compatible apiBase',
    href: 'https://docs.continue.dev/customize/model-providers/top-level/openai',
  },
  {
    id: 'continue-llamacpp',
    title: 'Continue — llama.cpp provider',
    href: 'https://docs.continue.dev/customize/model-providers/more/llamacpp',
  },
  {
    id: 'qwen36-card',
    title: 'Qwen — Qwen3.6-35B-A3B model card',
    href: 'https://huggingface.co/Qwen/Qwen3.6-35B-A3B',
  },
  {
    id: 'qwen36-gguf',
    title: 'Unsloth — Qwen3.6-35B-A3B GGUF',
    href: 'https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF',
  },
];

export const SETUP_CODING_TRACKS: SetupCodingTrack[] = [
  {
    id: 'llamacpp',
    title: 'llama-server on Vulkan — the first /v1',
    recommend: true,
    body: `
      llama.cpp’s llama-server README documents OpenAI-compatible GET /v1/models,
      POST /v1/chat/completions, and POST /v1/responses. House daily-driver flags
      from the 35B recipe: ${SETUP_CODING_SERVER_CMD}.
      Vulkan first; HIP / ROCm is the alternative compile on /rocm/vulkan-hip.
      Upstream default --port is 9931 in the current README — we pin
      --port ${SETUP_CODING_PORT} so harnesses on this site keep
      ${SETUP_CODING_SERVER}. Confirm with curl -s ${SETUP_CODING_SERVER.replace(/\/v1$/, '')}/v1/models.
      Those flags and the 35B decode table are measured on llama.cpp on local-desktop.
    `.replace(/\s+/g, ' ').trim(),
  },
  {
    id: 'secondary',
    title: 'LM Studio or Ollama — secondary /v1 only',
    recommend: false,
    body: `
      Aider, Cline, and Continue only need an OpenAI-shaped base URL. LM Studio’s
      documented server is http://127.0.0.1:1234/v1 — cited walk is /setup/lm-studio.
      Ollama is another wrapper; it is not the house stack and has no dedicated
      first-run page here yet. Do not let a harness download a CUDA llama.cpp on
      a Radeon. House Hermes on this site talks to :8080, not :1234. Attach is
      cited, not measured on local-desktop.
    `.replace(/\s+/g, ' ').trim(),
  },
];

export const SETUP_CODING_QUANTS: SetupCodingQuant[] = [
  {
    quant: 'Q6_K',
    role: 'Higher-quality 35B sibling',
    note: 'Measured on llama.cpp Vulkan on local-desktop, not inside Aider/Cline/Continue: Q6_K 1-GPU 4K decode 103.23 tok/s (23:55 card). 32K+ is partly on DDR5. Size VRAM on the calculator.',
    estimate: false,
  },
  {
    quant: 'UD-Q5_K_XL',
    role: 'House default on one R9700',
    note: `Measured on llama.cpp Vulkan on local-desktop: 102.39 tok/s decode at 4K, 90.52 at 32K, 66.43 at 128K, 44.4 at 256K. Peak VRAM 25.97 GB / 29.34 GB; peak system RAM 37.32 GB / 42.9 GB. File ${SETUP_CODING_HOUSE_FILE}. Not an Aider tok/s.`,
    estimate: false,
  },
  {
    quant: 'Q4_K_M',
    role: 'Smaller measured 35B sibling',
    note: 'Measured on llama.cpp Vulkan on local-desktop: Q4_K_M 32K decode 117.69 tok/s; prefill 1902.1 tok/s. One R9700, f16 KV. Still check both RAM lines.',
    estimate: false,
  },
  {
    quant: COMPARE_Q3,
    role: 'Cited Q3 option — labeled estimate',
    note: `${COMPARE_Q3_CITE}. No 35B overnight tok/s. We do not invent a coding-assistant Q3 speed. Q1/Q2 stay off.`,
    estimate: true,
  },
];

export const SETUP_CODING_TIERS: SetupCodingTier[] = [
  {
    id: '32gb',
    vram: '32 GB',
    title: 'R9700 — measured house 35B',
    body: `First pick: Qwen3.6-35B-A3B Unsloth UD-Q5_K_XL at ${SETUP_CODING_CONTEXT} on one R9700. Same file as /models/qwen36. Q6_K, UD-Q5_K_XL, and Q4_K_M are overnight llama.cpp siblings. ${COMPARE_Q3} (${COMPARE_Q3_CITE}) is a labeled estimate. Speeds above are llama.cpp, not Aider.`,
    href: '/gpus/r9700',
  },
  {
    id: '24gb',
    vram: '24 GB',
    title: 'RX 7900 XTX — size 35B on the calculator',
    body: `Same Qwen3.6-35B-A3B family from /models/qwen36. Q6 / Q5 / Q4 first; ${COMPARE_Q3} stays a labeled estimate. House 35B at long context may spill — print ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL} before you download. Not measured on local-desktop.`,
    href: '/gpus/rx-7900-xtx',
  },
  {
    id: '16gb',
    vram: '16 GB',
    title: '16 GB cards — denser /models files, not house 35B in VRAM',
    body: `House 35B Q6 / Q5 / Q4 do not fit 16 GB on the calculator (RX 7800 XT, RX 9070 XT, RX 9060 XT, RX 7600 XT, RX 6800 XT). Point the assistant at a file already on /models that does: Qwen3.6-27B, Qwen3.8-27B, Gemma 3 27B, or gpt-oss-20B. Each catalog page lists Q6 / Q5 / Q4 plus a cited Q3 estimate. 35B still works with RAM offload — both RAM lines stay labeled estimate. Not measured on local-desktop.`,
    href: '/models',
  },
  {
    id: '12gb',
    vram: '12 GB / 8 GB',
    title: 'Smaller VRAM — gpt-oss-20B or offload',
    body: `RX 7700 XT (12 GB), RX 9070 GRE (12 GB), RX 6700 XT (12 GB), RX 7600 (8 GB): house 35B Q4–Q6 need offload. Prefer gpt-oss-20B or another /models file the calculator says fits. Q6 / Q5 / Q4 plus a cited Q3 estimate. Nothing below Q3. Not measured on local-desktop.`,
    href: '/models/gpt-oss-20b',
  },
];

export const SETUP_CODING_CLIENTS: SetupCodingClient[] = [
  {
    id: 'aider',
    title: 'Aider',
    docs: 'https://aider.chat/docs/llms/openai-compat.html',
    lang: 'bash',
    body: `# Cited from Aider OpenAI-compatible docs. Key must be non-empty even locally.
export OPENAI_API_BASE=${SETUP_CODING_SERVER}
export OPENAI_API_KEY=${SETUP_CODING_API_KEY}
aider --model openai/${SETUP_CODING_MODEL}

# Same flags on the CLI:
# aider --openai-api-base ${SETUP_CODING_SERVER} \\
#   --openai-api-key ${SETUP_CODING_API_KEY} \\
#   --model openai/${SETUP_CODING_MODEL}
`,
    note: 'Prefix the model with openai/. Unknown models warn until you add .aider.model.settings.yml (max_input_tokens). Server -c still wins. Aider never talks to the GPU.',
  },
  {
    id: 'cline',
    title: 'Cline',
    docs: 'https://docs.cline.bot/provider-config/openai-compatible',
    lang: 'text',
    body: `Provider: OpenAI Compatible
Base URL: ${SETUP_CODING_SERVER}
API Key: ${SETUP_CODING_API_KEY}
Model ID: ${SETUP_CODING_MODEL}
# Do not append /chat/completions to the base URL.
`,
    note: 'Cline settings panel: API Provider = OpenAI Compatible. Model ID must match GET /v1/models. Tool quality is the model’s, not a Cline protocol we invent.',
  },
  {
    id: 'continue',
    title: 'Continue',
    docs: 'https://docs.continue.dev/customize/model-providers/top-level/openai',
    lang: 'yaml',
    filename: 'config.yaml',
    body: `name: Local llama-server
version: 0.0.1
schema: v1
models:
  - name: Local Qwen
    provider: openai
    model: ${SETUP_CODING_MODEL}
    apiBase: ${SETUP_CODING_SERVER}
    apiKey: ${SETUP_CODING_API_KEY}
# capabilities: [tool_use]   # only if the server actually implements tools

# Native llama.cpp provider (docs: apiBase *without* /v1):
# provider: llama.cpp
# apiBase: http://${SETUP_CODING_HOST}:${SETUP_CODING_PORT}
`,
    note: 'Continue openai provider wants apiBase including /v1. The native llama.cpp provider uses the host without /v1. Attach is cited, not measured on local-desktop.',
  },
];

export const SETUP_CODING_STEPS: SetupCodingStep[] = [
  {
    id: 'server',
    title: 'Start llama-server — Vulkan first',
    body: `Build llama.cpp Vulkan on Ubuntu 24.04+ from /setup, then serve the house file: ${SETUP_CODING_SERVER_CMD}. Those are the same flags as the 35B recipe / tuning guide. HIP swap is the ROCm compile on Vulkan vs HIP — not the first token. llama-server README: OpenAI-shaped /v1, --host default 127.0.0.1, --alias for the API id. We pin --port ${SETUP_CODING_PORT} (upstream README default is 9931). Confirm curl -s http://${SETUP_CODING_HOST}:${SETUP_CODING_PORT}/v1/models before you open Aider.`,
    links: [
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
      { href: '/tuning', label: 'Tuning flags' },
    ],
  },
  {
    id: 'models',
    title: 'Pick Q6, Q5, or Q4 by VRAM — Q3 is a labeled estimate',
    body: `32 GB R9700: house Qwen3.6-35B-A3B UD-Q5_K_XL. 24 GB: size that same 35B on the calculator. 16 GB and below: use a /models file the calculator says fits (Qwen3.6-27B, Qwen3.8-27B, Gemma 3 27B, gpt-oss-20B) or offload 35B with both RAM lines labeled estimate. Every tier shows Q6 / Q5 / Q4 plus a cited Q3. Q1/Q2 stay off. OpenHands docs name Qwen3.6-35B-A3B as a local agent starting point — that is their cite, not a speed we invent. Flash on Strata is the fast-agent path, not this first /v1.`,
    links: [
      { href: '/models', label: 'Models' },
      { href: '/models/qwen36', label: 'Qwen3.6-35B' },
      { href: '/models/qwen36-27b', label: 'Qwen3.6-27B' },
      { href: '/models/gpt-oss-20b', label: 'gpt-oss-20B' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/can-run', label: 'Can my Radeon run it?' },
    ],
  },
  {
    id: 'context',
    title: 'Size context for agentic coding — 32K to 128K+',
    body: `Agents send files plus the chat. 32K is a short repo slice; 128K+ is the window that keeps a real edit loop. KV cache grows with -c, so decode slows and RAM rises. House daily driver is -c ${SETUP_CODING_CONTEXT}. Hermes docs require at least 64K or they reject the model. Tables on this site publish 4K / 32K / 128K / 256K because speed moves: official UD-Q5 1-GPU llama.cpp is 102.39 / 90.52 / 66.43 / 44.4 tok/s at those lengths. The calculator prints ${RAM_MIN_LABEL} (the load at the context you picked) and ${RAM_FULL_LABEL} (262144 for the house 35B). Overnight UD-Q5 peaks are 37.32 GB at 4K and 42.9 GB at 256K — measured on llama.cpp, not inside Aider. Aider’s max_input_tokens cannot exceed server -c.`,
    links: [
      { href: '/long-context', label: 'Long context' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/glossary', label: 'Glossary' },
    ],
  },
  {
    id: 'clients',
    title: 'Point Aider, Cline, and Continue at :8080/v1',
    body: `Copy the blocks below. Base URL is ${SETUP_CODING_SERVER}. Model id must match GET /v1/models (house placeholder ${SETUP_CODING_MODEL}; llama-server --alias sets it). API key is the non-empty placeholder ${SETUP_CODING_API_KEY} — Aider requires it even locally. LM Studio is :1234 if you already followed /setup/lm-studio. House Hermes on local-desktop uses this same :8080. Attach is cited, not measured on local-desktop.`,
    links: [
      { href: '/harnesses', label: 'Harnesses' },
      { href: '/harnesses/aider', label: 'Aider' },
      { href: '/harnesses/cline', label: 'Cline' },
      { href: '/harnesses/continue', label: 'Continue' },
      { href: '/harnesses/hermes', label: 'Hermes' },
      { href: '/harnesses/connect', label: 'Connect a harness' },
    ],
  },
  {
    id: 'secondary',
    title: 'LM Studio and Ollama stay secondary',
    body: 'If the desktop app is already serving /v1, Aider/Cline/Continue can use that base URL instead. LM Studio: http://127.0.0.1:1234/v1 — /setup/lm-studio. Ollama is a wrapper, not the measured path; prefer llama-server when you want this site’s flags and cards. Do not present llama.cpp tok/s as an Ollama or LM Studio result.',
    links: [
      { href: '/setup/lm-studio', label: 'LM Studio on Radeon' },
      { href: '/backends', label: 'Backends' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/setup/docker', label: 'Docker / Podman' },
    ],
  },
  {
    id: 'breaks',
    title: 'When the assistant sees no model',
    body: 'curl /v1/models first. Empty list: server not up, wrong port, or --host not 127.0.0.1. Aider “unknown model”: add openai/ prefix and model settings. Cline connection error: do not append /chat/completions to the base URL. Continue leftover context: server --context-shift / reset, not a Continue bug we invent. GPU idle: you are on CPU — check Vulkan llama-server, not the IDE. Start from /troubleshoot. Cited ROCm rows live on /rocm-problems.',
    links: [
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/troubleshoot/errors', label: 'Error paste' },
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/faq', label: 'FAQ' },
      { href: '/glossary', label: 'Glossary' },
    ],
  },
];

export const SETUP_CODING_HOWTO_STEPS = SETUP_CODING_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const SETUP_CODING_HUB_LINKS: SetupCodingLink[] = [
  { href: '/setup', label: 'Ubuntu setup (measured)' },
  { href: '/setup/lm-studio', label: 'LM Studio' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/harnesses', label: 'Harnesses' },
  { href: '/models/qwen36', label: 'Qwen3.6-35B' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/long-context', label: 'Long context' },
];

export const REQUIRED_SETUP_CODING_HREFS = [
  '/setup',
  '/setup/lm-studio',
  '/setup/docker',
  '/gpus/r9700',
  '/gpus/rx-7900-xtx',
  '/calculator',
  '/backends',
  '/backends/llamacpp',
  '/harnesses',
  '/harnesses/aider',
  '/harnesses/cline',
  '/harnesses/continue',
  '/harnesses/hermes',
  '/harnesses/connect',
  '/models',
  '/models/qwen36',
  '/long-context',
  '/glossary',
  '/rocm/vulkan-hip',
  '/troubleshoot',
  '/recipes/qwen36-35b.llamacpp-vulkan.262k',
] as const;

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function setupCodingBlob(): string {
  return [
    SETUP_CODING_CITED_LABEL,
    ...SETUP_CODING_TRACKS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_CODING_STEPS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_CODING_QUANTS.map((row) => `${row.quant} ${row.role} ${row.note}`),
    ...SETUP_CODING_TIERS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_CODING_CLIENTS.map((row) => `${row.title} ${row.body} ${row.note}`),
    SETUP_CODING_SERVER_CMD,
  ].join('\n');
}

export function setupCodingHrefs(): string[] {
  const links = [
    ...SETUP_CODING_HUB_LINKS,
    ...SETUP_CODING_STEPS.flatMap((step) => step.links),
    ...SETUP_CODING_TIERS.map((tier) => ({ href: tier.href, label: tier.title })),
    ...SETUP_CODING_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

export function assertSetupCodingValid(): string[] {
  const errors: string[] = [];
  const blob = setupCodingBlob();
  const hrefs = new Set(setupCodingHrefs());
  if (SETUP_CODING_CITED_LABEL !== 'Cited attach; llama.cpp measured on local-desktop') {
    errors.push('cited label drifted');
  }
  if (SETUP_CODING_TRACKS.length !== 2) errors.push('need llama.cpp and secondary tracks');
  if (!SETUP_CODING_TRACKS.find((row) => row.id === 'llamacpp')?.recommend) {
    errors.push('llama.cpp should be the try');
  }
  if (SETUP_CODING_TRACKS.find((row) => row.id === 'secondary')?.recommend) {
    errors.push('LM Studio / Ollama must not be the first-run try');
  }
  if (SETUP_CODING_STEPS.length < 6) errors.push('checklist too short');
  if (SETUP_CODING_QUANTS.length !== 4) errors.push('need Q6 Q5 Q4 Q3 rows');
  if (SETUP_CODING_CLIENTS.map((row) => row.id).join(',') !== 'aider,cline,continue') {
    errors.push('need Aider, Cline, Continue blocks');
  }
  if (!SETUP_CODING_QUANTS.some((row) => row.quant === COMPARE_Q3 && row.estimate)) {
    errors.push('Q3 must be a labeled estimate');
  }
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (!/llama\.cpp/i.test(blob)) errors.push('must say llama.cpp');
  if (!blob.includes(SETUP_CODING_SERVER)) errors.push('must cite :8080/v1');
  if (!blob.includes('-ngl 99')) errors.push('must cite -ngl 99');
  if (!blob.includes('262144')) errors.push('must cite house context');
  if (!blob.includes('--cache-type-k f16')) errors.push('must cite f16 KV');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) {
    errors.push('RAM lines missing');
  }
  if (!/102\.39/.test(blob) || !/44\.4/.test(blob)) errors.push('must cite measured llama.cpp decode');
  if (!/32K/.test(blob) || !/128K/.test(blob)) errors.push('must explain 32K to 128K+');
  if (!/openai\//.test(blob)) errors.push('must cite Aider openai/ prefix');
  if (!/Do not append \/chat\/completions/.test(blob)) errors.push('must cite Cline base URL note');
  if (!/apiBase/.test(blob)) errors.push('must cite Continue apiBase');
  if (!/9931/.test(blob)) errors.push('must cite upstream default port vs house 8080');
  if (!/not measured on local-desktop/i.test(blob)) errors.push('must label unmeasured attach');
  if (/\bmeasured in Aider\b|\bAider decode \d|\bCline tok\/s\b/i.test(blob)) {
    errors.push('must not claim harness tok/s');
  }
  for (const source of SETUP_CODING_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_SETUP_CODING_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return [...new Set(errors)];
}
