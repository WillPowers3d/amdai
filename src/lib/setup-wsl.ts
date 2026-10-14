/**
 * Cited WSL2 first-run path for Radeon. Not measured on the local desktop.
 * Sources: AMD ROCm 10.1.0 docs / release notes, Microsoft WSL docs,
 * llama.cpp HIP build docs. Do not invent drivers, pins, tok/s, or prices.
 */

import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';

export const SETUP_WSL_PUBLISHED = '2026-10-14';
export const SETUP_WSL_CITED_LABEL = 'Cited, not measured on the local desktop';

export const SETUP_WSL_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';

export const SETUP_WSL_WSL_INSTALL = 'wsl --install';
export const SETUP_WSL_WSL_LIST = 'wsl --list --verbose';
export const SETUP_WSL_ROCMINFO = 'rocminfo';
export const SETUP_WSL_DXG = 'ls -l /dev/dxg';
export const SETUP_WSL_KFD = 'ls -l /dev/kfd';
export const SETUP_WSL_AMD_SMI = 'amd-smi version';

/** Official llama.cpp HIP CMake, GPU_TARGETS omitted (builds for GPUs on the box). */
export const SETUP_WSL_HIP_CMAKE = [
  'HIPCXX="$(hipconfig -l)/clang"',
  'HIP_PATH="$(hipconfig -R)"',
  'cmake -S . -B build -DGGML_HIP=ON -DCMAKE_BUILD_TYPE=Release',
  '&& cmake --build build --config Release -- -j$(nproc)',
].join(' ');

/** House Ubuntu flag set after a HIP build. Not a WSL tok/s claim. */
export const SETUP_WSL_SERVER_CMD = [
  './build/bin/llama-server',
  `-m ~/models/${SETUP_WSL_HOUSE_FILE}`,
  '-ngl 99',
  '-c 262144',
  '--cache-type-k f16',
  '--cache-type-v f16',
  '--host 127.0.0.1',
  '--port 8080',
].join(' ');

export type SetupWslLink = { href: string; label: string };

export type SetupWslSource = {
  id: string;
  title: string;
  href: string;
};

export type SetupWslTrack = {
  id: 'linux' | 'windows' | 'wsl';
  title: string;
  recommend: boolean;
  body: string;
};

export type SetupWslStep = {
  id: string;
  title: string;
  body: string;
  links: SetupWslLink[];
};

export type SetupWslQuant = {
  quant: string;
  role: string;
  note: string;
  estimate: boolean;
};

export const SETUP_WSL_SOURCES: SetupWslSource[] = [
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
    id: 'rocm-101-matrix',
    title: 'AMD — ROCm 10.1.0 compatibility matrix',
    href: 'https://rocm.docs.amd.com/en/docs-10.1.0/compatibility/compatibility-matrix.html',
  },
  {
    id: 'rocm-101-blog',
    title: 'AMD — ROCm 10.1 blog (WSL2 GPU paravirtualization)',
    href: 'https://rocm.blogs.amd.com/ecosystems-and-partners/rocm-10.1-blog/README.html',
  },
  {
    id: 'adrenalin-101',
    title: 'AMD — Adrenalin / ROCm 10.1 Windows driver downloads',
    href: 'https://www.amd.com/en/resources/support-articles/release-notes/RN-RAD-ROCM-10-01.html',
  },
  {
    id: 'radeon-limits',
    title: 'AMD — Radeon limitations (Windows PyTorch-only; WSL caveats)',
    href: 'https://rocm.docs.amd.com/projects/radeon-ryzen/en/docs-7.2/docs/limitations/limitationsrad.html',
  },
  {
    id: 'ms-wsl-install',
    title: 'Microsoft — Install WSL',
    href: 'https://learn.microsoft.com/en-us/windows/wsl/install',
  },
  {
    id: 'ms-wsl-config',
    title: 'Microsoft — .wslconfig and wsl.conf',
    href: 'https://learn.microsoft.com/en-us/windows/wsl/wsl-config',
  },
  {
    id: 'ms-wsl-env',
    title: 'Microsoft — WSL development environment (file storage)',
    href: 'https://learn.microsoft.com/en-us/windows/wsl/setup/environment',
  },
  {
    id: 'llamacpp-build',
    title: 'llama.cpp — build.md (HIP / GGML_HIP)',
    href: 'https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md',
  },
  {
    id: 'llamacpp-server',
    title: 'llama.cpp — llama-server README (OpenAI-shaped /v1)',
    href: 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md',
  },
];

export const SETUP_WSL_TRACKS: SetupWslTrack[] = [
  {
    id: 'linux',
    title: 'Native Linux — the measured AMDai path',
    recommend: true,
    body: `
      Ubuntu 24.04+ on bare metal is still the path that produced the official
      35B llama.cpp cards. Follow /setup. Cited Fedora and Arch walks live at
      /setup/fedora and /setup/arch — those guests are not on the ROCm 10.1
      OS row, and we do not have Fedora or Arch tok/s. Dual-boot or a spare
      drive beats forcing a preview guest if you want this site’s cards to
      match the box. Not a WSL measurement.
    `.replace(/\s+/g, ' ').trim(),
  },
  {
    id: 'windows',
    title: 'Native Windows — llama.cpp Vulkan for a first token',
    recommend: false,
    body: `
      If the box stays on Windows tonight, /setup/windows is the honest first
      token: llama.cpp with Vulkan (LunarG SDK, GGML_VULKAN=ON, or a Windows
      x64 Vulkan release). HIP SDK for Windows is a documented subset, not the
      Linux userspace we measure. Full ROCm userspace is a Linux product.
      Prefer this over WSL when you only need tokens, not a Linux ROCm guest.
    `.replace(/\s+/g, ' ').trim(),
  },
  {
    id: 'wsl',
    title: 'WSL2 ROCm — technical preview, not a first-run path',
    recommend: false,
    body: `
      ROCm 10.1.0 release notes add WSL2 in TheRock artifacts as a technical
      preview: Ubuntu .deb packages and Python wheels, not RPM. The ROCr
      runtime detects /dev/dxg and loads librocdxg. Profiling, debugging, and
      KFD-dependent tools are out of scope at that launch. AMD SMI on WSL2 is
      discovery and monitoring only — amd-smi event is not supported. Known
      issues include hangs and missing device-side fault reporting. That is
      too thin to recommend WSL for a first Radeon token. Use this page only
      after you already want a Linux ROCm guest on a Windows host.
    `.replace(/\s+/g, ' ').trim(),
  },
];

export const SETUP_WSL_QUANTS: SetupWslQuant[] = [
  {
    quant: 'Q6_K',
    role: 'Higher-quality 35B sibling',
    note: 'Measured on llama.cpp Vulkan on the local desktop, not inside WSL: Q6_K 1-GPU 4K decode 103.23 tok/s (23:55 card). 32K+ is partly on DDR5. Size VRAM on the calculator.',
    estimate: false,
  },
  {
    quant: 'UD-Q5_K_XL',
    role: 'House default on one R9700',
    note: `Measured on llama.cpp Vulkan on the local desktop, not inside WSL: 102.39 tok/s decode at 4K, 90.52 at 32K, 66.43 at 128K, 44.4 at 256K. Peak VRAM 25.97 / 29.34 GB; peak RAM 37.32 / 42.9 GB. File ${SETUP_WSL_HOUSE_FILE}.`,
    estimate: false,
  },
  {
    quant: 'Q4_K_M',
    role: 'Smaller measured 35B sibling',
    note: 'Measured on llama.cpp Vulkan on the local desktop, not inside WSL: Q4_K_M 32K decode 117.69 tok/s. Still check both RAM lines.',
    estimate: false,
  },
  {
    quant: COMPARE_Q3,
    role: 'Cited Q3 option — labeled estimate',
    note: `${COMPARE_Q3_CITE}. Q3 stays a labeled estimate unless a WSL run card exists — none does in this repo. Q1/Q2 stay off. We do not invent a WSL Q3 speed.`,
    estimate: true,
  },
];

export const SETUP_WSL_STEPS: SetupWslStep[] = [
  {
    id: 'cards',
    title: 'Confirm the card is on AMD’s WSL2 / Radeon matrix',
    body:
      'ROCm 10.1.0 compatibility matrix lists WSL2 as an operating-system choice next to Ubuntu, RHEL, and Windows. The Radeon table names AI PRO R9000 (gfx1201), RX 9000 (gfx1200 / gfx1201), PRO W7000 (gfx1100), RX 7000 (gfx1101), PRO V Series (gfx1102), and PRO W6000 (gfx1030). The same table names Adrenalin 26.10.41.05 and Windows 11 25H2. The install selector also lists Ubuntu 26.04, 24.04, and 22.04 as WSL2 guests. If your SKU is not on that matrix, stop — do not invent support. House measured SKU is still one R9700 on bare-metal Ubuntu, not WSL.',
    links: [
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/gpus', label: 'GPU directory' },
      { href: '/rocm', label: 'What is ROCm' },
      { href: '/rocm/versions', label: 'ROCm versions' },
    ],
  },
  {
    id: 'host-driver',
    title: 'Install the Windows host Adrenalin driver first',
    body:
      'AMD’s 10.1 blog: install the Windows driver, then install ROCm in the Ubuntu guest. The GPU reaches the guest through paravirtualization, not a native Linux amdgpu DKMS in WSL. AMD’s 10.1 install page points at the Adrenalin / ROCm 10.1 download note (RN-RAD-ROCM-10-01). The matrix names Adrenalin 26.10.41.05 on the Radeon row — we do not invent a different pin. Confirm the discrete Radeon in AMD Software or Device Manager before you open a guest. BIOS notes (Above 4G, ReBAR/SAM, CSM off) still apply on the same board. Cited, not measured on the local desktop.',
    links: [
      { href: '/setup/windows', label: 'Windows setup (Vulkan first)' },
      { href: '/bios', label: 'BIOS' },
      { href: '/hardware', label: 'Hardware' },
      { href: '/rocm-problems/windows-wsl-preview', label: 'Windows / WSL2 preview' },
    ],
  },
  {
    id: 'wsl-ubuntu',
    title: 'Install WSL2 and a listed Ubuntu guest',
    body: `Microsoft: open PowerShell as administrator and run ${SETUP_WSL_WSL_INSTALL}, then restart. That enables WSL and installs Ubuntu. To pick a guest AMD names, run wsl --list --online and wsl --install -d with a listed Ubuntu 26.04, 24.04, or 22.04 distro — do not invent a slug. Confirm VERSION 2 with ${SETUP_WSL_WSL_LIST}. New installs default to WSL 2; wsl --set-version Ubuntu 2 upgrades an older WSL 1 guest. AMD’s 10.1 install page: WSL support is a Technical Preview and you may hit known issues. Finish the rest of ROCm inside that guest, not in PowerShell.`,
    links: [
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/setup/fedora', label: 'Fedora setup' },
      { href: '/setup/arch', label: 'Arch setup' },
      { href: '/tutorials/install-rocm', label: 'Install ROCm (Linux)' },
    ],
  },
  {
    id: 'gpu-visible',
    title: 'Check that the GPU is visible in the guest',
    body: `AMD’s 10.1 notes: ROCr detects WSL2 by looking for /dev/dxg and loads librocdxg. In the guest, ${SETUP_WSL_DXG} should list that device. Then ${SETUP_WSL_ROCMINFO} — the 10.1 verify block prints “WSL2 environment detected.” and an HSA GPU agent. AMD SMI on WSL2 is discovery and monitoring only; ${SETUP_WSL_AMD_SMI} is the cited check, and amd-smi event is not supported. KFD-dependent tools that need /dev/kfd or amdgpu sysfs topology are out of scope. ${SETUP_WSL_KFD} may be missing — that is a cited preview limit, not a reason to file “ROCm is broken on Radeon.” If rocminfo never prints the WSL2 line or no GPU agent appears, stop and use /setup/windows Vulkan or bare-metal /setup.`,
    links: [
      { href: '/tutorials/verify-rocm', label: 'Verify ROCm' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/rocm-problems/windows-wsl-preview', label: 'Windows / WSL2 preview' },
    ],
  },
  {
    id: 'rocm-guest',
    title: 'Install ROCm 10.1 in the Ubuntu guest',
    body:
      'Follow AMD’s Install ROCm 10.1.0 page for the WSL2 + Ubuntu selector — Ubuntu .deb and Python wheels, not RPM. Register the ROCm 10.1 apt repo AMD documents, then install the gfx meta package that matches the card (amdrocm10.1-gfx1201 for the house R9700 generation). Do not apt install rocm from Ubuntu’s archive. Do not install a native Linux amdgpu DKMS into the guest; the Windows host already owns the display driver. AMD lists profiling packages as installable but unavailable on WSL2. After packages land, rerun rocminfo. Cited, not measured on the local desktop.',
    links: [
      { href: '/tutorials/install-rocm', label: 'Install ROCm' },
      { href: '/rocm/versions', label: 'ROCm versions' },
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/setup', label: 'Ubuntu setup (measured)' },
    ],
  },
  {
    id: 'llamacpp',
    title: 'Build llama.cpp with HIP — first engine in the guest',
    body: `llama.cpp’s build.md documents the Linux HIP path: ${SETUP_WSL_HIP_CMAKE}. GPU_TARGETS is optional; omit it so CMake targets GPUs on the box, or set the gfx AMD lists for your SKU (house R9700 is gfx1201). After the build, serve the house file with the same flags we use on Ubuntu: ${SETUP_WSL_SERVER_CMD}. Those flags are the house daily-driver set — not a WSL tok/s. llama.cpp does not document Vulkan-in-WSL as a first path, so we do not invent one. Native Windows Vulkan stays on /setup/windows. Confirm curl -s http://127.0.0.1:8080/v1/models before a harness.`,
    links: [
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/backends', label: 'Backends' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
      { href: '/setup/windows', label: 'Windows Vulkan' },
    ],
  },
  {
    id: 'quant',
    title: 'Pick Q6, Q5, or Q4 — Q3 is a labeled estimate',
    body: `Download the same official-instruct GGUF the Linux recipes name. House file is ${SETUP_WSL_HOUSE_FILE}. Start at Q6, Q5, or Q4 and size VRAM + KV on the calculator. Q3 stays a cited labeled estimate unless a WSL run card exists — none does. Q1/Q2 stay off. Tok/s, VRAM, and RAM on /benchmarks and /results are Ubuntu llama-bench on the local desktop. Treat them as comparison, not a WSL promise. Stay on the house Qwen3.6 family already on /models.`,
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
    title: 'Keep the GGUF on the Linux filesystem, not /mnt/c',
    body:
      'Microsoft’s WSL environment guide: store project files in the Linux file system, not on a Windows drive mounted under /mnt. Prefill stalls with an idle GPU meter are often the disk. Staging is not RAM offload. House Linux warns off /mnt/bulk; the WSL equivalent is “do not serve a GGUF from /mnt/c.” Put the file in ~/models inside the guest. Not measured on the local desktop.',
    links: [
      { href: '/glossary', label: 'Glossary (NVMe staging)' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/gpus/r9700', label: 'R9700' },
    ],
  },
  {
    id: 'fit',
    title: 'Fit VRAM and the two RAM lines',
    body: `Wherever a file spills, the two labels stay ${RAM_MIN_LABEL} (the load at the context you picked) and ${RAM_FULL_LABEL} (262144 for the house 35B). Overnight UD-Q5 one-GPU Ubuntu peaks are 37.32 GB at 4K and 42.9 GB at 256K — measured on llama.cpp on the local desktop, not inside WSL. Label estimate unless measured. Microsoft documents .wslconfig memory= (default 50% of Windows RAM) at %UserProfile%\\.wslconfig; run wsl --shutdown after edits. We do not invent a recommended pin. If the guest looks RAM-starved, read that file before you blame ROCm.`,
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/long-context', label: 'Long context' },
      { href: '/benchmarks', label: 'Benchmarks' },
    ],
  },
  {
    id: 'breaks',
    title: 'When it breaks — KFD, driver mismatch, .wslconfig',
    body:
      'No /dev/kfd: expected on this preview. AMD says KFD-dependent tooling is out of scope; do not file “ROCm is broken on Radeon.” Fall back to /setup/windows Vulkan or bare-metal /setup. Driver mismatch: host Adrenalin must be the 10.1 Windows driver AMD names; guest packages must be the 10.1 Ubuntu .deb path — do not mix a native Linux amdgpu DKMS into WSL. Memory limits: Microsoft’s .wslconfig memory= caps the WSL 2 VM (default 50% of Windows RAM). AMD’s known issues mention that key only as a Valgrind-specific workaround, not a llama.cpp pin. Start from /troubleshoot. Cited rows live on /rocm-problems/windows-wsl-preview. Firmware: /bios. Jargon: /glossary. Short answers: /faq.',
    links: [
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/troubleshoot/errors', label: 'Error paste' },
      { href: '/rocm-problems/windows-wsl-preview', label: 'Windows / WSL2 preview' },
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/faq', label: 'FAQ' },
      { href: '/glossary', label: 'Glossary' },
    ],
  },
];

export const SETUP_WSL_HOWTO_STEPS = SETUP_WSL_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const SETUP_WSL_HUB_LINKS: SetupWslLink[] = [
  { href: '/setup', label: 'Ubuntu setup (measured)' },
  { href: '/setup/windows', label: 'Windows Vulkan' },
  { href: '/setup/fedora', label: 'Fedora' },
  { href: '/setup/arch', label: 'Arch' },
  { href: '/rocm-problems/windows-wsl-preview', label: 'WSL2 preview problem' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/setup/comfyui', label: 'ComfyUI' },
  { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp' },
];

export const REQUIRED_SETUP_WSL_HREFS = [
  '/setup',
  '/setup/windows',
  '/setup/fedora',
  '/setup/arch',
  '/gpus/r9700',
  '/backends/llamacpp',
  '/calculator',
  '/models/qwen36',
  '/rocm/vulkan-hip',
  '/rocm-problems/windows-wsl-preview',
  '/troubleshoot',
  '/faq',
  '/glossary',
  '/bios',
  '/long-context',
] as const;

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function setupWslBlob(): string {
  return [
    SETUP_WSL_CITED_LABEL,
    ...SETUP_WSL_TRACKS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_WSL_STEPS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_WSL_QUANTS.map((row) => `${row.quant} ${row.role} ${row.note}`),
    SETUP_WSL_HIP_CMAKE,
    SETUP_WSL_SERVER_CMD,
  ].join('\n');
}

export function setupWslHrefs(): string[] {
  const links = [
    ...SETUP_WSL_HUB_LINKS,
    ...SETUP_WSL_STEPS.flatMap((step) => step.links),
    ...SETUP_WSL_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

export function assertSetupWslValid(): string[] {
  const errors: string[] = [];
  const blob = setupWslBlob();
  const hrefs = new Set(setupWslHrefs());
  if (SETUP_WSL_CITED_LABEL !== 'Cited, not measured on the local desktop') {
    errors.push('cited label drifted');
  }
  if (SETUP_WSL_TRACKS.length !== 3) errors.push('need linux, windows, and WSL tracks');
  if (!SETUP_WSL_TRACKS.find((row) => row.id === 'linux')?.recommend) {
    errors.push('native Linux should be the try');
  }
  if (SETUP_WSL_TRACKS.find((row) => row.id === 'windows')?.recommend) {
    errors.push('Windows Vulkan must not be the first-run try on this page');
  }
  if (SETUP_WSL_TRACKS.find((row) => row.id === 'wsl')?.recommend) {
    errors.push('WSL must not be recommended');
  }
  if (SETUP_WSL_STEPS.length < 8) errors.push('checklist too short');
  if (SETUP_WSL_QUANTS.length !== 4) errors.push('need Q6 Q5 Q4 Q3 rows');
  if (!SETUP_WSL_QUANTS.some((row) => row.quant === COMPARE_Q3 && row.estimate)) {
    errors.push('Q3 must be a labeled estimate');
  }
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (!/llama\.cpp/i.test(blob)) errors.push('must say llama.cpp');
  if (!/GGML_HIP=ON/.test(blob)) errors.push('must cite HIP CMake');
  if (!/technical preview/i.test(blob)) errors.push('WSL must stay a technical preview');
  if (!/\/dev\/kfd/.test(blob)) errors.push('must mention /dev/kfd');
  if (!/\/dev\/dxg/.test(blob)) errors.push('must mention /dev/dxg');
  if (!/\.wslconfig/.test(blob)) errors.push('must mention .wslconfig');
  if (!/not invent a Vulkan-in-WSL/.test(blob) && !/do not invent one/.test(blob)) {
    errors.push('must not invent Vulkan-in-WSL');
  }
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) {
    errors.push('RAM lines missing');
  }
  if (!/102\.39/.test(blob)) errors.push('must cite measured llama.cpp decode');
  if (!/not inside WSL/i.test(blob)) errors.push('must label llama.cpp numbers as not inside WSL');
  if (/\bmeasured in WSL\b|\bWSL decode \d/i.test(blob)) {
    errors.push('must not claim WSL tok/s');
  }
  if (!/not measured on the local desktop/i.test(blob)) errors.push('must say not measured on the local desktop');
  if (!/26\.10\.41\.05/.test(blob)) errors.push('must cite Adrenalin version AMD names');
  for (const source of SETUP_WSL_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_SETUP_WSL_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return [...new Set(errors)];
}
