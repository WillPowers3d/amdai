/**
 * Cited Windows first-run path. Not measured on local-desktop.
 * Sources: AMD HIP SDK Windows docs, ROCm 10.1 WSL2 notes, llama.cpp Vulkan build docs.
 * Do not invent drivers, version pins, tok/s, or “works on” claims.
 */

import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';

export const SETUP_WINDOWS_PUBLISHED = '2026-10-13';
export const SETUP_WINDOWS_CITED_LABEL = 'Cited, not measured on local-desktop';

export type SetupWindowsLink = { href: string; label: string };

export type SetupWindowsSource = {
  id: string;
  title: string;
  href: string;
};

export type SetupWindowsTrack = {
  id: 'native' | 'wsl';
  title: string;
  recommend: boolean;
  body: string;
};

export type SetupWindowsStep = {
  id: string;
  title: string;
  body: string;
  links: SetupWindowsLink[];
};

export const SETUP_WINDOWS_SOURCES: SetupWindowsSource[] = [
  {
    id: 'hip-sdk',
    title: 'AMD — HIP SDK for Windows',
    href: 'https://rocm.docs.amd.com/projects/install-on-windows/en/latest/index.html',
  },
  {
    id: 'hip-reqs',
    title: 'AMD — HIP SDK system requirements for Windows (2026-07-31)',
    href: 'https://rocm.docs.amd.com/projects/install-on-windows/en/latest/reference/system-requirements.html',
  },
  {
    id: 'hip-install',
    title: 'AMD — Install HIP SDK for Windows',
    href: 'https://rocm.docs.amd.com/projects/install-on-windows/en/latest/install/install.html',
  },
  {
    id: 'rocm-101-notes',
    title: 'AMD — ROCm 10.1.0 release notes (WSL2 technical preview)',
    href: 'https://rocm.docs.amd.com/en/docs-10.1.0/about/release-notes.html',
  },
  {
    id: 'rocm-101-install',
    title: 'AMD — Install ROCm 10.1.0 (WSL2 Ubuntu preview notes)',
    href: 'https://rocm.docs.amd.com/en/docs-10.1.0/install/rocm.html',
  },
  {
    id: 'radeon-limits',
    title: 'AMD — Radeon limitations (Windows PyTorch-only; WSL caveats)',
    href: 'https://rocm.docs.amd.com/projects/radeon-ryzen/en/docs-7.2/docs/limitations/limitationsrad.html',
  },
  {
    id: 'llamacpp-build',
    title: 'llama.cpp — build.md (Windows Vulkan)',
    href: 'https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md',
  },
  {
    id: 'llamacpp-releases',
    title: 'llama.cpp — releases (Windows x64 Vulkan builds)',
    href: 'https://github.com/ggml-org/llama.cpp/releases',
  },
  {
    id: 'lunarg',
    title: 'LunarG — Vulkan SDK',
    href: 'https://vulkan.lunarg.com/sdk/home',
  },
];

export const SETUP_WINDOWS_TRACKS: SetupWindowsTrack[] = [
  {
    id: 'native',
    title: 'Native Windows — llama.cpp + Vulkan first',
    recommend: true,
    body: `
      AMD’s HIP SDK for Windows is a documented subset of ROCm (runtime, HIP APIs, tooling),
      not the full Linux userspace we measure on local-desktop. The 2026-07-31 Windows requirements
      table lists Radeon AI PRO R9700 and several consumer RDNA3/RDNA4 cards as Runtime + HIP SDK.
      For a first token, follow llama.cpp’s Windows Vulkan build docs: install the LunarG Vulkan
      SDK, then build with GGML_VULKAN=ON, or use a llama.cpp Windows x64 Vulkan release.
      HIP/ROCm on Windows is second, and only after Vulkan tokens work on a card AMD lists.
    `.replace(/\s+/g, ' ').trim(),
  },
  {
    id: 'wsl',
    title: 'WSL2 — technical preview, not a first-run path',
    recommend: false,
    body: `
      ROCm 10.1.0 release notes add WSL2 support in TheRock artifacts as a technical preview:
      Ubuntu .deb packages and Python wheels, not RPM. Profiling, debugging, and KFD-dependent
      tools are out of scope at that launch. AMD SMI on WSL2 is discovery/monitoring only.
      The notes also list hangs and missing device-side fault reporting. That is too thin to
      recommend WSL for a first Windows token. Prefer Ubuntu 24.04+ on bare metal if you want
      the measured AMDai cards to match the box.
    `.replace(/\s+/g, ' ').trim(),
  },
];

export const SETUP_WINDOWS_STEPS: SetupWindowsStep[] = [
  {
    id: 'gpu-driver',
    title: 'See the discrete GPU',
    body:
      'Confirm the SKU in AMD Software (Adrenalin) or Device Manager. The HIP SDK Windows installer can bundle a display driver — we do not pin an Adrenalin version. Install the LunarG Vulkan SDK that llama.cpp’s Windows Vulkan docs require, then run vulkaninfo and look for the discrete Radeon. If vulkaninfo is empty, stop; do not guess a driver. BIOS notes (Above 4G, ReBAR/SAM, CSM off) apply on the same board. Cited, not measured on local-desktop.',
    links: [
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/gpus', label: 'GPU directory' },
      { href: '/bios', label: 'BIOS' },
      { href: '/hardware', label: 'Hardware' },
    ],
  },
  {
    id: 'engine',
    title: 'llama.cpp + Vulkan first',
    body:
      'Consumer first token on Windows: llama.cpp with Vulkan. Official build.md documents GGML_VULKAN=ON after the Vulkan SDK. Releases publish a Windows x64 Vulkan build. HIP SDK is cited for cards AMD lists, including R9700 — use it only after Vulkan tokens work. Do not start with Ollama’s bundled ROCm on gfx1201; a cited Windows report filtered that device to CPU while Vulkan still generated. Strata and vLLM are not a Windows first-run on AMDai.',
    links: [
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/backends', label: 'Backends' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/troubleshoot#windows', label: 'Windows symptoms' },
    ],
  },
  {
    id: 'quant',
    title: 'Pick Q6, Q5, or Q4 — Q3 is a labeled estimate',
    body:
      'Download the same official-instruct GGUF the Linux recipes name. Start at Q6, Q5, or Q4 and check VRAM + KV on the calculator. Q3 stays a cited labeled estimate unless a Windows run card exists — none does in this repo. Q1/Q2 stay off. Tok/s, VRAM, and RAM on /benchmarks and /results are Ubuntu llama-bench on local-desktop. Treat them as comparison, not a Windows promise.',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
      { href: '/quants', label: 'Quants' },
      { href: '/qwen', label: 'Qwen compare' },
    ],
  },
  {
    id: 'fit',
    title: 'Fit VRAM and the two RAM lines',
    body:
      'The calculator prints Minimum system RAM needed (the load at the context you picked) and RAM needed at full context (262144 for the house 35B). Overnight UD-Q5 one-GPU Ubuntu peaks are 37.32 GB at 4K and 42.9 GB at 256K — measured on local-desktop, not a Windows kit. Keep the GGUF on NVMe.',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/benchmarks', label: 'Benchmarks' },
    ],
  },
  {
    id: 'first-token',
    title: 'First token, then a loopback /v1',
    body:
      'Run official instruct in llama.cpp Vulkan. Confirm Task Manager or GPU-Z shows the Radeon busy. We do not publish a Windows launch line or a Windows tok/s. After tokens flow, read the Ubuntu cards so you know what “good” looked like on the measured path. A harness comes after loopback /v1 — that attach is also unmeasured on Windows here.',
    links: [
      { href: '/tutorials/run-local-llm', label: 'Run a local Qwen' },
      { href: '/harnesses/connect', label: 'Connect a harness' },
      { href: '/results', label: 'Run cards' },
    ],
  },
  {
    id: 'stack-lab',
    title: 'Open in Stack Lab (Linux-first)',
    body:
      'Radeon Stack Lab is the Ubuntu companion that records amdai-bench/run@1 cards. There is no public download URL and no Windows package. Open in Stack Lab uses the allowlisted amdai-stack-lab: scheme. Use it from a Linux box, or dual-boot, if you want house cards. Do not invent a Windows Stack Lab build.',
    links: [
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/setup', label: 'Ubuntu setup' },
      { href: '/contribute', label: 'Contribute a recipe' },
    ],
  },
  {
    id: 'breaks',
    title: 'When it breaks',
    body:
      'Start from a Windows symptom on /troubleshoot (Windows ROCm filtered to CPU, Ollama gfx1201). Paste a log in the error matcher. Cited rows also live on /rocm-problems/windows-wsl-preview. Firmware: /bios. Jargon: /glossary. Short answers: /faq.',
    links: [
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/troubleshoot/errors', label: 'Error paste' },
      { href: '/rocm-problems/windows-wsl-preview', label: 'Windows / WSL2 preview' },
      { href: '/faq', label: 'FAQ' },
      { href: '/glossary', label: 'Glossary' },
    ],
  },
];

export const SETUP_WINDOWS_HOWTO_STEPS = SETUP_WINDOWS_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const SETUP_WINDOWS_HUB_LINKS: SetupWindowsLink[] = [
  { href: '/setup', label: 'Ubuntu setup (measured)' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/start', label: 'Getting started' },
];

export const REQUIRED_SETUP_WINDOWS_HREFS = [
  '/setup',
  '/gpus/r9700',
  '/benchmarks',
  '/calculator',
  '/backends/llamacpp',
  '/stack-lab',
  '/troubleshoot',
  '/rocm-problems/windows-wsl-preview',
  '/faq',
  '/glossary',
  '/bios',
] as const;

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function setupWindowsBlob(): string {
  return [
    SETUP_WINDOWS_CITED_LABEL,
    ...SETUP_WINDOWS_TRACKS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_WINDOWS_STEPS.map((row) => `${row.title} ${row.body}`),
  ].join('\n');
}

export function setupWindowsHrefs(): string[] {
  const links = [
    ...SETUP_WINDOWS_HUB_LINKS,
    ...SETUP_WINDOWS_STEPS.flatMap((step) => step.links),
    ...SETUP_WINDOWS_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

export function assertSetupWindowsValid(): string[] {
  const errors: string[] = [];
  const blob = setupWindowsBlob();
  const hrefs = new Set(setupWindowsHrefs());
  if (SETUP_WINDOWS_CITED_LABEL !== 'Cited, not measured on local-desktop') errors.push('cited label drifted');
  if (SETUP_WINDOWS_TRACKS.length !== 2) errors.push('need native and WSL tracks');
  if (!SETUP_WINDOWS_TRACKS.find((row) => row.id === 'native')?.recommend) {
    errors.push('native Vulkan track should be the Windows try');
  }
  if (SETUP_WINDOWS_TRACKS.find((row) => row.id === 'wsl')?.recommend) {
    errors.push('WSL must not be recommended');
  }
  if (SETUP_WINDOWS_STEPS.length < 6) errors.push('checklist too short');
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (!/llama\.cpp/i.test(blob)) errors.push('must say llama.cpp');
  if (!/Vulkan first/i.test(blob)) errors.push('must say Vulkan first');
  if (!/Q3 stays a cited labeled estimate/i.test(blob) && !/Q3 stays a labeled estimate/i.test(blob)) {
    errors.push('Q3 must stay a labeled estimate');
  }
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) {
    errors.push('RAM lines missing');
  }
  if (!/no public download/i.test(blob) && !/no Windows package/i.test(blob)) {
    errors.push('Stack Lab must stay unpublished on Windows');
  }
  if (!/technical preview/i.test(blob)) errors.push('WSL must stay a technical preview');
  if (!/not measured on local-desktop/i.test(blob)) errors.push('must say not measured on local-desktop');
  for (const source of SETUP_WINDOWS_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_SETUP_WINDOWS_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return [...new Set(errors)];
}
