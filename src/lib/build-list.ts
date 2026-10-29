/**
 * One-answer parts list: GPU, board, CPU, RAM, PSU, storage, case, cooler.
 * Every Newegg href is an internal /go/newegg/<slug> stub so clicks count
 * and the Rakuten deep-link generator can wrap the destination later.
 * No prices. Composer of the existing step pickers plus storage / case / cooler.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { goPath } from './go-src';
import { cpuRecommendation } from './cpu-pick';
import {
  boardsForAsk,
  parseMotherboards,
  recommendDualX8X8,
  recommendationNote,
  type Motherboard,
} from './motherboards';
import { psuRecommendation } from './psu-pick';
import { ramRecommendation } from './ram-kit';
import { storageRecommendation } from './storage-pick';
import { CASE_GO_SLUGS, UNVERIFIED_SLOT_WARNING, caseRecommendation } from './case-pick';
import { COOLER_GO_SLUGS, INTAKE_AIO_WARNING, coolerRecommendation } from './cooler-pick';

export const BUILD_LIST_SRC = 'builder-list';

/** Draft Newegg stubs: storage/build-list plus case and cooler. r9700 is reused. */
export const DRAFT_GO_SLUGS = [
  'amd-ryzen-5-9600x',
  'amd-ryzen-7-9700x',
  'asrock-b850-pro-rs',
  'asrock-x870-taichi-creator',
  'cp-9020270-na',
  'f5-6000j3038f16gx2-fx5',
  'f5-6000j3644d64gx4-tz5nr',
  'mz-v9p2t0bw',
  'ps-tpt-1200fnfagu-3',
  ...CASE_GO_SLUGS,
  ...COOLER_GO_SLUGS,
] as const;

export const REUSED_GO_SLUG = 'r9700';

const PRODUCT_GO_SLUG: Record<string, string> = {
  r9700: 'r9700',
  'ryzen-5-9600x': 'amd-ryzen-5-9600x',
  'ryzen-7-9700x': 'amd-ryzen-7-9700x',
  'asrock-b850-pro-rs': 'asrock-b850-pro-rs',
  'asrock-x870-taichi-creator': 'asrock-x870-taichi-creator',
  'corsair-rm850x': 'cp-9020270-na',
  'ddr5-32': 'f5-6000j3038f16gx2-fx5',
  'ddr5-256': 'f5-6000j3644d64gx4-tz5nr',
  'thermaltake-toughpower-gt-1200': 'ps-tpt-1200fnfagu-3',
  'mz-v9p2t0bw': 'mz-v9p2t0bw',
};

export const MIN_BUDGET_WARNING =
  'Minimum budget board: the second GPU slot is not CPU x8, so adding a second R9700 later runs slower or needs a new board.';

export const UNVERIFIED_SPLIT_WARNING = 'Board is not a verified x8/x8 pick.';

export type BuildAsk = {
  gpuCount: number;
  minBudget: boolean;
  expandGpu: boolean;
  bigModels: boolean;
  cpuWork?: boolean;
  coldLoad?: boolean;
  needsOffload?: boolean;
};

export type BuildPartRole = 'GPU' | 'Motherboard' | 'CPU' | 'RAM' | 'PSU' | 'Storage' | 'Case' | 'Cooler';

export type BuildPart = {
  role: BuildPartRole;
  part: string;
  why: string;
  spec: string | null;
  product_id: string;
  src: string;
  go: string;
};

export type BuildList = {
  answers: {
    gpus: number;
    later_big: boolean;
    offload: 'yes' | 'no';
    min_budget: boolean;
    expand_gpu: boolean;
    cold_load: boolean;
  };
  parts: BuildPart[];
  warnings: string[];
  storage_need_gib: number;
};

function loadBoards(): Motherboard[] {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(here, '../data/motherboards.yaml'), join(process.cwd(), 'src/data/motherboards.yaml')];
  for (const file of candidates) {
    if (existsSync(file)) return parseMotherboards(parse(readFileSync(file, 'utf8'))).boards;
  }
  throw new Error('motherboards.yaml missing');
}

export function goSlugForProduct(productId: string): string {
  return PRODUCT_GO_SLUG[productId] ?? productId;
}

export function partGo(productId: string, src = BUILD_LIST_SRC): string {
  return goPath('newegg', goSlugForProduct(productId), src);
}

function primaryBoard(ask: BuildAsk, boards = loadBoards()): Motherboard {
  const list = boardsForAsk(boards, {
    gpuCount: ask.gpuCount,
    minBudget: ask.minBudget,
    expandGpu: ask.expandGpu,
  });
  return list.find((board) => board.local_desktop) ?? list[0]!;
}

function part(
  role: BuildPartRole,
  label: string,
  productId: string,
  why: string,
  spec: string | null,
  src: string,
): BuildPart {
  return {
    role,
    part: label,
    why: why.trim(),
    spec,
    product_id: goSlugForProduct(productId),
    src,
    go: partGo(productId, src),
  };
}

export function buildList(ask: BuildAsk, boards = loadBoards()): BuildList {
  const gpuCount = Number.isFinite(ask.gpuCount) ? Math.max(1, Math.min(4, Math.round(ask.gpuCount))) : 1;
  const needsOffload = Boolean(ask.needsOffload);
  const offload = ask.bigModels || needsOffload;
  const ram = ramRecommendation({ bigModels: ask.bigModels, needsOffload, gpuCount });
  const board = primaryBoard(ask, boards);
  const cpu = cpuRecommendation({ bigModels: ask.bigModels, needsOffload, cpuWork: ask.cpuWork });
  const psu = psuRecommendation({ gpuCount, expandGpu: ask.expandGpu });
  const psu1 = psu.picks[0]!;
  const sto = storageRecommendation({ bigModels: ask.bigModels, coldLoad: ask.coldLoad });
  const boardAsk = { gpuCount, minBudget: ask.minBudget, expandGpu: ask.expandGpu };
  const cs = caseRecommendation({
    boardId: board.id,
    formFactor: board.form_factor,
    gpuCount,
    psuName: psu1.name,
  });
  const cooler = coolerRecommendation({
    cpuId: cpu.id,
    caseId: cs.primary.id,
    gpuCount,
  });

  const parts: BuildPart[] = [
    part(
      'GPU',
      `AMD Radeon AI PRO R9700 32GB x${gpuCount}`,
      'r9700',
      '32 GB per card; the site’s measured cards.',
      null,
      'builder-list-gpu',
    ),
    part('Motherboard', board.name, board.product_id, recommendationNote(boardAsk), board.citation.url, 'builder-list-board'),
    part('CPU', cpu.title, cpu.product_id, cpu.why, cpu.citation.url, cpu.src),
    part('RAM', ram.primary.name, ram.product_id, `${ram.why} ${ram.replace_note}`.trim(), ram.primary.citation.url, ram.src),
    part('PSU', psu1.name, psu1.product_id, psu.why, psu1.citation.url, psu1.src),
    part(
      'Storage',
      `${sto.primary.name} (${sto.primary.part})`,
      sto.product_id,
      sto.why,
      sto.primary.citation.url,
      sto.src,
    ),
    part('Case', cs.primary.name, cs.primary.product_id, cs.why, cs.primary.spec, cs.primary.src),
    part('Cooler', cooler.name, cooler.product_id, cooler.why, cooler.spec, cooler.src),
  ];

  const warnings: string[] = [];
  if (ask.minBudget && !recommendDualX8X8(boardAsk)) warnings.push(MIN_BUDGET_WARNING);
  if (gpuCount >= 2 && !board.dual_ready) warnings.push(UNVERIFIED_SPLIT_WARNING);
  for (const warning of cs.warnings) {
    if (warning === UNVERIFIED_SLOT_WARNING && !warnings.includes(warning)) warnings.push(warning);
  }
  for (const warning of cooler.warnings) {
    if ((warning === INTAKE_AIO_WARNING || /taller than this case/.test(warning)) && !warnings.includes(warning)) {
      warnings.push(warning);
    }
  }

  return {
    answers: {
      gpus: gpuCount,
      later_big: ask.bigModels,
      offload: offload ? 'yes' : 'no',
      min_budget: ask.minBudget,
      expand_gpu: ask.expandGpu,
      cold_load: Boolean(ask.coldLoad),
    },
    parts,
    warnings,
    storage_need_gib: sto.need_gib,
  };
}

export function buildListKey(ask: BuildAsk): string {
  return [
    ask.gpuCount >= 2 ? '2' : '1',
    ask.minBudget ? '1' : '0',
    ask.expandGpu ? '1' : '0',
    ask.bigModels ? '1' : '0',
    ask.cpuWork ? '1' : '0',
    ask.coldLoad ? '1' : '0',
  ].join('');
}

export function allBuildLists(boards = loadBoards()): Record<string, BuildList> {
  const out: Record<string, BuildList> = {};
  for (const gpuCount of [1, 2] as const) {
    for (const minBudget of [false, true]) {
      for (const expandGpu of [false, true]) {
        for (const bigModels of [false, true]) {
          for (const cpuWork of [false, true]) {
            for (const coldLoad of [false, true]) {
              const ask = { gpuCount, minBudget, expandGpu, bigModels, cpuWork, coldLoad };
              out[buildListKey(ask)] = buildList(ask, boards);
            }
          }
        }
      }
    }
  }
  return out;
}

export function buildListPayload(ask: BuildAsk = { gpuCount: 1, minBudget: false, expandGpu: true, bigModels: false }) {
  return {
    note: 'No live or invented prices. Every Newegg href is /go/newegg/<slug>. Query strings are not evaluated on this host.',
    default: buildList(ask),
    slugs: { draft: DRAFT_GO_SLUGS, reused: REUSED_GO_SLUG },
  };
}

/** Interned client map so /budget and /calculator do not embed 64 full copies. */
export type CompactBuildMaps = {
  strings: string[];
  key: string;
  builds: Record<string, { a: [number, number, number, number]; w: number[]; p: number[][] }>;
};

export function compactBuildMaps(key: string, maps: Record<string, BuildList>): CompactBuildMaps {
  const strings: string[] = [];
  const intern = (value: string | null): number => {
    if (value == null) return -1;
    const found = strings.indexOf(value);
    if (found >= 0) return found;
    strings.push(value);
    return strings.length - 1;
  };
  const builds: CompactBuildMaps['builds'] = {};
  for (const [mapKey, list] of Object.entries(maps)) {
    builds[mapKey] = {
      a: [
        list.answers.gpus,
        list.answers.later_big ? 1 : 0,
        list.answers.min_budget ? 1 : 0,
        list.answers.cold_load ? 1 : 0,
      ],
      w: list.warnings.map(intern),
      p: list.parts.map((row) => [
        intern(row.role),
        intern(row.part),
        intern(row.why),
        intern(row.spec),
        intern(row.go),
      ]),
    };
  }
  return { strings, key, builds };
}
