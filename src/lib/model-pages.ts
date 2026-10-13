/**
 * Per-model shopper pages at /models/<slug>.
 * One template, data from MODEL_PAGES, recipes, and amdai-bench/run@1 cards.
 * No invented tok/s, prices, or license strings. Q3 stays a labeled estimate.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import {
  DEFAULT_INPUT,
  DIMM_KIT_GB,
  MODEL_PRESETS,
  applyGpuPreset,
  applyModelPreset,
  compute,
  formatCtx,
  formatGiB,
  type GpuId,
  type QuantId,
  type SystemRamNeed,
  type Verdict,
} from './calculator';
import {
  FLASH_RAM_QUANTS,
  flashRamTable,
  parseFlashDaily,
  type FlashDailyFile,
  type FlashRamRow,
} from './flash-daily';
import { MODEL_PAGES } from './gpu-ids';
import { houseSystemRam, type HouseRamKind } from './house-ram';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { recipesForModel, type Recipe } from './recipes';
import { recipes } from './recipes-data';
import {
  FLASH_RERUN_NOTE,
  contextLabel,
  flashQ3FromRuns,
  officialAmdaiRuns,
  runPath,
  runsForModelName,
  verifiedMeasured,
  type RunCard,
} from './run-card';
import { runs } from './run-card-data';
import { officialLinks } from './site';
import { HOUSE_STACK_LAB, type StackLabOpenInput } from './stack-lab-open';
import {
  COMPARE_CONTEXTS,
  COMPARE_Q3,
  COMPARE_Q3_CITE,
  COMPARE_QUANTS,
  oneVsTwoRows,
  q3RamNeed,
  type CompareGpuCount,
} from './local-desktop-compare';

export const HOUSE_MODEL_IDS = ['qwen36', 'flash'] as const;
export type HouseModelId = (typeof HOUSE_MODEL_IDS)[number];

export const MODEL_PUBLISHED = '2026-10-13';
export const MODEL_PATH_PREFIX = '/models';
export const NO_DATA_CONTRIBUTE = 'no data — contribute';
export const NOT_ON_CARD = 'not on the card';

export const CONTRIBUTE_MODELS = [
  {
    id: 'glm-53-flash',
    name: 'GLM 5.3 Flash',
    why: 'No cited local-desktop run card or house recipe yet. AMDai will not invent an HF URL, a license, or tok/s.',
    href: '/contribute',
  },
  {
    id: 'qwen36-27b',
    name: 'Qwen3.6 27B',
    why: 'Publisher file sizes live on /qwen. No house recipe or local-desktop tok/s yet.',
    href: '/qwen',
  },
  {
    id: 'qwen38-27b',
    name: 'Qwen3.8 27B',
    why: 'Publisher file sizes live on /qwen. No house recipe or local-desktop tok/s yet.',
    href: '/qwen',
  },
] as const;

export const MODEL_FIT_GPUS = ['r9700', 'rx7900xtx', 'rx7900xt', 'rx7800xt'] as const;

export const REQUIRED_MODEL_HREFS = [
  '/models',
  '/calculator',
  '/benchmarks',
  '/compare',
  '/gpus/r9700',
  '/gpus/rx7900xtx',
  '/gpus/rx7900xt',
  '/gpus/rx7800xt',
  '/backends/llamacpp',
  '/stack-lab',
  '/contribute',
  '/methodology',
  '/abliterated',
  '/qwen',
  '/setup',
  '/start',
] as const;

const FLASH_CONTEXTS = [4096, 8192, 32768, 100000, 131072, 262144] as const;
const FLASH_QUANTS = ['UD-Q6_K_XL', 'UD-Q5_K_XL', 'UD-Q4_K_XL', COMPARE_Q3] as const;

const GPU_SHORT: Record<(typeof MODEL_FIT_GPUS)[number], string> = {
  r9700: 'R9700',
  rx7900xtx: 'RX 7900 XTX',
  rx7900xt: 'RX 7900 XT',
  rx7800xt: 'RX 7800 XT',
};

function loadFlashDaily(): FlashDailyFile {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(here, '../data/flash-daily.yaml'), join(process.cwd(), 'src/data/flash-daily.yaml')];
  for (const file of candidates) {
    if (existsSync(file)) return parseFlashDaily(parse(readFileSync(file, 'utf8')));
  }
  throw new Error('flash-daily.yaml missing');
}

function identity(id: HouseModelId) {
  const row = MODEL_PAGES.find((model) => model.id === id);
  if (!row) throw new Error(`MODEL_PAGES missing ${id}`);
  const preset = MODEL_PRESETS.find((model) => model.id === id);
  if (!preset) throw new Error(`MODEL_PRESETS missing ${id}`);
  return { row, preset };
}

export function isHouseModelId(id: string): id is HouseModelId {
  return (HOUSE_MODEL_IDS as readonly string[]).includes(id);
}

export function modelPath(id: HouseModelId): string {
  return `${MODEL_PATH_PREFIX}/${id}`;
}

export type ModelCardCite = {
  official: string;
  hf: string;
  ggufName: string;
  ggufHref: string;
  parameters: string;
  active: string;
  context: string;
  contextTokens: number;
  license: string;
  licenseHref: string;
  licenseNote: string;
  archNote: string;
};

export type ModelConfigRow = {
  id: string;
  quant: string;
  quantKind: 'measured' | 'q3-estimate';
  gpuCount: CompareGpuCount;
  layout: 'single' | 'split';
  context: number;
  contextLabel: string;
  decode: string;
  prefill: string;
  vramPerGpu: string;
  vramTotal: string;
  systemRam: string;
  kind: 'measured' | 'estimate' | 'empty';
  href: string;
  hrefLabel: string;
  runIds: string[];
  note?: string;
};

export type ModelFitBadge = {
  gpuId: string;
  name: string;
  href: string;
  verdict: Verdict;
  verdictLabel: string;
  totalGb: string;
  kind: 'measured-card' | 'estimate';
  kindLabel: string;
};

export type ModelLaunch = {
  recipeId: string;
  href: string;
  backend: 'llamacpp' | 'strata';
  backendLabel: string;
  quant: string;
  ctxLabel: string;
  recipe: Recipe;
};

export type FlashCitedPair = {
  engine: string;
  decode: string;
  note: string;
  href: string;
};

export type HouseModelPage = {
  id: HouseModelId;
  path: string;
  name: string;
  role: string;
  title: string;
  description: string;
  lead: string;
  engine: string;
  recommendedQuant: string;
  recommendedContext: number;
  recommendedContextLabel: string;
  card: ModelCardCite;
  stackLab: StackLabOpenInput;
  ramKind: HouseRamKind;
  configRows: ModelConfigRow[];
  citedPair: FlashCitedPair[];
  launches: ModelLaunch[];
  fitBadges: ModelFitBadge[];
  ramNeed: SystemRamNeed | null;
  q3Ram: SystemRamNeed | null;
  flashRam: FlashRamRow[];
  siblings: { href: string; label: string }[];
  deepLinks: { href: string; label: string }[];
};

function cardCite(id: HouseModelId): ModelCardCite {
  const { row, preset } = identity(id);
  const total = preset.totalParamsB;
  const active = preset.activeParamsB;
  const hf = id === 'qwen36' ? officialLinks.qwen36 : officialLinks.qwenFlash;
  const ggufHref = id === 'qwen36' ? officialLinks.qwen36Gguf : officialLinks.qwenFlashGguf;
  return {
    official: row.official,
    hf,
    ggufName: row.gguf,
    ggufHref,
    parameters: total != null ? `${total}B total` : 'see official card',
    active: active != null ? `${active}B active` : 'see official card',
    context: `${preset.defaultCtx.toLocaleString()} tokens`,
    contextTokens: preset.defaultCtx,
    license: 'On the official Hugging Face card',
    licenseHref: hf,
    licenseNote:
      'AMDai does not reprint a license string that is not already cited on this site. Read the license on the model’s own card.',
    archNote: preset.archNote,
  };
}

function llamaFirst(list: Recipe[]): Recipe[] {
  return [...list].sort((a, b) => {
    if (a.backend === b.backend) return b.ctx - a.ctx;
    return a.backend === 'llamacpp' ? -1 : 1;
  });
}

function launchesFor(id: HouseModelId): ModelLaunch[] {
  return llamaFirst(recipesForModel(recipes, id)).map((recipe) => ({
    recipeId: recipe.id,
    href: `/recipes/${recipe.id}`,
    backend: recipe.backend,
    backendLabel: recipe.backend === 'llamacpp' ? 'llama.cpp' : 'Strata',
    quant: recipe.weights.quant,
    ctxLabel: recipe.ctx_label,
    recipe,
  }));
}

function fitBadges(id: HouseModelId): ModelFitBadge[] {
  const quantId: QuantId = id === 'qwen36' ? 'q5_k_m' : 'q6_k';
  const context = id === 'qwen36' ? 4096 : 262144;
  return MODEL_FIT_GPUS.map((gpuId) => {
    let input = applyGpuPreset(gpuId as GpuId, { ...DEFAULT_INPUT, ramGb: 256, view: 'gpu' });
    input = applyModelPreset(id, input);
    const result = compute({
      ...input,
      gpuId: gpuId as GpuId,
      quantId,
      context,
      kvId: 'f16',
      backendId: 'llamacpp',
      pathId: 'vulkan',
      gpuCount: 1,
      split: false,
      fileWeightGiB: null,
    });
    const measured = gpuId === 'r9700' && id === 'qwen36';
    return {
      gpuId,
      name: GPU_SHORT[gpuId],
      href: `/gpus/${gpuId}`,
      verdict: result.verdict,
      verdictLabel: result.verdictLabel,
      totalGb: `${formatGiB(result.totalGiB)} GB`,
      kind: measured ? 'measured-card' : 'estimate',
      kindLabel: measured ? 'Measured card' : 'Estimate',
    };
  });
}

function emptyRow(
  quant: string,
  quantKind: ModelConfigRow['quantKind'],
  gpuCount: CompareGpuCount,
  context: number,
  extra?: Partial<ModelConfigRow>,
): ModelConfigRow {
  return {
    id: `${quant}|${gpuCount}|${context}`,
    quant,
    quantKind,
    gpuCount,
    layout: gpuCount === 1 ? 'single' : 'split',
    context,
    contextLabel: contextLabel(context),
    decode: NO_DATA_CONTRIBUTE,
    prefill: NO_DATA_CONTRIBUTE,
    vramPerGpu: NO_DATA_CONTRIBUTE,
    vramTotal: NO_DATA_CONTRIBUTE,
    systemRam: NO_DATA_CONTRIBUTE,
    kind: 'empty',
    href: '/contribute',
    hrefLabel: 'Contribute',
    runIds: [],
    ...extra,
  };
}

function measuredField(value: string, runIds: string[]): string {
  if (!runIds.length) return NO_DATA_CONTRIBUTE;
  if (!value || value === 'not measured') return NOT_ON_CARD;
  return value;
}

function qwen36Rows(cards: RunCard[]): ModelConfigRow[] {
  const sides = oneVsTwoRows(cards);
  const rows: ModelConfigRow[] = [];
  for (const quant of [...COMPARE_QUANTS, COMPARE_Q3]) {
    const q3 = quant === COMPARE_Q3;
    for (const gpuCount of [1, 2] as const) {
      for (const context of COMPARE_CONTEXTS) {
        if (q3) {
          const need = q3RamNeed(gpuCount);
          const selected = compute(
            applyModelPreset('qwen36', {
              ...DEFAULT_INPUT,
              backendId: 'llamacpp',
              pathId: 'vulkan',
              kvId: 'f16',
              gpuId: 'r9700',
              ramGb: 256,
              quantId: 'q3_k_xl',
              context,
              gpuCount,
              split: gpuCount === 2,
            }),
          );
          const vram = `${formatGiB(gpuCount === 2 ? selected.perGpuGiB : selected.totalGiB)} GB (estimate)`;
          const total = `${formatGiB(selected.totalGiB)} GB (estimate)`;
          rows.push(
            emptyRow(quant, 'q3-estimate', gpuCount, context, {
              decode: NO_DATA_CONTRIBUTE,
              prefill: NO_DATA_CONTRIBUTE,
              vramPerGpu: vram,
              vramTotal: total,
              systemRam: `${need.atSelected.kitGb} GB kit (estimate)`,
              kind: 'estimate',
              href: '/calculator',
              hrefLabel: 'Calculator',
              note: `${COMPARE_Q3_CITE}. Q3 is an option labeled estimate — not a local-desktop run.`,
            }),
          );
          continue;
        }
        const side = sides.find((row) => row.quant === quant && row.context === context);
        const cell = gpuCount === 1 ? side?.one : side?.both;
        if (!cell || !cell.runIds.length) {
          rows.push(emptyRow(quant, 'measured', gpuCount, context));
          continue;
        }
        rows.push({
          id: `${quant}|${gpuCount}|${context}`,
          quant,
          quantKind: 'measured',
          gpuCount,
          layout: gpuCount === 1 ? 'single' : 'split',
          context,
          contextLabel: contextLabel(context),
          decode: measuredField(cell.decode, cell.runIds),
          prefill: measuredField(cell.prefill, cell.runIds),
          vramPerGpu: measuredField(cell.vramPerGpu, cell.runIds),
          vramTotal: measuredField(cell.vramTotal, cell.runIds),
          systemRam: measuredField(cell.systemRam, cell.runIds),
          kind: 'measured',
          href: cell.href,
          hrefLabel: cell.runIds.length === 1 ? cell.runIds[0]! : 'Run cards',
          runIds: cell.runIds,
          note: side?.flag,
        });
      }
    }
  }
  return rows;
}

function flashQuantShort(quant: string): 'Q3' | 'Q4' | 'Q5' | 'Q6' | null {
  if (quant === COMPARE_Q3 || quant === 'UD-Q3_K_XL') return 'Q3';
  if (quant === 'UD-Q4_K_XL') return 'Q4';
  if (quant === 'UD-Q5_K_XL') return 'Q5';
  if (quant === 'UD-Q6_K_XL') return 'Q6';
  return null;
}

function flashRows(cards: RunCard[], file: FlashDailyFile): ModelConfigRow[] {
  const q6 = file.measured_q6_two_cards;
  const ram = flashRamTable(file);
  const q3Card = flashQ3FromRuns(cards);
  const rows: ModelConfigRow[] = [];
  for (const quant of FLASH_QUANTS) {
    const q3 = quant === COMPARE_Q3;
    const short = flashQuantShort(quant);
    for (const gpuCount of [1, 2] as const) {
      for (const context of FLASH_CONTEXTS) {
        const ramRow = short ? ram.find((row) => row.short === short && row.cards === gpuCount) : undefined;
        if (q3) {
          if (q3Card && gpuCount === q3Card.hardware.gpu_count_used && context === q3Card.config.context_tokens) {
            rows.push({
              id: `${quant}|${gpuCount}|${context}`,
              quant,
              quantKind: 'q3-estimate',
              gpuCount,
              layout: gpuCount === 1 ? 'single' : 'split',
              context,
              contextLabel: contextLabel(context),
              decode: q3Card.results.decode_tps != null ? `${q3Card.results.decode_tps} tok/s` : NOT_ON_CARD,
              prefill: q3Card.results.prefill_tps != null ? `${q3Card.results.prefill_tps} tok/s` : NOT_ON_CARD,
              vramPerGpu: q3Card.results.peak_vram_gb_per_gpu[0] != null ? `${q3Card.results.peak_vram_gb_per_gpu[0]} GB` : NOT_ON_CARD,
              vramTotal: q3Card.results.peak_vram_gb_total != null ? `${q3Card.results.peak_vram_gb_total} GB` : NOT_ON_CARD,
              systemRam: q3Card.results.peak_system_ram_gb != null ? `${q3Card.results.peak_system_ram_gb} GB` : NOT_ON_CARD,
              kind: 'measured',
              href: runPath(q3Card.run_id),
              hrefLabel: q3Card.run_id,
              runIds: [q3Card.run_id],
              note: 'Measured Flash Q3 exception on an official card. Still a Q3 file.',
            });
            continue;
          }
          if (ramRow) {
            rows.push(
              emptyRow(quant, 'q3-estimate', gpuCount, context, {
                decode: NO_DATA_CONTRIBUTE,
                prefill: NO_DATA_CONTRIBUTE,
                vramPerGpu: `${formatGiB(gpuCount === 2 ? ramRow.result.perGpuGiB : ramRow.result.totalGiB)} GB (estimate)`,
                vramTotal: `${formatGiB(ramRow.result.totalGiB)} GB (estimate)`,
                systemRam: `${ramRow.ram.atFullContext.kitGb} GB kit (estimate)`,
                kind: 'estimate',
                href: '/calculator',
                hrefLabel: 'Calculator',
                note: `Labeled Q3 estimate from the calculator + ${FLASH_RAM_QUANTS.find((row) => row.short === 'Q3')?.label} listing. Not a local-desktop speed run.`,
              }),
            );
            continue;
          }
          rows.push(emptyRow(quant, 'q3-estimate', gpuCount, context));
          continue;
        }

        if (quant === 'UD-Q6_K_XL' && gpuCount === 2 && q6.cards === 2) {
          const idx = context === 8192 ? 0 : context === 32768 ? 1 : context === 100000 ? 2 : -1;
          if (idx >= 0) {
            const strata =
              idx === 0 ? q6.strata_8k_tok_s : idx === 1 ? q6.strata_32k_tok_s : q6.strata_100k_tok_s;
            rows.push({
              id: `${quant}|${gpuCount}|${context}`,
              quant,
              quantKind: 'measured',
              gpuCount,
              layout: 'split',
              context,
              contextLabel: contextLabel(context),
              decode: `${strata} tok/s (Strata)`,
              prefill: NOT_ON_CARD,
              vramPerGpu: NOT_ON_CARD,
              vramTotal: NOT_ON_CARD,
              systemRam: NOT_ON_CARD,
              kind: 'measured',
              href: '/flash-daily',
              hrefLabel: 'Flash daily',
              runIds: [],
              note: `Two-card UD-Q6_K_XL at 262K-capable launch. llama.cpp DDR5-5200 ${q6.llamacpp_ddr5_5200[idx]} tok/s · DDR5-3600 ${q6.llamacpp_ddr5_3600[idx]} tok/s. Peak VRAM and RAM were not published on that set.`,
            });
            continue;
          }
        }

        if (quant === 'UD-Q6_K_XL' && gpuCount === 1 && context === 262144) {
          const llama = recipes.find((row) => row.id === 'qwen38-flash.llamacpp.262k');
          const strata = recipes.find((row) => row.id === 'qwen38-flash.strata.262k');
          const llamaTok = llama?.proof[0]?.decode;
          const strataTok = strata?.proof[0]?.decode;
          if (llamaTok != null || strataTok != null) {
            const bits = [
              llamaTok != null ? `${llamaTok} tok/s (llama.cpp)` : null,
              strataTok != null ? `${strataTok} tok/s (Strata)` : null,
            ].filter(Boolean);
            rows.push({
              id: `${quant}|${gpuCount}|${context}`,
              quant,
              quantKind: 'measured',
              gpuCount,
              layout: 'single',
              context,
              contextLabel: contextLabel(context),
              decode: bits.join(' · '),
              prefill: NOT_ON_CARD,
              vramPerGpu: NOT_ON_CARD,
              vramTotal: NOT_ON_CARD,
              systemRam: NOT_ON_CARD,
              kind: 'measured',
              href: '/benchmarks#flash',
              hrefLabel: 'Flash pair',
              runIds: [],
              note: 'House recipes list card_count 1. The prior first-party pair did not publish GPU count — treat layout as cited on those recipes, not a new bench.',
            });
            continue;
          }
        }

        rows.push(emptyRow(quant, 'measured', gpuCount, context));
      }
    }
  }
  return rows;
}

function flashCitedPair(): FlashCitedPair[] {
  return [
    {
      engine: 'Strata',
      decode: '32.6 tok/s',
      note: 'Prior first-party Flash UD-Q6_K_XL on local-desktop. Card count was not published; recorded on the two-R9700 host.',
      href: '/benchmarks#flash',
    },
    {
      engine: 'llama.cpp',
      decode: '16 tok/s',
      note: 'Same prior first-party pair. llama.cpp first on this site; Strata is the faster cited agent path.',
      href: '/benchmarks#flash',
    },
  ];
}

export function houseModelPage(id: HouseModelId, cards: RunCard[] = runs): HouseModelPage {
  const { row } = identity(id);
  const flashFile = id === 'flash' ? loadFlashDaily() : null;
  const recommendedQuant = id === 'qwen36' ? 'UD-Q5_K_XL' : 'UD-Q6_K_XL';
  const recommendedContext = 262144;
  const ramKind: HouseRamKind = id === 'flash' ? 'flash' : 'daily';
  const q3 = id === 'qwen36' ? q3RamNeed(1) : null;
  return {
    id,
    path: modelPath(id),
    name: row.name,
    role: row.role,
    title: row.name,
    description:
      id === 'qwen36'
        ? 'Qwen3.6-35B-A3B on one R9700 — Unsloth UD-Q5_K_XL, llama.cpp Vulkan, 262K. Measured local-desktop cards; Q3 is a labeled estimate.'
        : 'House recipe page for Qwen 3.8 Flash: cited UD-Q6_K_XL pair, two-card Q6, RAM lines, llama.cpp first. Q3 is a labeled estimate.',
    lead:
      id === 'qwen36'
        ? 'amdai’s daily driver: Unsloth UD-Q5_K_XL on llama.cpp Vulkan, one R9700, 262K, f16 KV. Every tok/s and measured GB comes from official amdai-bench/run@1 cards. Empty cells stay contribute. Q3 is a labeled estimate.'
        : 'amdai’s fast agent: Unsloth UD-Q6_K_XL. Strata is the cited Hermes path (~32.6 tok/s); llama.cpp is first on this page (~16 tok/s). Two-card Q6 lives on Flash daily. Untested cells say contribute. Q3 is a labeled estimate.',
    engine: id === 'qwen36' ? 'llama.cpp' : 'llama.cpp first · Strata where cited',
    recommendedQuant,
    recommendedContext,
    recommendedContextLabel: formatCtx(recommendedContext),
    card: cardCite(id),
    stackLab: id === 'qwen36' ? HOUSE_STACK_LAB.daily : HOUSE_STACK_LAB.flash,
    ramKind,
    configRows: id === 'qwen36' ? qwen36Rows(cards) : flashRows(cards, flashFile!),
    citedPair: id === 'flash' ? flashCitedPair() : [],
    launches: launchesFor(id),
    fitBadges: fitBadges(id),
    ramNeed: houseSystemRam(ramKind),
    q3Ram: q3,
    flashRam: flashFile ? flashRamTable(flashFile) : [],
    siblings: HOUSE_MODEL_IDS.filter((other) => other !== id).map((other) => {
      const model = MODEL_PAGES.find((item) => item.id === other)!;
      return { href: modelPath(other), label: model.name };
    }),
    deepLinks:
      id === 'qwen36'
        ? [
            { href: '/qwen36-dual', label: '35B on two cards' },
            { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
            { href: '/compare/q4-q5-q6', label: 'Q6 vs Q5 vs Q4' },
            { href: '/benchmarks', label: '35B matrix' },
          ]
        : [
            { href: '/flash-daily', label: 'Flash daily' },
            { href: '/flash-ram-offload', label: 'Flash RAM offload' },
            { href: '/backends/strata', label: 'Strata' },
            { href: '/benchmarks#flash', label: 'Flash vs llama.cpp' },
          ],
  };
}

export function houseModelPages(cards: RunCard[] = runs): HouseModelPage[] {
  return HOUSE_MODEL_IDS.map((id) => houseModelPage(id, cards));
}

export function contributeModels(): readonly typeof CONTRIBUTE_MODELS[number][] {
  return CONTRIBUTE_MODELS;
}

export function modelHrefs(page: HouseModelPage): string[] {
  return [
    page.path,
    page.card.hf,
    page.card.ggufHref,
    page.card.licenseHref,
    ...page.launches.map((row) => row.href),
    ...page.fitBadges.map((row) => row.href),
    ...page.siblings.map((row) => row.href),
    ...page.deepLinks.map((row) => row.href.split('#')[0] ?? row.href),
    ...REQUIRED_MODEL_HREFS,
  ];
}

export function modelBlob(page: HouseModelPage): string {
  return [
    page.name,
    page.role,
    page.title,
    page.description,
    page.lead,
    page.engine,
    page.recommendedQuant,
    page.card.parameters,
    page.card.active,
    page.card.context,
    page.card.license,
    page.card.licenseNote,
    page.card.archNote,
    page.configRows.map((row) => `${row.quant} ${row.decode} ${row.note ?? ''}`).join('\n'),
    page.citedPair.map((row) => `${row.engine} ${row.decode} ${row.note}`).join('\n'),
    RAM_MIN_LABEL,
    RAM_FULL_LABEL,
    FLASH_RERUN_NOTE,
  ].join('\n');
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertModelPagesValid(pages: HouseModelPage[] = houseModelPages()): string[] {
  const errors: string[] = [];
  if (pages.length !== HOUSE_MODEL_IDS.length) errors.push('expected one page per house model');
  if (pages[0]?.id !== 'qwen36') errors.push('amdai daily driver must be first');
  if (pages[1]?.id !== 'flash') errors.push('Flash must be second');
  for (const extra of CONTRIBUTE_MODELS) {
    if (HOUSE_MODEL_IDS.includes(extra.id as HouseModelId)) errors.push(`${extra.id} must not have a shopper page`);
    if (/https:\/\/huggingface\.co\//i.test(`${extra.why} ${extra.href}`)) {
      errors.push(`${extra.id} invented an HF URL`);
    }
  }
  if (!CONTRIBUTE_MODELS.some((row) => row.id === 'glm-53-flash')) errors.push('GLM 5.3 Flash must stay contribute');

  for (const page of pages) {
    if (!MODEL_PAGES.some((row) => row.id === page.id)) errors.push(`${page.id} missing from MODEL_PAGES`);
    if (page.launches[0] && page.launches[0].backend !== 'llamacpp') {
      errors.push(`${page.id} must list llama.cpp first`);
    }
    if (!page.launches.length) errors.push(`${page.id} missing launches`);
    if (!page.ramNeed) errors.push(`${page.id} missing house RAM lines`);
    if (!(DIMM_KIT_GB as readonly number[]).includes(page.ramNeed?.atSelected.kitGb ?? -1)) {
      errors.push(`${page.id} RAM min kit not a DIMM size`);
    }
    if (!(DIMM_KIT_GB as readonly number[]).includes(page.ramNeed?.atFullContext.kitGb ?? -1)) {
      errors.push(`${page.id} RAM full kit not a DIMM size`);
    }
    const q3 = page.configRows.filter((row) => row.quantKind === 'q3-estimate');
    if (!q3.length) errors.push(`${page.id} missing Q3 rows`);
    for (const row of q3) {
      if (!/estimate/i.test(`${row.note ?? ''} ${row.systemRam} ${row.vramTotal}`)) {
        errors.push(`${page.id} Q3 unlabeled`);
      }
      if (/\d+(?:\.\d+)? tok\/s/.test(row.decode) && row.kind === 'estimate' && !row.runIds.length) {
        errors.push(`${page.id} invented Q3 tok/s`);
      }
    }
    for (const row of page.configRows) {
      if (row.kind === 'empty') {
        for (const field of [row.decode, row.prefill, row.vramPerGpu, row.vramTotal, row.systemRam] as const) {
          if (field !== NO_DATA_CONTRIBUTE) errors.push(`${page.id} ${row.id} empty cell drifted`);
        }
      }
      if (!row.decode.trim() || !row.prefill.trim()) errors.push(`${page.id} ${row.id} blank metric`);
      if (/\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/.test(`${row.quant} ${row.note ?? ''}`)) {
        errors.push(`${page.id} ${row.id} lists Q1/Q2`);
      }
    }
    if (page.id === 'qwen36') {
      const daily = page.configRows.find(
        (row) => row.quant === 'UD-Q5_K_XL' && row.gpuCount === 1 && row.context === 262144,
      );
      if (!daily || daily.kind !== 'measured' || !/\d/.test(daily.decode)) {
        errors.push('35B daily 256K cell must be measured');
      }
      if (!page.q3Ram) errors.push('35B missing Q3 RAM helper');
    }
    if (page.id === 'flash') {
      if (page.citedPair.length !== 2) errors.push('Flash cited pair must be Strata + llama.cpp');
      if (!page.citedPair.some((row) => row.engine === 'llama.cpp' && row.decode.includes('16'))) {
        errors.push('Flash pair missing llama.cpp 16');
      }
      if (!page.citedPair.some((row) => row.engine === 'Strata' && row.decode.includes('32.6'))) {
        errors.push('Flash pair missing Strata 32.6');
      }
      if (!page.flashRam.length) errors.push('Flash missing RAM table');
      if (page.launches.some((row) => row.backend === 'strata') === false) {
        errors.push('Flash must keep the cited Strata launch');
      }
    }
    if (page.fitBadges.length !== MODEL_FIT_GPUS.length) errors.push(`${page.id} missing fit badges`);
    for (const badge of page.fitBadges) {
      if (!badge.href.startsWith('/gpus/')) errors.push(`${page.id} fit badge must link /gpus/*`);
    }
    if (/Apache-2\.0/i.test(page.card.license)) errors.push(`${page.id} invented Apache-2.0`);
    if (!/^https:\/\/huggingface\.co\//.test(page.card.hf)) errors.push(`${page.id} HF must be official card`);
    const hrefs = modelHrefs(page);
    for (const required of REQUIRED_MODEL_HREFS) {
      if (!hrefs.includes(required)) errors.push(`${page.id} missing ${required}`);
    }
    const blob = modelBlob(page);
    if (BANNED.test(blob)) errors.push(`${page.id} banned model`);
    if (Q1Q2.test(blob)) errors.push(`${page.id} lists Q1/Q2`);
    if (Q4_FLOOR.test(blob)) errors.push(`${page.id} Q4-floor phrase`);
    if (/\$\d|\bMSRP\b/i.test(blob)) errors.push(`${page.id} invented price`);
    if (!blob.includes(NO_DATA_CONTRIBUTE) && page.configRows.some((row) => row.kind === 'empty')) {
      errors.push(`${page.id} missing contribute copy`);
    }
  }
  const pool = officialAmdaiRuns(verifiedMeasured(runsForModelName(runs, 'qwen36')));
  if (!pool.length) errors.push('35B official cards missing');
  return [...new Set(errors)];
}

export { RAM_FULL_LABEL, RAM_MIN_LABEL };
