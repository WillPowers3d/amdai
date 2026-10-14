/**
 * Cited Open WebUI first-run on Radeon.
 * Not measured on local-desktop. Official sources only: Open WebUI docs,
 * llama.cpp server README, AMD/ROCm/Mesa for the GPU path.
 * Open WebUI is the chat UI. Inference stays on llama-server.
 * Do not invent Open WebUI tok/s, prices, VRAM numbers, or compose flags.
 */

import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';

export const SETUP_OPEN_WEBUI_PUBLISHED = '2026-10-14';
export const SETUP_OPEN_WEBUI_CITED_LABEL = 'Cited, not measured on local-desktop';

export const SETUP_OPEN_WEBUI_LLAMA = 'http://127.0.0.1:8080/v1';
export const SETUP_OPEN_WEBUI_DOCKER_LLAMA = 'http://host.docker.internal:8080/v1';
export const SETUP_OPEN_WEBUI_PODMAN_LLAMA = 'http://host.containers.internal:8080/v1';
export const SETUP_OPEN_WEBUI_UI = 'http://127.0.0.1:3000';
export const SETUP_OPEN_WEBUI_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';
export const SETUP_OPEN_WEBUI_IMAGE = 'ghcr.io/open-webui/open-webui:main';

export const SETUP_OPEN_WEBUI_SERVER_CMD = [
  './build-vk/bin/llama-server',
  `-m ~/models/${SETUP_OPEN_WEBUI_HOUSE_FILE}`,
  '-ngl 99',
  '-c 262144',
  '--cache-type-k f16',
  '--cache-type-v f16',
  '--host 127.0.0.1',
  '--port 8080',
].join(' ');

export const SETUP_OPEN_WEBUI_DOCKER = [
  'docker run -d -p 3000:8080',
  '--add-host=host.docker.internal:host-gateway',
  '-v open-webui:/app/backend/data',
  '-e WEBUI_SECRET_KEY=$(openssl rand -hex 32)',
  '--name open-webui --restart always',
  SETUP_OPEN_WEBUI_IMAGE,
].join(' ');

export const SETUP_OPEN_WEBUI_PIP = 'open-webui serve --port 3000';

export type SetupOpenWebuiLink = { href: string; label: string };

export type SetupOpenWebuiSource = {
  id: string;
  title: string;
  href: string;
};

export type SetupOpenWebuiTrack = {
  id: 'llamacpp' | 'ollama';
  title: string;
  recommend: boolean;
  body: string;
};

export type SetupOpenWebuiStep = {
  id: string;
  title: string;
  body: string;
  links: SetupOpenWebuiLink[];
};

export type SetupOpenWebuiQuant = {
  quant: string;
  role: string;
  note: string;
  estimate: boolean;
};

export const SETUP_OPEN_WEBUI_SOURCES: SetupOpenWebuiSource[] = [
  {
    id: 'owui-quickstart',
    title: 'Open WebUI — Quick Start (Docker / pip / uv)',
    href: 'https://docs.openwebui.com/getting-started/quick-start/',
  },
  {
    id: 'owui-llamacpp',
    title: 'Open WebUI — Starting with llama.cpp',
    href: 'https://docs.openwebui.com/getting-started/quick-start/connect-a-provider/starting-with-llama-cpp/',
  },
  {
    id: 'owui-openai',
    title: 'Open WebUI — OpenAI-compatible / LM Studio connection',
    href: 'https://docs.openwebui.com/alternatives/lm-studio/',
  },
  {
    id: 'owui-provider',
    title: 'Open WebUI — Connect a provider',
    href: 'https://docs.openwebui.com/getting-started/quick-start/connect-a-provider/',
  },
  {
    id: 'llamacpp-server',
    title: 'llama.cpp — llama-server README (OpenAI-shaped /v1)',
    href: 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md',
  },
  {
    id: 'llamacpp-build',
    title: 'llama.cpp — build.md (Vulkan / HIP)',
    href: 'https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md',
  },
  {
    id: 'amd-rocm-linux',
    title: 'AMD — Install ROCm on Linux',
    href: 'https://rocm.docs.amd.com/projects/install-on-linux/en/latest/',
  },
];

export const SETUP_OPEN_WEBUI_TRACKS: SetupOpenWebuiTrack[] = [
  {
    id: 'llamacpp',
    title: 'llama-server /v1 — the first connection',
    recommend: true,
    body: `
      Open WebUI has no models of its own. Official llama.cpp guide: Settings →
      Admin → Connections → OpenAI, add a connection, URL ending in /v1,
      Provider llama.cpp. House daily-driver flags: ${SETUP_OPEN_WEBUI_SERVER_CMD}.
      Their example uses --port 10000; we pin --port 8080 so this site’s
      harnesses stay on ${SETUP_OPEN_WEBUI_LLAMA}. GPU work is llama.cpp
      Vulkan (HIP second) on /rocm/vulkan-hip — not an Open WebUI ROCm claim.
      Docker UI uses ${SETUP_OPEN_WEBUI_DOCKER_LLAMA}. Do not take the
      :cuda image or a CUDA Ollama blob on a Radeon. Not measured on local-desktop.
    `.replace(/\s+/g, ' ').trim(),
  },
  {
    id: 'ollama',
    title: 'Ollama — secondary /v1 only',
    recommend: false,
    body: `
      Open WebUI’s default Docker image looks for Ollama at
      http://host.docker.internal:11434. That is a convenience, not the house
      stack. House recipes use llama.cpp. If you already followed /setup/ollama,
      you can add that URL as an Ollama connection — still prove ollama ps is
      not 100% CPU, and do not present llama.cpp tok/s as an Ollama or Open
      WebUI result. Not measured on local-desktop.
    `.replace(/\s+/g, ' ').trim(),
  },
];

export const SETUP_OPEN_WEBUI_QUANTS: SetupOpenWebuiQuant[] = [
  {
    quant: 'Q6_K',
    role: 'Higher-quality 35B sibling',
    note: 'Measured on llama.cpp Vulkan on local-desktop, not inside Open WebUI: Q6_K 1-GPU 4K decode 103.23 tok/s (23:55 card). 32K+ is partly on DDR5. Size VRAM on the calculator.',
    estimate: false,
  },
  {
    quant: 'UD-Q5_K_XL',
    role: 'House default on one R9700',
    note: `Measured on llama.cpp Vulkan on local-desktop, not inside Open WebUI: 102.39 tok/s decode at 4K, 90.52 at 32K, 66.43 at 128K, 44.4 at 256K. Peak VRAM 25.97 / 29.34 GB; peak RAM 37.32 / 42.9 GB. File ${SETUP_OPEN_WEBUI_HOUSE_FILE}.`,
    estimate: false,
  },
  {
    quant: 'Q4_K_M',
    role: 'Smaller measured 35B sibling',
    note: 'Measured on llama.cpp Vulkan on local-desktop, not inside Open WebUI: Q4_K_M 32K decode 117.69 tok/s. Still check both RAM lines.',
    estimate: false,
  },
  {
    quant: COMPARE_Q3,
    role: 'Cited Q3 option — labeled estimate',
    note: `${COMPARE_Q3_CITE}. Official Open WebUI llama.cpp page shows an IQ1 DeepSeek example — that is their demo, not a house pick. Q1/Q2 stay off. We do not invent an Open WebUI Q3 speed.`,
    estimate: true,
  },
];

export const SETUP_OPEN_WEBUI_STEPS: SetupOpenWebuiStep[] = [
  {
    id: 'server',
    title: 'Start llama-server first — Vulkan on Ubuntu 24.04+',
    body: `Build llama.cpp from /setup, then serve the house file: ${SETUP_OPEN_WEBUI_SERVER_CMD}. Those are the same flags as the 35B recipe. HIP is the ROCm compile on Vulkan vs HIP — not the first token. Confirm curl -s http://127.0.0.1:8080/v1/models before you open a browser. Open WebUI’s llama.cpp page uses --port 10000 and --ctx-size 1024 as an example; house context is 262144. The GPU path is Mesa RADV / Vulkan or AMD ROCm HIP on the llama.cpp process, not inside the chat UI.`,
    links: [
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
      { href: '/setup/docker', label: 'Docker / Podman llama.cpp' },
    ],
  },
  {
    id: 'install',
    title: 'Install Open WebUI — Docker first, pip second, Podman cited',
    body: `Official Quick Start: Docker is the recommended path. ${SETUP_OPEN_WEBUI_DOCKER}. UI is ${SETUP_OPEN_WEBUI_UI} (container 8080 mapped to host 3000). Keep :main or :slim. Do not pull :cuda on a Radeon. pip / uv: pip install open-webui, then ${SETUP_OPEN_WEBUI_PIP} — official default is localhost:8080, which collides with house llama-server; --port 3000 is documented. Their pip note about a ROCm PyTorch wheel is for Open WebUI’s own embeddings / speech stack, not the chat model. Chat tokens stay on llama-server. Podman: official podman run on 3000:8080; reach the host with ${SETUP_OPEN_WEBUI_PODMAN_LLAMA}. Generate WEBUI_SECRET_KEY with openssl rand -hex 32. Not measured on local-desktop.`,
    links: [
      { href: '/setup/docker', label: 'Docker / Podman' },
      { href: '/setup/fedora', label: 'Fedora setup' },
      { href: '/setup/arch', label: 'Arch setup' },
      { href: '/harnesses/open-webui', label: 'Open WebUI harness' },
    ],
  },
  {
    id: 'connect',
    title: 'Point Connections at llama-server /v1',
    body: `Avatar → Settings → Admin → Connections → OpenAI → Add Connection. URL: ${SETUP_OPEN_WEBUI_LLAMA} on pip, ${SETUP_OPEN_WEBUI_DOCKER_LLAMA} in Docker, ${SETUP_OPEN_WEBUI_PODMAN_LLAMA} in Podman. Note the /v1. Auth none / placeholder key if the server has no auth. Advanced → Provider llama.cpp unlocks the Loaded marker and Eject. Models appear after the connection saves. Official LM Studio page uses the same OpenAI-shaped fields at :1234 — secondary only, /setup/lm-studio. House Hermes on local-desktop talks to :8080, not a measured Open WebUI attach.`,
    links: [
      { href: '/harnesses/connect', label: 'Connect a harness' },
      { href: '/harnesses/open-webui', label: 'Open WebUI' },
      { href: '/harnesses/hermes', label: 'Hermes' },
      { href: '/setup/coding-assistant', label: 'Coding assistant' },
      { href: '/setup/lm-studio', label: 'LM Studio' },
    ],
  },
  {
    id: 'quant',
    title: 'Pick Q6, Q5, or Q4 — Q3 is a labeled estimate',
    body: `House file is ${SETUP_OPEN_WEBUI_HOUSE_FILE} on one R9700. Size 24 GB / 16 GB cards on the calculator before you download. Start at Q6, Q5, or Q4. A cited Q3 file is a labeled estimate. Open WebUI’s llama.cpp page demos an IQ1 DeepSeek pull — ignore that for this site. Stay on the house Qwen3.6 family already on /models. Decode numbers on /benchmarks are Ubuntu llama.cpp llama-bench, not Open WebUI.`,
    links: [
      { href: '/models/qwen36', label: 'Qwen3.6-35B' },
      { href: '/models', label: 'Models' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/quants', label: 'Quants' },
      { href: '/can-run', label: 'Can my Radeon run it?' },
    ],
  },
  {
    id: 'nvme',
    title: 'Stage the GGUF on fast NVMe — never /mnt/bulk',
    body: 'The chat UI does not load weights. llama-server does. Keep the GGUF on fast NVMe (house ~/models), not a spinning disk and not a slow bulk mount such as /mnt/bulk. Prefill stalls with an idle GPU meter are often the disk. Staging is not RAM offload. Docker volume open-webui is UI data (chats, users) — that is not the model file. Not measured on local-desktop.',
    links: [
      { href: '/glossary', label: 'Glossary (NVMe staging)' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/gpus/r9700', label: 'R9700' },
    ],
  },
  {
    id: 'context',
    title: 'Context and both RAM lines stay on the server',
    body: `Open WebUI’s UI does not replace llama-server -c. House window is 262144. Size it on the calculator. Wherever a file spills, the two labels stay ${RAM_MIN_LABEL} (rounded kit estimate with a breakdown — 192 or 256 GB when a 35B file spills) and ${RAM_FULL_LABEL} when we have a measured llama.cpp peak (37.32 GB at 4K, 42.9 GB at 256K on UD-Q5). Those peaks are llama.cpp on local-desktop, not Open WebUI. Label estimate unless measured.`,
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/long-context', label: 'Long context' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
    ],
  },
  {
    id: 'secondary',
    title: 'Ollama and LM Studio stay secondary',
    body: 'If Ollama is already serving, Open WebUI can use http://127.0.0.1:11434 (pip) or host.docker.internal:11434 (Docker). That is their default discovery, not the house recipe. LM Studio :1234 is the same OpenAI-shaped form. Prefer llama-server when you want this site’s flags and cards. Do not present llama.cpp tok/s as an Open WebUI, Ollama, or LM Studio result.',
    links: [
      { href: '/setup/ollama', label: 'Ollama on Radeon' },
      { href: '/setup/lm-studio', label: 'LM Studio' },
      { href: '/backends/ollama', label: 'Ollama backend' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
  {
    id: 'breaks',
    title: 'When the model list is empty',
    body: 'curl /v1/models on llama-server first. Empty: server not up, or you used 127.0.0.1 from inside Docker — switch to host.docker.internal. Port clash: pip default :8080 vs house llama-server — use --port 3000. :cuda image will not help a Radeon. Timeout on slow loads: official AIOHTTP_CLIENT_TIMEOUT_MODEL_LIST. Start from /troubleshoot. Cited ROCm rows live on /rocm-problems.',
    links: [
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/troubleshoot/errors', label: 'Error paste' },
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
];

export const SETUP_OPEN_WEBUI_HOWTO_STEPS = SETUP_OPEN_WEBUI_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const SETUP_OPEN_WEBUI_HUB_LINKS: SetupOpenWebuiLink[] = [
  { href: '/setup', label: 'Ubuntu setup (measured)' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/harnesses/open-webui', label: 'Open WebUI harness' },
  { href: '/setup/docker', label: 'Docker / Podman' },
  { href: '/setup/ollama', label: 'Ollama' },
  { href: '/setup/lm-studio', label: 'LM Studio' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/setup/wsl', label: 'WSL2' },
];

export const REQUIRED_SETUP_OPEN_WEBUI_HREFS = [
  '/setup',
  '/setup/docker',
  '/setup/ollama',
  '/setup/lm-studio',
  '/setup/coding-assistant',
  '/backends/llamacpp',
  '/harnesses/open-webui',
  '/harnesses/connect',
  '/rocm/vulkan-hip',
  '/calculator',
  '/gpus/r9700',
  '/models/qwen36',
  '/long-context',
  '/troubleshoot',
] as const;

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;

export function setupOpenWebuiBlob(): string {
  return [
    SETUP_OPEN_WEBUI_CITED_LABEL,
    ...SETUP_OPEN_WEBUI_TRACKS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_OPEN_WEBUI_STEPS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_OPEN_WEBUI_QUANTS.map((row) => `${row.quant} ${row.role} ${row.note}`),
    SETUP_OPEN_WEBUI_SERVER_CMD,
    SETUP_OPEN_WEBUI_DOCKER,
  ].join('\n');
}

export function setupOpenWebuiHrefs(): string[] {
  const links = [
    ...SETUP_OPEN_WEBUI_HUB_LINKS,
    ...SETUP_OPEN_WEBUI_STEPS.flatMap((step) => step.links),
    ...SETUP_OPEN_WEBUI_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

export function assertSetupOpenWebuiValid(): string[] {
  const errors: string[] = [];
  const blob = setupOpenWebuiBlob();
  const hrefs = new Set(setupOpenWebuiHrefs());
  if (SETUP_OPEN_WEBUI_CITED_LABEL !== 'Cited, not measured on local-desktop') {
    errors.push('cited label drifted');
  }
  if (SETUP_OPEN_WEBUI_TRACKS.length !== 2) errors.push('need llama.cpp and Ollama tracks');
  if (!SETUP_OPEN_WEBUI_TRACKS.find((row) => row.id === 'llamacpp')?.recommend) {
    errors.push('llama.cpp should be the try');
  }
  if (SETUP_OPEN_WEBUI_TRACKS.find((row) => row.id === 'ollama')?.recommend) {
    errors.push('Ollama must not be the first-run try');
  }
  if (SETUP_OPEN_WEBUI_STEPS.length < 7) errors.push('checklist too short');
  if (SETUP_OPEN_WEBUI_QUANTS.length !== 4) errors.push('need Q6 Q5 Q4 Q3 rows');
  if (!SETUP_OPEN_WEBUI_QUANTS.some((row) => row.quant === COMPARE_Q3 && row.estimate)) {
    errors.push('Q3 must be a labeled estimate');
  }
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (!/llama\.cpp/i.test(blob)) errors.push('must say llama.cpp');
  if (!blob.includes(SETUP_OPEN_WEBUI_LLAMA)) errors.push('must cite :8080/v1');
  if (!blob.includes('host.docker.internal')) errors.push('must cite Docker host URL');
  if (!blob.includes('--port 3000')) errors.push('must cite pip port clash');
  if (!blob.includes('/mnt/bulk')) errors.push('must warn off /mnt/bulk');
  if (!blob.includes('NVMe')) errors.push('must mention NVMe');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) {
    errors.push('RAM lines missing');
  }
  if (!/102\.39/.test(blob)) errors.push('must cite measured llama.cpp decode');
  if (!/not inside Open WebUI/i.test(blob)) errors.push('must label llama.cpp numbers');
  if (/\bmeasured in Open WebUI\b|\bOpen WebUI decode \d/i.test(blob)) {
    errors.push('must not claim Open WebUI tok/s');
  }
  if (!/:cuda/.test(blob)) errors.push('must warn off the CUDA image');
  for (const source of SETUP_OPEN_WEBUI_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_SETUP_OPEN_WEBUI_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return [...new Set(errors)];
}
