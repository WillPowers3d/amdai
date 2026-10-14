/**
 * Cited consumer guide for local speech on Radeon.
 * whisper.cpp Vulkan first (STT). Piper TTS. llama.cpp stays first for LLMs.
 * No invented tok/s, RTF, or prices. Memory cells cite the whisper.cpp README table.
 */

import { CONSUMER_NAV_LINKS } from './consumer-gpu';
import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';

export const SPEECH_PUBLISHED = '2026-10-13';
export const SPEECH_CITED_LABEL = 'Cited, not measured on local-desktop';
export const SPEECH_SPEED_LABEL = 'not yet measured by AMDai';

export type SpeechLink = { href: string; label: string };

export type SpeechSource = {
  id: string;
  title: string;
  href: string;
};

export type SpeechModel = {
  id: string;
  name: string;
  disk: string;
  mem: string;
  note: string;
};

export type SpeechFitRow = {
  id: string;
  vramClass: string;
  cards: SpeechLink[];
  fit: string;
  speed: string;
};

export type SpeechStep = {
  id: string;
  title: string;
  body: string;
  links: SpeechLink[];
};

export type SpeechError = {
  id: string;
  title: string;
  body: string;
  links: SpeechLink[];
};

export const SPEECH_TITLE = 'Local speech on Radeon';
export const SPEECH_DESCRIPTION =
  'Cited whisper.cpp Vulkan STT plus Piper TTS on Radeon. Linux first. Memory from the official table. Speeds not yet measured by AMDai.';

export const SPEECH_LEAD = `
  Local speech means a file on your box turns audio into text, or text into
  audio, without a hosted API. On AMDai the first STT engine is whisper.cpp
  with Vulkan — the same ggml family as llama.cpp, not a chat /v1. Piper is
  the first TTS engine (pip install piper-tts). llama.cpp stays first for
  local LLMs. Speeds stay ${SPEECH_SPEED_LABEL}.
`.replace(/\s+/g, ' ').trim();

export const SPEECH_SOURCES: SpeechSource[] = [
  {
    id: 'whisper-readme',
    title: 'whisper.cpp README (Memory usage, Vulkan, HIP)',
    href: 'https://github.com/ggml-org/whisper.cpp',
  },
  {
    id: 'piper',
    title: 'Piper TTS (OHF-Voice/piper1-gpl)',
    href: 'https://github.com/OHF-Voice/piper1-gpl',
  },
  {
    id: 'piper-cli',
    title: 'Piper command-line interface',
    href: 'https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/CLI.md',
  },
  {
    id: 'rocm',
    title: 'AMD ROCm documentation',
    href: 'https://rocm.docs.amd.com/en/latest/',
  },
];

export const SPEECH_MODELS: SpeechModel[] = [
  {
    id: 'tiny',
    name: 'tiny',
    disk: '75 MiB',
    mem: '~273 MB',
    note: 'Official whisper.cpp README Memory usage table. Smallest listed file.',
  },
  {
    id: 'base',
    name: 'base',
    disk: '142 MiB',
    mem: '~388 MB',
    note: 'Official whisper.cpp README Memory usage table.',
  },
  {
    id: 'small',
    name: 'small',
    disk: '466 MiB',
    mem: '~852 MB',
    note: 'Official whisper.cpp README Memory usage table.',
  },
  {
    id: 'medium',
    name: 'medium',
    disk: '1.5 GiB',
    mem: '~2.1 GB',
    note: 'Official whisper.cpp README Memory usage table.',
  },
  {
    id: 'large',
    name: 'large',
    disk: '2.9 GiB',
    mem: '~3.9 GB',
    note: 'Official whisper.cpp README Memory usage table. Largest listed file.',
  },
];

export const SPEECH_FIT_ROWS: SpeechFitRow[] = [
  {
    id: '32gb',
    vramClass: '32 GB discrete',
    cards: [{ href: '/gpus/r9700', label: 'Radeon AI PRO R9700' }],
    fit: 'Estimate. The official large row is ~3.9 GB mem — well under a 32 GB sticker. Runtime and quality stay unmeasured here.',
    speed: SPEECH_SPEED_LABEL,
  },
  {
    id: '24gb',
    vramClass: '24 GB discrete',
    cards: [{ href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX' }],
    fit: 'Estimate. Official table rows through large (~3.9 GB mem) sit under 24 GB. Confirm the sticker. Speed stays unmeasured.',
    speed: SPEECH_SPEED_LABEL,
  },
  {
    id: '20gb',
    vramClass: '20 GB discrete',
    cards: [{ href: '/gpus/rx-7900-xt', label: 'RX 7900 XT' }],
    fit: 'Estimate. Official table through large is still under 20 GB. Confirm the sticker before you assume headroom next to a local LLM.',
    speed: SPEECH_SPEED_LABEL,
  },
  {
    id: '16gb',
    vramClass: '16 GB discrete',
    cards: [
      { href: '/gpus/rx-9070-xt', label: 'RX 9070 XT' },
      { href: '/gpus/rx-9070', label: 'RX 9070' },
      { href: '/gpus/rx-9060-xt', label: 'RX 9060 XT' },
      { href: '/gpus/rx-7900-gre', label: 'RX 7900 GRE' },
      { href: '/gpus/rx-7800-xt', label: 'RX 7800 XT' },
      { href: '/gpus/rx-7600-xt', label: 'RX 7600 XT' },
      { href: '/gpus/rx-6800-xt', label: 'RX 6800 XT' },
      { href: '/gpus/rx-6950-xt', label: 'RX 6950 XT / 6900 XT' },
    ],
    fit: 'Estimate. Official table through large (~3.9 GB mem) sits under 16 GB. Sharing the card with a 35B GGUF is a calculator question, not a speech-mem claim.',
    speed: SPEECH_SPEED_LABEL,
  },
  {
    id: '12gb',
    vramClass: '12 GB discrete',
    cards: [
      { href: '/gpus/rx-7700-xt', label: 'RX 7700 XT' },
      { href: '/gpus/rx-9070-gre', label: 'RX 9070 GRE' },
      { href: '/gpus/rx-6700-xt', label: 'RX 6700 XT' },
    ],
    fit: 'Estimate. Official large ~3.9 GB mem is under 12 GB. Confirm the sticker. Do not stack a house 35B Q4–Q6 file on the same VRAM without the calculator.',
    speed: SPEECH_SPEED_LABEL,
  },
  {
    id: '8gb',
    vramClass: '8 GB discrete',
    cards: [{ href: '/gpus/rx-7600', label: 'RX 7600' }],
    fit: 'Estimate. Official large ~3.9 GB mem is under 8 GB on paper. Start smaller (tiny / base / small) if the card also holds an OS desktop. This is not the 16 GB RX 7600 XT.',
    speed: SPEECH_SPEED_LABEL,
  },
  {
    id: 'strix-halo',
    vramClass: 'Shared memory (Strix Halo)',
    cards: [{ href: '/gpus/strix-halo', label: 'Ryzen AI Max+ 395 / Radeon 8060S' }],
    fit: 'Estimate. This APU drinks from the same DIMMs the OS uses. Official whisper.cpp mem rows are small next to a 64 / 128 GB kit — still not a measured AMDai card. Size the kit on the Strix Halo sheet.',
    speed: SPEECH_SPEED_LABEL,
  },
];

export const SPEECH_LINUX_STEPS: SpeechStep[] = [
  {
    id: 'os',
    title: 'Ubuntu 24.04+ first',
    body:
      'Bare-metal Ubuntu 24.04+ is the AMDai measured path for ROCm on local-desktop. Speech follows that OS even though we have no first-party speech card. See the GPU in rocminfo before you pick a HIP gfx pin. Windows is a cited second path, not the first try.',
    links: [
      { href: '/setup', label: 'First-run setup' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/gpus', label: 'GPU directory' },
    ],
  },
  {
    id: 'whisper-vulkan',
    title: 'Build whisper.cpp with Vulkan',
    body:
      'whisper.cpp is the AMDai first STT path. The official README documents Vulkan as the cross-vendor GPU build: cmake -B build -DGGML_VULKAN=1 then cmake --build build -j --config Release. That is the same ggml Vulkan idea as llama.cpp — it is not llama-server /v1, and it is not a chat engine. Download a listed ggml model from the project. Real-time factor stays not yet measured by AMDai.',
    links: [
      { href: 'https://github.com/ggml-org/whisper.cpp', label: 'whisper.cpp repo' },
      { href: '/backends/llamacpp', label: 'llama.cpp (ggml family)' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
    ],
  },
  {
    id: 'whisper-hip',
    title: 'HIP only when rocminfo lists the gfx',
    body:
      'The same README documents AMD ROCm/HIP: cmake -B build -DGGML_HIP=1 -DAMDGPU_TARGETS="gfx1201" then cmake --build build -j --config Release. Replace gfx1201 with the string rocminfo prints. The README names gfx1100 (RX 7900 XTX), gfx1101 (RX 7800 XT), and gfx1201 (RX 9070 XT) as common examples — the house R9700 is also gfx1201. Do not mix a gfx110x pin onto a gfx1201 card. HIP is the second STT path after Vulkan.',
    links: [
      { href: 'https://github.com/ggml-org/whisper.cpp', label: 'whisper.cpp HIP notes' },
      { href: '/gpus/r9700', label: 'R9700 (gfx1201)' },
      { href: '/troubleshoot#wrong-gfx', label: 'Wrong gfx' },
    ],
  },
  {
    id: 'piper',
    title: 'Install Piper TTS from the official repo',
    body:
      'Piper is the AMDai first TTS path. The OHF-Voice/piper1-gpl README documents pip install piper-tts. Voices and the CLI live in that repo. The Python API documents use_cuda=True with onnxruntime-gpu — that is NVIDIA CUDA, not a ROCm wheel AMDai will invent. On Radeon, treat Piper as the documented CPU/ONNX install unless a cited ROCm path appears. Speeds stay not yet measured by AMDai.',
    links: [
      { href: 'https://github.com/OHF-Voice/piper1-gpl', label: 'Piper repo' },
      { href: 'https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/CLI.md', label: 'Piper CLI' },
      { href: '/wanted', label: 'Wanted (amdai-bench gap)' },
      { href: '/amdai-bench', label: 'amdai-bench' },
    ],
  },
];

export const SPEECH_WINDOWS_STEPS: SpeechStep[] = [
  {
    id: 'windows-official',
    title: 'What whisper.cpp officially documents',
    body:
      'Vulkan is the cross-vendor GPU build the whisper.cpp README documents. That is the honest Windows STT path AMDai will name — same idea as llama.cpp Vulkan on /setup/windows. HIP/ROCm userspace stays a Linux product. Cited, not measured on local-desktop. We do not invent a Windows real-time factor.',
    links: [
      { href: '/setup/windows', label: 'Windows setup' },
      { href: 'https://github.com/ggml-org/whisper.cpp', label: 'whisper.cpp README' },
      { href: '/rocm-problems/windows-wsl-preview', label: 'Windows / WSL2 preview' },
    ],
  },
  {
    id: 'windows-piper',
    title: 'Piper on Windows is the documented pip install',
    body:
      'pip install piper-tts is what the Piper README documents. Do not invent a Windows ROCm Piper pin. Ubuntu 24.04+ on bare metal is still the OS that matches local-desktop. WSL2 ROCm is a technical preview on the 10.1 notes — not a measured speech path.',
    links: [
      { href: 'https://github.com/OHF-Voice/piper1-gpl', label: 'Piper repo' },
      { href: '/setup', label: 'Ubuntu setup' },
      { href: '/setup/windows', label: 'Windows setup' },
    ],
  },
  {
    id: 'windows-unofficial',
    title: 'Unofficial Windows shortcuts',
    body:
      'Community wrappers, DirectML forks, and translation layers that whisper.cpp or Piper do not document stay unofficial. AMDai does not walk them and does not invent a Windows real-time factor. If the official README does not list the step, stop.',
    links: [
      { href: '/setup/windows', label: 'Windows setup' },
      { href: '/troubleshoot#windows', label: 'Windows symptoms' },
    ],
  },
];

export const SPEECH_ERRORS: SpeechError[] = [
  {
    id: 'vulkan-missing',
    title: 'Vulkan not found',
    body:
      'whisper.cpp Vulkan needs a working Vulkan ICD. If the binary never sees the GPU, you are on CPU. This is the same class of miss as llama.cpp Vulkan — not a ComfyUI HIP/ROCm PyTorch miss. Check the driver and vulkaninfo before you rebuild.',
    links: [
      { href: '/troubleshoot#cpu-fallback', label: 'CPU fallback' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/troubleshoot', label: 'Troubleshoot' },
    ],
  },
  {
    id: 'hip-no-binary',
    title: 'HIP no binary for GPU',
    body:
      'A HIP build that omits the current gfx fails the same way llama.cpp HIP does. The whisper.cpp README says replace gfx1201 with rocminfo | grep gfx. HSA_OVERRIDE_GFX_VERSION is unofficial. Current gfx1201 cards should not need it on a matching build.',
    links: [
      { href: '/troubleshoot#wrong-gfx', label: 'Wrong gfx' },
      { href: '/troubleshoot/errors#no-binary-for-gpu', label: 'No binary for GPU' },
      { href: '/rocm-problems/hip-no-binary-for-gpu', label: 'HIP no binary' },
    ],
  },
  {
    id: 'oom',
    title: 'Out of memory next to a local LLM',
    body:
      'Official whisper.cpp large mem is ~3.9 GB. That can still starve a card that already holds a 35B GGUF. Size the LLM on the calculator first. Do not invent a split. A second card is a /multi-gpu question.',
    links: [
      { href: '/troubleshoot#oom-context', label: 'OOM / context' },
      { href: '/multi-gpu', label: 'Dual / multi-GPU' },
      { href: '/calculator', label: 'Calculator' },
    ],
  },
];

export const SPEECH_SECTIONS = [
  { id: 'what-it-is', label: 'What it is' },
  { id: 'models', label: 'Cited memory table' },
  { id: 'fit', label: 'GPU-class fit' },
  { id: 'linux', label: 'Linux path' },
  { id: 'windows', label: 'Windows path' },
  { id: 'alongside', label: 'Alongside a local LLM' },
  { id: 'errors', label: 'When it breaks' },
  { id: 'sources', label: 'Sources' },
] as const;

export const SPEECH_HUB_LINKS: SpeechLink[] = [
  { href: '/setup', label: 'Ubuntu setup' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/image-gen', label: 'Image gen' },
  { href: '/multi-gpu', label: 'Dual / multi-GPU' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/stack-lab', label: 'Stack Lab' },
  { href: '/faq', label: 'FAQ' },
];

export const REQUIRED_SPEECH_HREFS = [
  '/setup',
  '/setup/windows',
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
  '/multi-gpu',
  '/calculator',
  '/troubleshoot',
  '/troubleshoot/errors',
  '/stack-lab',
  '/wanted',
  '/amdai-bench',
  '/faq',
  '/image-gen',
  '/backends/llamacpp',
] as const;

export const SPEECH_HOWTO_STEPS = [
  ...SPEECH_LINUX_STEPS,
  ...SPEECH_WINDOWS_STEPS,
].map((step) => ({
  name: step.title,
  text: step.body,
}));

export const SPEECH_ALONGSIDE = `
  A local LLM on llama.cpp Vulkan and whisper.cpp Vulkan can share a box.
  They do not share a /v1. On one card, VRAM is one pool — do not invent a
  split. Size the LLM in the calculator; whisper.cpp memory stays the official
  README table. ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL} are the shopper RAM
  lines for the LLM. A 64 GB kit estimate is the consumer shopper default
  (8 GB OS/desktop plus 16 GB headroom plus whatever the LLM offload needs)
  — labeled estimate, not a measured speech peak. Piper is a separate
  CPU/ONNX process unless a cited ROCm path appears. On a second card, read
  /multi-gpu. Stack Lab’s Speech (STT + TTS) workload is the companion —
  Lab Notes hands off with amdai-stack-lab:speech, not a house 35B recipe id.
  We have not measured speech-plus-LLM on local-desktop.
`.replace(/\s+/g, ' ').trim();

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function speechBlob(): string {
  return [
    SPEECH_TITLE,
    SPEECH_DESCRIPTION,
    SPEECH_LEAD,
    SPEECH_CITED_LABEL,
    SPEECH_SPEED_LABEL,
    SPEECH_ALONGSIDE,
    ...SPEECH_MODELS.map((row) => `${row.name} ${row.disk} ${row.mem} ${row.note}`),
    ...SPEECH_FIT_ROWS.map((row) => `${row.vramClass} ${row.fit} ${row.speed}`),
    ...SPEECH_LINUX_STEPS.map((row) => `${row.title} ${row.body}`),
    ...SPEECH_WINDOWS_STEPS.map((row) => `${row.title} ${row.body}`),
    ...SPEECH_ERRORS.map((row) => `${row.title} ${row.body}`),
  ].join('\n');
}

export function speechHrefs(): string[] {
  const links: SpeechLink[] = [
    ...SPEECH_HUB_LINKS,
    ...SPEECH_FIT_ROWS.flatMap((row) => row.cards),
    ...SPEECH_LINUX_STEPS.flatMap((step) => step.links),
    ...SPEECH_WINDOWS_STEPS.flatMap((step) => step.links),
    ...SPEECH_ERRORS.flatMap((row) => row.links),
    ...SPEECH_SOURCES.map((source) => ({ href: source.href, label: source.title })),
    ...CONSUMER_NAV_LINKS,
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

export function assertSpeechValid(): string[] {
  const errors: string[] = [];
  const blob = speechBlob();
  const hrefs = new Set(speechHrefs());
  if (SPEECH_CITED_LABEL !== 'Cited, not measured on local-desktop') errors.push('cited label drifted');
  if (SPEECH_SPEED_LABEL !== 'not yet measured by AMDai') errors.push('speed label drifted');
  if (!blob.includes(SPEECH_SPEED_LABEL)) errors.push('must say not yet measured by AMDai');
  if (!/whisper\.cpp/i.test(blob)) errors.push('must name whisper.cpp');
  if (!/Piper/i.test(blob)) errors.push('must name Piper');
  if (!/llama\.cpp/i.test(blob)) errors.push('must keep llama.cpp in view');
  if (!/GGML_VULKAN=1/.test(blob)) errors.push('must cite Vulkan cmake flag');
  if (!/GGML_HIP=1/.test(blob)) errors.push('must cite HIP cmake flag');
  if (!/pip install piper-tts/.test(blob)) errors.push('must cite Piper pip install');
  if (!/~273 MB/.test(blob) || !/~3\.9 GB/.test(blob)) errors.push('must cite official memory table ends');
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (/\b\d+(?:\.\d+)?\s*(?:tok\/s|x\s*RTF|RTF|real-time factor)\b/i.test(blob)) {
    errors.push('invented speech speed');
  }
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) {
    errors.push('RAM lines missing');
  }
  if (!/amdai-stack-lab:speech/.test(blob)) errors.push('must cite the speech Stack Lab screen');
  if (!/unofficial/i.test(blob)) errors.push('Windows unofficial path must be marked');
  if (SPEECH_FIT_ROWS.some((row) => row.speed !== SPEECH_SPEED_LABEL)) {
    errors.push('every fit row must use the unmeasured speed label');
  }
  if (SPEECH_FIT_ROWS.some((row) => !/estimate/i.test(row.fit))) {
    errors.push('every fit row must be labeled estimate');
  }
  for (const source of SPEECH_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_SPEECH_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  const fitHrefs = SPEECH_FIT_ROWS.flatMap((row) => row.cards.map((card) => card.href));
  for (const href of [
    '/gpus/r9700',
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
    '/gpus/strix-halo',
  ]) {
    if (!fitHrefs.includes(href)) errors.push(`fit table missing ${href}`);
  }
  return [...new Set(errors)];
}
