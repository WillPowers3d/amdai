/**
 * ROCm-guide glossary. Same terms render on /rocm/glossary and in DefinedTermSet JSON-LD.
 */

export type RocmGlossaryTerm = {
  id: string;
  term: string;
  definition: string;
  group: 'platform' | 'hardware' | 'software' | 'home-lab';
};

export const ROCM_GLOSSARY: RocmGlossaryTerm[] = [
  {
    id: 'rocm',
    term: 'ROCm',
    group: 'platform',
    definition:
      'AMD’s open-source GPU computing platform: compilers, runtimes, and libraries for AI, HPC, and other workloads, on Linux and Windows, for Instinct, Radeon, and Ryzen AI. Historically Radeon Open Compute.',
  },
  {
    id: 'cuda',
    term: 'CUDA',
    group: 'platform',
    definition:
      'NVIDIA’s GPU compute platform. HIP exists in part so CUDA-like code can be ported; HIP is not a drop-in CUDA replacement.',
  },
  {
    id: 'therock',
    term: 'TheRock',
    group: 'platform',
    definition: 'ROCm’s build and release system since 7.14.',
  },
  {
    id: 'rocm-cli',
    term: 'ROCm CLI',
    group: 'platform',
    definition:
      'Official rocm binary for install / serve / diagnose / dashboard. 10.1 blog: v0.2.0.',
  },
  {
    id: 'gfx-id',
    term: 'gfx ID',
    group: 'hardware',
    definition:
      'LLVM target for the GPU ISA — gfx1201, gfx1100, and so on. The 10.1.0 hardware table lists each supported device with its LLVM target and architecture.',
  },
  {
    id: 'rdna',
    term: 'RDNA',
    group: 'hardware',
    definition:
      'Radeon (and many Ryzen iGPU) architecture family. R9700 / RX 9070-class = RDNA 4 / gfx1201 on the 10.1.0 table.',
  },
  {
    id: 'cdna',
    term: 'CDNA',
    group: 'hardware',
    definition:
      'Instinct datacenter architecture family. Same ROCm docs, different SKUs and often different OS footnotes.',
  },
  {
    id: 'r9700',
    term: 'Radeon AI PRO R9700',
    group: 'hardware',
    definition:
      'Workstation / local-AI card. 32 GB. gfx1201. Our test-rig GPU. There is no consumer “RX 9700.”',
  },
  {
    id: 'amdgpu',
    term: 'amdgpu',
    group: 'software',
    definition: 'In-tree Linux DRM driver for modern AMD GPUs (GCN, RDNA, CDNA).',
  },
  {
    id: 'kfd',
    term: 'KFD / ROCK',
    group: 'software',
    definition:
      'Kernel-side compute interface. ROCR docs: user-mode runtime talks to the AMDGPU driver set and the ROCK kernel driver. On current Linux this is amdkfd / /dev/kfd.',
  },
  {
    id: 'rocr',
    term: 'ROCr',
    group: 'software',
    definition: 'AMD’s user-mode HSA runtime.',
  },
  {
    id: 'hip',
    term: 'HIP',
    group: 'software',
    definition: 'C++ runtime API and kernel language for AMD GPUs.',
  },
  {
    id: 'comgr',
    term: 'comgr',
    group: 'software',
    definition: 'Code Object Manager — compile, link, inspect GPU code objects. HIPRTC uses it.',
  },
  {
    id: 'rocblas',
    term: 'rocBLAS',
    group: 'software',
    definition: 'ROCm BLAS library, HIP C++, for AMD GPUs.',
  },
  {
    id: 'hipblaslt',
    term: 'hipBLASLt',
    group: 'software',
    definition: 'Flexible GEMM beyond classical BLAS.',
  },
  {
    id: 'miopen',
    term: 'MIOpen',
    group: 'software',
    definition: 'AMD deep-learning primitives library.',
  },
  {
    id: 'rccl',
    term: 'RCCL',
    group: 'software',
    definition: 'ROCm Communication Collectives Library — multi-GPU / multi-node primitives.',
  },
  {
    id: 'rocwmma',
    term: 'rocWMMA',
    group: 'software',
    definition: 'Header library for mixed-precision matrix multiply-accumulate.',
  },
  {
    id: 'ck',
    term: 'Composable Kernel (CK)',
    group: 'software',
    definition: 'Programming model for performance-critical ML kernels in HIP C++.',
  },
  {
    id: 'amd-smi',
    term: 'amd-smi',
    group: 'software',
    definition: 'Successor to rocm-smi after the deprecation period, per the 10.1 blog.',
  },
  {
    id: 'hsa-override',
    term: 'HSA_OVERRIDE_GFX_VERSION',
    group: 'software',
    definition:
      'Unofficial env var used in community threads to load a nearby gfx’s code objects (example: 10.3.0 on gfx1031). Not an official recommendation. Not needed on official gfx1201 + ROCm 10.x.',
  },
  {
    id: 'vulkan',
    term: 'Vulkan',
    group: 'software',
    definition: 'Khronos graphics/compute API. llama.cpp can use it instead of HIP.',
  },
  {
    id: 'official',
    term: 'Official (our column)',
    group: 'home-lab',
    definition: 'Appears on AMD’s current matrix or matching release notes. Not a speed claim.',
  },
  {
    id: 'works',
    term: 'Works / try',
    group: 'home-lab',
    definition: 'Ran here or in a cited community report, not on the official row. Labeled.',
  },
  {
    id: 'daily-driver',
    term: 'Daily driver',
    group: 'home-lab',
    definition:
      'Qwen3.6-35B-A3B UD-Q5_K_XL, llama.cpp Vulkan, one R9700. Measured on our rig, 2026-10 — 102.39 / 90.52 / 44.4 tok/s.',
  },
  {
    id: 'fast-agent',
    term: 'Fast agent',
    group: 'home-lab',
    definition: 'Qwen 3.8 Flash UD-Q6_K_XL on Strata v0.1.42. First-party ~32.6 vs ~16 tok/s.',
  },
  {
    id: 'house-rules',
    term: 'House rules',
    group: 'home-lab',
    definition:
      'llama.cpp over vLLM for consumers; Q5 over Q4; Q3 listed as estimate/community; Q1/Q2 stay off; NVMe not HDD; one LLM per GPU unless you deliberately combine.',
  },
];

export const ROCM_GLOSSARY_GROUPS: { id: RocmGlossaryTerm['group']; heading: string }[] = [
  { id: 'platform', heading: 'Platform' },
  { id: 'hardware', heading: 'Hardware names' },
  { id: 'software', heading: 'Software layers' },
  { id: 'home-lab', heading: 'Home-lab words this site uses' },
];
