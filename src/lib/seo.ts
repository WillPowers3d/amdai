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
  '/rocm/history': 'History',
  '/rocm/glossary': 'ROCm glossary',
  '/rocm/faq': 'ROCm FAQ',
  '/compare': 'Compare',
  '/compare/one-vs-two-gpu': 'One vs two GPUs',
  '/compare/q4-q5-q6': 'Q6 Q5 Q4',
  '/compare/radeon-vs-nvidia': 'Radeon vs NVIDIA',
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
  '/gpus/rx7900xtx': 'RX 7900 XTX',
  '/gpus/rx7900xt': 'RX 7900 XT',
  '/gpus/rx7800xt': 'RX 7800 XT',
  '/gpus/rx-9070-xt': 'RX 9070 XT',
  '/gpus/rx-9060-xt': 'RX 9060 XT',
  '/gpus/rx-7900-gre': 'RX 7900 GRE',
  '/gpus/rx-7700-xt': 'RX 7700 XT',
  '/gpus/rx-7600-xt': 'RX 7600 XT',
  '/models': 'Models',
  '/models/qwen36': 'Qwen3.6-35B-A3B',
  '/models/flash': 'Qwen 3.8 Flash',
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
  '/setup': 'First-run setup',
  '/setup/windows': 'Windows setup',
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
const SKIP_CRUMB = new Set(['/forum/c', '/forum/t', '/recipes', '/go']);

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
  '/gpus/rx7900xtx',
  'RX 7900 XTX',
  'RX 7900 XTX recipe sheet — 24 GB, gfx1100, cited ROCm matrix row. 35B Q6/Q5/Q4 VRAM fit estimates; UD-Q3_K_XL labeled estimate. Not measured on local-desktop.',
);
setDate('/gpus/rx7900xtx', '2026-10-13');
setMeta(
  '/gpus/rx7900xt',
  'RX 7900 XT',
  'RX 7900 XT recipe sheet — 20 GB, gfx1100, cited ROCm matrix row. 35B Q6/Q5/Q4 VRAM fit estimates; UD-Q3_K_XL labeled estimate. Not measured on local-desktop.',
);
setDate('/gpus/rx7900xt', '2026-10-13');
setMeta(
  '/gpus/rx7800xt',
  'RX 7800 XT',
  'RX 7800 XT recipe sheet — 16 GB, gfx1101, cited ROCm matrix row. 35B Q6/Q5/Q4 VRAM fit estimates; UD-Q3_K_XL labeled estimate. Not measured on local-desktop.',
);
setDate('/gpus/rx7800xt', '2026-10-13');
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
  '/models',
  'House Qwen models',
  'House Qwen models with tested Radeon recipes. Reverse view of the GPU directory. Models without a cited row stay on contribute.',
);
setDate('/models', '2026-10-13');
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
  'ComfyUI and friends on Radeon. Cite what you ran; this notebook’s measured work is text Qwen.',
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
