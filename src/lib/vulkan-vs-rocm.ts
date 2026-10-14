/**
 * Cited shopper compare: llama.cpp Vulkan vs ROCm (HIP) on Radeon.
 * Measured 35B cells are the official local-desktop llama.cpp Vulkan sweep only.
 * HIP decode/prefill stay pending until a first-party card lands.
 * Q3 is a labeled estimate. No invented tok/s or prices. llama.cpp first.
 */

import {
  DEFAULT_INPUT,
  applyGpuPreset,
  applyModelPreset,
  systemRamNeed,
  type SystemRamNeed,
} from './calculator';
import { houseSystemRam } from './house-ram';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { officialLinks } from './site';
import { oneVsTwoRows, COMPARE_ENGINE, COMPARE_MODEL, COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';
import type { RunCard } from './run-card';

export const VULKAN_VS_ROCM_PATH = '/compare/vulkan-vs-rocm';
export const VULKAN_VS_ROCM_PUBLISHED = '2026-10-14';
export const VULKAN_VS_ROCM_CITED_LABEL = 'Cited llama.cpp + AMD docs · measured 35B Vulkan cells only';
export const VULKAN_VS_ROCM_PENDING = 'pending — not measured on local-desktop';
export const VULKAN_VS_ROCM_UNMEASURED = 'not measured yet';

export const LLAMA_BUILD_MD = 'https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md';
export const LLAMA_SERVER_README = 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md';

export type VulkanVsRocmLink = { href: string; label: string };

export type VulkanVsRocmSource = {
  id: string;
  title: string;
  href: string;
};

export type VulkanVsRocmAxis = {
  id: string;
  title: string;
  vulkan: string;
  hip: string;
  kind: 'cited' | 'measured' | 'pending';
};

export type VulkanVsRocmGpuRow = {
  id: string;
  gen: string;
  gfx: string;
  vulkan: string;
  hip: string;
  note: string;
  links: VulkanVsRocmLink[];
};

export type VulkanVsRocmFaq = {
  id: string;
  question: string;
  answer: string;
  links: VulkanVsRocmLink[];
};

export type VulkanVsRocmMeasuredRow = {
  quant: string;
  kind: 'measured' | 'q3-estimate';
  vulkan4k: string;
  vulkan32k: string;
  hip: typeof VULKAN_VS_ROCM_PENDING | typeof VULKAN_VS_ROCM_UNMEASURED;
  note: string;
  runIds: string[];
};

export const VULKAN_VS_ROCM_TITLE = 'llama.cpp on Radeon: Vulkan vs ROCm (HIP)';
export const VULKAN_VS_ROCM_DESCRIPTION =
  'llama.cpp on Radeon: Vulkan vs ROCm (HIP). Why the house 35B daily driver is Vulkan. HIP stays a cited second compile. Q3 is a labeled estimate.';

export const VULKAN_VS_ROCM_LEAD =
  `Shoppers search “llama.cpp vulkan vs rocm” and “which backend for AMD GPU.” On AMDai the house daily driver is ${COMPARE_MODEL} Unsloth UD-Q5_K_XL on one R9700, ${COMPARE_ENGINE} Vulkan, 262144 context, f16 KV, 0% RAM offload. That is a Vulkan build. HIP is the ROCm compile when rocminfo already lists this gfx. Measured decode is the official local-desktop Vulkan sweep. HIP cells stay ${VULKAN_VS_ROCM_PENDING}. Quant ladder is Q6_K / UD-Q5_K_XL / Q5_K_M / Q4_K_M plus ${COMPARE_Q3} as a labeled estimate (${COMPARE_Q3_CITE}). Q1/Q2 stay off. llama.cpp first.`;

export const VULKAN_VS_ROCM_DECISION = `
  Start with llama.cpp Vulkan (Mesa RADV, GGML_VULKAN=ON) for first tokens
  on RDNA4, RDNA3, and RDNA2 — including the house 35B on one R9700.
  Keep a HIP sibling (GGML_HIP=ON, pin AMDGPU_TARGETS to the gfx rocminfo
  prints) when you already maintain /opt/rocm, or when you need the same
  prefix as PyTorch / vLLM. Do not pick HIP to chase an unmeasured tok/s.
  Measure Vulkan vs HIP on your box with Stack Lab planner and amdai-bench.
`.replace(/\s+/g, ' ').trim();

export const VULKAN_VS_ROCM_SOURCES: VulkanVsRocmSource[] = [
  { id: 'llama', title: 'llama.cpp repository', href: officialLinks.llamaCpp },
  { id: 'build', title: 'llama.cpp — build.md (GGML_VULKAN / GGML_HIP)', href: LLAMA_BUILD_MD },
  { id: 'server', title: 'llama.cpp server README', href: LLAMA_SERVER_README },
  { id: 'rocm-matrix', title: 'AMD — ROCm 10.1.0 compatibility matrix', href: officialLinks.rocm10Matrix },
  { id: 'rocm', title: 'AMD — ROCm documentation', href: officialLinks.rocm },
  { id: 'radeon-rocm', title: 'AMD — Radeon / Ryzen ROCm docs', href: officialLinks.radeonRocm },
  { id: 'rocm101-blog', title: 'AMD — ROCm 10.1 blog (WSL2 preview)', href: officialLinks.rocm101Blog },
  { id: 'vulkan-hip', title: 'AMDai — Vulkan vs HIP (ROCm guide)', href: '/rocm/vulkan-hip' },
  { id: 'benchmarks', title: 'AMDai — 35B benchmarks', href: '/benchmarks' },
];

export const VULKAN_VS_ROCM_AXES: VulkanVsRocmAxis[] = [
  {
    id: 'install',
    title: 'Install effort',
    kind: 'cited',
    vulkan:
      'Mesa RADV (or the vendor ICD on Windows) plus libvulkan-dev. cmake -B build-vk -DGGML_VULKAN=ON. No matching /opt/rocm tree required for first tokens. Cited from llama.cpp build.md and this site’s /setup path.',
    hip:
      'Full ROCm userspace, then rocminfo must list this gfx before you compile. cmake -B build-hip -DGGML_HIP=ON -DAMDGPU_TARGETS=<gfx>. Prefix may be /opt/rocm/core-10.0 — ls first. Official matrix: AMD ROCm 10.1.0.',
  },
  {
    id: 'decode-prefill',
    title: 'Decode vs prefill',
    kind: 'pending',
    vulkan:
      'Measured on local-desktop llama.cpp Vulkan only. Official overnight 35B decode cells live in the table below and on /benchmarks. Those are Vulkan cards, not a HIP verdict. Prefill appears on some Vulkan cards in that same sweep — still not a HIP number.',
    hip:
      'HIP decode and prefill for the house 35B sweep stay pending — not measured on local-desktop. Do not copy a community HIP tok/s onto this page. Measure with amdai-bench.',
  },
  {
    id: 'multi-gpu',
    title: 'Multi-GPU',
    kind: 'cited',
    vulkan:
      'Cited walk is /setup/multi-gpu: --list-devices, then --device or GGML_VK_VISIBLE_DEVICES. Official default --split-mode layer. Overnight 35B split cards are llama.cpp Vulkan. Combo-preset tok/s is not measured.',
    hip:
      'HIP_VISIBLE_DEVICES / ROCR_VISIBLE_DEVICES after rocminfo. Same llama.cpp --split-mode flags. HIP split of the house 35B is pending — not measured on local-desktop. Mixing RDNA gens stays a /multi-gpu question.',
  },
  {
    id: 'fa-kv',
    title: 'Flash attention and KV type',
    kind: 'cited',
    vulkan:
      'Overnight 35B llama-bench cards recorded -fa 1 and -ctk f16 -ctv f16. That is the house Vulkan pin. llama-server flags are not on that card — copy -fa only when your build documents it. q8_0 KV is listed on the calculator; quality and tok/s stay not measured yet.',
    hip:
      'llama.cpp documents the same --cache-type-k/v and -fa flags on the HIP build. HIP -fa / q8_0 KV for the house 35B sweep stay pending — not measured on local-desktop. Do not invent a HIP flash-attn delta.',
  },
  {
    id: 'windows',
    title: 'Windows / WSL',
    kind: 'cited',
    vulkan:
      'Native Windows first token is llama.cpp Vulkan (LunarG SDK, GGML_VULKAN=ON, or a Windows x64 Vulkan release). Cited at /setup/windows. Not measured on local-desktop.',
    hip:
      'ROCm 10.1 lists WSL2 as a tech preview. llama.cpp’s documented GPU path in a Linux guest is HIP (GGML_HIP=ON). We do not invent Vulkan-in-WSL. Native Linux at /setup stays the measured path. Cited at /setup/wsl.',
  },
];

export const VULKAN_VS_ROCM_GPUS: VulkanVsRocmGpuRow[] = [
  {
    id: 'rdna4',
    gen: 'RDNA 4',
    gfx: 'gfx1201 / gfx1200',
    vulkan: 'Always-works consumer path. House R9700 (gfx1201) daily driver is Vulkan.',
    hip: 'Official on the ROCm 10.1 matrix. Compile only after rocminfo prints this gfx. hipErrorNoBinaryForGpu means the binary missed gfx1201.',
    note: 'Radeon AI PRO R9700 is the measured 32 GB SKU. RX 9070-class is gfx1201 / gfx1200 — Vulkan first, HIP second.',
    links: [
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/gpus/rx-9070-xt', label: 'RX 9070 XT' },
    ],
  },
  {
    id: 'rdna3',
    gen: 'RDNA 3',
    gfx: 'gfx110x',
    vulkan: 'Always-works consumer path. Mesa RADV + GGML_VULKAN=ON.',
    hip: 'Official on the ROCm 10.1 matrix for listed gfx1100 / gfx1101 / gfx1102 rows. Pin AMDGPU_TARGETS to the string rocminfo prints. Do not paste gfx1201 onto a 7900.',
    note: 'Decode on these cards is not a local-desktop 35B HIP card. Size Q6/Q5/Q4 on the calculator.',
    links: [
      { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX' },
      { href: '/gpus/rx-7800-xt', label: 'RX 7800 XT' },
    ],
  },
  {
    id: 'rdna2',
    gen: 'RDNA 2',
    gfx: 'gfx1030 / gfx1031',
    vulkan: 'Always-works path on used 6000-series. Prefer Vulkan if HIP is angry.',
    hip: 'Consumer RDNA 2 is unofficial on the current Radeon ROCm row the way W6800 (gfx1030) is official. gfx1031 is not that W6800 row. Community HSA_OVERRIDE_GFX_VERSION=10.3.0 is unofficial — not an AMD how-to.',
    note: 'House 35B Q6/Q5/Q4 files expect RAM offload on 12–16 GB cards. Both RAM lines stay labeled estimate.',
    links: [
      { href: '/gpus/rx-6800-xt', label: 'RX 6800 XT' },
      { href: '/rocm-problems/gfx1031-hsa-override', label: 'gfx1031 HSA_OVERRIDE' },
    ],
  },
];

export const VULKAN_BUILD = [
  '# Vulkan — house daily-driver compile (llama.cpp build.md)',
  'sudo apt install -y build-essential cmake git libvulkan-dev',
  'git clone https://github.com/ggml-org/llama.cpp.git',
  'cd llama.cpp',
  'cmake -B build-vk -DGGML_VULKAN=ON -DCMAKE_BUILD_TYPE=Release',
  'cmake --build build-vk -j"$(nproc)"',
  './build-vk/bin/llama-cli --list-devices',
  '# Pick RADV GFX1201 / the discrete card, not the iGPU.',
].join('\n');

export const HIP_BUILD = [
  '# HIP sibling — only after rocminfo lists this gfx (llama.cpp build.md)',
  'cmake -B build-hip -DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1201 -DCMAKE_BUILD_TYPE=Release',
  'cmake --build build-hip -j"$(nproc)"',
  '# Prefix may be /opt/rocm/core-10.0 — ls first.',
  'export HIP_PATH=/opt/rocm',
  'export PATH="/opt/rocm/bin:$PATH"',
  './build-hip/bin/llama-cli --list-devices',
].join('\n');

export const VULKAN_RUN = [
  '# House 35B shape — /recipes/qwen36-35b.llamacpp-vulkan.262k',
  './build-vk/bin/llama-server \\',
  '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
  '  -ngl 99 \\',
  '  -c 262144 \\',
  '  --cache-type-k f16 \\',
  '  --cache-type-v f16 \\',
  '  --host 127.0.0.1 --port 8080',
].join('\n');

export const HIP_RUN = [
  '# Same GGUF flags as the Vulkan house pin — HIP binary, not a measured HIP card.',
  './build-hip/bin/llama-server \\',
  '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
  '  -ngl 99 \\',
  '  -c 262144 \\',
  '  --cache-type-k f16 \\',
  '  --cache-type-v f16 \\',
  '  --host 127.0.0.1 --port 8080',
].join('\n');

export const VULKAN_VS_ROCM_RAM_NOTE = `
  Backend choice does not change the shopper RAM labels. House 35B UD-Q5_K_XL
  on one 32 GB R9700 does not offload. When -ngl leaves layers on the host —
  typical on a 16 GB card with a house 35B Q4–Q6 file — print
  ${RAM_MIN_LABEL} (full system estimate: offloaded weights + OS / cache /
  headroom, rounded up to a real kit, labeled estimate until measured) and
  ${RAM_FULL_LABEL} (262K with cache; measured numbers only when a card exists).
`.replace(/\s+/g, ' ').trim();

export const VULKAN_VS_ROCM_STACK_LAB = `
  Stack Lab planner is the allowlisted backend A/B. Record an amdai-bench
  card on your box — Vulkan build-vk versus HIP build-hip, one knob at a
  time. The house daily recipe is the measured Vulkan pin. There is no
  invented HIP recipe id. HIP cells on this page stay pending until a
  first-party local-desktop card lands.
`.replace(/\s+/g, ' ').trim();

export const VULKAN_VS_ROCM_FAQ: VulkanVsRocmFaq[] = [
  {
    id: 'which-first',
    question: 'Which llama.cpp backend should I compile first on a Radeon?',
    answer:
      'Vulkan. House daily driver is Qwen3.6-35B-A3B UD-Q5_K_XL on one R9700, llama.cpp Vulkan, 262K, f16 KV. HIP is the second compile after rocminfo lists this gfx. Do not pick HIP to chase an unmeasured tok/s.',
    links: [
      { href: '/setup', label: 'First-run setup' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP guide' },
    ],
  },
  {
    id: 'hip-faster',
    question: 'Is HIP faster than Vulkan on RDNA 4?',
    answer: `HIP decode and prefill for the house 35B sweep stay ${VULKAN_VS_ROCM_PENDING}. Measured numbers on this site are Vulkan. Measure both builds with Stack Lab planner and amdai-bench. Do not copy a community HIP figure onto a shopper page.`,
    links: [
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/benchmarks', label: 'Benchmarks' },
    ],
  },
  {
    id: 'gfx1031',
    question: 'My used 6700 XT is gfx1031. Do I need HSA_OVERRIDE?',
    answer:
      'Not as an AMDai how-to. Consumer RDNA 2 is unofficial on the current Radeon ROCm row. gfx1031 is not the official W6800 gfx1030 row. Community HSA_OVERRIDE_GFX_VERSION=10.3.0 is unofficial. Prefer llama.cpp Vulkan. Q6/Q5/Q4 plus a labeled Q3 estimate. Both RAM lines print if the 35B file spills.',
    links: [
      { href: '/rocm-problems/gfx1031-hsa-override', label: 'gfx1031 HSA_OVERRIDE' },
      { href: '/guides/buying-used-radeon', label: 'Buying a used Radeon' },
      { href: '/gpus/rx-6700-xt', label: 'RX 6700 XT' },
    ],
  },
];

export const VULKAN_VS_ROCM_SECTIONS = [
  { id: 'decision', label: 'Decision' },
  { id: 'axes', label: 'Install, speed, split' },
  { id: 'gpus', label: 'Supported GPUs' },
  { id: 'measured', label: 'Measured 35B' },
  { id: 'commands', label: 'Build and run' },
  { id: 'ram', label: 'System RAM' },
  { id: 'stack-lab', label: 'Stack Lab' },
  { id: 'faq', label: 'FAQ' },
  { id: 'sources', label: 'Sources' },
] as const;

export const VULKAN_VS_ROCM_HUB: VulkanVsRocmLink[] = [
  { href: '/compare', label: 'Compare hub' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/rocm', label: 'ROCm' },
  { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
  { href: '/setup', label: 'First-run setup' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/multi-gpu', label: 'Dual / multi-GPU' },
  { href: '/stack-lab', label: 'Stack Lab' },
  { href: '/amdai-bench', label: 'amdai-bench' },
];

export const REQUIRED_VULKAN_VS_ROCM_HREFS = [
  '/compare',
  '/backends/llamacpp',
  '/rocm',
  '/rocm/vulkan-hip',
  '/setup',
  '/setup/windows',
  '/setup/wsl',
  '/glossary#vulkan',
  '/glossary#hip',
  '/faq',
  '/amdai-bench',
  '/stack-lab',
  '/multi-gpu',
  '/setup/multi-gpu',
  '/benchmarks',
  '/gpus/r9700',
  '/rocm-problems/gfx1031-hsa-override',
  '/rocm-problems/hip-no-binary-for-gpu',
  '/calculator',
  '/can-run',
  '/compare/q4-q5-q6',
  '/tutorials/run-local-llm',
  '/backends',
] as const;

export const VULKAN_VS_ROCM_HOWTO_STEPS = [
  {
    name: 'Compile llama.cpp Vulkan first',
    text: 'cmake -B build-vk -DGGML_VULKAN=ON. --list-devices, pick the discrete RADV device. House daily driver is Qwen3.6-35B-A3B UD-Q5_K_XL, -c 262144, f16 KV.',
  },
  {
    name: 'Confirm gfx before a HIP sibling',
    text: 'rocminfo must list this gfx. cmake -B build-hip -DGGML_HIP=ON -DAMDGPU_TARGETS=<gfx>. Do not paste gfx1201 onto a gfx110x card. hipErrorNoBinaryForGpu is a missed target.',
  },
  {
    name: 'Read the generation caveats',
    text: 'RDNA4 / RDNA3 HIP follows the official 10.1 matrix. Consumer RDNA 2 and gfx1031 HSA_OVERRIDE stay unofficial. Vulkan is the always-works path on those used cards.',
  },
  {
    name: 'Measure both builds on your box',
    text: 'HIP cells on local-desktop stay pending. Open Stack Lab planner and record an amdai-bench card. Do not invent a HIP tok/s.',
  },
];

export function vulkanVsRocmMeasuredRows(cards: RunCard[]): VulkanVsRocmMeasuredRow[] {
  const table = oneVsTwoRows(cards);
  const quants = ['Q6_K', 'UD-Q5_K_XL', 'Q5_K_M', 'Q4_K_M'] as const;
  const rows: VulkanVsRocmMeasuredRow[] = quants.map((quant) => {
    const at4k = table.find((row) => row.quant === quant && row.context === 4096);
    const at32k = table.find((row) => row.quant === quant && row.context === 32768);
    const vulkan4k = at4k?.one.decode ?? VULKAN_VS_ROCM_UNMEASURED;
    const vulkan32k = at32k?.one.decode ?? VULKAN_VS_ROCM_UNMEASURED;
    const runIds = [...new Set([...(at4k?.one.runIds ?? []), ...(at32k?.one.runIds ?? [])])];
    return {
      quant,
      kind: 'measured',
      vulkan4k,
      vulkan32k,
      hip: VULKAN_VS_ROCM_PENDING,
      note: 'Official local-desktop llama.cpp Vulkan, one R9700. HIP column pending.',
      runIds,
    };
  });
  rows.push({
    quant: COMPARE_Q3,
    kind: 'q3-estimate',
    vulkan4k: VULKAN_VS_ROCM_UNMEASURED,
    vulkan32k: VULKAN_VS_ROCM_UNMEASURED,
    hip: VULKAN_VS_ROCM_UNMEASURED,
    note: `${COMPARE_Q3_CITE}. Q3 is a labeled estimate — not a local-desktop run.`,
    runIds: [],
  });
  return rows;
}

export function vulkanVsRocmDailyRamNeed() {
  return houseSystemRam('daily');
}

export function vulkanVsRocmOffloadRamNeed(): SystemRamNeed {
  let input = applyGpuPreset('rx7800xt', { ...DEFAULT_INPUT, ramGb: 256, view: 'gpu' });
  input = applyModelPreset('qwen36', input);
  return systemRamNeed({
    ...input,
    gpuId: 'rx7800xt',
    quantId: 'q4_k_m',
    context: 32768,
    kvId: 'f16',
    backendId: 'llamacpp',
    pathId: 'vulkan',
    gpuCount: 1,
    split: false,
    fileWeightGiB: null,
  });
}

export function vulkanVsRocmBlob(): string {
  return [
    VULKAN_VS_ROCM_TITLE,
    VULKAN_VS_ROCM_DESCRIPTION,
    VULKAN_VS_ROCM_LEAD,
    VULKAN_VS_ROCM_CITED_LABEL,
    VULKAN_VS_ROCM_PENDING,
    VULKAN_VS_ROCM_UNMEASURED,
    VULKAN_VS_ROCM_DECISION,
    VULKAN_VS_ROCM_RAM_NOTE,
    VULKAN_VS_ROCM_STACK_LAB,
    VULKAN_BUILD,
    HIP_BUILD,
    VULKAN_RUN,
    HIP_RUN,
    ...VULKAN_VS_ROCM_AXES.map((row) => `${row.title} ${row.vulkan} ${row.hip}`),
    ...VULKAN_VS_ROCM_GPUS.map((row) => `${row.gen} ${row.gfx} ${row.vulkan} ${row.hip} ${row.note}`),
    ...VULKAN_VS_ROCM_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...VULKAN_VS_ROCM_HOWTO_STEPS.map((row) => `${row.name} ${row.text}`),
    COMPARE_Q3,
    COMPARE_Q3_CITE,
    RAM_MIN_LABEL,
    RAM_FULL_LABEL,
  ].join('\n');
}

export function vulkanVsRocmHrefs(): string[] {
  const links: VulkanVsRocmLink[] = [
    ...VULKAN_VS_ROCM_HUB,
    ...VULKAN_VS_ROCM_GPUS.flatMap((row) => row.links),
    ...VULKAN_VS_ROCM_FAQ.flatMap((row) => row.links),
    ...VULKAN_VS_ROCM_SOURCES.map((source) => ({ href: source.href, label: source.title })),
    { href: '/setup/windows', label: 'Windows' },
    { href: '/setup/wsl', label: 'WSL2' },
    { href: '/glossary#vulkan', label: 'Vulkan' },
    { href: '/glossary#hip', label: 'HIP' },
    { href: '/faq', label: 'FAQ' },
    { href: '/setup/multi-gpu', label: 'Multi-GPU how-to' },
    { href: '/rocm-problems/hip-no-binary-for-gpu', label: 'HIP no binary' },
    { href: '/calculator', label: 'Calculator' },
    { href: '/can-run', label: 'Can my Radeon run it?' },
    { href: '/compare/q4-q5-q6', label: 'Q6 Q5 Q4' },
    { href: '/tutorials/run-local-llm', label: 'Run a local Qwen' },
    { href: '/backends', label: 'Backends' },
    { href: '/guides/buying-used-radeon', label: 'Used Radeon' },
    { href: '/gpus/rx-6700-xt', label: 'RX 6700 XT' },
  ];
  return [...new Set(links.map((link) => link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertVulkanVsRocmValid(cards: RunCard[] = []): string[] {
  const errors: string[] = [];
  const blob = vulkanVsRocmBlob();
  const hrefs = vulkanVsRocmHrefs();
  if (VULKAN_VS_ROCM_TITLE !== 'llama.cpp on Radeon: Vulkan vs ROCm (HIP)') errors.push('title drifted');
  if (VULKAN_VS_ROCM_DESCRIPTION.length < 70 || VULKAN_VS_ROCM_DESCRIPTION.length > 160) {
    errors.push('description length');
  }
  if (VULKAN_VS_ROCM_PENDING !== 'pending — not measured on local-desktop') errors.push('pending label drifted');
  if (!/llama\.cpp/i.test(blob)) errors.push('must keep llama.cpp first');
  if (!/GGML_VULKAN=ON/.test(blob) || !/GGML_HIP=ON/.test(blob)) errors.push('must cite both CMake flags');
  if (!/AMDGPU_TARGETS/.test(blob)) errors.push('must cite HIP gfx pin');
  if (!/HSA_OVERRIDE_GFX_VERSION/.test(blob)) errors.push('must cite HSA_OVERRIDE');
  if (!/Mesa RADV/.test(blob)) errors.push('must name Mesa RADV');
  if (!blob.includes(VULKAN_VS_ROCM_PENDING)) errors.push('must keep HIP pending slot');
  if (!/labeled estimate/.test(blob)) errors.push('Q3 must stay a labeled estimate');
  if (!blob.includes(COMPARE_Q3)) errors.push('must list Q3 estimate');
  if (!/Q6_K/.test(blob) || !/Q5_K_M/.test(blob) || !/Q4_K_M/.test(blob)) errors.push('must list Q6/Q5/Q4');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('RAM lines missing');
  if (!/planner/.test(blob) || !/amdai-bench/.test(blob)) errors.push('must point at Stack Lab planner + amdai-bench');
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (/\b\d+(?:\.\d+)?\s*tok\/s\b/i.test(blob)) errors.push('tok/s must come from the measured table, not lib copy');
  const ram = vulkanVsRocmOffloadRamNeed();
  if (ram.atSelected.label !== 'estimate') errors.push('16 GB Q4 RAM must stay estimate');
  if (!vulkanVsRocmDailyRamNeed()) errors.push('daily house RAM missing');
  for (const required of REQUIRED_VULKAN_VS_ROCM_HREFS) {
    if (!hrefs.some((href) => href === required || href.startsWith(`${required}`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  if (cards.length) {
    const rows = vulkanVsRocmMeasuredRows(cards);
    if (rows.length !== 5) errors.push('measured table must be Q6/Q5xl/Q5/Q4 + Q3');
    const q3 = rows.find((row) => row.kind === 'q3-estimate');
    if (!q3 || q3.vulkan4k !== VULKAN_VS_ROCM_UNMEASURED) errors.push('Q3 row must stay unmeasured');
    const q5 = rows.find((row) => row.quant === 'UD-Q5_K_XL');
    if (!q5 || q5.vulkan4k === VULKAN_VS_ROCM_UNMEASURED) errors.push('UD-Q5_K_XL 4K must stay a measured Vulkan cell');
    if (!/tok\/s/.test(q5?.vulkan4k ?? '')) errors.push('measured Vulkan cell must keep tok/s from the card');
    if (rows.filter((row) => row.kind === 'measured').some((row) => row.hip !== VULKAN_VS_ROCM_PENDING)) {
      errors.push('HIP column must stay pending on measured rows');
    }
  }
  return [...new Set(errors)];
}

export { COMPARE_Q3, COMPARE_Q3_CITE, COMPARE_MODEL, COMPARE_ENGINE, RAM_FULL_LABEL, RAM_MIN_LABEL };
