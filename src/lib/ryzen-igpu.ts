/**
 * Cited Ryzen iGPU guide at /gpus/ryzen-igpu.
 * 780M / 760M (gfx1103) and 880M / 890M (gfx1150). Shared system memory.
 * Not measured on the local desktop. Calculator math only.
 * Do not invent tok/s, prices, GB/s, or a Stack Lab package.
 * Strix Halo (gfx1151 / 8060S) stays on /gpus/strix-halo.
 */

import {
  DEFAULT_INPUT,
  DIMM_KIT_GB,
  GPU_PRESETS,
  OS_DESKTOP_BASELINE_GIB,
  RAM_HEADROOM_GIB,
  applyGpuPreset,
  applyModelPreset,
  compute,
  formatCtx,
  formatGiB,
  inputToQuery,
  type CalcInput,
  type ModelId,
  type QuantId,
  type Verdict,
} from './calculator';
import { gpuCardId } from './gpu-ids';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import type { GpuDirectory } from './status';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

export const RYZEN_IGPU_ID = 'ryzen-igpu';
export const RYZEN_IGPU_PATH = '/gpus/ryzen-igpu';
export const RYZEN_IGPU_PUBLISHED = '2026-10-14';
export const RYZEN_IGPU_CITED_LABEL = 'Cited, not measured on the local desktop';
export const RYZEN_IGPU_NAME = 'AMD Ryzen iGPU (Radeon 780M / 890M)';
export const RYZEN_IGPU_SHORT = 'Ryzen iGPU';
export const RYZEN_IGPU_HEADING = 'Local AI on a Ryzen iGPU (Radeon 780M, 880M, 890M)';
export const RYZEN_IGPU_ENGINE = 'llama.cpp';
export const RYZEN_IGPU_USABLE_PCT = 70;
export const RYZEN_IGPU_KITS = [32, 64, 96] as const;
export type RyzenIgpuKit = (typeof RYZEN_IGPU_KITS)[number];
export const RYZEN_IGPU_RAM_QUANT: QuantId = 'q4_k_m';
export const RYZEN_IGPU_RAM_QUANT_LABEL = 'Q4_K_M';
export const RYZEN_IGPU_RAM_CONTEXT = 32768;
export const RYZEN_IGPU_SPEED = 'no cited number';

export const RYZEN_IGPU_FIT_QUANTS = [
  { id: 'q6_k' as const, label: 'Q6_K', kind: 'estimate' as const },
  { id: 'q5_k_m' as const, label: 'Q5_K_M', kind: 'estimate' as const },
  { id: 'q4_k_m' as const, label: 'Q4_K_M', kind: 'estimate' as const },
  { id: 'q3_k_xl' as const, label: COMPARE_Q3, kind: 'q3-estimate' as const },
];

export const RYZEN_IGPU_MODELS = [
  { id: 'qwen36' as const, name: 'Qwen3.6-35B-A3B' },
  { id: 'flash' as const, name: 'Qwen 3.8 Flash' },
] as const;

export const AMD_8700G =
  'https://www.amd.com/en/products/processors/desktops/ryzen/8000-series/amd-ryzen-7-8700g.html';
export const AMD_8600G =
  'https://www.amd.com/en/products/processors/desktops/ryzen/8000-series/amd-ryzen-5-8600g.html';
export const AMD_HX370 =
  'https://www.amd.com/en/products/processors/laptop/ryzen/ai-300-series/amd-ryzen-ai-9-hx-370.html';
export const AMD_AI365 =
  'https://www.amd.com/en/products/processors/laptop/ryzen/ai-300-series/amd-ryzen-ai-9-365.html';
export const ROCM_GPU_SPECS = 'https://rocm.docs.amd.com/en/docs-10.1.0/reference/gpu-specs.html';
export const ROCM_MATRIX = 'https://rocm.docs.amd.com/en/docs-10.1.0/compatibility/compatibility-matrix.html';
export const ROCM_RDNA35 =
  'https://rocm.docs.amd.com/en/docs-10.1.0/reference/system-optimization/rdna3-5.html';
export const LLAMA_BUILD = 'https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md';

export const RYZEN_IGPU_SOURCES = [
  { id: '8700g', title: 'AMD — Ryzen 7 8700G product page (Radeon 780M)', href: AMD_8700G },
  { id: '8600g', title: 'AMD — Ryzen 5 8600G product page (Radeon 760M)', href: AMD_8600G },
  { id: 'hx370', title: 'AMD — Ryzen AI 9 HX 370 product page (Radeon 890M)', href: AMD_HX370 },
  { id: 'ai365', title: 'AMD — Ryzen AI 9 365 product page (Radeon 880M)', href: AMD_AI365 },
  { id: 'gpu-specs', title: 'AMD — ROCm 10.1.0 GPU specifications (Ryzen APUs; Dynamic + carveout)', href: ROCM_GPU_SPECS },
  { id: 'matrix', title: 'AMD — ROCm 10.1.0 compatibility matrix (gfx1103 / gfx1150)', href: ROCM_MATRIX },
  { id: 'rdna35', title: 'AMD — RDNA 3.5 system optimization (GTT / UMA / TTM)', href: ROCM_RDNA35 },
  { id: 'build', title: 'llama.cpp — build.md (Vulkan backend)', href: LLAMA_BUILD },
] as const;

export const RYZEN_IGPU_SECTIONS = [
  { id: 'chips', label: 'Which chips' },
  { id: 'memory', label: 'Shared memory' },
  { id: 'backend', label: 'Backend' },
  { id: 'what-fits', label: 'What fits' },
  { id: 'speeds', label: 'Speeds' },
  { id: 'house', label: 'House launch' },
  { id: 'upgrade', label: 'When to add a dGPU' },
] as const;

export const REQUIRED_RYZEN_IGPU_HREFS = [
  '/calculator',
  '/can-run',
  '/bios',
  '/gpus',
  '/gpus/strix-halo',
  '/gpus/r9700',
  '/compare/gpus',
  '/budget',
  '/backends/llamacpp',
  '/rocm/gfx',
  '/faq',
  '/glossary',
  '/setup',
  '/stack-lab',
  '/amdai-bench',
] as const;

export type RyzenIgpuChip = {
  id: string;
  igpu: string;
  cpus: string;
  arch: string;
  gfx: string;
  cu: string;
  memory: string;
  rocm: string;
  cite: string;
};

export const RYZEN_IGPU_CHIPS: RyzenIgpuChip[] = [
  {
    id: '780m',
    igpu: 'Radeon 780M',
    cpus: 'Ryzen 7 8700G; Hawk Point Ryzen 7 260 / 250; Phoenix 7840U',
    arch: 'RDNA 3',
    gfx: 'gfx1103',
    cu: '12',
    memory: '8700G: DDR5-5200 (2×1R / 2×2R), 2 channels, max 256 GB',
    rocm: 'Hawk Point 780M is named on the ROCm 10.1 matrix. 8700G is not named there.',
    cite: 'AMD 8700G product page (Graphics Core Count 12); ROCm 10.1.0 GPU specs (12 CU, Dynamic + carveout)',
  },
  {
    id: '760m',
    igpu: 'Radeon 760M',
    cpus: 'Ryzen 5 8600G; Hawk Point Ryzen 5 240 / 230',
    arch: 'RDNA 3',
    gfx: 'gfx1103',
    cu: '8',
    memory: '8600G: DDR5-5200 (2×1R / 2×2R), 2 channels, max 256 GB',
    rocm: 'Hawk Point 760M is named on the ROCm 10.1 matrix. 8600G is not named there.',
    cite: 'AMD 8600G product page (Radeon 760M); ROCm 10.1.0 GPU specs (8 CU, Dynamic + carveout)',
  },
  {
    id: '880m',
    igpu: 'Radeon 880M',
    cpus: 'Ryzen AI 9 365',
    arch: 'RDNA 3.5',
    gfx: 'gfx1150',
    cu: '12',
    memory: 'DDR5-5600 or LPDDR5X-8000 (2×2R), 2 channels, max 256 GB',
    rocm: 'Official on the ROCm 10.1 Ryzen APU table as gfx1150.',
    cite: 'AMD Ryzen AI 9 365 product page (Graphics Core Count 12); ROCm 10.1.0 GPU specs (12 CU)',
  },
  {
    id: '890m',
    igpu: 'Radeon 890M',
    cpus: 'Ryzen AI 9 HX 370',
    arch: 'RDNA 3.5',
    gfx: 'gfx1150',
    cu: '16',
    memory: 'DDR5-5600 or LPDDR5X-8000 (2×2R), 2 channels, max 256 GB',
    rocm: 'Official on the ROCm 10.1 Ryzen APU table as gfx1150.',
    cite: 'AMD Ryzen AI 9 HX 370 product page (Graphics Core Count 16); ROCm 10.1.0 GPU specs (16 CU)',
  },
];

function readSrcData(name: string): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(here, '../data', name), join(process.cwd(), 'src/data', name)];
  for (const file of candidates) {
    if (existsSync(file)) return readFileSync(file, 'utf8');
  }
  throw new Error(`${name} missing`);
}

function loadGpuDirectory(): GpuDirectory {
  return parse(readSrcData('gpus.yaml')) as GpuDirectory;
}

const gpuDirectory = loadGpuDirectory();

export type RyzenFitKind = 'estimate' | 'q3-estimate';

export type RyzenKitCell = {
  kitGb: RyzenIgpuKit;
  sliceGb: string;
  totalGb: string;
  leftoverGb: string;
  leftoverNote: string;
  verdict: Verdict;
  verdictLabel: string;
  speed: typeof RYZEN_IGPU_SPEED;
  calculatorHref: string;
};

export type RyzenFitRow = {
  modelId: ModelId;
  model: string;
  quantId: QuantId;
  quant: string;
  kind: RyzenFitKind;
  kindLabel: string;
  context: number;
  contextLabel: string;
  weightsGb: string;
  weightsNote: string;
  speed: typeof RYZEN_IGPU_SPEED;
  kits: RyzenKitCell[];
};

export type RyzenRamLine = {
  label: typeof RAM_MIN_LABEL | typeof RAM_FULL_LABEL;
  context: number;
  contextLabel: string;
  rawGiB: string;
  kitLabel: string;
  leftover32: string;
  leftover64: string;
  leftover96: string;
  note: string;
};

export function ryzenIgpuCalcInput(
  modelId: ModelId,
  quant: QuantId,
  context: number,
  kitGb: RyzenIgpuKit,
): CalcInput {
  let input = applyGpuPreset('ryzen-igpu', {
    ...DEFAULT_INPUT,
    ramGb: kitGb,
    vramGb: kitGb,
    kind: 'unified',
    usablePct: RYZEN_IGPU_USABLE_PCT,
    view: 'gpu',
  });
  input = applyModelPreset(modelId, input);
  return {
    ...input,
    gpuId: 'ryzen-igpu',
    vramGb: kitGb,
    ramGb: kitGb,
    kind: 'unified',
    usablePct: RYZEN_IGPU_USABLE_PCT,
    quantId: quant,
    context,
    kvId: 'f16',
    backendId: 'llamacpp',
    pathId: 'vulkan',
    gpuCount: 1,
    split: false,
    fileWeightGiB: null,
  };
}

function kindLabel(kind: RyzenFitKind): string {
  return kind === 'q3-estimate' ? 'Q3 estimate' : 'Estimate';
}

function leftoverAfterModel(kitGb: number, totalGiB: number): number {
  return kitGb - totalGiB;
}

function leftoverAfterShare(kitGb: number): number {
  return kitGb * (1 - RYZEN_IGPU_USABLE_PCT / 100);
}

function kitNeedGiB(input: CalcInput): number {
  const result = compute(input);
  return result.totalGiB + OS_DESKTOP_BASELINE_GIB + RAM_HEADROOM_GIB;
}

function shopperKitLabel(needGiB: number): string {
  if (needGiB <= 32 + 1e-9) return '32 GB kit';
  if (needGiB <= 64 + 1e-9) return '64 GB kit';
  if (needGiB <= 96 + 1e-9) return '96 GB kit';
  if (needGiB <= 128 + 1e-9) return '128 GB kit';
  if (needGiB <= 192 + 1e-9) return '192 GB kit';
  if (needGiB <= 256 + 1e-9) return '256 GB kit';
  return 'Does not fit a 256 GB kit (AMD-published max on these SKUs)';
}

function fitRow(modelId: ModelId, spec: (typeof RYZEN_IGPU_FIT_QUANTS)[number], context: number): RyzenFitRow {
  const base = ryzenIgpuCalcInput(modelId, spec.id, context, 64);
  const weights = compute(base);
  const modelName = RYZEN_IGPU_MODELS.find((row) => row.id === modelId)?.name ?? modelId;
  return {
    modelId,
    model: modelName,
    quantId: spec.id,
    quant: spec.label,
    kind: spec.kind,
    kindLabel: kindLabel(spec.kind),
    context,
    contextLabel: formatCtx(context),
    weightsGb: `${formatGiB(weights.weightsGiB)} GB`,
    weightsNote: weights.weightsNote,
    speed: RYZEN_IGPU_SPEED,
    kits: RYZEN_IGPU_KITS.map((kitGb) => {
      const input = ryzenIgpuCalcInput(modelId, spec.id, context, kitGb);
      const result = compute(input);
      const leftover = leftoverAfterModel(kitGb, result.totalGiB);
      return {
        kitGb,
        sliceGb: `${formatGiB(result.usableVramGb)} GB`,
        totalGb: `${formatGiB(result.totalGiB)} GB`,
        leftoverGb: `${formatGiB(leftover)} GB`,
        leftoverNote:
          leftover >= 0
            ? `Left in the ${kitGb} GB kit after weights + KV + overhead.`
            : `The ${kitGb} GB kit is short of weights + KV + overhead.`,
        verdict: result.verdict,
        verdictLabel: result.verdictLabel,
        speed: RYZEN_IGPU_SPEED,
        calculatorHref: `/calculator?${inputToQuery(input)}`,
      };
    }),
  };
}

function ramLine(label: typeof RAM_MIN_LABEL | typeof RAM_FULL_LABEL, context: number): RyzenRamLine {
  const input32 = ryzenIgpuCalcInput('qwen36', RYZEN_IGPU_RAM_QUANT, context, 32);
  const need = kitNeedGiB(input32);
  const left32 = leftoverAfterModel(32, compute(input32).totalGiB);
  const left64 = leftoverAfterModel(64, compute(ryzenIgpuCalcInput('qwen36', RYZEN_IGPU_RAM_QUANT, context, 64)).totalGiB);
  const left96 = leftoverAfterModel(96, compute(ryzenIgpuCalcInput('qwen36', RYZEN_IGPU_RAM_QUANT, context, 96)).totalGiB);
  return {
    label,
    context,
    contextLabel: formatCtx(context),
    rawGiB: `${formatGiB(need)} GB`,
    kitLabel: shopperKitLabel(need),
    leftover32: `${formatGiB(left32)} GB`,
    leftover64: `${formatGiB(left64)} GB`,
    leftover96: `${formatGiB(left96)} GB`,
    note: `${label} for Qwen3.6-35B-A3B on llama.cpp at ${RYZEN_IGPU_RAM_QUANT_LABEL}, ${formatCtx(context)}. One shared pool: model total plus the calculator OS/desktop (${OS_DESKTOP_BASELINE_GIB} GB) and headroom (${RAM_HEADROOM_GIB} GB). Estimate until a measured card overlays the kit. AMD lists max memory 256 GB on the cited 8700G and HX 370 pages — we size 32 / 64 / 96 GB kits.`,
  };
}

export const RYZEN_IGPU_LAUNCH = [
  '# Shape only. Not a measured iGPU pin. Size the file on /calculator first.',
  '# llama-cli --list-devices  → pick RADV GFX1103 (780M/760M) or RADV GFX1150 (880M/890M).',
  './build-vk/bin/llama-server \\',
  '  -m ~/models/Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf \\',
  '  -ngl 99 \\',
  '  -c 32768 \\',
  '  --cache-type-k f16 \\',
  '  --cache-type-v f16 \\',
  '  --host 127.0.0.1 --port 8080',
].join('\n');

export function ryzenIgpuPage() {
  const card = gpuDirectory.cards.find((row) => gpuCardId(row) === RYZEN_IGPU_ID);
  if (!card) throw new Error('gpus.yaml has no cited Ryzen iGPU row');
  const preset = GPU_PRESETS.find((gpu) => gpu.id === RYZEN_IGPU_ID);
  if (!preset || preset.kind !== 'unified') throw new Error('ryzen-igpu calculator preset must be unified');

  const fitRows = RYZEN_IGPU_MODELS.flatMap((model) =>
    RYZEN_IGPU_FIT_QUANTS.map((spec) => fitRow(model.id, spec, RYZEN_IGPU_RAM_CONTEXT)),
  );
  const ramMin = ramLine(RAM_MIN_LABEL, RYZEN_IGPU_RAM_CONTEXT);
  const ramFull = ramLine(RAM_FULL_LABEL, 262144);
  const calc32 = `/calculator?${inputToQuery(ryzenIgpuCalcInput('qwen36', RYZEN_IGPU_RAM_QUANT, RYZEN_IGPU_RAM_CONTEXT, 32))}`;
  const calc64 = `/calculator?${inputToQuery(ryzenIgpuCalcInput('qwen36', RYZEN_IGPU_RAM_QUANT, RYZEN_IGPU_RAM_CONTEXT, 64))}`;
  const calc96 = `/calculator?${inputToQuery(ryzenIgpuCalcInput('qwen36', RYZEN_IGPU_RAM_QUANT, RYZEN_IGPU_RAM_CONTEXT, 96))}`;

  return {
    id: RYZEN_IGPU_ID,
    path: RYZEN_IGPU_PATH,
    name: RYZEN_IGPU_NAME,
    shortName: RYZEN_IGPU_SHORT,
    heading: RYZEN_IGPU_HEADING,
    title: 'Local AI on a Ryzen iGPU',
    description:
      'Cited Ryzen 780M / 760M (gfx1103) and 880M / 890M (gfx1150) local-AI guide. Shared system RAM, llama.cpp Vulkan first. Not measured on the local desktop.',
    family: card.family,
    arch: card.arch,
    gfx: card.gfx,
    support: card.support,
    rocmNote: card.rocm_note,
    matrixHref: gpuDirectory.matrix,
    linuxReqsHref: gpuDirectory.linux_reqs,
    citedLabel: RYZEN_IGPU_CITED_LABEL,
    lead:
      'These iGPUs live on the CPU die and drink from the same DIMMs or LPDDR as the OS. There is no discrete VRAM sticker. This sheet covers Radeon 780M / 760M on Phoenix and Hawk Point (gfx1103) and Radeon 880M / 890M on Strix Point (gfx1150). Ryzen AI Max / Strix Halo (Radeon 8060S, gfx1151) is a different chip — that guide stays on /gpus/strix-halo.',
    chipsBody:
      'CU counts and gfx IDs come from AMD product pages (Graphics Core Count) and the ROCm 10.1.0 GPU specifications table. We do not invent a shader or TMU count. 740M / 860M / 840M exist on lower SKUs; they are not the shopper chips on this page.',
    uma:
      'BIOS UMA / VRAM carve-out is a reserved slice the firmware hands the iGPU at boot. GTT / dynamic allocation lets the driver map more of the same kit after boot. AMD’s ROCm 10.1.0 GPU table prints VRAM for these SKUs as Dynamic + carveout. The official RDNA 3.5 system-optimization page (gfx1150 / 1151 / 1152) says memory is mapped rather than physically partitioned, GTT is the user-process pool, and the default GTT limit is about 50 percent of system RAM. That page recommends keeping the dedicated BIOS reservation small (example: 0.5 GB) and raising the kernel TTM page limit at /sys/module/ttm/parameters/pages_limit if you need a larger map. We do not pin a megabyte number or a ttm.pages_limit value — read the board menu on /bios and the sysfs file on your box.',
    llamaMemory:
      'llama.cpp Vulkan allocates GPU buffers through Mesa RADV. Official llama.cpp build.md: cmake -DGGML_VULKAN=ON, then --list-devices at runtime. How much of the kit the process can actually hold is the GTT / TTM map plus whatever the OS still needs — not a second physical pool. The calculator’s 70% GPU slice is a house estimate so the desktop keeps a cut, not an amdgpu reading.',
    supportBody:
      'llama.cpp Vulkan is the AMDai first token. It does not need ROCm. Official build.md covers the Vulkan backend on Linux. HIP / ROCm is second, and only after rocminfo lists your gfx. ROCm 10.1.0 names Hawk Point 780M / 760M as gfx1103 and Strix Point 880M / 890M as gfx1150. Desktop Phoenix 8700G / 8600G use the same 780M / 760M marketing names and the GPU-specs table lists Phoenix 7840U 780M as gfx1103, but those 8000G desktop SKUs are not named on the 10.1 compatibility matrix — do not claim official ROCm for 8700G. HSA_OVERRIDE_GFX_VERSION is unofficial. Do not spoof gfx1100 on gfx1103; Vulkan does not need the override.',
    speedsBody:
      'No cited tok/s on this page. local desktop has no 780M / 890M card, and this repo has no third-party Ryzen iGPU speed row we can quote. Memory type and official max speed (DDR5-5200 on 8700G; DDR5-5600 / LPDDR5X-8000 on HX 370) are the bandwidth story — we do not invent a GB/s figure. Empty stays empty. Record a card with amdai-bench / Stack Lab on your own box.',
    upgrade:
      'Add a discrete card when the file plus KV no longer fit the kit, or when you want the measured 35B in-VRAM path. The R9700 sheet is the measured 32 GB discrete page. Used and budget boards live on /gpus, /budget, /calculator, and /can-run. Strix Halo is the larger shared-memory APU (AMD max 128 GB on that SKU), not a faster 890M. Two discrete cards are a different layout.',
    stackLab:
      'Radeon Stack Lab house profiles are the Ubuntu R9700 recipes. There is no Ryzen iGPU package and no public download. Open in Stack Lab is not on this page because those profiles do not apply. Record an amdai-bench card if you measure one.',
    launch: RYZEN_IGPU_LAUNCH,
    q3: COMPARE_Q3,
    q3Cite: COMPARE_Q3_CITE,
    usablePct: RYZEN_IGPU_USABLE_PCT,
    shareNote: `The calculator’s unified default is ${RYZEN_IGPU_USABLE_PCT}% of the kit as the GPU slice — an estimate, not a BIOS reading. A 32 GB kit yields ${formatGiB(32 * (RYZEN_IGPU_USABLE_PCT / 100))} GB; 64 GB yields ${formatGiB(64 * (RYZEN_IGPU_USABLE_PCT / 100))} GB; 96 GB yields ${formatGiB(96 * (RYZEN_IGPU_USABLE_PCT / 100))} GB. Left for the OS after that slice is ${formatGiB(leftoverAfterShare(32))} GB, ${formatGiB(leftoverAfterShare(64))} GB, and ${formatGiB(leftoverAfterShare(96))} GB.`,
    fitRows,
    ramMin,
    ramFull,
    ramNote: `${RAM_MIN_LABEL} and ${RAM_FULL_LABEL} below are the same two shopper labels as the rest of AMDai, adapted for one shared pool.`,
    calc32,
    calc64,
    calc96,
    chips: RYZEN_IGPU_CHIPS,
    sources: RYZEN_IGPU_SOURCES,
  };
}

export type RyzenIgpuPage = ReturnType<typeof ryzenIgpuPage>;

export function ryzenIgpuBlob(page: RyzenIgpuPage = ryzenIgpuPage()): string {
  return [
    page.name,
    page.shortName,
    page.heading,
    page.title,
    page.description,
    page.lead,
    page.chipsBody,
    page.uma,
    page.llamaMemory,
    page.supportBody,
    page.speedsBody,
    page.upgrade,
    page.stackLab,
    page.shareNote,
    page.ramNote,
    page.ramMin.note,
    page.ramFull.note,
    page.launch,
    page.q3,
    page.q3Cite,
    page.rocmNote,
    page.chips.map((row) => `${row.igpu} ${row.cpus} ${row.arch} ${row.gfx} ${row.cu} ${row.memory} ${row.rocm} ${row.cite}`).join('\n'),
    page.fitRows.map((row) => `${row.model} ${row.quant} ${row.kindLabel} ${row.weightsNote}`).join('\n'),
  ].join('\n');
}

export function ryzenIgpuHrefs(page: RyzenIgpuPage = ryzenIgpuPage()): string[] {
  const extras = [
    page.path,
    page.calc32.split('?')[0] ?? '/calculator',
    page.matrixHref,
    page.linuxReqsHref,
    ...page.sources.map((source) => source.href),
    ...REQUIRED_RYZEN_IGPU_HREFS,
  ];
  return [...new Set(extras.map((href) => (href.split('?')[0] ?? href).split('#')[0] ?? href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertRyzenIgpuValid(page: RyzenIgpuPage = ryzenIgpuPage()): string[] {
  const errors: string[] = [];
  const blob = ryzenIgpuBlob(page);
  const yamlIds = new Set(gpuDirectory.cards.map((card) => gpuCardId(card)));
  if (!yamlIds.has(RYZEN_IGPU_ID)) errors.push('missing gpus.yaml row');
  const preset = GPU_PRESETS.find((gpu) => gpu.id === RYZEN_IGPU_ID);
  if (!preset) errors.push('missing calculator preset');
  if (preset && preset.kind !== 'unified') errors.push('preset must be unified memory');
  if (page.citedLabel !== RYZEN_IGPU_CITED_LABEL) errors.push('cited label drifted');
  if (page.support !== 'official') errors.push('support column drifted');
  if (!page.matrixHref.startsWith('https://rocm.docs.amd.com/')) errors.push('matrix href');
  if (!/not measured on the local desktop/i.test(blob)) errors.push('must say not measured on the local desktop');
  if (!/llama\.cpp/i.test(blob)) errors.push('must say llama.cpp');
  if (!/Vulkan/i.test(blob)) errors.push('must say Vulkan');
  if (!/Dynamic \+ carveout/.test(blob)) errors.push('must cite Dynamic + carveout');
  if (!/8700G is not named/.test(blob)) errors.push('must keep 8700G off the official matrix claim');
  if (!/HSA_OVERRIDE_GFX_VERSION is unofficial/.test(blob)) errors.push('must mark HSA_OVERRIDE unofficial');
  if (!/\/gpus\/strix-halo/.test(blob) && !REQUIRED_RYZEN_IGPU_HREFS.includes('/gpus/strix-halo')) {
    errors.push('must separate Strix Halo');
  }
  if (!blob.includes('/gpus/strix-halo')) errors.push('must link /gpus/strix-halo');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('RAM labels missing');
  if (!/no cited (tok\/s|number)/i.test(blob)) errors.push('must refuse a missing speed');
  if (!/no Ryzen iGPU package/i.test(blob)) errors.push('Stack Lab must stay unpublished for this SKU');
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b|\bUSD\b/i.test(blob)) errors.push('invented price');
  if (/\b\d+(?:\.\d+)?\s*tok\/s\b/i.test(blob)) errors.push('invented tok/s');
  if (!/GGML_VULKAN/.test(blob) && !page.llamaMemory.includes('GGML_VULKAN')) {
    errors.push('must cite GGML_VULKAN');
  }
  if (!page.llamaMemory.includes('GGML_VULKAN')) errors.push('Vulkan build cite missing');
  if (page.fitRows.length !== RYZEN_IGPU_MODELS.length * RYZEN_IGPU_FIT_QUANTS.length) {
    errors.push('fit grid size drifted');
  }
  for (const row of page.fitRows) {
    if (row.speed !== RYZEN_IGPU_SPEED) errors.push(`${row.quant} invented speed`);
    if (row.kind === 'q3-estimate' && row.quant !== COMPARE_Q3) errors.push('Q3 row drifted');
    if (row.kind === 'q3-estimate' && !/estimate/i.test(row.kindLabel)) errors.push('Q3 unlabeled');
    for (const cell of row.kits) {
      if (cell.speed !== RYZEN_IGPU_SPEED) errors.push(`${row.quant} ${cell.kitGb} invented tok/s`);
      const live = compute(ryzenIgpuCalcInput(row.modelId, row.quantId, row.context, cell.kitGb));
      if (`${formatGiB(live.totalGiB)} GB` !== cell.totalGb) errors.push(`${row.model} ${row.quant} ${cell.kitGb} drifted`);
      if (live.tested) errors.push(`${row.quant} must not attach a measured badge`);
    }
  }
  if (!RYZEN_IGPU_KITS.every((kit) => (DIMM_KIT_GB as readonly number[]).includes(kit))) {
    errors.push('kit sizes are not real DIMM sizes');
  }
  if (page.ramMin.label !== RAM_MIN_LABEL || page.ramFull.label !== RAM_FULL_LABEL) {
    errors.push('RAM line labels drifted');
  }
  if (!page.chips.some((row) => row.igpu === 'Radeon 780M' && row.cu === '12')) errors.push('780M CU drifted');
  if (!page.chips.some((row) => row.igpu === 'Radeon 760M' && row.cu === '8')) errors.push('760M CU drifted');
  if (!page.chips.some((row) => row.igpu === 'Radeon 880M' && row.cu === '12')) errors.push('880M CU drifted');
  if (!page.chips.some((row) => row.igpu === 'Radeon 890M' && row.cu === '16')) errors.push('890M CU drifted');
  const hrefs = new Set(ryzenIgpuHrefs(page));
  for (const required of REQUIRED_RYZEN_IGPU_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  for (const source of page.sources) {
    if (!source.href.startsWith('https://')) errors.push(`source ${source.id} must be https`);
  }
  return [...new Set(errors)];
}
