import { officialLinks } from './site';

export type RocmPageId =
  | 'overview'
  | 'stack'
  | 'gfx'
  | 'vulkan-hip'
  | 'versions'
  | 'history'
  | 'glossary'
  | 'faq';

export type RocmPage = {
  id: RocmPageId;
  href: string;
  title: string;
  nav: string;
  description: string;
};

export const rocmPages: RocmPage[] = [
  {
    id: 'overview',
    href: '/rocm',
    title: 'What is ROCm',
    nav: 'Overview',
    description: 'AMD’s GPU compute stack in plain English, why it exists next to CUDA, and what that means on a home Radeon.',
  },
  {
    id: 'stack',
    href: '/rocm/stack',
    title: 'The ROCm stack',
    nav: 'The stack',
    description: 'Driver, runtime, HIP, compiler, libraries, and frameworks — layer by layer, with a diagram.',
  },
  {
    id: 'gfx',
    href: '/rocm/gfx',
    title: 'GPU architectures and gfx IDs',
    nav: 'gfx IDs',
    description: 'RDNA vs CDNA, why the LLVM target matters, and when HSA_OVERRIDE_GFX_VERSION is a workaround — not a plan.',
  },
  {
    id: 'vulkan-hip',
    href: '/rocm/vulkan-hip',
    title: 'ROCm vs Vulkan vs HIP for local LLMs',
    nav: 'Vulkan vs HIP',
    description: 'When llama.cpp Vulkan wins on a home Radeon, and when HIP/ROCm is the stack you actually need.',
  },
  {
    id: 'versions',
    href: '/rocm/versions',
    title: 'Versions and support policy',
    nav: 'Versions',
    description: 'Release cadence, official vs “works,” distro rows, ROCm 10.1 and the R9700, and the ROCm CLI.',
  },
  {
    id: 'history',
    href: '/rocm/history',
    title: 'History and timeline',
    nav: 'History',
    description: 'Cited ROCm timeline from the 2016 Radeon Open Compute announcement through the current 10.x line.',
  },
  {
    id: 'glossary',
    href: '/rocm/glossary',
    title: 'Glossary',
    nav: 'Glossary',
    description: 'The words this site uses for ROCm, gfx IDs, HIP, Vulkan, and home-lab inference.',
  },
  {
    id: 'faq',
    href: '/rocm/faq',
    title: 'Misconceptions and FAQ',
    nav: 'FAQ',
    description: 'What people get wrong about ROCm at home, answered with citations and TODOs where we do not have a source.',
  },
];

export function rocmPage(id: RocmPageId): RocmPage {
  const page = rocmPages.find((row) => row.id === id);
  if (!page) throw new Error(`Unknown ROCm guide page: ${id}`);
  return page;
}

export function rocmNeighbors(id: RocmPageId): { prev: RocmPage | null; next: RocmPage | null; index: number } {
  const index = rocmPages.findIndex((row) => row.id === id);
  return {
    index,
    prev: index > 0 ? rocmPages[index - 1] : null,
    next: index >= 0 && index < rocmPages.length - 1 ? rocmPages[index + 1] : null,
  };
}

export type CiteKey = keyof typeof citations;

export type Citation = {
  href: string;
  title: string;
  publisher: string;
  note?: string;
};

/** Official and primary sources only. Do not invent version or support claims from these titles. */
export const citations = {
  rocmHome: {
    href: officialLinks.rocm,
    title: 'AMD ROCm documentation (latest)',
    publisher: 'AMD',
  },
  rocm101Notes: {
    href: officialLinks.rocm101Notes,
    title: 'ROCm 10.1.0 release notes',
    publisher: 'AMD',
    note: 'Dated 5 October 2026 on the official versions table.',
  },
  rocm10Notes: {
    href: officialLinks.rocm10Notes,
    title: 'ROCm 10.0.0 release notes',
    publisher: 'AMD',
    note: 'Dated 26 August 2026 on the official versions table.',
  },
  rocm101Blog: {
    href: officialLinks.rocm101Blog,
    title: 'ROCm 10.1: Breaking the Data-Movement Bottleneck',
    publisher: 'AMD',
    note: '5 October 2026.',
  },
  rocmVersions: {
    href: 'https://rocm.docs.amd.com/en/latest/release/versions.html',
    title: 'ROCm release history',
    publisher: 'AMD',
  },
  rocmInstall: {
    href: officialLinks.rocmInstall,
    title: 'Install ROCm',
    publisher: 'AMD',
  },
  rocm101Install: {
    href: 'https://rocm.docs.amd.com/en/docs-10.1.0/install/rocm.html',
    title: 'Install ROCm 10.1.0',
    publisher: 'AMD',
  },
  rocm10Matrix: {
    href: officialLinks.rocm10Matrix,
    title: 'ROCm 10.1.0 compatibility matrix',
    publisher: 'AMD',
  },
  linuxReqs: {
    href: officialLinks.compatibility,
    title: 'ROCm Linux system requirements',
    publisher: 'AMD',
  },
  theRock: {
    href: officialLinks.rocmTransition,
    title: 'TheRock transition guide (ROCm 10.0.0 docs)',
    publisher: 'AMD',
  },
  rocmCli: {
    href: officialLinks.rocmCli,
    title: 'Getting started with ROCm CLI',
    publisher: 'AMD',
  },
  rocmCliReleases: {
    href: officialLinks.rocmCliReleases,
    title: 'ROCm CLI releases',
    publisher: 'GitHub / ROCm',
  },
  radeonRocm: {
    href: officialLinks.radeonRocm,
    title: 'ROCm on Radeon and Ryzen',
    publisher: 'AMD',
  },
  hipWhat: {
    href: 'https://rocm.docs.amd.com/projects/HIP/en/latest/what_is_hip.html',
    title: 'What is HIP?',
    publisher: 'AMD',
  },
  hipRtc: {
    href: 'https://rocm.docs.amd.com/projects/HIP/en/latest/how-to/hip_rtc.html',
    title: 'Programming for HIP runtime compiler (RTC)',
    publisher: 'AMD',
    note: 'Documents that HIPRTC uses the Code Object Manager (comgr).',
  },
  rocr: {
    href: 'https://rocm.docs.amd.com/projects/ROCR-Runtime/en/latest/',
    title: 'ROCR documentation',
    publisher: 'AMD',
  },
  amdgpuKernel: {
    href: 'https://www.kernel.org/doc/html/latest/gpu/amdgpu/',
    title: 'drm/amdgpu AMDgpu driver',
    publisher: 'The Linux Kernel',
  },
  rocblas: {
    href: 'https://rocm.docs.amd.com/projects/rocBLAS/en/latest/',
    title: 'rocBLAS documentation',
    publisher: 'AMD',
  },
  hipblaslt: {
    href: 'https://rocm.docs.amd.com/projects/hipBLASLt/en/latest/',
    title: 'hipBLASLt documentation',
    publisher: 'AMD',
  },
  miopen: {
    href: 'https://rocm.docs.amd.com/projects/MIOpen/en/latest/',
    title: 'MIOpen documentation',
    publisher: 'AMD',
  },
  rccl: {
    href: 'https://rocm.docs.amd.com/projects/rccl/en/latest/',
    title: 'RCCL documentation',
    publisher: 'AMD',
  },
  rocwmma: {
    href: 'https://rocm.docs.amd.com/projects/rocWMMA/en/latest/',
    title: 'rocWMMA documentation',
    publisher: 'AMD',
  },
  ck: {
    href: 'https://rocm.docs.amd.com/projects/composable_kernel/en/latest/',
    title: 'Composable Kernel user guide',
    publisher: 'AMD',
  },
  pytorchRocm: {
    href: officialLinks.pytorch,
    title: 'Install PyTorch for ROCm',
    publisher: 'AMD',
  },
  vllmAmd: {
    href: officialLinks.vllmAmd,
    title: 'vLLM on ROCm (AMD)',
    publisher: 'AMD',
  },
  llamaCpp: {
    href: officialLinks.llamaCpp,
    title: 'llama.cpp repository',
    publisher: 'ggml-org',
  },
  sc16Press: {
    href: 'https://www.amd.com/en/newsroom/press-releases/2016-11-14-amd-releases-new-version-of-rocm-the-most-versati.html',
    title: 'AMD Releases New Version of ROCm… (SC16)',
    publisher: 'AMD',
    note: '14 November 2016. Names the stack Radeon Open Compute Platform (ROCm).',
  },
  sc16PressIr: {
    href: 'https://ir.amd.com/news-events/press-releases/detail/732/amd-releases-new-version-of-rocm-the-most-versatile-open-source-platform-for-gpu-computing',
    title: 'AMD ROCm SC16 press release (investor relations copy)',
    publisher: 'AMD',
    note: '14 November 2016, 9:00 am EST.',
  },
  hsaOverride2353: {
    href: 'https://github.com/ROCm/ROCm/issues/2353',
    title: 'ROCm issue #2353 — hardware support / gfx1031',
    publisher: 'GitHub / ROCm',
    note: 'Community comment documents HSA_OVERRIDE_GFX_VERSION=10.3.0 to run gfx1030 objects on gfx1031. Not an AMD recommendation.',
  },
  productR9700: {
    href: officialLinks.product,
    title: 'AMD Radeon AI PRO R9700 product page',
    publisher: 'AMD',
  },
} as const satisfies Record<string, Citation>;

export function citeNumber(used: readonly CiteKey[], id: CiteKey): number {
  const n = used.indexOf(id);
  if (n === -1) throw new Error(`Citation "${id}" is not in this page's source list`);
  return n + 1;
}

export const rocmRelated = [
  { href: '/tutorials/install-rocm', label: 'Install ROCm', blurb: 'Linux-first walkthrough for 10.1 on a listed Ubuntu.' },
  { href: '/troubleshoot/errors', label: 'Error paste', blurb: 'Match a log against cited ROCm / Ollama patterns.' },
  { href: '/troubleshooting', label: 'Troubleshooting', blurb: 'GPU not seen, wrong wheel, CPU fallback.' },
  { href: '/calculator', label: 'Calculator', blurb: 'Quant + hardware VRAM / RAM fit estimates.' },
  { href: '/backends', label: 'Backend chooser', blurb: 'llama.cpp first; Vulkan, HIP, Strata, vLLM.' },
  { href: '/gpus', label: 'GPU directory', blurb: 'Radeon cards, gfx IDs, official vs unofficial rows.' },
] as const;

export const GUIDE_UPDATED = new Date('2026-10-12T00:00:00Z');
