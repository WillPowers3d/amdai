/**
 * Cited Arch Linux first-run path. Not verified on our rig / not measured on local-desktop.
 * Sources: ROCm 10.1 matrix (Arch is not an official OS row), Arch Wiki AMDGPU /
 * Vulkan / GPGPU / llama.cpp, AMD Linux prerequisites, llama.cpp build docs.
 * Do not invent drivers, version pins, tok/s, or “works on” claims.
 */

import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';

export const SETUP_ARCH_PUBLISHED = '2026-10-14';
export const SETUP_ARCH_CITED_LABEL = 'Cited, not verified on our rig';

export type SetupArchLink = { href: string; label: string };

export type SetupArchSource = {
  id: string;
  title: string;
  href: string;
};

export type SetupArchTrack = {
  id: 'distro' | 'amd-repo';
  title: string;
  recommend: boolean;
  body: string;
};

export type SetupArchStep = {
  id: string;
  title: string;
  body: string;
  links: SetupArchLink[];
};

export const SETUP_ARCH_SOURCES: SetupArchSource[] = [
  {
    id: 'rocm-101-matrix',
    title: 'AMD — ROCm 10.1.0 compatibility matrix (official OS rows)',
    href: 'https://rocm.docs.amd.com/en/docs-10.1.0/compatibility/compatibility-matrix.html',
  },
  {
    id: 'rocm-101-install',
    title: 'AMD — Install ROCm 10.1.0 (apt / dnf / zypper on listed OS rows)',
    href: 'https://rocm.docs.amd.com/en/docs-10.1.0/install/rocm.html',
  },
  {
    id: 'rocm-prereq',
    title: 'AMD — Linux prerequisites (render and video groups)',
    href: 'https://rocm.docs.amd.com/projects/install-on-linux/en/latest/install/prerequisites.html',
  },
  {
    id: 'arch-amdgpu',
    title: 'Arch Wiki — AMDGPU (mesa, vulkan-radeon)',
    href: 'https://wiki.archlinux.org/title/AMDGPU',
  },
  {
    id: 'arch-vulkan',
    title: 'Arch Wiki — Vulkan (vulkan-icd-loader, vulkan-radeon)',
    href: 'https://wiki.archlinux.org/title/Vulkan',
  },
  {
    id: 'arch-gpgpu',
    title: 'Arch Wiki — GPGPU / ROCm',
    href: 'https://wiki.archlinux.org/title/GPGPU',
  },
  {
    id: 'arch-llamacpp',
    title: 'Arch Wiki — llama.cpp (ggml-vulkan, then ggml-hip)',
    href: 'https://wiki.archlinux.org/title/Llama.cpp',
  },
  {
    id: 'llamacpp-build',
    title: 'llama.cpp — build.md (Vulkan / HIP)',
    href: 'https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md',
  },
];

export const SETUP_ARCH_TRACKS: SetupArchTrack[] = [
  {
    id: 'distro',
    title: 'Arch extra packages — the cited Arch path',
    recommend: true,
    body: `
      Arch Linux is not on the ROCm 10.1.0 official OS row (that table names Ubuntu,
      RHEL, Debian, Oracle Linux, Rocky, and SLES — not Arch). Arch Wiki AMDGPU
      plus Vulkan is the first-token path: mesa and vulkan-radeon (RADV), with
      vulkan-icd-loader. Arch Wiki llama.cpp then names llama-cpp plus ggml-vulkan
      first, ggml-hip second. Arch Wiki GPGPU documents ROCm extra packages and
      says the official GPU list is short; consumer cards may work with unofficial
      or partial support. That is not AMD 10.1. Not verified on our rig.
    `.replace(/\s+/g, ' ').trim(),
  },
  {
    id: 'amd-repo',
    title: 'AMD’s package-manager repo — not an Arch extra',
    recommend: false,
    body: `
      AMD’s Install ROCm 10.1.0 page documents apt, dnf, and zypper on listed OS
      rows. Arch pacman is not one of those methods. Do not drop repo.radeon.com
      debs or rpms onto Arch and call it official 10.1 support. A tarball or
      runfile from AMD is a portable option AMD documents for Linux, still not
      an official Arch row. If you want AMD’s named 10.1 userspace to match the
      measured AMDai cards, install Ubuntu 24.04.5. Not verified on our rig.
    `.replace(/\s+/g, ' ').trim(),
  },
];

export const SETUP_ARCH_STEPS: SetupArchStep[] = [
  {
    id: 'release',
    title: 'Rolling release and kernel notes',
    body:
      'AMD’s 10.1 matrix does not list Arch. Arch is rolling — there is no “Arch 24.04” row to pin. Prefer the stock linux kernel and the in-tree amdgpu module Arch Wiki AMDGPU documents. A custom kernel, linux-zen experiment, or DKMS amdgpu is not verified on our rig. Dual-boot Ubuntu 24.04.5 if you want the measured local-desktop path.',
    links: [
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/gpus', label: 'GPU directory' },
    ],
  },
  {
    id: 'groups',
    title: 'render and video groups',
    body:
      'AMD Linux prerequisites add the login to render and video: sudo usermod -aG render,video $USER. Arch Wiki users and groups apply the same idea. Log out, or reboot, before you trust rocminfo or /dev/kfd. Root “works” by skipping the check — that is not the fix. Not verified on our rig.',
    links: [
      { href: '/tutorials/verify-rocm', label: 'Verify ROCm (Ubuntu)' },
      { href: '/rocm', label: 'What is ROCm' },
    ],
  },
  {
    id: 'vulkan',
    title: 'Mesa RADV Vulkan first',
    body:
      'Consumer first token on AMDai is llama.cpp + Vulkan. Arch Wiki AMDGPU and Vulkan: install mesa, vulkan-radeon, vulkan-icd-loader, and vulkan-tools, then vulkaninfo. Look for the discrete Radeon and RADV — not AMDVLK. If vulkaninfo is empty, stop; do not guess a driver. BIOS notes (Above 4G, ReBAR/SAM, CSM off) apply on the same board. Not verified on our rig.',
    links: [
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/bios', label: 'BIOS' },
    ],
  },
  {
    id: 'rocm',
    title: 'ROCm / HIP from Arch packages',
    body:
      'After Vulkan tokens are the goal, Arch Wiki GPGPU documents the extra ROCm packages (HIP / OpenCL on the amdgpu kernel driver). That is Arch’s build, not AMD Core SDK 10.1. Confirm rocminfo prints the gfx the card actually is. Arch Wiki notes ROC_ENABLE_PRE_VEGA=1 for Polaris-era cards — do not set that on gfx1201, and do not invent an HSA override. Not verified on our rig.',
    links: [
      { href: '/tutorials/install-rocm', label: 'Install ROCm (Ubuntu)' },
      { href: '/rocm-problems', label: 'ROCm problems' },
    ],
  },
  {
    id: 'verify',
    title: 'Verify: vulkaninfo, rocminfo, then a monitor',
    body:
      'Order: vulkaninfo (RADV + discrete Radeon), then rocminfo if you installed Arch ROCm packages. A userspace monitor such as amdgpu_top (Arch extra) can show the card busy after tokens start — it is not required for first token and is not verified on our rig. We do not invent an Arch tok/s.',
    links: [
      { href: '/tutorials/verify-rocm', label: 'Verify ROCm (Ubuntu)' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
    ],
  },
  {
    id: 'llamacpp',
    title: 'llama.cpp — Vulkan first, then HIP',
    body:
      'Arch Wiki llama.cpp: install llama-cpp plus ggml-vulkan first. HIP is second: ggml-hip only after rocminfo lists this gfx. Or build from ggml-org with the flags build.md documents: cmake -B build-vk -DGGML_VULKAN=ON. Ollama, Strata, and vLLM are not an Arch first-run on AMDai. Not verified on our rig.',
    links: [
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/backends', label: 'Backends' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
    ],
  },
  {
    id: 'quant',
    title: 'Pick Q6, Q5, or Q4 — Q3 is a labeled estimate',
    body:
      'Download the same official-instruct GGUF the Ubuntu recipes name. Start at Q6, Q5, or Q4 and check VRAM + KV on the calculator. Q3 stays a labeled estimate unless an Arch run card exists — none does in this repo. Q1/Q2 stay off. Tok/s on /benchmarks and /results are Ubuntu llama-bench on local-desktop. Treat them as comparison, not an Arch promise.',
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
      'The calculator prints Minimum system RAM needed (the load at the context you picked) and RAM needed at full context (262144 for the house 35B). Overnight UD-Q5 one-GPU Ubuntu peaks are 37.32 GB at 4K and 42.9 GB at 256K — measured on local-desktop, not an Arch kit. Keep the GGUF on NVMe. Not verified on our rig.',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/benchmarks', label: 'Benchmarks' },
    ],
  },
  {
    id: 'first-token',
    title: 'First-run command (Ubuntu-measured shape)',
    body:
      'Use the house daily-driver launch from the 35B recipe / tuning guide: ./build-vk/bin/llama-server -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf -ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --host 127.0.0.1 --port 8080. That command is the Ubuntu local-desktop shape. On Arch it is not verified on our rig and not measured on local-desktop — confirm vulkaninfo, then tokens, then a loopback /v1. Do not copy Ubuntu tok/s onto this box. Read the 4K run card to see what “good” looked like on the measured path.',
    links: [
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
      { href: '/results/local-desktop-20261012-2311-35b-udq5kxl-1gpu-4k-llamacpp-f16', label: '4K run card' },
      { href: '/tutorials/run-local-llm', label: 'Run a local Qwen' },
      { href: '/tuning', label: 'Tuning flags' },
    ],
  },
  {
    id: 'breaks',
    title: 'When it breaks',
    body:
      'Start from a symptom on /troubleshoot. Paste a log in the error matcher. Cited rows live on /rocm-problems. Firmware: /bios. Jargon: /glossary. Short answers: /faq. Stack Lab remains the Ubuntu companion — packages are not published yet and there is no Arch package. Not verified on our rig.',
    links: [
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/troubleshoot/errors', label: 'Error paste' },
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/faq', label: 'FAQ' },
      { href: '/glossary', label: 'Glossary' },
      { href: '/stack-lab', label: 'Stack Lab' },
    ],
  },
];

export const SETUP_ARCH_HOWTO_STEPS = SETUP_ARCH_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const SETUP_ARCH_HUB_LINKS: SetupArchLink[] = [
  { href: '/setup', label: 'Ubuntu setup (measured)' },
  { href: '/setup/fedora', label: 'Fedora setup' },
  { href: '/setup/windows', label: 'Windows setup' },
  { href: '/setup/docker', label: 'Docker / Podman' },
  { href: '/setup/lm-studio', label: 'LM Studio' },
  { href: '/setup/coding-assistant', label: 'Coding assistant' },
  { href: '/setup/ollama', label: 'Ollama' },
  { href: '/setup/open-webui', label: 'Open WebUI' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/start', label: 'Getting started' },
];

export const REQUIRED_SETUP_ARCH_HREFS = [
  '/setup',
  '/setup/fedora',
  '/setup/windows',
  '/setup/docker',
  '/gpus/r9700',
  '/benchmarks',
  '/calculator',
  '/backends/llamacpp',
  '/stack-lab',
  '/troubleshoot',
  '/faq',
  '/glossary',
  '/bios',
  '/recipes/qwen36-35b.llamacpp-vulkan.262k',
] as const;

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function setupArchBlob(): string {
  return [
    SETUP_ARCH_CITED_LABEL,
    ...SETUP_ARCH_TRACKS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_ARCH_STEPS.map((row) => `${row.title} ${row.body}`),
  ].join('\n');
}

export function setupArchHrefs(): string[] {
  const links = [
    ...SETUP_ARCH_HUB_LINKS,
    ...SETUP_ARCH_STEPS.flatMap((step) => step.links),
    ...SETUP_ARCH_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

export function assertSetupArchValid(): string[] {
  const errors: string[] = [];
  const blob = setupArchBlob();
  const hrefs = new Set(setupArchHrefs());
  if (SETUP_ARCH_CITED_LABEL !== 'Cited, not verified on our rig') errors.push('cited label drifted');
  if (SETUP_ARCH_TRACKS.length !== 2) errors.push('need distro and AMD-repo tracks');
  if (!SETUP_ARCH_TRACKS.find((row) => row.id === 'distro')?.recommend) {
    errors.push('Arch packages should be the try');
  }
  if (SETUP_ARCH_TRACKS.find((row) => row.id === 'amd-repo')?.recommend) {
    errors.push('AMD repo must not be recommended on Arch');
  }
  if (SETUP_ARCH_STEPS.length < 8) errors.push('checklist too short');
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (!/llama\.cpp/i.test(blob)) errors.push('must say llama.cpp');
  if (!/Vulkan first/i.test(blob)) errors.push('must say Vulkan first');
  if (!/not verified on our rig/i.test(blob)) errors.push('must say not verified on our rig');
  if (!/not measured on local-desktop/i.test(blob)) errors.push('must say not measured on local-desktop');
  if (!/Q3 stays a labeled estimate/i.test(blob)) errors.push('Q3 must stay a labeled estimate');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) {
    errors.push('RAM lines missing');
  }
  if (!/not on the ROCm 10\.1/i.test(blob)) errors.push('must say Arch is unofficial on ROCm 10.1');
  if (!/vulkan-radeon/.test(blob)) errors.push('must cite vulkan-radeon');
  if (!/ggml-vulkan/.test(blob)) errors.push('must cite ggml-vulkan');
  if (!/rocminfo/.test(blob)) errors.push('must cite rocminfo');
  if (!/vulkaninfo/.test(blob)) errors.push('must cite vulkaninfo');
  if (!/llama-server/.test(blob)) errors.push('must cite the 35B llama-server shape');
  for (const source of SETUP_ARCH_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_SETUP_ARCH_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return [...new Set(errors)];
}
