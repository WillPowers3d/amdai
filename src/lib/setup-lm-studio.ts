/**
 * Cited LM Studio first-run on Radeon.
 * Not measured on local-desktop. Official sources only: LM Studio docs / CLI,
 * AMD LM Studio playbook, llama.cpp docs.
 * Do not invent LM Studio versions, tok/s, prices, or a bundled-ROCm GPU whitelist.
 */

import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';

export const SETUP_LM_STUDIO_PUBLISHED = '2026-10-14';
export const SETUP_LM_STUDIO_CITED_LABEL = 'Cited, not measured on local-desktop';

export const SETUP_LM_STUDIO_SERVER = 'http://127.0.0.1:1234/v1';
export const SETUP_LM_STUDIO_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';
export const SETUP_LM_STUDIO_CONTEXT = 262144;
export const SETUP_LM_STUDIO_LOAD =
  `lms load <model_key> --gpu max --context-length ${SETUP_LM_STUDIO_CONTEXT}`;

export type SetupLmStudioLink = { href: string; label: string };

export type SetupLmStudioSource = {
  id: string;
  title: string;
  href: string;
};

export type SetupLmStudioTrack = {
  id: 'vulkan' | 'rocm';
  title: string;
  recommend: boolean;
  body: string;
  gpus: string;
};

export type SetupLmStudioStep = {
  id: string;
  title: string;
  body: string;
  links: SetupLmStudioLink[];
};

export type SetupLmStudioQuant = {
  quant: string;
  role: string;
  llamaCpp: string;
  note: string;
  estimate: boolean;
};

export const SETUP_LM_STUDIO_SOURCES: SetupLmStudioSource[] = [
  {
    id: 'amd-playbook',
    title: 'AMD — Running and Serving LLMs with LM Studio',
    href: 'https://developer.amd.com/playbooks/lmstudio-rocm-llms/',
  },
  {
    id: 'lmstudio-openai',
    title: 'LM Studio — OpenAI compatibility',
    href: 'https://lmstudio.ai/docs/developer/openai-compat',
  },
  {
    id: 'lmstudio-sysreq',
    title: 'LM Studio — System Requirements',
    href: 'https://lmstudio.ai/docs/app/system-requirements',
  },
  {
    id: 'lmstudio-load',
    title: 'LM Studio — lms load (GPU offload and context length)',
    href: 'https://lmstudio.ai/docs/cli/load',
  },
  {
    id: 'lmstudio-runtime',
    title: 'LM Studio — lms runtime',
    href: 'https://lmstudio.ai/docs/cli/runtime/runtime',
  },
  {
    id: 'lmstudio-download',
    title: 'LM Studio — download',
    href: 'https://lmstudio.ai/download',
  },
  {
    id: 'lmstudio-linux',
    title: 'LM Studio — Linux AppImage download',
    href: 'https://lmstudio.ai/download?os=linux',
  },
  {
    id: 'llamacpp-build',
    title: 'llama.cpp — build.md (Vulkan / HIP)',
    href: 'https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md',
  },
];

export const SETUP_LM_STUDIO_TRACKS: SetupLmStudioTrack[] = [
  {
    id: 'vulkan',
    title: 'Vulkan llama.cpp runtime — the first pick on Radeon',
    recommend: true,
    body: `
      AMD’s LM Studio playbook says the app offers Vulkan and AMD ROCm backends
      (called runtimes) for AMD users. Vulkan is the honest first runtime on this
      site — the same rule as Vulkan vs HIP. LM Studio’s system-requirements page
      does not name RDNA 2, RDNA 3, RDNA 4, or the R9700. Open Runtime Selections
      with Ctrl+Shift+R (AMD playbook) or run lms runtime ls / get / select
      (LM Studio CLI). Download the Vulkan llama.cpp engine. Do not take a CUDA
      runtime on a Radeon. Watch a GPU meter: if it stays idle, you are on CPU.
      Not measured on local-desktop.
    `.replace(/\s+/g, ' ').trim(),
    gpus:
      'RDNA 2, RDNA 3, RDNA 4, and the R9700 (gfx1201) use Vulkan first on AMDai. That is this site’s llama.cpp rule, not an LM Studio SKU table — official LM Studio docs do not publish a per-card Radeon list.',
  },
  {
    id: 'rocm',
    title: 'Bundled ROCm llama.cpp runtime — second, and only if the picker lists this gfx',
    recommend: false,
    body: `
      The same AMD playbook documents an AMD ROCm runtime next to Vulkan.
      gfx completeness of that bundled engine is what the picker shows — not a
      measured local-desktop card, and not a whitelist we invent. We do not claim the
      bundled ROCm blob lists gfx1201 / R9700, gfx110x (7900 / 7800), or gfx1030
      (official RDNA 2 row). If the ROCm runtime is missing, the card is absent,
      or the GPU meter stays idle, stay on Vulkan or move to plain llama.cpp on
      /setup. Do not invent an HSA_OVERRIDE on gfx1201. gfx1031 (RX 6700 XT)
      HSA_OVERRIDE is unofficial community note, not a recommendation — prefer
      Vulkan. Not measured on local-desktop.
    `.replace(/\s+/g, ' ').trim(),
    gpus:
      'RDNA 2 / 3 / 4 and R9700: only load the ROCm runtime if LM Studio’s picker lists this card’s gfx. Official docs do not publish that list here. Missing or idle → Vulkan, or /setup.',
  },
];

export const SETUP_LM_STUDIO_QUANTS: SetupLmStudioQuant[] = [
  {
    quant: 'Q6_K',
    role: 'Higher-quality 35B sibling',
    llamaCpp:
      'Measured on llama.cpp Vulkan on local-desktop, not inside LM Studio: Q6_K 1-GPU 4K decode 103.23 tok/s (23:55 card). 32K and up is partly on DDR5 — that row says so.',
    note: `Fit VRAM and both RAM lines (${RAM_MIN_LABEL}, ${RAM_FULL_LABEL}) before you download. Not an LM Studio tok/s.`,
    estimate: false,
  },
  {
    quant: 'UD-Q5_K_XL',
    role: 'House default on one R9700 at 262K',
    llamaCpp:
      'Measured on llama.cpp Vulkan on local-desktop, not inside LM Studio: 102.39 tok/s decode at 4K, 90.52 at 32K, 66.43 at 128K, 44.4 at 256K. Peak VRAM 25.97 GB at 4K and 29.34 GB at 256K; peak system RAM 37.32 GB and 42.9 GB (Linux GB). Publisher listing 26.6 GB.',
    note: `Daily-driver file ${SETUP_LM_STUDIO_HOUSE_FILE}. Set context to ${SETUP_LM_STUDIO_CONTEXT}, GPU offload max. Those tok/s are llama.cpp llama-bench cards, not LM Studio.`,
    estimate: false,
  },
  {
    quant: 'Q4_K_M',
    role: 'Smaller measured 35B sibling',
    llamaCpp:
      'Measured on llama.cpp Vulkan on local-desktop, not inside LM Studio: Q4_K_M 32K decode 117.69 tok/s; prefill 1902.1 tok/s. One R9700, f16 KV.',
    note: `Still check ${RAM_MIN_LABEL} and ${RAM_FULL_LABEL}. Not an LM Studio tok/s.`,
    estimate: false,
  },
  {
    quant: COMPARE_Q3,
    role: 'Cited Q3 option — labeled estimate',
    llamaCpp: `${COMPARE_Q3_CITE}. No 35B overnight tok/s on this site. We do not invent an LM Studio Q3 speed.`,
    note: 'Labeled estimate unless a run card exists — none does for 35B Q3 on local-desktop. Q1/Q2 stay off.',
    estimate: true,
  },
];

export const SETUP_LM_STUDIO_STEPS: SetupLmStudioStep[] = [
  {
    id: 'windows',
    title: 'Windows install',
    body:
      'Download the installer from lmstudio.ai/download and install. LM Studio’s system-requirements page: Windows x64 and ARM (Snapdragon X Elite); x64 needs AVX2; at least 16 GB of RAM recommended; at least 4 GB of dedicated VRAM recommended. AMD’s playbook says launch once so the lms CLI initializes. Adrenalin is AMD’s Windows driver path on that playbook — we do not invent a version pin. Official 35B cards on this site are Ubuntu llama.cpp, not Windows LM Studio. Not measured on local-desktop.',
    links: [
      { href: '/setup/windows', label: 'Windows setup' },
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
    ],
  },
  {
    id: 'linux',
    title: 'Linux AppImage on Ubuntu 24.04+',
    body:
      'LM Studio documents Linux as an AppImage (x64 and ARM64). Required: Ubuntu 20.04 or newer. Official note: Ubuntu versions newer than 22 are not well tested. Ubuntu 24.04.5 is the measured AMDai llama.cpp OS — that is not an LM Studio test claim. AMD’s playbook: download the AppImage from lmstudio.ai/download?os=linux, then sudo apt install libfuse2, chmod +x LM-Studio-*.AppImage, ./LM-Studio-*.AppImage. Launch once so lms initializes. Add the login to render and video (AMD playbook). The playbook also mentions a .deb; this page follows the AppImage they spell out. Fedora and Arch can run the same AppImage as a cited try — not verified on our rig. Not measured on local-desktop.',
    links: [
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/setup/fedora', label: 'Fedora setup' },
      { href: '/setup/arch', label: 'Arch setup' },
      { href: '/setup/docker', label: 'Docker / Podman' },
    ],
  },
  {
    id: 'runtime',
    title: 'Pick the Vulkan llama.cpp runtime — ROCm only if this gfx is listed',
    body:
      'Ctrl+Shift+R opens Runtime Selections (AMD playbook). CLI: lms runtime ls, lms runtime get, lms runtime select. Take the Vulkan llama.cpp engine first on RDNA 2, RDNA 3, RDNA 4, and the R9700. The bundled ROCm engine is second, and only if the picker lists this card’s gfx — we do not invent that list. CUDA is the wrong family on a Radeon. Not measured on local-desktop.',
    links: [
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/backends/lmstudio', label: 'LM Studio backend' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/gpus/r9700', label: 'R9700' },
    ],
  },
  {
    id: 'quant',
    title: 'Pick Q6, Q5, or Q4 — Q3 is a labeled estimate',
    body:
      'House file: Qwen3.6-35B-A3B Unsloth UD-Q5_K_XL on one R9700 at 262144 context. Discover can search that name, or sideload the GGUF from NVMe. Start at Q6, Q5, or Q4. A cited Q3 file (UD-Q3_K_XL, Hugging Face listing 16.8 GB) is a labeled estimate — no 35B overnight card. Q1/Q2 stay off. Tok/s on /benchmarks and /results are Ubuntu llama-bench on llama.cpp, not numbers measured inside LM Studio. AMD’s playbook example models are not the house pick.',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/quants', label: 'Quants' },
      { href: '/qwen', label: 'Qwen compare' },
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
    ],
  },
  {
    id: 'offload',
    title: 'GPU offload max, context 262K, both RAM lines',
    body: `AMD playbook GUI: Model Loader (Ctrl+L), show advanced settings, GPU Offload maximum, Flash Attention On, Remember settings. Their playbook context example is 4096 for their sample models — that is not the house 262K window. LM Studio CLI: ${SETUP_LM_STUDIO_LOAD}. --gpu accepts off, max, or a 0–1 fraction; if omitted, LM Studio picks. --context-length sets the token window. The calculator still prints ${RAM_MIN_LABEL} (the load at the context you picked) and ${RAM_FULL_LABEL} (262144 for the house 35B). Overnight UD-Q5 one-GPU Ubuntu llama.cpp peaks are 37.32 GB at 4K and 42.9 GB at 256K — measured on llama.cpp on local-desktop, not inside LM Studio. When a file spills to system RAM, round ${RAM_MIN_LABEL} to a real kit (192 or 256 GB) with a breakdown and keep it a labeled estimate until measured. Not measured on local-desktop.`,
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/long-context', label: 'Long context' },
      { href: '/tuning', label: 'Tuning flags' },
    ],
  },
  {
    id: 'server',
    title: 'Local OpenAI-compatible server — then Hermes or another harness',
    body: `Developer tab (Ctrl+2) → Server Settings → Status on (AMD playbook). Documented bind is typically ${SETUP_LM_STUDIO_SERVER.replace('/v1', '')}. LM Studio OpenAI-compat docs: point the client base URL at http://localhost:1234/v1. Endpoints include GET /v1/models and POST /v1/chat/completions plus /v1/responses. Confirm with curl -s ${SETUP_LM_STUDIO_SERVER.replace(/\/v1$/, '')}/v1/models. Keep the bind on 127.0.0.1 unless you mean to share the LAN (playbook: Serve on Local Network). Hermes and other harnesses can use that OpenAI-shaped /v1 the same way they use llama-server — house Hermes on this site talks to :8080 / Strata :8083, not a measured LM Studio attach. Not measured on local-desktop.`,
    links: [
      { href: '/harnesses', label: 'Harnesses' },
      { href: '/harnesses/lm-studio', label: 'LM Studio harness' },
      { href: '/harnesses/hermes', label: 'Hermes' },
      { href: '/harnesses/connect', label: 'Connect a harness' },
    ],
  },
  {
    id: 'plain',
    title: 'When to move to plain llama.cpp',
    body:
      'Leave LM Studio when you need this site’s compile flags, llama-bench cards, or a Stack Lab recipe that matches local-desktop. The measured daily driver is llama.cpp Vulkan you built — llama-server on 127.0.0.1:8080, not the bundled engine on :1234. Read First-run setup and Backends. Docker / Podman is the isolated official-image path. We do not invent an LM Studio tok/s or a speed delta versus llama.cpp. Not measured on local-desktop.',
    links: [
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/backends', label: 'Backends' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/setup/docker', label: 'Docker / Podman' },
      { href: '/stack-lab', label: 'Stack Lab' },
    ],
  },
  {
    id: 'breaks',
    title: 'Common Radeon gotchas',
    body:
      'GPU meter idle: wrong runtime (CPU or CUDA on a Radeon) or no offload — set GPU Offload max and confirm Vulkan. ROCm runtime missing this gfx: stay Vulkan; do not invent an override on gfx1201. gfx1031 HSA_OVERRIDE is unofficial — prefer Vulkan. AppImage on Ubuntu 24.04: LM Studio says versions newer than 22 are not well tested; libfuse2 is the AMD playbook package. Permission on /dev/dri or /dev/kfd: render and video groups. Start from /troubleshoot and paste a log in the error matcher. Cited rows live on /rocm-problems. Stack Lab remains the Ubuntu companion — packages are not published yet and there is no LM Studio package. Not measured on local-desktop.',
    links: [
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/troubleshoot/errors', label: 'Error paste' },
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/rocm-problems/gfx1031-hsa-override', label: 'gfx1031 HSA_OVERRIDE' },
      { href: '/faq', label: 'FAQ' },
      { href: '/glossary', label: 'Glossary' },
    ],
  },
];

export const SETUP_LM_STUDIO_HOWTO_STEPS = SETUP_LM_STUDIO_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const SETUP_LM_STUDIO_HUB_LINKS: SetupLmStudioLink[] = [
  { href: '/setup', label: 'Ubuntu setup (measured)' },
  { href: '/setup/windows', label: 'Windows setup' },
  { href: '/setup/fedora', label: 'Fedora setup' },
  { href: '/setup/arch', label: 'Arch setup' },
  { href: '/setup/docker', label: 'Docker / Podman' },
  { href: '/backends/lmstudio', label: 'LM Studio backend' },
  { href: '/harnesses/lm-studio', label: 'LM Studio harness' },
  { href: '/gpus/r9700', label: 'R9700' },
  { href: '/start', label: 'Getting started' },
];

export const REQUIRED_SETUP_LM_STUDIO_HREFS = [
  '/setup',
  '/setup/windows',
  '/setup/fedora',
  '/setup/arch',
  '/setup/docker',
  '/gpus/r9700',
  '/calculator',
  '/backends',
  '/backends/llamacpp',
  '/backends/lmstudio',
  '/harnesses',
  '/harnesses/lm-studio',
  '/harnesses/hermes',
  '/rocm/vulkan-hip',
  '/rocm-problems',
  '/rocm-problems/gfx1031-hsa-override',
  '/stack-lab',
  '/troubleshoot',
  '/troubleshoot/errors',
  '/faq',
  '/glossary',
  '/recipes/qwen36-35b.llamacpp-vulkan.262k',
] as const;

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function setupLmStudioBlob(): string {
  return [
    SETUP_LM_STUDIO_CITED_LABEL,
    ...SETUP_LM_STUDIO_TRACKS.map((row) => `${row.title} ${row.body} ${row.gpus}`),
    ...SETUP_LM_STUDIO_STEPS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_LM_STUDIO_QUANTS.map((row) => `${row.quant} ${row.role} ${row.llamaCpp} ${row.note}`),
    SETUP_LM_STUDIO_LOAD,
    SETUP_LM_STUDIO_SERVER,
  ].join('\n');
}

export function setupLmStudioHrefs(): string[] {
  const links = [
    ...SETUP_LM_STUDIO_HUB_LINKS,
    ...SETUP_LM_STUDIO_STEPS.flatMap((step) => step.links),
    ...SETUP_LM_STUDIO_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

export function assertSetupLmStudioValid(): string[] {
  const errors: string[] = [];
  const blob = setupLmStudioBlob();
  const hrefs = new Set(setupLmStudioHrefs());
  if (SETUP_LM_STUDIO_CITED_LABEL !== 'Cited, not measured on local-desktop') errors.push('cited label drifted');
  if (SETUP_LM_STUDIO_TRACKS.length !== 2) errors.push('need vulkan and rocm tracks');
  if (!SETUP_LM_STUDIO_TRACKS.find((row) => row.id === 'vulkan')?.recommend) {
    errors.push('Vulkan runtime should be the try');
  }
  if (SETUP_LM_STUDIO_TRACKS.find((row) => row.id === 'rocm')?.recommend) {
    errors.push('ROCm runtime must not be the first-run try');
  }
  if (SETUP_LM_STUDIO_STEPS.length < 8) errors.push('checklist too short');
  if (SETUP_LM_STUDIO_QUANTS.length !== 4) errors.push('need Q6 Q5 Q4 Q3 rows');
  if (!SETUP_LM_STUDIO_QUANTS.some((row) => row.quant === 'Q6_K' && !row.estimate)) {
    errors.push('Q6 row missing');
  }
  if (!SETUP_LM_STUDIO_QUANTS.some((row) => row.quant === 'UD-Q5_K_XL' && !row.estimate)) {
    errors.push('Q5 house row missing');
  }
  if (!SETUP_LM_STUDIO_QUANTS.some((row) => row.quant === 'Q4_K_M' && !row.estimate)) {
    errors.push('Q4 row missing');
  }
  const q3 = SETUP_LM_STUDIO_QUANTS.find((row) => row.quant === COMPARE_Q3);
  if (!q3?.estimate) errors.push('Q3 must be a labeled estimate');
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (!/llama\.cpp/i.test(blob)) errors.push('must say llama.cpp');
  if (!/not measured on local-desktop/i.test(blob)) errors.push('must say not measured on local-desktop');
  if (!/not inside LM Studio/i.test(blob)) errors.push('must label llama.cpp numbers as not inside LM Studio');
  if (!/Q3 is a labeled estimate/i.test(blob) && !/labeled estimate/i.test(blob)) {
    errors.push('Q3 must stay a labeled estimate');
  }
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) {
    errors.push('RAM lines missing');
  }
  if (!blob.includes(SETUP_LM_STUDIO_SERVER)) errors.push('must cite :1234/v1');
  if (!blob.includes('--gpu max')) errors.push('must cite lms load --gpu max');
  if (!blob.includes('262144')) errors.push('must cite house context');
  if (!/AppImage/.test(blob)) errors.push('must cite Linux AppImage');
  if (!/libfuse2/.test(blob)) errors.push('must cite libfuse2');
  if (!/newer than 22 are not well tested/.test(blob)) {
    errors.push('must cite LM Studio Ubuntu-newer-than-22 note');
  }
  if (!/Ctrl\+Shift\+R/.test(blob)) errors.push('must cite runtime shortcut');
  if (!/GPU Offload/.test(blob)) errors.push('must cite GPU Offload');
  if (!/Flash Attention/.test(blob)) errors.push('must cite Flash Attention');
  if (!/RDNA 2/.test(blob) || !/RDNA 3/.test(blob) || !/RDNA 4/.test(blob) || !/R9700/.test(blob)) {
    errors.push('must name RDNA 2/3/4 and R9700');
  }
  if (!/do not invent that list/i.test(blob) && !/do not invent that the bundled/i.test(blob)) {
    errors.push('must refuse invented ROCm GPU whitelist');
  }
  if (!/When to move to plain llama\.cpp/.test(blob)) errors.push('must say when to leave LM Studio');
  if (!/102\.39/.test(blob) || !/44\.4/.test(blob)) errors.push('must cite measured llama.cpp decode');
  if (/\bmeasured in LM Studio\b/i.test(blob) || /\bLM Studio decode \d/i.test(blob)) {
    errors.push('must not claim LM Studio tok/s');
  }
  if (!SETUP_LM_STUDIO_QUANTS.every((row) => /llama\.cpp/.test(row.llamaCpp) || row.estimate)) {
    errors.push('quant rows must point at llama.cpp or stay estimates');
  }
  for (const source of SETUP_LM_STUDIO_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_SETUP_LM_STUDIO_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return [...new Set(errors)];
}
