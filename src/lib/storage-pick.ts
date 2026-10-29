/**
 * Builder storage step. Capacity first, then generation. No prices.
 * Size for every Q4–Q6 quant of the lanes you keep, plus one extra file of
 * download headroom and 150 GiB for the OS, then keep ~10% of the drive free.
 * Default: Gen4 TLC with DRAM (Samsung 990 PRO or WD_BLACK SN850X). Gen5
 * (Samsung 9100 PRO) only when the reader asks for fastest cold loads.
 * File sizes are summed Hugging Face shard bytes. Load times are published,
 * not measured on our cards.
 */

import { goPath } from './go-src';

export const STORAGE_ASK_PARAM = 'coldload';
export const DEFAULT_COLD_LOAD = false;

/** 1 TB (10^12 bytes) in GiB (2^30). */
export const TB_GIB = 1e12 / 2 ** 30;
export const OS_GIB = 150;
export const FREE_RATIO = 0.9;
/** MiniMax-M3.1-Flash UD-Q4_K_XL — fourth Flash-class family headroom. */
export const FOURTH_FAMILY_Q4_GIB = 232.27;

export const STORAGE_SIZE_SRC =
  'Hugging Face tree API, summed shard bytes (unsloth repos), checked 2026-10-24 and 2026-10-28';

export const MODEL_SETS_GIB = {
  '35b-lane': {
    'Qwen3.6-35B-A3B UD-Q4_K_M': 20.61,
    'UD-Q5_K_XL': 24.77,
    'UD-Q6_K_XL': 29.66,
  },
  'flash-next': {
    'Qwen3.8-Flash-Next UD-Q4_K_XL': 103.69,
    'UD-Q5_K_XL': 147.42,
    'UD-Q6_K_XL': 157.55,
  },
  'glm-flash': {
    'GLM-5.3-Flash UD-Q4_K_XL': 185.99,
    'UD-Q5_K_XL': 223.8,
    'UD-Q6_K_XL': 271.79,
  },
} as const;

export type StorageLane = keyof typeof MODEL_SETS_GIB;

export const DEFAULT_LANES: readonly StorageLane[] = ['35b-lane', 'flash-next', 'glm-flash'];

export const GEN5_LOAD_NOTE =
  'A third-party mmap test loaded a 40.5 GB Q4_K_M file in 15.2 s on a Gen4 990 PRO versus 13.8 s on a Gen5 T705 (about 9%).';

export const MMAP_BOUND_NOTE =
  'llama.cpp’s default mmap load is usually page-fault/CPU bound, not drive-bound. Direct I/O loads at disk speed.';

export const NVME_RULE =
  'Run models from NVMe, never from a hard drive. On dual-GPU boards use an M.2 slot that does not share GPU lanes.';

export const STORAGE_ASK_COPY = {
  question: 'Do you want the fastest cold loads?',
  no: {
    label: 'No — Gen4 with DRAM is enough',
    lede:
      'Default. Samsung 990 PRO or WD_BLACK SN850X. A published mmap test loaded a 40.5 GB file only about 9% faster on Gen5 (15.2 s vs 13.8 s).',
  },
  yes: {
    label: 'Yes — Gen5 for fastest cold loads',
    lede:
      'Samsung 9100 PRO. Helps most with direct I/O. Default mmap is usually CPU-bound. Cited third-party test: 13.8 s vs 15.2 s (about 9%).',
  },
};

export type DriveId = '990pro-2tb' | '990pro-4tb' | 'sn850x-4tb' | 'sn850x-8tb' | '9100pro-4tb' | '9100pro-8tb';

export type DriveRow = {
  id: DriveId;
  name: string;
  part: string;
  gen: 4 | 5;
  tb: 2 | 4 | 8;
  seq_read_mbs: number;
  tbw: number;
  dram: string;
  nand: 'TLC';
  product_id: string;
  src: string;
  citation: { title: string; url: string; section: string; as_of: string };
};

export const DRIVES: readonly DriveRow[] = [
  {
    id: '990pro-2tb',
    name: 'Samsung 990 PRO 2TB',
    part: 'MZ-V9P2T0BW',
    gen: 4,
    tb: 2,
    seq_read_mbs: 7450,
    tbw: 1200,
    dram: '2 GB LPDDR4',
    nand: 'TLC',
    product_id: 'mz-v9p2t0bw',
    src: 'builder-ssd-990pro-2tb',
    citation: {
      title: 'Samsung 990 PRO NVMe SSD datasheet Rev. 2.0',
      url: 'https://download.semiconductor.samsung.com/resources/data-sheet/samsung_nvme_ssd_990_pro_datasheet_rev.2.0.pdf',
      section: '2 TB: Sequential Read 7,450 MB/s; TBW 1,200 TB; 2 GB LPDDR4; TLC',
      as_of: '2026-10-28',
    },
  },
  {
    id: '990pro-4tb',
    name: 'Samsung 990 PRO 4TB',
    part: 'MZ-V9P4T0BW',
    gen: 4,
    tb: 4,
    seq_read_mbs: 7450,
    tbw: 2400,
    dram: '4 GB LPDDR4',
    nand: 'TLC',
    product_id: 'mz-v9p4t0bw',
    src: 'builder-ssd-990pro-4tb',
    citation: {
      title: 'Samsung 990 PRO NVMe SSD datasheet Rev. 2.0',
      url: 'https://download.semiconductor.samsung.com/resources/data-sheet/samsung_nvme_ssd_990_pro_datasheet_rev.2.0.pdf',
      section: '4 TB: Sequential Read 7,450 MB/s; TBW 2,400 TB; 4 GB LPDDR4; TLC',
      as_of: '2026-10-28',
    },
  },
  {
    id: 'sn850x-4tb',
    name: 'WD_BLACK SN850X 4TB',
    part: 'WDS400T2X0E',
    gen: 4,
    tb: 4,
    seq_read_mbs: 7300,
    tbw: 2400,
    dram: 'yes',
    nand: 'TLC',
    product_id: 'wds400t2x0e',
    src: 'builder-ssd-sn850x-4tb',
    citation: {
      title: 'WD_BLACK SN850X NVMe SSD datasheet',
      url: 'https://documents.sandisk.com/content/dam/asset-library/en_us/assets/public/sandisk/product/internal-drives/wd-black-ssd/data-sheet-wd-black-sn850x-nvme-ssd.pdf',
      section: '4 TB: Sequential Read 7,300 MB/s; TBW 2,400 TB; DRAM; TLC',
      as_of: '2026-10-28',
    },
  },
  {
    id: 'sn850x-8tb',
    name: 'WD_BLACK SN850X 8TB',
    part: 'WDS800T2X0E',
    gen: 4,
    tb: 8,
    seq_read_mbs: 7200,
    tbw: 4800,
    dram: 'yes',
    nand: 'TLC',
    product_id: 'wds800t2x0e',
    src: 'builder-ssd-sn850x-8tb',
    citation: {
      title: 'WD_BLACK SN850X NVMe SSD datasheet',
      url: 'https://documents.sandisk.com/content/dam/asset-library/en_us/assets/public/sandisk/product/internal-drives/wd-black-ssd/data-sheet-wd-black-sn850x-nvme-ssd.pdf',
      section: '8 TB: Sequential Read 7,200 MB/s; TBW 4,800 TB; DRAM; TLC',
      as_of: '2026-10-28',
    },
  },
  {
    id: '9100pro-4tb',
    name: 'Samsung 9100 PRO 4TB',
    part: 'MZ-VAP4T0B',
    gen: 5,
    tb: 4,
    seq_read_mbs: 14800,
    tbw: 2400,
    dram: '4 GB LPDDR4X',
    nand: 'TLC',
    product_id: 'mz-vap4t0b',
    src: 'builder-ssd-9100pro-4tb',
    citation: {
      title: 'Samsung 9100 PRO NVMe SSD datasheet Rev. 2.0',
      url: 'https://download.semiconductor.samsung.com/resources/data-sheet/Samsung_NVMe_SSD_9100_PRO_Datasheet_Rev.2.0.pdf',
      section: '4 TB: Sequential Read 14,800 MB/s; TBW 2,400 TB; 4 GB LPDDR4X; TLC',
      as_of: '2026-10-28',
    },
  },
  {
    id: '9100pro-8tb',
    name: 'Samsung 9100 PRO 8TB',
    part: 'MZ-VAP8T0B',
    gen: 5,
    tb: 8,
    seq_read_mbs: 14800,
    tbw: 4800,
    dram: '8 GB LPDDR4X',
    nand: 'TLC',
    product_id: 'mz-vap8t0b',
    src: 'builder-ssd-9100pro-8tb',
    citation: {
      title: 'Samsung 9100 PRO NVMe SSD datasheet Rev. 2.0',
      url: 'https://download.semiconductor.samsung.com/resources/data-sheet/Samsung_NVMe_SSD_9100_PRO_Datasheet_Rev.2.0.pdf',
      section: '8 TB: Sequential Read 14,800 MB/s; TBW 4,800 TB; 8 GB LPDDR4X; TLC',
      as_of: '2026-10-28',
    },
  },
];

export const LOAD_EVIDENCE = [
  {
    claim:
      'llama.cpp default mmap loading is CPU/page-fault bound; direct I/O loads at sequential disk speed. GPT-OSS-120B on DGX Spark: mmap ~110 s first load, direct I/O ~10.5 s.',
    url: 'https://github.com/ggml-org/llama.cpp/pull/18012',
    title: 'llama.cpp PR #18012',
  },
  {
    claim: 'User report: ~2.4 GB/s buffered load from NVMe RAID0 rated >7 GB/s; one core at 100%.',
    url: 'https://github.com/ggml-org/llama.cpp/discussions/12223',
    title: 'llama.cpp discussion #12223',
  },
  {
    claim: GEN5_LOAD_NOTE,
    url: 'https://craftrigs.com/guides/nvme-speed-llm-load-times-benchmarks/',
    title: 'CraftRigs NVMe LLM load-time benchmarks (third-party, single source)',
  },
] as const;

export type StorageAsk = {
  bigModels: boolean;
  coldLoad?: boolean;
  lanes?: readonly StorageLane[];
  fourthFamily?: boolean;
};

export type StoragePickItem = {
  id: DriveId;
  name: string;
  part: string;
  gen: 4 | 5;
  tb: 2 | 4 | 8;
  seq_read_mbs: number;
  tbw: number;
  dram: string;
  product_id: string;
  src: string;
  go_newegg: string;
  citation: DriveRow['citation'];
};

export type StorageRecommendation = {
  need_gib: number;
  tb: 2 | 4 | 8;
  gen: 4 | 5;
  why: string;
  rule: string;
  mmap_note: string;
  load_note: string;
  size_src: string;
  product_id: string;
  src: string;
  go_newegg: string;
  primary: StoragePickItem;
  alternatives: StoragePickItem[];
};

function searchParams(search: string): URLSearchParams {
  return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
}

export function parseColdLoad(search: string): boolean {
  const raw = searchParams(search).get(STORAGE_ASK_PARAM);
  if (raw === '1' || raw === 'true' || raw === 'yes') return true;
  if (raw === '0' || raw === 'false' || raw === 'no') return false;
  return DEFAULT_COLD_LOAD;
}

export function writeStorageAskParams(url: URL, ask: { coldLoad: boolean }): void {
  url.searchParams.set(STORAGE_ASK_PARAM, ask.coldLoad ? '1' : '0');
}

export function needGib(
  lanes: readonly StorageLane[] = DEFAULT_LANES,
  opts: { keepAllQuants?: boolean; fourthFamily?: boolean; osGib?: number } = {},
): number {
  const keepAll = opts.keepAllQuants !== false;
  const osGib = opts.osGib ?? OS_GIB;
  let tot = 0;
  for (const lane of lanes) {
    const sizes = Object.values(MODEL_SETS_GIB[lane]);
    tot += keepAll ? sizes.reduce((sum, n) => sum + n, 0) : Math.max(...sizes);
  }
  const biggest = Math.max(...lanes.map((lane) => Math.max(...Object.values(MODEL_SETS_GIB[lane]))));
  const extra = opts.fourthFamily ? FOURTH_FAMILY_Q4_GIB : 0;
  return Math.round((tot + biggest + extra + osGib) * 10) / 10;
}

export function driveUsableGib(tb: number): number {
  return Math.round(tb * TB_GIB);
}

function sizeTb(need: number): 2 | 4 | 8 {
  for (const tb of [2, 4, 8] as const) {
    if (tb * TB_GIB * FREE_RATIO >= need) return tb;
  }
  return 8;
}

function toItem(row: DriveRow): StoragePickItem {
  return {
    id: row.id,
    name: row.name,
    part: row.part,
    gen: row.gen,
    tb: row.tb,
    seq_read_mbs: row.seq_read_mbs,
    tbw: row.tbw,
    dram: row.dram,
    product_id: row.product_id,
    src: row.src,
    go_newegg: goPath('newegg', row.product_id, row.src),
    citation: row.citation,
  };
}

function byId(id: DriveId): DriveRow {
  const row = DRIVES.find((drive) => drive.id === id);
  if (!row) throw new Error(`unknown drive ${id}`);
  return row;
}

export function recommendFourTb(ask: StorageAsk): boolean {
  if (ask.bigModels || ask.fourthFamily) return true;
  const lanes = ask.lanes ?? DEFAULT_LANES;
  return sizeTb(needGib(lanes, { fourthFamily: ask.fourthFamily })) >= 4;
}

export function storageRecommendation(ask: StorageAsk): StorageRecommendation {
  const lanes = ask.lanes ?? DEFAULT_LANES;
  const fourth = Boolean(ask.fourthFamily || ask.bigModels);
  const need = needGib(lanes, { fourthFamily: fourth });
  let tb = sizeTb(need);
  if (ask.bigModels || ask.fourthFamily) tb = tb < 4 ? 4 : tb;
  const gen: 4 | 5 = ask.coldLoad ? 5 : 4;
  const cands = DRIVES.filter((drive) => drive.tb >= tb && drive.gen === gen);
  const primaryRow = cands[0] ?? byId(gen === 5 ? '9100pro-4tb' : tb >= 4 ? '990pro-4tb' : '990pro-2tb');
  tb = primaryRow.tb;
  const alts = DRIVES.filter((drive) => drive.id !== primaryRow.id && drive.tb === tb && drive.gen === gen).map(toItem);

  const usable = driveUsableGib(tb);
  let why = `Your lanes need about ${Math.round(need)} GiB (every Q4–Q6 quant of Qwen3.6-35B, Qwen3.8-Flash-Next and GLM-5.3-Flash, one extra file of download headroom, 150 GiB for the OS). A ${tb} TB drive is ${usable.toLocaleString('en-US')} GiB usable. `;
  if (ask.bigModels || ask.fourthFamily) {
    why +=
      'You said larger models later, or a fourth Flash-class family (MiniMax-M3.1-Flash UD-Q4 is 232 GiB), so this steps up to 4 TB. ';
  }
  why +=
    gen === 5
      ? 'Gen5 cuts cold load time only if the engine loads with direct I/O; with the default mmap path the CPU, not the drive, is usually the limit. The cited mmap test was only about 9% faster (15.2 s vs 13.8 s).'
      : 'Gen4 TLC with DRAM is enough: published tests show Gen5 loads big GGUFs only about 9% faster on the default mmap path (15.2 s vs 13.8 s). Spend the difference on capacity or RAM.';

  const primary = toItem(primaryRow);
  return {
    need_gib: need,
    tb,
    gen,
    why,
    rule: NVME_RULE,
    mmap_note: MMAP_BOUND_NOTE,
    load_note: GEN5_LOAD_NOTE,
    size_src: STORAGE_SIZE_SRC,
    product_id: primary.product_id,
    src: primary.src,
    go_newegg: primary.go_newegg,
    primary,
    alternatives: alts,
  };
}

export function storagePickPayload() {
  const three = storageRecommendation({ bigModels: false, coldLoad: false });
  const four = storageRecommendation({ bigModels: true, coldLoad: false });
  const gen5 = storageRecommendation({ bigModels: true, coldLoad: true });
  return {
    param: STORAGE_ASK_PARAM,
    default: DEFAULT_COLD_LOAD ? '1' : '0',
    size_src: STORAGE_SIZE_SRC,
    mmap_note: MMAP_BOUND_NOTE,
    load_note: GEN5_LOAD_NOTE,
    rule: NVME_RULE,
    note:
      'No live or invented prices. Specs from maker datasheets. File sizes from the Hugging Face tree API. Share param bigmodels=1 (or a fourth Flash-class family) selects 4 TB. coldload=1 selects the Gen5 9100 PRO.',
    three_family: {
      need_gib: three.need_gib,
      tb: three.tb,
      gen: three.gen,
      product_id: three.product_id,
      src: three.src,
      go: three.go_newegg,
      name: three.primary.name,
      part: three.primary.part,
      when: 'bigmodels=0 — 2 TB holds every Q4–Q6 of the three families',
    },
    four_tb: {
      need_gib: four.need_gib,
      tb: four.tb,
      gen: four.gen,
      product_id: four.product_id,
      src: four.src,
      go: four.go_newegg,
      name: four.primary.name,
      part: four.primary.part,
      when: 'bigmodels=1 or a fourth Flash-class family',
    },
    gen5: {
      need_gib: gen5.need_gib,
      tb: gen5.tb,
      gen: gen5.gen,
      product_id: gen5.product_id,
      src: gen5.src,
      go: gen5.go_newegg,
      name: gen5.primary.name,
      part: gen5.primary.part,
      when: 'coldload=1 — fastest cold loads only',
    },
    drives: DRIVES.map((drive) => ({
      id: drive.id,
      name: drive.name,
      part: drive.part,
      gen: drive.gen,
      tb: drive.tb,
      seq_read_mbs: drive.seq_read_mbs,
      tbw: drive.tbw,
      dram: drive.dram,
      product_id: drive.product_id,
      src: drive.src,
      go: goPath('newegg', drive.product_id, drive.src),
      citation: drive.citation,
    })),
    evidence: LOAD_EVIDENCE,
  };
}
