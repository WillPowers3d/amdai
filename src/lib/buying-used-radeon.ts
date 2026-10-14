/**
 * Cited shopper guide: buying a used Radeon for local AI.
 * Fit / VRAM / RAM reuse calculator + consumer GPU sheets. Speed stays
 * “not measured” on used SKUs. No invented prices, tok/s, or failure rates.
 * llama.cpp first. Q6/Q5/Q4 plus a labeled cited Q3. Both RAM lines where
 * offload appears.
 */

import {
  DEFAULT_INPUT,
  applyGpuPreset,
  applyModelPreset,
  compute,
  formatCtx,
  formatGiB,
  systemRamNeed,
  type CalcInput,
  type GpuId,
  type QuantId,
  type SystemRamNeed,
  type Verdict,
} from './calculator';
import {
  CONSUMER_ENGINE,
  CONSUMER_FIT_CONTEXTS,
  CONSUMER_FIT_QUANTS,
  CONSUMER_MODEL,
  CONSUMER_RAM_CONTEXT,
  CONSUMER_RAM_QUANT,
  CONSUMER_SHOPPER_RAM_GB,
  consumerRecipePage,
  type ConsumerRecipeId,
} from './consumer-gpu';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { officialLinks } from './site';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';

export const BUYING_USED_PATH = '/guides/buying-used-radeon';
export const BUYING_USED_TITLE = 'Buying a used Radeon for local AI';
export const BUYING_USED_DESCRIPTION =
  'Cited used-Radeon shopper guide: RDNA4 / RDNA3 / RDNA2 gfx and ROCm notes, VRAM-first 12–32 GB picker from existing fit data, Linux vetting checklist. llama.cpp first. No invented prices.';
export const BUYING_USED_PUBLISHED = '2026-10-14';
export const BUYING_USED_CITED_LABEL = 'Cited, not measured on local-desktop';
export const BUYING_USED_SPEED_LABEL = 'not measured';

export const BUYING_USED_LSPCI = "lspci -nn | grep -Ei 'vga|display|3d'";
export const BUYING_USED_ROCMINFO = "rocminfo | grep -E 'Marketing Name|gfx'";
export const BUYING_USED_ROCMSMI = 'rocm-smi --showproductname --showmeminfo vram --showuse';
export const BUYING_USED_AMDSMI = 'amd-smi';
export const BUYING_USED_VULKANINFO = 'vulkaninfo';

export type BuyingUsedLink = { href: string; label: string };

export type BuyingUsedSource = {
  id: string;
  title: string;
  href: string;
};

export type BuyingUsedGeneration = {
  id: string;
  title: string;
  gfx: string;
  rocm: string;
  vulkan: string;
  examples: BuyingUsedLink[];
};

export type BuyingUsedQuantCell = {
  quant: string;
  estimate: boolean;
  totalGb: string;
  verdict: Verdict;
  verdictLabel: string;
  speed: typeof BUYING_USED_SPEED_LABEL;
};

export type BuyingUsedVramClass = {
  id: string;
  vramGb: 12 | 16 | 20 | 24 | 32;
  vramLabel: string;
  representativeName: string;
  representativeHref: string;
  gfx: string;
  support: string;
  cards: BuyingUsedLink[];
  quants: BuyingUsedQuantCell[];
  ramNeed: SystemRamNeed;
  offloadAppears: boolean;
  note: string;
};

export type BuyingUsedStep = {
  id: string;
  title: string;
  body: string;
  links: BuyingUsedLink[];
};

export type BuyingUsedFaq = {
  id: string;
  question: string;
  answer: string;
  links: BuyingUsedLink[];
};

export const BUYING_USED_SOURCES: BuyingUsedSource[] = [
  {
    id: 'rocm-matrix',
    title: 'AMD — ROCm 10.1.0 compatibility matrix',
    href: officialLinks.rocm10Matrix,
  },
  {
    id: 'linux-reqs',
    title: 'AMD — ROCm Linux system requirements',
    href: officialLinks.compatibility,
  },
  {
    id: 'rocm-home',
    title: 'AMD — ROCm documentation',
    href: officialLinks.rocm,
  },
  {
    id: 'llama-build',
    title: 'llama.cpp — build.md (GGML_VULKAN / GGML_HIP)',
    href: 'https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md',
  },
  {
    id: 'llama-repo',
    title: 'llama.cpp repository',
    href: 'https://github.com/ggml-org/llama.cpp',
  },
  {
    id: 'r9700',
    title: 'AMD — Radeon AI PRO R9700 product page',
    href: officialLinks.product,
  },
];

export const BUYING_USED_GENERATIONS: BuyingUsedGeneration[] = [
  {
    id: 'rdna4',
    title: 'RDNA 4 — gfx1201 / gfx1200',
    gfx: 'gfx1201 (R9700, RX 9070 XT / 9070 / GRE) and gfx1200 (RX 9060 XT)',
    rocm: 'Official on the cited ROCm 10.1 matrix. Install the matching family package — gfx1201 is not gfx1200 and not gfx110x.',
    vulkan: 'llama.cpp Vulkan (GGML_VULKAN) is the AMDai first path on every generation, including these official HIP rows.',
    examples: [
      { href: '/gpus/r9700', label: 'R9700 (32 GB, measured)' },
      { href: '/gpus/rx-9070-xt', label: 'RX 9070 XT (16 GB)' },
      { href: '/gpus/rx-9070', label: 'RX 9070 (16 GB)' },
      { href: '/gpus/rx-9070-gre', label: 'RX 9070 GRE (12 GB)' },
      { href: '/gpus/rx-9060-xt', label: 'RX 9060 XT (16 GB)' },
    ],
  },
  {
    id: 'rdna3',
    title: 'RDNA 3 — gfx1100 / gfx1101 / gfx1102',
    gfx: 'gfx1100 (7900 XTX / XT / GRE), gfx1101 (7800 XT / 7700 XT), gfx1102 (7600 XT / 7600)',
    rocm: 'Official on the cited ROCm 10.1 matrix as the gfx110x family. Do not mix a gfx1201 (R9700 / 9070) pin onto these cards.',
    vulkan: 'llama.cpp Vulkan stays first. HIP when rocminfo lists this gfx. Used-market 7900 XTX / XT and 7800 XT sheets live under /gpus.',
    examples: [
      { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX (24 GB)' },
      { href: '/gpus/rx-7900-xt', label: 'RX 7900 XT (20 GB)' },
      { href: '/gpus/rx-7800-xt', label: 'RX 7800 XT (16 GB)' },
      { href: '/gpus/rx-7900-gre', label: 'RX 7900 GRE (16 GB)' },
      { href: '/gpus/rx-7700-xt', label: 'RX 7700 XT (12 GB)' },
    ],
  },
  {
    id: 'rdna2',
    title: 'RDNA 2 — gfx1030 / gfx1031',
    gfx: 'gfx1030 (6800 XT, 6950 XT / 6900 XT, official W6800) and gfx1031 (6700 XT)',
    rocm: 'Consumer RDNA 2 is unofficial on the current Radeon ROCm row the way W6800 (gfx1030) is official. gfx1031 is not that W6800 row. Community HSA_OVERRIDE_GFX_VERSION=10.3.0 so gfx1030 objects load on gfx1031 is unofficial — see /rocm-problems/gfx1031-hsa-override. Prefer Vulkan llama.cpp if HIP is angry.',
    vulkan: 'llama.cpp Vulkan is the always-works path on these used 6000-series cards. Do not treat HSA_OVERRIDE as an AMD how-to.',
    examples: [
      { href: '/gpus/rx-6800-xt', label: 'RX 6800 XT (16 GB)' },
      { href: '/gpus/rx-6950-xt', label: 'RX 6950 XT / 6900 XT (16 GB)' },
      { href: '/gpus/rx-6700-xt', label: 'RX 6700 XT (12 GB)' },
      { href: '/gpus/w6800', label: 'PRO W6800 (32 GB, official gfx1030)' },
      { href: '/rocm-problems/gfx1031-hsa-override', label: 'gfx1031 HSA_OVERRIDE note' },
    ],
  },
];

const CLASS_SPEC: Array<{
  id: string;
  vramGb: 12 | 16 | 20 | 24 | 32;
  representative: ConsumerRecipeId | 'r9700';
  extra: BuyingUsedLink[];
  note: string;
}> = [
  {
    id: 'vram-12',
    vramGb: 12,
    representative: 'rx6700xt',
    extra: [
      { href: '/gpus/rx-7700-xt', label: 'RX 7700 XT' },
      { href: '/gpus/rx-9070-gre', label: 'RX 9070 GRE' },
    ],
    note: 'Used 12 GB class. House 35B Q6/Q5/Q4 files do not sit in this VRAM on the calculator — expect RAM offload or a listed Q3 file, both estimates. Open the linked sheet instead of copying its table here.',
  },
  {
    id: 'vram-16',
    vramGb: 16,
    representative: 'rx6800xt',
    extra: [
      { href: '/gpus/rx-7800-xt', label: 'RX 7800 XT' },
      { href: '/gpus/rx-6950-xt', label: 'RX 6950 XT / 6900 XT' },
      { href: '/gpus/rx-7900-gre', label: 'RX 7900 GRE' },
      { href: '/gpus/rx-7600-xt', label: 'RX 7600 XT' },
    ],
    note: 'Used 16 GB class (6800 XT, 6950 XT / 6900 XT, 7800 XT). House 35B Q6/Q5/Q4 files do not sit in this VRAM on the calculator — expect RAM offload or a listed Q3 file, both estimates. Confirm the exact SKU: 7600 XT is also 16 GB on gfx1102; 9070 XT is 16 GB on gfx1201.',
  },
  {
    id: 'vram-20',
    vramGb: 20,
    representative: 'rx7900xt',
    extra: [],
    note: 'The 20 GB used listing is the RX 7900 XT — not the 24 GB XTX and not the 16 GB 7900 GRE. Size Qwen3.6-35B-A3B on the calculator before you assume a Q5 file sits in VRAM at long context.',
  },
  {
    id: 'vram-24',
    vramGb: 24,
    representative: 'rx7900xtx',
    extra: [],
    note: 'The 24 GB used listing is the RX 7900 XTX. Size the 35B file on the calculator and the XTX sheet. Speed on that sheet stays not measured. The measured 32 GB north star is still the R9700.',
  },
  {
    id: 'vram-32',
    vramGb: 32,
    representative: 'r9700',
    extra: [
      { href: '/gpus/w6800', label: 'PRO W6800 (used workstation)' },
      { href: '/gpus/w7800', label: 'PRO W7800 (used workstation)' },
    ],
    note: '32 GB is the house measured class on the Radeon AI PRO R9700 — usually a new-card buy, not a used 7900. Used 32 GB workstation sheets are W6800 (gfx1030, official ROCm row) and W7800 (gfx1100). Do not assume a used “RX 9700” exists; that name is not a consumer SKU.',
  },
];

function calcInput(gpuId: GpuId, quant: QuantId, context: number): CalcInput {
  let input = applyGpuPreset(gpuId, {
    ...DEFAULT_INPUT,
    ramGb: CONSUMER_SHOPPER_RAM_GB,
    view: 'gpu',
  });
  input = applyModelPreset('qwen36', input);
  return {
    ...input,
    gpuId,
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

function representativeMeta(id: ConsumerRecipeId | 'r9700'): {
  name: string;
  href: string;
  gfx: string;
  support: string;
  gpuId: GpuId;
} {
  if (id === 'r9700') {
    return {
      name: 'Radeon AI PRO R9700',
      href: '/gpus/r9700',
      gfx: 'gfx1201',
      support: 'Official (measured on local-desktop)',
      gpuId: 'r9700',
    };
  }
  const page = consumerRecipePage(id);
  return {
    name: page.shortName,
    href: page.path,
    gfx: page.gfx,
    support: page.support === 'official' ? 'Official on cited ROCm 10.1 row' : 'Unofficial on current Radeon ROCm row',
    gpuId: id,
  };
}

export function buyingUsedVramClasses(): BuyingUsedVramClass[] {
  return CLASS_SPEC.map((spec) => {
    const meta = representativeMeta(spec.representative);
    const ramNeed = systemRamNeed(calcInput(meta.gpuId, CONSUMER_RAM_QUANT, CONSUMER_RAM_CONTEXT));
    const quants = CONSUMER_FIT_QUANTS.map((row) => {
      const result = compute(calcInput(meta.gpuId, row.id, CONSUMER_FIT_CONTEXTS[0]));
      return {
        quant: row.label,
        estimate: row.kind === 'q3-estimate',
        totalGb: `${formatGiB(result.totalGiB)} GB`,
        verdict: result.verdict,
        verdictLabel: result.verdictLabel,
        speed: BUYING_USED_SPEED_LABEL,
      };
    });
    const offloadAppears = quants.some((cell) => cell.verdict !== 'fits');
    const cards: BuyingUsedLink[] = [{ href: meta.href, label: meta.name }, ...spec.extra];
    return {
      id: spec.id,
      vramGb: spec.vramGb,
      vramLabel: `${spec.vramGb} GB`,
      representativeName: meta.name,
      representativeHref: meta.href,
      gfx: meta.gfx,
      support: meta.support,
      cards,
      quants,
      ramNeed,
      offloadAppears,
      note: spec.note,
    };
  });
}

export const BUYING_USED_STEPS: BuyingUsedStep[] = [
  {
    id: 'identify',
    title: 'Confirm the exact model and VRAM before money moves',
    body: `Listings lie about XT vs XTX, 12 vs 16 vs 20 vs 24 GB, and “RX 9700.” On a live Linux box the site already documents: ${BUYING_USED_LSPCI} for the PCI name, ${BUYING_USED_ROCMINFO} for marketing name plus gfx, ${BUYING_USED_ROCMSMI} or ${BUYING_USED_AMDSMI} for published VRAM, and ${BUYING_USED_VULKANINFO} for the RADV device. Match those strings to the /gpus sheet before you pay. A 7900 XT is 20 GB; the XTX is 24 GB; the 6700 XT is 12 GB gfx1031, not the 16 GB 6800 XT.`,
    links: [
      { href: '/tutorials/verify-rocm', label: 'Verify ROCm' },
      { href: '/tutorials/install-rocm', label: 'Install ROCm' },
      { href: '/gpus', label: 'GPU directory' },
      { href: '/rocm/gfx', label: 'gfx IDs' },
    ],
  },
  {
    id: 'generation',
    title: 'Pick the generation for the engine you will actually run',
    body: 'llama.cpp first. Vulkan (GGML_VULKAN, Mesa RADV) is the always-works consumer path on RDNA4, RDNA3, and RDNA2. Official HIP / ROCm follows the 10.1 matrix: gfx1201 / gfx1200 / gfx110x are listed; consumer gfx1030 / gfx1031 are not the official W6800 row. Community HSA_OVERRIDE_GFX_VERSION (for example 10.3.0 on gfx1031) is unofficial — not an AMD how-to. If HIP is angry, stay on Vulkan. Ollama and vLLM are not the house path for a used card.',
    links: [
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/rocm', label: 'What is ROCm' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/rocm-problems/gfx1031-hsa-override', label: 'gfx1031 HSA_OVERRIDE' },
      { href: '/setup', label: 'Ubuntu setup (measured)' },
    ],
  },
  {
    id: 'vram',
    title: 'Buy VRAM first — then open the sheet, do not copy it',
    body: `Shop 12 / 16 / 20 / 24 / 32 GB using the picker on this page. Those totals are the same calculator estimates already on the /gpus sheets for ${CONSUMER_MODEL} on ${CONSUMER_ENGINE}, f16 KV, one GPU. Q6_K / Q5_K_M / Q4_K_M plus ${COMPARE_Q3} (${COMPARE_Q3_CITE}) labeled estimate. Nothing below Q3. Speed cells stay ${BUYING_USED_SPEED_LABEL} on used SKUs. The measured 32 GB recipes stay on /gpus/r9700.`,
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/can-run', label: 'Can my Radeon run it?' },
      { href: '/compare/gpus', label: 'Compare GPUs' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/quants', label: 'Quants' },
    ],
  },
  {
    id: 'ram',
    title: 'Read both RAM lines wherever the file spills',
    body: `${RAM_MIN_LABEL} is the kit estimate rounded to a real DIMM size. ${RAM_FULL_LABEL} is the llama.cpp KV line at the model’s full context. Both stay labeled estimate on used cards (64 GB shopper default on the consumer sheets). GB here is Linux GiB printed as GB. Offload is not free speed — decode usually drops. Do not invent a kit from a forum screenshot.`,
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/long-context', label: 'Long context' },
      { href: '/budget', label: 'Budget' },
    ],
  },
  {
    id: 'stability',
    title: 'Short VRAM and stability check in the return window',
    body: 'After the card is in the box, follow /tutorials/verify-rocm: rocminfo prints an HSA GPU agent, rocm-smi / amd-smi shows the marketing name and VRAM near the sticker, then a short llama.cpp generate while the meter moves. That is identity plus a live kernel — not a burn-in suite and not a failure-rate claim. If the process never sees /dev/kfd or Vulkan lists only the iGPU, stop and use the return window. We do not invent a loop count or a maximum temperature.',
    links: [
      { href: '/tutorials/verify-rocm', label: 'Verify ROCm' },
      { href: '/tutorials/run-local-llm', label: 'Run a local LLM' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/rocm-problems', label: 'ROCm problems' },
    ],
  },
  {
    id: 'bench',
    title: 'Compare a short llama-bench or amdai-bench run to the site',
    body: 'Used-card sheets stay not measured on local-desktop. After a short llama.cpp llama-bench or an amdai-bench/run@1 card on your box, compare against the measured R9700 numbers on /benchmarks and /results — do not paste those tok/s onto a 6800 XT listing. Empty speed cells stay empty. Contribute a recipe if you have a log. We do not invent a used-card tok/s to fill the hole.',
    links: [
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/benchmarks', label: 'Benchmarks (measured R9700)' },
      { href: '/results', label: 'Run cards' },
      { href: '/contribute', label: 'Contribute a recipe' },
      { href: '/wanted', label: 'Wanted' },
    ],
  },
  {
    id: 'power',
    title: 'Check board power and connectors from AMD — not a forum watt',
    body: 'Typical board power (TBP) and any published PSU or connector string live on /power and the AMD product page the GPU sheet already cites. Empty connector cells stay not recorded — we do not invent an 8-pin count. 7900 XTX / XT and 7800 XT TBP figures are on those sheets and /power. Size the PSU for the whole box; dual-card honesty is /power plus /multi-gpu. No prices.',
    links: [
      { href: '/power', label: 'Power and PSU' },
      { href: '/hardware', label: 'Hardware' },
      { href: '/bios', label: 'BIOS (ReBAR / SAM)' },
      { href: '/disclosure', label: 'Affiliate disclosure' },
    ],
  },
  {
    id: 'thermals',
    title: 'Watch temps and fans while it generates — not at the wallpaper',
    body: 'rocm-smi / amd-smi show temperature and fan while llama.cpp is actually generating. Listen for a dead fan or a grinding bearing before the return window closes. Partner coolers change acoustics; we do not publish a failure rate or a “safe °C.” Leave the adjacent slot empty on a blower. Case airflow is /hardware.',
    links: [
      { href: '/tutorials/verify-rocm', label: 'Verify ROCm' },
      { href: '/hardware', label: 'Hardware' },
      { href: '/power', label: 'Power and PSU' },
    ],
  },
  {
    id: 'two-card',
    title: 'Two cards are not automatic 2× decode',
    body: 'A second used Radeon is a /multi-gpu decision, not a speed coupon. Hands-on llama.cpp flags are /setup/multi-gpu. Overnight 35B split numbers are one-R9700-plus-one-R9700 cards — they do not transfer to a used 7900 pair. Mixing RDNA generations or PCIe widths is not measured. Electrical honesty for two boards is /power. Combo-preset tok/s is not measured — use amdai-bench.',
    links: [
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp how-to' },
      { href: '/power', label: 'Power and PSU' },
      { href: '/compare/one-vs-two-gpu', label: 'One vs two GPU' },
      { href: '/qwen36-dual', label: '35B on two cards' },
    ],
  },
];

export const BUYING_USED_FAQ: BuyingUsedFaq[] = [
  {
    id: 'used-or-new',
    question: 'Should I buy a used 7900 XTX or a new R9700?',
    answer:
      'VRAM first, then gfx. A used 24 GB 7900 XTX is gfx1100; the measured 32 GB house card is the Radeon AI PRO R9700 (gfx1201). Fit estimates for the XTX stay on /gpus/rx-7900-xtx. Measured 35B recipes stay on /gpus/r9700. We do not invent a street price or a tok/s delta between those SKUs. Size the file on the calculator, then use /go/ check-price buttons — no prices on this page.',
    links: [
      { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX sheet' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/budget', label: 'Budget' },
      { href: '/compare/gpus', label: 'Compare GPUs' },
    ],
  },
  {
    id: 'rdna2-ok',
    question: 'Is a used RX 6800 XT or 6700 XT still worth it for llama.cpp?',
    answer:
      'Yes as a VRAM buy, with honest ROCm status. 6800 XT and 6950 XT / 6900 XT are 16 GB gfx1030; 6700 XT is 12 GB gfx1031. Consumer RDNA 2 is unofficial on the current Radeon ROCm row. llama.cpp Vulkan is the first path. HSA_OVERRIDE_GFX_VERSION on gfx1031 is unofficial. House 35B Q6/Q5/Q4 files expect RAM offload on these cards — both RAM lines stay labeled estimate. Open the sheet instead of this paragraph.',
    links: [
      { href: '/gpus/rx-6800-xt', label: 'RX 6800 XT' },
      { href: '/gpus/rx-6950-xt', label: 'RX 6950 XT / 6900 XT' },
      { href: '/gpus/rx-6700-xt', label: 'RX 6700 XT' },
      { href: '/rocm-problems/gfx1031-hsa-override', label: 'gfx1031 HSA_OVERRIDE' },
    ],
  },
  {
    id: 'how-to-vet',
    question: 'What should I run before the return window closes?',
    answer:
      'Confirm lspci, rocminfo (marketing name + gfx), rocm-smi or amd-smi VRAM, and vulkaninfo. Then a short llama.cpp generate while the meter moves (/tutorials/verify-rocm), and a short llama-bench or amdai-bench run compared to the site’s measured R9700 cards — not as a used-card tok/s. Check TBP and connectors on /power. Watch temps and fans while generating. We do not publish a failure rate.',
    links: [
      { href: '/tutorials/verify-rocm', label: 'Verify ROCm' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/power', label: 'Power and PSU' },
      { href: '/hardware', label: 'Hardware' },
    ],
  },
  {
    id: 'q3-used',
    question: 'Can I buy a 12 GB card and just run Q3?',
    answer: `${COMPARE_Q3} is a labeled estimate (${COMPARE_Q3_CITE}) — not a local-desktop run and not a promise that Q3 “makes 12 GB enough.” Q6 / Q5 / Q4 stay on the table. Nothing below Q3. Size the file on the calculator and the 12 GB sheet. ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL} print when that file spills.`,
    links: [
      { href: '/quants', label: 'Quants' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/gpus/rx-6700-xt', label: 'RX 6700 XT' },
      { href: '/can-run', label: 'Can my Radeon run it?' },
    ],
  },
];

export const BUYING_USED_HOWTO_STEPS = BUYING_USED_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const BUYING_USED_HUB_LINKS: BuyingUsedLink[] = [
  { href: '/budget', label: 'Budget' },
  { href: '/compare/gpus', label: 'Compare GPUs' },
  { href: '/gpus', label: 'GPU directory' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/gpus/r9700', label: 'R9700 measured page' },
  { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX' },
  { href: '/gpus/rx-6800-xt', label: 'RX 6800 XT' },
  { href: '/multi-gpu', label: 'Dual / multi-GPU' },
  { href: '/power', label: 'Power and PSU' },
  { href: '/setup', label: 'Ubuntu setup' },
  { href: '/faq', label: 'FAQ' },
];

export const BUYING_USED_GO_PRODUCTS = [
  'rx7900xtx',
  'rx7900xt',
  'rx7800xt',
  'rx6800xt',
  'rx6950xt',
  'rx6900xt',
  'rx6700xt',
] as const;

export const REQUIRED_BUYING_USED_HREFS = [
  '/budget',
  '/compare/gpus',
  '/calculator',
  '/gpus',
  '/gpus/r9700',
  '/gpus/rx-7900-xtx',
  '/gpus/rx-7900-xt',
  '/gpus/rx-7800-xt',
  '/gpus/rx-6800-xt',
  '/gpus/rx-6950-xt',
  '/gpus/rx-6700-xt',
  '/multi-gpu',
  '/setup/multi-gpu',
  '/power',
  '/hardware',
  '/bios',
  '/backends/llamacpp',
  '/rocm-problems/gfx1031-hsa-override',
  '/tutorials/verify-rocm',
  '/amdai-bench',
  '/disclosure',
  '/faq',
] as const;

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function buyingUsedBlob(): string {
  const classes = buyingUsedVramClasses();
  return [
    BUYING_USED_TITLE,
    BUYING_USED_DESCRIPTION,
    BUYING_USED_CITED_LABEL,
    BUYING_USED_SPEED_LABEL,
    ...BUYING_USED_GENERATIONS.map((row) => `${row.title} ${row.gfx} ${row.rocm} ${row.vulkan}`),
    ...BUYING_USED_STEPS.map((row) => `${row.title} ${row.body}`),
    ...BUYING_USED_FAQ.map((row) => `${row.question} ${row.answer}`),
    ...classes.map((row) => `${row.vramLabel} ${row.note} ${row.quants.map((q) => q.quant).join(' ')}`),
    RAM_MIN_LABEL,
    RAM_FULL_LABEL,
    COMPARE_Q3,
    COMPARE_Q3_CITE,
    BUYING_USED_LSPCI,
    BUYING_USED_ROCMINFO,
    BUYING_USED_ROCMSMI,
    BUYING_USED_VULKANINFO,
  ].join('\n');
}

export function buyingUsedHrefs(): string[] {
  const classes = buyingUsedVramClasses();
  const links = [
    ...BUYING_USED_HUB_LINKS,
    ...BUYING_USED_STEPS.flatMap((step) => step.links),
    ...BUYING_USED_FAQ.flatMap((item) => item.links),
    ...BUYING_USED_GENERATIONS.flatMap((row) => row.examples),
    ...classes.flatMap((row) => row.cards),
    ...BUYING_USED_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

export function assertBuyingUsedValid(): string[] {
  const errors: string[] = [];
  const blob = buyingUsedBlob();
  const hrefs = new Set(buyingUsedHrefs());
  const classes = buyingUsedVramClasses();

  if (BUYING_USED_PATH !== '/guides/buying-used-radeon') errors.push('path drifted');
  if (BUYING_USED_TITLE !== 'Buying a used Radeon for local AI') errors.push('title drifted');
  if (BUYING_USED_CITED_LABEL !== 'Cited, not measured on local-desktop') errors.push('cited label drifted');
  if (BUYING_USED_SPEED_LABEL !== 'not measured') errors.push('speed label drifted');
  if (BUYING_USED_GENERATIONS.length !== 3) errors.push('need RDNA4 / RDNA3 / RDNA2');
  if (BUYING_USED_STEPS.length < 8) errors.push('checklist too short');
  if (BUYING_USED_FAQ.length < 4) errors.push('need page FAQ');
  if (classes.map((row) => row.vramGb).join(',') !== '12,16,20,24,32') {
    errors.push('need 12 / 16 / 20 / 24 / 32 VRAM classes');
  }

  for (const row of classes) {
    const quants = row.quants.map((cell) => cell.quant);
    if (!quants.includes('Q6_K') || !quants.includes('Q5_K_M') || !quants.includes('Q4_K_M')) {
      errors.push(`${row.id} missing Q6/Q5/Q4`);
    }
    if (!row.quants.some((cell) => cell.quant === COMPARE_Q3 && cell.estimate)) {
      errors.push(`${row.id} Q3 must be a labeled estimate`);
    }
    for (const cell of row.quants) {
      if (cell.speed !== BUYING_USED_SPEED_LABEL) errors.push(`${row.id} invented speed`);
      if (!cell.totalGb.endsWith(' GB')) errors.push(`${row.id} VRAM missing GB label`);
    }
    if (row.offloadAppears) {
      if (row.ramNeed.atSelected.label !== 'estimate' && row.representativeHref !== '/gpus/r9700') {
        errors.push(`${row.id} used-card min RAM must stay estimate`);
      }
    }
    if (!row.note) errors.push(`${row.id} missing note`);
  }

  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (/\b\d+(?:\.\d+)?\s*tok\/s\b/i.test(blob)) errors.push('invented tok/s');
  if (/\bfailure rate\b/i.test(blob) && !/do not publish a failure rate/i.test(blob)) {
    errors.push('invented failure rate');
  }
  if (!/llama\.cpp/i.test(blob)) errors.push('must keep llama.cpp first');
  if (!/HSA_OVERRIDE_GFX_VERSION/i.test(blob)) errors.push('must cite HSA_OVERRIDE');
  if (!/gfx1031/.test(blob)) errors.push('must name gfx1031');
  if (!blob.includes(BUYING_USED_LSPCI)) errors.push('must cite lspci');
  if (!blob.includes(BUYING_USED_ROCMINFO)) errors.push('must cite rocminfo');
  if (!blob.includes(BUYING_USED_ROCMSMI)) errors.push('must cite rocm-smi');
  if (!blob.includes(BUYING_USED_VULKANINFO)) errors.push('must cite vulkaninfo');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) {
    errors.push('RAM lines missing');
  }
  if (!blob.includes(COMPARE_Q3) || !blob.includes(COMPARE_Q3_CITE)) {
    errors.push('Q3 cite missing');
  }
  if (!/Vulkan/i.test(blob)) errors.push('must name Vulkan');
  if (!/64 GB/i.test(blob)) errors.push('must cite the 64 GB shopper default');
  for (const source of BUYING_USED_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_BUYING_USED_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return [...new Set(errors)];
}
