/**
 * First-visit conversion path: landing → setup → measured recipe → cards.
 * Only real routes. No invented tok/s, prices, or /two-r9700.
 */

export type PathLink = { href: string; label: string };

export type PathStep = {
  id: string;
  label: string;
  body: string;
  href: string;
  also?: PathLink[];
};

export const DAILY_RECIPE = '/recipes/qwen36-35b.llamacpp-vulkan.262k';

/** One strip. Check a rig or budget → Ubuntu setup → measured recipe → cards → optional Stack Lab. */
export const PRIMARY_PATH: PathStep[] = [
  {
    id: 'rig',
    label: 'Check my rig',
    body: 'Size the box in the calculator, or pick a budget band. No invented prices.',
    href: '/calculator',
    also: [{ href: '/budget', label: 'Pick a budget' }],
  },
  {
    id: 'setup',
    label: 'First-run setup',
    body: 'Ubuntu 24.04+ is the measured path to the first token. Windows stays honest about limits.',
    href: '/setup',
  },
  {
    id: 'recipe',
    label: 'Measured recipe',
    body: 'The 32 GB R9700 daily driver on llama.cpp, or Flash / two-card pages when that is the job.',
    href: '/gpus/r9700',
    also: [
      { href: DAILY_RECIPE, label: 'Daily-driver recipe' },
      { href: '/qwen', label: 'Qwen compare' },
      { href: '/flash-daily', label: 'Flash daily' },
      { href: '/qwen36-dual', label: 'Two cards' },
    ],
  },
  {
    id: 'speed',
    label: 'Read the speed',
    body: '33-card 35B llama.cpp matrix and official amdai-bench/run@1 cards. Empty stays not measured.',
    href: '/benchmarks',
    also: [{ href: '/results', label: 'Run cards' }],
  },
  {
    id: 'stack-lab',
    label: 'Optional Stack Lab',
    body: 'Ubuntu companion that records those cards. Packages are not published yet.',
    href: '/stack-lab',
  },
];

export const PINNED_NAV = ['/setup', '/gpus/r9700', '/benchmarks', '/calculator'] as const;

export const NAV_SURFACED = [
  '/setup',
  '/faq',
  '/glossary',
  '/compare',
  '/benchmarks',
  '/results',
  '/gpus/r9700',
  '/stack-lab',
  '/calculator',
  '/budget',
] as const;

export const REQUIRED_HOME_START_HREFS = [
  '/calculator',
  '/budget',
  '/setup',
  '/gpus/r9700',
  DAILY_RECIPE,
  '/qwen',
  '/flash-daily',
  '/qwen36-dual',
  '/benchmarks',
  '/results',
  '/stack-lab',
  '/faq',
  '/glossary',
  '/compare',
] as const;

const NEXT_STEPS: Record<string, PathLink[]> = {
  '/': [
    { href: '/setup', label: 'First-run setup' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/stack-lab', label: 'Stack Lab' },
    { href: '/faq', label: 'FAQ' },
  ],
  '/start': [
    { href: '/setup', label: 'First-run setup' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/compare', label: 'Compare 35B' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/faq', label: 'FAQ' },
  ],
  '/setup': [
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: DAILY_RECIPE, label: 'Daily-driver recipe' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/stack-lab', label: 'Stack Lab' },
    { href: '/start', label: 'Getting started' },
  ],
  '/faq': [
    { href: '/start', label: 'Getting started' },
    { href: '/setup', label: 'First-run setup' },
    { href: '/glossary', label: 'Glossary' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/compare', label: 'Compare 35B' },
  ],
  '/gpus/r9700': [
    { href: '/setup', label: 'First-run setup' },
    { href: DAILY_RECIPE, label: 'Daily-driver recipe' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/compare', label: 'Compare 35B' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/benchmarks': [
    { href: '/results', label: 'Run cards' },
    { href: '/compare', label: 'Compare 35B' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/setup', label: 'First-run setup' },
    { href: '/stack-lab', label: 'Stack Lab' },
  ],
  '/compare': [
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/results', label: 'Run cards' },
    { href: '/calculator', label: 'Calculator' },
    { href: '/glossary', label: 'Glossary' },
  ],
  '/stack-lab': [
    { href: '/setup', label: 'First-run setup' },
    { href: '/gpus/r9700', label: 'R9700 measured page' },
    { href: '/results', label: 'Run cards' },
    { href: '/benchmarks', label: 'Benchmarks' },
    { href: '/contribute', label: 'Contribute a card' },
  ],
};

export const HIGH_TRAFFIC_PATHS = Object.keys(NEXT_STEPS);

export function nextStepsFor(pathname: string): PathLink[] {
  const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '') || '/';
  return NEXT_STEPS[path] ?? NEXT_STEPS['/']!;
}

export function primaryPathHrefs(): string[] {
  const hrefs = new Set<string>();
  for (const step of PRIMARY_PATH) {
    hrefs.add(step.href);
    for (const link of step.also ?? []) hrefs.add(link.href);
  }
  return [...hrefs];
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');
const INVENTED = /\/two-r9700|\/recipes\/?["'\s]|coming soon|upcoming/i;

export function assertPrimaryPathValid(): string[] {
  const errors: string[] = [];
  const blob = [
    ...PRIMARY_PATH.map((step) => `${step.label} ${step.body} ${step.href}`),
    ...Object.values(NEXT_STEPS).flatMap((list) => list.map((link) => `${link.label} ${link.href}`)),
  ].join('\n');
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('lists Q1/Q2');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/\$\d|\bMSRP\b/i.test(blob)) errors.push('invented price');
  if (INVENTED.test(blob)) errors.push('invented or stale path');
  const known = new Set([
    ...primaryPathHrefs(),
    ...Object.values(NEXT_STEPS).flatMap((list) => list.map((link) => link.href)),
  ]);
  for (const href of REQUIRED_HOME_START_HREFS) {
    if (!known.has(href)) errors.push(`primary path missing ${href}`);
  }
  for (const href of NAV_SURFACED) {
    if (!href.startsWith('/')) errors.push(`nav surface ${href} is not a path`);
  }
  if (!PRIMARY_PATH.some((step) => step.href === '/setup')) errors.push('path missing setup');
  if (!PRIMARY_PATH.some((step) => step.href === '/gpus/r9700')) errors.push('path missing r9700');
  if (!PRIMARY_PATH.some((step) => step.href === '/stack-lab')) errors.push('path missing Stack Lab');
  if (!PRIMARY_PATH.some((step) => /not published yet/i.test(step.body))) {
    errors.push('Stack Lab must stay unpublished');
  }
  return [...new Set(errors)];
}
