/**
 * Cited consumer guide for local RAG / document Q&A on Radeon.
 * llama.cpp embeddings first. llama.cpp stays first for the chat sidecar.
 * No invented tok/s, retrieval scores, or prices. File sizes cite official cards.
 */

import { CONSUMER_NAV_LINKS } from './consumer-gpu';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';

export const RAG_PUBLISHED = '2026-10-13';
export const RAG_CITED_LABEL = 'Cited, not measured on local-desktop';
export const RAG_SPEED_LABEL = 'not yet measured by AMDai';
export const RAG_EMPTY = 'not measured yet';

export type RagLink = { href: string; label: string };

export type RagSource = {
  id: string;
  title: string;
  href: string;
};

export type RagModel = {
  id: string;
  name: string;
  size: string;
  note: string;
  href: string;
  kind: 'cited' | 'estimate';
};

export type RagFitRow = {
  id: string;
  vramClass: string;
  cards: RagLink[];
  fit: string;
  speed: string;
};

export type RagStep = {
  id: string;
  title: string;
  body: string;
  links: RagLink[];
};

export type RagError = {
  id: string;
  title: string;
  body: string;
  links: RagLink[];
};

export const RAG_TITLE = 'Local RAG on Radeon';
export const RAG_DESCRIPTION =
  'Chat with your own PDFs and notes on Radeon. llama.cpp embeddings first. Linux first. Fit estimates, not measured on local-desktop.';

export const RAG_LEAD = `
  Local RAG means you chunk your files, embed the chunks, retrieve the ones
  that match a question, and ask a local LLM to answer from that context —
  no hosted API. On AMDai the first embed path is llama.cpp with a dedicated
  embedding GGUF and --embeddings. The chat sidecar stays the measured
  llama.cpp Vulkan daily driver. Speeds and retrieval quality stay
  ${RAG_SPEED_LABEL}.
`.replace(/\s+/g, ' ').trim();

export const RAG_SOURCES: RagSource[] = [
  {
    id: 'llamacpp-server',
    title: 'llama.cpp server README (--embeddings, /v1/embeddings)',
    href: 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md',
  },
  {
    id: 'nomic-gguf',
    title: 'nomic-embed-text-v1.5 GGUF (official size table)',
    href: 'https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF',
  },
  {
    id: 'nomic-card',
    title: 'nomic-embed-text-v1.5 model card (task prefixes)',
    href: 'https://huggingface.co/nomic-ai/nomic-embed-text-v1.5',
  },
  {
    id: 'bge-small',
    title: 'BAAI/bge-small-en-v1.5 model card (33.4M params)',
    href: 'https://huggingface.co/BAAI/bge-small-en-v1.5',
  },
  {
    id: 'bge-base',
    title: 'BAAI/bge-base-en-v1.5 model card (0.1B params)',
    href: 'https://huggingface.co/BAAI/bge-base-en-v1.5',
  },
];

export const RAG_MODELS: RagModel[] = [
  {
    id: 'nomic-q4',
    name: 'nomic-embed-text-v1.5 Q4_K_M',
    size: '81 MiB',
    note: 'Official nomic-embed-text-v1.5 GGUF table. Small cited Q4+ file.',
    href: 'https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF',
    kind: 'cited',
  },
  {
    id: 'nomic-q5',
    name: 'nomic-embed-text-v1.5 Q5_K_M',
    size: '95 MiB',
    note: 'Official nomic-embed-text-v1.5 GGUF table.',
    href: 'https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF',
    kind: 'cited',
  },
  {
    id: 'nomic-q8',
    name: 'nomic-embed-text-v1.5 Q8_0',
    size: '140 MiB',
    note: 'Official nomic-embed-text-v1.5 GGUF table. House default when the file still fits.',
    href: 'https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF',
    kind: 'cited',
  },
  {
    id: 'nomic-f16',
    name: 'nomic-embed-text-v1.5 F16',
    size: '262 MiB',
    note: 'Official nomic-embed-text-v1.5 GGUF table. Largest listed nomic file we cite.',
    href: 'https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF',
    kind: 'cited',
  },
  {
    id: 'nomic-q3',
    name: 'nomic-embed-text-v1.5 Q3_K_M',
    size: '65 MiB',
    note: 'Official listing. Labeled estimate for fit talk only — not runnable advice on our rig. Nothing below Q4 runs on local-desktop.',
    href: 'https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF',
    kind: 'estimate',
  },
  {
    id: 'bge-small',
    name: 'bge-small-en-v1.5',
    size: '33.4M params',
    note: 'Official BAAI model card. GGUF disk size is not copied here — we do not invent a file listing.',
    href: 'https://huggingface.co/BAAI/bge-small-en-v1.5',
    kind: 'cited',
  },
  {
    id: 'bge-base',
    name: 'bge-base-en-v1.5',
    size: '0.1B params',
    note: 'Official BAAI model card. Medium-class embed. GGUF disk size is not copied here.',
    href: 'https://huggingface.co/BAAI/bge-base-en-v1.5',
    kind: 'cited',
  },
];

export const RAG_FIT_ROWS: RagFitRow[] = [
  {
    id: '32gb',
    vramClass: '32 GB discrete',
    cards: [{ href: '/gpus/r9700', label: 'Radeon AI PRO R9700' }],
    fit: 'Estimate for the pair. The measured house 35B daily driver already sits on one R9700. Official nomic F16 is 262 MiB — the embed file is not the limiter. We have not measured embed-plus-LLM VRAM on local-desktop. Size the chat sidecar on the calculator.',
    speed: RAG_SPEED_LABEL,
  },
  {
    id: '16gb',
    vramClass: '16 GB discrete',
    cards: [
      { href: '/gpus/rx-9070-xt', label: 'RX 9070 XT' },
      { href: '/gpus/rx-9060-xt', label: 'RX 9060 XT' },
      { href: '/gpus/rx-7900-gre', label: 'RX 7900 GRE' },
      { href: '/gpus/rx7800xt', label: 'RX 7800 XT' },
      { href: '/gpus/rx-7600-xt', label: 'RX 7600 XT' },
      { href: '/gpus/rx-6800-xt', label: 'RX 6800 XT' },
    ],
    fit: 'Estimate. Official nomic Q8_0 is 140 MiB. A house 35B Q4–Q6 file does not sit in 16 GB on the calculator at long context — the LLM sidecar is the fit question, not the embed GGUF. Q3 chat sidecar is a labeled estimate, not runnable advice.',
    speed: RAG_SPEED_LABEL,
  },
  {
    id: '12gb',
    vramClass: '12 GB discrete',
    cards: [{ href: '/gpus/rx-7700-xt', label: 'RX 7700 XT' }],
    fit: 'Estimate. Official nomic Q4_K_M is 81 MiB. Do not stack a house 35B Q4–Q6 file on the same 12 GB sticker without the calculator. Prefer a smaller Q4+ chat sidecar, or keep the LLM on DDR5 offload and read the RAM lines.',
    speed: RAG_SPEED_LABEL,
  },
  {
    id: '8gb',
    vramClass: '8 GB discrete',
    cards: [{ href: '/gpus/rx-7600', label: 'RX 7600' }],
    fit: 'Estimate. Official nomic Q4_K_M is 81 MiB — under 8 GB on paper. The chat sidecar will not be a house 35B Q4–Q6 in VRAM. Size a smaller Q4+ LLM, or offload. This is not the 16 GB RX 7600 XT.',
    speed: RAG_SPEED_LABEL,
  },
];

export const RAG_LINUX_STEPS: RagStep[] = [
  {
    id: 'os',
    title: 'Ubuntu 24.04+ first',
    body:
      'Bare-metal Ubuntu 24.04+ is the AMDai measured path for the daily-driver LLM. RAG follows that OS even though we have no first-party retrieval card. See the GPU in rocminfo before you pick a HIP gfx pin. Windows is a cited second path, not the first try.',
    links: [
      { href: '/setup', label: 'First-run setup' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/gpus', label: 'GPU directory' },
    ],
  },
  {
    id: 'embed-server',
    title: 'Serve a dedicated embedding GGUF with llama.cpp',
    body:
      'The llama.cpp server README documents --embeddings (also --embedding): restrict the process to embedding use, and use it only with a dedicated embedding model. The OpenAI-shaped route is POST /v1/embeddings. That is a second llama-server, not the chat /v1 on :8080. Vulkan is the consumer default, same as the daily driver. Pick a listed nomic-embed-text-v1.5 GGUF (Q8_0 is 140 MiB on the official table). The nomic card requires a task prefix such as search_query: on questions.',
    links: [
      { href: 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md', label: 'llama.cpp server README' },
      { href: 'https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF', label: 'nomic-embed GGUF' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
  {
    id: 'index-folder',
    title: 'Index a folder of docs',
    body:
      'Chunk the files, POST each chunk to /v1/embeddings, store the vectors next to the text. That loop is the index. We do not rank a vector store or a Python library — pick one you already run, or use a harness that already does docs-plus-chat. Keep the index on fast local disk. A huge corpus on a slow USB stick will stall before VRAM does. Retrieval quality stays not yet measured by AMDai.',
    links: [
      { href: '/harnesses/anythingllm', label: 'AnythingLLM harness' },
      { href: '/harnesses/open-webui', label: 'Open WebUI harness' },
      { href: '/harnesses', label: 'Harnesses' },
    ],
  },
  {
    id: 'ask',
    title: 'Ask a question against the daily-driver LLM',
    body:
      'Embed the question the same way you embedded the chunks. Retrieve the nearest chunks. Send those chunks plus the question to the measured llama.cpp Vulkan chat server — house daily driver is Qwen3.6-35B-A3B, -c 262144, f16 KV. Size -c for the retrieved window; a stuffed prompt can OOM the same way a long chat does. Do not invent a recall score. The long-context gate means the stated window ran, not that the model found a fact in the middle.',
    links: [
      { href: '/models/qwen36', label: '35B model page' },
      { href: '/long-context', label: 'Long context' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'hip',
    title: 'HIP only when rocminfo lists the gfx',
    body:
      'ROCm/HIP is the second llama.cpp compile when you need it. Pin -DAMDGPU_TARGETS to the string rocminfo prints. Do not mix a gfx110x pin onto a gfx1201 card. Vulkan stays the consumer default for both the embed server and the chat sidecar.',
    links: [
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/troubleshoot#wrong-gfx', label: 'Wrong gfx' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
    ],
  },
];

export const RAG_WINDOWS_STEPS: RagStep[] = [
  {
    id: 'windows-official',
    title: 'Windows follows /setup/windows',
    body:
      'llama.cpp Vulkan is the honest Windows path AMDai already documents for tokens. The same Vulkan build can serve --embeddings. HIP/ROCm userspace stays a Linux product. Cited, not measured on local-desktop. Ubuntu 24.04+ on bare metal remains the measured default. We do not invent a Windows retrieval score.',
    links: [
      { href: '/setup/windows', label: 'Windows setup' },
      { href: '/setup', label: 'Ubuntu setup' },
      { href: '/rocm-problems/windows-wsl-preview', label: 'Windows / WSL2 preview' },
    ],
  },
];

export const RAG_ERRORS: RagError[] = [
  {
    id: 'oom-embed',
    title: 'OOM while embedding or next to the chat sidecar',
    body:
      'Official nomic F16 is 262 MiB. That can still starve a card that already holds a 35B GGUF if you load both into the same VRAM pool. Size the LLM on the calculator first. Run the embed server as its own process. A second card is a /multi-gpu question — we have not measured RAG-plus-LLM on local-desktop.',
    links: [
      { href: '/troubleshoot#oom-context', label: 'OOM at long context' },
      { href: '/troubleshoot#mmap-ram', label: 'System RAM too small' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
    ],
  },
  {
    id: 'slow-disk',
    title: 'Huge corpus on a slow disk',
    body:
      'The index is files plus vectors. A large folder on a spinning drive or a USB stick stalls before the GPU does. Keep the corpus and the vector store on fast local NVMe. We do not invent an embeddings-per-second number for a slow disk.',
    links: [
      { href: '/troubleshoot#slow', label: 'Slow' },
      { href: '/hardware', label: 'Hardware' },
    ],
  },
  {
    id: 'wrong-window',
    title: 'Wrong context window on the chat sidecar',
    body:
      'Retrieved chunks plus the question consume the same -c budget as a long chat. If you stuff more tokens than the server window, you OOM or the model drops the start. Size -c on the calculator. House daily driver is 262144. Read Long context before you paste a whole book into one prompt.',
    links: [
      { href: '/troubleshoot#oom-context', label: 'OOM at long context' },
      { href: '/long-context', label: 'Long context' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
];

export const RAG_FAQ = [
  {
    id: 'what-is-rag',
    question: 'What is local RAG on a Radeon?',
    answer:
      'Chunk your files, embed the chunks with a dedicated llama.cpp embedding GGUF, retrieve the nearest ones, and ask the local LLM to answer from that context. The embed server uses --embeddings and /v1/embeddings. The chat sidecar stays llama.cpp Vulkan. Speeds and retrieval quality are not yet measured by AMDai.',
    links: [
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
  {
    id: 'which-embed',
    question: 'Which embedding file should I start with?',
    answer:
      'Cite the nomic-embed-text-v1.5 GGUF table: Q8_0 is 140 MiB, F16 is 262 MiB, Q4_K_M is 81 MiB. Prefer Q8_0 when it fits. Q3_K_M (65 MiB) is a labeled estimate, not runnable advice. BGE small is 33.4M params and BGE base is 0.1B params on the official cards — we do not invent those GGUF disk sizes. Q1 and Q2 stay off.',
    links: [
      { href: 'https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF', label: 'nomic-embed GGUF' },
      { href: '/quants', label: 'Quants' },
    ],
  },
  {
    id: 'stack-lab',
    question: 'Is there an Open in Stack Lab recipe for RAG?',
    answer:
      'No. There is no house Stack Lab recipe id for local RAG. Do not invent one. The gap is listed on /wanted. Use /stack-lab for the measured daily-driver and Flash recipes only.',
    links: [
      { href: '/stack-lab', label: 'Stack Lab' },
      { href: '/wanted', label: 'Wanted' },
    ],
  },
];

export const RAG_SECTIONS = [
  { id: 'what-it-is', label: 'What it is' },
  { id: 'models', label: 'Cited embed files' },
  { id: 'fit', label: 'VRAM fit' },
  { id: 'linux', label: 'Linux path' },
  { id: 'windows', label: 'Windows' },
  { id: 'alongside', label: 'Next to the LLM' },
  { id: 'errors', label: 'When it breaks' },
  { id: 'faq', label: 'FAQ' },
  { id: 'sources', label: 'Sources' },
] as const;

export const RAG_HUB: RagLink[] = [
  { href: '/setup', label: 'Ubuntu setup' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/harnesses', label: 'Harnesses' },
  { href: '/speech', label: 'Speech' },
  { href: '/image-gen', label: 'Image gen' },
  { href: '/long-context', label: 'Long context' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/stack-lab', label: 'Stack Lab' },
];

export const REQUIRED_RAG_HREFS = [
  '/setup',
  '/setup/windows',
  '/gpus/r9700',
  '/gpus/rx7900xtx',
  '/gpus/rx-7700-xt',
  '/gpus/rx-7600',
  '/multi-gpu',
  '/calculator',
  '/troubleshoot#oom-context',
  '/stack-lab',
  '/wanted',
  '/backends/llamacpp',
  '/harnesses',
  '/harnesses/anythingllm',
  '/harnesses/open-webui',
  '/speech',
  '/image-gen',
  '/long-context',
  '/models/qwen36',
  '/quants',
] as const;

export const RAG_HOWTO_STEPS = [...RAG_LINUX_STEPS, ...RAG_WINDOWS_STEPS].map((step) => ({
  name: step.title,
  text: step.body,
}));

export const RAG_ALONGSIDE = `
  RAG sits beside the measured llama.cpp Vulkan daily driver, not instead of
  it. The embed server is a second process (--embeddings). Speech and image
  gen are different jobs: whisper.cpp / Piper, and ComfyUI HIP/ROCm PyTorch.
  Harnesses that already say docs-plus-chat on this site are AnythingLLM and
  Open WebUI — that is a catalog note, not a ranking. There is no house
  Stack Lab recipe for RAG. ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL} stay the
  shopper RAM lines when the chat sidecar offloads. A 64 GB kit estimate is
  the consumer shopper default — labeled estimate, not a measured RAG peak.
  We have not measured embed-plus-LLM on local-desktop.
`.replace(/\s+/g, ' ').trim();

export const RAG_WHAT = `
  Chunk, embed, retrieve, answer. The embedding model is a small GGUF.
  Context is the retrieved window plus the question. LLM weights are the
  chat sidecar — that is where VRAM and system RAM move. Official nomic
  F16 is 262 MiB; official UD-Q5_K_XL 35B on one R9700 is the measured
  daily driver. Adding those two on one card is an estimate until a
  first-party card lands. Empty cells stay ${RAG_EMPTY}.
`.replace(/\s+/g, ' ').trim();

export function ragBlob(): string {
  return [
    RAG_TITLE,
    RAG_DESCRIPTION,
    RAG_LEAD,
    RAG_CITED_LABEL,
    RAG_SPEED_LABEL,
    RAG_ALONGSIDE,
    RAG_WHAT,
    ...RAG_MODELS.map((row) => `${row.name} ${row.size} ${row.note}`),
    ...RAG_FIT_ROWS.map((row) => `${row.vramClass} ${row.fit} ${row.speed}`),
    ...RAG_LINUX_STEPS.map((row) => `${row.title} ${row.body}`),
    ...RAG_WINDOWS_STEPS.map((row) => `${row.title} ${row.body}`),
    ...RAG_ERRORS.map((row) => `${row.title} ${row.body}`),
    ...RAG_FAQ.map((row) => `${row.question} ${row.answer}`),
  ].join('\n');
}

export function ragHrefs(): string[] {
  const links: RagLink[] = [
    ...RAG_HUB,
    ...RAG_FIT_ROWS.flatMap((row) => row.cards),
    ...RAG_LINUX_STEPS.flatMap((step) => step.links),
    ...RAG_WINDOWS_STEPS.flatMap((step) => step.links),
    ...RAG_ERRORS.flatMap((row) => row.links),
    ...RAG_FAQ.flatMap((row) => row.links ?? []),
    ...RAG_SOURCES.map((source) => ({ href: source.href, label: source.title })),
    ...CONSUMER_NAV_LINKS,
  ];
  return [...new Set(links.map((link) => link.href))];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertRagValid(): string[] {
  const errors: string[] = [];
  const blob = ragBlob();
  const hrefs = ragHrefs();
  if (RAG_CITED_LABEL !== 'Cited, not measured on local-desktop') errors.push('cited label drifted');
  if (RAG_SPEED_LABEL !== 'not yet measured by AMDai') errors.push('speed label drifted');
  if (RAG_EMPTY !== 'not measured yet') errors.push('empty-cell label drifted');
  if (!blob.includes(RAG_SPEED_LABEL)) errors.push('must say not yet measured by AMDai');
  if (!/llama\.cpp/i.test(blob)) errors.push('must keep llama.cpp first');
  if (!/--embeddings/.test(blob)) errors.push('must cite --embeddings');
  if (!/\/v1\/embeddings/.test(blob)) errors.push('must cite /v1/embeddings');
  if (!/140 MiB/.test(blob) || !/262 MiB/.test(blob)) errors.push('must cite official nomic sizes');
  if (!/33\.4M/.test(blob) || !/0\.1B/.test(blob)) errors.push('must cite official BGE param counts');
  if (!/Q3_K_M/.test(blob) || !/labeled estimate/.test(blob)) errors.push('Q3 must stay a labeled estimate');
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (/\b\d+(?:\.\d+)?\s*tok\/s\b/i.test(blob)) errors.push('invented tok/s');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) errors.push('RAM lines missing');
  if (!/No house Stack Lab recipe/.test(blob) && !/no house Stack Lab recipe/i.test(blob)) {
    errors.push('must refuse an invented Stack Lab recipe');
  }
  if (RAG_FIT_ROWS.some((row) => row.speed !== RAG_SPEED_LABEL || !/estimate/i.test(row.fit))) {
    errors.push('every fit row must be a labeled estimate with the unmeasured speed label');
  }
  if (!RAG_FIT_ROWS.some((row) => row.id === '8gb') || !RAG_FIT_ROWS.some((row) => row.id === '32gb')) {
    errors.push('fit table must cover 8 GB and 32 GB');
  }
  const q3 = RAG_MODELS.find((row) => row.id === 'nomic-q3');
  if (!q3 || q3.kind !== 'estimate') errors.push('nomic Q3 must stay a labeled estimate');
  for (const required of REQUIRED_RAG_HREFS) {
    if (!hrefs.some((href) => href === required || href.startsWith(`${required}`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return [...new Set(errors)];
}
