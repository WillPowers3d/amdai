/**
 * Cited Radeon vs NVIDIA shopper page at /compare/radeon-vs-nvidia.
 * Spec cells cite vendor pages. R9700 tok/s come from local-desktop run cards.
 * NVIDIA speed stays “no cited number yet” unless a third-party figure is ingested.
 * No prices. Q3 is a labeled estimate. Q1/Q2 stay off.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import {
  DEFAULT_INPUT,
  DIMM_KIT_GB,
  applyGpuPreset,
  applyModelPreset,
  systemRamNeed,
  type SystemRamNeed,
} from './calculator';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { officialLinks } from './site';
import {
  COMPARE_ENGINE,
  COMPARE_MODEL,
  COMPARE_Q3,
  COMPARE_Q3_CITE,
  q3RamNeed,
  oneVsTwoRows,
} from './local-desktop-compare';
import { SWEEP_REVERIFY, type Qwen36SideCell, type RunCard } from './run-card';

export const RADEON_VS_NVIDIA_PATH = '/compare/radeon-vs-nvidia';
export const RADEON_VS_NVIDIA_NAME = 'Radeon vs NVIDIA';
export const RADEON_VS_NVIDIA_PUBLISHED = '2026-10-13';
export const NVIDIA_SPEED_EMPTY = 'no cited number yet';

export const AMD_R9700_SPEC =
  'https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9700.html';
export const AMD_7900XTX_SPEC =
  'https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7900xtx.html';
export const AMD_7900XT_SPEC =
  'https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7900xt.html';
export const AMD_7800XT_SPEC =
  'https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7800-xt.html';

export const NVIDIA_5090_SPEC = 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/';
export const NVIDIA_50_SERIES = 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/';
export const NVIDIA_4090_SPEC = 'https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/';
export const NVIDIA_COMPARE = 'https://www.nvidia.com/en-us/geforce/graphics-cards/compare/';
export const NVIDIA_BLACKWELL_PDF =
  'https://images.nvidia.com/aem-dam/Solutions/geforce/blackwell/nvidia-rtx-blackwell-gpu-architecture.pdf';

export const LLAMACPP_REPO = officialLinks.llamaCpp;
export const VLLM_CUDA = officialLinks.vllmUpstream;
export const VLLM_ROCM = officialLinks.vllmAmd;
export const STRATA_DOCS = officialLinks.strata;
export const OLLAMA_HOME = officialLinks.ollama;
export const LMSTUDIO_HOME = 'https://lmstudio.ai/';
export const OLLAMA_GPU_DOC = 'https://github.com/ollama/ollama/blob/main/docs/gpu.mdx';

export type CitedCell = {
  value: string;
  href: string;
  source: string;
};

export type SpecCamp = 'radeon' | 'nvidia';

export type SpecRow = {
  id: string;
  name: string;
  camp: SpecCamp;
  productId: string;
  href: string;
  vram: CitedCell;
  bandwidth: CitedCell;
  power: CitedCell;
};

export const SPEC_ROWS: SpecRow[] = [
  {
    id: 'r9700',
    name: 'Radeon AI PRO R9700',
    camp: 'radeon',
    productId: 'r9700',
    href: AMD_R9700_SPEC,
    vram: { value: '32 GB GDDR6', href: AMD_R9700_SPEC, source: 'AMD R9700 product page' },
    bandwidth: { value: '640 GB/s', href: AMD_R9700_SPEC, source: 'AMD R9700 product page' },
    power: { value: '300 W TBP', href: AMD_R9700_SPEC, source: 'AMD R9700 product page' },
  },
  {
    id: 'rx7900xtx',
    name: 'Radeon RX 7900 XTX',
    camp: 'radeon',
    productId: 'rx7900xtx',
    href: AMD_7900XTX_SPEC,
    vram: { value: '24 GB GDDR6', href: AMD_7900XTX_SPEC, source: 'AMD RX 7900 XTX product page' },
    bandwidth: { value: '960 GB/s', href: AMD_7900XTX_SPEC, source: 'AMD RX 7900 XTX product page' },
    power: { value: '355 W TBP', href: AMD_7900XTX_SPEC, source: 'AMD RX 7900 XTX product page' },
  },
  {
    id: 'rx7900xt',
    name: 'Radeon RX 7900 XT',
    camp: 'radeon',
    productId: 'rx7900xt',
    href: AMD_7900XT_SPEC,
    vram: { value: '20 GB GDDR6', href: AMD_7900XT_SPEC, source: 'AMD RX 7900 XT product page' },
    bandwidth: { value: '800 GB/s', href: AMD_7900XT_SPEC, source: 'AMD RX 7900 XT product page' },
    power: { value: '315 W TBP', href: AMD_7900XT_SPEC, source: 'AMD RX 7900 XT product page' },
  },
  {
    id: 'rx7800xt',
    name: 'Radeon RX 7800 XT',
    camp: 'radeon',
    productId: 'rx7800xt',
    href: AMD_7800XT_SPEC,
    vram: { value: '16 GB GDDR6', href: AMD_7800XT_SPEC, source: 'AMD RX 7800 XT product page' },
    bandwidth: { value: '624 GB/s', href: AMD_7800XT_SPEC, source: 'AMD RX 7800 XT product page' },
    power: { value: '263 W TBP', href: AMD_7800XT_SPEC, source: 'AMD RX 7800 XT product page' },
  },
  {
    id: 'rtx5090',
    name: 'GeForce RTX 5090',
    camp: 'nvidia',
    productId: 'rtx5090',
    href: NVIDIA_5090_SPEC,
    vram: { value: '32 GB GDDR7', href: NVIDIA_5090_SPEC, source: 'NVIDIA RTX 5090 product page' },
    bandwidth: { value: '1,792 GB/s', href: NVIDIA_5090_SPEC, source: 'NVIDIA RTX 5090 product page' },
    power: { value: '575 W TGP', href: NVIDIA_5090_SPEC, source: 'NVIDIA RTX 5090 product page' },
  },
  {
    id: 'rtx4090',
    name: 'GeForce RTX 4090',
    camp: 'nvidia',
    productId: 'rtx4090',
    href: NVIDIA_4090_SPEC,
    vram: { value: '24 GB GDDR6X', href: NVIDIA_4090_SPEC, source: 'NVIDIA RTX 4090 product page' },
    bandwidth: {
      value: '1,008 GB/s',
      href: NVIDIA_5090_SPEC,
      source: 'NVIDIA RTX 5090 product comparison table',
    },
    power: { value: '450 W TGP', href: NVIDIA_4090_SPEC, source: 'NVIDIA RTX 4090 product page' },
  },
  {
    id: 'rtx3090',
    name: 'GeForce RTX 3090',
    camp: 'nvidia',
    productId: 'rtx3090',
    href: NVIDIA_COMPARE,
    vram: { value: '24 GB GDDR6X', href: NVIDIA_COMPARE, source: 'NVIDIA GeForce compare' },
    bandwidth: {
      value: '936 GB/s',
      href: NVIDIA_BLACKWELL_PDF,
      source: 'NVIDIA RTX Blackwell GPU architecture PDF',
    },
    power: { value: '350 W TGP', href: NVIDIA_COMPARE, source: 'NVIDIA GeForce compare' },
  },
  {
    id: 'rtx5080',
    name: 'GeForce RTX 5080',
    camp: 'nvidia',
    productId: 'rtx5080',
    href: NVIDIA_50_SERIES,
    vram: { value: '16 GB GDDR7', href: NVIDIA_50_SERIES, source: 'NVIDIA GeForce RTX 50 Series' },
    bandwidth: { value: '960 GB/s', href: NVIDIA_50_SERIES, source: 'NVIDIA GeForce RTX 50 Series' },
    power: { value: '360 W TGP', href: NVIDIA_COMPARE, source: 'NVIDIA GeForce compare' },
  },
  {
    id: 'rtx5070ti',
    name: 'GeForce RTX 5070 Ti',
    camp: 'nvidia',
    productId: 'rtx5070ti',
    href: NVIDIA_50_SERIES,
    vram: { value: '16 GB GDDR7', href: NVIDIA_50_SERIES, source: 'NVIDIA GeForce RTX 50 Series' },
    bandwidth: { value: '896 GB/s', href: NVIDIA_50_SERIES, source: 'NVIDIA GeForce RTX 50 Series' },
    power: { value: '300 W TGP', href: NVIDIA_COMPARE, source: 'NVIDIA GeForce compare' },
  },
  {
    id: 'rtx5060ti-16',
    name: 'GeForce RTX 5060 Ti 16GB',
    camp: 'nvidia',
    productId: 'rtx5060ti-16',
    href: NVIDIA_50_SERIES,
    vram: {
      value: '16 GB GDDR7',
      href: NVIDIA_50_SERIES,
      source: 'NVIDIA GeForce RTX 50 Series (16 GB SKU; an 8 GB SKU also exists)',
    },
    bandwidth: { value: '448 GB/s', href: NVIDIA_50_SERIES, source: 'NVIDIA GeForce RTX 50 Series' },
    power: { value: '180 W TGP', href: NVIDIA_COMPARE, source: 'NVIDIA GeForce compare' },
  },
];

export const SPEED_QUANTS = ['UD-Q5_K_XL', 'Q5_K_M', 'Q4_K_M'] as const;
export const SPEED_CONTEXTS = [4096, 262144] as const;

export type MeasuredSpeedRow = {
  id: string;
  quant: (typeof SPEED_QUANTS)[number];
  context: number;
  contextLabel: string;
  one: Qwen36SideCell;
  both: Qwen36SideCell;
  nvidia: string;
};

export function measuredSpeedRows(cards: RunCard[]): MeasuredSpeedRow[] {
  const sides = oneVsTwoRows(cards);
  const rows: MeasuredSpeedRow[] = [];
  for (const quant of SPEED_QUANTS) {
    for (const context of SPEED_CONTEXTS) {
      const side = sides.find((row) => row.quant === quant && row.context === context);
      if (!side) continue;
      rows.push({
        id: `${quant}-${context}`,
        quant,
        context,
        contextLabel: side.contextLabel,
        one: side.one,
        both: side.both,
        nvidia: NVIDIA_SPEED_EMPTY,
      });
    }
  }
  return rows;
}

export type SoftwareRow = {
  id: string;
  name: string;
  radeon: string;
  nvidia: string;
  hrefs: { href: string; label: string }[];
};

export const SOFTWARE_ROWS: SoftwareRow[] = [
  {
    id: 'llamacpp-vulkan',
    name: 'llama.cpp · Vulkan',
    radeon:
      'Consumer default on AMDai. House daily driver is one R9700, Vulkan, UD-Q5_K_XL, 262K, f16 KV. Measured on local-desktop.',
    nvidia:
      'llama.cpp also builds CUDA. We have no ingested first-party or cited third-party 35B Vulkan/CUDA tok/s for the RTX cards on this page.',
    hrefs: [
      { href: '/backends/llamacpp', label: 'llama.cpp on AMDai' },
      { href: LLAMACPP_REPO, label: 'llama.cpp repository' },
    ],
  },
  {
    id: 'llamacpp-hip',
    name: 'llama.cpp · ROCm / HIP',
    radeon:
      'HIP is the ROCm compile when rocminfo lists the gfx. gfx1201 “no binary for GPU” reports live on the problems tracker. Try Vulkan first if HIP configure is a mess.',
    nvidia: 'HIP is not an NVIDIA path. CUDA is the matching compile.',
    hrefs: [
      { href: '/rocm', label: 'What is ROCm' },
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
    ],
  },
  {
    id: 'strata',
    name: 'Strata',
    radeon:
      'First-party Flash try on the house Pro rig — cited pair ~32.6 tok/s versus llama.cpp ~16 tok/s at 262K on Qwen 3.8 Flash UD-Q6_K_XL. Not the 35B overnight matrix.',
    nvidia: 'No house Strata figure on an RTX card. We will not invent one.',
    hrefs: [
      { href: '/backends/strata', label: 'Strata on AMDai' },
      { href: STRATA_DOCS, label: 'Strata v0.1.42' },
    ],
  },
  {
    id: 'vllm',
    name: 'vLLM',
    radeon:
      'Advanced / experimental here. Default pip install is CUDA. ROCm is a pin (AMD 10.0 supported combo is still 0.27 + PyTorch 2.13; community 0.31 is a try). No invented local-desktop 0.31 tok/s.',
    nvidia:
      'This is where NVIDIA wins on day-one maturity: CUDA vLLM is the upstream default. Broader engine and model coverage on launch week. Still not our measured 35B path.',
    hrefs: [
      { href: '/backends', label: 'Backends' },
      { href: VLLM_CUDA, label: 'vLLM GPU install (CUDA default)' },
      { href: VLLM_ROCM, label: 'AMD vLLM on ROCm' },
    ],
  },
  {
    id: 'ollama-lmstudio',
    name: 'Ollama / LM Studio',
    radeon:
      'Convenience wrappers. gfx1201 is still cited pain in Ollama. LM Studio may download a CUDA llama.cpp on a Radeon if you are not watching the runtime picker. Prefer a Vulkan llama.cpp you built.',
    nvidia:
      'Day-one CUDA runtimes are the usual path in both apps. We have no house tok/s. Confirm a GPU meter moves before you trust the wrapper.',
    hrefs: [
      { href: '/backends', label: 'Backends' },
      { href: OLLAMA_HOME, label: 'Ollama' },
      { href: OLLAMA_GPU_DOC, label: 'Ollama GPU targets' },
      { href: LMSTUDIO_HOME, label: 'LM Studio' },
      { href: '/setup', label: 'First-run setup' },
    ],
  },
];

export type DecisionCase = {
  id: string;
  title: string;
  pick: string;
  body: string;
  ram?: 'daily' | 'q3' | 'sixteen';
  links: { href: string; label: string }[];
};

export const DECISION_CASES: DecisionCase[] = [
  {
    id: 'daily-35b',
    title: 'Daily-driver 35B at long context',
    pick: 'One R9700, if you want the path we measured.',
    body:
      'House daily driver is Qwen3.6-35B-A3B Unsloth UD-Q5_K_XL on one R9700, llama.cpp Vulkan, 262144 context, f16 KV. It stays in 32 GB VRAM on the overnight cards. An RTX 5090 is the same 32 GB class on paper; we have no cited 35B llama.cpp tok/s for it. A 16 GB RTX 5080 / 5070 Ti / 5060 Ti 16GB or RX 7800 XT does not hold that Q5 at full context in VRAM — expect RAM offload and a slower decode.',
    ram: 'daily',
    links: [
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: 'Daily-driver recipe' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
    ],
  },
  {
    id: 'biggest-fit',
    title: 'Biggest model that fits',
    pick: 'Buy the VRAM bracket, then size the file.',
    body:
      '32 GB (R9700 or RTX 5090) is the class that holds the house 35B Q5 at 262K without offload on our calculator / cards. 24 GB (7900 XTX, RTX 4090, RTX 3090) is the next bracket — Q4 may fit; Q5 at long context needs the calculator. 16 GB cards (7800 XT, RTX 5080, 5070 Ti, 5060 Ti 16GB) are a different job: smaller listed files or RAM offload. We do not invent a “fits” claim past the calculator and the vendor VRAM label.',
    ram: 'sixteen',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/gpus/rx7900xtx', label: 'RX 7900 XTX sheet' },
      { href: '/gpus/rx-9070-xt', label: 'RX 9070 XT sheet' },
      { href: '/gpus/rx-9060-xt', label: 'RX 9060 XT sheet' },
      { href: '/gpus/rx-7900-gre', label: 'RX 7900 GRE sheet' },
      { href: '/gpus/rx-7700-xt', label: 'RX 7700 XT sheet' },
      { href: '/gpus/rx-7600-xt', label: 'RX 7600 XT sheet' },
      { href: '/quants', label: 'Quants' },
    ],
  },
  {
    id: 'two-card',
    title: 'Two-card builds',
    pick: 'A second R9700 is measured. A second RTX card is not, on this site.',
    body:
      'Two R9700s on local-desktop: a split of the same 35B is often slower than one card at short context (UD-Q5 4K is 102.39 tok/s on one vs 82.78 on the split). Two copies serve two requests — that is concurrency, not 2× one chat. Desktop 2 (dual R9700 + 192 GB DDR5) is planned, not measured. We have no cited two-RTX 35B llama.cpp figure. Do not assume tensor parallel is free speed.',
    ram: 'daily',
    links: [
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/qwen36-dual', label: '35B on two cards' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
    ],
  },
  {
    id: 'windows-linux',
    title: 'Windows vs Linux',
    pick: 'Linux if you want our measured Radeon path. Windows CUDA if you need day-one NVIDIA apps.',
    body:
      'Ubuntu LTS on AMD’s current ROCm matrix is the path we write. llama.cpp Vulkan is the honest Windows path for tokens on Radeon. Full ROCm userspace is a Linux product. ROCm 10.1 lists WSL2 as a technical preview — not a measured local-desktop daily driver. NVIDIA’s CUDA stack is the broader Windows day-one story (vLLM, more app binaries). We do not have Windows tok/s on either camp.',
    ram: 'daily',
    links: [
      { href: '/setup', label: 'First-run setup' },
      { href: '/rocm', label: 'What is ROCm' },
      { href: '/rocm-problems', label: 'ROCm problems' },
    ],
  },
];

export const LEAD = {
  winsRadeon:
    'Radeon wins the VRAM-per-dollar class we actually shop: 32 GB on the R9700, 24 / 20 / 16 GB on the RX 7900 / 7800 sheets, and two-card layouts we have measured on local-desktop. Buttons say Check price — we do not print a figure.',
  winsNvidia:
    'NVIDIA wins the software day-one: CUDA is the default for vLLM and a long tail of engines, and more models and apps land there first. That is ecosystem maturity, not a tok/s we measured on an RTX card.',
  honest:
    'This page is for a local-LLM shopper picking an R9700 or RX 7900-class card versus an RTX 5090, 4090, 3090, 5080, 5070 Ti, or 5060 Ti 16GB. Plain language. No fanboying. Specs cite the vendor page. Speed that is ours says measured. Speed that is not ours stays empty.',
};

export const SPEED_NOTE =
  'R9700 decode is measured on local-desktop (amdai-bench/run@1, llama.cpp Vulkan). Any NVIDIA speed figure on this site must be third-party, linked to the exact source, and labeled not apples-to-apples (different engine, quant, or context). We have no ingested cited NVIDIA 35B number for these SKUs, so those cells say “no cited number yet.” We will not estimate one.';

export const REQUIRED_PAGE_HREFS = [
  '/compare',
  '/gpus/r9700',
  '/gpus/rx7900xtx',
  '/gpus/rx7900xt',
  '/gpus/rx7800xt',
  '/gpus/rx-9070-xt',
  '/gpus/rx-9060-xt',
  '/gpus/rx-7900-gre',
  '/gpus/rx-7700-xt',
  '/gpus/rx-7600-xt',
  '/gpus',
  '/benchmarks',
  '/results',
  '/calculator',
  '/budget',
  '/faq',
  '/backends',
  '/backends/llamacpp',
  '/backends/strata',
  '/rocm',
  '/rocm-problems',
  '/rocm/vulkan-hip',
  '/setup',
  '/multi-gpu',
  '/qwen36-dual',
  '/compare/one-vs-two-gpu',
  '/compare/q4-q5-q6',
  '/disclosure',
] as const;

function readSrcData(name: string): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(here, '../data', name), join(process.cwd(), 'src/data', name)];
  for (const file of candidates) {
    if (existsSync(file)) return readFileSync(file, 'utf8');
  }
  throw new Error(`${name} missing`);
}

export function nvidiaProductIds(): string[] {
  return SPEC_ROWS.filter((row) => row.camp === 'nvidia').map((row) => row.productId);
}

export function sixteenGbRamNeed(): SystemRamNeed {
  let input = applyGpuPreset('rx7800xt', {
    ...DEFAULT_INPUT,
    ramGb: 64,
    view: 'gpu',
  });
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

export function q3EstimateRam(): SystemRamNeed {
  return q3RamNeed(1);
}

export function radeonVsNvidiaBlob(cards: RunCard[]): string {
  const speed = measuredSpeedRows(cards);
  return [
    LEAD.winsRadeon,
    LEAD.winsNvidia,
    LEAD.honest,
    SPEED_NOTE,
    RADEON_VS_NVIDIA_NAME,
    COMPARE_MODEL,
    COMPARE_ENGINE,
    COMPARE_Q3,
    COMPARE_Q3_CITE,
    SWEEP_REVERIFY,
    NVIDIA_SPEED_EMPTY,
    RAM_MIN_LABEL,
    RAM_FULL_LABEL,
    SPEC_ROWS.map((row) => `${row.name} ${row.vram.value} ${row.bandwidth.value} ${row.power.value}`).join('\n'),
    SOFTWARE_ROWS.map((row) => `${row.name} ${row.radeon} ${row.nvidia}`).join('\n'),
    DECISION_CASES.map((row) => `${row.title} ${row.pick} ${row.body}`).join('\n'),
    speed.map((row) => `${row.quant} ${row.one.decode} ${row.both.decode} ${row.nvidia}`).join('\n'),
  ].join('\n');
}

export function radeonVsNvidiaHrefs(): string[] {
  const hrefs = [
    RADEON_VS_NVIDIA_PATH,
    ...REQUIRED_PAGE_HREFS,
    ...SPEC_ROWS.flatMap((row) => [row.href, row.vram.href, row.bandwidth.href, row.power.href]),
    ...SOFTWARE_ROWS.flatMap((row) => row.hrefs.map((link) => link.href)),
    ...DECISION_CASES.flatMap((row) => row.links.map((link) => link.href)),
  ];
  return [...new Set(hrefs.map((href) => (href.split('?')[0] ?? href).split('#')[0] ?? href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');
const PRICE = /\$\d|\bMSRP\b|\bUSD\b|\bSEP\b/i;

export function assertRadeonVsNvidiaValid(cards: RunCard[]): string[] {
  const errors: string[] = [];
  const blob = radeonVsNvidiaBlob(cards);
  const hrefs = new Set(radeonVsNvidiaHrefs());
  const speed = measuredSpeedRows(cards);
  const products = parse(readSrcData('products.yaml')) as {
    products: Array<{ id: string; urls?: Partial<Record<string, string>> }>;
  };
  const productIds = new Set(products.products.map((row) => row.id));

  if (SPEC_ROWS.length < 10) errors.push('expected Radeon + NVIDIA spec rows');
  if (!SPEC_ROWS.some((row) => row.id === 'r9700' && row.vram.value.startsWith('32 GB'))) {
    errors.push('R9700 must cite 32 GB');
  }
  if (!SPEC_ROWS.some((row) => row.id === 'rtx5090' && row.vram.value.startsWith('32 GB'))) {
    errors.push('RTX 5090 must cite 32 GB');
  }
  if (!SPEC_ROWS.some((row) => row.id === 'rtx5060ti-16' && /16 GB/.test(row.vram.value))) {
    errors.push('5060 Ti must be the 16 GB SKU');
  }

  for (const row of SPEC_ROWS) {
    for (const cell of [row.vram, row.bandwidth, row.power]) {
      if (!cell.href.startsWith('https://')) errors.push(`${row.id} ${cell.value} missing vendor href`);
      const host = new URL(cell.href).hostname;
      if (row.camp === 'radeon' && !host.endsWith('amd.com')) {
        errors.push(`${row.id} spec must cite AMD`);
      }
      if (row.camp === 'nvidia' && !host.endsWith('nvidia.com')) {
        errors.push(`${row.id} spec must cite NVIDIA`);
      }
      if (!cell.source) errors.push(`${row.id} unlabeled source`);
    }
    if (!productIds.has(row.productId)) errors.push(`${row.id} missing products.yaml ${row.productId}`);
  }

  if (speed.length !== SPEED_QUANTS.length * SPEED_CONTEXTS.length) {
    errors.push(`expected ${SPEED_QUANTS.length * SPEED_CONTEXTS.length} measured speed rows`);
  }
  for (const row of speed) {
    if (row.one.decode === 'not measured' || !row.one.runIds.length) {
      errors.push(`${row.id} 1× decode is not a measured card`);
    }
    if (row.both.decode === 'not measured' || !row.both.runIds.length) {
      errors.push(`${row.id} split decode is not a measured card`);
    }
    if (row.nvidia !== NVIDIA_SPEED_EMPTY) errors.push(`${row.id} invented NVIDIA tok/s`);
    if (!/tok\/s/.test(row.one.decode)) errors.push(`${row.id} 1× missing tok/s`);
  }
  const ud4k = speed.find((row) => row.quant === 'UD-Q5_K_XL' && row.context === 4096);
  if (ud4k?.one.decode !== '102.39 tok/s') errors.push('UD-Q5 1× 4K drifted');
  if (ud4k?.both.decode !== '82.78 tok/s') errors.push('UD-Q5 split 4K drifted');

  if (!blob.includes(COMPARE_Q3)) errors.push('missing Q3 estimate');
  if (!/estimate/i.test(COMPARE_Q3_CITE + blob)) errors.push('Q3 unlabeled');
  if (!blob.includes(NVIDIA_SPEED_EMPTY)) errors.push('NVIDIA speed must stay empty until cited');
  if (!blob.includes(RAM_MIN_LABEL)) errors.push(`missing ${RAM_MIN_LABEL}`);
  if (!blob.includes(RAM_FULL_LABEL)) errors.push(`missing ${RAM_FULL_LABEL}`);

  const q3 = q3EstimateRam();
  const sixteen = sixteenGbRamNeed();
  for (const [name, need] of [
    ['q3', q3],
    ['sixteen', sixteen],
  ] as const) {
    if (!(DIMM_KIT_GB as readonly number[]).includes(need.atSelected.kitGb)) {
      errors.push(`${name} min kit ${need.atSelected.kitGb} is not a real DIMM size`);
    }
    if (!(DIMM_KIT_GB as readonly number[]).includes(need.atFullContext.kitGb)) {
      errors.push(`${name} full kit ${need.atFullContext.kitGb} is not a real DIMM size`);
    }
    if (name === 'sixteen' && need.atSelected.label !== 'estimate') {
      errors.push('16 GB RAM line must stay estimate');
    }
  }

  for (const required of REQUIRED_PAGE_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }

  if (BANNED.test(blob)) errors.push('banned model');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (PRICE.test(blob)) errors.push('invented price');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/apples-to-apples|third-party/.test(blob) === false) {
    errors.push('must warn NVIDIA figures are not apples-to-apples / third-party');
  }

  return [...new Set(errors)];
}
