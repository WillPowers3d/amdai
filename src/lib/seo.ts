/**
 * Titles, descriptions, canonicals, noindex, and lastmod for AMDai.
 * Document titles end with " · AMDai". og:site_name is AMDai.
 * Never invent prices, ratings, or tok/s here.
 */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND, site } from './site';
import { GUIDE_UPDATED, rocmPages } from './rocm-guide';
import { amdai, amdai, type RunCard } from './run-card';
import { forumCategories } from './forum-categories';
import { canRunSeoRows } from './can-run';
import { gpuCompareSeoRows } from './gpu-compare';
import { modelCompareSeoRows } from './model-compare';

export const SITE_ORIGIN = 'https://amdai.net';
export const TITLE_SUFFIX = ` · ${BRAND}`;
export const TITLE_MAX = 60;
export const DESC_MIN = 70;
export const DESC_MAX = 160;
export const SEARCH_ACTION_TEMPLATE = `${SITE_ORIGIN}/search?q={search_term_string}`;

export const NOINDEX_EXACT = new Set([
  '/login',
  '/unsubscribe',
  '/newsletter/confirm',
  '/search',
  '/404',
  '/forum/inbox',
  '/forum/mod',
  '/forum/new',
]);

export const NOINDEX_PREFIXES = ['/account'];

export function urlPath(pathname: string): string {
  let path = pathname.split('?')[0] || '/';
  if (!path.startsWith('/')) path = `/${path}`;
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return path || '/';
}

export function shouldNoindex(pathname: string): boolean {
  const path = urlPath(pathname);
  if (NOINDEX_EXACT.has(path)) return true;
  if (path === '/account' || path.startsWith('/account/')) return true;
  if (path === '/go' || path.startsWith('/go/')) return true;
  return false;
}

export function isSitemapExcluded(pathname: string): boolean {
  return shouldNoindex(pathname);
}

export function canonicalUrl(pathname: string, origin = SITE_ORIGIN): string {
  const path = urlPath(pathname);
  return path === '/' ? `${origin}/` : `${origin}${path}`;
}

export function isNestedPath(pathname: string): boolean {
  return urlPath(pathname).split('/').filter(Boolean).length >= 2;
}

export function clipTitle(raw: string): string {
  const trimmed = raw.replace(/\s+/g, ' ').trim();
  const body = trimmed.endsWith(TITLE_SUFFIX) ? trimmed.slice(0, -TITLE_SUFFIX.length).trim() : trimmed;
  if (body.length + TITLE_SUFFIX.length <= TITLE_MAX) return body;
  const budget = TITLE_MAX - TITLE_SUFFIX.length;
  return `${body.slice(0, Math.max(8, budget - 1)).replace(/\s+\S*$/, '').trimEnd()}…`;
}

export function documentTitle(pathname: string, heading?: string): string {
  const path = urlPath(pathname);
  if (path === '/') return `${BRAND} · ${site.name}`;
  const mapped = PAGE_TITLES.get(path);
  const body = clipTitle(mapped ?? heading ?? labelFromPath(path));
  return `${body}${TITLE_SUFFIX}`;
}

export function fitDescription(raw: string, path = ''): string {
  let text = raw.replace(/\s+/g, ' ').trim();
  if (text.length < DESC_MIN) {
    const pad = ` Independent ${BRAND} notes for a home Radeon box.`;
    if ((text + pad).length <= DESC_MAX) text = `${text}${pad}`.trim();
    else text = `${text} Independent Radeon AI notes.`.trim();
  }
  if (text.length > DESC_MAX) {
    text = `${text.slice(0, DESC_MAX - 1).replace(/\s+\S*$/, '').trimEnd()}…`;
  }
  if (text.length < DESC_MIN && path) {
    text = fallbackDescription(path);
  }
  return text;
}

export function pageDescription(pathname: string, provided?: string): string {
  const path = urlPath(pathname);
  const mapped = PAGE_DESCRIPTIONS.get(path);
  if (mapped) return mapped;
  if (provided && provided !== site.description) return fitDescription(provided, path);
  return fallbackDescription(path);
}

export function fallbackDescription(pathname: string): string {
  const path = urlPath(pathname);
  const label = labelFromPath(path);
  return fitDescription(
    `${label} on AMDai — independent consumer ROCm notes from the R9700 lab, not an AMD publication.`,
    path,
  );
}

export function labelFromPath(pathname: string): string {
  const path = urlPath(pathname);
  if (path === '/') return site.name;
  const hit = CRUMB_LABELS[path];
  if (hit) return hit;
  const last = path.split('/').filter(Boolean).at(-1) ?? path;
  return last.replace(/[-_.]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const CRUMB_LABELS: Record<string, string> = {
  '/': 'Home',
  '/rocm': 'ROCm',
  '/rocm/stack': 'The stack',
  '/rocm/gfx': 'gfx IDs',
  '/rocm/vulkan-hip': 'Vulkan vs HIP',
  '/rocm/versions': 'Versions',
  '/rocm/upgrade': 'Upgrade',
  '/rocm/history': 'History',
  '/rocm/glossary': 'ROCm glossary',
  '/rocm/faq': 'ROCm FAQ',
  '/compare': 'Compare',
  '/compare/gpus': 'Compare GPUs',
  '/compare/models': 'Compare models',
  '/compare/one-vs-two-gpu': 'One vs two GPUs',
  '/compare/q4-q5-q6': 'Q6 Q5 Q4',
  '/compare/radeon-vs-nvidia': 'Radeon vs NVIDIA',
  '/compare/radeon-vs-mac': 'Radeon vs Mac',
  '/compare/vulkan-vs-rocm': 'Vulkan vs ROCm',
  '/harnesses': 'Harnesses',
  '/harnesses/compare': 'Compare harnesses',
  '/harnesses/quiz': 'Quiz',
  '/harnesses/connect': 'Connect',
  '/harnesses/agents': 'Agents',
  '/harnesses/chat': 'Chat',
  '/harnesses/image': 'Image',
  '/labs': 'Community labs',
  '/labs/shannon': 'Shannon’s lab',
  '/secure-lab': 'Secure home lab',
  '/autoresearch': 'Autoresearch',
  '/backends': 'Backends',
  '/benchmarks': 'Benchmarks',
  '/benchmarks/methodology': 'Methodology',
  '/results': 'Results',
  '/rocm-problems': 'ROCm problems',
  '/rocm-problems/help': 'How to help',
  '/rocm-problems/report': 'Report',
  '/rocm-problems/contribute': 'Contribute',
  '/rocm-problems/works': 'What works',
  '/tutorials': 'Tutorials',
  '/tutorials/install-rocm': 'Install ROCm',
  '/tutorials/verify-rocm': 'Verify ROCm',
  '/tutorials/run-local-llm': 'Run a local Qwen',
  '/tutorials/serve-qwen': 'Serve Qwen',
  '/gpus': 'GPUs',
  '/gpus/r9700': 'R9700',
  '/gpus/strix-halo': 'Strix Halo',
  '/gpus/ryzen-igpu': 'Ryzen iGPU',
  '/gpus/rx-7900-xtx': 'RX 7900 XTX',
  '/gpus/rx-7900-xt': 'RX 7900 XT',
  '/gpus/rx-7800-xt': 'RX 7800 XT',
  '/gpus/rx-9070-xt': 'RX 9070 XT',
  '/gpus/rx-9070': 'RX 9070',
  '/gpus/rx-9070-gre': 'RX 9070 GRE',
  '/gpus/rx-9060-xt': 'RX 9060 XT',
  '/gpus/rx-7900-gre': 'RX 7900 GRE',
  '/gpus/rx-7700-xt': 'RX 7700 XT',
  '/gpus/rx-7600-xt': 'RX 7600 XT',
  '/gpus/rx-7600': 'RX 7600',
  '/gpus/rx-6800-xt': 'RX 6800 XT',
  '/gpus/rx-6950-xt': 'RX 6950 XT',
  '/gpus/rx-6700-xt': 'RX 6700 XT',
  '/gpus/w7900': 'PRO W7900',
  '/gpus/w7800': 'PRO W7800',
  '/gpus/w7700': 'PRO W7700',
  '/gpus/w6800': 'PRO W6800',
  '/models': 'Models',
  '/models/qwen36': 'Qwen3.6-35B-A3B',
  '/models/flash': 'Qwen 3.8 Flash',
  '/models/gpt-oss-20b': 'gpt-oss 20B',
  '/models/gemma3-27b': 'Gemma 3 27B',
  '/models/llama33-70b': 'Llama 3.3 70B',
  '/models/glm-53-flash': 'GLM 5.3 Flash',
  '/models/qwen36-27b': 'Qwen3.6 27B',
  '/models/qwen38-27b': 'Qwen3.8 27B',
  '/recipes': 'Recipes',
  '/blog': 'Blog',
  '/updates': 'Updates',
  '/updates/matrix': 'Version matrix',
  '/forum': 'Forum',
  '/forum/c': 'Categories',
  '/forum/rules': 'Rules',
  '/forum/search': 'Forum search',
  '/account': 'Account',
  '/account/save': 'Save setup',
  '/troubleshoot': 'Troubleshoot',
  '/troubleshoot/errors': 'Error paste',
  '/glossary': 'Glossary',
  '/faq': 'FAQ',
  '/bios': 'BIOS',
  '/qwen': 'Qwen compare',
  '/qwen36-dual': '35B on two cards',
  '/flash-daily': 'Flash daily',
  '/flash-ram-offload': 'Flash RAM offload',
  '/start': 'Getting started',
  '/image-gen': 'Image gen',
  '/speech': 'Speech',
  '/long-context': 'Long context',
  '/kv-cache': 'KV cache',
  '/rag': 'RAG',
  '/vision': 'Vision',
  '/power': 'Power',
  '/fine-tuning': 'Fine-tuning',
  '/tuning': 'Tuning',
  '/speculative-decoding': 'Speculative decoding',
  '/constrained-decoding': 'Constrained decoding',
  '/guides/tool-calling': 'Tool calling',
  '/thinking': 'Thinking mode',
  '/concurrency-ab': 'Parallel slots',
  '/moe': 'MoE',
  '/can-run': 'Can my Radeon run it?',
  '/setup': 'First-run setup',
  '/setup/windows': 'Windows setup',
  '/setup/fedora': 'Fedora setup',
  '/setup/arch': 'Arch setup',
  '/setup/docker': 'Docker / Podman',
  '/setup/lm-studio': 'LM Studio',
  '/setup/coding-assistant': 'Coding assistant',
  '/setup/ollama': 'Ollama',
  '/setup/lemonade': 'Lemonade',
  '/setup/open-webui': 'Open WebUI',
  '/setup/wsl': 'WSL2',
  '/setup/comfyui': 'ComfyUI',
  '/setup/multi-gpu': 'Multi-GPU llama.cpp',
  '/setup/server': 'Always-on server',
  '/guides/buying-used-radeon': 'Buying a used Radeon',
  '/guides/quantize-gguf': 'Make GGUF quants',
  '/stack-lab': 'Stack Lab',
  '/stacks': 'Stacks',
  '/calculator': 'Calculator',
  '/budget': 'Budget',
  '/quants': 'Quants',
  '/software': 'AI software',
  '/hardware': 'Hardware',
  '/abliterated': 'Abliterated',
  '/credits': 'Credits',
  '/contribute': 'Contribute',
  '/wanted': 'Wanted',
  '/privacy': 'Privacy',
  '/disclosure': 'Disclosure',
  '/accessibility': 'Accessibility',
  '/search': 'Search',
  '/login': 'Sign in',
  '/unsubscribe': 'Unsubscribe',
  '/newsletter': 'Digest',
  '/newsletter/confirm': 'Confirm digest',
  '/multi-gpu': 'Dual / multi-GPU',
  '/about': 'About',
  '/methodology': 'How we test',
  '/contact': 'Contact',
  '/terms': 'Terms',
  '/amdai-bench': 'amdai-bench',
  '/maintain': 'Weekday scrape',
  '/troubleshooting': 'Troubleshooting',
};

export type Crumb = { name: string; href: string };

/** Intermediate segments that are not real pages. */
const SKIP_CRUMB = new Set(['/forum/c', '/forum/t', '/recipes', '/go', '/guides']);

const CRUMB_HREF: Record<string, string> = {
  '/forum/c': '/forum',
  '/forum/t': '/forum',
  '/recipes': '/models',
};

export function breadcrumbsFor(pathname: string): Crumb[] {
  const path = urlPath(pathname);
  if (path === '/') return [];
  const parts = path.split('/').filter(Boolean);
  const crumbs: Crumb[] = [{ name: 'Home', href: '/' }];
  if (parts.length === 1) {
    crumbs.push({
      name: CRUMB_LABELS[path] ?? PAGE_TITLES.get(path) ?? labelFromPath(path),
      href: path,
    });
    return crumbs;
  }
  let href = '';
  for (let i = 0; i < parts.length; i += 1) {
    href += `/${parts[i]}`;
    const isLast = i === parts.length - 1;
    if (!isLast && SKIP_CRUMB.has(href)) continue;
    const target = isLast ? path : (CRUMB_HREF[href] ?? href);
    const name =
      CRUMB_LABELS[href] ??
      CRUMB_LABELS[target] ??
      PAGE_TITLES.get(isLast ? path : target) ??
      labelFromPath(href);
    if (crumbs.some((crumb) => crumb.href === target && !isLast)) continue;
    crumbs.push({ name, href: target });
  }
  return crumbs;
}

export const PAGE_TITLES = new Map<string, string>();
export const PAGE_DESCRIPTIONS = new Map<string, string>();
export const PAGE_DATES = new Map<string, { published: string; modified: string }>();

function setMeta(path: string, title: string, description: string) {
  PAGE_TITLES.set(path, clipTitle(title));
  PAGE_DESCRIPTIONS.set(path, fitDescription(description, path));
}

function setDate(path: string, published: string, modified = published) {
  PAGE_DATES.set(path, { published: published.slice(0, 10), modified: modified.slice(0, 10) });
}

function isoDay(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === 'string') {
    const day = value.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
  }
  if (Number.isNaN(value.valueOf())) return null;
  return value.toISOString().slice(0, 10);
}

setMeta('/', `${BRAND} · ${site.name}`, site.description);
setMeta(
  '/start',
  'Getting started',
  'Check a rig or budget, first-run Ubuntu setup, then a measured 35B recipe — llama.cpp first, then benchmarks and optional Stack Lab.',
);
setDate('/start', '2026-10-13');
setMeta(
  '/setup',
  'First-run setup',
  'Ubuntu 24.04+ first token on a Radeon, plus an honest Windows path. llama.cpp first. Measured local-desktop cards, no invented tok/s.',
);
setDate('/setup', '2026-10-13');
setMeta(
  '/setup/windows',
  'Windows first-run setup',
  'Cited Windows ROCm + llama.cpp Vulkan first-run on Radeon. Ubuntu 24.04+ stays the measured AMDai path. Not measured on local-desktop.',
);
setDate('/setup/windows', '2026-10-13');
setMeta(
  '/setup/fedora',
  'Fedora first-run setup',
  'Cited Fedora ROCm + llama.cpp Vulkan. Not on the ROCm 10.1 OS row. Not verified on our rig.',
);
setDate('/setup/fedora', '2026-10-14');
setMeta(
  '/setup/arch',
  'Arch Linux first-run setup',
  'Cited Arch Wiki RADV + llama.cpp Vulkan. Not on the ROCm 10.1 OS row. Not verified on our rig.',
);
setDate('/setup/arch', '2026-10-14');
setMeta(
  '/setup/docker',
  'Run llama.cpp on Radeon in Docker or Podman',
  'Cited official llama.cpp Vulkan and ROCm images on Radeon. Localhost /v1. Not measured on local-desktop.',
);
setDate('/setup/docker', '2026-10-14');
setMeta(
  '/setup/lm-studio',
  'Run LM Studio on a Radeon GPU',
  'Cited LM Studio Vulkan or ROCm llama.cpp runtime on Radeon. Local OpenAI /v1 on :1234. Not measured on local-desktop.',
);
setDate('/setup/lm-studio', '2026-10-14');
setMeta(
  '/setup/coding-assistant',
  'Run a local coding assistant on a Radeon GPU',
  'Cited Aider, Cline, and Continue on llama-server /v1. Vulkan first. Measured 35B llama.cpp speeds, not harness tok/s.',
);
setDate('/setup/coding-assistant', '2026-10-14');
setMeta(
  '/setup/ollama',
  'Run Ollama on a Radeon GPU',
  'Cited Ollama on consumer Radeon. Linux first. llama.cpp stays the daily driver. No Ollama tok/s on AMDai.',
);
setDate('/setup/ollama', '2026-10-14');
setMeta(
  '/setup/lemonade',
  'Lemonade Server on a Radeon GPU',
  'Cited Lemonade Server on consumer Radeon. Ubuntu first. llama.cpp stays the daily driver. No Lemonade tok/s on AMDai.',
);
setDate('/setup/lemonade', '2026-10-14');
setMeta(
  '/setup/open-webui',
  'Run Open WebUI on a Radeon GPU',
  'Cited Open WebUI against llama-server /v1 on Radeon. llama.cpp first. No Open WebUI tok/s on AMDai.',
);
setDate('/setup/open-webui', '2026-10-14');
setMeta(
  '/setup/wsl',
  'Run local AI on Radeon under Windows WSL2',
  'Cited ROCm WSL2 preview on Radeon: listed cards, Ubuntu guest, llama.cpp HIP. Native Linux stays measured. Not measured on local-desktop.',
);
setDate('/setup/wsl', '2026-10-14');
setMeta(
  '/setup/comfyui',
  'Run ComfyUI on a Radeon GPU',
  'Cited ComfyUI on Radeon: Ubuntu git clone, ROCm PyTorch, first workflow. llama.cpp stays first for LLMs. No ComfyUI speeds on AMDai.',
);
setDate('/setup/comfyui', '2026-10-14');
setMeta(
  '/setup/multi-gpu',
  'Run llama.cpp across two (or more) Radeon GPUs',
  'Cited llama.cpp multi-GPU on Radeon: Vulkan and HIP device pins, --split-mode layer, --tensor-split, two-server combo. 35B split measured on local-desktop. No invented tok/s.',
);
setDate('/setup/multi-gpu', '2026-10-14');
setMeta(
  '/setup/server',
  'Always-on llama-server (systemd)',
  'Run llama.cpp as an always-on local AI server on Linux (systemd). Loopback first. Cited llama.cpp and systemd docs.',
);
setDate('/setup/server', '2026-10-14');
setMeta(
  '/guides/buying-used-radeon',
  'Buying a used Radeon for local AI',
  'Cited used-Radeon shopper guide: RDNA4 / RDNA3 / RDNA2 gfx and ROCm notes, VRAM-first 12–32 GB picker from existing fit data, Linux vetting checklist. llama.cpp first. No invented prices.',
);
setDate('/guides/buying-used-radeon', '2026-10-14');
setMeta(
  '/guides/quantize-gguf',
  'Make your own GGUF quants for a Radeon GPU with llama.cpp',
  'Make your own GGUF quants for a Radeon GPU with llama.cpp. Convert, optional imatrix, then Q6/Q5/Q4. Unsloth UD is the house default.',
);
setDate('/guides/quantize-gguf', '2026-10-14');
setMeta(
  '/image-gen',
  'Local image gen on Radeon',
  'Cited ComfyUI-first guide for Stable Diffusion, SDXL, and Flux-class models on Radeon. Linux ROCm PyTorch first. Fit estimates, not measured on local-desktop.',
);
setDate('/image-gen', '2026-10-13');
setMeta(
  '/speech',
  'Local speech on Radeon',
  'Cited whisper.cpp Vulkan STT plus Piper TTS on Radeon. Linux first. Memory from the official table. Speeds not yet measured by AMDai.',
);
setDate('/speech', '2026-10-13');
setMeta(
  '/long-context',
  'Long context on Radeon',
  'Run 128K–262K locally on Radeon. Measured 35B llama.cpp cards from local-desktop. f16 KV default. Empty cells stay not measured yet.',
);
setDate('/long-context', '2026-10-13');
setMeta(
  '/kv-cache',
  'KV cache on a Radeon GPU',
  'Cited llama.cpp KV cache on Radeon. f16 vs q8_0 vs q4_0. Measured 35B VRAM. Estimates labeled. No invented tok/s.',
);
setDate('/kv-cache', '2026-10-14');
setMeta(
  '/rag',
  'Local RAG on Radeon',
  'Chat with your own PDFs on Radeon. Cited nomic-embed Q6/Q5/Q4 plus labeled Q3. llama.cpp first. Not measured on local-desktop.',
);
setDate('/rag', '2026-10-14');
setMeta(
  '/vision',
  'Local vision on Radeon',
  'Cited llama.cpp mmproj path for image-in text-out on Radeon. Linux first. Speeds not yet measured by AMDai. Q3 is a labeled estimate.',
);
setDate('/vision', '2026-10-14');
setMeta(
  '/power',
  'Board power and PSU on Radeon',
  'Cited AMD board power (TBP) per Radeon and PSU sizing, including dual R9700. No invented watts or prices.',
);
setDate('/power', '2026-10-14');
setMeta(
  '/fine-tuning',
  'Fine-tuning on Radeon',
  'Cited LoRA / QLoRA on consumer Radeon. PyTorch ROCm, Unsloth, PEFT/TRL. Not yet measured on our R9700s. Q3 is a labeled estimate.',
);
setDate('/fine-tuning', '2026-10-14');
setMeta(
  '/tuning',
  'Speed up llama.cpp on Radeon',
  'Speed up llama.cpp on Radeon. Cited -ngl, threads, batch, -fa, KV, split, draft, power. Measured 35B cells only. Q3 is a labeled estimate.',
);
setDate('/tuning', '2026-10-14');
setMeta(
  '/speculative-decoding',
  'Speculative decoding on Radeon',
  'Speculative decoding on Radeon with llama.cpp. Cited -md flags. Measured 35B only. Draft speed not measured on local-desktop. Q3 is a labeled estimate.',
);
setDate('/speculative-decoding', '2026-10-14');
setMeta(
  '/constrained-decoding',
  'Constrained decoding on a Radeon GPU',
  'Constrained decoding on Radeon with llama.cpp. Cited GBNF and JSON schema. Measure decode vs free-form on Stack Lab grammar-ab/1. Q3 is a labeled estimate.',
);
setDate('/constrained-decoding', '2026-10-14');
setMeta(
  '/guides/tool-calling',
  'Tool calling on a Radeon GPU',
  'Tool calling on Radeon with llama.cpp. Cited --jinja, tools, JSON schema, GBNF. Measure grammar cost on Stack Lab grammar-ab/1. Q3 is a labeled estimate.',
);
setDate('/guides/tool-calling', '2026-10-14');
setMeta(
  '/thinking',
  'Thinking / reasoning mode on Radeon',
  'Thinking / reasoning mode on a Radeon GPU with llama.cpp. Cited --reasoning and Qwen3.6 enable_thinking. Tokens not measured on local-desktop.',
);
setDate('/thinking', '2026-10-14');
setMeta(
  '/concurrency-ab',
  'Parallel slots (-np) on a Radeon GPU',
  'Parallel slots (-np) on a Radeon GPU with llama.cpp. Cited --parallel. Measure Stack Lab concurrency-ab/1. Q3 is a labeled estimate.',
);
setDate('/concurrency-ab', '2026-10-14');
setMeta(
  '/moe',
  'Mixture-of-Experts on a Radeon GPU',
  'Mixture-of-Experts on a Radeon GPU. Why 35B-A3B fits one 32 GB R9700 while dense 27B and Flash differ. llama.cpp first. Q3 is a labeled estimate.',
);
setDate('/moe', '2026-10-14');
setMeta(
  '/stacks',
  'Recommended stacks',
  'Daily-driver Qwen and the Flash agent stack from the two-R9700 lab. Measured cards, no invented tok/s.',
);
setMeta(
  '/qwen',
  'Qwen 3.6 / 3.8 compare',
  'Every current Qwen 3.6 and 3.8 file × quant on AMDai, with measured cells from official local-desktop run cards.',
);
setMeta(
  '/compare',
  'Compare 35B on local-desktop',
  'Cited 35B decisions from official local-desktop llama.cpp cards: one GPU versus split, and Q6 / Q5 / Q4 plus a labeled Q3 estimate.',
);
setMeta(
  '/compare/one-vs-two-gpu',
  'One R9700 vs two',
  'Qwen3.6-35B-A3B on local-desktop: one R9700 versus a split across both cards — decode, prefill, VRAM, and RAM from run cards.',
);
setMeta(
  '/compare/q4-q5-q6',
  'Q6 vs Q5 vs Q4',
  'Same 35B on local-desktop at Q6_K, UD-Q5_K_XL, Q5_K_M, and Q4_K_M, plus a labeled UD-Q3_K_XL estimate. 1-GPU or split.',
);
setMeta(
  '/compare/radeon-vs-nvidia',
  'Radeon vs NVIDIA',
  'Cited Radeon vs NVIDIA for a local LLM: vendor specs, measured R9700 35B, and an honest CUDA vs ROCm software split. No invented prices.',
);
setDate('/compare/radeon-vs-nvidia', '2026-10-13');
setMeta(
  '/compare/radeon-vs-mac',
  'Radeon vs Mac',
  'Radeon vs Mac (Apple Silicon) for local LLMs. Cited AMD/Apple specs. Measured R9700 35B. Mac speed stays not measured here. Q3 is a labeled estimate.',
);
setDate('/compare/radeon-vs-mac', '2026-10-14');
setMeta(
  '/compare/vulkan-vs-rocm',
  'llama.cpp on Radeon: Vulkan vs ROCm (HIP)',
  'llama.cpp on Radeon: Vulkan vs ROCm (HIP). Why the house 35B daily driver is Vulkan. HIP stays a cited second compile. Q3 is a labeled estimate.',
);
setDate('/compare/vulkan-vs-rocm', '2026-10-14');
for (const row of gpuCompareSeoRows()) {
  CRUMB_LABELS[row.path] = row.title;
  setMeta(row.path, row.title, row.description);
  setDate(row.path, row.published);
}
for (const row of modelCompareSeoRows()) {
  CRUMB_LABELS[row.path] = row.title;
  setMeta(row.path, row.title, row.description);
  setDate(row.path, row.published);
}
for (const row of canRunSeoRows()) {
  CRUMB_LABELS[row.path] = row.title;
  setMeta(row.path, row.title, row.description);
  setDate(row.path, row.published);
}
setMeta(
  '/qwen36-dual',
  '35B on two R9700s',
  'Split versus two copies of UD-Q5_K_XL on two R9700s — soak and concurrency from official local-desktop cards.',
);
setMeta(
  '/multi-gpu',
  'Dual / multi-GPU',
  'When a second Radeon AI PRO R9700 helps or hurts: llama.cpp first, measured local-desktop 35B and Flash, plus cited PCIe and PSU. No invented tok/s.',
);
setDate('/multi-gpu', '2026-10-13');
setMeta(
  '/flash-daily',
  'Flash daily driver',
  'Qwen 3.8 Flash VRAM and DDR5 offload at Q3–Q6, full 262K. Pending DDR5 rerun is labeled on the page.',
);
setMeta(
  '/flash-ram-offload',
  'Flash RAM offload',
  'Run Flash with experts on DDR5: kit sizes, measured DIMM speed, and the launch shape. No invented GB.',
);
setMeta(
  '/benchmarks',
  '35B llama.cpp matrix',
  'Qwen3.6-35B-A3B on llama.cpp Vulkan: UD-Q5, Q5, Q4, and Q6 at 4K–256K, one GPU and split. Decode, prefill, VRAM, and RAM from official local-desktop run cards.',
);
setMeta(
  '/benchmarks/methodology',
  'Bench methodology',
  'How AMDai scores a local-AI recipe: load, chat, reasoning, tools, long context, and speed. Pass, fail, or not measured.',
);
setMeta(
  '/results',
  'Official run cards',
  'amdai-bench/run@1 cards from overnight local-desktop tests — credited to amdai, with the exact launch command.',
);
setMeta(
  '/budget',
  'Setup by budget',
  'Starter through two-R9700 Pro builds for local Qwen. Size and speed, never a live or invented price.',
);
setMeta(
  '/calculator',
  'Quant + hardware calc',
  'Size a GGUF, ask what a Radeon can run, or read a speed floor — Q3 through BF16, client-side, no prices.',
);
setMeta(
  '/quants',
  'Quants Q3–Q8',
  'Q3 through Q8, Unsloth UD dynamic files, KV types, and why Q1/Q2 stay off this notebook.',
);
setMeta(
  '/gpus',
  'GPU directory',
  'Radeon cards with gfx IDs, VRAM, official ROCm rows, and tested recipes. Spec-only cards stay labeled.',
);
setMeta(
  '/gpus/r9700',
  'Radeon AI PRO R9700',
  'Measured 35B llama.cpp on the Radeon AI PRO R9700 — 32 GB VRAM, one GPU vs two, cited decode and prefill from local-desktop run cards.',
);
setDate('/gpus/r9700', '2026-10-13');
setMeta(
  '/gpus/strix-halo',
  'Ryzen AI Max / Strix Halo',
  'Cited Ryzen AI Max+ 395 (Radeon 8060S, gfx1151) local-AI guide. Shared system memory, llama.cpp Vulkan first. Not measured on local-desktop.',
);
setDate('/gpus/strix-halo', '2026-10-13');
setMeta(
  '/gpus/ryzen-igpu',
  'Local AI on a Ryzen iGPU',
  'Cited Ryzen 780M / 760M (gfx1103) and 880M / 890M (gfx1150) local-AI guide. Shared system RAM, llama.cpp Vulkan first. Not measured on local-desktop.',
);
setDate('/gpus/ryzen-igpu', '2026-10-14');
setMeta(
  '/gpus/rx-7900-xtx',
  'RX 7900 XTX',
  'RX 7900 XTX recipe sheet — 24 GB, gfx1100, cited ROCm matrix row. 35B Q6/Q5/Q4 VRAM fit estimates; UD-Q3_K_XL labeled estimate. Not measured on local-desktop.',
);
setDate('/gpus/rx-7900-xtx', '2026-10-14');
setMeta(
  '/gpus/rx-7900-xt',
  'RX 7900 XT',
  'RX 7900 XT recipe sheet — 20 GB, gfx1100, cited ROCm matrix row. 35B Q6/Q5/Q4 VRAM fit estimates; UD-Q3_K_XL labeled estimate. Not measured on local-desktop.',
);
setDate('/gpus/rx-7900-xt', '2026-10-14');
setMeta(
  '/gpus/rx-7800-xt',
  'RX 7800 XT',
  'RX 7800 XT recipe sheet — 16 GB, gfx1101, cited ROCm matrix row. 35B Q6/Q5/Q4 VRAM fit estimates; UD-Q3_K_XL labeled estimate. Not measured on local-desktop.',
);
setDate('/gpus/rx-7800-xt', '2026-10-14');
setMeta(
  '/gpus/rx-9070-xt',
  'RX 9070 XT',
  'RX 9070 XT recipe sheet — 16 GB, gfx1201, cited ROCm matrix row. 35B Q6/Q5/Q4 VRAM fit estimates; UD-Q3_K_XL labeled estimate. Not measured on local-desktop.',
);
setDate('/gpus/rx-9070-xt', '2026-10-13');
setMeta(
  '/gpus/rx-9060-xt',
  'RX 9060 XT',
  'RX 9060 XT recipe sheet — 16 GB, gfx1200, cited ROCm matrix row. 35B Q6/Q5/Q4 VRAM fit estimates; UD-Q3_K_XL labeled estimate. Not measured on local-desktop.',
);
setDate('/gpus/rx-9060-xt', '2026-10-13');
setMeta(
  '/gpus/rx-7900-gre',
  'RX 7900 GRE',
  'RX 7900 GRE recipe sheet — 16 GB, gfx1100, cited ROCm matrix row. 35B Q6/Q5/Q4 VRAM fit estimates; UD-Q3_K_XL labeled estimate. Not measured on local-desktop.',
);
setDate('/gpus/rx-7900-gre', '2026-10-13');
setMeta(
  '/gpus/rx-7700-xt',
  'RX 7700 XT',
  'RX 7700 XT recipe sheet — 12 GB, gfx1101, cited ROCm matrix row. 35B Q6/Q5/Q4 VRAM fit estimates; UD-Q3_K_XL labeled estimate. Not measured on local-desktop.',
);
setDate('/gpus/rx-7700-xt', '2026-10-13');
setMeta(
  '/gpus/rx-7600-xt',
  'RX 7600 XT',
  'RX 7600 XT recipe sheet — 16 GB, gfx1102, cited ROCm matrix row. 35B Q6/Q5/Q4 VRAM fit estimates; UD-Q3_K_XL labeled estimate. Not measured on local-desktop.',
);
setDate('/gpus/rx-7600-xt', '2026-10-13');
setMeta(
  '/gpus/rx-7600',
  'RX 7600',
  'RX 7600 recipe sheet — 8 GB, gfx1102, cited ROCm matrix row. 35B Q6/Q5/Q4 VRAM fit estimates; UD-Q3_K_XL labeled estimate. Not measured on local-desktop.',
);
setDate('/gpus/rx-7600', '2026-10-13');
setMeta(
  '/gpus/rx-6800-xt',
  'RX 6800 XT',
  'RX 6800 XT recipe sheet — 16 GB, gfx1030, cited RDNA 2 directory row. 35B Q6/Q5/Q4 VRAM fit estimates; UD-Q3_K_XL labeled estimate. Not measured on local-desktop.',
);
setDate('/gpus/rx-6800-xt', '2026-10-14');
setMeta(
  '/gpus/rx-6700-xt',
  'RX 6700 XT',
  'RX 6700 XT recipe sheet — 12 GB, gfx1031, cited RDNA 2 directory row. 35B Q6/Q5/Q4 VRAM fit estimates; UD-Q3_K_XL labeled estimate. Not measured on local-desktop.',
);
setDate('/gpus/rx-6700-xt', '2026-10-14');
setMeta(
  '/gpus/rx-9070',
  'RX 9070',
  'RX 9070 recipe sheet — 16 GB, gfx1201, cited ROCm matrix row. 35B Q6/Q5/Q4 VRAM fit estimates; UD-Q3_K_XL labeled estimate. Not measured on local-desktop.',
);
setDate('/gpus/rx-9070', '2026-10-14');
setMeta(
  '/gpus/rx-9070-gre',
  'RX 9070 GRE',
  'RX 9070 GRE recipe sheet — 12 GB, gfx1201, cited ROCm matrix row. 35B Q6/Q5/Q4 VRAM fit estimates; UD-Q3_K_XL labeled estimate. Not measured on local-desktop.',
);
setDate('/gpus/rx-9070-gre', '2026-10-14');
setMeta(
  '/gpus/rx-6950-xt',
  'RX 6950 XT',
  'RX 6950 XT / 6900 XT sheet — 16 GB gfx1030 RDNA 2. 35B Q6/Q5/Q4 fit estimates; UD-Q3_K_XL labeled estimate. Not measured on local-desktop.',
);
setDate('/gpus/rx-6950-xt', '2026-10-14');
setMeta(
  '/gpus/w7900',
  'PRO W7900',
  'PRO W7900 recipe sheet — 48 GB, gfx1100, cited ROCm matrix row. Q6/Q5/Q4 plus labeled UD-Q3_K_XL; 1 and 2 GPU estimates. Not measured on local-desktop.',
);
setDate('/gpus/w7900', '2026-10-14');
setMeta(
  '/gpus/w7800',
  'PRO W7800',
  'PRO W7800 recipe sheet — 32 GB, gfx1100, cited ROCm matrix row. Q6/Q5/Q4 plus labeled UD-Q3_K_XL; 1 and 2 GPU estimates. Not measured on local-desktop.',
);
setDate('/gpus/w7800', '2026-10-14');
setMeta(
  '/gpus/w7700',
  'PRO W7700',
  'PRO W7700 recipe sheet — 16 GB, gfx1101, cited ROCm matrix row. Q6/Q5/Q4 plus labeled UD-Q3_K_XL; 1 and 2 GPU estimates. Not measured on local-desktop.',
);
setDate('/gpus/w7700', '2026-10-14');
setMeta(
  '/gpus/w6800',
  'PRO W6800',
  'PRO W6800 recipe sheet — 32 GB, gfx1030, cited ROCm matrix row. Q6/Q5/Q4 plus labeled UD-Q3_K_XL; 1 and 2 GPU estimates. Not measured on local-desktop.',
);
setDate('/gpus/w6800', '2026-10-14');
setMeta(
  '/models',
  'Models',
  'House Qwen recipes plus cited open-weight pages — gpt-oss, Gemma 3, Llama 3.3, GLM 5.3 Flash, Qwen 27B. Reverse view of the GPU directory. Q3 is a labeled estimate.',
);
setDate('/models', '2026-10-14');
setMeta(
  '/models/qwen36',
  'Qwen3.6-35B-A3B',
  'Qwen3.6-35B-A3B on one R9700 — Unsloth UD-Q5_K_XL, llama.cpp Vulkan, 262K. Measured local-desktop cards; Q3 is a labeled estimate.',
);
setDate('/models/qwen36', '2026-10-13');
setMeta(
  '/models/flash',
  'Qwen 3.8 Flash',
  'House recipe page for Qwen 3.8 Flash: cited UD-Q6_K_XL pair, two-card Q6, RAM lines, llama.cpp first. Q3 is a labeled estimate.',
);
setDate('/models/flash', '2026-10-13');
setMeta(
  '/models/gpt-oss-20b',
  'gpt-oss 20B',
  'gpt-oss 20B (21.5B / 3.6B active) on Radeon — cited Unsloth GGUF sizes, llama.cpp first. Not yet measured on our R9700s. Q3 is a labeled estimate.',
);
setDate('/models/gpt-oss-20b', '2026-10-14');
setMeta(
  '/models/gemma3-27b',
  'Gemma 3 27B',
  'Gemma 3 27B on Radeon — cited Unsloth Q6/Q5/Q4 GGUF sizes, 128K card context, llama.cpp first. Not yet measured on our R9700s. Q3 is a labeled estimate.',
);
setDate('/models/gemma3-27b', '2026-10-14');
setMeta(
  '/models/llama33-70b',
  'Llama 3.3 70B',
  'Llama 3.3 70B on Radeon — cited bartowski Q6/Q5/Q4 GGUF sizes, llama.cpp first. Not yet measured on our R9700s. Q3 is a labeled estimate.',
);
setDate('/models/llama33-70b', '2026-10-14');
setMeta(
  '/models/glm-53-flash',
  'GLM 5.3 Flash',
  'GLM 5.3 Flash (320B / 18B active) on Radeon — cited Unsloth UD-Q6/Q5/Q4 GGUF sizes, llama.cpp first. Not yet measured on our R9700s. Q3 is a labeled estimate.',
);
setDate('/models/glm-53-flash', '2026-10-14');
setMeta(
  '/models/qwen36-27b',
  'Qwen3.6 27B',
  'Qwen3.6 27B on Radeon — cited Unsloth Q6/Q5/Q4 GGUF sizes, 262K card context, llama.cpp first. Not yet measured on our R9700s. Q3 is a labeled estimate.',
);
setDate('/models/qwen36-27b', '2026-10-14');
setMeta(
  '/models/qwen38-27b',
  'Qwen3.8 27B',
  'Qwen3.8 27B on Radeon — cited Unsloth UD-Q6/Q5/Q4 GGUF sizes, 262K card context, llama.cpp first. Not yet measured on our R9700s. Q3 is a labeled estimate.',
);
setDate('/models/qwen38-27b', '2026-10-14');
setMeta(
  '/rocm',
  'What is ROCm',
  'AMD’s GPU compute stack in plain English, why it sits next to CUDA, and what that means on a home Radeon.',
);
setMeta(
  '/rocm-problems',
  'ROCm problems',
  'Open consumer ROCm issues we track with citations — and how you can help. No invented workarounds.',
);
setMeta(
  '/backends',
  'Which backend?',
  'Inference engines for a home Radeon box. llama.cpp first; Strata when you need the Flash agent path.',
);
setMeta(
  '/software',
  'AI software on AMD',
  'llama.cpp first on a home Radeon; vLLM and Strata as labeled tries. Pins are dated snapshots.',
);
setMeta(
  '/abliterated',
  'Abliterated models',
  'What abliteration is, how to vet a file, and the educational catalog. Official instruct stays first.',
);
setMeta(
  '/harnesses',
  'Harnesses',
  'What to plug a local Qwen into after tokens work — agents, chat UIs, and ComfyUI. llama.cpp first.',
);
setMeta(
  '/hardware',
  'Hardware and power',
  'PSU, cooling, noise, and VRAM versus model size for a home Radeon AI box. Cited or not recorded.',
);
setDate('/hardware', '2026-10-13');
setMeta(
  '/labs',
  'Community labs',
  'Cited home-lab write-ups that are not measured on local-desktop. Shannon’s How I run my Lab is the first. Not measured by AMDai.',
);
setDate('/labs', '2026-10-13');
setMeta(
  '/labs/shannon',
  'Shannon’s lab',
  'Cited write-up from Shannon (@iamMrDuncan), How I run my Lab, Oct 12 2026. Not measured by AMDai. No invented numbers.',
);
setDate('/labs/shannon', '2026-10-13');
setMeta(
  '/secure-lab',
  'Secure home lab',
  'Cited secure-lab layout from Shannon’s How I run my Lab — isolated enclave, Proxmox split, guardrails, separate NVMe, offsite backup. Not measured by AMDai.',
);
setDate('/secure-lab', '2026-10-13');
setMeta(
  '/autoresearch',
  'Autoresearch idea',
  'Cited idea for amdai-bench — container per GPU, automatic experiments, Prometheus/Grafana, bot steering. Not measured by AMDai.',
);
setDate('/autoresearch', '2026-10-13');
setMeta(
  '/bios',
  'BIOS for local AI',
  'Above 4G, Resizable BAR/SAM, CSM off, x8/x8 vs x16/x4, EXPO/XMP, IOMMU. Cited chipset notes only.',
);
setMeta(
  '/stack-lab',
  'Radeon Stack Lab',
  'Ubuntu 24.04+ companion for AMDai: check a rig, apply recipes, record amdai-bench cards. Packages are not published yet.',
);
setDate('/stack-lab', '2026-10-13');
setMeta(
  '/tutorials',
  'Tutorials',
  'Practical how-tos: install ROCm, verify the GPU, run a local Qwen, then serve it on the R9700.',
);
setMeta(
  '/troubleshooting',
  'Troubleshooting',
  'GPU not seen, wrong wheel, CPU fallback, and other home-lab ROCm failures with cited patterns.',
);
setMeta(
  '/troubleshoot',
  'Troubleshoot',
  'Symptom-first fixes for a broken or slow Radeon local-AI box — rocminfo empty, install, OOM, wrong GPU, MODE1, DDR5, Windows. Cited only.',
);
setDate('/troubleshoot', '2026-10-13');
setMeta(
  '/troubleshoot/errors',
  'Error paste',
  'Paste a ROCm or Ollama log and match it against cited patterns. We do not invent a fix.',
);
setMeta(
  '/updates',
  'Updates',
  'Dated ROCm, llama.cpp, and vLLM snapshots plus RSS. The home card is the current recommendation.',
);
setMeta(
  '/updates/matrix',
  'Version matrix',
  'ROCm × llama.cpp × vLLM × card, cited or marked no data. Dated snapshot, not eternal law.',
);
setMeta(
  '/faq',
  'FAQ',
  'AMDai FAQ: what this notebook is, R9700 32 GB, llama.cpp vs Strata, Q6/Q5/Q4, RAM, Open in Stack Lab, run cards, and affiliate notes.',
);
setMeta(
  '/glossary',
  'Glossary',
  'Plain-English jargon for a home Radeon box — ROCm, GGUF, Q3–Q6, KV cache, llama.cpp, and run cards.',
);
setMeta(
  '/blog',
  'Blog',
  'Longer home-lab notes and succinct ROCm version essays. Living tracker, not a frozen manual.',
);
setMeta(
  '/forum',
  'Forum',
  'Community threads for local Radeon AI. Off on this static build unless FORUM_ENABLED is set.',
);
setMeta(
  '/forum/rules',
  'Forum rules',
  'How AMDai forum threads should be sourced: cite a log, no invented tok/s, Q3 labeled estimate.',
);
setMeta(
  '/forum/search',
  'Search the forum',
  'Find forum threads by title, body, or a troubleshooter pattern. Off unless the forum is enabled.',
);
setMeta(
  '/forum/new',
  'New thread',
  'Start a forum thread and attach a saved rig so helpers see GPU, ROCm, and backend. Off unless enabled.',
);
setMeta(
  '/forum/inbox',
  'Forum inbox',
  'On-site reply notices for the AMDai forum. Email is opt-in. This page is not indexed.',
);
setMeta(
  '/forum/mod',
  'Forum moderation',
  'Reports and audit log for the AMDai forum. Mods and admins only. This page is not indexed.',
);
setMeta(
  '/account',
  'My rig',
  'Optional saved computer configs and stack-update alerts. Off unless ACCOUNTS_ENABLED is set.',
);
setMeta(
  '/account/save',
  'Save this setup',
  'Turn a calculator or budget share link into a saved rig. Off unless accounts are enabled.',
);
setMeta(
  '/login',
  'Sign in',
  'Optional login for saved rigs and stack-update alerts. Off on the public static build.',
);
setMeta(
  '/unsubscribe',
  'Unsubscribe',
  'Stop optional stack-update emails and the AMDai Lab Notes digest. One click, no login.',
);
setMeta(
  '/newsletter',
  'Lab Notes digest',
  'Email-only AMDai Lab Notes digest: new run cards, guides, ROCm problems, and Stack Lab. Double opt-in, no account.',
);
setMeta(
  '/newsletter/confirm',
  'Confirm digest',
  'Confirm the AMDai Lab Notes digest from the link in mail. This page is not indexed.',
);
setMeta(
  '/search',
  'Search',
  'Pagefind search over the AMDai notebook. The index is built at npm run build; this URL is noindex.',
);
setMeta(
  '/404',
  'Page not found',
  'That path is not on AMDai. Try Getting started, Search, or the GPU directory from the header.',
);
setMeta(
  '/about',
  'About AMDai',
  'Who runs AMDai, what the local-desktop Radeon test rig is, editorial independence, and how affiliate links work.',
);
setDate('/about', '2026-10-13');
setMeta(
  '/methodology',
  'How we test',
  'How AMDai produces measured tok/s (amdai-bench/run@1), how estimates are labeled including Q3, and how citations and corrections work.',
);
setDate('/methodology', '2026-10-13');
setMeta(
  '/contact',
  'Contact',
  'Honest AMDai contact routes: contribute a sourced recipe, ROCm problems, and the forum. No invented inbox.',
);
setDate('/contact', '2026-10-13');
setMeta(
  '/terms',
  'Terms of use',
  'Short AMDai terms: informational content, not legal advice, no warranty, hardware/BIOS at your risk, affiliate and privacy links.',
);
setDate('/terms', '2026-10-13');
setMeta(
  '/amdai-bench',
  'amdai-bench',
  'amdai-bench/run@1 is the first-party measurement schema on AMDai — schema JSON, run dump, and the pages that print those cards.',
);
setDate('/amdai-bench', '2026-10-13');
setDate('/rss.xml', '2026-10-13');
setMeta(
  '/privacy',
  'Privacy',
  'What optional AMDai accounts and the Lab Notes digest store — email, topics, timestamps. No tracking pixel.',
);
setMeta(
  '/contribute',
  'Contribute a recipe',
  'Submit a Radeon recipe as JSON with a log. No invented tok/s, no bounty amounts.',
);
setMeta(
  '/wanted',
  'Wanted recipes',
  'Radeon × model gaps we want sourced recipes for. No bounty amounts and no invented speeds.',
);
setMeta(
  '/credits',
  'Credits',
  'Sybil / 0xSero attribution for the recipe idea, the local-desktop first-party set credited to amdai, and Shannon’s cited lab write-up.',
);
setMeta(
  '/disclosure',
  'Affiliate disclosure',
  'Amazon Associates, Rakuten, and B&H when those IDs are set. We never show a live or stale price.',
);
setMeta(
  '/accessibility',
  'Accessibility',
  'What AMDai tests for keyboard, screen-reader, and mobile access — and how to report a problem.',
);
setMeta(
  '/maintain',
  'Weekday scrape',
  'How the living status card is refreshed: cited sources only, no invented version pins or tok/s.',
);

for (const page of rocmPages) {
  if (page.id === 'overview') continue;
  const title =
    page.id === 'glossary' ? 'ROCm glossary' : page.id === 'faq' ? 'ROCm FAQ' : page.title;
  setMeta(page.href, title, page.description);
  setDate(page.href, GUIDE_UPDATED.toISOString(), GUIDE_UPDATED.toISOString());
}
setDate('/rocm', GUIDE_UPDATED.toISOString(), GUIDE_UPDATED.toISOString());

for (const cat of forumCategories) {
  CRUMB_LABELS[`/forum/c/${cat.slug}`] = cat.title;
  setMeta(
    `/forum/c/${cat.slug}`,
    `Forum: ${cat.title}`.slice(0, 51),
    `${cat.title} on the AMDai forum — ${cat.blurb} Off unless the forum is enabled.`,
  );
}

setMeta(
  '/tutorials/install-rocm',
  'Install ROCm',
  'ROCm 10.1.0 on a home Radeon AI PRO R9700: official Ubuntu rows, ROCm CLI v0.2.0, and a do-not-mix-apt tree.',
);
setMeta(
  '/tutorials/verify-rocm',
  'Verify GPU and ROCm',
  'Confirm the kernel sees the Radeon, rocminfo prints the gfx ID, and you are not on a CPU fallback.',
);
setMeta(
  '/tutorials/run-local-llm',
  'Run a local Qwen',
  'Load the daily-driver Qwen GGUF in llama.cpp Vulkan on one R9700. Official instruct first.',
);
setMeta(
  '/tutorials/serve-qwen',
  'Serve Qwen on R9700',
  'Stand up a loopback /v1 for harnesses after llama.cpp is generating tokens on the R9700.',
);

setMeta(
  '/blog/living-status-not-gospel',
  'The weekly card',
  'Why the AMDai home card is a dated snapshot, not scripture — pins move, and we write the date.',
);
setMeta(
  '/blog/rocm-versions-are-a-matching-problem',
  'ROCm version matching',
  'ROCm versions are a matching problem: driver, runtime, wheels, and the gfx target have to agree.',
);
setMeta(
  '/blog/the-name-is-radeon-ai-pro-r9700',
  'The R9700 name',
  'The product is AMD Radeon AI PRO R9700. There is no consumer RX 9700 in the current lineup.',
);
setMeta(
  '/blog/vulkan-is-an-on-ramp',
  'Vulkan is an on-ramp',
  'llama.cpp Vulkan is a real path on Radeon, not a consolation prize, and HIP is a different job.',
);

setMeta(
  '/harnesses/compare',
  'Compare harnesses',
  'Agent, chat, and image UIs next to each other. Tokens on the GPU come first; the harness is optional.',
);
setMeta(
  '/harnesses/quiz',
  'Harness quiz',
  'Answer four questions and get one harness pick. Local llama.cpp first; hybrid stays labeled.',
);
setMeta(
  '/harnesses/connect',
  'Connect a harness',
  'Point a harness at the loopback /v1 after llama.cpp or Strata is serving. Copy the snippet, then verify.',
);
setMeta(
  '/harnesses/agents',
  'Agent harnesses',
  'Hermes, OpenClaw, and other agents that talk to a local /v1. Not a substitute for working tokens.',
);
setMeta(
  '/harnesses/chat',
  'Chat harnesses',
  'Chat UIs that wrap a local llama.cpp or Strata server. The engine still has to see the GPU.',
);
setMeta(
  '/harnesses/image',
  'Image harnesses',
  'ComfyUI on Radeon. Shopper guide at /image-gen. Cite what you ran; this notebook’s measured work is text Qwen.',
);

setMeta(
  '/rocm-problems/help',
  'Help on ROCm issues',
  'How to help the AMDai ROCm problem tracker: reproduce, cite, and send a log. No invented fixes.',
);
setMeta(
  '/rocm-problems/report',
  'Report a ROCm issue',
  'File a cited consumer ROCm problem. We keep not-recorded rows empty instead of guessing.',
);
setMeta(
  '/rocm-problems/contribute',
  'Contribute a problem',
  'Add a sourced ROCm tracker row — GPU, OS, version, and a link. No bounty amounts.',
);
setMeta(
  '/rocm-problems/works',
  'What still works',
  'Cited workarounds and setups that still run on a home Radeon. Labeled, not a guarantee.',
);

function hereDir() {
  return dirname(fileURLToPath(import.meta.url));
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function parseFrontmatter(file: string): Record<string, string> {
  const text = readFileSync(file, 'utf8');
  const fence = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fence) return {};
  const data: Record<string, string> = {};
  for (const line of fence[1].split('\n')) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) data[match[1]!] = match[2]!.replace(/^["']|["']$/g, '').trim();
  }
  return data;
}

function loadContentDates() {
  const root = existsSync(join(process.cwd(), 'src/content'))
    ? join(process.cwd(), 'src/content')
    : join(hereDir(), '../content');
  for (const file of walk(root)) {
    if (!/\.(md|mdx)$/.test(file)) continue;
    const rel = file.slice(root.length).replaceAll('\\', '/').replace(/^\//, '');
    const fm = parseFrontmatter(file);
    const published = isoDay(fm.pubDate ?? fm.date ?? fm.updated);
    const modified = isoDay(fm.updated ?? fm.pubDate ?? fm.date);
    if (!published) continue;
    let path = '';
    if (rel.startsWith('guides/')) {
      const id = rel.slice('guides/'.length).replace(/\.(md|mdx)$/, '');
      if (id === 'rocm' || id === 'abliterated' || id === 'harnesses' || id === 'gpus' || id === 'stack-lab') continue;
      path = `/${id}`;
    } else if (rel.startsWith('tutorials/')) {
      path = `/tutorials/${rel.slice('tutorials/'.length).replace(/\.(md|mdx)$/, '')}`;
    } else if (rel.startsWith('blog/')) {
      path = `/blog/${rel.slice('blog/'.length).replace(/\.(md|mdx)$/, '')}`;
    } else {
      continue;
    }
    setDate(path, published, modified ?? published);
    if (fm.title && !PAGE_TITLES.has(path)) setMeta(path, fm.title, fm.description ?? fm.summary ?? fallbackDescription(path));
    if (fm.description && !PAGE_DESCRIPTIONS.has(path)) {
      PAGE_DESCRIPTIONS.set(path, fitDescription(fm.description, path));
    }
  }
}

loadContentDates();

export function registerRunCardMeta(cards: RunCard[]) {
  for (const card of cards) {
    const path = `/results/${card.run_id}`;
    const ctx =
      card.config.context_tokens >= 1000
        ? `${card.config.context_tokens / 1000}K`
        : `${card.config.context_tokens}`;
    const gpus = `${card.hardware.gpu_count_used}×`;
    const shortId = card.run_id.replace(/^local-desktop-/, '');
    const title = clipTitle(`${card.model.quant} ${ctx} ${gpus} ${shortId}`.replace(/\s+/g, ' '));
    const who = card.submitted_by.display;
    const desc = fitDescription(
      `${card.model.quant} ${card.model.name} at ${ctx} on ${gpus} R9700. Official ${card.schema} card ${card.run_id} by ${who} on ${card.submitted_by.rig}.`,
      path,
    );
    setMeta(path, title, desc);
    const published = isoDay(card.started_at) ?? isoDay(card.finished_at) ?? dateFromRunId(card.run_id);
    const modified = isoDay(card.finished_at) ?? published;
    if (published) setDate(path, published, modified ?? published);
  }
}

export function dateFromRunId(runId: string): string | null {
  const match = runId.match(/20(\d{2})(\d{2})(\d{2})/);
  if (!match) return null;
  return `20${match[1]}-${match[2]}-${match[3]}`;
}

export function datasetCoverage(cards: RunCard[]): { start: string; end: string } | null {
  const days: string[] = [];
  for (const card of cards) {
    const start = isoDay(card.started_at);
    const end = isoDay(card.finished_at);
    if (start) days.push(start);
    if (end) days.push(end);
    const fromId = dateFromRunId(card.run_id);
    if (fromId) days.push(fromId);
  }
  if (!days.length) return null;
  days.sort();
  return { start: days[0]!, end: days[days.length - 1]! };
}

const gitDayCache = new Map<string, string | null>();

function gitDay(rel: string): string | null {
  if (gitDayCache.has(rel)) return gitDayCache.get(rel) ?? null;
  try {
    const out = execSync(`git log -1 --format=%cs -- ${rel}`, {
      encoding: 'utf8',
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const day = /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null;
    gitDayCache.set(rel, day);
    return day;
  } catch {
    gitDayCache.set(rel, null);
    return null;
  }
}

export function lastmodFor(pathname: string): string | undefined {
  const path = urlPath(pathname);
  const hit = PAGE_DATES.get(path);
  if (hit) return hit.modified;
  if (path.startsWith('/rocm')) return isoDay(GUIDE_UPDATED) ?? undefined;
  const rels =
    path === '/'
      ? ['src/pages/index.astro']
      : [`src/pages${path}.astro`, `src/pages${path}/index.astro`, `src/content/guides${path}.mdx`];
  for (const rel of rels) {
    const day = gitDay(rel);
    if (day) return day;
  }
  return gitDay('src') ?? gitDay('.') ?? undefined;
}

export function articleDates(pathname: string): { published: string; modified: string } | null {
  const path = urlPath(pathname);
  return PAGE_DATES.get(path) ?? (path.startsWith('/rocm') ? {
    published: GUIDE_UPDATED.toISOString().slice(0, 10),
    modified: GUIDE_UPDATED.toISOString().slice(0, 10),
  } : null);
}

export const DATASET_CREATOR = {
  name: amdai.display,
  alternateName: [amdai.handle, amdai.handle, amdai.display, amdai.rig],
} as const;

/** Run-card notes are first-party lab measurements published on amdai.net. */
export const DATASET_LICENSE = `${SITE_ORIGIN}/credits`;

export function ensureUniqueMeta() {
  const titles = new Map<string, string[]>();
  const descs = new Map<string, string[]>();
  for (const [path, title] of PAGE_TITLES) {
    const full = path === '/' ? `${BRAND} · ${site.name}` : `${title}${TITLE_SUFFIX}`;
    const list = titles.get(full) ?? [];
    list.push(path);
    titles.set(full, list);
  }
  for (const [path, desc] of PAGE_DESCRIPTIONS) {
    const list = descs.get(desc) ?? [];
    list.push(path);
    descs.set(desc, list);
  }
  for (const [, paths] of titles) {
    if (paths.length < 2) continue;
    for (let i = 1; i < paths.length; i += 1) {
      const path = paths[i]!;
      PAGE_TITLES.set(path, clipTitle(`${labelFromPath(path)} ${i + 1}`));
    }
  }
  for (const [desc, paths] of descs) {
    if (paths.length < 2) continue;
    for (let i = 1; i < paths.length; i += 1) {
      const path = paths[i]!;
      PAGE_DESCRIPTIONS.set(path, fitDescription(`${desc.replace(/\.$/, '')} (${path}).`, path));
    }
  }
}

export function bootstrapPageMeta(extra: Array<{ path: string; title: string; description: string; published?: string; modified?: string }>) {
  for (const row of extra) {
    setMeta(row.path, row.title, row.description);
    if (row.published) setDate(row.path, row.published, row.modified ?? row.published);
  }
  ensureUniqueMeta();
}
