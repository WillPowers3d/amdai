/**
 * Cited Lemonade Server first-run on Radeon.
 * Not measured on local-desktop. Official sources only: Lemonade docs / GitHub
 * releases, AMD Lemonade playbook, llama.cpp docs.
 * Do not invent Lemonade tok/s, prices, or a stable-ROCm per-SKU whitelist.
 * Do not paste Lemonade CLI examples that name banned models.
 */

import { RAM_FULL_LABEL, RAM_MIN_LABEL } from './ram-surfaces';
import { COMPARE_Q3, COMPARE_Q3_CITE } from './local-desktop-compare';

export const SETUP_LEMONADE_PUBLISHED = '2026-10-14';
export const SETUP_LEMONADE_CITED_LABEL = 'Cited, not measured on local-desktop';
export const SETUP_LEMONADE_TITLE = 'Lemonade Server on a Radeon GPU';

export const SETUP_LEMONADE_HOST = '127.0.0.1';
export const SETUP_LEMONADE_PORT = 13305;
export const SETUP_LEMONADE_SERVER = `http://${SETUP_LEMONADE_HOST}:${SETUP_LEMONADE_PORT}`;
export const SETUP_LEMONADE_V1 = `${SETUP_LEMONADE_SERVER}/api/v1`;
export const SETUP_LEMONADE_HOUSE_FILE = 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf';
export const SETUP_LEMONADE_HF_REPO = 'unsloth/Qwen3.6-35B-A3B-GGUF';
export const SETUP_LEMONADE_PULL_Q5 = `${SETUP_LEMONADE_HF_REPO}:UD-Q5_K_XL`;
export const SETUP_LEMONADE_PULL_Q6 = `${SETUP_LEMONADE_HF_REPO}:Q6_K`;
export const SETUP_LEMONADE_PULL_Q4 = `${SETUP_LEMONADE_HF_REPO}:Q4_K_M`;
export const SETUP_LEMONADE_PULL_Q3 = `${SETUP_LEMONADE_HF_REPO}:UD-Q3_K_XL`;
export const SETUP_LEMONADE_RELEASE = 'v2026.41.1';
export const SETUP_LEMONADE_RELEASE_DATE = '2026-10-07';
export const SETUP_LEMONADE_PPA = 'ppa:lemonade-team/stable';
export const SETUP_LEMONADE_APT = 'sudo apt install lemonade-server';
export const SETUP_LEMONADE_INSTALL = `sudo add-apt-repository ${SETUP_LEMONADE_PPA}\n${SETUP_LEMONADE_APT}`;
export const SETUP_LEMONADE_SNAP = 'sudo snap install lemonade-server';
export const SETUP_LEMONADE_MSI = 'msiexec /i lemonade-server-minimal.msi /qn';
export const SETUP_LEMONADE_LOAD =
  `lemonade load ${SETUP_LEMONADE_PULL_Q5} --ctx-size 262144 --llamacpp vulkan`;

export type SetupLemonadeLink = { href: string; label: string };

export type SetupLemonadeSource = {
  id: string;
  title: string;
  href: string;
};

export type SetupLemonadeTrack = {
  id: 'llamacpp' | 'lemonade';
  title: string;
  recommend: boolean;
  body: string;
};

export type SetupLemonadeStep = {
  id: string;
  title: string;
  body: string;
  links: SetupLemonadeLink[];
};

export type SetupLemonadeQuant = {
  quant: string;
  role: string;
  lemonade: string;
  note: string;
  estimate: boolean;
};

export const SETUP_LEMONADE_SOURCES: SetupLemonadeSource[] = [
  {
    id: 'lemonade-ubuntu',
    title: 'Lemonade — Ubuntu Installation (docs checked 2026-10-14)',
    href: 'https://lemonade-server.ai/docs/guide/install/ubuntu/',
  },
  {
    id: 'lemonade-windows',
    title: 'Lemonade — Install on Windows (docs checked 2026-10-14)',
    href: 'https://lemonade-server.ai/docs/guide/install/windows/',
  },
  {
    id: 'lemonade-llamacpp',
    title: 'Lemonade — llama.cpp Backend Options (Vulkan / ROCm, docs checked 2026-10-14)',
    href: 'https://lemonade-server.ai/docs/guide/configuration/llamacpp/',
  },
  {
    id: 'lemonade-cli',
    title: 'Lemonade — lemonade CLI (docs checked 2026-10-14)',
    href: 'https://lemonade-server.ai/docs/guide/cli/',
  },
  {
    id: 'lemonade-release',
    title: `Lemonade GitHub — ${SETUP_LEMONADE_RELEASE} (${SETUP_LEMONADE_RELEASE_DATE})`,
    href: 'https://github.com/lemonade-sdk/lemonade/releases/tag/v2026.41.1',
  },
  {
    id: 'amd-playbook',
    title: 'AMD — Getting Started with Lemonade (playbook, docs checked 2026-10-14)',
    href: 'https://developer.amd.com/playbooks/lemonade-getting-started/',
  },
  {
    id: 'llamacpp-rocm-nightly',
    title: 'lemonade-sdk/llamacpp-rocm — nightly gfx list (docs checked 2026-10-14)',
    href: 'https://github.com/lemonade-sdk/llamacpp-rocm',
  },
  {
    id: 'llamacpp-build',
    title: 'llama.cpp — build.md (Vulkan / HIP)',
    href: 'https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md',
  },
];

export const SETUP_LEMONADE_TRACKS: SetupLemonadeTrack[] = [
  {
    id: 'llamacpp',
    title: 'Plain llama.cpp — the AMDai daily driver',
    recommend: true,
    body: `
      Lemonade is AMD’s own local AI server. The primary LLM recipe wraps
      llama.cpp (Vulkan or ROCm backends, plus a Linux system-backend that
      can point at a llama-server you already built). The measured path on
      this site is still a llama.cpp tree you compiled on Ubuntu 24.04+ —
      Vulkan first, HIP second. Use that when you want the house flags
      (-ngl 99, -c 262144, f16 KV, :8080 /v1) and the local-desktop cards. Lemonade
      is the AMD-promoted wrapper. Prefer /setup and /backends/llamacpp when
      you need matching recipes, llama-bench cards, or a bind harnesses
      already know as /v1. Link /rocm/vulkan-hip and /compare/vulkan-vs-rocm.
      Not measured inside Lemonade.
    `.replace(/\s+/g, ' ').trim(),
  },
  {
    id: 'lemonade',
    title: 'Lemonade Server — wrapper on :13305/api/v1',
    recommend: false,
    body: `
      Latest GitHub release we checked is ${SETUP_LEMONADE_RELEASE}, published
      ${SETUP_LEMONADE_RELEASE_DATE}. Headline: ROCm backends move to ROCm 10;
      the first ROCm model load after that upgrade downloads about 2.6 GB of
      runtime. AMD’s playbook also prints a “Lemonade 11.8” pin on one Ryzen
      AI row — we do not invent a mapping onto the GitHub calver tag. Ubuntu
      24.04+ PPA is ${SETUP_LEMONADE_PPA}. Default bind is --host 127.0.0.1
      --port 13305. OpenAI-compatible base is ${SETUP_LEMONADE_V1} (AMD
      playbook). That is /api/v1, not the /v1 llama-server and Ollama use.
      amdai runs Lemonade on local-desktop; this site still has no Lemonade tok/s
      card. Not measured on local-desktop.
    `.replace(/\s+/g, ' ').trim(),
  },
];

export const SETUP_LEMONADE_QUANTS: SetupLemonadeQuant[] = [
  {
    quant: 'Q6_K',
    role: 'Higher-quality 35B sibling',
    lemonade: `Documented pull form is owner/repo[:variant]. House shape: lemonade pull ${SETUP_LEMONADE_PULL_Q6}. Confirm the variant stem against the Hugging Face listing and lemonade list — that is not a Lemonade library tag we invent. Then lemonade load … --llamacpp vulkan. Not a speed measured inside Lemonade.`,
    note: 'Measured on llama.cpp Vulkan on local-desktop, not inside Lemonade: Q6_K 1-GPU 4K decode 103.23 tok/s (23:55 card). 32K+ is partly on DDR5.',
    estimate: false,
  },
  {
    quant: 'UD-Q5_K_XL',
    role: 'House default file on one R9700',
    lemonade: `lemonade pull ${SETUP_LEMONADE_PULL_Q5} then ${SETUP_LEMONADE_LOAD}. Same documented owner/repo:variant shape; confirm UD-Q5_K_XL against unsloth/Qwen3.6-35B-A3B-GGUF. Custom register: lemonade pull user.qwen36-house --checkpoint main ${SETUP_LEMONADE_PULL_Q5} --recipe llamacpp. File on disk is ${SETUP_LEMONADE_HOUSE_FILE}.`,
    note: 'Measured on llama.cpp Vulkan on local-desktop, not inside Lemonade: 102.39 tok/s decode at 4K, 90.52 at 32K, 66.43 at 128K, 44.4 at 256K. Peak VRAM 25.97 / 29.34 GB; peak RAM 37.32 / 42.9 GB.',
    estimate: false,
  },
  {
    quant: 'Q4_K_M',
    role: 'Smaller measured 35B sibling',
    lemonade: `lemonade pull ${SETUP_LEMONADE_PULL_Q4}. Same HF listing, same confirm-the-variant rule. Not a Lemonade registry tag.`,
    note: 'Measured on llama.cpp Vulkan on local-desktop, not inside Lemonade: Q4_K_M 32K decode 117.69 tok/s. Still check both RAM lines.',
    estimate: false,
  },
  {
    quant: COMPARE_Q3,
    role: 'Cited Q3 option — labeled estimate',
    lemonade: `${COMPARE_Q3_CITE}. Documented pull shape lemonade pull ${SETUP_LEMONADE_PULL_Q3} — confirm the stem on the HF listing. We do not invent a Lemonade Q3 speed. Q1/Q2 stay off.`,
    note: 'Labeled estimate unless a run card exists — none does for 35B Q3 on local-desktop.',
    estimate: true,
  },
];

export const SETUP_LEMONADE_STEPS: SetupLemonadeStep[] = [
  {
    id: 'linux',
    title: 'Linux install on Ubuntu 24.04+',
    body: `Lemonade Ubuntu docs (checked 2026-10-14): tested on Ubuntu 24.04 LTS. Official PPA: sudo add-apt-repository ${SETUP_LEMONADE_PPA} then ${SETUP_LEMONADE_APT}. Optional desktop package: sudo apt install lemonade-desktop. Snap alternative: ${SETUP_LEMONADE_SNAP}. Linux GUI is http://localhost:13305 once the service is up. Prove with lemonade --version and lemonade status. CLI defaults: --host 127.0.0.1 --port 13305 (env LEMONADE_HOST / LEMONADE_PORT). Ubuntu 24.04.5 is the measured AMDai llama.cpp OS; that is not a Lemonade test claim. Fedora and Arch have cited Lemonade packages on the ${SETUP_LEMONADE_RELEASE} notes and the AMD playbook (yay -S lemonade-server) — those paths are not verified on our rig. Keep the bind on 127.0.0.1 unless you mean the LAN. Not measured on local-desktop.`,
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
    body: `Lemonade Windows docs (checked 2026-10-14): download the MSI from lemonade-server.ai and run it. Silent: ${SETUP_LEMONADE_MSI}. ${SETUP_LEMONADE_RELEASE} ships lemonade.msi and lemonade-server-minimal.msi. AMD playbook: the lemonade CLI lands on PATH; the server is expected to run in the background. Minimal MSI has no app — open ${SETUP_LEMONADE_SERVER}. Official 35B cards on this site are Ubuntu llama.cpp, not Windows Lemonade. Vulkan llama.cpp remains the honest Windows first-token path on /setup/windows. Not measured on local-desktop.`,
    links: [
      { href: '/setup/windows', label: 'Windows setup' },
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/gpus/r9700', label: 'R9700' },
    ],
  },
  {
    id: 'backend',
    title: 'Pick Vulkan vs ROCm on Radeon — cite their gfx, not ours',
    body: `Lemonade uses llama.cpp as the primary LLM backend. Install: lemonade backends install llamacpp:vulkan or lemonade backends install llamacpp:rocm. Per-run: lemonade run MODEL --llamacpp vulkan|rocm, or lemonade load MODEL --llamacpp vulkan. Persist: lemonade config set llamacpp.backend=rocm (or vulkan). Env LEMONADE_LLAMACPP=vulkan|rocm|cpu. Lemonade’s own llamacpp page (checked 2026-10-14): Vulkan is “recommended for most GPU users” on Windows/Linux, AMD iGPU and dGPU. ROCm is Windows/Linux for “AMD Radeon RX 6000/7000 series (RDNA2/RDNA3/RDNA4)” and Ryzen AI iGPUs (Strix Point/Halo). Their decision tree says try ROCm first on that RX 6000/7000 / Ryzen AI set, Vulkan if it fails; RX 5000 and earlier are Vulkan only (ROCm not supported). This site still picks Vulkan first on consumer Radeon — /compare/vulkan-vs-rocm and /rocm/vulkan-hip — and we do not invent a Lemonade speed delta. Nightly ROCm channel (lemonade config set rocm_channel=nightly then lemonade backends install llamacpp:rocm) publishes architecture-specific bins: gfx1150, gfx1151, gfx103X, gfx110X, gfx120X. Stable channel is “common builds for supported architectures” — we do not invent that the stable blob lists gfx1201 / R9700. gfx120X is the RDNA4 family on the nightly README (9070 / 9060 names); R9700 is gfx1201 in that family, not a Lemonade SKU we invent. Link /rocm/gfx. ${SETUP_LEMONADE_RELEASE} moves ROCm backends to ROCm 10; first ROCm load after upgrade downloads about 2.6 GB. Stable can reuse ROCM_PATH / /opt/rocm when the HIP runtime matches. CUDA is the wrong family on a Radeon. NPU / Hybrid / FLM recipes are a Ryzen AI XDNA 2 path on the AMD playbook — the R9700 has no NPU; do not treat those as a house-rig how-to. Not measured on local-desktop.`,
    links: [
      { href: '/rocm/gfx', label: 'gfx targets' },
      { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
      { href: '/compare/vulkan-vs-rocm', label: 'Vulkan vs ROCm' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/backends/lemonade', label: 'Lemonade backend' },
      { href: '/gpus/r9700', label: 'R9700' },
    ],
  },
  {
    id: 'quant',
    title: 'Pull a GGUF — Q6, Q5, or Q4; Q3 is a labeled estimate',
    body: `House family is Qwen3.6-35B-A3B. Lemonade CLI pull form (docs checked 2026-10-14) is owner/repo[:variant] from Hugging Face or ModelScope, or lemonade pull user.qwen36-house --checkpoint main owner/repo:variant --recipe llamacpp. House shape: lemonade pull ${SETUP_LEMONADE_PULL_Q5} then ${SETUP_LEMONADE_LOAD}. Confirm the variant stem on the Unsloth listing and lemonade list — we do not invent a Lemonade library tag. Prefer ${SETUP_LEMONADE_HOUSE_FILE} when the calculator says it fits. Start at Q6, Q5, or Q4. A cited Q3 file (${COMPARE_Q3_CITE}) is a labeled estimate. Q1/Q2 stay off. AMD’s playbook chat examples use other library names; stay on the house Qwen3.6 family already on /models. Decode numbers on this site are Ubuntu llama.cpp llama-bench, not a speed measured inside Lemonade.`,
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
    body: 'Lemonade config docs (checked 2026-10-14): on the systemd package, models cache under /var/lib/lemonade/.cache/huggingface (Debian/Ubuntu migrate from the older /opt/var/lib/lemonade path). Point that store — or the GGUF you already keep — at a fast NVMe directory. A USB or spinning bulk mount will stall pulls and swaps; we do not invent a GB/s. Size the file on the calculator before the pull. Not measured on local-desktop.',
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/gpus/r9700', label: 'R9700' },
      { href: '/budget', label: 'Budget' },
    ],
  },
  {
    id: 'context',
    title: 'Context and both RAM lines',
    body: `Lemonade load/run take --ctx-size SIZE (docs default auto). House window is 262144: ${SETUP_LEMONADE_LOAD}. Extra llama-server flags go through --llamacpp-args (example in their CLI: --flash-attn on --load-mode none). ${SETUP_LEMONADE_RELEASE} changelog: they renamed the deprecated --no-mmap option to --load-mode none for llama.cpp. Do not assume Lemonade defaults to f16 KV or -ngl 99 — those are house llama.cpp flags. The calculator still prints ${RAM_MIN_LABEL} (rounded kit estimate with a breakdown — 192 or 256 GB when a 35B file spills) and ${RAM_FULL_LABEL} when we have a measured llama.cpp peak (37.32 GB at 4K, 42.9 GB at 256K on UD-Q5). Those peaks are llama.cpp on local-desktop, not Lemonade. Label estimate unless measured.`,
    links: [
      { href: '/calculator', label: 'Calculator' },
      { href: '/long-context', label: 'Long context' },
      { href: '/flash-ram-offload', label: 'Flash RAM offload' },
      { href: '/tuning', label: 'Tuning flags' },
    ],
  },
  {
    id: 'api',
    title: 'Point a harness at /api/v1',
    body: `lemonade status should say the server is on port 13305. AMD playbook OpenAI-compatible base is ${SETUP_LEMONADE_V1}. Confirm with curl -s ${SETUP_LEMONADE_V1}/models. API key placeholder on that playbook is "lemonade" (env LEMONADE_API_KEY / LEMONADE_ADMIN_API_KEY). Point Hermes, Open WebUI, Aider, Cline, or Continue at that base — /harnesses/connect and /setup/coding-assistant. Note the /api/v1 suffix: llama-server and Ollama speak /v1. House Hermes on local-desktop talks to llama-server :8080, not a measured Lemonade attach. Keep 127.0.0.1 unless you mean the LAN. Do not present llama.cpp tok/s as a Lemonade result.`,
    links: [
      { href: '/harnesses/connect', label: 'Connect a harness' },
      { href: '/harnesses/hermes', label: 'Hermes' },
      { href: '/setup/coding-assistant', label: 'Coding assistant' },
      { href: '/setup/ollama', label: 'Ollama' },
      { href: '/setup/lm-studio', label: 'LM Studio' },
      { href: '/harnesses', label: 'Harnesses' },
    ],
  },
  {
    id: 'vs',
    title: 'Where Lemonade sits vs llama-server, Ollama, and LM Studio',
    body: 'Honest llama.cpp-first: plain llama-server you compiled is the measured daily driver (:8080 /v1, house flags, local-desktop cards). Lemonade is AMD’s wrapper over that same engine — easier PPA/MSI, explicit lemonade backends install llamacpp:vulkan|rocm, a tray/web UI on :13305, and an OpenAI-shaped /api/v1. You give up matching compile flags and this site’s llama-bench cards. Versus Ollama: both are packaged llama.cpp. Ollama is :11434/v1 with library tags; Lemonade is :13305/api/v1 with owner/repo:variant pulls and a documented Vulkan vs ROCm switch. Versus LM Studio: both are desktop-ish wrappers. LM Studio is GUI-first on :1234/v1; Lemonade is CLI-first plus a web UI. None of the three wrappers is a measured local-desktop tok/s path. We do not invent a speed ranking. Leave Lemonade when you need this site’s flags, recipes, or Stack Lab doctor.',
    links: [
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/backends/ollama', label: 'Ollama backend' },
      { href: '/backends/lmstudio', label: 'LM Studio backend' },
      { href: '/setup/ollama', label: 'Ollama' },
      { href: '/setup/lm-studio', label: 'LM Studio' },
      { href: '/stack-lab', label: 'Stack Lab' },
    ],
  },
  {
    id: 'breaks',
    title: 'When it sits on CPU',
    body: 'lemonade status and lemonade logs first. GPU meter idle: Vulkan never installed (lemonade backends install llamacpp:vulkan), ROCm kernels missed this gfx, or you are on CPU. Do not spray HSA_OVERRIDE_GFX_VERSION — unofficial here, and the wrong gfx1201 fix. Missing nightly gfx → stay Vulkan or move to a llama.cpp you compiled. First ROCm load after ${SETUP_LEMONADE_RELEASE} pulling ~2.6 GB is expected, not a hang we invent. Harness 404 on /v1: you wanted /api/v1. Start from /troubleshoot. The wrapper is not the measured daily driver.',
    links: [
      { href: '/troubleshoot', label: 'Troubleshoot' },
      { href: '/troubleshoot/errors', label: 'Error paste' },
      { href: '/rocm-problems', label: 'ROCm problems' },
      { href: '/setup', label: 'Ubuntu setup (measured)' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
];

export const SETUP_LEMONADE_HOWTO_STEPS = SETUP_LEMONADE_STEPS.map((step) => ({
  name: step.title,
  text: step.body,
}));

export const SETUP_LEMONADE_HUB_LINKS: SetupLemonadeLink[] = [
  { href: '/setup', label: 'Ubuntu setup (measured)' },
  { href: '/backends/llamacpp', label: 'llama.cpp' },
  { href: '/backends/lemonade', label: 'Lemonade backend' },
  { href: '/setup/ollama', label: 'Ollama' },
  { href: '/setup/lm-studio', label: 'LM Studio' },
  { href: '/setup/coding-assistant', label: 'Coding assistant' },
  { href: '/setup/open-webui', label: 'Open WebUI' },
  { href: '/setup/wsl', label: 'WSL2' },
  { href: '/setup/comfyui', label: 'ComfyUI' },
  { href: '/setup/multi-gpu', label: 'Multi-GPU llama.cpp' },
  { href: '/rocm/gfx', label: 'gfx targets' },
  { href: '/rocm/vulkan-hip', label: 'Vulkan vs HIP' },
  { href: '/compare/vulkan-vs-rocm', label: 'Vulkan vs ROCm' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/gpus/r9700', label: 'R9700' },
];

export const REQUIRED_SETUP_LEMONADE_HREFS = [
  '/setup',
  '/setup/windows',
  '/setup/ollama',
  '/setup/lm-studio',
  '/setup/coding-assistant',
  '/backends/llamacpp',
  '/backends/lemonade',
  '/rocm/gfx',
  '/rocm/vulkan-hip',
  '/compare/vulkan-vs-rocm',
  '/rocm-problems',
  '/troubleshoot',
  '/calculator',
  '/gpus/r9700',
  '/models/qwen36',
  '/harnesses/connect',
  '/long-context',
] as const;

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function setupLemonadeBlob(): string {
  return [
    SETUP_LEMONADE_CITED_LABEL,
    SETUP_LEMONADE_TITLE,
    ...SETUP_LEMONADE_TRACKS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_LEMONADE_STEPS.map((row) => `${row.title} ${row.body}`),
    ...SETUP_LEMONADE_QUANTS.map((row) => `${row.quant} ${row.role} ${row.lemonade} ${row.note}`),
    SETUP_LEMONADE_LOAD,
    SETUP_LEMONADE_V1,
    SETUP_LEMONADE_INSTALL,
  ].join('\n');
}

export function setupLemonadeHrefs(): string[] {
  const links = [
    ...SETUP_LEMONADE_HUB_LINKS,
    ...SETUP_LEMONADE_STEPS.flatMap((step) => step.links),
    ...SETUP_LEMONADE_SOURCES.map((source) => ({ href: source.href, label: source.title })),
  ];
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}

export function assertSetupLemonadeValid(): string[] {
  const errors: string[] = [];
  const blob = setupLemonadeBlob();
  const hrefs = new Set(setupLemonadeHrefs());
  if (SETUP_LEMONADE_CITED_LABEL !== 'Cited, not measured on local-desktop') errors.push('cited label drifted');
  if (SETUP_LEMONADE_TITLE !== 'Lemonade Server on a Radeon GPU') errors.push('title drifted');
  if (SETUP_LEMONADE_TRACKS.length !== 2) errors.push('need llama.cpp and Lemonade tracks');
  if (!SETUP_LEMONADE_TRACKS.find((row) => row.id === 'llamacpp')?.recommend) {
    errors.push('llama.cpp should be the try');
  }
  if (SETUP_LEMONADE_TRACKS.find((row) => row.id === 'lemonade')?.recommend) {
    errors.push('Lemonade must not be the first-run try');
  }
  if (SETUP_LEMONADE_STEPS.length < 8) errors.push('checklist too short');
  if (SETUP_LEMONADE_QUANTS.length !== 4) errors.push('need Q6 Q5 Q4 Q3 rows');
  if (!SETUP_LEMONADE_QUANTS.some((row) => row.quant === 'Q6_K' && !row.estimate)) {
    errors.push('Q6 row missing');
  }
  if (!SETUP_LEMONADE_QUANTS.some((row) => row.quant === 'UD-Q5_K_XL' && !row.estimate)) {
    errors.push('Q5 house row missing');
  }
  if (!SETUP_LEMONADE_QUANTS.some((row) => row.quant === 'Q4_K_M' && !row.estimate)) {
    errors.push('Q4 row missing');
  }
  if (!SETUP_LEMONADE_QUANTS.some((row) => row.quant === COMPARE_Q3 && row.estimate)) {
    errors.push('Q3 must be a labeled estimate');
  }
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (!/llama\.cpp/i.test(blob)) errors.push('must say llama.cpp');
  if (!blob.includes(SETUP_LEMONADE_V1)) errors.push('must cite :13305/api/v1');
  if (!blob.includes(SETUP_LEMONADE_HOUSE_FILE)) errors.push('must cite house GGUF');
  if (!blob.includes(SETUP_LEMONADE_PULL_Q5)) errors.push('must cite house pull shape');
  if (!blob.includes(SETUP_LEMONADE_PPA)) errors.push('must cite Ubuntu PPA');
  if (!blob.includes(SETUP_LEMONADE_RELEASE)) errors.push('must cite GitHub release');
  if (!blob.includes(SETUP_LEMONADE_RELEASE_DATE)) errors.push('must cite release date');
  if (!blob.includes('llamacpp:vulkan')) errors.push('must cite vulkan backend install');
  if (!blob.includes('llamacpp:rocm')) errors.push('must cite rocm backend install');
  if (!blob.includes('--llamacpp')) errors.push('must cite --llamacpp');
  if (!blob.includes('--ctx-size')) errors.push('must cite --ctx-size');
  if (!blob.includes('LEMONADE_LLAMACPP')) errors.push('must cite LEMONADE_LLAMACPP');
  if (!blob.includes('gfx120X')) errors.push('must cite nightly gfx120X');
  if (!blob.includes('gfx1150')) errors.push('must cite gfx1150');
  if (!blob.includes('RDNA2') || !blob.includes('RDNA3') || !blob.includes('RDNA4')) {
    errors.push('must cite Lemonade ROCm hardware sentence');
  }
  if (!blob.includes(RAM_MIN_LABEL) || !blob.includes(RAM_FULL_LABEL)) {
    errors.push('RAM lines missing');
  }
  if (!/102\.39/.test(blob)) errors.push('must cite measured llama.cpp decode');
  if (!/not inside Lemonade/i.test(blob)) errors.push('must label llama.cpp numbers as not Lemonade');
  if (/\bmeasured in Lemonade\b|\bLemonade decode \d/i.test(blob)) {
    errors.push('must not claim Lemonade tok/s');
  }
  if (!/NVMe/.test(blob)) errors.push('must mention NVMe');
  if (!/amdai runs Lemonade/i.test(blob)) errors.push('must note amdai runs Lemonade');
  for (const source of SETUP_LEMONADE_SOURCES) {
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${source.id} must be https`);
  }
  for (const required of REQUIRED_SETUP_LEMONADE_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return [...new Set(errors)];
}
