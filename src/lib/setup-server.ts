/**
 * Cited always-on llama-server on Linux (systemd).
 * Extends the multi-gpu systemd-style units instead of duplicating two-card pins.
 * Official sources: llama.cpp server README, systemd man pages.
 * Ubuntu ufw and OpenSSH -L are labeled unofficial for this job.
 * No invented tok/s, prices, or unit options. llama.cpp Vulkan first.
 */

import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';

export const SETUP_SERVER_PATH = '/setup/server';
export const SETUP_SERVER_PUBLISHED = '2026-10-14';
export const SETUP_SERVER_CITED_LABEL = 'Cited llama.cpp + systemd · not a measured service card';

export const SETUP_SERVER_TITLE = 'Always-on llama-server (systemd)';
export const SETUP_SERVER_DESCRIPTION =
  'Run llama.cpp as an always-on local AI server on Linux (systemd). Loopback first. Cited llama.cpp and systemd docs.';

export const SETUP_SERVER_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';
export const SETUP_SERVER_PORT = 8080;
export const SETUP_SERVER_RAM_4K = 37.32;
export const SETUP_SERVER_RAM_256K = 42.9;
export const SETUP_SERVER_KIT_GB = 64;

export const LLAMA_SERVER_README = 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md';
export const SYSTEMD_SERVICE_MAN = 'https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html';
export const SYSTEMCTL_MAN = 'https://www.freedesktop.org/software/systemd/man/latest/systemctl.html';
export const JOURNALCTL_MAN = 'https://www.freedesktop.org/software/systemd/man/latest/journalctl.html';
export const UFW_MAN = 'https://manpages.ubuntu.com/manpages/noble/man8/ufw.8.html';
export const SSH_MAN = 'https://man.openbsd.org/ssh';

export type SetupServerLink = { href: string; label: string };

export type SetupServerSource = {
  id: string;
  title: string;
  href: string;
  official: boolean;
};

export type SetupServerFaq = {
  id: string;
  question: string;
  answer: string;
  links: SetupServerLink[];
};

export type SetupServerStep = {
  id: string;
  title: string;
  body: string;
  links: SetupServerLink[];
};

export const SETUP_SERVER_LEAD = `
  Shoppers want a 24/7 llama-server the way local desktop serves Hermes, Open WebUI,
  coding tools, and phones — without leaving a terminal open. This AMDai page
  is the Linux systemd unit for one house 35B on loopback. llama.cpp Vulkan
  first. Dual-card systemd pins stay on /setup/multi-gpu — this page extends
  those notes, it does not copy them. Overnight decode lives on /gpus/r9700
  and /benchmarks (llama-bench, not a service tok/s).
`.replace(/\s+/g, ' ').trim();

export const SETUP_SERVER_SOURCES: SetupServerSource[] = [
  {
    id: 'llama-server',
    title: 'llama.cpp — llama-server README (--host, --api-key, GET /health)',
    href: LLAMA_SERVER_README,
    official: true,
  },
  {
    id: 'llama-repo',
    title: 'llama.cpp repository',
    href: 'https://github.com/ggml-org/llama.cpp',
    official: true,
  },
  {
    id: 'systemd-service',
    title: 'systemd.service — Type, ExecStart, Restart, User',
    href: SYSTEMD_SERVICE_MAN,
    official: true,
  },
  {
    id: 'systemctl',
    title: 'systemctl — daemon-reload, enable, start, restart, status',
    href: SYSTEMCTL_MAN,
    official: true,
  },
  {
    id: 'journalctl',
    title: 'journalctl — unit logs',
    href: JOURNALCTL_MAN,
    official: true,
  },
  {
    id: 'ufw',
    title: 'Ubuntu man-pages — ufw (unofficial for llama.cpp)',
    href: UFW_MAN,
    official: false,
  },
  {
    id: 'ssh',
    title: 'OpenSSH ssh(1) — -L local forward (unofficial for llama.cpp)',
    href: SSH_MAN,
    official: false,
  },
];

export const SETUP_SERVER_UNIT = `# Example only — not a measured local desktop service.
# /etc/systemd/system/llama-server.service
# Copy house flags from /tutorials/serve-qwen. Replace the binary and GGUF paths.
[Unit]
Description=llama-server house 35B on loopback
After=network-online.target

[Service]
Type=simple
User=YOUR_LOGIN
ExecStart=/path/to/llama.cpp/build-vk/bin/llama-server -m /path/to/nvme/${SETUP_SERVER_HOUSE_FILE} -ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --jinja --host 127.0.0.1 --port ${SETUP_SERVER_PORT}
Restart=on-failure

[Install]
WantedBy=multi-user.target`;

export const SETUP_SERVER_ENABLE = `sudo install -m 0644 llama-server.service /etc/systemd/system/llama-server.service
sudo systemctl daemon-reload
sudo systemctl enable --now llama-server
systemctl status llama-server`;

export const SETUP_SERVER_LOGS = `journalctl -u llama-server -f
curl -s http://127.0.0.1:${SETUP_SERVER_PORT}/health
curl -s http://127.0.0.1:${SETUP_SERVER_PORT}/v1/models`;

export const SETUP_SERVER_LAN = `# Opt-in LAN — not the house default.
# llama-server README: --host default is 127.0.0.1; --api-key KEY (or LLAMA_API_KEY).
# GET /health is public (no API key check). /v1/health also works.
ExecStart=... --host 0.0.0.0 --port ${SETUP_SERVER_PORT} --api-key YOUR_KEY`;

export const SETUP_SERVER_UFW = `# Unofficial for llama.cpp — Ubuntu ufw. Only if you bound a LAN address.
sudo ufw status
# sudo ufw allow from 192.168.0.0/16 to any port ${SETUP_SERVER_PORT} proto tcp
# Copy the subnet you actually use. Do not open 0.0.0.0/0.`;

export const SETUP_SERVER_TUNNEL = `# Unofficial for llama.cpp — OpenSSH local forward.
# Keeps llama-server on 127.0.0.1 on the GPU box.
ssh -L ${SETUP_SERVER_PORT}:127.0.0.1:${SETUP_SERVER_PORT} user@gpu-box`;

export const SETUP_SERVER_RESTART = `sudo systemctl edit llama-server
# or edit ExecStart, then:
sudo systemctl daemon-reload
sudo systemctl restart llama-server
journalctl -u llama-server -e`;

export const SETUP_SERVER_STEPS: SetupServerStep[] = [
  {
    id: 'tokens-first',
    title: 'Get tokens on loopback before you write a unit',
    body: `Ubuntu 24.04+ bare metal is the measured AMDai path. Build llama.cpp Vulkan, load ${SETUP_SERVER_HOUSE_FILE} on one R9700, and confirm curl http://127.0.0.1:${SETUP_SERVER_PORT}/v1/models from /tutorials/serve-qwen. systemd does not fix a binary that never generated. House flags: -ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --jinja --host 127.0.0.1 --port ${SETUP_SERVER_PORT}. llama.cpp first. Q6/Q5/Q4 recommended; Q3 is a labeled estimate. Q1/Q2 stay off.`,
    links: [
      { href: '/setup', label: 'Ubuntu setup' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
    ],
  },
  {
    id: 'unit',
    title: 'Write one systemd unit for the house 35B',
    body: `Drop a Type=simple unit under /etc/systemd/system/llama-server.service. systemd.service documents Type, ExecStart, Restart, and User. Run as the login that already reaches /dev/dri — not root. Restart=on-failure. The ExecStart line is the serve-qwen command, not a new flag set. This is an example, not a measured local desktop service. Two-card split or combo units stay on /setup/multi-gpu.`,
    links: [
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/setup/multi-gpu', label: 'Multi-GPU systemd notes' },
      { href: '/tuning', label: 'Tuning flags' },
    ],
  },
  {
    id: 'enable',
    title: 'daemon-reload, enable --now, then status',
    body: 'systemctl daemon-reload after you install the file. systemctl enable --now llama-server starts it and keeps it across reboot. systemctl status llama-server is the first check. Those verbs are from the systemctl man page. Not a measured local desktop service.',
    links: [
      { href: '/setup', label: 'Ubuntu setup' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
  {
    id: 'health',
    title: 'journalctl and GET /health',
    body: `journalctl -u llama-server -f is the unit log (journalctl man page). llama-server README: GET /health is a public health check — no API key. /v1/health also works. Then curl /v1/models on 127.0.0.1:${SETUP_SERVER_PORT}. Overnight 35B numbers are llama-bench cards, not this service.`,
    links: [
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/benchmarks', label: 'Benchmarks' },
      { href: '/results', label: 'Run cards' },
    ],
  },
  {
    id: 'ram',
    title: 'Both RAM lines for the house 35B',
    body: `Where context and offload appear, AMDai prints ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL}. Overnight UD-Q5 one-GPU peaks are ${SETUP_SERVER_RAM_4K} GB at 4K and ${SETUP_SERVER_RAM_256K} GB at 256K — measured llama-bench on the local desktop, Linux GB. Round ${RAM_MIN_LABEL} to a ${SETUP_SERVER_KIT_GB} GB kit for this file on one R9700. Q3 stays a labeled estimate. Do not invent a systemd RAM number.`,
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/benchmarks', label: 'Benchmarks' },
    ],
  },
  {
    id: 'bind',
    title: 'Keep 127.0.0.1; LAN needs --api-key',
    body: `llama-server README: --host defaults to 127.0.0.1. That is the house bind. Phones and LAN clients are opt-in: --host 0.0.0.0 plus --api-key KEY (or LLAMA_API_KEY / --api-key-file). GET /health stays public even with a key. Do not publish 0.0.0.0 without a key. Open WebUI, Aider, and Hermes on the same box use http://127.0.0.1:${SETUP_SERVER_PORT}/v1.`,
    links: [
      { href: '/setup/open-webui', label: 'Open WebUI' },
      { href: '/setup/coding-assistant', label: 'Coding assistant' },
      { href: '/harnesses/connect', label: 'Connect a harness' },
      { href: '/harnesses/hermes', label: 'Hermes' },
    ],
  },
  {
    id: 'ufw-ssh',
    title: 'ufw and an SSH tunnel — unofficial extras',
    body: `If the unit stays on 127.0.0.1, ufw is not what exposes /v1. A LAN bind can use Ubuntu ufw to allow one subnet to port ${SETUP_SERVER_PORT} — unofficial for llama.cpp, cited from the noble ufw man-page. Prefer an OpenSSH local forward (ssh -L) so the GPU box never leaves loopback. ssh(1) documents -L. Unofficial for llama.cpp.`,
    links: [
      { href: '/setup/docker', label: 'Docker / Podman' },
      { href: '/harnesses/connect', label: 'Connect a harness' },
    ],
  },
  {
    id: 'swap',
    title: 'Swap the GGUF with a restart',
    body: 'Edit ExecStart (or systemctl edit for a drop-in), daemon-reload, then systemctl restart llama-server. journalctl -u llama-server -e confirms the new file. Do not run a second llama-server on :8080. A second model on a second card is /setup/multi-gpu (:8081), not a second copy of this unit.',
    links: [
      { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp' },
      { href: '/models', label: 'House models' },
      { href: '/quants', label: 'Quants' },
    ],
  },
  {
    id: 'harness',
    title: 'Attach a harness after /health is ok',
    body: `Point Hermes, Open WebUI, Aider, Cline, or Continue at http://127.0.0.1:${SETUP_SERVER_PORT}/v1 only after /health and /v1/models work. Decode numbers on this site are Ubuntu llama-bench, not a harness tok/s. Stack Lab remains the Ubuntu companion — packages are not published yet.`,
    links: [
      { href: '/harnesses', label: 'Harnesses' },
      { href: '/harnesses/connect', label: 'Connect a harness' },
      { href: '/setup/open-webui', label: 'Open WebUI' },
      { href: '/setup/coding-assistant', label: 'Coding assistant' },
      { href: '/stack-lab', label: 'Stack Lab' },
    ],
  },
  {
    id: 'breaks',
    title: 'When it breaks',
    body: 'status=1/FAILURE: ExecStart path, missing GGUF, or the login cannot open /dev/dri. Empty /v1/models: still loading, or you curled the wrong port. GPU idle: you are on CPU — confirm the Vulkan binary, not systemd. Permission denied: groups, not a new unit flag. Start from /troubleshoot. Cited ROCm rows live on /rocm-problems.',
    links: [
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/troubleshoot/errors', label: 'Error paste' },
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/faq', label: 'FAQ' },
      { href: '/glossary', label: 'Glossary' },
    ],
  },
];

export const SETUP_SERVER_HOWTO_STEPS = SETUP_SERVER_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const SETUP_SERVER_FAQ: SetupServerFaq[] = [
  {
    id: 'why-systemd',
    question: 'How do I keep llama-server running after I log out?',
    answer:
      'A systemd Type=simple unit with enable --now. House bind is 127.0.0.1:8080. Confirm GET /health and /v1/models before you attach a harness. Dual-card units stay on /setup/multi-gpu.',
    links: [
      { href: '/setup/server', label: 'Always-on llama-server' },
      { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
      { href: '/setup/multi-gpu', label: 'Multi-GPU notes' },
    ],
  },
  {
    id: 'lan',
    question: 'Can phones on the LAN hit the house 35B?',
    answer:
      'Yes as an opt-in. llama-server --host defaults to 127.0.0.1. A LAN bind needs --host 0.0.0.0 and --api-key. GET /health stays public. Prefer an SSH -L tunnel so the GPU box never leaves loopback. ufw is unofficial here.',
    links: [
      { href: '/setup/server', label: 'Always-on llama-server' },
      { href: '/harnesses/connect', label: 'Connect a harness' },
    ],
  },
  {
    id: 'ram',
    question: 'How much system RAM does an always-on 35B need?',
    answer: `${RAM_MIN_LABEL} on one R9700 with the house UD-Q5 is a ${SETUP_SERVER_KIT_GB} GB kit from the measured ${SETUP_SERVER_RAM_4K} GB peak at 4K. ${RAM_FULL_LABEL} uses the measured ${SETUP_SERVER_RAM_256K} GB peak at 256K — still that kit. Those are llama-bench cards, not a systemd measurement. Q3 is a labeled estimate.`,
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/benchmarks', label: 'Benchmarks' },
    ],
  },
];

export const SETUP_SERVER_HUB_LINKS: SetupServerLink[] = [
  { href: '/setup', label: 'Ubuntu setup (measured)' },
  { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp' },
  { href: '/setup/docker', label: 'Docker / Podman' },
  { href: '/setup/open-webui', label: 'Open WebUI' },
  { href: '/setup/coding-assistant', label: 'Coding assistant' },
  { href: '/setup/ollama', label: 'Ollama' },
  { href: '/setup/lm-studio', label: 'LM Studio' },
  { href: '/setup/fedora', label: 'Fedora setup' },
  { href: '/setup/arch', label: 'Arch setup' },
  { href: '/setup/windows', label: 'Windows setup' },
  { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
  { href: '/harnesses', label: 'Harnesses' },
  { href: '/concurrency-ab', label: 'Parallel slots' },
  { href: '/flash-attention', label: 'Flash Attention' },
  { href: '/prompt-cache', label: 'Prompt cache' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/start', label: 'Getting started' },
];

export const REQUIRED_SETUP_SERVER_HREFS = [
  '/setup',
  '/setup/multi-gpu',
  '/setup/docker',
  '/setup/open-webui',
  '/setup/coding-assistant',
  '/tutorials/serve-qwen',
  '/backends/llamacpp',
  '/gpus/r9700',
  '/benchmarks',
  '/calculator',
  '/harnesses',
  '/concurrency-ab',
  '/flash-attention',
  '/prompt-cache',
  '/harnesses/connect',
  '/stack-lab',
  '/troubleshoot',
  '/faq',
  '/glossary',
] as const;

export function setupServerBlob(): string {
  return [
    SETUP_SERVER_TITLE,
    SETUP_SERVER_DESCRIPTION,
    SETUP_SERVER_LEAD,
    SETUP_SERVER_CITED_LABEL,
    SETUP_SERVER_UNIT,
    SETUP_SERVER_ENABLE,
    SETUP_SERVER_LOGS,
    SETUP_SERVER_LAN,
    SETUP_SERVER_UFW,
    SETUP_SERVER_TUNNEL,
    SETUP_SERVER_RESTART,
    ...SETUP_SERVER_STEPS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_SERVER_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...SETUP_SERVER_SOURCES.map((row) => `${row.title} ${row.official ? 'official' : 'unofficial'}`),
  ].join('\n');
}

export function setupServerHrefs(): string[] {
  const links = [
    ...SETUP_SERVER_HUB_LINKS,
    ...SETUP_SERVER_STEPS.flatMap((step) => step.links),
    ...SETUP_SERVER_FAQ.flatMap((row) => row.links),
    ...SETUP_SERVER_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertSetupServerValid(): string[] {
  const errors: string[] = [];
  const blob = setupServerBlob();
  if (SETUP_SERVER_PATH !== '/setup/server') errors.push('path');
  if (SETUP_SERVER_PUBLISHED !== '2026-10-14') errors.push('published');
  if (SETUP_SERVER_TITLE.length < 8) errors.push('title short');
  if (SETUP_SERVER_DESCRIPTION.length < 70 || SETUP_SERVER_DESCRIPTION.length > 160) {
    errors.push(`description length ${SETUP_SERVER_DESCRIPTION.length}`);
  }
  if (!/AMDai/.test(blob)) errors.push('must say AMDai');
  if (!/llama\.cpp/.test(blob)) errors.push('must say llama.cpp');
  if (!/Vulkan/.test(blob)) errors.push('must say Vulkan');
  if (!/systemd/.test(blob)) errors.push('must say systemd');
  if (!/127\.0\.0\.1/.test(blob)) errors.push('must bind loopback');
  if (!/--api-key/.test(blob)) errors.push('must cite --api-key');
  if (!/\/health/.test(blob)) errors.push('must cite /health');
  if (!/journalctl/.test(blob)) errors.push('must cite journalctl');
  if (!/unofficial/.test(blob)) errors.push('must mark ufw/ssh unofficial');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('both RAM lines');
  if (!blob.includes(SETUP_SERVER_HOUSE_FILE)) errors.push('house file');
  if (!/262144/.test(blob)) errors.push('house context');
  if (!/Q3 is a labeled estimate/.test(blob) && !/Q3 stays a labeled estimate/.test(blob)) {
    errors.push('q3 labeled');
  }
  if (!/\/setup\/multi-gpu/.test(blob)) errors.push('must defer two-card units');
  if (BANNED.test(blob)) errors.push('banned model name');
  if (Q1Q2.test(blob)) errors.push('q1/q2 visible');
  if (Q4_FLOOR.test(blob)) errors.push('q4-floor wording');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (!SETUP_SERVER_UNIT.includes('ExecStart=')) errors.push('unit ExecStart');
  if (!SETUP_SERVER_UNIT.includes('Type=simple')) errors.push('unit Type=simple');
  if (!SETUP_SERVER_UNIT.includes('--host 127.0.0.1')) errors.push('unit loopback');
  const unofficial = SETUP_SERVER_SOURCES.filter((row) => !row.official).map((row) => row.id).sort();
  if (unofficial.join(',') !== 'ssh,ufw') errors.push(`unofficial sources ${unofficial.join(',')}`);
  const hrefs = setupServerHrefs();
  for (const required of REQUIRED_SETUP_SERVER_HREFS) {
    if (!hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}
