/**
 * ROCm-guide FAQ. Same objects render on /rocm/faq and in FAQPage JSON-LD.
 */

export type RocmFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const ROCM_MISCONCEPTIONS: RocmFaqItem[] = [
  {
    id: 'rocm-is-cuda',
    question: 'ROCm is just CUDA for AMD.',
    answer:
      'ROCm is AMD’s own open platform. HIP is deliberately CUDA-like and can port a lot of code, but AMD says it is not a drop-in CUDA replacement. Wheels, gfx targets, and tools are a different world. Budget time for matching versions, not for a one-line extra on a CUDA tutorial.',
  },
  {
    id: 'doesnt-work',
    question: 'ROCm doesn’t work on consumer cards.',
    answer:
      'Out of date as a blanket claim. ROCm 10.1.0’s hardware table lists Radeon AI PRO R9700 and the RX 9070 series as gfx1201 (RDNA 4), plus a long RDNA 3 / RDNA 2 PRO list. What is still fair: it is not CUDA, packaging is the pain, and official is a table. Single-GPU local inference on a listed Ubuntu is the path this site writes.',
  },
  {
    id: 'vulkan-means-failed',
    question: 'If you use Vulkan, ROCm failed.',
    answer:
      'llama.cpp has a Vulkan backend and a HIP backend. Our 35B daily driver is Vulkan on purpose. HIP/ROCm is what you need for PyTorch, vLLM, and the AMD-documented AI ecosystem.',
  },
  {
    id: 'override-is-fine',
    question: 'Set HSA_OVERRIDE_GFX_VERSION and move on.',
    answer:
      'That variable is a community workaround (classic case: gfx1031 pretending to be gfx1030). It is unofficial, process-wide, and can fault. Current gfx1201 cards on ROCm 10.x should not need it.',
  },
  {
    id: 'two-cards',
    question: 'Two R9700s will double tok/s.',
    answer:
      'Not automatically. Multi-GPU is RCCL, topology, and a backend that knows how to split. Our daily driver is one card. House rule: one LLM per GPU unless you deliberately combine. Use the calculator split toggle before you buy a second card for capacity.',
  },
  {
    id: 'apt-rocm',
    question: 'apt install rocm from Ubuntu is the install.',
    answer:
      'Archive packages lag the 10.x / TheRock line. Use AMD’s 10.1.0 install docs or the ROCm CLI, not a mix of archive plus leftover runfile plus CLI.',
  },
  {
    id: 'cli-is-1',
    question: 'The new CLI is ROCm 1.0 / CLI v1.0.',
    answer:
      'The 10.1 blog names ROCm CLI v0.2.0. Check GitHub releases for tags. Do not write v1.0.0 from memory.',
  },
  {
    id: 'rx9700',
    question: 'I have an RX 9700.',
    answer:
      'You don’t, in AMD’s current lineup. The 32 GB workstation card is the Radeon AI PRO R9700. The gaming sibling is the RX 9070 series (also gfx1201, less VRAM).',
  },
];

export const ROCM_FAQ: RocmFaqItem[] = [
  {
    id: 'windows',
    question: 'Can I stay on Windows?',
    answer:
      'AMD documents ROCm as Linux and Windows. 10.1 adds a WSL2 technical preview (standard Linux packages in the guest; profiling / KFD-dependent tooling not supported at that launch, per the notes). For a first weekend of tokens, llama.cpp Vulkan is the honest Windows path. A full HIP + PyTorch home lab is still the listed-Ubuntu story we write in Install ROCm.',
  },
  {
    id: 'pins',
    question: 'Which PyTorch / vLLM numbers are “the” numbers?',
    answer:
      'Dated snapshots, not eternal law. 10.1.0 notes: PyTorch 2.14.0, vLLM 0.29.0 (notes say this replaces 2.11.0 / 0.27.0). 10.0.0 notes: PyTorch 2.13.0, vLLM 0.27.0. Community try tags move faster. The home card is this week. Do not mix pins in one venv. Default PyPI vLLM is CUDA.',
  },
  {
    id: 'need-rocm',
    question: 'Do I need ROCm to run Qwen locally?',
    answer:
      'No, if llama.cpp Vulkan sees the discrete GPU and VRAM moves. Yes, if you want PyTorch, vLLM, or HIP llama.cpp against /opt/rocm.',
  },
  {
    id: 'fine-tune',
    question: 'Can I fine-tune like a 4090 blog post?',
    answer:
      'PyTorch ROCm exists. The cited shopper guide is /fine-tuning — LoRA / QLoRA, then export to llama.cpp. This site has a dated note about training/fine-tune GPU resets on R9700 in the 10.0 era and a TORCH_BLAS_PREFER_HIPBLASLT=0 suggestion — treat that as a snapshot, not a current KI we have re-verified today. Prefer inference on the pin you already trust. Training speed is not yet measured on our R9700s.',
  },
  {
    id: 'smi',
    question: 'rocm-smi or amd-smi?',
    answer:
      'The 10.1 blog says the rocm-smi deprecation period is complete and amd-smi is the successor. New scripts should call amd-smi. Old blog posts will still say rocm-smi.',
  },
  {
    id: 'upgrade',
    question: 'How do I upgrade ROCm without mixing leftovers?',
    answer:
      'Inventory first, then use the same official method you installed. Radeon Software / amdgpu-install does not support in-place upgrades. The 10.1 apt path documents install-and-update; uninstall first if you still have 7.2.4 or older. apt-mark hold is unofficial. Step-by-step: /rocm/upgrade. First install stays on Install ROCm.',
  },
];

export const ROCM_FAQ_ALL: RocmFaqItem[] = [...ROCM_MISCONCEPTIONS, ...ROCM_FAQ];
