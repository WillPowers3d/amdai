/**
 * Cited ComfyUI first-run on Radeon.
 * Not measured on local-desktop. Official sources only: ComfyUI docs/GitHub,
 * AMD ComfyUI + PyTorch-for-ROCm pages. Image gen is HIP/ROCm PyTorch.
 * llama.cpp stays first for LLMs. ComfyUI does not speak llama-server /v1.
 * Do not invent seconds-per-image, prices, VRAM megabytes, or flags.
 */

import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';

export const SETUP_COMFYUI_PUBLISHED = '2026-10-14';
export const SETUP_COMFYUI_CITED_LABEL = 'Cited, not measured on local-desktop';
export const SETUP_COMFYUI_SPEED_LABEL = 'not yet measured by AMDai';

export const SETUP_COMFYUI_UI = 'http://127.0.0.1:8188';
export const SETUP_COMFYUI_CLONE = 'git clone https://github.com/comfyanonymous/ComfyUI.git';
export const SETUP_COMFYUI_VENV = 'python3 -m venv .venv && source .venv/bin/activate';
export const SETUP_COMFYUI_LINUX_TORCH =
  'pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm7.2';
export const SETUP_COMFYUI_PIP = 'pip install -r ComfyUI/requirements.txt';
export const SETUP_COMFYUI_RUN = 'python ComfyUI/main.py';
export const SETUP_COMFYUI_CHECKPOINTS = 'ComfyUI/models/checkpoints';
export const SETUP_COMFYUI_STARTER = 'v1-5-pruned-emaonly-fp16.safetensors';
export const SETUP_COMFYUI_PORTABLE_AMD = 'ComfyUI_windows_portable_amd.7z';

export type SetupComfyuiLink = { href: string; label: string };

export type SetupComfyuiSource = {
  id: string;
  title: string;
  href: string;
};

export type SetupComfyuiTrack = {
  id: 'linux' | 'windows';
  title: string;
  recommend: boolean;
  body: string;
};

export type SetupComfyuiStep = {
  id: string;
  title: string;
  body: string;
  links: SetupComfyuiLink[];
};

export type SetupComfyuiQuant = {
  quant: string;
  role: string;
  note: string;
  estimate: boolean;
};

export const SETUP_COMFYUI_SOURCES: SetupComfyuiSource[] = [
  {
    id: 'amd-comfy',
    title: 'AMD — ComfyUI image generation on ROCm',
    href: 'https://rocm.docs.amd.com/projects/ai-ecosystem/en/latest/inference/comfy.html',
  },
  {
    id: 'comfy-repo',
    title: 'ComfyUI repository',
    href: 'https://github.com/comfyanonymous/ComfyUI',
  },
  {
    id: 'comfy-reqs',
    title: 'ComfyUI — system requirements',
    href: 'https://docs.comfy.org/installation/system_requirements',
  },
  {
    id: 'comfy-first',
    title: 'ComfyUI — first image generation',
    href: 'https://docs.comfy.org/get_started/first_generation',
  },
  {
    id: 'amd-pytorch',
    title: 'AMD — Install PyTorch for ROCm',
    href: 'https://rocm.docs.amd.com/projects/ai-ecosystem/en/latest/frameworks/pytorch/install.html',
  },
  {
    id: 'pytorch-get-started',
    title: 'PyTorch — Get started locally',
    href: 'https://pytorch.org/get-started/locally/',
  },
  {
    id: 'radeon-limits',
    title: 'AMD — Radeon limitations (Windows PyTorch-only; WSL caveats)',
    href: 'https://rocm.docs.amd.com/projects/radeon-ryzen/en/docs-7.2/docs/limitations/limitationsrad.html',
  },
  {
    id: 'sd15',
    title: 'Stable Diffusion v1-5 model card',
    href: 'https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5',
  },
];

export const SETUP_COMFYUI_TRACKS: SetupComfyuiTrack[] = [
  {
    id: 'linux',
    title: 'Ubuntu 24.04+ git clone — the first try',
    recommend: true,
    body: `
      AMD’s ComfyUI page: ${SETUP_COMFYUI_CLONE}, activate a ROCm-enabled
      PyTorch venv, ${SETUP_COMFYUI_PIP}, then ${SETUP_COMFYUI_RUN}. Official
      prompt: To see the GUI go to: ${SETUP_COMFYUI_UI}. ComfyUI’s README
      Linux AMD pin is ${SETUP_COMFYUI_LINUX_TORCH}. That is their documented
      ROCm 7.2 wheel, not a house 10.1 llama.cpp pin — /rocm/versions stays
      the measured ROCm line for this site’s GGUF path. Confirm rocminfo and
      that PyTorch sees the GPU before you download a checkpoint. Instinct
      Docker tags are not R9700 pins. ComfyUI has no official Docker image.
      Not measured on local-desktop.
    `.replace(/\s+/g, ' ').trim(),
  },
  {
    id: 'windows',
    title: 'Windows — cited second path',
    recommend: false,
    body: `
      AMD’s ComfyUI page documents Windows after ROCm-enabled PyTorch:
      pip install -r ComfyUI\\requirements.txt, then python ComfyUI\\main.py,
      same ${SETUP_COMFYUI_UI}. Smart App Control can block start. ComfyUI’s
      README now ships ${SETUP_COMFYUI_PORTABLE_AMD} and a Windows ROCm 10.0
      multi-architecture PyTorch example (device-gfx1201 for R9700 / RX 9070
      XT). Official docs also list RDNA 2 / 3 / 3.5 / 4. The Nvidia portable
      is not a Radeon path. HIP SDK is AMD’s documented Windows runtime
      subset; ComfyUI’s Windows ROCm 10.0 note says a separate HIP SDK is
      not needed when you use those wheels. Cited, not measured on local-desktop.
    `.replace(/\s+/g, ' ').trim(),
  },
];

export const SETUP_COMFYUI_QUANTS: SetupComfyuiQuant[] = [
  {
    quant: 'Q6_K',
    role: 'LLM sibling only — not a ComfyUI checkpoint',
    note: 'If a local LLM shares the box, start at Q6 on llama.cpp. Measured Ubuntu llama.cpp decode lives on /benchmarks. We do not invent a ComfyUI tok/s or seconds-per-image.',
    estimate: false,
  },
  {
    quant: 'UD-Q5_K_XL',
    role: 'House LLM default on one R9700',
    note: 'House daily-driver GGUF on llama.cpp Vulkan. ComfyUI does not load that file. Size the LLM on the calculator before you also load a diffusion checkpoint on the same card.',
    estimate: false,
  },
  {
    quant: 'Q4_K_M',
    role: 'Smaller measured 35B sibling',
    note: 'Still an LLM pick. Diffusion checkpoints are safetensors / ckpt, not GGUF Q4. Image-gen speeds stay not yet measured by AMDai.',
    estimate: false,
  },
  {
    quant: COMPARE_Q3,
    role: 'Cited Q3 option — labeled estimate',
    note: `${COMPARE_Q3_CITE}. Q3 stays a labeled estimate on the LLM side. Nothing below Q3. We do not invent a ComfyUI Q3 or an image-gen quant ladder.`,
    estimate: true,
  },
];

export const SETUP_COMFYUI_STEPS: SetupComfyuiStep[] = [
  {
    id: 'os',
    title: 'Ubuntu 24.04+ first — see the GPU before you clone',
    body: `Bare-metal Ubuntu 24.04+ is the AMDai measured ROCm path. Image-gen follows that OS even though we have no first-party ComfyUI card yet. AMD’s page assumes ROCm-enabled PyTorch on a supported system. Confirm rocminfo prints an HSA GPU agent, and that /dev/kfd and /dev/dri exist and your user is in the right groups. Windows is a cited second path. WSL2 ROCm is a 10.1 technical preview at /setup/wsl — not a measured image-gen path. Fedora and Arch have their own cited first-run pages; we do not invent a ComfyUI tok/s on those.`,
    links: [
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/tutorials/install-rocm', label: 'Install ROCm' },
      { href: '/tutorials/verify-rocm', label: 'Verify ROCm' },
      { href: '/rocm/versions', label: 'ROCm versions' },
      { href: '/gpus/r9700', label: 'R9700' },
    ],
  },
  {
    id: 'venv',
    title: 'Python venv + ROCm PyTorch — cite the wheel, do not invent a pin',
    body: `ComfyUI runs in its own Python environment. Official docs recommend Python 3.13, with 3.12 as a fallback if a custom-node dep fails. Create a venv: ${SETUP_COMFYUI_VENV}. ComfyUI’s README Linux AMD command is ${SETUP_COMFYUI_LINUX_TORCH}. AMD’s Install PyTorch for ROCm page and PyTorch’s Get started locally matrix (Linux, Python, pip, ROCm) are the official AMD/PyTorch pickers. House /rocm/versions is the 10.1 line for this site’s llama.cpp path — we do not invent a 10.1 ComfyUI wheel. Instinct-oriented Docker tags are not R9700 pins. If PyTorch reports no GPU, stop.`,
    links: [
      { href: 'https://rocm.docs.amd.com/projects/ai-ecosystem/en/latest/frameworks/pytorch/install.html', label: 'AMD PyTorch for ROCm' },
      { href: 'https://pytorch.org/get-started/locally/', label: 'PyTorch get started' },
      { href: '/rocm/versions', label: 'ROCm versions' },
      { href: '/tutorials/install-rocm', label: 'Install ROCm' },
    ],
  },
  {
    id: 'install',
    title: 'Clone ComfyUI and install requirements',
    body: `AMD’s page: ${SETUP_COMFYUI_CLONE}, activate the ROCm PyTorch venv, then ${SETUP_COMFYUI_PIP}. ComfyUI’s README says the same after you are inside the clone: pip install -r requirements.txt. Do not treat community Docker Hub images as official — ComfyUI documents that it has no official Docker image. Desktop AppImage / .deb exists on docs.comfy.org; AMDai’s first walk is the git clone AMD publishes so the venv stays the ROCm wheel you just installed.`,
    links: [
      { href: 'https://rocm.docs.amd.com/projects/ai-ecosystem/en/latest/inference/comfy.html', label: 'AMD ComfyUI on ROCm' },
      { href: 'https://github.com/comfyanonymous/ComfyUI', label: 'ComfyUI repo' },
      { href: '/harnesses/image', label: 'ComfyUI harness' },
      { href: '/image-gen', label: 'Image-gen fit hub' },
    ],
  },
  {
    id: 'ui',
    title: 'First-run UI at :8188',
    body: `Start with ${SETUP_COMFYUI_RUN}. Official prompt: To see the GUI go to: ${SETUP_COMFYUI_UI}. Open that URL on the same box. ComfyUI is a node graph on HIP/ROCm PyTorch. It does not speak llama-server or Strata /v1 — do not paste ${SETUP_COMFYUI_UI} into a chat harness. llama.cpp stays first for LLMs. Image-in text-out is /vision, not this page.`,
    links: [
      { href: '/image-gen', label: 'Image gen on Radeon' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/harnesses/image', label: 'ComfyUI harness' },
      { href: '/vision', label: 'Vision (mmproj)' },
    ],
  },
  {
    id: 'workflow',
    title: 'Pick a starter workflow — SD 1.5 first',
    body: `ComfyUI’s first-generation guide: the default text-to-image graph usually loads on launch. The documented starter checkpoint is ${SETUP_COMFYUI_STARTER}. AMD’s page also names Template → Model Filter → SD3.5 → SD3.5 Simple, and Chroma → Chroma1 Radiance, then download missing models. Start smaller (SD 1.5) on 8 / 12 / 16 GB class cards. Size the family on /image-gen. Do not invent seconds-per-image. Queue with Run or Ctrl+Enter as their docs describe.`,
    links: [
      { href: 'https://docs.comfy.org/get_started/first_generation', label: 'ComfyUI first generation' },
      { href: '/image-gen', label: 'Image-gen families' },
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/gpus/rx-9070-xt', label: 'RX 9070 XT' },
    ],
  },
  {
    id: 'checkpoints',
    title: 'Put checkpoints on fast NVMe — models/checkpoints',
    body: `Official first-generation page: models live under ComfyUI/models/ with subfolders checkpoints, embeddings, vae, lora, and extra_model_paths.yaml for more roots. README: put SD checkpoints in models/checkpoints and VAE in models/vae. Git-clone path is ${SETUP_COMFYUI_CHECKPOINTS}. Keep files on fast NVMe (house ~/models or the clone’s models/), not a spinning disk and not a slow bulk mount such as /mnt/bulk. Staging is not RAM offload. Refresh with R after you drop a file. Not measured on local-desktop.`,
    links: [
      { href: '/glossary', label: 'Glossary (NVMe staging)' },
      { href: '/image-gen', label: 'Image gen' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'fit',
    title: 'VRAM fit is an estimate — reuse the /image-gen classes',
    body: `Publisher cards do not publish a VRAM-gigabyte figure. /image-gen already maps 32 / 24 / 20 / 16 / 12 / 8 GB discrete classes plus Strix Halo shared memory. 32 GB R9700 has the most discrete headroom on that list. Start SD 1.5 on 8 / 12 / 16 GB. Flux-class 12B BF16 is tighter than SDXL. Seconds-per-image stay ${SETUP_COMFYUI_SPEED_LABEL}. Do not copy a tok/s from the 35B llama.cpp table.`,
    links: [
      { href: '/image-gen', label: 'Image-gen fit table' },
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX' },
      { href: '/wanted', label: 'Wanted (amdai-bench gap)' },
      { href: '/amdai-bench', label: 'amdai-bench' },
    ],
  },
  {
    id: 'ram',
    title: 'System RAM — both shopper labels, KV only on the LLM',
    body: `${RAM_MIN_LABEL} is a kit estimate rounded to a real size. For a consumer box that may also run a local LLM, the /image-gen default is a 64 GB kit (8 GB OS/desktop plus 16 GB headroom plus whatever the LLM offload and PyTorch need) — labeled estimate, not a measured ComfyUI peak. ${RAM_FULL_LABEL} applies to the llama.cpp KV window, not to a diffusion graph. ComfyUI has no llama.cpp -c. If you are image-gen only, omit the full-context line and keep the min-kit estimate. If an LLM shares the box, show both labels on the LLM. GB here is Linux GiB printed as GB.`,
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/image-gen', label: 'Image gen (alongside LLM)' },
      { href: '/long-context', label: 'Long context' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
    ],
  },
  {
    id: 'portable',
    title: 'Portable and Desktop notes — do not take the Nvidia zip on Radeon',
    body: `ComfyUI’s README: Windows portable Nvidia is for Nvidia or CPU-only. The AMD zip is ${SETUP_COMFYUI_PORTABLE_AMD}. Desktop exists for Windows, macOS, and Linux (AppImage / .deb) and tracks stable; portable or git gets latest commits. AMDai’s Linux first try stays the AMD-documented git clone so the venv is the ROCm wheel. Community DirectML forks and unofficial wrappers stay unofficial. Cited, not measured on local-desktop.`,
    links: [
      { href: '/setup/windows', label: 'Windows setup' },
      { href: 'https://github.com/comfyanonymous/ComfyUI', label: 'ComfyUI README' },
      { href: 'https://docs.comfy.org/installation/system_requirements', label: 'ComfyUI requirements' },
    ],
  },
  {
    id: 'multi',
    title: 'Two cards — no invented ComfyUI split',
    body: `The AMD ComfyUI page and ComfyUI README we cite do not walk a two-GPU ComfyUI --tensor-split. We do not invent one. On a second card, read /multi-gpu for the llama.cpp job. A local LLM and ComfyUI can share a box; they do not share a /v1. On one card, VRAM is one pool — do not stack two full loads and guess. We have not measured image-gen-plus-LLM on local-desktop.`,
    links: [
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs two GPU' },
      { href: '/image-gen', label: 'Image gen' },
    ],
  },
  {
    id: 'breaks',
    title: 'When the GPU never lights up',
    body: `ComfyUI is HIP/ROCm PyTorch. If the process never sees /dev/kfd, or PyTorch reports no GPU, you are on CPU. Check groups, device nodes, and the wheel’s gfx list. This is not a llama.cpp Vulkan miss. OOM: lower resolution or batch; SDXL and Flux cards document CPU offload. Wrong gfx / hipErrorNoBinaryForGpu: /rocm-problems/hip-no-binary-for-gpu. HSA_OVERRIDE_GFX_VERSION is unofficial — ComfyUI’s README names it for some 6700 / 7600 cases; gfx1201 on ROCm 10.x should not need it. Smart App Control on Windows is AMD’s cited start-block. Start from /troubleshoot.`,
    links: [
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/troubleshoot/errors', label: 'Error paste' },
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/rocm-problems/hip-no-binary-for-gpu', label: 'HIP no binary' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
];

export const SETUP_COMFYUI_HOWTO_STEPS = SETUP_COMFYUI_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const SETUP_COMFYUI_HUB_LINKS: SetupComfyuiLink[] = [
  { href: '/image-gen', label: 'Image-gen fit hub' },
  { href: '/setup', label: 'Ubuntu setup (measured)' },
  { href: '/harnesses/image', label: 'ComfyUI harness' },
  { href: '/rocm/versions', label: 'ROCm versions' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/multi-gpu', label: 'Dual / multi-GPU' },
  { href: '/setup/windows', label: 'Windows' },
  { href: '/setup/wsl', label: 'WSL2' },
  { href: '/calculator', label: 'Calculator' },
];

export const REQUIRED_SETUP_COMFYUI_HREFS = [
  '/setup',
  '/setup/windows',
  '/setup/wsl',
  '/image-gen',
  '/harnesses/image',
  '/backends/llamacpp',
  '/rocm/versions',
  '/rocm-problems',
  '/troubleshoot',
  '/gpus/r9700',
  '/gpus/rx-9070-xt',
  '/multi-gpu',
  '/calculator',
  '/vision',
  '/wanted',
  '/amdai-bench',
  '/faq',
] as const;

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function setupComfyuiBlob(): string {
  return [
    SETUP_COMFYUI_CITED_LABEL,
    SETUP_COMFYUI_SPEED_LABEL,
    ...SETUP_COMFYUI_TRACKS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_COMFYUI_STEPS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_COMFYUI_QUANTS.map((row) => `${row.quant} ${row.role} ${row.note}`),
    SETUP_COMFYUI_CLONE,
    SETUP_COMFYUI_RUN,
  ].join('\n');
}

export function setupComfyuiHrefs(): string[] {
  const links = [
    ...SETUP_COMFYUI_HUB_LINKS,
    ...SETUP_COMFYUI_STEPS.flatMap((step) => step.links),
    ...SETUP_COMFYUI_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

export function assertSetupComfyuiValid(): string[] {
  const errors: string[] = [];
  const blob = setupComfyuiBlob();
  const hrefs = new Set(setupComfyuiHrefs());
  if (SETUP_COMFYUI_CITED_LABEL !== 'Cited, not measured on local-desktop') {
    errors.push('cited label drifted');
  }
  if (SETUP_COMFYUI_SPEED_LABEL !== 'not yet measured by AMDai') {
    errors.push('speed label drifted');
  }
  if (SETUP_COMFYUI_TRACKS.length !== 2) errors.push('need Linux and Windows tracks');
  if (!SETUP_COMFYUI_TRACKS.find((row) => row.id === 'linux')?.recommend) {
    errors.push('Linux should be the try');
  }
  if (SETUP_COMFYUI_TRACKS.find((row) => row.id === 'windows')?.recommend) {
    errors.push('Windows must not be the first-run try');
  }
  if (SETUP_COMFYUI_STEPS.length < 9) errors.push('checklist too short');
  if (SETUP_COMFYUI_QUANTS.length !== 4) errors.push('need Q6 Q5 Q4 Q3 rows');
  if (!SETUP_COMFYUI_QUANTS.some((row) => row.quant === COMPARE_Q3 && row.estimate)) {
    errors.push('Q3 must be a labeled estimate');
  }
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (/\b\d+(?:\.\d+)?\s*(?:tok\/s|it\/s|sec\/img|s\/img|images?\/s)\b/i.test(blob)) {
    errors.push('invented image-gen speed');
  }
  if (/\b\d+\s*MB\b/.test(blob)) errors.push('invented VRAM megabytes');
  if (!/ComfyUI/i.test(blob)) errors.push('must name ComfyUI');
  if (!/llama\.cpp/i.test(blob)) errors.push('must keep llama.cpp in view');
  if (!/HIP\/ROCm PyTorch/i.test(blob)) errors.push('must say HIP/ROCm PyTorch');
  if (!/does not speak/i.test(blob) && !/not speak/i.test(blob)) {
    errors.push('must say ComfyUI does not speak /v1');
  }
  if (!blob.includes(SETUP_COMFYUI_UI)) errors.push('must cite :8188');
  if (!blob.includes(SETUP_COMFYUI_CLONE)) errors.push('must cite git clone');
  if (!blob.includes('models/checkpoints')) errors.push('must cite checkpoints folder');
  if (!blob.includes(SETUP_COMFYUI_STARTER)) errors.push('must cite SD 1.5 starter');
  if (!blob.includes(SETUP_COMFYUI_PORTABLE_AMD)) errors.push('must cite AMD portable');
  if (!blob.includes('/mnt/bulk')) errors.push('must warn off /mnt/bulk');
  if (!blob.includes('NVMe')) errors.push('must mention NVMe');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) {
    errors.push('RAM lines missing');
  }
  if (!/64 GB/i.test(blob)) errors.push('must cite the 64 GB kit estimate');
  if (!/Smart App Control/i.test(blob)) errors.push('must cite Smart App Control');
  if (!blob.includes(SETUP_COMFYUI_SPEED_LABEL)) errors.push('must say not yet measured by AMDai');
  if (!/no official Docker/i.test(blob)) errors.push('must say no official Docker image');
  for (const source of SETUP_COMFYUI_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_SETUP_COMFYUI_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return [...new Set(errors)];
}
