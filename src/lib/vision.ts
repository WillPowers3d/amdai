/**
 * Cited consumer guide for local vision on Radeon.
 * llama.cpp mmproj / libmtmd first. Image in, text out.
 * No invented tok/s, projector sizes, or prices. Q3 is a labeled estimate.
 */

import { CONSUMER_NAV_LINKS } from './consumer-gpu';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';

export const VISION_PUBLISHED = '2026-10-14';
export const VISION_CITED_LABEL = 'Cited, not measured on local-desktop';
export const VISION_SPEED_LABEL = 'not yet measured by AMDai';
export const VISION_EMPTY = 'not measured yet';

export type VisionLink = { href: string; label: string };

export type VisionSource = {
  id: string;
  title: string;
  href: string;
};

export type VisionStep = {
  id: string;
  title: string;
  body: string;
  links: VisionLink[];
};

export type VisionFitRow = {
  id: string;
  vramClass: string;
  cards: VisionLink[];
  fit: string;
  speed: string;
};

export type VisionFaq = {
  id: string;
  question: string;
  answer: string;
  links: VisionLink[];
};

export const VISION_TITLE = 'Local vision on Radeon';
export const VISION_DESCRIPTION =
  'Cited llama.cpp mmproj path for image-in text-out on Radeon. Linux first. Speeds not yet measured by AMDai. Q3 is a labeled estimate.';

export const VISION_LEAD = `
  Local vision here means you pass a picture to a local LLM and get text back
  — caption, OCR, or a question about the image — without a hosted API.
  On AMDai the first path is llama.cpp multimodal: a text GGUF plus a matching
  multimodal projector (mmproj) GGUF, served by llama-mtmd-cli or llama-server.
  That is a different job from ComfyUI image generation. Speeds stay
  ${VISION_SPEED_LABEL}.
`.replace(/\s+/g, ' ').trim();

export const VISION_SOURCES: VisionSource[] = [
  {
    id: 'mtmd',
    title: 'llama.cpp tools/mtmd README (mmproj, libmtmd)',
    href: 'https://github.com/ggml-org/llama.cpp/blob/master/tools/mtmd/README.md',
  },
  {
    id: 'multimodal',
    title: 'llama.cpp docs/multimodal.md',
    href: 'https://github.com/ggml-org/llama.cpp/blob/master/docs/multimodal.md',
  },
  {
    id: 'ggml-collection',
    title: 'ggml-org multimodal GGUF collection',
    href: 'https://huggingface.co/collections/ggml-org/multimodal-ggufs-68244e01ff1f39e5bebeeedc',
  },
];

export const VISION_WHAT = `
  llama.cpp encodes the image with the mmproj file and feeds embeddings into
  the language model. The mtmd README says you typically need two GGUF files:
  the text model and a corresponding mmproj. libmtmd replaces the older
  llava.cpp path. The multimodal doc names llama-mtmd-cli and llama-server
  (OpenAI-compatible /chat/completions) as the tools. The house 35B daily
  driver on /gpus/r9700 is a text Qwen — do not invent an mmproj for that file.
`.replace(/\s+/g, ' ').trim();

export const VISION_STEPS: VisionStep[] = [
  {
    id: 'two-files',
    title: 'Get a matching text GGUF and mmproj',
    body:
      'The mtmd README: multimodal projector files are specific to each architecture. Do not pair a random mmproj with a random text file. ggml-org publishes ready multimodal GGUFs; their collection page is the cited shopper list. Most of those ready files ship Q4_K_M by default — that is their listing, not a house ranking. Q3 stays a labeled estimate. Q1/Q2 stay off. Start from that collection, not a retired Qwen vision family.',
    links: [
      { href: '/models', label: 'House models' },
      { href: '/quants', label: 'Quants' },
    ],
  },
  {
    id: 'linux',
    title: 'Build llama-mtmd-cli on Ubuntu',
    body:
      'Ubuntu 24.04+ is the measured AMDai OS. The Gemma 3 vision notes in llama.cpp say: cmake -B build, then cmake --build build --target llama-mtmd-cli. Vulkan llama.cpp stays first for tokens. Confirm the GPU with rocminfo before you download a pair of files. Windows is a cited second path, not measured on local-desktop.',
    links: [
      { href: '/setup', label: 'Ubuntu setup' },
      { href: '/setup/windows', label: 'Windows setup' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
  {
    id: 'cli',
    title: 'Run llama-mtmd-cli with --mmproj and --image',
    body:
      'Cited from the llama.cpp multimodal doc and Gemma 3 notes: llama-mtmd-cli -m model.gguf --mmproj mmproj.gguf --image your_image.jpg. Or llama-server -m model.gguf --mmproj mmproj.gguf. -hf can pull a supported ggml-org pair; --no-mmproj disables multimodal on that load; --mmproj local_file.gguf overrides the projector.',
    links: [
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
    ],
  },
  {
    id: 'offload',
    title: 'Know where the projector sits',
    body:
      `The multimodal doc: the projector is offloaded to GPU by default. --no-mmproj-offload keeps it off the GPU. That is a RAM / VRAM trade, not a measured local-desktop split. ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL} for any text sidecar stay on the calculator. Do not invent an mmproj VRAM megabyte.`,
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
    ],
  },
  {
    id: 'not-comfy',
    title: 'Do not confuse this with image gen',
    body:
      'Vision here is image in, text out. Local image generation — Stable Diffusion, SDXL, Flux-class — is ComfyUI on HIP/ROCm PyTorch at /image-gen. That path does not speak llama-server /v1. llama.cpp stays first for LLMs and for this mmproj job.',
    links: [
      { href: '/image-gen', label: 'Image gen' },
      { href: '/harnesses/image', label: 'ComfyUI harness' },
    ],
  },
];

export const VISION_FIT_ROWS: VisionFitRow[] = [
  {
    id: '16gb',
    vramClass: '8–16 GB class',
    cards: [
      { href: '/gpus/rx-9070-xt', label: 'RX 9070 XT' },
      { href: '/gpus/rx-9070', label: 'RX 9070' },
      { href: '/gpus/rx-9070-gre', label: 'RX 9070 GRE' },
      { href: '/gpus/rx-9060-xt', label: 'RX 9060 XT' },
      { href: '/gpus/rx-7600-xt', label: 'RX 7600 XT' },
      { href: '/gpus/rx-7600', label: 'RX 7600' },
      { href: '/gpus/rx-6800-xt', label: 'RX 6800 XT' },
      { href: '/gpus/rx-6950-xt', label: 'RX 6950 XT / 6900 XT' },
      { href: '/gpus/rx-6700-xt', label: 'RX 6700 XT' },
    ],
    fit: 'Labeled estimate: start from a ggml-org Q4_K_M pair if that listing fits. Q3 is a labeled estimate. Confirm both GGUFs. Speed not yet measured by AMDai.',
    speed: VISION_SPEED_LABEL,
  },
  {
    id: '20-24gb',
    vramClass: '20–24 GB class',
    cards: [
      { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX' },
      { href: '/gpus/rx-7900-xt', label: 'RX 7900 XT' },
      { href: '/gpus/rx-7900-gre', label: 'RX 7900 GRE' },
      { href: '/gpus/rx-7800-xt', label: 'RX 7800 XT' },
      { href: '/gpus/rx-7700-xt', label: 'RX 7700 XT' },
    ],
    fit: 'Labeled estimate: more room for a larger text GGUF plus mmproj. Still two files. Q3 stays a labeled estimate. Speed not yet measured by AMDai.',
    speed: VISION_SPEED_LABEL,
  },
  {
    id: '32gb',
    vramClass: '32 GB R9700',
    cards: [{ href: '/gpus/r9700', label: 'R9700' }],
    fit: 'The measured house card is a text 35B. Vision is a separate cited pair — do not invent an mmproj for UD-Q5_K_XL. Speed not yet measured by AMDai.',
    speed: VISION_SPEED_LABEL,
  },
  {
    id: 'apu',
    vramClass: 'Strix Halo / shared memory',
    cards: [{ href: '/gpus/strix-halo', label: 'Strix Halo' }],
    fit: 'Labeled estimate on shared system memory. Size both GGUFs on the calculator. Speed not yet measured by AMDai.',
    speed: VISION_SPEED_LABEL,
  },
];

export const VISION_FAQ: VisionFaq[] = [
  {
    id: 'what-is-mmproj',
    question: 'What is an mmproj file?',
    answer:
      'The multimodal projector. llama.cpp encodes the image into embeddings with that GGUF, then the text model reads them. The mtmd README: you typically need the text GGUF and a matching mmproj. Pairing is architecture-specific.',
    links: [
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/glossary', label: 'Glossary' },
    ],
  },
  {
    id: 'which-model',
    question: 'Which vision model should I start with?',
    answer:
      'Cite the ggml-org multimodal GGUF collection and the llama.cpp multimodal doc. Their ready examples include Gemma 3 4B / 12B / 27B via -hf (the 1B variant has no vision). Most ready files list Q4_K_M. Q3 is a labeled estimate. Start from that collection, not a retired Qwen family. We have no local-desktop vision tok/s.',
    links: [
      { href: '/models', label: 'House models' },
      { href: '/wanted', label: 'Wanted' },
    ],
  },
  {
    id: 'qwen36-vision',
    question: 'Can I add vision to the house 35B daily driver?',
    answer:
      'Not as a file we publish. The R9700 daily driver is Qwen3.6-35B-A3B UD-Q5_K_XL, a text GGUF. We do not invent an mmproj for that card. Use a cited multimodal pair instead.',
    links: [
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/models/qwen36', label: '35B house model' },
    ],
  },
];

export const VISION_SECTIONS = [
  { id: 'what-it-is', label: 'What it is' },
  { id: 'linux', label: 'Linux path' },
  { id: 'fit', label: 'GPU-class fit' },
  { id: 'faq', label: 'FAQ' },
  { id: 'sources', label: 'Sources' },
] as const;

export const VISION_HUB_LINKS: VisionLink[] = [
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/image-gen', label: 'Image gen' },
  { href: '/setup', label: 'Ubuntu setup' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/wanted', label: 'Wanted' },
  { href: '/faq', label: 'FAQ' },
];

export const REQUIRED_VISION_HREFS = [
  '/setup',
  '/setup/windows',
  '/backends/llamacpp',
  '/image-gen',
  '/gpus/r9700',
  '/gpus/strix-halo',
  '/gpus/rx-7900-xtx',
  '/gpus/rx-7900-xt',
  '/gpus/rx-7800-xt',
  '/gpus/rx-9070-xt',
  '/gpus/rx-9070',
  '/gpus/rx-9070-gre',
  '/gpus/rx-9060-xt',
  '/gpus/rx-7900-gre',
  '/gpus/rx-7700-xt',
  '/gpus/rx-7600-xt',
  '/gpus/rx-7600',
  '/gpus/rx-6800-xt',
  '/gpus/rx-6950-xt',
  '/gpus/rx-6700-xt',
  '/calculator',
  '/models',
  '/models/qwen36',
  '/quants',
  '/wanted',
  '/troubleshoot',
  '/flash-ram-offload',
] as const;

export const VISION_HOWTO_STEPS = VISION_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export function visionBlob(): string {
  return [
    VISION_TITLE,
    VISION_DESCRIPTION,
    VISION_LEAD,
    VISION_CITED_LABEL,
    VISION_SPEED_LABEL,
    VISION_WHAT,
    ...VISION_STEPS.map((row) => `${row.title} ${row.body}`),
    ...VISION_FIT_ROWS.map((row) => `${row.vramClass} ${row.fit} ${row.speed}`),
    ...VISION_FAQ.map((row) => `${row.question} ${row.answer}`),
  ].join('\n');
}

export function visionHrefs(): string[] {
  const links: VisionLink[] = [
    ...VISION_HUB_LINKS,
    ...VISION_STEPS.flatMap((step) => step.links),
    ...VISION_FIT_ROWS.flatMap((row) => row.cards),
    ...VISION_FAQ.flatMap((row) => row.links),
    ...VISION_SOURCES.map((source) => ({ href: source.href, label: source.title })),
    ...CONSUMER_NAV_LINKS,
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertVisionValid(): string[] {
  const errors: string[] = [];
  const blob = visionBlob();
  const hrefs = new Set(visionHrefs());
  if (VISION_CITED_LABEL !== 'Cited, not measured on local-desktop') errors.push('cited label drifted');
  if (VISION_SPEED_LABEL !== 'not yet measured by AMDai') errors.push('speed label drifted');
  if (!/llama\.cpp/i.test(blob)) errors.push('must keep llama.cpp first');
  if (!/--mmproj/.test(blob)) errors.push('must cite --mmproj');
  if (!/llama-mtmd-cli/.test(blob)) errors.push('must cite llama-mtmd-cli');
  if (!/llama-server/.test(blob)) errors.push('must cite llama-server');
  if (!/--no-mmproj-offload/.test(blob)) errors.push('must cite --no-mmproj-offload');
  if (!/two GGUF/.test(blob)) errors.push('must say two GGUF files');
  if (!/labeled estimate/.test(blob)) errors.push('Q3 must stay a labeled estimate');
  if (!/retired Qwen/.test(blob)) errors.push('must refuse retired Qwen vision families');
  if (BANNED.test(blob)) {
    errors.push('banned model recommended');
  }
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (/\b\d+(?:\.\d+)?\s*tok\/s\b/i.test(blob)) errors.push('invented tok/s');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('RAM lines missing');
  if (VISION_FIT_ROWS.some((row) => row.speed !== VISION_SPEED_LABEL)) {
    errors.push('every fit row must use the unmeasured speed label');
  }
  if (VISION_FIT_ROWS.some((row) => !/estimate|do not invent/i.test(row.fit))) {
    errors.push('every fit row must stay estimate or refuse invention');
  }
  for (const source of VISION_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_VISION_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return [...new Set(errors)];
}
