/**
 * Cited guide: make your own GGUF quants for a Radeon GPU with llama.cpp.
 * Linux / Ubuntu 24.04+ first. Convert → optional imatrix → Q6_K / Q5_K_M /
 * Q4_K_M. Unsloth UD-*_XL is the house default (download, do not claim stock
 * llama-quantize reproduces it). Q3 is a labeled estimate only — never a
 * house-rig quantize command. Q1/Q2 stay off. File sizes from HF listings;
 * computed sums stay labeled estimate. Measured decode from local desktop cards.
 */

import {
  DIMM_KIT_GB,
  OS_DESKTOP_BASELINE_GIB,
  RAM_HEADROOM_GIB,
  formatKitGb,
  roundUpToDimmKitGb,
} from './calculator';
import { LLAMA_CONVERT, LLAMA_QUANTIZE } from './fine-tuning';
import { houseSystemRam } from './house-ram';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { officialLinks } from './site';
import {
  COMPARE_ENGINE,
  COMPARE_MODEL,
  COMPARE_Q3,
  COMPARE_Q3_CITE,
  oneVsTwoRows,
} from './local-desktop-compare';
import type { RunCard } from './run-card';

export const QUANTIZE_GGUF_PATH = '/guides/quantize-gguf';
export const QUANTIZE_GGUF_TITLE = 'Make your own GGUF quants for a Radeon GPU with llama.cpp';
export const QUANTIZE_GGUF_NAME = 'Make your own GGUF quants';
export const QUANTIZE_GGUF_DESCRIPTION =
  'Make your own GGUF quants for a Radeon GPU with llama.cpp. Convert, optional imatrix, then Q6/Q5/Q4. Unsloth UD is the house default.';
export const QUANTIZE_GGUF_PUBLISHED = '2026-10-14';
export const QUANTIZE_GGUF_CITED_LABEL = 'Cited llama.cpp + Unsloth docs · convert not measured on the local desktop';
export const QUANTIZE_GGUF_UNMEASURED = 'not measured on the local desktop';
export const QUANTIZE_GGUF_HOUSE_QUANTS = ['Q6_K', 'Q5_K_M', 'Q4_K_M'] as const;

export const LLAMA_IMATRIX =
  'https://github.com/ggml-org/llama.cpp/blob/master/tools/imatrix/README.md';
export const LLAMA_PERPLEXITY =
  'https://github.com/ggml-org/llama.cpp/blob/master/tools/perplexity/README.md';
export const UNSLOTH_DYNAMIC = 'https://unsloth.ai/docs/basics/dynamic-3.0-ggufs';
export const HF_QWEN36 = 'https://huggingface.co/Qwen/Qwen3.6-35B-A3B';
export const HF_UNSLOTH_35B = 'https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF';
export const HF_UNSLOTH_TREE = 'https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF/tree/main';

/** Sum of the 26 listed Qwen/Qwen3.6-35B-A3B safetensors shards (bytes / 1e9, one decimal). */
export const HF_SAFETENSORS_SHARDS = 26;
export const HF_SAFETENSORS_GB_ESTIMATE = '71.9';
export const HF_SAFETENSORS_CITE =
  'Hugging Face listings for Qwen/Qwen3.6-35B-A3B model-00001-of-00026.safetensors through model-00026-of-00026.safetensors (sum 71.9 GB, estimate)';

/** Sum of the two listed Unsloth BF16 GGUF shards. */
export const BF16_GB_ESTIMATE = '69.4';
export const BF16_CITE =
  'Hugging Face listings for unsloth/Qwen3.6-35B-A3B-GGUF BF16/Qwen3.6-35B-A3B-BF16-00001-of-00002.gguf + 00002-of-00002.gguf (sum 69.4 GB, estimate)';

export const UD_Q6_XL_GB = '31.8';
export const UD_Q6_XL_CITE = 'Hugging Face listing for Qwen3.6-35B-A3B-UD-Q6_K_XL.gguf (31.8 GB)';
export const UD_Q5_XL_GB = '26.6';
export const UD_Q5_XL_CITE = 'Hugging Face listing for Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf (26.6 GB)';
export const UD_Q4_XL_GB = '22.4';
export const UD_Q4_XL_CITE = 'Hugging Face listing for Qwen3.6-35B-A3B-UD-Q4_K_XL.gguf (22.4 GB)';

export type QuantizeLink = { href: string; label: string };

export type QuantizeSource = {
  id: string;
  title: string;
  href: string;
};

export type QuantizeStep = {
  id: string;
  title: string;
  body: string;
  command?: string;
  links: QuantizeLink[];
};

export type QuantizeFaq = {
  id: string;
  question: string;
  answer: string;
  links: QuantizeLink[];
};

export type QuantizeDiskRow = {
  id: string;
  step: string;
  disk: string;
  ram: string;
  label: 'listing' | 'estimate';
};

export type QuantizeQualityRow = {
  id: string;
  quant: string;
  size: string;
  decode4k: string;
  decode32k: string;
  quality: string;
  estimate: boolean;
  href: string;
};

export const QUANTIZE_GGUF_SOURCES: QuantizeSource[] = [
  { id: 'llama-convert', title: 'llama.cpp convert_hf_to_gguf.py', href: LLAMA_CONVERT },
  { id: 'llama-quantize', title: 'llama.cpp tools/quantize README', href: LLAMA_QUANTIZE },
  { id: 'llama-imatrix', title: 'llama.cpp tools/imatrix README', href: LLAMA_IMATRIX },
  { id: 'llama-perplexity', title: 'llama.cpp tools/perplexity README', href: LLAMA_PERPLEXITY },
  { id: 'llama-repo', title: 'llama.cpp repository', href: officialLinks.llamaCpp },
  { id: 'unsloth-dynamic', title: 'Unsloth — Dynamic 3.0 GGUFs', href: UNSLOTH_DYNAMIC },
  { id: 'hf-qwen36', title: 'Qwen — Qwen3.6-35B-A3B model card', href: HF_QWEN36 },
  { id: 'hf-unsloth', title: 'Unsloth — Qwen3.6-35B-A3B-GGUF', href: HF_UNSLOTH_35B },
  { id: 'hf-unsloth-tree', title: 'Unsloth — Qwen3.6-35B-A3B-GGUF file tree', href: HF_UNSLOTH_TREE },
];

export const QUANTIZE_GGUF_HUB_LINKS: QuantizeLink[] = [
  { href: '/quants', label: 'Quants' },
  { href: '/compare/q4-q5-q6', label: 'Q6 vs Q5 vs Q4' },
  { href: '/models', label: 'Models' },
  { href: '/fine-tuning', label: 'Fine-tuning' },
  { href: '/tuning', label: 'Speed up llama.cpp' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/amdai-bench', label: 'amdai-bench' },
  { href: '/benchmarks/methodology', label: 'How we test' },
];

export const QUANTIZE_GGUF_LEAD =
  `People with an R9700 or another Radeon often find a new ${COMPARE_MODEL} drop with no Q5 / Q6 GGUF yet, or want an imatrix quant tuned to their own calibration text. /quants and /compare/q4-q5-q6 explain the encodings — this page is the llama.cpp how-to. Ubuntu 24.04+ first. convert_hf_to_gguf.py to an f16 or bf16 GGUF, optional llama-imatrix, then llama-quantize to Q6_K, Q5_K_M, or Q4_K_M. The house default is still a downloaded Unsloth UD-*_XL file — stock llama-quantize does not reproduce those dynamic mixes. ${COMPARE_Q3} stays a labeled estimate (${COMPARE_Q3_CITE}). Q1/Q2 stay off. Convert and quantize speeds stay ${QUANTIZE_GGUF_UNMEASURED}.`;

export const QUANTIZE_GGUF_UD =
  `Unsloth Dynamic 2.0 / 3.0 GGUFs pick a per-layer quant mix and a hand-curated imatrix calibration set. That is why the house daily driver is UD-Q5_K_XL (${UD_Q5_XL_CITE}) and why Flash uses UD-Q6_K_XL — download those names from ${HF_UNSLOTH_35B}, do not try to recreate them with stock llama-quantize Q5_K_M. Unsloth documents the method; nothing in the llama.cpp quantize README says a stock Q5_K_M or Q6_K run matches a UD-*_XL file. Prefer the UD download when the file already exists. Use this page when it does not, or when you want your own calibration text.`;

export const QUANTIZE_GGUF_CONVERT = [
  '# Ubuntu 24.04+ · llama.cpp first. Stage on NVMe, not a slow bulk drive.',
  '# convert_hf_to_gguf.py --outtype choices (official): f32, f16, bf16, q8_0, auto.',
  '# --outtype auto (or omitting --outtype) is the 16-bit pick when the HF folder is already 16-bit.',
  '# --remote is marked experimental; prefer a local folder after you download the card.',
  'python convert_hf_to_gguf.py ./Qwen3.6-35B-A3B \\',
  '  --outfile ./Qwen3.6-35B-A3B-bf16.gguf \\',
  '  --outtype bf16',
].join('\n');

export const QUANTIZE_GGUF_IMATRIX = [
  '# Optional. -m and -f are mandatory on the imatrix README.',
  '# Use your own calibration text. Do not claim this matches Unsloth UD.',
  './build/bin/llama-imatrix \\',
  '  -m ./Qwen3.6-35B-A3B-bf16.gguf \\',
  '  -f calibration.txt \\',
  '  -o imatrix.gguf \\',
  '  -ngl 99',
].join('\n');

export const QUANTIZE_GGUF_QUANT = [
  '# House-rig outputs: Q6_K, Q5_K_M, Q4_K_M. Do not produce a Q3 file on this box.',
  './build/bin/llama-quantize --imatrix imatrix.gguf \\',
  '  ./Qwen3.6-35B-A3B-bf16.gguf ./Qwen3.6-35B-A3B-Q6_K.gguf Q6_K',
  './build/bin/llama-quantize --imatrix imatrix.gguf \\',
  '  ./Qwen3.6-35B-A3B-bf16.gguf ./Qwen3.6-35B-A3B-Q5_K_M.gguf Q5_K_M',
  './build/bin/llama-quantize --imatrix imatrix.gguf \\',
  '  ./Qwen3.6-35B-A3B-bf16.gguf ./Qwen3.6-35B-A3B-Q4_K_M.gguf Q4_K_M',
].join('\n');

export const QUANTIZE_GGUF_PPL = [
  '# llama.cpp perplexity README: Wikitext-2 via scripts/get-wikitext-2.sh unless noted.',
  '# Numbers are not comparable across models or tokenizers. We do not invent a house PPL.',
  './build/bin/llama-perplexity -m ./Qwen3.6-35B-A3B-Q5_K_M.gguf -f wiki.test.raw',
].join('\n');

export const QUANTIZE_GGUF_KLD = [
  '# Record f16/bf16 logits, then compare the quant. Cite llama.cpp perplexity README.',
  '# The logit file is very large (README: 11 GiB for LLaMA 2, 37 GiB for LLaMA 3 on Wikitext-2).',
  '# 35B size is not listed — stage leftover on NVMe. We do not invent a 35B .kld size.',
  './build/bin/llama-perplexity -m ./Qwen3.6-35B-A3B-bf16.gguf \\',
  '  -f wiki.test.raw --kl-divergence-base ./baseline.kld',
  './build/bin/llama-perplexity -m ./Qwen3.6-35B-A3B-Q5_K_M.gguf \\',
  '  -f wiki.test.raw --kl-divergence-base ./baseline.kld --kl-divergence',
].join('\n');

export const QUANTIZE_GGUF_STEPS: QuantizeStep[] = [
  {
    id: 'nvme',
    title: 'Stage the work on NVMe, not a slow bulk drive',
    body: `A 35B MoE convert writes the Hugging Face folder and a high-precision GGUF next to it. ${HF_SAFETENSORS_CITE}. ${BF16_CITE}. llama.cpp’s quantize README: the model is fully loaded, and “memory and disk requirements are the same.” Leave leftover space for one Q6 / Q5 / Q4 output plus, if you run KLD, a large logit file. Put that on NVMe. A USB or archive HDD will stall the convert.`,
    links: [
      { href: '/glossary#nvme', label: 'NVMe' },
      { href: '/models/qwen36', label: 'Qwen3.6-35B-A3B' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'convert',
    title: 'Convert the HF folder to an f16 or bf16 GGUF',
    body: `Install llama.cpp Python requirements, then run convert_hf_to_gguf.py on the local Qwen/Qwen3.6-35B-A3B folder. Official --outtype values include f16, bf16, and auto (highest-fidelity 16-bit). The quantize README example uses --outtype bf16; --outtype auto (or omitting --outtype) is the usual pick when the card is already 16-bit. --remote is experimental and still downloads config and tokenizer. After a LoRA merge, the same convert step lives on /fine-tuning — this page does not retell adapters.`,
    command: QUANTIZE_GGUF_CONVERT,
    links: [
      { href: '/fine-tuning', label: 'Fine-tuning (merge, then convert)' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/setup', label: 'First-run setup' },
    ],
  },
  {
    id: 'imatrix',
    title: 'Optional: llama-imatrix with your calibration text',
    body: `llama.cpp’s imatrix README: compute an importance matrix from a model and a text file, then pass it to llama-quantize to reduce quality loss. Mandatory flags are -m / --model and -f / --file. Default output is imatrix.gguf. GPU offload uses -ngl. This is your calibration text, not Unsloth’s unpublished mix — a stock imatrix Q5_K_M is still not a UD-Q5_K_XL file.`,
    command: QUANTIZE_GGUF_IMATRIX,
    links: [
      { href: '/glossary#imatrix', label: 'imatrix' },
      { href: '/quants', label: 'Quants' },
      { href: '/glossary#unsloth-ud', label: 'Unsloth UD' },
    ],
  },
  {
    id: 'quantize',
    title: 'llama-quantize to Q6_K, Q5_K_M, or Q4_K_M',
    body: `The official two-phase path is convert, then llama-quantize. House-rig outputs on this page are Q6_K, Q5_K_M, and Q4_K_M. Pass --imatrix imatrix.gguf when you built one. Do not --allow-requantize from an already-quantized GGUF unless you accept the README warning that it can severely reduce quality versus 16-bit. ${COMPARE_Q3} is a labeled estimate in the table only — do not produce a Q3 file on the house rig. Q1/Q2 stay off.`,
    command: QUANTIZE_GGUF_QUANT,
    links: [
      { href: '/quants', label: 'Quants' },
      { href: '/compare/q4-q5-q6', label: 'Q6 vs Q5 vs Q4' },
      { href: '/stacks', label: 'Stacks' },
    ],
  },
  {
    id: 'verify-ppl',
    title: 'Verify with llama-perplexity (and optional KLD)',
    body: `llama.cpp measures quant accuracy loss with perplexity and/or KL-divergence versus the f16 / bf16 baseline. The perplexity README uses Wikitext-2 (scripts/get-wikitext-2.sh) unless noted, and says PPL is not comparable across models. Record baseline logits with --kl-divergence-base, then rerun the quant with --kl-divergence-base plus --kl-divergence. We have no house PPL or KLD score — run the tool, do not copy a screenshot.`,
    command: `${QUANTIZE_GGUF_PPL}\n\n${QUANTIZE_GGUF_KLD}`,
    links: [
      { href: '/glossary#kl-divergence', label: 'KL-divergence' },
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/benchmarks/methodology', label: 'How we test' },
    ],
  },
  {
    id: 'bench',
    title: 'Then record an amdai-bench run',
    body: `PPL / KLD is the quality check. Shopper speed and VRAM still come from an amdai-bench/run@1 card — same method as /benchmarks/methodology. Launch llama-server with the new GGUF, then record decode, prefill, peak VRAM, and both RAM lines. Link the card from /results. Do not invent a tok/s.`,
    links: [
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/benchmarks/methodology', label: 'Methodology' },
      { href: '/results', label: 'Run cards' },
      { href: '/stack-lab', label: 'Stack Lab' },
    ],
  },
];

export const QUANTIZE_GGUF_HOWTO_STEPS = QUANTIZE_GGUF_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const QUANTIZE_GGUF_FAQ: QuantizeFaq[] = [
  {
    id: 'when',
    question: 'When should I make my own GGUF instead of downloading Unsloth UD?',
    answer:
      'When the model has no Q5 / Q6 GGUF yet, or you want an imatrix built on your own calibration text. The house default is still a downloaded Unsloth UD-*_XL file. Stock llama-quantize does not reproduce UD dynamic mixes. After a LoRA merge, convert then quantize — /fine-tuning covers the merge.',
    links: [
      { href: '/quants', label: 'Quants' },
      { href: '/fine-tuning', label: 'Fine-tuning' },
      { href: '/stacks', label: 'Stacks' },
    ],
  },
  {
    id: 'which-quant',
    question: 'Which quant should I produce on a Radeon box?',
    answer:
      'Q6_K, Q5_K_M, or Q4_K_M. Prefer Q5 over Q4 when the file still fits. Q3 is a labeled estimate on /compare/q4-q5-q6 — not a house-rig quantize command. Q1/Q2 stay off.',
    links: [
      { href: '/compare/q4-q5-q6', label: 'Q6 vs Q5 vs Q4' },
      { href: '/quants', label: 'Quants' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'disk-ram',
    question: 'How much disk and RAM does a 35B convert take?',
    answer: `${HF_SAFETENSORS_CITE}. ${BF16_CITE}. llama.cpp says convert memory and disk match because the model is fully loaded. ${RAM_MIN_LABEL} for convert is a ${formatKitGb(quantizeConvertKitGb())} estimate (${HF_SAFETENSORS_GB_ESTIMATE} GB weights + ${OS_DESKTOP_BASELINE_GIB} GB OS baseline + ${RAM_HEADROOM_GIB} GB headroom, rounded to a real DIMM). ${RAM_FULL_LABEL} is the inference line for the produced file at the model’s full context — measured on the house UD-Q5 when a card recorded it. Stage on NVMe.`,
    links: [
      { href: '/models/qwen36', label: 'Qwen3.6-35B-A3B' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/glossary#nvme', label: 'NVMe' },
    ],
  },
  {
    id: 'verify',
    question: 'How do I know the quant is any good?',
    answer:
      'llama-perplexity versus the f16 / bf16 GGUF, or KL-divergence with --kl-divergence-base then --kl-divergence (llama.cpp perplexity README). Then an amdai-bench run for decode / VRAM. We do not invent a house PPL or KLD number.',
    links: [
      { href: '/amdai-bench', label: 'amdai-bench' },
      { href: '/benchmarks/methodology', label: 'How we test' },
      { href: '/glossary#kl-divergence', label: 'KL-divergence' },
    ],
  },
];

export function quantizeConvertKitGb(): (typeof DIMM_KIT_GB)[number] {
  const raw = Number(HF_SAFETENSORS_GB_ESTIMATE) + OS_DESKTOP_BASELINE_GIB + RAM_HEADROOM_GIB;
  return roundUpToDimmKitGb(raw) as (typeof DIMM_KIT_GB)[number];
}

export function quantizeConvertRamNote(): string {
  const kit = formatKitGb(quantizeConvertKitGb());
  return `${RAM_MIN_LABEL} for convert is a ${kit} kit estimate: ${HF_SAFETENSORS_GB_ESTIMATE} GB HF weights (${HF_SAFETENSORS_CITE}) + ${OS_DESKTOP_BASELINE_GIB} GB OS baseline + ${RAM_HEADROOM_GIB} GB headroom, rounded to a real DIMM. llama.cpp: memory and disk requirements are the same while converting. --use-temp-file is the cited escape if the process is killed. ${RAM_FULL_LABEL} is the inference KV line at the model’s full context — not the convert. GB here is Linux GiB printed as GB.`;
}

export function quantizeDailyRamNeed() {
  return houseSystemRam('daily');
}

export function quantizeDiskRows(): QuantizeDiskRow[] {
  const kit = formatKitGb(quantizeConvertKitGb());
  return [
    {
      id: 'hf',
      step: 'HF folder (Qwen/Qwen3.6-35B-A3B)',
      disk: `${HF_SAFETENSORS_GB_ESTIMATE} GB · ${HF_SAFETENSORS_SHARDS} safetensors shards`,
      ram: 'Not loaded until convert',
      label: 'estimate',
    },
    {
      id: 'convert',
      step: 'convert_hf_to_gguf.py → bf16 / f16 GGUF',
      disk: `${BF16_GB_ESTIMATE} GB Unsloth BF16 listing sum (your convert may differ)`,
      ram: `${kit} kit · llama.cpp: memory matches disk while the model is fully loaded`,
      label: 'estimate',
    },
    {
      id: 'imatrix',
      step: 'llama-imatrix (optional)',
      disk: 'imatrix.gguf plus the bf16 GGUF already on disk — no listed 35B imatrix size for a home run',
      ram: 'Loads the bf16 / f16 GGUF. -ngl offloads layers',
      label: 'estimate',
    },
    {
      id: 'quantize',
      step: 'llama-quantize → Q6_K / Q5_K_M / Q4_K_M',
      disk: 'One output next to the bf16 GGUF. Stock sizes have no HF listing. House UD downloads: UD-Q6_K_XL 31.8 GB, UD-Q5_K_XL 26.6 GB, UD-Q4_K_XL 22.4 GB (listings, not stock output)',
      ram: 'Loads the high-precision GGUF. Same leftover-on-NVMe rule',
      label: 'estimate',
    },
    {
      id: 'kld',
      step: 'llama-perplexity KL-divergence logits',
      disk: 'Very large (README: 11 GiB LLaMA 2, 37 GiB LLaMA 3 on Wikitext-2). 35B size not listed',
      ram: 'Loads the baseline or quant GGUF for the pass',
      label: 'estimate',
    },
  ];
}

export function quantizeQualityRows(cards: RunCard[]): QuantizeQualityRow[] {
  const sides = oneVsTwoRows(cards);
  const cell = (quant: string, context: number) =>
    sides.find((row) => row.quant === quant && row.context === context)?.one;

  const measured = (
    id: string,
    quant: string,
    size: string,
    href: string,
  ): QuantizeQualityRow => {
    const at4k = cell(quant, 4096);
    const at32k = cell(quant, 32768);
    return {
      id,
      quant,
      size,
      decode4k: at4k?.decode ?? QUANTIZE_GGUF_UNMEASURED,
      decode32k: at32k?.decode ?? QUANTIZE_GGUF_UNMEASURED,
      quality: 'PPL / KLD not measured on the local desktop — run llama-perplexity',
      estimate: false,
      href,
    };
  };

  return [
    measured('q6', 'Q6_K', 'No HF listing for stock Q6_K. House UD-Q6_K_XL listing 31.8 GB is a download, not this output', '/compare/q4-q5-q6'),
    measured('q5xl', 'UD-Q5_K_XL', `${UD_Q5_XL_CITE} · house download, not a stock llama-quantize output`, '/compare/q4-q5-q6'),
    measured('q5', 'Q5_K_M', 'No HF listing for stock Q5_K_M. Prefer a UD-Q5_K_XL download when it exists', '/compare/q4-q5-q6'),
    measured('q4', 'Q4_K_M', 'No HF listing for stock Q4_K_M. UD-Q4_K_XL listing 22.4 GB is a download, not this output', '/compare/q4-q5-q6'),
    {
      id: 'q3',
      quant: COMPARE_Q3,
      size: COMPARE_Q3_CITE,
      decode4k: QUANTIZE_GGUF_UNMEASURED,
      decode32k: QUANTIZE_GGUF_UNMEASURED,
      quality: 'Labeled estimate. Not a house-rig quantize command. PPL / KLD not measured',
      estimate: true,
      href: '/compare/q4-q5-q6',
    },
  ];
}

export const REQUIRED_QUANTIZE_GGUF_HREFS = [
  '/quants',
  '/compare/q4-q5-q6',
  '/models',
  '/models/qwen36',
  '/fine-tuning',
  '/tuning',
  '/calculator',
  '/amdai-bench',
  '/benchmarks/methodology',
  '/results',
  '/stacks',
  '/backends/llamacpp',
  '/glossary#imatrix',
  '/glossary#kl-divergence',
  '/glossary#nvme',
  '/setup',
  '/stack-lab',
] as const;

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function quantizeGgufBlob(): string {
  return [
    QUANTIZE_GGUF_TITLE,
    QUANTIZE_GGUF_DESCRIPTION,
    QUANTIZE_GGUF_LEAD,
    QUANTIZE_GGUF_UD,
    QUANTIZE_GGUF_CITED_LABEL,
    QUANTIZE_GGUF_UNMEASURED,
    QUANTIZE_GGUF_CONVERT,
    QUANTIZE_GGUF_IMATRIX,
    QUANTIZE_GGUF_QUANT,
    QUANTIZE_GGUF_PPL,
    QUANTIZE_GGUF_KLD,
    quantizeConvertRamNote(),
    ...QUANTIZE_GGUF_STEPS.map((step) => `${step.title} ${step.body} ${step.command ?? ''}`),
    ...QUANTIZE_GGUF_FAQ.map((item) => `${item.question} ${item.answer}`),
    ...quantizeDiskRows().map((row) => `${row.step} ${row.disk} ${row.ram}`),
    RAM_MIN_LABEL,
    RAM_FULL_LABEL,
    COMPARE_MODEL,
    COMPARE_ENGINE,
    COMPARE_Q3,
    COMPARE_Q3_CITE,
    HF_SAFETENSORS_CITE,
    BF16_CITE,
    UD_Q5_XL_CITE,
    UD_Q6_XL_CITE,
    UD_Q4_XL_CITE,
  ].join('\n');
}

export function quantizeGgufHrefs(): string[] {
  const links = [
    ...QUANTIZE_GGUF_HUB_LINKS,
    ...QUANTIZE_GGUF_STEPS.flatMap((step) => step.links),
    ...QUANTIZE_GGUF_FAQ.flatMap((item) => item.links),
    ...QUANTIZE_GGUF_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => link.href))];
}

export function assertQuantizeGgufValid(cards: RunCard[] = []): string[] {
  const errors: string[] = [];
  const blob = quantizeGgufBlob();
  const hrefs = quantizeGgufHrefs();
  const rows = quantizeQualityRows(cards);

  if (QUANTIZE_GGUF_PATH !== '/guides/quantize-gguf') errors.push('path drifted');
  if (QUANTIZE_GGUF_TITLE !== 'Make your own GGUF quants for a Radeon GPU with llama.cpp') {
    errors.push('title drifted');
  }
  if (QUANTIZE_GGUF_DESCRIPTION.length > 160) errors.push('description over 160');
  if (QUANTIZE_GGUF_STEPS.length < 6) errors.push('howto too short');
  if (QUANTIZE_GGUF_FAQ.length < 4) errors.push('need page FAQ');
  if (!QUANTIZE_GGUF_HOUSE_QUANTS.every((q) => blob.includes(q))) {
    errors.push('missing house Q6/Q5/Q4');
  }

  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (!/llama\.cpp/i.test(blob)) errors.push('must keep llama.cpp first');
  if (!/convert_hf_to_gguf/.test(blob)) errors.push('must cite convert_hf_to_gguf');
  if (!/llama-quantize/.test(blob)) errors.push('must cite llama-quantize');
  if (!/llama-imatrix/.test(blob)) errors.push('must cite llama-imatrix');
  if (!/llama-perplexity/.test(blob)) errors.push('must cite llama-perplexity');
  if (!/kl-divergence/.test(blob)) errors.push('must cite KL-divergence');
  if (!/Unsloth/i.test(blob)) errors.push('must cite Unsloth UD');
  if (!/does not reproduce/i.test(blob)) errors.push('must say stock tools do not reproduce UD');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) {
    errors.push('RAM lines missing');
  }
  if (!blob.includes(COMPARE_Q3) || !blob.includes(COMPARE_Q3_CITE)) {
    errors.push('Q3 cite missing');
  }
  if (!/NVMe/.test(blob)) errors.push('must say NVMe');
  if (!/Ubuntu 24\.04/.test(blob)) errors.push('must name Ubuntu 24.04');
  if (!blob.includes(HF_SAFETENSORS_GB_ESTIMATE) || !blob.includes(BF16_GB_ESTIMATE)) {
    errors.push('missing cited 35B sizes');
  }
  if (!/estimate/i.test(HF_SAFETENSORS_CITE) || !/estimate/i.test(BF16_CITE)) {
    errors.push('computed sizes must stay labeled estimate');
  }

  const quantCommands = QUANTIZE_GGUF_QUANT;
  if (/Q3_K/i.test(quantCommands)) errors.push('house quantize command must not produce Q3');
  if (!quantCommands.includes('Q6_K') || !quantCommands.includes('Q5_K_M') || !quantCommands.includes('Q4_K_M')) {
    errors.push('house quantize command missing Q6/Q5/Q4');
  }

  if (cards.length) {
    const q3 = rows.find((row) => row.quant === COMPARE_Q3);
    if (!q3?.estimate) errors.push('Q3 row must be labeled estimate');
    if (q3 && q3.decode4k !== QUANTIZE_GGUF_UNMEASURED) errors.push('invented Q3 tok/s');
    const allowedTok = new Set<string>();
    for (const side of oneVsTwoRows(cards)) {
      if (side.one.decode && side.one.decode !== 'not measured') allowedTok.add(side.one.decode);
    }
    const toks = blob.match(/\b\d+(?:\.\d+)?\s*tok\/s\b/gi) ?? [];
    for (const hit of toks) {
      const ok = [...allowedTok].some((cell) => cell.includes(hit.replace(/\s+/g, ' ').trim()) || hit.includes(cell));
      if (!ok && !allowedTok.has(hit)) {
        const numeric = hit.match(/[\d.]+/)?.[0];
        const matched = numeric && [...allowedTok].some((cell) => cell.includes(numeric));
        if (!matched) errors.push(`invented tok/s ${hit}`);
      }
    }
  }

  for (const source of QUANTIZE_GGUF_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_QUANTIZE_GGUF_HREFS) {
    if (!hrefs.some((href) => href === required || href.startsWith(`${required}`) || href.startsWith(required))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return [...new Set(errors)];
}
