/**
 * Consumer dual / multi-GPU guide at /multi-gpu.
 * Centered on 2× Radeon AI PRO R9700. Numbers come from local desktop cards, the dual file,
 * Flash two-card points, and cited AMD / llama.cpp / ROCm docs.
 * Desktop 2 (dual R9700 + 192 GB DDR5) is planned — not measured. Do not invent tok/s.
 */

import { DIMM_KIT_GB } from './calculator';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { type FlashDailyFile } from './flash-daily';
import { officialLinks } from './site';
import {
  COMPARE_ENGINE,
  COMPARE_MODEL,
  COMPARE_Q3,
  COMPARE_Q3_CITE,
  COMPARE_QUANTS,
  oneVsTwoRows,
} from './local-desktop-compare';
import { type DualFile } from './local-desktop-dual';
import {
  FLASH_RERUN_NOTE,
  Q6_4K_VARIANCE_NOTE,
  SWEEP_REVERIFY,
  type Qwen36CompareRow,
  type RunCard,
} from './run-card';

export const MULTI_GPU_PATH = '/multi-gpu';
export const MULTI_GPU_NAME = 'Dual / multi-GPU';
export const MULTI_GPU_PUBLISHED = '2026-10-13';
export const DESKTOP2_KIT_GB = 192;
export const LOCAL_DESKTOP_KIT_GB = 256;

export const MULTI_GPU_DIGEST =
  'When a second Radeon AI PRO R9700 helps or hurts — llama.cpp first, measured local desktop 35B and Flash, cited PCIe and PSU. Desktop 2 192 GB is planned, not measured.';

export type MultiGpuLink = { href: string; label: string };

export const MULTI_GPU_SECTIONS = [
  { id: 'when', label: 'When a second card helps' },
  { id: 'llamacpp', label: 'llama.cpp first' },
  { id: 'vllm', label: 'vLLM (secondary)' },
  { id: 'hardware', label: 'Hardware' },
  { id: 'quants', label: 'Quants' },
  { id: 'offload', label: 'RAM offload' },
  { id: 'desktop-2', label: 'Desktop 2' },
  { id: 'more', label: 'More pages' },
] as const;

export const MULTI_GPU_INTRO_LINKS: MultiGpuLink[] = [
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/qwen36-dual', label: '35B on two cards' },
  { href: '/compare/one-vs-two-gpu', label: 'One vs split' },
  { href: '/flash-daily', label: 'Flash daily' },
  { href: '/setup', label: 'First-run setup' },
  { href: '/setup/multi-gpu', label: 'Multi-GPU how-to' },
];

export const MULTI_GPU_WHEN = {
  lead:
    'A second 32 GB Radeon AI PRO R9700 is not free 2× decode. Models that already fit one card run fastest on one card. Buy the second card for a file that does not fit, or to run two models at once.',
  hurts:
    'Qwen3.6-35B-A3B Unsloth UD-Q5_K_XL at 262K is the house daily driver on ONE R9700. It stays in 32 GB VRAM. Official llama.cpp Vulkan overnight cards: one-card decode is faster than a split of the same file. A split pays a topology tax; it is not “two cards, twice the chat.”',
  helpsFit:
    'A second card is for models that do not fit one 32 GB card. The measured house example is Qwen 3.8 Flash UD-Q6_K_XL on two R9700s (Strata two-card points on /flash-daily). That file is a ~169 GB publisher listing — expect RAM / expert offload even with two cards. Do not invent a Flash split tok/s that is not on those cards.',
  helpsSide:
    'The other honest two-card job is two models side by side: Flash on one GPU plus 35B on the other. House rule: one LLM per GPU unless you deliberately combine. That is two llama-server (or Strata + llama-server) processes, each pinned to one device — not tensor parallel.',
  copies:
    'Two copies of the same 35B (one per card, least-connections balancer) serve two requests. That is concurrency, not a faster single chat. Measured soak lives on /qwen36-dual.',
};

export const MULTI_GPU_LLAMA = {
  lead:
    'llama.cpp is the consumer default. Overnight split cards recorded -sm layer. Pin one process per card when you want two models, not a split.',
  splitLayer:
    '--split-mode layer (short -sm layer) splits layers across the visible GPUs. That is the overnight 35B split on the local desktop. It is the documented llama.cpp default for multi-GPU. It is slower on this 35B than one card.',
  splitRow:
    '--split-mode row splits tensor rows (a tensor-parallel-shaped layout). llama.cpp documents the flag. We have not measured row split tok/s on the local desktop — treat any row-split speed as an estimate, not a house number.',
  tensorSplit:
    '--tensor-split / -ts sets the fraction of the model on each GPU (comma-separated). Do not invent a local desktop ratio. Copy the flag from llama.cpp --help after --list-devices; measure. Overnight cards name -sm layer, not a -ts pair.',
  mainGpu:
    '--main-gpu / -mg picks the GPU for scratch and small tensors, or the only GPU with --split-mode none. Use it when one process should own one card.',
  vulkan:
    'Vulkan: run llama-cli --list-devices and pick the R9700 (RADV GFX1201), not the iGPU. Set GGML_VK_VISIBLE_DEVICES (and VK_ICD_FILENAMES if the ICD is messy) only after that list shows the confusion. One process, one index, when you pin a model to a card.',
  hip:
    'ROCm / HIP: rocminfo first. HIP_VISIBLE_DEVICES and ROCR_VISIBLE_DEVICES select the HIP device list. PyTorch-on-ROCm still also reads CUDA_VISIBLE_DEVICES. Same rule: one model process per card unless you split on purpose.',
  pin:
    'Two models side by side: two servers, two visible-device pins, two ports (house convention: llama-server :8080, Strata :8083). Do not point both at every GPU.',
};

export const MULTI_GPU_VLLM = {
  lead:
    'vLLM tensor parallel is a secondary option, not the house path. Multi-GPU uses RCCL. Two consumer cards is a different project — start on one GPU.',
  measured:
    'The 50–61 tok/s band on /qwen36-dual is one R9700, INT4-W4A16, community/first-party image stilldeadcode/vllm-radiance:0.5.8. That is not tensor parallel. vLLM is unused on the engine catalog for this rig.',
  estimate:
    'Tensor-parallel decode on two R9700s is not measured here. Cite vLLM’s GPU install and AMD’s vLLM page; do not invent a TP tok/s.',
};

export const MULTI_GPU_HARDWARE = {
  lead:
    'Consumer boards are not Instinct servers. Matching CPU-direct lanes, slot spacing, and AMD’s published watts matter more than a second SKU sticker.',
  pcie:
    'AMD’s AM5 chipset table lists CPU graphics as 1×16 or 2×8 (PCIe 5.0 on X870E and X670E; PCIe 4.0 on B650). That is the official CPU-direct split, not a chipset x4 leftover. ROCm on Radeon multi-GPU wants identical width on the slots the GPUs use (x16+x16 or x8+x8). A mixed x16+x8 pair is listed as not recommended. Keep GPUs on CPU-connected slots; read the board map.',
  cooling:
    'The R9700 product page lists a double-slot card with active cooling. Many AI PRO cards are compact blowers that exhaust out the bracket — leave the adjacent slot empty, keep intake clear. Open-air benches lie about case recirculation. Partner coolers change acoustics; look at the actual AIB board. We do not invent a noise dB.',
  psu:
    'AMD publishes 300 W TBP and a 750 W minimum PSU recommendation per R9700 (product page). That is electrical, not a street price. Two 300 W TBP cards plus 750 W minimum per card is not a dual-card PSU SKU we will invent. Check the unit you buy; use a native 12V-2x6 cable if that is what the card expects.',
};

export const MULTI_GPU_QUANTS = {
  lead:
    'House 35B compare is Q6_K, UD-Q5_K_XL, Q5_K_M, and Q4_K_M from overnight cards. UD-Q3_K_XL is a labeled estimate from the Unsloth listing. Q1/Q2 stay off. Q3 stays on the table as that labeled estimate.',
  q3:
    `${COMPARE_Q3} is not a local desktop run. Cite: ${COMPARE_Q3_CITE}. Flash Q3 file rows on /flash-daily are the same rule — estimate unless a card is measured.`,
};

export const MULTI_GPU_OFFLOAD = {
  lead:
    'The 35B daily driver is 0% system-RAM offload on one 32 GB card. RAM offload shows up when the file does not fit — Flash Q6 is the measured house example. The calculator always prints two lines: “Minimum system RAM needed” (the load at the context you picked) and “RAM needed at full context” (262144 for the house 35B and Flash).',
  desktop2:
    'the house Desktop 2 is planned as dual Radeon AI PRO R9700 + 192 GB DDR5. 192 GB is a real DIMM kit label on the calculator. That box is not measured. Do not treat 192 GB as a local desktop result — the measured kit is 256 GB DDR5-5200 (about 249 GB usable, Linux GiB labeled GB). No Desktop 2 tok/s exists on this site.',
};

export const MULTI_GPU_MORE: { href: string; label: string; body: string }[] = [
  {
    href: '/gpus/r9700',
    label: 'R9700 measured page',
    body: '32 GB 35B llama.cpp sheet — one GPU vs split, cited cards.',
  },
  {
    href: '/qwen36-dual',
    label: '35B on two cards',
    body: 'Split vs two copies of UD-Q5_K_XL. Soak and concurrency.',
  },
  {
    href: '/compare/one-vs-two-gpu',
    label: 'One vs two GPU',
    body: 'Same 35B, one R9700 versus a split. Decode winner per row.',
  },
  {
    href: '/flash-daily',
    label: 'Flash daily driver',
    body: 'Qwen 3.8 Flash two-card Q6 points and Q3–Q6 RAM offload.',
  },
  {
    href: '/flash-ram-offload',
    label: 'Flash RAM offload',
    body: 'Experts on DDR5. Minimum system RAM and full-context lines.',
  },
  {
    href: '/backends',
    label: 'Backends',
    body: 'llama.cpp first. vLLM multi-GPU is RCCL — a different project.',
  },
  {
    href: '/backends/llamacpp',
    label: 'llama.cpp',
    body: 'Vulkan daily driver. --list-devices before visible-device pins.',
  },
  {
    href: '/setup',
    label: 'First-run setup',
    body: 'Ubuntu 24.04+ to first token, then this guide if you seat two cards.',
  },
  {
    href: '/setup/multi-gpu',
    label: 'Multi-GPU llama.cpp how-to',
    body: 'Hands-on device pins, --split-mode layer, --tensor-split, and two-server combo.',
  },
  {
    href: '/calculator',
    label: 'Calculator',
    body: 'Size a GGUF against 32 GB or 64 GB. Client-side, no prices.',
  },
  {
    href: '/budget',
    label: 'Budget',
    body: 'Starter through two-R9700 builds. No invented prices.',
  },
  {
    href: '/bios',
    label: 'BIOS',
    body: 'Above 4G, ReBAR/SAM, CSM, x8/x8 vs x16/x4 — cited chipset notes.',
  },
  {
    href: '/hardware',
    label: 'Hardware',
    body: '300 W TBP, 750 W min PSU, double slot, cooling notes.',
  },
  {
    href: '/power',
    label: 'Power and PSU',
    body: 'Cited TBP per GPU. Dual R9700 is not a PSU SKU we invent.',
  },
  {
    href: '/glossary',
    label: 'Glossary',
    body: 'Dual-GPU, offload, run cards — plain English.',
  },
  {
    href: '/benchmarks',
    label: 'Benchmarks',
    body: '33-card local desktop matrix. Every cell links a run card.',
  },
  {
    href: '/results',
    label: 'Run cards',
    body: 'Official amdai-bench/run@1. Exact launch command.',
  },
];

export const REQUIRED_MULTI_GPU_HREFS = [
  '/gpus/r9700',
  '/qwen36-dual',
  '/compare/one-vs-two-gpu',
  '/flash-daily',
  '/flash-ram-offload',
  '/backends',
  '/backends/llamacpp',
  '/setup',
  '/setup/multi-gpu',
  '/calculator',
  '/budget',
  '/glossary',
  '/bios',
  '/hardware',
  '/power',
  '/benchmarks',
  '/results',
  '/compare/q4-q5-q6',
] as const;

export const MULTI_GPU_SOURCES: { title: string; href: string }[] = [
  { title: 'llama.cpp repository', href: officialLinks.llamaCpp },
  { title: 'AMD Radeon AI PRO R9700 product page', href: officialLinks.product },
  { title: 'AMD Socket AM5 Chipset', href: 'https://www.amd.com/en/products/processors/chipsets/am5.html' },
  {
    title: 'mGPU setup and configuration (ROCm on Radeon)',
    href: 'https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/docs/install/installrad/native_linux/mgpu.html',
  },
  { title: 'vLLM GPU installation', href: officialLinks.vllmUpstream },
  { title: 'vLLM on AMD ROCm', href: officialLinks.vllmAmd },
  { title: 'Qwen3.6-35B-A3B GGUF (Unsloth)', href: officialLinks.qwen36Gguf },
];

const BANNED_VISIBLE = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function multiGpuDailyRow(cards: RunCard[]): Qwen36CompareRow | undefined {
  return oneVsTwoRows(cards).find((row) => row.quant === 'UD-Q5_K_XL' && row.context === 4096);
}

export function multiGpuDaily256k(cards: RunCard[]): Qwen36CompareRow | undefined {
  return oneVsTwoRows(cards).find((row) => row.quant === 'UD-Q5_K_XL' && row.context === 262144);
}

export function multiGpuQuantRows(cards: RunCard[]): Qwen36CompareRow[] {
  return oneVsTwoRows(cards).filter((row) => row.context === 4096);
}

export function multiGpuBlob(): string {
  return [
    MULTI_GPU_NAME,
    MULTI_GPU_DIGEST,
    MULTI_GPU_WHEN.lead,
    MULTI_GPU_WHEN.hurts,
    MULTI_GPU_WHEN.helpsFit,
    MULTI_GPU_WHEN.helpsSide,
    MULTI_GPU_WHEN.copies,
    MULTI_GPU_LLAMA.lead,
    MULTI_GPU_LLAMA.splitLayer,
    MULTI_GPU_LLAMA.splitRow,
    MULTI_GPU_LLAMA.tensorSplit,
    MULTI_GPU_LLAMA.mainGpu,
    MULTI_GPU_LLAMA.vulkan,
    MULTI_GPU_LLAMA.hip,
    MULTI_GPU_LLAMA.pin,
    MULTI_GPU_VLLM.lead,
    MULTI_GPU_VLLM.measured,
    MULTI_GPU_VLLM.estimate,
    MULTI_GPU_HARDWARE.lead,
    MULTI_GPU_HARDWARE.pcie,
    MULTI_GPU_HARDWARE.cooling,
    MULTI_GPU_HARDWARE.psu,
    MULTI_GPU_QUANTS.lead,
    MULTI_GPU_QUANTS.q3,
    MULTI_GPU_OFFLOAD.lead,
    MULTI_GPU_OFFLOAD.desktop2,
    ...MULTI_GPU_MORE.map((row) => `${row.label} ${row.body}`),
    COMPARE_MODEL,
    COMPARE_ENGINE,
    ...COMPARE_QUANTS,
    COMPARE_Q3,
    COMPARE_Q3_CITE,
    SWEEP_REVERIFY,
    FLASH_RERUN_NOTE,
    Q6_4K_VARIANCE_NOTE,
    RAM_MIN_LABEL,
    RAM_FULL_LABEL,
    '--split-mode layer',
    '--split-mode row',
    '--tensor-split',
    '--main-gpu',
    'GGML_VK_VISIBLE_DEVICES',
    'HIP_VISIBLE_DEVICES',
    'ROCR_VISIBLE_DEVICES',
  ].join('\n');
}

export function multiGpuHrefs(): string[] {
  const links = [
    ...MULTI_GPU_INTRO_LINKS,
    ...MULTI_GPU_MORE,
    { href: '/compare/q4-q5-q6', label: 'Q6 / Q5 / Q4' },
    { href: '/quants', label: 'Quants' },
    { href: '/backends/vllm', label: 'vLLM' },
    { href: '/tutorials/run-local-llm', label: 'Run a local Qwen' },
    { href: '/tutorials/verify-rocm', label: 'Verify ROCm' },
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

export function assertMultiGpuValid(cards: RunCard[], dual: DualFile, flash: FlashDailyFile): string[] {
  const errors: string[] = [];
  const blob = multiGpuBlob();
  const hrefs = new Set(multiGpuHrefs());
  const daily = multiGpuDailyRow(cards);
  const at256 = multiGpuDaily256k(cards);

  if (!daily || daily.one.decode === 'not measured' || !daily.one.runIds.length) {
    errors.push('missing cited UD-Q5 1× 4K decode');
  }
  if (!daily || daily.both.decode === 'not measured' || !daily.both.runIds.length) {
    errors.push('missing cited UD-Q5 split 4K decode');
  }
  if (!at256 || at256.one.decode === 'not measured') {
    errors.push('missing cited UD-Q5 1× 256K decode');
  }

  if (dual.host !== 'local desktop') errors.push('dual host must be local desktop');
  if (dual.kit.dimm_gb !== LOCAL_DESKTOP_KIT_GB) errors.push('measured kit is 256 GB');
  if (flash.measured_q6_two_cards.cards !== 2) errors.push('Flash Q6 two-card row must name two cards');
  if (flash.measured_q6_two_cards.strata_8k_tok_s !== 32.8) errors.push('Flash two-card 8K must stay 32.8');
  if (flash.measured_q6_two_cards.strata_100k_tok_s !== 31.8) errors.push('Flash two-card 100K must stay 31.8');

  if (!(DIMM_KIT_GB as readonly number[]).includes(DESKTOP2_KIT_GB)) {
    errors.push('Desktop 2 192 GB is not a calculator DIMM kit');
  }
  if (!/planned/i.test(MULTI_GPU_OFFLOAD.desktop2) || !/not measured/i.test(MULTI_GPU_OFFLOAD.desktop2)) {
    errors.push('Desktop 2 must stay planned / not measured');
  }
  if (!/256/.test(MULTI_GPU_OFFLOAD.desktop2)) errors.push('must name the 256 GB local desktop kit');

  if (!/--split-mode layer/.test(blob) || !/--split-mode row/.test(blob)) {
    errors.push('must name both llama.cpp split modes');
  }
  if (!/--tensor-split/.test(blob) || !/--main-gpu/.test(blob)) {
    errors.push('must name --tensor-split and --main-gpu');
  }
  if (!/GGML_VK_VISIBLE_DEVICES/.test(blob)) errors.push('missing Vulkan device pin');
  if (!/HIP_VISIBLE_DEVICES/.test(blob) || !/ROCR_VISIBLE_DEVICES/.test(blob)) {
    errors.push('missing HIP device pins');
  }
  if (!/estimate/i.test(MULTI_GPU_LLAMA.splitRow)) errors.push('row split must stay an estimate');
  if (!/secondary|different project/i.test(MULTI_GPU_VLLM.lead)) {
    errors.push('vLLM must stay secondary');
  }
  if (!/not measured/i.test(MULTI_GPU_VLLM.estimate)) errors.push('vLLM TP must stay unmeasured');
  if (!/300 W/.test(blob) || !/750 W/.test(blob)) errors.push('must cite AMD 300 W TBP and 750 W min PSU');
  if (!/1×16 or 2×8/.test(blob)) errors.push('must cite AM5 1×16 or 2×8');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) {
    errors.push('calculator RAM lines missing');
  }
  if (!/UD-Q3_K_XL/.test(blob) || !/estimate/i.test(MULTI_GPU_QUANTS.q3)) {
    errors.push('Q3 must stay a labeled estimate');
  }
  if (!/one LLM per GPU/i.test(blob)) errors.push('house rule missing');

  if (BANNED_VISIBLE.test(blob)) errors.push('banned model');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bUSD\b|\bMSRP\b/i.test(blob)) errors.push('invented price');

  for (const required of REQUIRED_MULTI_GPU_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  for (const source of MULTI_GPU_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`non-https ${source.href}`);
  }
  return [...new Set(errors)];
}

export { COMPARE_ENGINE, COMPARE_MODEL, COMPARE_Q3, COMPARE_Q3_CITE, COMPARE_QUANTS, FLASH_RERUN_NOTE, Q6_4K_VARIANCE_NOTE, SWEEP_REVERIFY };
