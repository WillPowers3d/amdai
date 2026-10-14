/**
 * Cited llama.cpp out-of-VRAM troubleshooter on Radeon.
 * Symptom strings are quoted from upstream issues, not invented.
 * Fix ladder is cheapest first. House recipes stay Q4 and up.
 * Q3 is a labeled estimate. Q1/Q2 stay off. llama.cpp Vulkan first.
 */

import { officialLinks } from './site';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';

export const OOM_PATH = '/out-of-vram';
export const OOM_PUBLISHED = '2026-10-14';
export const OOM_CITED_LABEL = 'Cited llama.cpp Vulkan / HIP OOM strings · cheapest fix first';

export const OOM_TITLE = 'Out of VRAM? Fix llama.cpp memory errors';
export const OOM_H1 = 'Out of VRAM? Fix llama.cpp memory errors on a Radeon GPU';
export const OOM_DESCRIPTION =
  'Out of VRAM on a Radeon GPU with llama.cpp. Cited ErrorOutOfDeviceMemory and hipErrorOutOfMemory. Cheapest fix first. Q3 is a labeled estimate.';

export const OOM_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';
export const OOM_RAM_4K = 37.32;
export const OOM_RAM_256K = 42.9;
export const OOM_KIT_GB = 64;
export const OOM_VRAM_4K = 25.97;
export const OOM_VRAM_256K = 29.34;
export const OOM_HOUSE_BENCH =
  '-dev Vulkan1 -sm layer -ngl 99 -fitt 1024 -fa 1 -ctk f16 -ctv f16';

export const LLAMA_CLI_README = 'https://github.com/ggml-org/llama.cpp/blob/HEAD/tools/cli/README.md';
export const LLAMA_MULTI_GPU_MD = 'https://github.com/ggml-org/llama.cpp/blob/master/docs/multi-gpu.md';
export const LLAMA_SERVER_README = 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md';
export const LLAMA_ISSUE_14836 = 'https://github.com/ggml-org/llama.cpp/issues/14836';
export const LLAMA_ISSUE_15120 = 'https://github.com/ggml-org/llama.cpp/issues/15120';
export const LLAMA_ISSUE_9271 = 'https://github.com/ggml-org/llama.cpp/issues/9271';
export const LLAMA_ISSUE_16725 = 'https://github.com/ggml-org/llama.cpp/issues/16725';
export const LLAMA_ISSUE_8618 = 'https://github.com/ggml-org/llama.cpp/issues/8618';
export const OLLAMA_ISSUE_8734 = 'https://github.com/ollama/ollama/issues/8734';
export const AMD_LM_STUDIO_PLAYBOOK = 'https://developer.amd.com/playbooks/lmstudio-rocm-llms/';
export const LM_STUDIO_LOAD = 'https://lmstudio.ai/docs/cli/load';
export const RADEONTOP_REPO = 'https://github.com/clbr/radeontop';
export const ROCM_SMI_CMD = 'rocm-smi --showmeminfo vram --showuse';
export const AMD_SMI_CMD = 'amd-smi';

export type OomLink = { href: string; label: string };

export type OomSource = {
  id: string;
  title: string;
  href: string;
  official: boolean;
};

export type OomFaq = {
  id: string;
  question: string;
  answer: string;
  links: OomLink[];
};

export type OomStep = {
  id: string;
  title: string;
  flag: string;
  body: string;
  links: OomLink[];
};

export type OomSymptom = {
  id: string;
  backend: string;
  quote: string;
  href: string;
  cite: string;
};

export type OomQuantRow = {
  quant: string;
  file: string;
  note: string;
  estimate: boolean;
};

export const OOM_LEAD = `
  Shoppers search llama.cpp out of memory AMD, ErrorOutOfDeviceMemory,
  hipErrorOutOfMemory, and failed to allocate ROCm0 buffer. Those strings
  are quoted from upstream llama.cpp and Ollama issues — AMDai does not
  invent error text. This page is the shopper ladder: cheapest change
  first, then size the file on the calculator. House daily driver is
  ${OOM_HOUSE_FILE} on one R9700, llama.cpp Vulkan, -c 262144, f16 KV,
  -ngl 99, 0% RAM offload. Measured peak VRAM is ${OOM_VRAM_4K} GB at 4K
  and ${OOM_VRAM_256K} GB at 256K. ${RAM_MIN_LABEL} is a ${OOM_KIT_GB} GB
  kit from the measured ${OOM_RAM_4K} GB peak at 4K. ${RAM_FULL_LABEL}
  uses the measured ${OOM_RAM_256K} GB peak at 256K. House recipes stay
  Q4 and up. ${COMPARE_Q3} is a labeled estimate (${COMPARE_Q3_CITE}) —
  do not download Q3 to run. Q1/Q2 stay off. llama.cpp first.
`.replace(/\s+/g, ' ').trim();

export const OOM_WHAT = `
  Out of VRAM is a fit problem: weights plus KV plus compute buffers
  plus whatever else is already on the card. Short context can load
  when long context cannot. The existing /troubleshoot#oom-context row
  is the long-context symptom; this page is the shopper ladder that
  row now points at. Prefer a smaller -c or q8_0 KV before you drop
  the weight quant. HIP / ROCm is the cited second compile — same
  flags, different error prefix (ROCm0 instead of Vulkan0).
`.replace(/\s+/g, ' ').trim();

export const OOM_SYMPTOMS: OomSymptom[] = [
  {
    id: 'vk-alloc-limit',
    backend: 'llama.cpp Vulkan',
    quote: 'ggml_vulkan: Requested buffer size exceeds device memory allocation limit: ErrorOutOfDeviceMemory',
    href: LLAMA_ISSUE_14836,
    cite: 'llama.cpp #14836 (also #15120)',
  },
  {
    id: 'vk-allocate-memory',
    backend: 'llama.cpp Vulkan',
    quote: 'ggml_vulkan: vk::Device::allocateMemory: ErrorOutOfDeviceMemory',
    href: LLAMA_ISSUE_9271,
    cite: 'llama.cpp #9271',
  },
  {
    id: 'vk-gallocr',
    backend: 'llama.cpp Vulkan',
    quote: 'ggml_gallocr_reserve_n: failed to allocate Vulkan0 buffer of size …',
    href: LLAMA_ISSUE_14836,
    cite: 'llama.cpp #14836',
  },
  {
    id: 'vk-pp',
    backend: 'llama.cpp Vulkan',
    quote: 'failed to allocate compute pp buffers',
    href: LLAMA_ISSUE_14836,
    cite: 'llama.cpp #14836',
  },
  {
    id: 'hip-cudaMalloc',
    backend: 'llama.cpp HIP / ROCm',
    quote: 'ggml_backend_cuda_buffer_type_alloc_buffer: allocating … MiB on device 0: cudaMalloc failed: out of memory',
    href: LLAMA_ISSUE_16725,
    cite: 'llama.cpp #16725',
  },
  {
    id: 'hip-rocm0',
    backend: 'llama.cpp HIP / ROCm',
    quote: 'ggml_gallocr_reserve_n: failed to allocate ROCm0 buffer of size …',
    href: LLAMA_ISSUE_16725,
    cite: 'llama.cpp #16725',
  },
  {
    id: 'hip-alloc-tensor',
    backend: 'llama.cpp HIP / ROCm',
    quote: 'alloc_tensor_range: failed to allocate ROCm0 buffer of size …',
    href: LLAMA_ISSUE_16725,
    cite: 'llama.cpp #16725',
  },
  {
    id: 'hip-error-oom',
    backend: 'llama.cpp HIP / ROCm',
    quote: 'hipStreamCreateWithFlags: Returned hipErrorOutOfMemory',
    href: LLAMA_ISSUE_8618,
    cite: 'llama.cpp #8618',
  },
  {
    id: 'ollama-system-ram',
    backend: 'Ollama',
    quote: 'model requires more system memory (X GiB) than is available (Y GiB)',
    href: OLLAMA_ISSUE_8734,
    cite: 'Ollama #8734',
  },
  {
    id: 'lm-studio-wraps',
    backend: 'LM Studio',
    quote: 'LM Studio wraps llama.cpp — AMD shoppers still see the Vulkan or HIP strings above (ErrorOutOfDeviceMemory / failed to allocate ROCm0 buffer / hipErrorOutOfMemory).',
    href: AMD_LM_STUDIO_PLAYBOOK,
    cite: 'AMD LM Studio playbook + llama.cpp issues',
  },
];

export const OOM_VRAM_CHECK = `
  Print GPU RAM per card and the total, plus total system RAM. amd-smi
  is the successor to rocm-smi on the cited ROCm 10.1 blog — new scripts
  should call ${AMD_SMI_CMD}. The house check already on
  /troubleshoot#oom-context is ${ROCM_SMI_CMD}. radeontop is a community
  Radeon GPU utilization viewer (clbr/radeontop). llama.cpp Vulkan prints
  free MiB on load: “llama_model_load_from_file_impl: using device
  Vulkan0 … — NNNNN MiB free” (llama.cpp #14836). HIP prints ROCm0 the
  same way (#16725). A second llama-server, a browser, or a desktop
  compositor reduces that free figure — do not invent a GB leftover.
`.replace(/\s+/g, ' ').trim();

export const OOM_RAM = `
  When -ngl leaves layers on the host, or when MoE experts sit in DDR5,
  the spill is system RAM. Shopper lines stay ${RAM_MIN_LABEL} and
  ${RAM_FULL_LABEL}. On one R9700 with the house UD-Q5 those lines are a
  ${OOM_KIT_GB} GB kit from the measured ${OOM_RAM_4K} GB peak at 4K and
  the measured ${OOM_RAM_256K} GB peak at 256K (Linux GiB labeled GB).
  That house card is 0% RAM offload — do not treat it as a Flash or
  partial-ngl recipe. Other files stay labeled estimate unless a
  measured card overlays the kit. ${COMPARE_Q3} is a labeled estimate.
  Do not download Q3 to run.
`.replace(/\s+/g, ' ').trim();

export const OOM_SERVER = `# Cheapest first after a cited OOM. Replace paths.
# House recipes stay Q4 and up. Do not invent --n-cpu-moe N or -ot regex.
./build-vk/bin/llama-server \\
  -m /path/to/nvme/${OOM_HOUSE_FILE} \\
  -ngl 99 -c 8192 -fa on \\
  --cache-type-k q8_0 --cache-type-v q8_0 \\
  -b 512 -ub 512 --jinja \\
  --host 127.0.0.1 --port 8080`;

export const OOM_SOURCES: OomSource[] = [
  {
    id: 'llama-14836',
    title: 'llama.cpp #14836 — ErrorOutOfDeviceMemory / failed to allocate Vulkan0 buffer / compute pp buffers',
    href: LLAMA_ISSUE_14836,
    official: true,
  },
  {
    id: 'llama-15120',
    title: 'llama.cpp #15120 — Requested buffer size exceeds device memory allocation limit: ErrorOutOfDeviceMemory',
    href: LLAMA_ISSUE_15120,
    official: true,
  },
  {
    id: 'llama-9271',
    title: 'llama.cpp #9271 — vk::Device::allocateMemory: ErrorOutOfDeviceMemory',
    href: LLAMA_ISSUE_9271,
    official: true,
  },
  {
    id: 'llama-16725',
    title: 'llama.cpp #16725 — cudaMalloc failed: out of memory / failed to allocate ROCm0 buffer',
    href: LLAMA_ISSUE_16725,
    official: true,
  },
  {
    id: 'llama-8618',
    title: 'llama.cpp #8618 — hipStreamCreateWithFlags: Returned hipErrorOutOfMemory',
    href: LLAMA_ISSUE_8618,
    official: true,
  },
  {
    id: 'ollama-8734',
    title: 'Ollama #8734 — model requires more system memory (X GiB) than is available (Y GiB)',
    href: OLLAMA_ISSUE_8734,
    official: true,
  },
  {
    id: 'llama-cli',
    title: 'llama.cpp — CLI README (-c, -ctk/-ctv, -fa, -b/-ub, -ngl)',
    href: LLAMA_CLI_README,
    official: true,
  },
  {
    id: 'llama-multi-gpu',
    title: 'llama.cpp — multi-gpu.md (--split-mode, --tensor-split, FA for quantized V)',
    href: LLAMA_MULTI_GPU_MD,
    official: true,
  },
  {
    id: 'llama-server',
    title: 'llama.cpp — llama-server README',
    href: LLAMA_SERVER_README,
    official: true,
  },
  {
    id: 'llama-repo',
    title: 'llama.cpp repository',
    href: officialLinks.llamaCpp,
    official: true,
  },
  {
    id: 'amd-lmstudio',
    title: 'AMD — Running and Serving LLMs with LM Studio',
    href: AMD_LM_STUDIO_PLAYBOOK,
    official: true,
  },
  {
    id: 'lmstudio-load',
    title: 'LM Studio — lms load (GPU offload and context length)',
    href: LM_STUDIO_LOAD,
    official: true,
  },
  {
    id: 'radeontop',
    title: 'radeontop — community Radeon GPU utilization viewer',
    href: RADEONTOP_REPO,
    official: false,
  },
  {
    id: 'amd-smi',
    title: 'ROCm 10.1 blog — amd-smi succeeds rocm-smi',
    href: officialLinks.rocm101Blog,
    official: true,
  },
  {
    id: 'qwen36',
    title: 'Qwen3.6-35B-A3B official model card',
    href: officialLinks.qwen36,
    official: true,
  },
];

export const OOM_QUANTS: OomQuantRow[] = [
  {
    quant: 'Q6_K',
    file: 'Qwen3.6-35B-A3B-Q6_K.gguf',
    note: 'Step down from Q6 only after the cheaper flags. Overnight one-client llama-bench exists on one R9700.',
    estimate: false,
  },
  {
    quant: 'UD-Q5_K_XL',
    file: OOM_HOUSE_FILE,
    note: `House file. Measured peak VRAM ${OOM_VRAM_4K} GB at 4K and ${OOM_VRAM_256K} GB at 256K on one R9700 — in-VRAM at 262144 f16 KV.`,
    estimate: false,
  },
  {
    quant: 'Q4_K_M',
    file: 'Qwen3.6-35B-A3B-Q4_K_M.gguf',
    note: 'Recommended floor for house recipes. Last weight-quant step on this ladder. Overnight one-client llama-bench exists.',
    estimate: false,
  },
  {
    quant: COMPARE_Q3,
    file: 'Qwen3.6-35B-A3B-UD-Q3_K_XL.gguf',
    note: `Labeled estimate (${COMPARE_Q3_CITE}). Do not download Q3 to run. Q3 does not buy VRAM. Q1/Q2 stay off.`,
    estimate: true,
  },
];

export const OOM_STEPS: OomStep[] = [
  {
    id: 'lower-context',
    title: 'Lower -c / --ctx-size first',
    flag: '-c / --ctx-size',
    body: 'Context grows the KV cache. Official CLI is -c / --ctx-size. House daily driver is 262144; a cited OOM at long context is often an 8K or 32K problem, not a “buy a new card” problem. Size the window on the calculator before you change the GGUF. The existing /troubleshoot#oom-context row is this symptom.',
    links: [
      { href: '/long-context', label: 'Long context' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/troubleshoot#oom-context', label: 'Long-context OOM' },
    ],
  },
  {
    id: 'kv-q8',
    title: 'Try q8_0 KV (-ctk / -ctv) with -fa on',
    flag: '-ctk / -ctv q8_0 · needs -fa',
    body: 'Official flags are -ctk / --cache-type-k and -ctv / --cache-type-v. House default is f16. q8_0 shrinks the estimated cache. llama.cpp multi-gpu.md requires flash attention for a quantized V cache — turn -fa on before -ctv q8_0. Quality and tok/s for q8_0 KV stay not measured yet. Do not confuse a KV type with a weight quant.',
    links: [
      { href: '/kv-cache', label: 'KV cache' },
      { href: '/flash-attention', label: 'Flash Attention' },
      { href: '/quants', label: 'Quants · KV types' },
    ],
  },
  {
    id: 'flash-attn',
    title: 'Turn flash attention on (-fa on)',
    flag: '-fa / --flash-attn on',
    body: 'Official CLI is -fa / --flash-attn [on|off|auto] (default auto). Overnight house 35B Vulkan llama-bench recorded -fa 1. llama.cpp multi-gpu.md requires FA for --split-mode tensor and/or a quantized V cache. llama-server FA on versus off stays not measured — do not invent a VRAM delta. Shopper page: /flash-attention.',
    links: [
      { href: '/flash-attention', label: 'Flash Attention' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp' },
    ],
  },
  {
    id: 'smaller-batch',
    title: 'Cut -ub / -b when the compute buffer OOMs',
    flag: '-b / --batch-size and -ub / --ubatch-size',
    body: 'Official flags are -b / --batch-size and -ub / --ubatch-size. llama.cpp #14836 failed on a large Vulkan compute buffer with -b 4096 -ub 4096 (“failed to allocate compute pp buffers”). Cutting the micro-batch shrinks that transient. Overnight 35B llama-bench cards are not a llama-server -b pin — copy a smaller -ub only when your log shows a compute-buffer allocate.',
    links: [
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
  {
    id: 'moe-offload',
    title: 'MoE only: park experts on CPU (--n-cpu-moe / -ot)',
    flag: '--n-cpu-moe / -ot',
    body: `A llama.cpp MoE trick: keep attention on the GPU and park expert tensors in system RAM. The flags are -ot (tensor override regex) and --n-cpu-moe (how many experts stay on CPU). Exact regex and N from the rig owner are not recorded — do not invent flag values. House 35B on one R9700 does not offload. Flash-class files usually do. Print both RAM lines: ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL}. Those lines are labeled estimate unless a measured card overlays the kit.`,
    links: [
      { href: '/moe', label: 'MoE' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/glossary#expert-offload', label: 'Expert offload' },
    ],
  },
  {
    id: 'partial-ngl',
    title: 'Partial -ngl — leave some layers on DDR5',
    flag: '-ngl / --n-gpu-layers',
    body: `-ngl is how many transformer layers llama.cpp tries to keep on the GPU. -ngl 99 is the house “offload what fits” pin. Partial -ngl is the 16 GB / 12 GB move when Q4 still spills. Leftover layers are system RAM — print ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL}. House daily driver on one R9700 uses -ngl 99 and 0% RAM offload. Partial -ngl tok/s is not measured yet on local-desktop except where a card already names --fit-target.`,
    links: [
      { href: '/tuning', label: 'Speed up llama.cpp' },
      { href: '/glossary#offload', label: 'Offload' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'split-gpus',
    title: 'Split across GPUs (-ts / --split-mode)',
    flag: '--split-mode / -sm and --tensor-split / -ts',
    body: 'Official default is --split-mode layer (short -sm layer). Overnight 35B split on local-desktop used layer mode. --tensor-split / -ts and --split-mode row are documented and not measured on local-desktop. llama.cpp multi-gpu.md requires FA for --split-mode tensor. One R9700 usually decodes the house 35B faster than the split. Read Dual / multi-GPU before you split. Do not invent a -ts pair.',
    links: [
      { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
    ],
  },
  {
    id: 'close-vram-users',
    title: 'Close other VRAM users, then reload',
    flag: 'desktop compositor · browser · second llama-server',
    body: 'llama.cpp Vulkan prints free MiB on load (#14836). A second llama-server, a browser, or a desktop compositor reduces that free figure. Ollama #8734’s cited reply is “close some programs.” Watch rocm-smi / amd-smi while you load. Do not invent a GB leftover for the compositor. Then retry the same flags.',
    links: [
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/setup/server', label: 'Always-on server' },
      { href: '/gpus/r9700', label: 'R9700' },
    ],
  },
  {
    id: 'step-down-quant',
    title: 'Then step down the weight quant: Q6 → Q5 → Q4',
    flag: 'Q6_K → UD-Q5_K_XL → Q4_K_M',
    body: `Last cheap move is a smaller GGUF, not a smaller KV type. House recipes stay Q4 and up. Overnight one-client llama-bench exists for Q6, house UD-Q5, and Q4 on one R9700. ${COMPARE_Q3} is a labeled estimate (${COMPARE_Q3_CITE}) — do not download Q3 to run. Q1/Q2 stay off.`,
    links: [
      { href: '/compare/q4-q5-q6', label: 'Q6 / Q5 / Q4' },
      { href: '/guides/quantize-gguf', label: 'Make GGUF quants' },
      { href: '/models/qwen36', label: 'Qwen3.6-35B' },
    ],
  },
];

export const OOM_HOWTO_STEPS = OOM_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const OOM_FAQ: OomFaq[] = [
  {
    id: 'which-string',
    question: 'Which out-of-memory string am I seeing?',
    answer:
      'Vulkan llama.cpp prints ErrorOutOfDeviceMemory, vk::Device::allocateMemory, failed to allocate Vulkan0 buffer, or failed to allocate compute pp buffers (llama.cpp #14836, #15120, #9271). HIP prints cudaMalloc failed: out of memory, failed to allocate ROCm0 buffer, or hipErrorOutOfMemory (#16725, #8618). Ollama prints model requires more system memory (X GiB) than is available (Y GiB) (#8734). LM Studio wraps llama.cpp — AMD shoppers still see the Vulkan or HIP strings. llama.cpp first.',
    links: [
      { href: '/out-of-vram', label: 'Out of VRAM' },
      { href: '/troubleshoot#oom-context', label: 'Long-context OOM' },
      { href: '/troubleshoot/errors', label: 'Error paste' },
    ],
  },
  {
    id: 'cheapest-first',
    question: 'What do I change first when llama.cpp is out of VRAM?',
    answer:
      'Cheapest first: lower -c, then q8_0 KV with -fa on, then -fa on, then a smaller -ub/-b, then MoE --n-cpu-moe / -ot if the file is MoE (do not invent N or the regex), then partial -ngl, then -ts / --split-mode, then close other VRAM users, then Q6 → Q5 → Q4. House recipes stay Q4 and up. Q3 is a labeled estimate. Q1/Q2 stay off.',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/kv-cache', label: 'KV cache' },
      { href: '/flash-attention', label: 'Flash Attention' },
      { href: '/tuning', label: 'Speed up llama.cpp' },
    ],
  },
  {
    id: 'house-fit',
    question: 'Does the house 35B UD-Q5 fit one R9700?',
    answer: `Yes on the measured house path. ${OOM_HOUSE_FILE} on one R9700, llama.cpp Vulkan, -c 262144, f16 KV, -ngl 99, 0% RAM offload. Peak VRAM is ${OOM_VRAM_4K} GB at 4K and ${OOM_VRAM_256K} GB at 256K. ${RAM_MIN_LABEL} is a ${OOM_KIT_GB} GB kit from the measured ${OOM_RAM_4K} GB peak at 4K. ${RAM_FULL_LABEL} uses the measured ${OOM_RAM_256K} GB peak at 256K. That is not a Flash or partial-ngl recipe.`,
    links: [
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/models/qwen36', label: 'Qwen3.6-35B' },
      { href: '/benchmarks', label: 'Benchmarks' },
    ],
  },
];

export const OOM_HUB_LINKS: OomLink[] = [
  { href: '/calculator', label: 'Calculator' },
  { href: '/kv-cache', label: 'KV cache' },
  { href: '/moe', label: 'MoE' },
  { href: '/tuning', label: 'Speed up llama.cpp' },
  { href: '/flash-attention', label: 'Flash Attention' },
  { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp' },
  { href: '/troubleshoot#oom-context', label: 'Long-context OOM' },
  { href: '/long-context', label: 'Long context' },
  { href: '/context-ceiling', label: 'Context ceiling' },
  { href: '/flash-ram-offload', label: 'Flash RAM offload' },
  { href: '/mmap', label: 'mmap / mlock' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/rocm-problems', label: 'ROCm problems' },
  { href: '/setup/lm-studio', label: 'LM Studio' },
  { href: '/setup/ollama', label: 'Ollama' },
  { href: '/stack-lab', label: 'Stack Lab' },
  { href: '/amdai-bench', label: 'amdai-bench' },
  { href: '/start', label: 'Getting started' },
];

export const REQUIRED_OOM_HREFS = [
  '/calculator',
  '/kv-cache',
  '/moe',
  '/tuning',
  '/flash-attention',
  '/setup/multi-gpu',
  '/troubleshoot#oom-context',
  '/long-context',
  '/context-ceiling',
  '/flash-ram-offload',
  '/mmap',
  '/backends/llamacpp',
  '/gpus/r9700',
  '/rocm-problems',
  '/setup/lm-studio',
  '/setup/ollama',
  '/stack-lab',
  '/amdai-bench',
  '/models/qwen36',
  '/quants',
  '/compare/q4-q5-q6',
  '/multi-gpu',
] as const;

export function oomBlob(): string {
  return [
    OOM_TITLE,
    OOM_H1,
    OOM_DESCRIPTION,
    OOM_LEAD,
    OOM_WHAT,
    OOM_CITED_LABEL,
    OOM_VRAM_CHECK,
    OOM_RAM,
    OOM_SERVER,
    ...OOM_SYMPTOMS.map((row) => `${row.backend} ${row.quote} ${row.cite}`),
    ...OOM_STEPS.map((row) => `${row.title} ${row.flag} ${row.body}`),
    ...OOM_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...OOM_QUANTS.map((row) => `${row.quant} ${row.file} ${row.note}`),
    ...OOM_SOURCES.map((row) => `${row.title} ${row.official ? 'official' : 'unofficial'}`),
    `${RAM_MIN_LABEL} ${RAM_FULL_LABEL}`,
  ].join('\n');
}

export function oomHrefs(): string[] {
  const links = [
    ...OOM_HUB_LINKS,
    ...OOM_STEPS.flatMap((step) => step.links),
    ...OOM_FAQ.flatMap((row) => row.links),
    ...OOM_SYMPTOMS.map((row) => ({ href: row.href, label: row.cite })),
    ...OOM_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertOomValid(): string[] {
  const errors: string[] = [];
  const blob = oomBlob();
  if (OOM_PATH !== '/out-of-vram') errors.push('path');
  if (OOM_PUBLISHED !== '2026-10-14') errors.push('published');
  if (OOM_TITLE.length < 8) errors.push('title short');
  if (OOM_DESCRIPTION.length < 70 || OOM_DESCRIPTION.length > 160) {
    errors.push(`description length ${OOM_DESCRIPTION.length}`);
  }
  if (!/AMDai/.test(blob)) errors.push('must say AMDai');
  if (!/llama\.cpp/.test(blob)) errors.push('must say llama.cpp');
  if (!/Vulkan/.test(blob)) errors.push('must say Vulkan');
  if (!/HIP/.test(blob)) errors.push('must say HIP');
  if (!/ErrorOutOfDeviceMemory/.test(blob)) errors.push('must quote ErrorOutOfDeviceMemory');
  if (!/vk::Device::allocateMemory/.test(blob)) errors.push('must quote vk::Device::allocateMemory');
  if (!/failed to allocate Vulkan0 buffer/.test(blob)) errors.push('must quote Vulkan0 buffer');
  if (!/failed to allocate compute pp buffers/.test(blob)) errors.push('must quote compute pp');
  if (!/failed to allocate ROCm0 buffer/.test(blob)) errors.push('must quote ROCm0 buffer');
  if (!/hipErrorOutOfMemory/.test(blob)) errors.push('must quote hipErrorOutOfMemory');
  if (!/cudaMalloc failed: out of memory/.test(blob)) errors.push('must quote cudaMalloc');
  if (!/model requires more system memory/.test(blob)) errors.push('must quote Ollama system memory');
  if (!/LM Studio/.test(blob)) errors.push('must mention LM Studio');
  if (!/-c /.test(blob) && !/--ctx-size/.test(blob)) errors.push('must cite -c');
  if (!/-ctk/.test(blob) || !/-ctv/.test(blob)) errors.push('must cite -ctk/-ctv');
  if (!/-fa /.test(blob) && !/--flash-attn/.test(blob)) errors.push('must cite -fa');
  if (!/-ub /.test(blob) || !/-b /.test(blob)) errors.push('must cite -b/-ub');
  if (!/--n-cpu-moe/.test(blob) || !/-ot/.test(blob)) errors.push('must cite MoE offload flags');
  if (!/not recorded/.test(blob)) errors.push('must not invent --n-cpu-moe N');
  if (!/-ngl/.test(blob)) errors.push('must cite -ngl');
  if (!/--split-mode/.test(blob) || !/--tensor-split/.test(blob) && !/-ts/.test(blob)) {
    errors.push('must cite split flags');
  }
  if (!/rocm-smi/.test(blob) || !/amd-smi/.test(blob)) errors.push('must cite rocm-smi / amd-smi');
  if (!/radeontop/.test(blob)) errors.push('must cite radeontop');
  if (!/MiB free/.test(blob)) errors.push('must cite Vulkan load log');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('both RAM lines');
  if (!blob.includes(OOM_HOUSE_FILE)) errors.push('house file');
  if (!/262144/.test(blob)) errors.push('house context');
  if (!blob.includes(COMPARE_Q3)) errors.push('q3 row');
  if (!/labeled estimate/.test(blob)) errors.push('q3 labeled');
  if (!/do not download Q3/.test(blob)) errors.push('must not recommend Q3');
  if (!/Q4 and up/.test(blob)) errors.push('must say Q4 and up');
  if (!/cheapest/.test(blob)) errors.push('must say cheapest first');
  if (BANNED.test(blob)) errors.push('banned model name');
  if (Q1Q2.test(blob)) errors.push('q1/q2 visible');
  if (Q4_FLOOR.test(blob)) errors.push('q4-floor wording');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (!OOM_QUANTS.some((row) => row.estimate && row.quant === COMPARE_Q3)) {
    errors.push('q3 estimate row');
  }
  const hrefs = oomHrefs();
  for (const required of REQUIRED_OOM_HREFS) {
    const path = required.split('#')[0] ?? required;
    if (!hrefs.includes(path) && !hrefs.includes(required)) errors.push(`missing href ${required}`);
  }
  return errors;
}
