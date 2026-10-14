/**
 * Cited Fedora first-run path. Not verified on our rig / not measured on local-desktop.
 * Sources: ROCm 10.1 matrix (Fedora is not an official OS row), Fedora HC SIG,
 * Fedora rocm package, Mesa RADV, llama.cpp build docs.
 * Do not invent drivers, version pins, tok/s, or “works on” claims.
 */

import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';

export const SETUP_FEDORA_PUBLISHED = '2026-10-14';
export const SETUP_FEDORA_CITED_LABEL = 'Cited, not verified on our rig';

export type SetupFedoraLink = { href: string; label: string };

export type SetupFedoraSource = {
  id: string;
  title: string;
  href: string;
};

export type SetupFedoraTrack = {
  id: 'distro' | 'amd-repo';
  title: string;
  recommend: boolean;
  body: string;
};

export type SetupFedoraStep = {
  id: string;
  title: string;
  body: string;
  links: SetupFedoraLink[];
};

export const SETUP_FEDORA_SOURCES: SetupFedoraSource[] = [
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
    id: 'fedora-hc',
    title: 'Fedora Wiki — Heterogeneous Computing SIG (ROCm on Fedora)',
    href: 'https://www.fedoraproject.org/wiki/SIGs/HC',
  },
  {
    id: 'fedora-rocm-pkg',
    title: 'Fedora Packages — rocm metapackage',
    href: 'https://packages.fedoraproject.org/pkgs/rocm/rocm/',
  },
  {
    id: 'fedora-mesa-vk',
    title: 'Fedora Packages — mesa-vulkan-drivers (RADV)',
    href: 'https://packages.fedoraproject.org/pkgs/mesa/mesa-vulkan-drivers/',
  },
  {
    id: 'llamacpp-build',
    title: 'llama.cpp — build.md (Vulkan / HIP)',
    href: 'https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md',
  },
];

export const SETUP_FEDORA_TRACKS: SetupFedoraTrack[] = [
  {
    id: 'distro',
    title: 'Fedora’s own rocm packages — the cited Fedora path',
    recommend: true,
    body: `
      Fedora is not on the ROCm 10.1.0 official OS row (that table names Ubuntu, RHEL,
      Debian, Oracle Linux, Rocky, and SLES — not Fedora). The Fedora Heterogeneous
      Computing SIG documents the distro path: add the user to render and video, then
      sudo dnf install rocm, then rocminfo. The Fedora rocm metapackage is Fedora’s
      build (Fedora Packages lists 6.3.1 on Fedora 42, 6.4.4 on Fedora 43, 7.2.0 on
      Rawhide as of this cite) — not AMD’s 10.1 repo pin. The in-tree amdgpu kernel
      driver is what the SIG says to use; it does not require a separate AMDGPU DKMS
      install. Not verified on our rig.
    `.replace(/\s+/g, ' ').trim(),
  },
  {
    id: 'amd-repo',
    title: 'AMD’s dnf repo — official for listed RPM rows, not Fedora',
    recommend: false,
    body: `
      AMD’s Install ROCm 10.1.0 page documents dnf for official RPM rows such as
      RHEL and Rocky Linux. Fedora is not one of those rows. Do not mix AMD’s
      repo.radeon.com packages onto a Fedora box and call it official 10.1 support.
      If you want AMD’s named 10.1 userspace to match the measured AMDai cards,
      install Ubuntu 24.04.5. Not verified on our rig.
    `.replace(/\s+/g, ' ').trim(),
  },
];

export const SETUP_FEDORA_STEPS: SetupFedoraStep[] = [
  {
    id: 'release',
    title: 'Supported release and kernel',
    body:
      'AMD’s 10.1 matrix does not list Fedora. The Fedora HC SIG says the amdgpu driver is built with the kernel, so you do not pin an extra AMD kernel module. Prefer a current Fedora release the SIG documents (42 / 43 / Rawhide gfx lists include gfx1201). Confirm `uname -r` is the stock Fedora kernel. A custom kernel is not verified on our rig. Dual-boot Ubuntu 24.04.5 if you want the measured local-desktop path.',
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
      'AMD Linux prerequisites and the Fedora HC SIG both add the login to render and video: sudo usermod -a -G render,video $LOGNAME (SIG) or $USER. Log out, or reboot, before you trust rocminfo. Root “works” by skipping the check — that is not the fix. Not verified on our rig.',
    links: [
      { href: '/tutorials/verify-rocm', label: 'Verify ROCm (Ubuntu)' },
      { href: '/rocm', label: 'What is ROCm' },
    ],
  },
  {
    id: 'vulkan',
    title: 'Mesa RADV Vulkan first',
    body:
      'Consumer first token on AMDai is llama.cpp + Vulkan. On Fedora that is Mesa RADV: mesa-vulkan-drivers and vulkan-tools, then vulkaninfo. Look for the discrete Radeon and a Mesa RADV ICD — not AMDVLK. If vulkaninfo is empty, stop; do not guess a driver. BIOS notes (Above 4G, ReBAR/SAM, CSM off) apply on the same board. Not verified on our rig.',
    links: [
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/bios', label: 'BIOS' },
    ],
  },
  {
    id: 'rocm',
    title: 'ROCm / HIP from Fedora packages',
    body:
      'After Vulkan tokens are the goal, Fedora’s HIP stack is sudo dnf install rocm (optional rocm-devel for headers). That is the SIG’s command. It is Fedora’s package set, not AMD Core SDK 10.1. Confirm rocminfo prints the gfx the card actually is (gfx1201 on an R9700 / 9070-class card). Do not invent an HSA override. Moving that Fedora set later is a distro upgrade, not AMD 10.1 — see /rocm/upgrade. Not verified on our rig.',
    links: [
      { href: '/tutorials/install-rocm', label: 'Install ROCm (Ubuntu)' },
      { href: '/rocm/upgrade', label: 'Upgrade or reinstall ROCm' },
      { href: '/rocm-problems', label: 'ROCm problems' },
    ],
  },
  {
    id: 'verify',
    title: 'Verify: vulkaninfo, rocminfo, then a monitor',
    body:
      'Order: vulkaninfo (RADV + discrete Radeon), then rocminfo (ROCk module + Agent gfx) if you installed Fedora rocm. The SIG’s rocminfo example shows a gfx1201 agent. A userspace monitor such as amdgpu_top can show the card busy after tokens start — it is not required for first token and is not verified on our rig. We do not invent a Fedora tok/s.',
    links: [
      { href: '/tutorials/verify-rocm', label: 'Verify ROCm (Ubuntu)' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
    ],
  },
  {
    id: 'llamacpp',
    title: 'llama.cpp — Vulkan first, then HIP',
    body:
      'Build from ggml-org with the flags build.md documents: cmake -B build-vk -DGGML_VULKAN=ON, then cmake --build build-vk -j. HIP is second: GGML_HIP=ON only after rocminfo lists this gfx. Ollama, Strata, and vLLM are not a Fedora first-run on AMDai. Not verified on our rig.',
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
      'Download the same official-instruct GGUF the Ubuntu recipes name. Start at Q6, Q5, or Q4 and check VRAM + KV on the calculator. Q3 stays a labeled estimate unless a Fedora run card exists — none does in this repo. Q1/Q2 stay off. Tok/s on /benchmarks and /results are Ubuntu llama-bench on local-desktop. Treat them as comparison, not a Fedora promise.',
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
      'The calculator prints Minimum system RAM needed (the load at the context you picked) and RAM needed at full context (262144 for the house 35B). Overnight UD-Q5 one-GPU Ubuntu peaks are 37.32 GB at 4K and 42.9 GB at 256K — measured on local-desktop, not a Fedora kit. Keep the GGUF on NVMe. Not verified on our rig.',
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
      'Use the house daily-driver launch from the 35B recipe / tuning guide: ./build-vk/bin/llama-server -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf -ngl 99 -c 262144 --cache-type-k f16 --cache-type-v f16 --host 127.0.0.1 --port 8080. That command is the Ubuntu local-desktop shape. On Fedora it is not verified on our rig and not measured on local-desktop — confirm vulkaninfo, then tokens, then a loopback /v1. Do not copy Ubuntu tok/s onto this box. Read the 4K run card to see what “good” looked like on the measured path.',
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
      'Start from a symptom on /troubleshoot. Paste a log in the error matcher. Cited rows live on /rocm-problems. Firmware: /bios. Jargon: /glossary. Short answers: /faq. Stack Lab remains the Ubuntu companion — packages are not published yet and there is no Fedora package. Not verified on our rig.',
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

export const SETUP_FEDORA_HOWTO_STEPS = SETUP_FEDORA_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const SETUP_FEDORA_HUB_LINKS: SetupFedoraLink[] = [
  { href: '/setup', label: 'Ubuntu setup (measured)' },
  { href: '/setup/arch', label: 'Arch setup' },
  { href: '/setup/windows', label: 'Windows setup' },
  { href: '/setup/docker', label: 'Docker / Podman' },
  { href: '/setup/lm-studio', label: 'LM Studio' },
  { href: '/setup/coding-assistant', label: 'Coding assistant' },
  { href: '/setup/ollama', label: 'Ollama' },
  { href: '/setup/open-webui', label: 'Open WebUI' },
  { href: '/setup/wsl', label: 'WSL2' },
  { href: '/setup/comfyui', label: 'ComfyUI' },
  { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/start', label: 'Getting started' },
  { href: '/rocm/upgrade', label: 'Upgrade or reinstall ROCm' },
];

export const REQUIRED_SETUP_FEDORA_HREFS = [
  '/setup',
  '/setup/arch',
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
  '/rocm/upgrade',
] as const;

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function setupFedoraBlob(): string {
  return [
    SETUP_FEDORA_CITED_LABEL,
    ...SETUP_FEDORA_TRACKS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_FEDORA_STEPS.map((row) => `${row.title} ${row.body}`),
  ].join('\n');
}

export function setupFedoraHrefs(): string[] {
  const links = [
    ...SETUP_FEDORA_HUB_LINKS,
    ...SETUP_FEDORA_STEPS.flatMap((step) => step.links),
    ...SETUP_FEDORA_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

export function assertSetupFedoraValid(): string[] {
  const errors: string[] = [];
  const blob = setupFedoraBlob();
  const hrefs = new Set(setupFedoraHrefs());
  if (SETUP_FEDORA_CITED_LABEL !== 'Cited, not verified on our rig') errors.push('cited label drifted');
  if (SETUP_FEDORA_TRACKS.length !== 2) errors.push('need distro and AMD-repo tracks');
  if (!SETUP_FEDORA_TRACKS.find((row) => row.id === 'distro')?.recommend) {
    errors.push('Fedora packages should be the try');
  }
  if (SETUP_FEDORA_TRACKS.find((row) => row.id === 'amd-repo')?.recommend) {
    errors.push('AMD repo must not be recommended on Fedora');
  }
  if (SETUP_FEDORA_STEPS.length < 8) errors.push('checklist too short');
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
  if (!/not on the ROCm 10\.1/i.test(blob) && !/not on the official/i.test(blob)) {
    errors.push('must say Fedora is unofficial on ROCm 10.1');
  }
  if (!/dnf install rocm/.test(blob)) errors.push('must cite Fedora dnf install rocm');
  if (!/rocminfo/.test(blob)) errors.push('must cite rocminfo');
  if (!/vulkaninfo/.test(blob)) errors.push('must cite vulkaninfo');
  if (!/llama-server/.test(blob)) errors.push('must cite the 35B llama-server shape');
  for (const source of SETUP_FEDORA_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_SETUP_FEDORA_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return [...new Set(errors)];
}
