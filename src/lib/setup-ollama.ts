/**
 * Cited Ollama first-run on Radeon.
 * Not measured on local-desktop. Official sources only: Ollama docs / GPU page,
 * AMD ROCm install docs, llama.cpp docs.
 * Do not invent Ollama versions, tok/s, prices, or a library Q6/Q5/Q3 tag.
 */

import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';

export const SETUP_OLLAMA_PUBLISHED = '2026-10-14';
export const SETUP_OLLAMA_CITED_LABEL = 'Cited, not measured on local-desktop';

export const SETUP_OLLAMA_HOST = '127.0.0.1';
export const SETUP_OLLAMA_PORT = 11434;
export const SETUP_OLLAMA_SERVER = `http://${SETUP_OLLAMA_HOST}:${SETUP_OLLAMA_PORT}`;
export const SETUP_OLLAMA_V1 = `${SETUP_OLLAMA_SERVER}/v1`;
export const SETUP_OLLAMA_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';
export const SETUP_OLLAMA_LIBRARY_Q4 = 'qwen3.6:35b-a3b-q4_K_M';
export const SETUP_OLLAMA_LIBRARY = 'qwen3.6:35b';
export const SETUP_OLLAMA_INSTALL = 'curl -fsSL https://ollama.com/install.sh | sh';
export const SETUP_OLLAMA_ROCM_PKG =
  'curl -fsSL https://ollama.com/download/ollama-linux-amd64-rocm.tar.zst | sudo tar x -C /usr';

export type SetupOllamaLink = { href: string; label: string };

export type SetupOllamaSource = {
  id: string;
  title: string;
  href: string;
};

export type SetupOllamaTrack = {
  id: 'llamacpp' | 'ollama';
  title: string;
  recommend: boolean;
  body: string;
};

export type SetupOllamaStep = {
  id: string;
  title: string;
  body: string;
  links: SetupOllamaLink[];
};

export type SetupOllamaQuant = {
  quant: string;
  role: string;
  ollama: string;
  note: string;
  estimate: boolean;
};

export const SETUP_OLLAMA_SOURCES: SetupOllamaSource[] = [
  {
    id: 'ollama-linux',
    title: 'Ollama — Linux install',
    href: 'https://docs.ollama.com/linux',
  },
  {
    id: 'ollama-windows',
    title: 'Ollama — Windows',
    href: 'https://docs.ollama.com/windows',
  },
  {
    id: 'ollama-gpu',
    title: 'Ollama — Hardware support (GPU / AMD)',
    href: 'https://github.com/ollama/ollama/blob/main/docs/gpu.mdx',
  },
  {
    id: 'ollama-faq',
    title: 'Ollama — FAQ (context, ollama ps, KV, Flash Attention)',
    href: 'https://docs.ollama.com/faq',
  },
  {
    id: 'ollama-import',
    title: 'Ollama — Import a GGUF',
    href: 'https://docs.ollama.com/import',
  },
  {
    id: 'ollama-qwen36',
    title: 'Ollama library — qwen3.6',
    href: 'https://ollama.com/library/qwen3.6',
  },
  {
    id: 'amd-rocm-linux',
    title: 'AMD — Install ROCm on Linux',
    href: 'https://rocm.docs.amd.com/projects/install-on-linux/en/latest/',
  },
  {
    id: 'llamacpp-build',
    title: 'llama.cpp — build.md (Vulkan / HIP)',
    href: 'https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md',
  },
];

export const SETUP_OLLAMA_TRACKS: SetupOllamaTrack[] = [
  {
    id: 'llamacpp',
    title: 'Plain llama.cpp — the AMDai daily driver',
    recommend: true,
    body: `
      Ollama is a packaged llama.cpp / ROCm (or Vulkan) runtime you do not compile.
      The measured path on this site is still a llama.cpp tree you built on Ubuntu
      24.04+ — Vulkan first, HIP second. Use that when you want the house flags
      (-ngl 99, -c 262144, f16 KV, :8080) and the local-desktop cards. Ollama is the
      easy on-ramp. Prefer /setup and /backends/llamacpp when gfx1201 tensiles
      miss, Windows ROCm stays on CPU, or you need a matching recipe. Link
      /rocm/vulkan-hip. Not measured inside Ollama.
    `.replace(/\s+/g, ' ').trim(),
  },
  {
    id: 'ollama',
    title: 'Ollama — pull-and-run on :11434',
    recommend: false,
    body: `
      Official Linux install is ${SETUP_OLLAMA_INSTALL}. AMD extra: the ROCm
      tarball ${SETUP_OLLAMA_ROCM_PKG}. gpu.mdx: Linux ROCm v7; Linux card table
      includes R9700, RX 9070 XT, 7900 XTX, 7800 XT, and the rest of that list.
      Windows ROCm table is the 7900 / 7800 / 7700 / 7600 and W79xx class — it
      does not name the R9700 or 9070 series. Vulkan is additional support and
      is enabled by default when that backend is installed. Prove the GPU with
      ollama ps (100% GPU vs 100% CPU) and a meter — silent CPU fallback is the
      cited failure. Not measured on local-desktop.
    `.replace(/\s+/g, ' ').trim(),
  },
];

export const SETUP_OLLAMA_QUANTS: SetupOllamaQuant[] = [
  {
    quant: 'Q6_K',
    role: 'Higher-quality 35B sibling',
    ollama:
      'No qwen3.6 Q6_K tag on the official Ollama library tags page we checked. Import the Unsloth Q6_K GGUF already sized on /models/qwen36: FROM /path/to/Qwen3.6-35B-A3B-Q6_K.gguf then ollama create qwen36-q6. Not a speed measured inside Ollama.',
    note: 'Measured on llama.cpp Vulkan on local-desktop, not inside Ollama: Q6_K 1-GPU 4K decode 103.23 tok/s (23:55 card). 32K+ is partly on DDR5.',
    estimate: false,
  },
  {
    quant: 'UD-Q5_K_XL',
    role: 'House default file on one R9700',
    ollama: `Import the house GGUF so the quant is the one we measure: FROM ~/models/${SETUP_OLLAMA_HOUSE_FILE} then ollama create qwen36-q5. Official library latest / ${SETUP_OLLAMA_LIBRARY} is 23–24 GB — do not assume that blob is UD-Q5_K_XL.`,
    note: 'Measured on llama.cpp Vulkan on local-desktop, not inside Ollama: 102.39 tok/s decode at 4K, 90.52 at 32K, 66.43 at 128K, 44.4 at 256K. Peak VRAM 25.97 / 29.34 GB; peak RAM 37.32 / 42.9 GB.',
    estimate: false,
  },
  {
    quant: 'Q4_K_M',
    role: 'Official Ollama library 35B Q4',
    ollama: `Cited library tag ${SETUP_OLLAMA_LIBRARY_Q4} (24 GB, 256K) on ollama.com/library/qwen3.6/tags. ollama pull ${SETUP_OLLAMA_LIBRARY_Q4}. Same family as ${SETUP_OLLAMA_LIBRARY}.`,
    note: 'Measured on llama.cpp Vulkan on local-desktop, not inside Ollama: Q4_K_M 32K decode 117.69 tok/s. Still check both RAM lines.',
    estimate: false,
  },
  {
    quant: COMPARE_Q3,
    role: 'Cited Q3 option — labeled estimate',
    ollama: `${COMPARE_Q3_CITE}. No qwen3.6 Q3 tag on the official library tags page we checked. Import the listed Unsloth Q3 GGUF from /models/qwen36 if you need that size. We do not invent an Ollama Q3 speed. Q1/Q2 stay off.`,
    note: 'Labeled estimate unless a run card exists — none does for 35B Q3 on local-desktop.',
    estimate: true,
  },
];

export const SETUP_OLLAMA_STEPS: SetupOllamaStep[] = [
  {
    id: 'linux',
    title: 'Linux install on Ubuntu 24.04+',
    body: `Official Linux install: ${SETUP_OLLAMA_INSTALL}. Manual tarball is also documented. AMD GPU extra: ${SETUP_OLLAMA_ROCM_PKG}. gpu.mdx: Ollama requires the AMD ROCm v7 driver on Linux — install or upgrade with amdgpu-install from AMD’s ROCm docs. Ubuntu 24.04.5 is the measured AMDai llama.cpp OS; that is not an Ollama test claim. Start with ollama serve (or systemctl start ollama). Confirm ollama -v and curl -s ${SETUP_OLLAMA_SERVER}/api/tags. Keep the bind on 127.0.0.1 unless you set OLLAMA_HOST. Fedora and Arch can run the same script as a cited try — not verified on our rig. Not measured on local-desktop.`,
    links: [
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/setup/fedora', label: 'Fedora setup' },
      { href: '/setup/arch', label: 'Arch setup' },
      { href: '/tutorials/install-rocm', label: 'Install ROCm' },
      { href: '/tutorials/verify-rocm', label: 'Verify ROCm' },
    ],
  },
  {
    id: 'windows',
    title: 'Windows note — short, then back to Linux',
    body: 'Ollama documents a native Windows app (Windows 10 22H2+). API on http://localhost:11434. Windows ROCm needs an AMD ROCm v7 / HIP7-capable driver, or a Vulkan-capable Radeon driver. Official Windows ROCm card table is 7900 / 7800 / 7700 / 7600 and W79xx — not the R9700 or 9070 series. gpu.mdx Windows table matches that shorter list. Cited Windows R9700 pain: Ollama detects the card, fails to init ROCm, falls back to CPU — /rocm-problems/ollama-r9700-windows. Workaround on that page: llama.cpp Vulkan or OLLAMA_VULKAN=1. Do not invent HSA_OVERRIDE on gfx1201. Official 35B cards on this site are Ubuntu llama.cpp, not Windows Ollama. Not measured on local-desktop.',
    links: [
      { href: '/setup/windows', label: 'Windows setup' },
      { href: '/rocm-problems/ollama-r9700-windows', label: 'Ollama R9700 Windows' },
      { href: '/rocm-problems/hsa-override-unofficial', label: 'HSA_OVERRIDE is unofficial' },
      { href: '/gpus/r9700', label: 'R9700' },
    ],
  },
  {
    id: 'gpu',
    title: 'How Ollama picks ROCm vs CPU on consumer Radeon',
    body: 'gpu.mdx Linux ROCm table includes RDNA 4 (9070 XT / R9700 / gfx1201), RDNA 3 (7900 / 7800 / 7700 / 7600), and RDNA 2 names on that list. Listing a card ≠ “works on my R9700 tonight.” If ROCm kernels miss, Ollama falls back to CPU — ollama ps will say 100% CPU. Vulkan is additional support (enabled by default when installed); disable with OLLAMA_VULKAN=0. gfx1201 Linux container pain is hipBLASLt looking for TensileLibrary_lazy_gfx1201.dat in the wrong folder — /rocm-problems/ollama-gfx1201-tensile, do not rewrite it here. gfx1031 (RX 6700 XT) community override is /rocm-problems/gfx1031-hsa-override; this site does not recommend spraying HSA_OVERRIDE_GFX_VERSION on gfx1201. Multi-GPU: official AMD selector is ROCR_VISIBLE_DEVICES (rocminfo UUIDs). Vulkan selector is GGML_VK_VISIBLE_DEVICES. Prefer one card first. When the meter stays idle, leave Ollama for llama.cpp Vulkan/HIP.',
    links: [
      { href: '/backends/ollama', label: 'Ollama backend' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/rocm-problems/ollama-gfx1201-tensile', label: 'gfx1201 tensiles' },
      { href: '/rocm-problems/gfx1031-hsa-override', label: 'gfx1031 HSA_OVERRIDE' },
      { href: '/rocm-problems', label: 'ROCm problems' },
    ],
  },
  {
    id: 'quant',
    title: 'Pull or import Q6, Q5, or Q4 — Q3 is a labeled estimate',
    body: `House family is Qwen3.6-35B-A3B. Official library: ollama pull ${SETUP_OLLAMA_LIBRARY} or ${SETUP_OLLAMA_LIBRARY_Q4} (Q4_K_M, 24 GB, 256K). That library page does not publish Q6_K, UD-Q5_K_XL, or a Q3 tag — import those GGUFs with a Modelfile FROM /path/to/file.gguf and ollama create (Ollama import docs; they do not re-quantize GGUF). Prefer ${SETUP_OLLAMA_HOUSE_FILE} when the calculator says it fits. Q1/Q2 stay off. Stay on the house Qwen3.6 family already on /models. Decode numbers on this site are Ubuntu llama.cpp llama-bench, not a speed measured inside Ollama.`,
    links: [
      { href: '/models/qwen36', label: 'Qwen3.6-35B' },
      { href: '/models', label: 'Models' },
      { href: '/calculator', label: 'Calculator' },
      { href: '/quants', label: 'Quants' },
      { href: '/qwen', label: 'Qwen compare' },
    ],
  },
  {
    id: 'nvme',
    title: 'Stage models on fast NVMe, not a slow bulk mount',
    body: 'Ollama FAQ: Linux default store is /usr/share/ollama/.ollama/models; Windows is %USERPROFILE%\\.ollama\\models. Point OLLAMA_MODELS at a fast NVMe directory (the ollama user needs write on Linux — chown -R ollama:ollama). A USB or spinning bulk mount will stall pulls and swaps; we do not invent a GB/s. Size the file on the calculator before the pull. Not measured on local-desktop.',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/budget', label: 'Budget' },
    ],
  },
  {
    id: 'context',
    title: 'Context, parallel, and KV — Ollama multiplies per request',
    body: `Ollama FAQ default context is 4096 tokens — not the house 262144. Override with OLLAMA_CONTEXT_LENGTH=8192 ollama serve, /set parameter num_ctx, or API options.num_ctx. Parallel requests grow that window: FAQ example, 2K context × 4 parallel = 8K plus extra allocation. Required RAM scales by OLLAMA_NUM_PARALLEL × OLLAMA_CONTEXT_LENGTH. That is why the calculator’s Ollama backend sizes KV per request — open /calculator and pick Ollama. Flash Attention: OLLAMA_FLASH_ATTENTION=1 to force on, 0 to disable. KV type: OLLAMA_KV_CACHE_TYPE (default f16; q8_0 or q4_0 only with Flash Attention). House llama.cpp uses f16 KV. The calculator prints ${RAM_MIN_LABEL} (rounded kit estimate with a breakdown — 192 or 256 GB when a 35B file spills) and ${RAM_FULL_LABEL} when we have a measured llama.cpp peak (37.32 GB at 4K, 42.9 GB at 256K on UD-Q5). Those peaks are llama.cpp on local-desktop, not Ollama. Label estimate unless measured.`,
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/long-context', label: 'Long context' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/tuning', label: 'Tuning flags' },
    ],
  },
  {
    id: 'ps',
    title: 'Prove the GPU, then point a harness at /v1',
    body: `ollama ps is the official check: 100% GPU, 100% CPU, or a split. curl -s ${SETUP_OLLAMA_SERVER}/api/tags. OpenAI-shaped local path is ${SETUP_OLLAMA_V1} (docs show /v1/chat/completions and /v1/responses). Point Hermes, Open WebUI, Aider, Cline, or Continue at that base — /harnesses/connect and /setup/coding-assistant. House Hermes on local-desktop talks to llama-server :8080, not a measured Ollama attach. Keep 127.0.0.1 unless you mean the LAN (OLLAMA_HOST). Do not present llama.cpp tok/s as an Ollama result.`,
    links: [
      { href: '/harnesses/connect', label: 'Connect a harness' },
      { href: '/harnesses/hermes', label: 'Hermes' },
      { href: '/setup/coding-assistant', label: 'Coding assistant' },
      { href: '/setup/lm-studio', label: 'LM Studio' },
      { href: '/setup/lemonade', label: 'Lemonade' },
      { href: '/harnesses', label: 'Harnesses' },
    ],
  },
  {
    id: 'breaks',
    title: 'When it sits on CPU',
    body: 'ollama ps first. 100% CPU: ROCm kernels missed, Windows R9700 init failed, or Vulkan never loaded. journalctl -u ollama on Linux. Do not spray HSA_OVERRIDE_GFX_VERSION — unofficial here, and the wrong gfx1201 fix. Tensile 404 → /rocm-problems/ollama-gfx1201-tensile, then llama.cpp. Windows R9700 → /rocm-problems/ollama-r9700-windows. Start from /troubleshoot. The wrapper is not the measured daily driver.',
    links: [
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/troubleshoot/errors', label: 'Error paste' },
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
];

export const SETUP_OLLAMA_HOWTO_STEPS = SETUP_OLLAMA_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const SETUP_OLLAMA_HUB_LINKS: SetupOllamaLink[] = [
  { href: '/setup', label: 'Ubuntu setup (measured)' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/backends/ollama', label: 'Ollama backend' },
  { href: '/setup/lm-studio', label: 'LM Studio' },
  { href: '/setup/lemonade', label: 'Lemonade' },
  { href: '/setup/open-webui', label: 'Open WebUI' },
  { href: '/setup/wsl', label: 'WSL2' },
  { href: '/setup/comfyui', label: 'ComfyUI' },
  { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp' },
  { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
  { href: '/rocm-problems', label: 'ROCm problems' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/gpus/r9700', label: 'R9700' },
];

export const REQUIRED_SETUP_OLLAMA_HREFS = [
  '/setup',
  '/setup/windows',
  '/setup/lm-studio',
  '/setup/coding-assistant',
  '/backends/llamacpp',
  '/backends/ollama',
  '/rocm/vulkan-hip',
  '/rocm-problems',
  '/rocm-problems/ollama-gfx1201-tensile',
  '/rocm-problems/ollama-r9700-windows',
  '/rocm-problems/gfx1031-hsa-override',
  '/troubleshoot',
  '/calculator',
  '/gpus/r9700',
  '/models/qwen36',
  '/harnesses/connect',
  '/long-context',
] as const;

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;

export function setupOllamaBlob(): string {
  return [
    SETUP_OLLAMA_CITED_LABEL,
    ...SETUP_OLLAMA_TRACKS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_OLLAMA_STEPS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_OLLAMA_QUANTS.map((row) => `${row.quant} ${row.role} ${row.ollama} ${row.note}`),
  ].join('\n');
}

export function setupOllamaHrefs(): string[] {
  const links = [
    ...SETUP_OLLAMA_HUB_LINKS,
    ...SETUP_OLLAMA_STEPS.flatMap((step) => step.links),
    ...SETUP_OLLAMA_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

export function assertSetupOllamaValid(): string[] {
  const errors: string[] = [];
  const blob = setupOllamaBlob();
  const hrefs = new Set(setupOllamaHrefs());
  if (SETUP_OLLAMA_CITED_LABEL !== 'Cited, not measured on local-desktop') errors.push('cited label drifted');
  if (SETUP_OLLAMA_TRACKS.length !== 2) errors.push('need llama.cpp and Ollama tracks');
  if (!SETUP_OLLAMA_TRACKS.find((row) => row.id === 'llamacpp')?.recommend) {
    errors.push('llama.cpp should be the try');
  }
  if (SETUP_OLLAMA_TRACKS.find((row) => row.id === 'ollama')?.recommend) {
    errors.push('Ollama must not be the first-run try');
  }
  if (SETUP_OLLAMA_STEPS.length < 7) errors.push('checklist too short');
  if (SETUP_OLLAMA_QUANTS.length !== 4) errors.push('need Q6 Q5 Q4 Q3 rows');
  if (!SETUP_OLLAMA_QUANTS.some((row) => row.quant === COMPARE_Q3 && row.estimate)) {
    errors.push('Q3 must be a labeled estimate');
  }
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (!/llama\.cpp/i.test(blob)) errors.push('must say llama.cpp');
  if (!blob.includes(SETUP_OLLAMA_V1)) errors.push('must cite :11434/v1');
  if (!blob.includes(SETUP_OLLAMA_LIBRARY_Q4)) errors.push('must cite official Q4 tag');
  if (!blob.includes(SETUP_OLLAMA_HOUSE_FILE)) errors.push('must cite house GGUF');
  if (!blob.includes('OLLAMA_CONTEXT_LENGTH')) errors.push('must cite context env');
  if (!blob.includes('OLLAMA_NUM_PARALLEL')) errors.push('must cite parallel KV');
  if (!blob.includes('OLLAMA_MODELS')) errors.push('must cite model dir');
  if (!blob.includes('ollama ps')) errors.push('must cite ollama ps');
  if (!blob.includes('ROCR_VISIBLE_DEVICES')) errors.push('must cite ROCR_VISIBLE_DEVICES');
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) {
    errors.push('RAM lines missing');
  }
  if (!/102\.39/.test(blob)) errors.push('must cite measured llama.cpp decode');
  if (!/not inside Ollama/i.test(blob)) errors.push('must label llama.cpp numbers as not Ollama');
  if (/\bmeasured in Ollama\b|\bOllama decode \d/i.test(blob)) {
    errors.push('must not claim Ollama tok/s');
  }
  if (!/NVMe/.test(blob)) errors.push('must mention NVMe');
  for (const source of SETUP_OLLAMA_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_SETUP_OLLAMA_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return [...new Set(errors)];
}
