/**
 * Cited consumer guide for local image generation on Radeon.
 * ComfyUI first (HIP/ROCm PyTorch). llama.cpp stays first for LLMs.
 * No invented tok/s, seconds-per-image, VRAM megabytes, or prices.
 */

import { CONSUMER_NAV_LINKS } from './consumer-gpu';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';

export const IMAGE_GEN_PUBLISHED = '2026-10-13';
export const IMAGE_GEN_CITED_LABEL = 'Cited, not measured on local-desktop';
export const IMAGE_GEN_SPEED_LABEL = 'not yet measured by AMDai';

export type ImageGenLink = { href: string; label: string };

export type ImageGenSource = {
  id: string;
  title: string;
  href: string;
};

export type ImageGenFamily = {
  id: string;
  name: string;
  params: string;
  cardNote: string;
  href: string;
};

export type ImageGenFitRow = {
  id: string;
  vramClass: string;
  cards: ImageGenLink[];
  fit: string;
  speed: string;
};

export type ImageGenStep = {
  id: string;
  title: string;
  body: string;
  links: ImageGenLink[];
};

export type ImageGenError = {
  id: string;
  title: string;
  body: string;
  links: ImageGenLink[];
};

export const IMAGE_GEN_TITLE = 'Local image gen on Radeon';
export const IMAGE_GEN_DESCRIPTION =
  'Cited ComfyUI-first guide for Stable Diffusion, SDXL, and Flux-class models on Radeon. Linux ROCm PyTorch first. Fit estimates, not measured on local-desktop.';

export const IMAGE_GEN_LEAD = `
  Local image generation means a diffusion checkpoint runs on your own GPU and
  writes a picture from a prompt — Stable Diffusion, SDXL, or Flux-class
  families — without sending the job to a hosted API. On AMDai the first
  engine is ComfyUI: a node graph on HIP/ROCm PyTorch. It already runs on the
  local-desktop R9700 box. It is not llama.cpp Vulkan, and it does not speak
  llama-server or Strata /v1. llama.cpp stays first for local LLMs.
`.replace(/\s+/g, ' ').trim();

export const IMAGE_GEN_SOURCES: ImageGenSource[] = [
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
    id: 'hip-sdk',
    title: 'AMD — HIP SDK for Windows',
    href: 'https://rocm.docs.amd.com/projects/install-on-windows/en/latest/index.html',
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
  {
    id: 'sdxl',
    title: 'Stable Diffusion XL base 1.0 model card',
    href: 'https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0',
  },
  {
    id: 'flux',
    title: 'FLUX.1 [dev] model card',
    href: 'https://huggingface.co/black-forest-labs/FLUX.1-dev',
  },
];

export const IMAGE_GEN_FAMILIES: ImageGenFamily[] = [
  {
    id: 'sd15',
    name: 'Stable Diffusion 1.5',
    params: '0.9B params (F32 on the card)',
    cardNote:
      'Official card lists 0.9B parameters and names the ema-only safetensors as using less VRAM for inference. Training resolution on the card is 512×512. No published VRAM-gigabyte figure.',
    href: 'https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5',
  },
  {
    id: 'sdxl',
    name: 'Stable Diffusion XL',
    params: '3B params (F32 on the card; fp16 variant documented)',
    cardNote:
      'Official card lists 3B parameters and documents pipe.enable_model_cpu_offload when GPU VRAM is limited. No published VRAM-gigabyte figure.',
    href: 'https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0',
  },
  {
    id: 'flux',
    name: 'FLUX.1 [dev]',
    params: '12B params (BF16 on the card)',
    cardNote:
      'Official card is a 12 billion parameter rectified-flow transformer and documents enable_model_cpu_offload to save VRAM. The same card names ComfyUI for local inference. No published VRAM-gigabyte figure.',
    href: 'https://huggingface.co/black-forest-labs/FLUX.1-dev',
  },
];

export const IMAGE_GEN_FIT_ROWS: ImageGenFitRow[] = [
  {
    id: '32gb',
    vramClass: '32 GB discrete',
    cards: [{ href: '/gpus/r9700', label: 'Radeon AI PRO R9700' }],
    fit: 'Estimate. Most discrete headroom on this list for SD 1.5, SDXL, and Flux-class checkpoints. Publisher cards do not publish a VRAM-gigabyte number; resolution, batch, VAE, and attention still decide a run.',
    speed: IMAGE_GEN_SPEED_LABEL,
  },
  {
    id: '24gb',
    vramClass: '24 GB discrete',
    cards: [{ href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX' }],
    fit: 'Estimate. More VRAM than the 20 / 16 / 12 GB classes. SD 1.5 and SDXL are the more likely families; a 12B BF16 Flux-class file is a larger checkpoint than 3B SDXL — still an estimate.',
    speed: IMAGE_GEN_SPEED_LABEL,
  },
  {
    id: '20gb',
    vramClass: '20 GB discrete',
    cards: [{ href: '/gpus/rx-7900-xt', label: 'RX 7900 XT' }],
    fit: 'Estimate. Between the 24 GB and 16 GB classes. Same families; Flux-class is tighter than SDXL. Confirm the 20 GB sticker before you assume a 24 GB fit.',
    speed: IMAGE_GEN_SPEED_LABEL,
  },
  {
    id: '16gb',
    vramClass: '16 GB discrete',
    cards: [
      { href: '/gpus/rx-9070-xt', label: 'RX 9070 XT' },
      { href: '/gpus/rx-9070', label: 'RX 9070' },
      { href: '/gpus/rx-9060-xt', label: 'RX 9060 XT' },
      { href: '/gpus/rx-7900-gre', label: 'RX 7900 GRE' },
      { href: '/gpus/rx-7800-xt', label: 'RX 7800 XT' },
      { href: '/gpus/rx-7600-xt', label: 'RX 7600 XT' },
      { href: '/gpus/rx-6800-xt', label: 'RX 6800 XT' },
      { href: '/gpus/rx-6950-xt', label: 'RX 6950 XT / 6900 XT' },
    ],
    fit: 'Estimate. SD 1.5 is the more likely family. SDXL may need a lower resolution or the CPU-offload path the SDXL card documents. Flux-class 12B BF16 is tighter on 16 GB than on 24 / 32 GB.',
    speed: IMAGE_GEN_SPEED_LABEL,
  },
  {
    id: '12gb',
    vramClass: '12 GB discrete',
    cards: [
      { href: '/gpus/rx-7700-xt', label: 'RX 7700 XT' },
      { href: '/gpus/rx-9070-gre', label: 'RX 9070 GRE' },
      { href: '/gpus/rx-6700-xt', label: 'RX 6700 XT' },
    ],
    fit: 'Estimate. SD 1.5 is the more likely family. SDXL is tighter. Flux-class is unlikely without the offload the Flux card documents. Confirm the 12 GB sticker.',
    speed: IMAGE_GEN_SPEED_LABEL,
  },
  {
    id: '8gb',
    vramClass: '8 GB discrete',
    cards: [{ href: '/gpus/rx-7600', label: 'RX 7600' }],
    fit: 'Estimate. 8 GB is tighter than the 12 / 16 GB sheets. SD 1.5 is the more likely family. Confirm the 8 GB sticker — this is not the 16 GB RX 7600 XT.',
    speed: IMAGE_GEN_SPEED_LABEL,
  },
  {
    id: 'strix-halo',
    vramClass: 'Shared memory (Strix Halo)',
    cards: [{ href: '/gpus/strix-halo', label: 'Ryzen AI Max+ 395 / Radeon 8060S' }],
    fit: 'Estimate. This APU drinks from the same DIMMs the OS uses — not a discrete VRAM sticker. Size the kit on the Strix Halo sheet. Do not treat it as a 32 GB card.',
    speed: IMAGE_GEN_SPEED_LABEL,
  },
];

export const IMAGE_GEN_LINUX_STEPS: ImageGenStep[] = [
  {
    id: 'os',
    title: 'Ubuntu 24.04+ first',
    body:
      'Bare-metal Ubuntu 24.04+ is the AMDai measured path for ROCm on local-desktop. Image-gen follows that OS even though we have no first-party image-gen card yet. See the GPU in rocminfo before you download a checkpoint. Windows is a cited second path, not the first try.',
    links: [
      { href: '/setup', label: 'First-run setup' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/gpus', label: 'GPU directory' },
    ],
  },
  {
    id: 'pytorch',
    title: 'ROCm PyTorch wheels',
    body:
      'ComfyUI needs a ROCm-enabled PyTorch in the same Python environment. AMD’s Install PyTorch for ROCm page documents wheels and Docker. PyTorch’s Get started locally matrix is the official wheel picker: choose Linux, Python, pip, and ROCm. Instinct-oriented Docker tags are not R9700 pins. We do not invent a wheel version.',
    links: [
      { href: 'https://rocm.docs.amd.com/projects/ai-ecosystem/en/latest/frameworks/pytorch/install.html', label: 'AMD PyTorch for ROCm' },
      { href: 'https://pytorch.org/get-started/locally/', label: 'PyTorch get started' },
      { href: '/tutorials/install-rocm', label: 'Install ROCm' },
    ],
  },
  {
    id: 'comfy',
    title: 'Install ComfyUI from the official repo',
    body:
      'AMD’s ComfyUI page: clone https://github.com/comfyanonymous/ComfyUI.git, activate the ROCm PyTorch venv, then pip install -r ComfyUI/requirements.txt. Start with python ComfyUI/main.py. The official prompt is To see the GUI go to: http://127.0.0.1:8188. Do not treat Instinct Docker tags as a R9700 pin.',
    links: [
      { href: 'https://rocm.docs.amd.com/projects/ai-ecosystem/en/latest/inference/comfy.html', label: 'AMD ComfyUI on ROCm' },
      { href: 'https://github.com/comfyanonymous/ComfyUI', label: 'ComfyUI repo' },
      { href: '/harnesses/image', label: 'ComfyUI harness card' },
    ],
  },
  {
    id: 'checkpoint',
    title: 'Pick a family the card can hold',
    body:
      'VRAM limits which family you try first. Cite the publisher card for parameter count and dtype. Fit on a given SKU is an estimate unless AMDai measured it — we have not. Start smaller (SD 1.5) on 12 / 16 GB class cards. The 32 GB R9700 has the most discrete headroom on this list. Seconds-per-image stay not yet measured by AMDai.',
    links: [
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/wanted', label: 'Wanted (amdai-bench gap)' },
      { href: '/amdai-bench', label: 'amdai-bench' },
    ],
  },
];

export const IMAGE_GEN_WINDOWS_STEPS: ImageGenStep[] = [
  {
    id: 'windows-official',
    title: 'What AMD and ComfyUI officially document',
    body:
      'AMD’s ComfyUI page documents a Windows install after ROCm-enabled PyTorch: pip install -r ComfyUI\\requirements.txt, then python ComfyUI\\main.py, same 127.0.0.1:8188 GUI. That page also warns ComfyUI might not start if Smart App Control is enabled. HIP SDK for Windows is AMD’s documented Windows runtime subset. The Radeon limitations page is Windows PyTorch-only, with WSL caveats. Cited, not measured on local-desktop.',
    links: [
      { href: '/setup/windows', label: 'Windows setup' },
      { href: 'https://rocm.docs.amd.com/projects/ai-ecosystem/en/latest/inference/comfy.html', label: 'AMD ComfyUI on ROCm' },
      { href: 'https://rocm.docs.amd.com/projects/install-on-windows/en/latest/index.html', label: 'HIP SDK for Windows' },
      { href: 'https://rocm.docs.amd.com/projects/radeon-ryzen/en/docs-7.2/docs/limitations/limitationsrad.html', label: 'Radeon limitations' },
    ],
  },
  {
    id: 'windows-wheels',
    title: 'PyTorch wheels stay Linux-first',
    body:
      'PyTorch’s official Get started locally matrix is the wheel picker AMDai cites. The ROCm wheel path AMD documents is Linux + pip + ROCm. Do not invent a Windows ROCm pip pin. Ubuntu 24.04+ on bare metal is still the path that matches local-desktop. WSL2 ROCm is a technical preview on the 10.1 notes — not a measured image-gen path.',
    links: [
      { href: 'https://pytorch.org/get-started/locally/', label: 'PyTorch get started' },
      { href: '/setup', label: 'Ubuntu setup' },
      { href: '/rocm-problems/windows-wsl-preview', label: 'Windows / WSL2 preview' },
    ],
  },
  {
    id: 'windows-unofficial',
    title: 'Unofficial Windows shortcuts',
    body:
      'Community Windows wrappers, DirectML forks, and translation layers that AMD, ComfyUI, or PyTorch do not document stay unofficial. AMDai does not walk them and does not invent a Windows seconds-per-image. If the official AMD page does not list the step, stop.',
    links: [
      { href: '/setup/windows', label: 'Windows setup' },
      { href: '/troubleshoot#windows', label: 'Windows symptoms' },
    ],
  },
];

export const IMAGE_GEN_ERRORS: ImageGenError[] = [
  {
    id: 'hip-not-found',
    title: 'HIP / ROCm not found',
    body:
      'ComfyUI is HIP/ROCm PyTorch. If the process never sees /dev/kfd, or PyTorch reports no GPU, you are on CPU. Check groups, the device nodes, and the wheel’s gfx list. This is not a llama.cpp Vulkan miss.',
    links: [
      { href: '/troubleshoot#groups-kfd', label: 'Groups and /dev/kfd' },
      { href: '/troubleshoot#cpu-fallback', label: 'CPU fallback' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
    ],
  },
  {
    id: 'oom',
    title: 'Out of memory',
    body:
      'A checkpoint that loads can still OOM at a high resolution or batch. Publisher cards document CPU offload for SDXL and Flux when VRAM is limited. We do not invent a megabyte figure. Lower resolution or batch first. If a local LLM shares the same card, read /multi-gpu and the calculator — do not stack two full VRAM loads and guess.',
    links: [
      { href: '/troubleshoot#oom-context', label: 'OOM / context' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'wrong-gfx',
    title: 'Wrong gfx target / HSA_OVERRIDE_GFX_VERSION',
    body:
      'AMD’s PyTorch install page documents hipErrorNoBinaryForGpu when the wheel or build omits the current gfx. HSA_OVERRIDE_GFX_VERSION is an unofficial way to boot a binary on a gfx the build did not list — a research path, not a recommendation. Current gfx1201 cards should not need it on ROCm 10.x. Confirm rocminfo before you override.',
    links: [
      { href: '/troubleshoot#wrong-gfx', label: 'Wrong gfx' },
      { href: '/troubleshoot/errors#no-binary-for-gpu', label: 'No binary for GPU' },
      { href: '/rocm-problems/hip-no-binary-for-gpu', label: 'HIP no binary' },
    ],
  },
];

export const IMAGE_GEN_SECTIONS = [
  { id: 'what-it-is', label: 'What it is' },
  { id: 'vram', label: 'VRAM and families' },
  { id: 'fit', label: 'GPU-class fit' },
  { id: 'linux', label: 'Linux path' },
  { id: 'windows', label: 'Windows path' },
  { id: 'alongside', label: 'Alongside a local LLM' },
  { id: 'errors', label: 'When it breaks' },
  { id: 'sources', label: 'Sources' },
] as const;

export const IMAGE_GEN_HUB_LINKS: ImageGenLink[] = [
  { href: '/harnesses/image', label: 'ComfyUI harness' },
  { href: '/setup', label: 'Ubuntu setup' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/multi-gpu', label: 'Dual / multi-GPU' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/stack-lab', label: 'Stack Lab' },
  { href: '/faq', label: 'FAQ' },
];

export const REQUIRED_IMAGE_GEN_HREFS = [
  '/harnesses/image',
  '/setup',
  '/setup/windows',
  '/gpus/r9700',
  '/gpus/strix-halo',
  '/gpus/rx-7900-xtx',
  '/gpus/rx-7900-xt',
  '/gpus/rx-7800-xt',
  '/gpus/rx-9070-xt',
  '/gpus/rx-9070',
  '/gpus/rx-9070-gre',
  '/gpus/rx-9060-xt',
  '/gpus/rx-7900-gre',
  '/gpus/rx-7700-xt',
  '/gpus/rx-7600-xt',
  '/gpus/rx-7600',
  '/gpus/rx-6800-xt',
  '/gpus/rx-6950-xt',
  '/gpus/rx-6700-xt',
  '/multi-gpu',
  '/calculator',
  '/troubleshoot',
  '/troubleshoot/errors',
  '/stack-lab',
  '/wanted',
  '/amdai-bench',
  '/faq',
] as const;

export const IMAGE_GEN_HOWTO_STEPS = [
  ...IMAGE_GEN_LINUX_STEPS,
  ...IMAGE_GEN_WINDOWS_STEPS,
].map((step) => ({
  name: step.title,
  text: step.body,
}));

export const IMAGE_GEN_ALONGSIDE = `
  A local LLM on llama.cpp Vulkan and ComfyUI on HIP/ROCm PyTorch can share a
  box. They do not share a /v1. On one card, VRAM is one pool — do not invent
  a split. Size the LLM in the calculator; image-gen VRAM stays an estimate.
  ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL} are the shopper RAM lines for the
  LLM. A 64 GB kit estimate is the consumer shopper default (8 GB OS/desktop
  plus 16 GB headroom plus whatever the LLM offload and PyTorch need) —
  labeled estimate, not a measured ComfyUI peak. On a second card, read
  /multi-gpu. We have not measured image-gen-plus-LLM on local-desktop.
`.replace(/\s+/g, ' ').trim();

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function imageGenBlob(): string {
  return [
    IMAGE_GEN_TITLE,
    IMAGE_GEN_DESCRIPTION,
    IMAGE_GEN_LEAD,
    IMAGE_GEN_CITED_LABEL,
    IMAGE_GEN_SPEED_LABEL,
    IMAGE_GEN_ALONGSIDE,
    ...IMAGE_GEN_FAMILIES.map((row) => `${row.name} ${row.params} ${row.cardNote}`),
    ...IMAGE_GEN_FIT_ROWS.map((row) => `${row.vramClass} ${row.fit} ${row.speed}`),
    ...IMAGE_GEN_LINUX_STEPS.map((row) => `${row.title} ${row.body}`),
    ...IMAGE_GEN_WINDOWS_STEPS.map((row) => `${row.title} ${row.body}`),
    ...IMAGE_GEN_ERRORS.map((row) => `${row.title} ${row.body}`),
  ].join('\n');
}

export function imageGenHrefs(): string[] {
  const links: ImageGenLink[] = [
    ...IMAGE_GEN_HUB_LINKS,
    ...IMAGE_GEN_FIT_ROWS.flatMap((row) => row.cards),
    ...IMAGE_GEN_LINUX_STEPS.flatMap((step) => step.links),
    ...IMAGE_GEN_WINDOWS_STEPS.flatMap((step) => step.links),
    ...IMAGE_GEN_ERRORS.flatMap((row) => row.links),
    ...IMAGE_GEN_SOURCES.map((source) => ({ href: source.href, label: source.title })),
    ...CONSUMER_NAV_LINKS,
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

export function assertImageGenValid(): string[] {
  const errors: string[] = [];
  const blob = imageGenBlob();
  const hrefs = new Set(imageGenHrefs());
  if (IMAGE_GEN_CITED_LABEL !== 'Cited, not measured on local-desktop') errors.push('cited label drifted');
  if (IMAGE_GEN_SPEED_LABEL !== 'not yet measured by AMDai') errors.push('speed label drifted');
  if (!blob.includes(IMAGE_GEN_SPEED_LABEL)) errors.push('must say not yet measured by AMDai');
  if (!/ComfyUI/i.test(blob)) errors.push('must name ComfyUI');
  if (!/llama\.cpp/i.test(blob)) errors.push('must keep llama.cpp in view');
  if (!/HIP\/ROCm PyTorch/i.test(blob)) errors.push('must say HIP/ROCm PyTorch');
  if (!/not speak/i.test(blob) && !/does not speak/i.test(blob)) errors.push('must say ComfyUI does not speak /v1');
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (/\b\d+(?:\.\d+)?\s*(?:tok\/s|it\/s|sec\/img|s\/img|images?\/s)\b/i.test(blob)) {
    errors.push('invented image-gen speed');
  }
  if (/\b\d+\s*MB\b/.test(blob)) errors.push('invented VRAM megabytes');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) {
    errors.push('RAM lines missing');
  }
  if (!/unofficial/i.test(blob)) errors.push('Windows unofficial path must be marked');
  if (!/Smart App Control/i.test(blob)) errors.push('must cite AMD Smart App Control caveat');
  if (IMAGE_GEN_FIT_ROWS.some((row) => row.speed !== IMAGE_GEN_SPEED_LABEL)) {
    errors.push('every fit row must use the unmeasured speed label');
  }
  if (IMAGE_GEN_FIT_ROWS.some((row) => !/estimate/i.test(row.fit))) {
    errors.push('every fit row must be labeled estimate');
  }
  for (const source of IMAGE_GEN_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_IMAGE_GEN_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  const fitHrefs = IMAGE_GEN_FIT_ROWS.flatMap((row) => row.cards.map((card) => card.href));
  for (const href of [
    '/gpus/r9700',
    '/gpus/rx-7900-xtx',
    '/gpus/rx-7900-xt',
    '/gpus/rx-7800-xt',
    '/gpus/rx-9070-xt',
    '/gpus/rx-9070',
    '/gpus/rx-9070-gre',
    '/gpus/rx-9060-xt',
    '/gpus/rx-7900-gre',
    '/gpus/rx-7700-xt',
    '/gpus/rx-7600-xt',
    '/gpus/rx-7600',
    '/gpus/rx-6800-xt',
    '/gpus/rx-6950-xt',
    '/gpus/rx-6700-xt',
    '/gpus/strix-halo',
  ]) {
    if (!fitHrefs.includes(href)) errors.push(`fit table missing ${href}`);
  }
  return [...new Set(errors)];
}
