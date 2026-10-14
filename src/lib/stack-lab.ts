/**
 * Radeon Stack Lab product page.
 * Ubuntu 24.04+ companion for AMDai Lab Notes. Packages are not published yet.
 * Do not invent a download URL, version, query scheme, or tok/s.
 */

import { REPORT_HOWTO, REPORT_SCHEMA, REPORT_SCHEMA_HREF } from './lab-notes-report';

export const STACK_LAB_NAME = 'Radeon Stack Lab';
export const STACK_LAB_PUBLISHED = '2026-10-13';
export const STACK_LAB_DIGEST =
  'Ubuntu 24.04+ companion for AMDai Lab Notes — check a rig, apply recipes, record amdai-bench cards. Packages are not published yet.';

export type StackLabLink = { href: string; label: string };

export type StackLabJob = {
  id: string;
  title: string;
  body: string;
  links: StackLabLink[];
};

export type StackLabHandoff = {
  href: string;
  label: string;
  body: string;
};

export const STACK_LAB_SECTIONS = [
  { id: 'what-it-does', label: 'What it does' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'install', label: 'Install' },
  { id: 'handoffs', label: 'Handoffs' },
  { id: 'amdai-bench', label: 'amdai-bench' },
  { id: 'import', label: 'Import from Stack Lab' },
  { id: 'profiles', label: 'Profiles' },
] as const;

export const STACK_LAB_OPEN_LEAD =
  'Install Stack Lab, then Open in Stack Lab from these pages. Buttons use the documented amdai-stack-lab: screens (recipes, doctor, planner, library, support, profile, speech). If the app is not installed, they fall back to this page’s install notes. The catalog is /recipes.json — Q4 and up, llama.cpp first.';

export const STACK_LAB_INTRO_LINKS: StackLabLink[] = [
  { href: '/setup', label: 'First-run setup' },
  { href: '/faq#what-is-stack-lab', label: 'FAQ' },
  { href: '/stacks', label: 'Stacks' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/recipes.json', label: 'recipes.json' },
  { href: '/start', label: 'Getting started' },
];

export const STACK_LAB_JOBS: StackLabJob[] = [
  {
    id: 'check-my-rig',
    title: 'Check my rig',
    body:
      'Read the GPU, VRAM, and OS so the catalog can match a recipe that actually fits. This is the same hardware check first-run setup walks on Ubuntu — Stack Lab is meant to do it on the box.',
    links: [
      { href: '/setup#ubuntu-hardware', label: 'Hardware check' },
      { href: '/gpus/r9700', label: 'R9700 measured page' },
      { href: '/gpus', label: 'GPU directory' },
      { href: '/hardware', label: 'Hardware' },
    ],
  },
  {
    id: 'setup-doctor',
    title: 'Setup doctor',
    body:
      'Walk the first-run path: ROCm or Vulkan, llama.cpp first, then a loopback /v1. It does not replace Install ROCm or Verify GPU — those pages stay the written steps.',
    links: [
      { href: '/setup', label: 'First-run setup' },
      { href: '/tutorials/install-rocm', label: 'Install ROCm' },
      { href: '/tutorials/verify-rocm', label: 'Verify ROCm' },
    ],
  },
  {
    id: 'model-manager',
    title: 'Model manager',
    body:
      'Keep the living catalog aligned with this site’s YAML. Profile qwen-reliable is the 35B daily driver on llama.cpp. qwen-fast-agent is Flash on Strata. The home status card wins if the app catalog and the YAML disagree.',
    links: [
      { href: '/models/qwen36', label: '35B' },
      { href: '/models/flash', label: 'Flash' },
      { href: '/', label: 'Weekly card' },
    ],
  },
  {
    id: 'recipes-from-amdai',
    title: 'Recipes from amdai.net',
    body:
      'Apply a pinned launch from Lab Notes — model, quant, engine, context. The daily-driver recipe is qwen36-35b.llamacpp-vulkan.262k. Flash on Strata is qwen38-flash.strata.262k. Lab Notes hands off with amdai-stack-lab:recipes/<id>. If the app is not installed, stay on this page — packages are not published yet and there is no public download URL.',
    links: [
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
      { href: '/recipes/qwen38-flash.strata.262k', label: 'Flash recipe' },
      { href: '/stacks', label: 'Stacks' },
    ],
  },
  {
    id: 'start-a-profile',
    title: 'Start a profile',
    body:
      'Pick qwen-reliable or qwen-fast-agent and point llama.cpp or Strata at a serve path those tools already understand. Abliterated checkpoints are not a default profile.',
    links: [
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/backends/strata', label: 'Strata' },
      { href: '/abliterated', label: 'Abliterated' },
    ],
  },
  {
    id: 'live-run-dashboard',
    title: 'Live run dashboard',
    body:
      'Watch the local serve while a profile is up. Tokens and VRAM on this site still come only from official amdai-bench/run@1 cards — the dashboard does not invent tok/s.',
    links: [
      { href: '/results', label: 'Run cards' },
      { href: '/benchmarks', label: 'Benchmarks' },
    ],
  },
  {
    id: 'amdai-bench-job',
    title: 'amdai-bench',
    body:
      'Record one official test-run card per line (schema amdai-bench/run@1). Required fields include the exact launch command. Do not invent tok/s, VRAM, or flags. Q3 is estimate/community unless measured.',
    links: [
      { href: '/amdai-bench/run@1.schema.json', label: 'run@1 schema' },
      { href: '/results', label: 'Run cards' },
      { href: '/benchmarks/methodology', label: 'Gates' },
    ],
  },
  {
    id: 'share-contribute',
    title: 'Share / Contribute',
    body:
      'Send cards back to Lab Notes. Export a lab-notes-report/1 pack (each row is amdai-bench/run@1). /results publishes validating cards. /contribute is the recipe form. /benchmarks is the 33-card matrix built only from those cards.',
    links: [
      { href: '/contribute', label: 'Contribute a recipe' },
      { href: '/results', label: 'Run cards' },
      { href: '/benchmarks', label: 'Benchmarks' },
    ],
  },
  {
    id: 'speech-stt-tts',
    title: 'Speech (STT + TTS)',
    body:
      'whisper.cpp first for STT (Vulkan, same ggml family as llama.cpp — not llama-server /v1). Piper is the first TTS path. Lab Notes hands off with amdai-stack-lab:speech. Speeds stay not yet measured by AMDai. llama.cpp stays first for the chat sidecar.',
    links: [
      { href: '/speech', label: 'Speech on Radeon' },
      { href: '/backends/llamacpp', label: 'llama.cpp' },
      { href: '/wanted', label: 'Wanted' },
    ],
  },
];

export const STACK_LAB_INSTALL = {
  published: false as const,
  title: 'Packages not published yet',
  lead:
    'There is no public download URL and no published version number. Do not invent a GitHub release. When Ubuntu packages exist, this page will link the native .deb and the AppImage exactly as they ship.',
  linux: {
    label: 'Linux / Ubuntu 24.04+ (recommended)',
    summary:
      'Native .deb and AppImage. Same measured path as first-run setup. The companion is a local Origin / repo install until those artifacts publish.',
  },
  windows: {
    label: 'Windows (later)',
    summary:
      'Secondary, same as first-run setup. Vulkan llama.cpp is the honest Windows token path. There is no Windows Stack Lab package and no Windows tok/s card.',
  },
  oncePublished: [
    'Download the Ubuntu 24.04+ .deb or AppImage from the link this page will show.',
    'Install on the box that has the Radeon.',
    'Open Stack Lab after the first token, then start qwen-reliable.',
  ],
};

export const STACK_LAB_HANDOFFS: StackLabHandoff[] = [
  {
    href: '/setup#stack-lab',
    label: 'First-run setup',
    body:
      'Ubuntu 24.04+ to first token. The Stack Lab section says when to open the companion — after tokens, if you have the local repo.',
  },
  {
    href: '/faq#what-is-stack-lab',
    label: 'FAQ',
    body: 'Short answers for the Ubuntu path, recipes, and amdai-bench.',
  },
  {
    href: '/recipes/qwen36-35b.llamacpp-vulkan.262k',
    label: 'Apply the 35B recipe',
    body:
      'Daily-driver pin. Stack Lab profile qwen-reliable is the same pick. Open the recipe, then start that profile when the app is installed.',
  },
  {
    href: '/recipes/qwen38-flash.strata.262k',
    label: 'Apply the Flash recipe',
    body: 'Fast-agent pin. Profile qwen-fast-agent. llama.cpp Q6 fallback is documented on the recipe.',
  },
  {
    href: '/stacks',
    label: 'Recommended stacks',
    body: 'Written cards for qwen-reliable and qwen-fast-agent. The YAML wins if the app catalog disagrees.',
  },
  {
    href: '/benchmarks',
    label: 'Benchmarks ↔ amdai-bench',
    body:
      '33-card local-desktop matrix. Each cell links a run card. Open in Stack Lab here uses amdai-stack-lab:library. Stack Lab records those cards; Lab Notes renders them.',
  },
  {
    href: '/results',
    label: 'Run cards',
    body: 'Official amdai-bench/run@1 pages, credited to the submitter.',
  },
  {
    href: '/contribute',
    label: 'Contribute',
    body: 'Submit a Radeon recipe as JSON with a log. No invented tok/s.',
  },
  {
    href: '/backends',
    label: 'Backends',
    body: 'llama.cpp first. Stack Lab selects a profile; it does not replace the engine.',
  },
  {
    href: '/speech',
    label: 'Speech on Radeon',
    body:
      'Cited whisper.cpp Vulkan STT plus Piper TTS. Open in Stack Lab uses amdai-stack-lab:speech. No house 35B recipe id. Speeds stay not yet measured by AMDai.',
  },
];

export const STACK_LAB_CLI = {
  schemaHref: '/amdai-bench/run@1.schema.json',
  schemaId: 'amdai-bench/run@1',
  packSchemaHref: REPORT_SCHEMA_HREF,
  packSchemaId: REPORT_SCHEMA,
  howto: REPORT_HOWTO,
  commands: [
    'npx tsx src/scripts/amdai-bench.ts validate',
    'npx tsx src/scripts/amdai-bench.ts emit < card.json',
    'npx tsx src/scripts/amdai-bench.ts append data/runs/local-desktop-amdai.jsonl < card.json',
    'npx tsx src/scripts/amdai-bench.ts ingest --dry-run pack.json',
    'npx tsx src/scripts/amdai-bench.ts ingest pack.json',
  ],
};

export const STACK_LAB_PROFILES = [
  {
    id: 'qwen-reliable',
    title: 'qwen-reliable — daily driver',
    body:
      'Qwen3.6-35B-A3B UD-Q5_K_XL on llama.cpp Vulkan, one R9700, 262K, f16 KV. Use when you need tokens you can trust tomorrow morning. Exact command line and measured VRAM stay on the run cards — not recorded from the app catalog.',
    links: [
      { href: '/recipes/qwen36-35b.llamacpp-vulkan.262k', label: '35B recipe' },
      { href: '/qwen', label: 'Qwen compare' },
    ] satisfies StackLabLink[],
  },
  {
    id: 'qwen-fast-agent',
    title: 'qwen-fast-agent — fast agent',
    body:
      'Qwen 3.8 Flash UD-Q6_K_XL on Strata v0.1.42, llama.cpp Q6 fallback. Use for agent loops that need the higher tok/s we measured (~32.6 vs ~16). Exact command line and measured VRAM+RAM stay on the Flash pages.',
    links: [
      { href: '/recipes/qwen38-flash.strata.262k', label: 'Flash recipe' },
      { href: '/flash-daily', label: 'Flash daily driver' },
    ] satisfies StackLabLink[],
  },
];

export const REQUIRED_STACK_LAB_HREFS = [
  '/setup',
  '/faq',
  '/recipes/qwen36-35b.llamacpp-vulkan.262k',
  '/recipes/qwen38-flash.strata.262k',
  '/contribute',
  '/benchmarks',
  '/results',
  '/backends',
  '/stacks',
  '/amdai-bench/run@1.schema.json',
  '/amdai-bench/lab-notes-report@1.schema.json',
  '/disclosure',
  '/recipes.json',
  '/start',
  '/speech',
] as const;

const BANNED_VISIBLE = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function stackLabBlob(): string {
  const parts = [
    STACK_LAB_NAME,
    STACK_LAB_DIGEST,
    STACK_LAB_OPEN_LEAD,
    STACK_LAB_INSTALL.title,
    STACK_LAB_INSTALL.lead,
    STACK_LAB_INSTALL.linux.label,
    STACK_LAB_INSTALL.linux.summary,
    STACK_LAB_INSTALL.windows.label,
    STACK_LAB_INSTALL.windows.summary,
    ...STACK_LAB_INSTALL.oncePublished,
    ...STACK_LAB_JOBS.map((job) => `${job.title} ${job.body}`),
    ...STACK_LAB_HANDOFFS.map((row) => `${row.label} ${row.body}`),
    ...STACK_LAB_PROFILES.map((row) => `${row.title} ${row.body}`),
    ...STACK_LAB_CLI.commands,
    REPORT_HOWTO.title,
    REPORT_HOWTO.lead,
    ...REPORT_HOWTO.steps,
    REPORT_SCHEMA,
  ];
  return parts.join('\n');
}

export function stackLabHrefs(): string[] {
  const links = [
    ...STACK_LAB_INTRO_LINKS,
    ...STACK_LAB_JOBS.flatMap((job) => job.links),
    ...STACK_LAB_HANDOFFS.map((row) => ({ href: row.href, label: row.label })),
    ...STACK_LAB_PROFILES.flatMap((row) => row.links),
    { href: STACK_LAB_CLI.schemaHref, label: 'schema' },
    { href: STACK_LAB_CLI.packSchemaHref, label: 'lab-notes-report schema' },
    { href: '/disclosure', label: 'Disclosure' },
  ];
  return [
    ...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href)),
  ];
}

export function assertStackLabValid(): string[] {
  const errors: string[] = [];
  const blob = stackLabBlob();
  const hrefs = new Set(stackLabHrefs());
  if (STACK_LAB_INSTALL.published) errors.push('do not mark packages published without a real artifact');
  if (STACK_LAB_JOBS.length < 9) errors.push('need the nine companion jobs');
  if (!STACK_LAB_JOBS.some((job) => job.title === 'Speech (STT + TTS)')) errors.push('missing Speech job');
  if (!STACK_LAB_JOBS.some((job) => job.title === 'Check my rig')) errors.push('missing Check my rig');
  if (!STACK_LAB_JOBS.some((job) => job.title === 'Setup doctor')) errors.push('missing Setup doctor');
  if (!STACK_LAB_JOBS.some((job) => job.title === 'Model manager')) errors.push('missing Model manager');
  if (!STACK_LAB_JOBS.some((job) => job.title === 'amdai-bench')) errors.push('missing amdai-bench job');
  if (BANNED_VISIBLE.test(blob)) errors.push('banned model');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (/TODO|TBD|FIXME|lorem ipsum|coming soon/i.test(blob)) errors.push('leftover copy');
  if (!/packages not published yet/i.test(blob)) errors.push('must say packages not published yet');
  if (!/no public download/i.test(blob)) errors.push('must say there is no public download');
  if (!/Ubuntu 24\.04/.test(blob)) errors.push('must lead with Ubuntu 24.04');
  if (!/later/i.test(STACK_LAB_INSTALL.windows.label + STACK_LAB_INSTALL.windows.summary)) {
    errors.push('Windows must stay later');
  }
  if (!STACK_LAB_CLI.commands.some((cmd) => cmd.includes('amdai-bench.ts'))) {
    errors.push('must document the in-repo amdai-bench CLI');
  }
  if (!STACK_LAB_CLI.commands.some((cmd) => cmd.includes('ingest'))) {
    errors.push('must document lab-notes-report ingest');
  }
  if (!blob.includes(REPORT_SCHEMA)) errors.push('must name lab-notes-report/1');
  if (/stacklab:\/\//i.test(blob)) errors.push('do not invent a URI scheme');
  if (/(?:^|[^a-z-])amdai:\/\//i.test(blob)) errors.push('do not invent a URI scheme');
  if (!/amdai-stack-lab:/.test(blob)) errors.push('must document the amdai-stack-lab handoff');
  if (!/Install Stack Lab, then Open in Stack Lab/i.test(blob)) {
    errors.push('must tell visitors to install, then Open in Stack Lab from Lab Notes');
  }
  if (!/recipes\.json/.test(blob)) errors.push('must point at /recipes.json');
  if (/github\.com\/.+\/releases/i.test(blob)) errors.push('do not invent a GitHub release URL');
  for (const required of REQUIRED_STACK_LAB_HREFS) {
    if (![...hrefs].some((href) => href === required || href.startsWith(`${required}/`))) {
      errors.push(`missing required href ${required}`);
    }
  }
  return errors;
}
