/**
 * Builder CPU step. Same answers as the board / RAM / PSU boxes pick the chip.
 * In-VRAM: 9600X. DDR5 expert offload / larger models later: 9900X, or 9950X
 * when the box also runs other CPU jobs. Fabric figures are theoretical spec
 * numbers, not measurements. No invented prices.
 */

import { goPath } from './go-src';

export const CPU_ASK_PARAM = 'cpuwork';
export const DEFAULT_CPU_WORK = false;

export const FABRIC_READ_PER_CCD_GBS = 64;
export const DDR5_6000_THEORETICAL_GBS = 96;
export const FABRIC_NOTE =
  'One Ryzen 9000 chiplet’s memory read is about 64 GB/s at the default fabric clock, below DDR5-6000’s 96 GB/s theoretical. Those are spec-sheet caps, not measurements on our cards.';

export const RYZEN_9000_PCIE =
  'Every Ryzen 9000 desktop chip lists PCIe 5.0 with 28 total / 24 usable lanes and 256 GB max (AMD product pages), so x8/x8 works on a board whose maker manual documents that split.';

export const APU_WARNING =
  'Never use a Ryzen 8000G APU for dual GPU. The 8700G and 8600G have PCIe 4.0 with 8 graphics lanes — the second CPU x16 slot goes dead. The 8500G and 8300G have 4 graphics lanes, so even one card runs at x4.';

export const CPU_WORK_COPY = {
  question: 'Does this box also run other CPU jobs?',
  no: {
    label: 'No — inference is the job',
    lede: 'The CPU mostly feeds the cards. Stay on the 9600X when the model fits in VRAM, or the 9900X when experts land in DDR5.',
  },
  yes: {
    label: 'Yes — compile, vision, STT, or many agents',
    lede: 'Same PCIe story. For DDR5 offload the 9950X adds cores for side jobs; for in-VRAM the 9600X is still enough.',
  },
};

export type CpuId = '9600x' | '9900x' | '9950x';

export type CpuRow = {
  id: CpuId;
  name: string;
  cores: number;
  ccds: number;
  tdp_w: number;
  pcie: string;
  x8x8_ok: true;
  product_id: string;
  src: string;
  citation: { title: string; url: string; section: string; as_of: string };
};

export const CPUS: readonly CpuRow[] = [
  {
    id: '9600x',
    name: 'AMD Ryzen 5 9600X',
    cores: 6,
    ccds: 1,
    tdp_w: 65,
    pcie: 'PCIe 5.0, 28 total / 24 usable',
    x8x8_ok: true,
    product_id: 'ryzen-5-9600x',
    src: 'builder-cpu-9600x',
    citation: {
      title: 'AMD Ryzen 5 9600X product page',
      url: 'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-5-9600x.html',
      section: 'Native PCIe Lanes (Total/Usable) 28, 24; Max. Memory 256 GB; Max Memory Speed 2x1R DDR5-5600, 4x1R DDR5-3600; Default TDP 65W',
      as_of: '2026-10-29',
    },
  },
  {
    id: '9900x',
    name: 'AMD Ryzen 9 9900X',
    cores: 12,
    ccds: 2,
    tdp_w: 120,
    pcie: 'PCIe 5.0, 28 total / 24 usable',
    x8x8_ok: true,
    product_id: 'ryzen-9-9900x',
    src: 'builder-cpu-9900x',
    citation: {
      title: 'AMD Ryzen 9 9900X product page',
      url: 'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9900x.html',
      section: 'Native PCIe Lanes (Total/Usable) 28, 24; Package Die Count 3; Max. Memory 256 GB; Default TDP 120W',
      as_of: '2026-10-29',
    },
  },
  {
    id: '9950x',
    name: 'AMD Ryzen 9 9950X',
    cores: 16,
    ccds: 2,
    tdp_w: 170,
    pcie: 'PCIe 5.0, 28 total / 24 usable',
    x8x8_ok: true,
    product_id: 'ryzen-9-9950x',
    src: 'builder-cpu-9950x',
    citation: {
      title: 'AMD Ryzen 9 9950X product page',
      url: 'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9950x.html',
      section: 'Native PCIe Lanes (Total/Usable) 28, 24; Package Die Count 3; Max. Memory 256 GB; Default TDP 170W',
      as_of: '2026-10-29',
    },
  },
];

export const CPU_TRAPS = [
  {
    name: 'Ryzen 7 8700G / Ryzen 5 8600G',
    why: 'PCIe 4.0 with 8 graphics lanes. The second CPU x16 slot is disabled, so there is no x8/x8 dual GPU.',
    src: [
      'https://www.amd.com/content/dam/amd/en/documents/partner-hub/ryzen/amd-ryzen-8000g-quick-reference-guide-competitive.pdf',
      'https://www.supermicro.com/en/support/faqs/faq.php?faq=42600',
    ],
  },
  {
    name: 'Ryzen 5 8500G / Ryzen 3 8300G',
    why: 'PCIe 4.0 with 4 graphics lanes. Even one R9700 runs at x4.',
    src: [
      'https://www.amd.com/content/dam/amd/en/documents/partner-hub/ryzen/amd-ryzen-8000g-quick-reference-guide-competitive.pdf',
      'https://www.techpowerup.com/317997/amds-phoenix-1-and-phoenix-2-apus-differ-in-pcie-lane-count-affects-nvme-drive-performance-and-gpu-pcie-lane-count',
    ],
  },
] as const;

export type CpuAsk = {
  bigModels: boolean;
  needsOffload: boolean;
  cpuWork?: boolean;
};

export type CpuRecommendation = {
  id: CpuId;
  title: string;
  why: string;
  product_id: string;
  src: string;
  go_newegg: string;
  citation: CpuRow['citation'];
  alt: CpuRecommendationAlt | null;
  fabric_note: string;
  apu_warning: string;
  offload: boolean;
};

export type CpuRecommendationAlt = {
  id: CpuId;
  title: string;
  why: string;
  product_id: string;
  src: string;
  go_newegg: string;
  citation: CpuRow['citation'];
};

function searchParams(search: string): URLSearchParams {
  return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
}

export function parseCpuWork(search: string): boolean {
  const raw = searchParams(search).get(CPU_ASK_PARAM);
  if (raw === '1' || raw === 'true' || raw === 'yes') return true;
  if (raw === '0' || raw === 'false' || raw === 'no') return false;
  return DEFAULT_CPU_WORK;
}

export function writeCpuAskParams(url: URL, ask: { cpuWork: boolean }): void {
  url.searchParams.set(CPU_ASK_PARAM, ask.cpuWork ? '1' : '0');
}

function byId(id: CpuId): CpuRow {
  const row = CPUS.find((cpu) => cpu.id === id);
  if (!row) throw new Error(`unknown CPU ${id}`);
  return row;
}

function wrap(row: CpuRow, why: string): Omit<CpuRecommendation, 'alt' | 'fabric_note' | 'apu_warning' | 'offload'> {
  return {
    id: row.id,
    title: row.name,
    why,
    product_id: row.product_id,
    src: row.src,
    go_newegg: goPath('newegg', row.product_id, row.src),
    citation: row.citation,
  };
}

export function recommendOffloadCpu(ask: CpuAsk): boolean {
  return ask.bigModels || ask.needsOffload;
}

export function cpuRecommendation(ask: CpuAsk): CpuRecommendation {
  const offload = recommendOffloadCpu(ask);
  if (!offload) {
    const row = byId('9600x');
    return {
      ...wrap(
        row,
        'The model lives in GPU memory, so the CPU mostly feeds the cards. The 9600X is enough. Any Ryzen 9000 desktop chip has 24 usable PCIe 5.0 lanes for x8/x8 on the right board.',
      ),
      alt: null,
      fabric_note: FABRIC_NOTE,
      apu_warning: APU_WARNING,
      offload: false,
    };
  }

  const primary = ask.cpuWork ? byId('9950x') : byId('9900x');
  const altRow = ask.cpuWork ? byId('9900x') : byId('9950x');
  const primaryWhy = ask.cpuWork
    ? `Offload decode reads experts from DDR5 (~${DDR5_6000_THEORETICAL_GBS} GB/s theoretical at 6000), above one chiplet’s ~${FABRIC_READ_PER_CCD_GBS} GB/s fabric read cap. Two chiplets lift that theoretical cap, and 16 cores cover compile, vision, STT, or many agents.`
    : `Offload decode reads experts from DDR5 (~${DDR5_6000_THEORETICAL_GBS} GB/s theoretical at 6000), above one chiplet’s ~${FABRIC_READ_PER_CCD_GBS} GB/s fabric read cap. The two-chiplet 9900X is the value pick.`;
  const altWhy = ask.cpuWork
    ? 'Same two-chiplet fabric story without the extra cores if inference is the only CPU job.'
    : 'Same two-chiplet fabric story with 16 cores if this box also compiles, runs vision/STT, or many agents.';

  return {
    ...wrap(primary, primaryWhy),
    alt: {
      ...wrap(altRow, altWhy),
    },
    fabric_note: FABRIC_NOTE,
    apu_warning: APU_WARNING,
    offload: true,
  };
}

export function cpuPickPayload() {
  const inVram = cpuRecommendation({ bigModels: false, needsOffload: false });
  const offload = cpuRecommendation({ bigModels: true, needsOffload: false });
  const cpuJobs = cpuRecommendation({ bigModels: true, needsOffload: false, cpuWork: true });
  return {
    param: CPU_ASK_PARAM,
    default: DEFAULT_CPU_WORK ? '1' : '0',
    fabric_note: FABRIC_NOTE,
    pcie: RYZEN_9000_PCIE,
    apu_warning: APU_WARNING,
    note:
      'No live or invented prices. Fabric GB/s figures are theoretical spec numbers, not measurements. Share param bigmodels=1 selects the offload chip; cpuwork=1 selects the 9950X on that path.',
    in_vram: {
      id: inVram.id,
      title: inVram.title,
      product_id: inVram.product_id,
      src: inVram.src,
      go: inVram.go_newegg,
      when: 'bigmodels=0 and the file fits in VRAM',
    },
    offload: {
      id: offload.id,
      title: offload.title,
      product_id: offload.product_id,
      src: offload.src,
      go: offload.go_newegg,
      when: 'bigmodels=1 or the setup already needs RAM offload',
    },
    cpu_jobs: {
      id: cpuJobs.id,
      title: cpuJobs.title,
      product_id: cpuJobs.product_id,
      src: cpuJobs.src,
      go: cpuJobs.go_newegg,
      when: 'offload path and cpuwork=1',
    },
    traps: CPU_TRAPS,
  };
}
