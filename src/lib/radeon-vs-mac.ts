/**
 * Cited Radeon vs Mac (Apple Silicon) shopper page at /compare/radeon-vs-mac.
 * Hardware cells cite AMD or Apple spec pages. R9700 tok/s come from local desktop cards.
 * Mac and Strix Halo speed stay “not measured here” unless a third-party llama.cpp
 * figure is ingested with a source link. No prices. Q3 is a labeled estimate.
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
  compute,
  formatGiB,
  systemRamNeed,
  type QuantId,
  type SystemRamNeed,
} from './calculator';
import { houseSystemRam } from './house-ram';
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

export const RADEON_VS_MAC_PATH = '/compare/radeon-vs-mac';
export const RADEON_VS_MAC_NAME = 'Radeon vs Mac';
export const RADEON_VS_MAC_HEADING = 'Radeon vs Mac (Apple Silicon) for local LLMs';
export const RADEON_VS_MAC_PUBLISHED = '2026-10-14';
export const MAC_SPEED_EMPTY = 'not measured here';

export const AMD_R9700_SPEC =
  'https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9700.html';
export const AMD_7900XTX_SPEC =
  'https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7900xtx.html';
export const AMD_STRIX_SPEC =
  'https://www.amd.com/en/products/processors/laptop/ryzen/ai-300-series/amd-ryzen-ai-max-plus-395.html';
export const AMD_STRIX_HALO_PLATFORM =
  'https://www.amd.com/en/products/processors/desktops/ryzen/ryzen-ai-halo/ryzen-ai-max-plus-395.html';
export const AMD_STRIX_ALLOC =
  'https://www.amd.com/en/developer/resources/technical-articles/2025/amd-ryzen-ai-max-395--a-leap-forward-in-generative-ai-performanc.html';

export const APPLE_STUDIO_2025 = 'https://support.apple.com/en-us/122211';
export const APPLE_STUDIO_SPECS = 'https://www.apple.com/mac-studio/specs/';

export const LLAMACPP_REPO = officialLinks.llamaCpp;
export const LLAMA_BUILD_MD = 'https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md';
export const MLX_REPO = 'https://github.com/ml-explore/mlx';
export const ASAHI_HOME = 'https://asahilinux.org/';

export type CitedCell = {
  value: string;
  href: string;
  source: string;
};

export type SpecCamp = 'radeon' | 'mac';

export type SpecRow = {
  id: string;
  name: string;
  camp: SpecCamp;
  productId: string | null;
  href: string;
  memory: CitedCell;
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
    memory: { value: '32 GB GDDR6', href: AMD_R9700_SPEC, source: 'AMD R9700 product page' },
    bandwidth: { value: '640 GB/s', href: AMD_R9700_SPEC, source: 'AMD R9700 product page' },
    power: { value: '300 W TBP', href: AMD_R9700_SPEC, source: 'AMD R9700 product page' },
  },
  {
    id: 'rx7900xtx',
    name: 'Radeon RX 7900 XTX',
    camp: 'radeon',
    productId: 'rx7900xtx',
    href: AMD_7900XTX_SPEC,
    memory: { value: '24 GB GDDR6', href: AMD_7900XTX_SPEC, source: 'AMD RX 7900 XTX product page' },
    bandwidth: { value: '960 GB/s', href: AMD_7900XTX_SPEC, source: 'AMD RX 7900 XTX product page' },
    power: { value: '355 W TBP', href: AMD_7900XTX_SPEC, source: 'AMD RX 7900 XTX product page' },
  },
  {
    id: 'r9700-x2',
    name: 'Two R9700s',
    camp: 'radeon',
    productId: 'r9700',
    href: AMD_R9700_SPEC,
    memory: {
      value: '64 GB (2 × 32 GB GDDR6)',
      href: AMD_R9700_SPEC,
      source: 'AMD R9700 product page, two cards',
    },
    bandwidth: {
      value: 'two 640 GB/s pools — not 1280 GB/s on one chat',
      href: AMD_R9700_SPEC,
      source: 'AMD R9700 product page. A split is not 2× bandwidth.',
    },
    power: {
      value: '2 × 300 W TBP (per card; dual wall not measured)',
      href: AMD_R9700_SPEC,
      source: 'AMD R9700 product page, two cards',
    },
  },
  {
    id: 'strix-halo',
    name: 'Ryzen AI Max+ 395 / Strix Halo',
    camp: 'radeon',
    productId: 'strix-halo',
    href: AMD_STRIX_SPEC,
    memory: {
      value: 'up to 128 GB LPDDR5x (256-bit), shared',
      href: AMD_STRIX_SPEC,
      source: 'AMD Ryzen AI Max+ 395 product page',
    },
    bandwidth: {
      value: '256 GB/s on the Halo developer platform',
      href: AMD_STRIX_HALO_PLATFORM,
      source: 'AMD Ryzen AI Halo developer platform (128 GB, 8000 MT/s)',
    },
    power: {
      value: '55 W default TDP; Halo platform 120 W',
      href: AMD_STRIX_SPEC,
      source: 'AMD AI Max+ 395 product page (55 W) and Halo platform (120 W)',
    },
  },
  {
    id: 'm4-max',
    name: 'Mac Studio M4 Max (2025)',
    camp: 'mac',
    productId: null,
    href: APPLE_STUDIO_2025,
    memory: {
      value: '36 GB unified; 40-core GPU configurable 48 / 64 / 128 GB',
      href: APPLE_STUDIO_2025,
      source: 'Apple — Mac Studio (2025) tech specs',
    },
    bandwidth: {
      value: '410 GB/s (32-core GPU); 546 GB/s (40-core GPU)',
      href: APPLE_STUDIO_2025,
      source: 'Apple — Mac Studio (2025) tech specs',
    },
    power: {
      value: '480 W maximum continuous power (Studio enclosure)',
      href: APPLE_STUDIO_2025,
      source: 'Apple — Mac Studio (2025) electrical requirements',
    },
  },
  {
    id: 'm3-ultra',
    name: 'Mac Studio M3 Ultra (2025)',
    camp: 'mac',
    productId: null,
    href: APPLE_STUDIO_2025,
    memory: {
      value: '96 GB unified; configurable 256 GB',
      href: APPLE_STUDIO_2025,
      source: 'Apple — Mac Studio (2025) tech specs',
    },
    bandwidth: { value: '819 GB/s', href: APPLE_STUDIO_2025, source: 'Apple — Mac Studio (2025) tech specs' },
    power: {
      value: '480 W maximum continuous power (Studio enclosure)',
      href: APPLE_STUDIO_2025,
      source: 'Apple — Mac Studio (2025) electrical requirements',
    },
  },
  {
    id: 'm5-max',
    name: 'Mac Studio M5 Max',
    camp: 'mac',
    productId: null,
    href: APPLE_STUDIO_SPECS,
    memory: {
      value: '36 GB unified; 40-core GPU configurable 48 / 64 / 128 GB',
      href: APPLE_STUDIO_SPECS,
      source: 'Apple — Mac Studio technical specifications',
    },
    bandwidth: {
      value: '460 GB/s (32-core GPU); 614 GB/s (40-core GPU)',
      href: APPLE_STUDIO_SPECS,
      source: 'Apple — Mac Studio technical specifications',
    },
    power: {
      value: '480 W maximum continuous power (Studio enclosure)',
      href: APPLE_STUDIO_SPECS,
      source: 'Apple — Mac Studio electrical requirements',
    },
  },
  {
    id: 'm5-ultra',
    name: 'Mac Studio M5 Ultra',
    camp: 'mac',
    productId: null,
    href: APPLE_STUDIO_SPECS,
    memory: {
      value: '96 GB unified; configurable 256 / 512 GB',
      href: APPLE_STUDIO_SPECS,
      source: 'Apple — Mac Studio technical specifications',
    },
    bandwidth: { value: '1.2 TB/s', href: APPLE_STUDIO_SPECS, source: 'Apple — Mac Studio technical specifications' },
    power: {
      value: '480 W maximum continuous power (Studio enclosure)',
      href: APPLE_STUDIO_SPECS,
      source: 'Apple — Mac Studio electrical requirements',
    },
  },
];

export const SPEED_QUANTS = ['UD-Q5_K_XL', 'Q5_K_M', 'Q4_K_M'] as const;
export const SPEED_CONTEXTS = [4096] as const;

export type MeasuredSpeedRow = {
  id: string;
  quant: (typeof SPEED_QUANTS)[number];
  context: number;
  contextLabel: string;
  one: Qwen36SideCell;
  mac: typeof MAC_SPEED_EMPTY;
  strix: typeof MAC_SPEED_EMPTY;
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
        mac: MAC_SPEED_EMPTY,
        strix: MAC_SPEED_EMPTY,
      });
    }
  }
  return rows;
}

export type AxisRow = {
  id: string;
  title: string;
  radeon: string;
  mac: string;
  kind: 'cited' | 'measured' | 'pending';
};

export const AXIS_ROWS: AxisRow[] = [
  {
    id: 'memory',
    title: 'Usable model memory',
    kind: 'cited',
    radeon:
      'Discrete VRAM is the sticker: 32 GB on the R9700, 24 GB on the 7900 XTX, 64 GB as two R9700s. Strix Halo is one shared LPDDR5x pool — AMD lists max 128 GB. An AMD article on the 128 GB kit says up to 112 GB allocatable by the GPU. The calculator’s 70% unified slice is an estimate, not a BIOS reading.',
    mac:
      'Apple lists unified memory on the Mac Studio spec pages (M4 Max 36–128 GB, M3 Ultra 96–256 GB, M5 Max 36–128 GB, M5 Ultra 96–512 GB). macOS keeps a slice. We do not invent a Metal usable percent. The calculator’s 70% unified default is an estimate, not a Metal reading.',
  },
  {
    id: 'bandwidth',
    title: 'Memory bandwidth',
    kind: 'cited',
    radeon:
      'Cited AMD peaks: R9700 640 GB/s, 7900 XTX 960 GB/s. Two cards are two pools, not 1280 GB/s on one model. Strix Halo bandwidth on the Halo developer platform is 256 GB/s (128 GB, 8000 MT/s). The AI Max+ 395 product page lists LPDDR5x-8000 and 256-bit — we do not derive a second GB/s from that.',
    mac:
      'Cited Apple peaks on Mac Studio: M4 Max 410 GB/s (32-core) / 546 GB/s (40-core); M3 Ultra 819 GB/s; M5 Max 460 / 614 GB/s; M5 Ultra 1.2 TB/s. Peak GB/s is not a tok/s.',
  },
  {
    id: 'prefill-decode',
    title: 'Prefill vs decode',
    kind: 'pending',
    radeon:
      'Measured on the local desktop llama.cpp Vulkan, one R9700, house 35B only. Decode and prefill live in the table below and on /benchmarks. Strix Halo speed stays not measured here. Dual-card split of the same file is often slower than one card at short context — that is a measured split tax, not a Mac number.',
    mac:
      'Mac prefill and decode for this 35B file stay not measured here. We will only print a third-party llama.cpp figure with a source link, labeled third-party, and not apples-to-apples. MLX is a different engine. Do not copy a viral screenshot onto this page.',
  },
  {
    id: 'software',
    title: 'Software stack',
    kind: 'cited',
    radeon:
      'llama.cpp first: Vulkan (GGML_VULKAN=ON) is the house daily driver; HIP (GGML_HIP=ON) after rocminfo lists the gfx. Cited at llama.cpp build.md and /compare/vulkan-vs-rocm. Strata / vLLM stay on /backends.',
    mac:
      'llama.cpp Metal is the documented macOS GPU compile (GGML_METAL). MLX is Apple’s array framework — a different stack, not a llama.cpp tok/s. We do not invent a Metal-in-Linux path. Asahi Linux exists; it is not measured on the local desktop.',
  },
  {
    id: 'upgrade',
    title: 'Upgradeability',
    kind: 'cited',
    radeon:
      'A discrete card swaps. A second R9700 is a measured layout on the local desktop. Strix Halo memory is the soldered kit — pick 64 GB or 128 GB at purchase. AMD lists max 128 GB.',
    mac:
      'Unified memory is configured at purchase on Apple’s spec pages. You do not add a GPU later. A bigger Studio SKU is a different product, not an upgrade slot.',
  },
  {
    id: 'power',
    title: 'Power',
    kind: 'cited',
    radeon:
      'Board labels: R9700 300 W TBP, 7900 XTX 355 W TBP. Two cards are 2 × 300 W TBP cited — not a dual-card wall figure we measured. Strix Halo default TDP is 55 W; the Halo developer platform lists 120 W. PSU sizing stays on /power. No invented kit wattage.',
    mac:
      'Apple lists Mac Studio maximum continuous power as 480 W. That is the enclosure, not a chip TDP we invent. Idle or LLM-load watts are not measured here.',
  },
  {
    id: 'linux',
    title: 'Linux support',
    kind: 'cited',
    radeon:
      'Ubuntu 24.04+ is the measured local desktop path. llama.cpp Vulkan first. ROCm 10.1 lists the R9700 / gfx1201 and Ryzen AI Max+ 395 / gfx1151 rows. Windows Vulkan is a cited estimate at /setup/windows.',
    mac:
      'macOS is Apple’s listed OS on the Studio spec pages. llama.cpp Metal and MLX are macOS stories. Asahi Linux is a cited third-party Apple Silicon Linux project — not measured on the local desktop, not a Metal port.',
  },
];

export type SoftwareRow = {
  id: string;
  name: string;
  radeon: string;
  mac: string;
  hrefs: { href: string; label: string }[];
};

export const SOFTWARE_ROWS: SoftwareRow[] = [
  {
    id: 'llamacpp-vulkan-metal',
    name: 'llama.cpp · Vulkan vs Metal',
    radeon:
      'Consumer default on AMDai. House daily driver is one R9700, Vulkan, UD-Q5_K_XL, 262K, f16 KV. Measured on the local desktop.',
    mac:
      'llama.cpp documents GGML_METAL on macOS. We have no ingested first-party or cited third-party 35B Metal tok/s for the Studio SKUs on this page, so those cells stay not measured here.',
    hrefs: [
      { href: '/backends/llamacpp', label: 'llama.cpp on AMDai' },
      { href: LLAMACPP_REPO, label: 'llama.cpp repository' },
      { href: LLAMA_BUILD_MD, label: 'llama.cpp build.md' },
    ],
  },
  {
    id: 'llamacpp-hip',
    name: 'llama.cpp · ROCm / HIP',
    radeon:
      'HIP is the ROCm compile when rocminfo lists the gfx. Shopper compare: /compare/vulkan-vs-rocm. Try Vulkan first if HIP configure is a mess.',
    mac: 'HIP is not an Apple path. Metal is the matching llama.cpp compile on macOS.',
    hrefs: [
      { href: '/compare/vulkan-vs-rocm', label: 'Vulkan vs ROCm' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/rocm', label: 'What is ROCm' },
    ],
  },
  {
    id: 'mlx',
    name: 'MLX',
    radeon: 'MLX is not a Radeon stack. Do not expect a HIP MLX.',
    mac:
      'MLX is Apple’s array framework on Apple Silicon. It is not llama.cpp and not a local desktop card. We do not invent an MLX 35B tok/s.',
    hrefs: [{ href: MLX_REPO, label: 'ml-explore/mlx' }],
  },
  {
    id: 'linux',
    name: 'Linux vs macOS',
    radeon:
      'Ubuntu LTS on AMD’s current ROCm matrix is the path we write and measure. llama.cpp Vulkan is the honest Windows path for tokens on Radeon.',
    mac:
      'macOS is what Apple lists. Asahi Linux is a cited Apple Silicon Linux project. We do not have an Asahi or macOS tok/s, and we do not invent Vulkan-on-Asahi.',
    hrefs: [
      { href: '/setup', label: 'First-run setup' },
      { href: ASAHI_HOME, label: 'Asahi Linux' },
    ],
  },
];

export type DecisionCase = {
  id: string;
  title: string;
  pick: string;
  body: string;
  ram?: 'daily' | 'q3' | 'xtx' | 'strix';
  links: { href: string; label: string }[];
};

export const DECISION_CASES: DecisionCase[] = [
  {
    id: 'speed-35b',
    title: 'Speed on the house 35B',
    pick: 'One R9700 if you want the path we measured.',
    body:
      'House daily driver is Qwen3.6-35B-A3B Unsloth UD-Q5_K_XL on one R9700, llama.cpp Vulkan, 262144 context, f16 KV. Decode in the table is that card. A 7900 XTX is the 24 GB discrete sibling — size Q6/Q5/Q4 on the calculator. Mac Studio and Strix Halo speed stay not measured here. Do not pick a Mac to chase an unmeasured tok/s.',
    ram: 'daily',
    links: [
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: 'Daily-driver recipe' },
      { href: '/benchmarks', label: 'Benchmarks' },
    ],
  },
  {
    id: 'max-size',
    title: 'Max model size',
    pick: 'Buy the memory class, then size the file.',
    body:
      '32 GB discrete (R9700) holds the house 35B Q5 at 262K without offload on our cards. 24 GB (7900 XTX) is the next discrete bracket — Q4 may fit; Q6 at long context needs the calculator and both RAM lines if layers spill. Two R9700s are 64 GB of VRAM. Strix Halo and Mac Ultra list much larger unified pools (AMD max 128 GB; Apple M3 Ultra up to 256 GB; M5 Ultra up to 512 GB). Unified is one kit with the OS. We do not invent a “fits” claim past the calculator and the vendor memory label. Q3 stays a labeled estimate.',
    ram: 'xtx',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/gpus/strix-halo', label: 'Strix Halo' },
      { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/quants', label: 'Quants' },
    ],
  },
  {
    id: 'long-context',
    title: 'Long context',
    pick: 'The measured 262K path is one R9700, llama.cpp Vulkan, f16 KV.',
    body:
      'Overnight 35B cards publish 4K / 32K / 128K / 256K because KV grows and decode slows. That is a Radeon Vulkan sweep. Mac and Strix Halo long-context tok/s stay not measured here. Size KV on the calculator. Print both RAM lines when the file or the window spills onto the host.',
    ram: 'daily',
    links: [
      { href: '/long-context', label: 'Long context' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'budget',
    title: 'Budget / already-own',
    pick: 'Used 7900 XTX or a kit you already own. We do not print a price.',
    body:
      'Buttons on AMDai say Check price — no live or stale figure. A used 7900 XTX walk is /guides/buying-used-radeon. A Mac you already own should start with llama.cpp Metal; do not buy a Radeon unless you want Linux, a swappable card, or the measured 35B path. Strix Halo is the AMD unified-memory box when you want one kit and no discrete GPU. Q3 stays a labeled estimate. Q1/Q2 stay off.',
    ram: 'strix',
    links: [
      { href: '/guides/buying-used-radeon', label: 'Buying a used Radeon' },
      { href: '/budget', label: 'Budget' },
      { href: '/disclosure', label: 'Affiliate disclosure' },
      { href: '/gpus/strix-halo', label: 'Strix Halo' },
    ],
  },
];

export const LEAD = {
  winsRadeon:
    'Radeon wins the path we measured: 32 GB on one R9700, a 24 GB 7900 XTX, two-card 64 GB we have cards for, and Ubuntu llama.cpp Vulkan. Strix Halo is the AMD unified-memory option when the file is bigger than 32 GB and you accept shared LPDDR5x. Buttons say Check price — we do not print a figure.',
  winsMac:
    'A Mac Studio wins soldered unified capacity on the high Ultra kits and a quiet one-box macOS install. llama.cpp Metal is the documented compile. That is not a tok/s we measured, and it is not a swappable GPU.',
  honest:
    'Shoppers search “Mac Studio vs GPU for LLM”, “M4 Max vs 7900 XTX”, and “Strix Halo vs Mac.” This page cites AMD and Apple spec pages for hardware. Speed that is ours says measured. Mac and Strix Halo speed stay not measured here until a third-party llama.cpp figure is linked. No invented prices.',
  decision:
    'Pick one R9700 when you want the measured house 35B on Linux. Pick a 7900 XTX when 24 GB discrete is the bracket. Pick two R9700s when you want 64 GB VRAM we have split cards for. Pick Strix Halo or a Mac Ultra kit when the file is bigger than one discrete sticker and you accept one shared pool. Already on a Mac? llama.cpp Metal first. Do not buy either camp to chase an unmeasured tok/s.',
};

export const SPEED_NOTE =
  'R9700 decode is measured on the local desktop (amdai-bench/run@1, llama.cpp Vulkan, one card). Mac and Strix Halo cells say “not measured here.” A third-party llama.cpp figure may appear later only with a source link, labeled third-party, and not apples-to-apples (different engine, quant, or context). We will not estimate one.';

export const FIT_QUANTS: { id: QuantId; label: string; kind: 'estimate' | 'q3-estimate' }[] = [
  { id: 'q6_k', label: 'Q6_K', kind: 'estimate' },
  { id: 'q5_k_m', label: 'Q5_K_M / UD-Q5_K_XL', kind: 'estimate' },
  { id: 'q4_k_m', label: 'Q4_K_M', kind: 'estimate' },
  { id: 'q3_k_xl', label: COMPARE_Q3, kind: 'q3-estimate' },
];

export const FIT_KITS = [
  { id: 'r9700', name: 'R9700 32 GB', gpuId: 'r9700' as const, vramGb: 32, ramGb: 64, kind: 'discrete' as const, usablePct: 100, gpuCount: 1, split: false },
  { id: 'xtx', name: '7900 XTX 24 GB', gpuId: 'rx7900xtx' as const, vramGb: 24, ramGb: 64, kind: 'discrete' as const, usablePct: 100, gpuCount: 1, split: false },
  { id: 'dual', name: 'Two R9700 64 GB', gpuId: 'r9700' as const, vramGb: 32, ramGb: 192, kind: 'discrete' as const, usablePct: 100, gpuCount: 2, split: true },
  { id: 'strix-128', name: 'Strix Halo 128 GB', gpuId: 'strix-halo' as const, vramGb: 128, ramGb: 128, kind: 'unified' as const, usablePct: 70, gpuCount: 1, split: false },
  { id: 'mac-128', name: 'Mac 128 GB unified', gpuId: 'unified' as const, vramGb: 128, ramGb: 128, kind: 'unified' as const, usablePct: 70, gpuCount: 1, split: false },
] as const;

export const FIT_CONTEXT = 32768;

export type FitCell = {
  kitId: string;
  usableGb: string;
  totalGb: string;
  verdictLabel: string;
  note: string;
};

export type FitRow = {
  quant: string;
  kind: 'estimate' | 'q3-estimate';
  weightsGb: string;
  cells: FitCell[];
};

export function fitRows(): FitRow[] {
  return FIT_QUANTS.map((quant) => {
    const base = fitInput(FIT_KITS[0], quant.id);
    const weights = compute(base);
    return {
      quant: quant.label,
      kind: quant.kind,
      weightsGb: `${formatGiB(weights.weightsGiB)} GB`,
      cells: FIT_KITS.map((kit) => {
        const input = fitInput(kit, quant.id);
        const result = compute(input);
        return {
          kitId: kit.id,
          usableGb: `${formatGiB(result.usableVramGb)} GB`,
          totalGb: `${formatGiB(result.totalGiB)} GB`,
          verdictLabel: result.verdictLabel,
          note:
            kit.kind === 'unified'
              ? '70% unified slice — estimate, not a Metal or BIOS reading.'
              : quant.kind === 'q3-estimate'
                ? `${COMPARE_Q3_CITE}.`
                : 'Calculator estimate at 32K, f16 KV, llama.cpp.',
        };
      }),
    };
  });
}

function fitInput(kit: (typeof FIT_KITS)[number], quantId: QuantId) {
  let input = applyGpuPreset(kit.gpuId, {
    ...DEFAULT_INPUT,
    ramGb: kit.ramGb,
    vramGb: kit.vramGb,
    kind: kit.kind,
    usablePct: kit.usablePct,
    view: 'gpu',
  });
  input = applyModelPreset('qwen36', input);
  return {
    ...input,
    gpuId: kit.gpuId,
    vramGb: kit.vramGb,
    ramGb: kit.ramGb,
    kind: kit.kind,
    usablePct: kit.usablePct,
    quantId,
    context: FIT_CONTEXT,
    kvId: 'f16' as const,
    backendId: 'llamacpp' as const,
    pathId: 'vulkan' as const,
    gpuCount: kit.gpuCount,
    split: kit.split,
    fileWeightGiB: null,
  };
}

export const REQUIRED_PAGE_HREFS = [
  '/compare',
  '/compare/radeon-vs-nvidia',
  '/compare/vulkan-vs-rocm',
  '/gpus/r9700',
  '/gpus/rx-7900-xtx',
  '/gpus/strix-halo',
  '/gpus',
  '/benchmarks',
  '/results',
  '/calculator',
  '/budget',
  '/faq',
  '/glossary',
  '/backends',
  '/backends/llamacpp',
  '/rocm',
  '/rocm/vulkan-hip',
  '/setup',
  '/multi-gpu',
  '/compare/one-vs-two-gpu',
  '/compare/q4-q5-q6',
  '/long-context',
  '/guides/buying-used-radeon',
  '/disclosure',
  '/power',
] as const;

function readSrcData(name: string): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(here, '../data', name), join(process.cwd(), 'src/data', name)];
  for (const file of candidates) {
    if (existsSync(file)) return readFileSync(file, 'utf8');
  }
  throw new Error(`${name} missing`);
}

export function radeonProductIds(): string[] {
  return [...new Set(SPEC_ROWS.filter((row) => row.productId).map((row) => row.productId as string))];
}

export function xtxOffloadRamNeed(): SystemRamNeed {
  let input = applyGpuPreset('rx7900xtx', { ...DEFAULT_INPUT, ramGb: 64, view: 'gpu' });
  input = applyModelPreset('qwen36', input);
  return systemRamNeed({
    ...input,
    gpuId: 'rx7900xtx',
    quantId: 'q6_k',
    context: 262144,
    kvId: 'f16',
    backendId: 'llamacpp',
    pathId: 'vulkan',
    gpuCount: 1,
    split: false,
    fileWeightGiB: null,
  });
}

export function strixRamNeed(): SystemRamNeed {
  let input = applyGpuPreset('strix-halo', {
    ...DEFAULT_INPUT,
    ramGb: 128,
    vramGb: 128,
    kind: 'unified',
    usablePct: 70,
    view: 'gpu',
  });
  input = applyModelPreset('qwen36', input);
  return systemRamNeed({
    ...input,
    gpuId: 'strix-halo',
    vramGb: 128,
    ramGb: 128,
    kind: 'unified',
    usablePct: 70,
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

export function dailyRamNeed() {
  return houseSystemRam('daily');
}

export function radeonVsMacBlob(cards: RunCard[]): string {
  const speed = measuredSpeedRows(cards);
  const fit = fitRows();
  return [
    LEAD.winsRadeon,
    LEAD.winsMac,
    LEAD.honest,
    LEAD.decision,
    SPEED_NOTE,
    RADEON_VS_MAC_NAME,
    RADEON_VS_MAC_HEADING,
    COMPARE_MODEL,
    COMPARE_ENGINE,
    COMPARE_Q3,
    COMPARE_Q3_CITE,
    SWEEP_REVERIFY,
    MAC_SPEED_EMPTY,
    RAM_MIN_LABEL,
    RAM_FULL_LABEL,
    'Q6_K',
    'Q5_K_M',
    'Q4_K_M',
    SPEC_ROWS.map((row) => `${row.name} ${row.memory.value} ${row.bandwidth.value} ${row.power.value}`).join('\n'),
    AXIS_ROWS.map((row) => `${row.title} ${row.radeon} ${row.mac}`).join('\n'),
    SOFTWARE_ROWS.map((row) => `${row.name} ${row.radeon} ${row.mac}`).join('\n'),
    DECISION_CASES.map((row) => `${row.title} ${row.pick} ${row.body}`).join('\n'),
    speed.map((row) => `${row.quant} ${row.one.decode} ${row.mac} ${row.strix}`).join('\n'),
    fit.map((row) => `${row.quant} ${row.weightsGb}`).join('\n'),
  ].join('\n');
}

export function radeonVsMacHrefs(): string[] {
  const hrefs = [
    RADEON_VS_MAC_PATH,
    ...REQUIRED_PAGE_HREFS,
    ...SPEC_ROWS.flatMap((row) => [row.href, row.memory.href, row.bandwidth.href, row.power.href]),
    ...SOFTWARE_ROWS.flatMap((row) => row.hrefs.map((link) => link.href)),
    ...DECISION_CASES.flatMap((row) => row.links.map((link) => link.href)),
    AMD_STRIX_ALLOC,
    LLAMA_BUILD_MD,
    MLX_REPO,
    ASAHI_HOME,
  ];
  return [...new Set(hrefs.map((href) => (href.split('?')[0] ?? href).split('#')[0] ?? href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');
const PRICE = /\$\d|\bMSRP\b|\bUSD\b|\bSEP\b/i;

export function assertRadeonVsMacValid(cards: RunCard[]): string[] {
  const errors: string[] = [];
  const blob = radeonVsMacBlob(cards);
  const hrefs = new Set(radeonVsMacHrefs());
  const speed = measuredSpeedRows(cards);
  const products = parse(readSrcData('products.yaml')) as {
    products: Array<{ id: string }>;
  };
  const productIds = new Set(products.products.map((row) => row.id));

  if (SPEC_ROWS.length < 8) errors.push('expected Radeon + Mac spec rows');
  if (!SPEC_ROWS.some((row) => row.id === 'r9700' && row.memory.value.startsWith('32 GB'))) {
    errors.push('R9700 must cite 32 GB');
  }
  if (!SPEC_ROWS.some((row) => row.id === 'rx7900xtx' && row.memory.value.startsWith('24 GB'))) {
    errors.push('7900 XTX must cite 24 GB');
  }
  if (!SPEC_ROWS.some((row) => row.id === 'r9700-x2' && /64 GB/.test(row.memory.value))) {
    errors.push('dual R9700 must cite 64 GB');
  }
  if (!SPEC_ROWS.some((row) => row.id === 'strix-halo' && /128 GB/.test(row.memory.value))) {
    errors.push('Strix Halo must cite 128 GB max');
  }
  if (!SPEC_ROWS.some((row) => row.id === 'm4-max' && /410 GB\/s/.test(row.bandwidth.value))) {
    errors.push('M4 Max must cite 410 GB/s');
  }
  if (!SPEC_ROWS.some((row) => row.id === 'm5-ultra' && /1\.2 TB\/s/.test(row.bandwidth.value))) {
    errors.push('M5 Ultra must cite 1.2 TB/s');
  }

  for (const row of SPEC_ROWS) {
    for (const cell of [row.memory, row.bandwidth, row.power]) {
      if (!cell.href.startsWith('https://')) errors.push(`${row.id} ${cell.value} missing vendor href`);
      const host = new URL(cell.href).hostname;
      if (row.camp === 'radeon' && !host.endsWith('amd.com')) {
        errors.push(`${row.id} spec must cite AMD`);
      }
      if (row.camp === 'mac' && !host.endsWith('apple.com')) {
        errors.push(`${row.id} spec must cite Apple`);
      }
      if (!cell.source) errors.push(`${row.id} unlabeled source`);
    }
    if (row.productId && !productIds.has(row.productId)) {
      errors.push(`${row.id} missing products.yaml ${row.productId}`);
    }
    if (row.camp === 'mac' && row.productId) errors.push(`${row.id} must not invent a /go/ Mac product`);
  }

  if (speed.length !== SPEED_QUANTS.length * SPEED_CONTEXTS.length) {
    errors.push(`expected ${SPEED_QUANTS.length * SPEED_CONTEXTS.length} measured speed rows`);
  }
  for (const row of speed) {
    if (row.one.decode === 'not measured' || !row.one.runIds.length) {
      errors.push(`${row.id} 1× decode is not a measured card`);
    }
    if (row.mac !== MAC_SPEED_EMPTY) errors.push(`${row.id} invented Mac tok/s`);
    if (row.strix !== MAC_SPEED_EMPTY) errors.push(`${row.id} invented Strix Halo tok/s`);
    if (!/tok\/s/.test(row.one.decode)) errors.push(`${row.id} 1× missing tok/s`);
  }
  const ud4k = speed.find((row) => row.quant === 'UD-Q5_K_XL' && row.context === 4096);
  if (ud4k?.one.decode !== '102.39 tok/s') errors.push('UD-Q5 1× 4K drifted');

  const fit = fitRows();
  if (fit.length !== 4) errors.push('fit table must be Q6/Q5/Q4 + Q3');
  if (fit.some((row) => row.kind === 'q3-estimate' && row.quant !== COMPARE_Q3)) {
    errors.push('Q3 fit row drifted');
  }

  if (!blob.includes(COMPARE_Q3)) errors.push('missing Q3 estimate');
  if (!/estimate/i.test(COMPARE_Q3_CITE + blob)) errors.push('Q3 unlabeled');
  if (!blob.includes(MAC_SPEED_EMPTY)) errors.push('Mac speed must stay empty until cited');
  if (!blob.includes(RAM_MIN_LABEL)) errors.push(`missing ${RAM_MIN_LABEL}`);
  if (!blob.includes(RAM_FULL_LABEL)) errors.push(`missing ${RAM_FULL_LABEL}`);
  if (!/Q6_K/.test(blob) || !/Q5_K_M/.test(blob) || !/Q4_K_M/.test(blob)) errors.push('must list Q6/Q5/Q4');
  if (!/llama\.cpp/i.test(blob)) errors.push('must keep llama.cpp first');
  if (!/GGML_METAL/.test(blob) || !/GGML_VULKAN/.test(blob)) errors.push('must cite Metal and Vulkan flags');
  if (!/third-party/.test(blob)) errors.push('must label third-party Mac figures');

  const q3 = q3EstimateRam();
  const xtx = xtxOffloadRamNeed();
  const strix = strixRamNeed();
  for (const [name, need] of [
    ['q3', q3],
    ['xtx', xtx],
    ['strix', strix],
  ] as const) {
    if (!(DIMM_KIT_GB as readonly number[]).includes(need.atSelected.kitGb)) {
      errors.push(`${name} min kit ${need.atSelected.kitGb} is not a real DIMM size`);
    }
    if (!(DIMM_KIT_GB as readonly number[]).includes(need.atFullContext.kitGb)) {
      errors.push(`${name} full kit ${need.atFullContext.kitGb} is not a real DIMM size`);
    }
  }
  if (!dailyRamNeed()) errors.push('daily house RAM missing');

  for (const required of REQUIRED_PAGE_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}`))) {
      errors.push(`missing required href ${required}`);
    }
  }

  if (BANNED.test(blob)) errors.push('banned model');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (PRICE.test(blob)) errors.push('invented price');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');

  return [...new Set(errors)];
}

export { COMPARE_Q3, COMPARE_Q3_CITE, COMPARE_MODEL, COMPARE_ENGINE, RAM_FULL_LABEL, RAM_MIN_LABEL };
