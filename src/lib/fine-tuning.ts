/**
 * Cited consumer guide for LoRA / QLoRA fine-tuning on Radeon.
 * Training claims come from the tool’s own docs or AMD ROCm docs.
 * Speeds stay “not yet measured on our R9700s”. Q3 is a labeled estimate.
 */

import { CONSUMER_NAV_LINKS } from './consumer-gpu';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';

export const FINE_TUNING_PUBLISHED = '2026-10-14';
export const FINE_TUNING_CITED_LABEL = 'Cited, not measured on local-desktop';
export const FINE_TUNING_SPEED_LABEL = 'not yet measured on our R9700s';

export type FineTuningLink = { href: string; label: string };

export type FineTuningSource = {
  id: string;
  title: string;
  href: string;
};

export type FineTuningStep = {
  id: string;
  title: string;
  body: string;
  links: FineTuningLink[];
};

export type FineTuningTool = {
  id: string;
  name: string;
  support: string;
  cite: string;
  href: string;
};

export type FineTuningVramRow = {
  id: string;
  size: string;
  qlora: string;
  lora: string;
  note: string;
};

export type FineTuningFitRow = {
  id: string;
  vramClass: string;
  cards: FineTuningLink[];
  fit: string;
  speed: string;
};

export type FineTuningFaq = {
  id: string;
  question: string;
  answer: string;
  links: FineTuningLink[];
};

export const FINE_TUNING_TITLE = 'Fine-tuning on Radeon';
export const FINE_TUNING_DESCRIPTION =
  'Cited LoRA / QLoRA on consumer Radeon. PyTorch ROCm, Unsloth, PEFT/TRL. Not yet measured on our R9700s. Q3 is a labeled estimate.';

export const FINE_TUNING_LEAD = `
  Fine-tuning here means LoRA or QLoRA (4-bit) on a consumer Radeon, then
  export back to a GGUF for llama.cpp. PyTorch ROCm wheels exist. Tooling
  that officially documents AMD or ROCm support is listed with its cite.
  Anything a tool does not state, or that we have not run on local-desktop, stays
  not verified on Radeon. Training speed is ${FINE_TUNING_SPEED_LABEL}.
`.replace(/\s+/g, ' ').trim();

export const AMD_PYTORCH =
  'https://rocm.docs.amd.com/projects/ai-ecosystem/en/latest/frameworks/pytorch/install.html';
export const AMD_PYTORCH_INDEX = 'https://stable.repo.amd.com/rocm/whl-next/';
export const AMD_PLAYBOOK = 'https://developer.amd.com/playbooks/pytorch-finetuning/';
export const AMD_AXOLOTL = 'https://rocm.blogs.amd.com/artificial-intelligence/axolotl/README.html';
export const AMD_TORCHTUNE =
  'https://rocm.docs.amd.com/projects/ai-developer-hub/en/latest/notebooks/fine_tune/torchtune_llama3.html';
export const AMD_PEFT_TRL =
  'https://rocm.docs.amd.com/en/latest/how-to/rocm-for-ai/fine-tuning/single-gpu-fine-tuning-and-inference.html';
export const UNSLOTH_AMD = 'https://unsloth.ai/docs/get-started/install/amd/amd';
export const UNSLOTH_AMD_INSTALL = 'https://unsloth.ai/docs/get-started/install/amd';
export const UNSLOTH_VRAM =
  'https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements';
export const AXOLOTL_DOCS = 'https://docs.axolotl.ai/';
export const TORCHTUNE_README = 'https://github.com/meta-pytorch/torchtune/blob/main/README.md';
export const HF_PEFT = 'https://huggingface.co/docs/trl/en/peft_integration';
export const LLAMA_CONVERT =
  'https://github.com/ggml-org/llama.cpp/blob/master/convert_hf_to_gguf.py';
export const LLAMA_QUANTIZE =
  'https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md';

export const FINE_TUNING_SOURCES: FineTuningSource[] = [
  { id: 'amd-pytorch', title: 'AMD — Install PyTorch for ROCm', href: AMD_PYTORCH },
  { id: 'amd-playbook', title: 'AMD AI Playbooks — Fine-tuning LLMs with PyTorch and ROCm', href: AMD_PLAYBOOK },
  { id: 'unsloth-amd', title: 'Unsloth — Train and run models on AMD GPUs', href: UNSLOTH_AMD },
  { id: 'unsloth-vram', title: 'Unsloth — Fine-tuning VRAM requirements', href: UNSLOTH_VRAM },
  { id: 'axolotl', title: 'Axolotl documentation', href: AXOLOTL_DOCS },
  { id: 'amd-axolotl', title: 'AMD ROCm blog — Axolotl on AMD GPUs', href: AMD_AXOLOTL },
  { id: 'torchtune', title: 'torchtune README (AMD ROCm listed)', href: TORCHTUNE_README },
  { id: 'amd-torchtune', title: 'AMD — Fine-tune with torchtune', href: AMD_TORCHTUNE },
  { id: 'hf-peft', title: 'Hugging Face TRL — PEFT / QLoRA', href: HF_PEFT },
  { id: 'amd-peft', title: 'AMD ROCm — single-GPU fine-tuning with PEFT / TRL', href: AMD_PEFT_TRL },
  { id: 'llama-convert', title: 'llama.cpp convert_hf_to_gguf.py', href: LLAMA_CONVERT },
  { id: 'llama-quantize', title: 'llama.cpp tools/quantize', href: LLAMA_QUANTIZE },
];

export const FINE_TUNING_WHAT = `
  LoRA keeps the base weights frozen and trains small adapter matrices.
  QLoRA loads the base in 4-bit and still trains those adapters. Hugging Face
  PEFT/TRL document both. Unsloth documents AMD hardware, including Radeon
  RX 9000 / 7000, Strix Halo, and bitsandbytes QLoRA. AMD’s Radeon playbook
  walks PEFT + TRL LoRA and QLoRA on a Radeon GPU. After training, merge the
  adapter, convert to GGUF with llama.cpp, then serve with llama-server.
  llama.cpp stays first for inference. Training speed is ${FINE_TUNING_SPEED_LABEL}.
`.replace(/\s+/g, ' ').trim();

export const FINE_TUNING_TOOLS: FineTuningTool[] = [
  {
    id: 'pytorch',
    name: 'PyTorch ROCm wheels',
    support:
      'AMD documents pip install from its ROCm wheel index. Match the gfx extra AMD lists for your card and the ROCm line already on /rocm/versions. Do not invent a wheel pin.',
    cite: 'AMD — Install PyTorch for ROCm',
    href: AMD_PYTORCH,
  },
  {
    id: 'unsloth',
    name: 'Unsloth',
    support:
      'Unsloth’s AMD page: train, fine-tune, RL, and deploy on AMD GPUs. RDNA 4 (RX 9000, gfx1200/1201), RDNA 3 (RX 7000), and Strix Halo are listed Full on Windows + WSL + Linux. QLoRA via bitsandbytes. Install path: uv pip install "unsloth[amd]" after pinning the ROCm torch you already installed.',
    cite: 'Unsloth AMD docs',
    href: UNSLOTH_AMD,
  },
  {
    id: 'peft-trl',
    name: 'Hugging Face PEFT / TRL',
    support:
      'HF TRL documents LoRA and QLoRA (load_in_4bit). That page is not Radeon-specific. AMD’s Radeon playbook uses Transformers + PEFT + TRL on an AMD Radeon GPU (example: google/gemma-3-4b-it). AMD’s ROCm how-to uses PEFT + TRL on Instinct. Consumer Radeon PEFT/TRL beyond that playbook is not verified on Radeon.',
    cite: 'AMD AI Playbooks + HF TRL PEFT',
    href: AMD_PLAYBOOK,
  },
  {
    id: 'axolotl',
    name: 'Axolotl',
    support:
      'Axolotl’s own docs list “NVIDIA GPU or AMD GPU” as a requirement. AMD’s ROCm blog walks Axolotl on Instinct (Llama 3), not a consumer Radeon. Axolotl on a home Radeon is not verified on Radeon.',
    cite: 'Axolotl docs + AMD ROCm blog',
    href: AXOLOTL_DOCS,
  },
  {
    id: 'torchtune',
    name: 'torchtune',
    support:
      'The torchtune README lists AMD ROCm among custom devices. AMD’s notebook is Instinct MI300X. torchtune on a consumer Radeon is not verified on Radeon.',
    cite: 'torchtune README + AMD notebook',
    href: TORCHTUNE_README,
  },
];

export const FINE_TUNING_VRAM_NOTE = `
  Unsloth publishes an absolute-minimum VRAM table: QLoRA is 4-bit, LoRA is
  16-bit, and “sometimes more VRAM is required depending on the model.”
  Those numbers are Unsloth’s table, not a local-desktop measurement and not a
  consumer-Radeon run. AMD’s Radeon playbook (Gemma 3 4B) says LoRA and
  QLoRA need at least 16 GB dedicated GPU memory and 32 GB system RAM, and
  that Linux does not fall back to shared GPU memory when VRAM runs out.
  House 35B MoE is not in Unsloth’s dense-parameter table — we do not invent
  a 35B training fit.
`.replace(/\s+/g, ' ').trim();

export const FINE_TUNING_VRAM_ROWS: FineTuningVramRow[] = [
  {
    id: '7b',
    size: '7B',
    qlora: '5 GB',
    lora: '19 GB',
    note: 'Unsloth absolute minimum. Not a Radeon measurement.',
  },
  {
    id: '14b',
    size: '14B',
    qlora: '8.5 GB',
    lora: '33 GB',
    note: 'Unsloth absolute minimum. 16-bit LoRA is above one 16 GB card.',
  },
  {
    id: '27b',
    size: '27B',
    qlora: '22 GB',
    lora: '64 GB',
    note: 'Unsloth absolute minimum. Maps to /models/gemma3-27b, /models/qwen36-27b, /models/qwen38-27b as shopper pages — not a training measurement.',
  },
  {
    id: '32b',
    size: '32B',
    qlora: '26 GB',
    lora: '76 GB',
    note: 'Unsloth absolute minimum. One 32 GB R9700 has the VRAM class for QLoRA only.',
  },
  {
    id: '70b',
    size: '70B',
    qlora: '41 GB',
    lora: '164 GB',
    note: 'Unsloth absolute minimum. Above one 32 GB card. No cited dual-R9700 training split. /models/llama33-70b is the inference sheet.',
  },
];

export const FINE_TUNING_STEPS: FineTuningStep[] = [
  {
    id: 'ubuntu',
    title: 'Start on Ubuntu 24.04+ with the site ROCm pin',
    body:
      'Ubuntu 24.04+ is the measured AMDai OS. Install ROCm from the pin already on /rocm/versions — do not invent a new version. Confirm the GPU with rocminfo / amd-smi before you download a base model. The install walkthrough is /tutorials/install-rocm.',
    links: [
      { href: '/setup', label: 'Ubuntu setup' },
      { href: '/rocm/versions', label: 'ROCm versions' },
      { href: '/tutorials/install-rocm', label: 'Install ROCm' },
    ],
  },
  {
    id: 'venv-torch',
    title: 'venv, then a ROCm PyTorch wheel',
    body: `python3 -m venv .venv && source .venv/bin/activate. Then install torch from AMD’s documented index ${AMD_PYTORCH_INDEX} — pick the gfx extra AMD lists for your card (gfx1201 on the R9700) and the ROCm line on /rocm/versions. AMD’s Radeon playbook example for gfx1201 is torch[device-gfx1201] from that index. A plain pip install torch from PyPI is the CUDA build.`,
    links: [
      { href: '/rocm/versions', label: 'ROCm versions' },
      { href: '/image-gen', label: 'Image gen (also PyTorch ROCm)' },
    ],
  },
  {
    id: 'tool',
    title: 'Install a cited LoRA / QLoRA tool',
    body:
      'Unsloth: pin the ROCm torch you just installed, then uv pip install "unsloth[amd]" with those pins so PyPI does not swap in CUDA torch. PEFT / TRL: AMD’s Radeon playbook installs transformers, accelerate, peft, trl, and bitsandbytes on Linux. Axolotl and torchtune stay not verified on Radeon for a home card.',
    links: [
      { href: '/models', label: 'House models' },
      { href: '/models/gemma3-27b', label: 'Gemma 3 27B' },
    ],
  },
  {
    id: 'reset',
    title: 'If the R9700 resets under ROCm 10.0 training',
    body:
      'The dated /rocm-problems row: living notes mention a ROCm 10.0 training / fine-tune GPU-reset class on the R9700 and a first mitigation of TORCH_BLAS_PREFER_HIPBLASLT=0. The AMD KI URL is still not recorded. Do not apply that variable to llama.cpp Vulkan inference. Training speed stays not yet measured on our R9700s.',
    links: [
      { href: '/rocm-problems/rocm-10-0-finetune-reset', label: 'Fine-tune reset' },
      { href: '/rocm-problems', label: 'ROCm problems' },
    ],
  },
  {
    id: 'windows',
    title: 'Windows is a second path',
    body:
      'Inference first-run on Windows is /setup/windows — llama.cpp Vulkan, not measured on local-desktop. WSL2 ROCm is a 10.1 technical preview at /setup/wsl. Unsloth’s AMD page lists Windows + WSL + Linux for RDNA 3/4. AMD’s Radeon playbook: bitsandbytes is not well supported on Windows, so QLoRA is Linux-only there; Windows uses LoRA or full fine-tuning. Unsloth: AMD multi-GPU training is Linux-only. We have not measured training on Windows or WSL.',
    links: [
      { href: '/setup/windows', label: 'Windows setup' },
      { href: '/setup/wsl', label: 'WSL2 setup' },
      { href: '/rocm-problems/windows-wsl-preview', label: 'Windows / WSL preview' },
    ],
  },
  {
    id: 'export',
    title: 'Merge, convert to GGUF, quantize, serve',
    body: `AMD’s playbook merges with PEFT merge_and_unload and save_pretrained. Then llama.cpp: python convert_hf_to_gguf.py ./merged --outfile merged-f16.gguf. Quantize with llama-quantize to Q6_K, Q5_K_M, or Q4_K_M. A Q3_K_M row is a labeled estimate — cite /quants; do not run Q2 or Q1. The convert / imatrix / quantize walk is /guides/quantize-gguf. Serve: llama-server -m merged-q5_k_m.gguf --host 127.0.0.1 --port 8080. Size the GGUF on /calculator. Where RAM offload appears, the shopper lines are ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL}.`,
    links: [
      { href: '/guides/quantize-gguf', label: 'Make GGUF quants' },
      { href: '/quants', label: 'Quants' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/models', label: 'House models' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
];

export const FINE_TUNING_FIT_ROWS: FineTuningFitRow[] = [
  {
    id: '16gb',
    vramClass: '16 GB class',
    cards: [
      { href: '/gpus/rx-9070-xt', label: 'RX 9070 XT' },
      { href: '/gpus/rx-9070', label: 'RX 9070' },
      { href: '/gpus/rx-9060-xt', label: 'RX 9060 XT' },
      { href: '/gpus/rx-7600-xt', label: 'RX 7600 XT' },
      { href: '/gpus/rx-6800-xt', label: 'RX 6800 XT' },
      { href: '/gpus/rx-6950-xt', label: 'RX 6950 XT / 6900 XT' },
      { href: '/gpus/rx-7900-gre', label: 'RX 7900 GRE' },
      { href: '/gpus/rx-7800-xt', label: 'RX 7800 XT' },
    ],
    fit: 'AMD playbook (Gemma 3 4B): LoRA / QLoRA need at least 16 GB dedicated VRAM and 32 GB system RAM; Linux does not spill to shared GPU memory. Unsloth 14B QLoRA minimum is 8.5 GB; Unsloth 27B QLoRA minimum is 22 GB — above this class. No cited consumer-Radeon training run. Labeled estimate from those tables only.',
    speed: FINE_TUNING_SPEED_LABEL,
  },
  {
    id: '20-24gb',
    vramClass: '20–24 GB class',
    cards: [
      { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX' },
      { href: '/gpus/rx-7900-xt', label: 'RX 7900 XT' },
    ],
    fit: 'Unsloth 27B QLoRA minimum is 22 GB. Unsloth 27B LoRA is 64 GB — not this class. AMD playbook LoRA “typical VRAM” for its 4B example is 24–32 GB. Confirm the tool’s own memory notes. Labeled estimate. No cited local-desktop training run.',
    speed: FINE_TUNING_SPEED_LABEL,
  },
  {
    id: '32gb',
    vramClass: '32 GB R9700',
    cards: [{ href: '/gpus/r9700', label: 'R9700' }],
    fit: 'Unsloth 32B QLoRA minimum is 26 GB; 27B QLoRA is 22 GB. Unsloth 70B QLoRA is 41 GB — above one 32 GB card. House 35B MoE is not in Unsloth’s dense table; do not invent a 35B LoRA fit. ROCm 10.0 training reset note is on /rocm-problems. Speed not yet measured on our R9700s.',
    speed: FINE_TUNING_SPEED_LABEL,
  },
  {
    id: 'dual',
    vramClass: 'Dual R9700',
    cards: [
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
    ],
    fit: 'Unsloth documents AMD multi-GPU on Linux and says Windows has no GPU-collective backend yet. Unsloth 70B QLoRA minimum is 41 GB. We have no cited split-across-two-R9700 training number. Dual-card inference stays on /multi-gpu. Not verified on Radeon as a training layout.',
    speed: FINE_TUNING_SPEED_LABEL,
  },
  {
    id: 'apu',
    vramClass: 'Strix Halo / shared memory',
    cards: [{ href: '/gpus/strix-halo', label: 'Strix Halo' }],
    fit: 'Unsloth lists Ryzen AI Max / Strix Halo as Full on Windows + WSL + Linux. AMD’s playbook discusses shared video memory on Ryzen AI Halo. Unsloth does not publish a Strix Halo training VRAM table we can reprint. Not verified on Radeon as a measured training fit.',
    speed: FINE_TUNING_SPEED_LABEL,
  },
];

export const FINE_TUNING_EXPORT = {
  merge: 'from peft import AutoPeftModelForCausalLM\nmodel = AutoPeftModelForCausalLM.from_pretrained("./adapter")\nmerged = model.merge_and_unload()\nmerged.save_pretrained("./merged")',
  convert: 'python convert_hf_to_gguf.py ./merged --outfile merged-f16.gguf',
  quant: 'llama-quantize merged-f16.gguf merged-q6_k.gguf Q6_K\nllama-quantize merged-f16.gguf merged-q5_k_m.gguf Q5_K_M\nllama-quantize merged-f16.gguf merged-q4_k_m.gguf Q4_K_M\n# Q3_K_M is a labeled estimate — see /quants. Do not run Q2 or Q1.\nllama-quantize merged-f16.gguf merged-q3_k_m.gguf Q3_K_M',
  serve: 'llama-server -m merged-q5_k_m.gguf --host 127.0.0.1 --port 8080',
};

export const FINE_TUNING_FAQ: FineTuningFaq[] = [
  {
    id: 'can-i',
    question: 'Can I fine-tune like a 4090 blog post?',
    answer:
      'PyTorch ROCm exists. Unsloth and AMD’s Radeon playbook document LoRA / QLoRA on AMD GPUs. That is not a 4090 decode clone. Training speed is not yet measured on our R9700s. The ROCm 10.0 R9700 reset note is a dated workaround, not a measured tokens-per-second. Keep inference on the llama.cpp pin you already run.',
    links: [
      { href: '/faq#can-i-fine-tune', label: 'Site FAQ' },
      { href: '/rocm-problems/rocm-10-0-finetune-reset', label: 'Fine-tune reset' },
    ],
  },
  {
    id: 'which-tool',
    question: 'Which tool should I start with?',
    answer:
      'Cite Unsloth’s AMD page or AMD’s Radeon PEFT/TRL playbook. Axolotl and torchtune document AMD or ROCm, but their AMD how-tos are Instinct — not verified on Radeon for a home card. Do not start from a retired Qwen line.',
    links: [
      { href: '/models', label: 'House models' },
      { href: '/models/gemma3-27b', label: 'Gemma 3 27B' },
    ],
  },
  {
    id: 'house-35b',
    question: 'Can I LoRA the house 35B daily driver?',
    answer:
      'Unsloth’s VRAM table is dense parameter sizes. Qwen3.6-35B-A3B is MoE and is not in that table. We do not invent a 35B LoRA or QLoRA VRAM number. Use the calculator for inference GGUFs after you export. Q3 stays a labeled estimate.',
    links: [
      { href: '/models/qwen36', label: '35B house model' },
      { href: '/models/llama33-70b', label: 'Llama 3.3 70B' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
];

export const FINE_TUNING_SECTIONS = [
  { id: 'what-it-is', label: 'What works' },
  { id: 'vram', label: 'VRAM' },
  { id: 'linux', label: 'Linux path' },
  { id: 'export', label: 'Export' },
  { id: 'faq', label: 'FAQ' },
  { id: 'sources', label: 'Sources' },
] as const;

export const FINE_TUNING_HUB_LINKS: FineTuningLink[] = [
  { href: '/setup', label: 'Ubuntu setup' },
  { href: '/setup/windows', label: 'Windows setup' },
  { href: '/setup/wsl', label: 'WSL2 setup' },
  { href: '/rocm/versions', label: 'ROCm versions' },
  { href: '/rocm-problems/rocm-10-0-finetune-reset', label: 'Fine-tune reset' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/quants', label: 'Quants' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/models', label: 'House models' },
  { href: '/amdai-bench', label: 'amdai-bench' },
  { href: '/wanted', label: 'Wanted' },
  { href: '/faq', label: 'FAQ' },
];

export const REQUIRED_FINE_TUNING_HREFS = [
  '/setup',
  '/setup/windows',
  '/setup/wsl',
  '/rocm/versions',
  '/rocm-problems/rocm-10-0-finetune-reset',
  '/tutorials/install-rocm',
  '/backends/llamacpp',
  '/gpus/r9700',
  '/gpus/strix-halo',
  '/gpus/rx-7900-xtx',
  '/gpus/rx-7900-xt',
  '/gpus/rx-7800-xt',
  '/gpus/rx-9070-xt',
  '/gpus/rx-9070',
  '/gpus/rx-9060-xt',
  '/gpus/rx-7900-gre',
  '/gpus/rx-7600-xt',
  '/gpus/rx-6800-xt',
  '/gpus/rx-6950-xt',
  '/multi-gpu',
  '/calculator',
  '/models',
  '/models/qwen36',
  '/models/gemma3-27b',
  '/models/llama33-70b',
  '/quants',
  '/guides/quantize-gguf',
  '/wanted',
  '/amdai-bench',
  '/image-gen',
  '/faq',
] as const;

export const FINE_TUNING_HOWTO_STEPS = FINE_TUNING_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export function fineTuningBlob(): string {
  return [
    FINE_TUNING_TITLE,
    FINE_TUNING_DESCRIPTION,
    FINE_TUNING_LEAD,
    FINE_TUNING_CITED_LABEL,
    FINE_TUNING_SPEED_LABEL,
    FINE_TUNING_WHAT,
    FINE_TUNING_VRAM_NOTE,
    ...FINE_TUNING_TOOLS.map((row) => `${row.name} ${row.support}`),
    ...FINE_TUNING_STEPS.map((row) => `${row.title} ${row.body}`),
    ...FINE_TUNING_VRAM_ROWS.map((row) => `${row.size} ${row.qlora} ${row.lora} ${row.note}`),
    ...FINE_TUNING_FIT_ROWS.map((row) => `${row.vramClass} ${row.fit} ${row.speed}`),
    ...FINE_TUNING_FAQ.map((row) => `${row.question} ${row.answer}`),
    FINE_TUNING_EXPORT.merge,
    FINE_TUNING_EXPORT.convert,
    FINE_TUNING_EXPORT.quant,
    FINE_TUNING_EXPORT.serve,
    RAM_MIN_LABEL,
    RAM_FULL_LABEL,
  ].join('\n');
}

export function fineTuningHrefs(): string[] {
  const links: FineTuningLink[] = [
    ...FINE_TUNING_HUB_LINKS,
    ...FINE_TUNING_STEPS.flatMap((step) => step.links),
    ...FINE_TUNING_FIT_ROWS.flatMap((row) => row.cards),
    ...FINE_TUNING_FAQ.flatMap((row) => row.links),
    ...FINE_TUNING_TOOLS.map((tool) => ({ href: tool.href, label: tool.name })),
    ...FINE_TUNING_SOURCES.map((source) => ({ href: source.href, label: source.title })),
    ...CONSUMER_NAV_LINKS,
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertFineTuningValid(): string[] {
  const errors: string[] = [];
  const blob = fineTuningBlob();
  const hrefs = new Set(fineTuningHrefs());
  if (FINE_TUNING_CITED_LABEL !== 'Cited, not measured on local-desktop') errors.push('cited label drifted');
  if (FINE_TUNING_SPEED_LABEL !== 'not yet measured on our R9700s') errors.push('speed label drifted');
  if (FINE_TUNING_DESCRIPTION.length < 70 || FINE_TUNING_DESCRIPTION.length > 160) {
    errors.push('description length');
  }
  if (!/llama\.cpp/i.test(blob)) errors.push('must keep llama.cpp first');
  if (!/llama-server/.test(blob)) errors.push('must cite llama-server');
  if (!/convert_hf_to_gguf/.test(blob)) errors.push('must cite convert_hf_to_gguf');
  if (!/llama-quantize/.test(blob)) errors.push('must cite llama-quantize');
  if (!/Q6_K/.test(blob) || !/Q5_K_M/.test(blob) || !/Q4_K_M/.test(blob)) {
    errors.push('must list Q6_K Q5_K_M Q4_K_M');
  }
  if (!/Q3_K_M/.test(blob)) errors.push('must list Q3_K_M estimate');
  if (!/labeled estimate/.test(blob)) errors.push('Q3 must stay a labeled estimate');
  if (!/unsloth\[amd\]/.test(blob)) errors.push('must cite unsloth[amd]');
  if (!blob.includes(AMD_PYTORCH_INDEX)) errors.push('must cite AMD PyTorch index');
  if (!/TORCH_BLAS_PREFER_HIPBLASLT=0/.test(blob)) errors.push('must cite reset workaround');
  if (!/not verified on Radeon/.test(blob)) errors.push('must mark uncited tools');
  if (BANNED.test(blob)) errors.push('banned model recommended');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (/\b\d+(?:\.\d+)?\s*tok\/s\b/i.test(blob)) errors.push('invented tok/s');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('RAM lines missing');
  if (!blob.includes(FINE_TUNING_SPEED_LABEL)) errors.push('speed label missing');
  if (FINE_TUNING_FIT_ROWS.some((row) => row.speed !== FINE_TUNING_SPEED_LABEL)) {
    errors.push('every fit row must use the unmeasured speed label');
  }
  if (FINE_TUNING_VRAM_ROWS.some((row) => !/Unsloth/.test(row.note))) {
    errors.push('every VRAM row must stay an Unsloth cite');
  }
  for (const source of FINE_TUNING_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_FINE_TUNING_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return [...new Set(errors)];
}
