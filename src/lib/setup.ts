/**
 * Consumer first-run setup for /setup.
 * Ubuntu 24.04+ is the measured path. Windows steps stay labeled estimates.
 * Do not invent tok/s, prices, or a Stack Lab download URL.
 */

import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';

export const SETUP_NAME = 'First-run setup';
export const SETUP_PUBLISHED = '2026-10-13';

export type SetupLink = { href: string; label: string };

export type SetupStep = {
  id: string;
  title: string;
  body: string;
  measured: boolean;
  links: SetupLink[];
};

export type SetupPath = {
  id: 'ubuntu' | 'windows';
  label: string;
  kicker: string;
  summary: string;
  recommended: boolean;
  steps: SetupStep[];
};

export const SETUP_INTRO_LINKS: SetupLink[] = [
  { href: '/start', label: 'Getting started' },
  { href: '/faq', label: 'FAQ' },
  { href: '/setup/windows', label: 'Windows guide' },
  { href: '/setup/fedora', label: 'Fedora guide' },
  { href: '/setup/arch', label: 'Arch guide' },
  { href: '/setup/docker', label: 'Docker / Podman' },
  { href: '/setup/lm-studio', label: 'LM Studio' },
  { href: '/setup/coding-assistant', label: 'Coding assistant' },
  { href: '/setup/ollama', label: 'Ollama' },
  { href: '/setup/open-webui', label: 'Open WebUI' },
  { href: '/fine-tuning', label: 'Fine-tuning' },
];

export const SETUP_SECTIONS = [
  { id: 'pick-a-path', label: 'Pick a path' },
  { id: 'ubuntu', label: 'Ubuntu' },
  { id: 'ubuntu-based', label: 'Ubuntu-based' },
  { id: 'windows', label: 'Windows' },
  { id: 'stack-lab', label: 'Stack Lab' },
  { id: 'read-the-numbers', label: 'Read the numbers' },
  { id: 'troubleshooting', label: 'When it breaks' },
] as const;

/** Extra cards on the hub. Not SETUP_PATHS — HowTo JSON-LD stays Ubuntu-only. */
export const SETUP_MORE_PATHS = [
  {
    href: '/setup/fedora',
    label: 'Fedora',
    kicker: 'Cited, not verified on our rig',
    summary:
      'Fedora’s own rocm packages and Mesa RADV. Not on the ROCm 10.1 OS row. No Fedora tok/s on AMDai.',
  },
  {
    href: '/setup/arch',
    label: 'Arch Linux',
    kicker: 'Cited, not verified on our rig',
    summary:
      'Arch Wiki mesa / vulkan-radeon, then ggml-vulkan. Not on the ROCm 10.1 OS row. No Arch tok/s on AMDai.',
  },
  {
    href: '/setup/docker',
    label: 'Docker / Podman',
    kicker: 'Cited, not measured on local-desktop',
    summary:
      'Official llama.cpp Vulkan or ROCm images. Localhost /v1. No container tok/s on AMDai.',
  },
  {
    href: '/setup/lm-studio',
    label: 'LM Studio',
    kicker: 'Cited, not measured on local-desktop',
    summary:
      'Desktop llama.cpp wrapper. Vulkan runtime first on Radeon. Local /v1 on :1234. No LM Studio tok/s on AMDai.',
  },
  {
    href: '/setup/coding-assistant',
    label: 'Coding assistant',
    kicker: 'Cited attach; llama.cpp measured on local-desktop',
    summary:
      'Aider, Cline, and Continue on llama-server /v1. Vulkan first. No harness tok/s on AMDai.',
  },
  {
    href: '/setup/ollama',
    label: 'Ollama',
    kicker: 'Cited, not measured on local-desktop',
    summary:
      'Easy on-ramp. llama.cpp stays the daily driver. Local /v1 on :11434. No Ollama tok/s on AMDai.',
  },
  {
    href: '/setup/open-webui',
    label: 'Open WebUI',
    kicker: 'Cited, not measured on local-desktop',
    summary:
      'Browser chat against llama-server /v1. Docker or pip. No Open WebUI tok/s on AMDai.',
  },
] as const;

export const SETUP_UBUNTU_BASED = {
  title: 'Ubuntu-based distros',
  body:
    'Linux Mint, Pop!_OS, and Kubuntu are Ubuntu-based. AMD’s ROCm 10.1.0 compatibility matrix lists Ubuntu 26.04.1, 24.04.5, and 22.04.5 by name — not Mint, Pop!_OS, or Kubuntu. Official docs do not put those derivatives on the 10.1 OS row, so we do not invent official AMD support. Follow the Ubuntu steps on this page only as unofficial; that path is not verified on our rig.     Prefer stock Ubuntu 24.04.5 if you want the measured local-desktop cards to match the box. Fedora, Arch, Docker / Podman, LM Studio, the coding-assistant guide, Ollama, and Open WebUI have their own cited pages.',
  links: [
    { href: '/setup/fedora', label: 'Fedora setup' },
    { href: '/setup/arch', label: 'Arch setup' },
    { href: '/setup/windows', label: 'Windows setup' },
    { href: '/setup/docker', label: 'Docker / Podman' },
    { href: '/setup/lm-studio', label: 'LM Studio' },
    { href: '/setup/coding-assistant', label: 'Coding assistant' },
    { href: '/setup/ollama', label: 'Ollama' },
    { href: '/setup/open-webui', label: 'Open WebUI' },
  ] satisfies SetupLink[],
};

export const SETUP_PATHS: SetupPath[] = [
  {
    id: 'ubuntu',
    label: 'Ubuntu 24.04+ (recommended)',
    kicker: 'Measured on local-desktop',
    summary:
      'Ubuntu 24.04.5 is on the ROCm 10.1 Radeon OS row. This is the path that produced the official 35B llama.cpp cards. Dual-boot or a spare drive beats forcing Windows on day one.',
    recommended: true,
    steps: [
      {
        id: 'ubuntu-hardware',
        title: 'Hardware check',
        body:
          'Confirm the SKU. The measured house box is one AMD Radeon AI PRO R9700 (32 GB, gfx1201). There is no consumer RX 9700. A 16 GB RX 9070 XT is the same generation with half the VRAM. Seat power, then read BIOS notes (Above 4G, ReBAR/SAM, CSM off, matching lane widths) before you blame ROCm. The per-board BIOS table is empty until submissions.',
        measured: true,
        links: [
          { href: '/gpus', label: 'GPU directory' },
          { href: '/gpus/r9700', label: 'R9700' },
          { href: '/hardware', label: 'Hardware' },
          { href: '/bios', label: 'BIOS' },
        ],
      },
      {
        id: 'ubuntu-rocm',
        title: 'Drivers and ROCm',
        body:
          'Do not fork a second install guide. Follow Install ROCm, then Verify GPU and ROCm. Pin one AMD Core SDK (10.1 line as of the weekly card). Do not apt install rocm from Ubuntu’s archive. 24.04.5 is an official 10.1.0 Radeon row. Vulkan llama.cpp still works if HIP configure is a mess.',
        measured: true,
        links: [
          { href: '/tutorials/install-rocm', label: 'Install ROCm' },
          { href: '/tutorials/verify-rocm', label: 'Verify ROCm' },
          { href: '/rocm', label: 'What is ROCm' },
          { href: '/', label: 'Weekly card' },
        ],
      },
      {
        id: 'ubuntu-backend',
        title: 'Pick a backend — llama.cpp first',
        body:
          'Consumer default: llama.cpp Vulkan for the daily-driver 35B. Strata v0.1.42 is second, and only for Qwen 3.8 Flash. vLLM is a multi-client try, not a first token. HIP is the ROCm compile when you need it. Engine notes stay on the backends pages.',
        measured: true,
        links: [
          { href: '/backends', label: 'Backends' },
          { href: '/backends/llamacpp', label: 'llama.cpp' },
          { href: '/backends/strata', label: 'Strata' },
          { href: '/software', label: 'AI software' },
        ],
      },
      {
        id: 'ubuntu-recipe',
        title: 'Pick a measured recipe',
        body:
          'Daily driver: Qwen3.6-35B-A3B Unsloth UD-Q5_K_XL on one R9700, llama.cpp Vulkan, 262144 context, f16 KV. Fast agent: Qwen 3.8 Flash UD-Q6_K_XL on Strata. Two cards: read Dual / multi-GPU, then 35B on two cards before you split. Q3 is a labeled estimate unless a card is measured. Q1/Q2 stay off. Open the recipe, then /qwen and /flash-daily for the rest of the table.',
        measured: true,
        links: [
          { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
          { href: '/recipes/qwen38-flash.strata.262k', label: 'Flash recipe' },
          { href: '/qwen', label: 'Qwen compare' },
          { href: '/flash-daily', label: 'Flash daily' },
          { href: '/multi-gpu', label: 'Dual / multi-GPU' },
          { href: '/two-r9700', label: 'Two R9700s' },
          { href: '/stacks', label: 'Stacks' },
        ],
      },
      {
        id: 'ubuntu-first-run',
        title: 'First run',
        body:
          'Run a local Qwen walks llama.cpp Vulkan on one R9700. Overnight cards recorded llama-bench, not llama-server: 102.39 tok/s decode at 4K, 90.52 at 32K, 66.43 at 128K, 44.4 at 256K. Peak VRAM total 25.97 GB at 4K and 29.34 GB at 256K; peak system RAM 37.32 GB and 42.9 GB (Linux GB). Then Serve Qwen if you want a loopback /v1. Keep the GGUF on NVMe.',
        measured: true,
        links: [
          { href: '/tutorials/run-local-llm', label: 'Run a local Qwen' },
          { href: '/tutorials/serve-qwen', label: 'Serve Qwen' },
          { href: '/results/local-desktop-20261012-2311-35b-udq5kxl-1gpu-4k-llamacpp-f16', label: '4K run card' },
          { href: '/harnesses/connect', label: 'Connect a harness' },
        ],
      },
    ],
  },
  {
    id: 'windows',
    label: 'Windows',
    kicker: 'Honest limits',
    summary:
      'Cited Windows guide at /setup/windows. Vulkan llama.cpp is the honest first token. Full ROCm userspace is a Linux product. ROCm 10.1 lists WSL2 as a technical preview. local-desktop cards are Ubuntu — we do not have Windows tok/s.',
    recommended: false,
    steps: [
      {
        id: 'windows-hardware',
        title: 'Hardware check',
        body:
          'Same SKU check as Ubuntu. The measured speeds on AMDai are still the Ubuntu local-desktop cards. BIOS notes apply on the same board. We do not invent a Windows-only motherboard list.',
        measured: false,
        links: [
          { href: '/gpus', label: 'GPU directory' },
          { href: '/bios', label: 'BIOS' },
          { href: '/hardware', label: 'Hardware' },
        ],
      },
      {
        id: 'windows-vulkan',
        title: 'Vulkan first — ROCm is not the first-run path',
        body:
          'Build or install llama.cpp with Vulkan. That is the labeled estimate for a first Windows token. Native Windows ROCm and PyTorch-on-Windows exist as a narrower product; do not expect rocm-smi culture. WSL2 ROCm 10.1 is a tech preview, not a measured daily driver. Prefer a spare-drive Ubuntu install if you want the cards on this site to match your box.',
        measured: false,
        links: [
          { href: '/setup/windows', label: 'Windows guide' },
          { href: '/backends/llamacpp', label: 'llama.cpp' },
          { href: '/rocm-problems/windows-wsl-preview', label: 'Windows / WSL2 preview' },
          { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
          { href: '/tutorials/install-rocm', label: 'Install ROCm (Linux)' },
        ],
      },
      {
        id: 'windows-backend',
        title: 'Backend pick (estimate)',
        body:
          'llama.cpp Vulkan first. Strata and HIP/ROCm userspace are the Linux story we measured. We do not have a Windows Strata card. vLLM on Windows is not a first-run recommendation.',
        measured: false,
        links: [
          { href: '/backends', label: 'Backends' },
          { href: '/software', label: 'AI software' },
        ],
      },
      {
        id: 'windows-recipe',
        title: 'Same files, Linux-measured speeds',
        body:
          'You can download the same GGUF the recipes name. The tok/s, VRAM, and RAM figures on /benchmarks and /results are Ubuntu llama-bench on local-desktop. Treat them as a comparison, not a Windows promise. Q3 stays a labeled estimate. Q1/Q2 stay off.',
        measured: false,
        links: [
          { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
          { href: '/qwen', label: 'Qwen compare' },
          { href: '/flash-daily', label: 'Flash daily' },
          { href: '/multi-gpu', label: 'Dual / multi-GPU' },
          { href: '/two-r9700', label: 'Two R9700s' },
        ],
      },
      {
        id: 'windows-first-run',
        title: 'First token (estimate)',
        body:
          'Run official instruct in llama.cpp Vulkan and confirm Task Manager / GPU-Z shows the Radeon busy. We do not publish a Windows launch line or a Windows tok/s. After tokens flow, read the Linux cards so you know what “good” looked like on Ubuntu. A harness comes after loopback /v1 — that attach is also unmeasured on Windows here.',
        measured: false,
        links: [
          { href: '/tutorials/run-local-llm', label: 'Run a local Qwen' },
          { href: '/benchmarks', label: 'Benchmarks' },
          { href: '/faq', label: 'FAQ' },
        ],
      },
    ],
  },
];

export const SETUP_STACK_LAB = {
  title: 'When to use Radeon Stack Lab',
  body:
    'Open Stack Lab after the first token if you have the Origin / local repo. It is the Ubuntu companion that records amdai-bench/run@1 cards instead of hand-wiring every flag. There is no public download URL — packages are not published yet. Do not invent a release. Profiles follow the YAML: qwen-reliable is the 35B daily driver; qwen-fast-agent is Flash on Strata. Lab Notes ingests those cards onto /results.',
  links: [
    { href: '/stack-lab', label: 'Stack Lab' },
    { href: '/results', label: 'Run cards' },
    { href: '/contribute', label: 'Contribute a recipe' },
  ] satisfies SetupLink[],
};

export const SETUP_NUMBERS = {
  title: 'How to read speed, VRAM, and RAM',
  body:
    'llama-bench prints pp (prefill) and tg (decode). Decode is the chat tok/s. /benchmarks is the 33-card overnight matrix; each cell links to /results. The calculator prints two RAM lines: “Minimum system RAM needed” (the load at the context you picked) and “RAM needed at full context” (262144 for the house 35B). Overnight UD-Q5 one-GPU peaks are 37.32 GB at 4K and 42.9 GB at 256K. Those are measured peaks, pending re-verify after the RAM fix — not a kit you must buy.',
  links: [
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/results', label: 'Run cards' },
    { href: '/calculator', label: 'Calculator' },
    { href: '/compare', label: 'Compare 35B' },
    { href: '/flash-ram-offload', label: 'Flash RAM offload' },
  ] satisfies SetupLink[],
};

export const SETUP_TROUBLE = {
  title: 'When it breaks',
  body:
    'Do not duplicate those pages here. Start from a symptom on /troubleshoot. Paste a log in the error matcher. Cited rows live on /rocm-problems (HIP no binary, archive shadow, MODE1 reset, unofficial HSA overrides). Firmware misses: /bios. Common failures: /troubleshooting.',
  links: [
    { href: '/troubleshoot', label: 'Troubleshoot' },
    { href: '/rocm-problems', label: 'ROCm problems' },
    { href: '/bios', label: 'BIOS' },
    { href: '/troubleshooting', label: 'Troubleshooting' },
    { href: '/troubleshoot/errors', label: 'Error paste' },
    { href: '/faq', label: 'FAQ' },
  ] satisfies SetupLink[],
};

export const SETUP_HOWTO_STEPS = SETUP_PATHS[0]!.steps.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const REQUIRED_SETUP_HREFS = [
  '/start',
  '/faq',
  '/tutorials/install-rocm',
  '/tutorials/verify-rocm',
  '/tutorials/run-local-llm',
  '/backends',
  '/backends/llamacpp',
  '/stack-lab',
  '/recipes/qwen36-35b.llamacpp-vulkan.262k',
  '/qwen',
  '/flash-daily',
  '/multi-gpu',
  '/two-r9700',
  '/benchmarks',
  '/results',
  '/calculator',
  '/rocm-problems',
  '/bios',
  '/troubleshooting',
  '/troubleshoot',
  '/setup/windows',
  '/setup/fedora',
  '/setup/arch',
  '/setup/docker',
  '/setup/lm-studio',
  '/setup/coding-assistant',
  '/setup/ollama',
  '/setup/open-webui',
  '/fine-tuning',
] as const;

const BANNED_VISIBLE = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function setupBlob(): string {
  const parts = [
    ...SETUP_PATHS.flatMap((path) => [path.label, path.summary, ...path.steps.map((step) => `${step.title} ${step.body}`)]),
    SETUP_UBUNTU_BASED.title,
    SETUP_UBUNTU_BASED.body,
    SETUP_STACK_LAB.title,
    SETUP_STACK_LAB.body,
    SETUP_NUMBERS.title,
    SETUP_NUMBERS.body,
    SETUP_TROUBLE.title,
    SETUP_TROUBLE.body,
  ];
  return parts.join('\n');
}

export function setupHrefs(): string[] {
  const links = [
    ...SETUP_INTRO_LINKS,
    ...SETUP_MORE_PATHS.map((path) => ({ href: path.href, label: path.label })),
    ...SETUP_UBUNTU_BASED.links,
    ...SETUP_PATHS.flatMap((path) => path.steps.flatMap((step) => step.links)),
    ...SETUP_STACK_LAB.links,
    ...SETUP_NUMBERS.links,
    ...SETUP_TROUBLE.links,
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

export function assertSetupValid(): string[] {
  const errors: string[] = [];
  const blob = setupBlob();
  const hrefs = new Set(setupHrefs());
  if (SETUP_PATHS.length !== 2) errors.push('need Ubuntu and Windows paths');
  if (!SETUP_PATHS[0]?.recommended) errors.push('Ubuntu must be recommended');
  if (SETUP_PATHS[1]?.recommended) errors.push('Windows must not be recommended');
  if (SETUP_HOWTO_STEPS.length < 4) errors.push('HowTo needs Ubuntu steps');
  if (SETUP_PATHS[1]?.steps.some((step) => step.measured)) errors.push('Windows steps must stay unlabeled as measured');
  if (BANNED_VISIBLE.test(blob)) errors.push('banned model');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/download url|public download/i.test(SETUP_STACK_LAB.body) === false) {
    errors.push('Stack Lab must say there is no public download');
  }
  for (const required of REQUIRED_SETUP_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  if (!SETUP_NUMBERS.body.includes(RAM_MIN_LABEL) || !SETUP_NUMBERS.body.includes(RAM_FULL_LABEL)) {
    errors.push('calculator RAM lines missing');
  }
  if (!/estimate/i.test(blob)) errors.push('Windows/Q3 estimates must be labeled');
  return [...new Set(errors)];
}
