/**
 * Lab Notes → Radeon Stack Lab handoff.
 * Allowlisted amdai-stack-lab: links only. No invented download URL or tok/s.
 */

export const STACK_LAB_SCHEME = 'amdai-stack-lab';
export const STACK_LAB_FALLBACK_HREF = '/stack-lab#install';
export const STACK_LAB_FALLBACK_LABEL = 'Stack Lab install notes';
export const STACK_LAB_FALLBACK_BODY =
  'If the app is not installed, packages are not published yet. There is no public download URL. Read the';

export const STACK_LAB_SCREENS = [
  'home',
  'recipes',
  'profile',
  'doctor',
  'setup',
  'results',
  'backends',
  'harnesses',
  'bench',
] as const;

export type StackLabScreen = (typeof STACK_LAB_SCREENS)[number];

export const STACK_LAB_PROFILE_IDS = ['qwen-reliable', 'qwen-fast-agent'] as const;
export const STACK_LAB_BACKEND_IDS = ['llamacpp', 'strata'] as const;
export const STACK_LAB_HARNESS_IDS = ['hermes'] as const;
export const STACK_LAB_HOUSE_RECIPES = [
  'qwen36-35b.llamacpp-vulkan.262k',
  'qwen38-flash.strata.262k',
] as const;

export const STACK_LAB_QUERY_KEYS = ['recipe', 'model', 'quant', 'engine', 'context', 'run'] as const;

const RECIPE_ID = /^[a-z0-9][a-z0-9.-]+$/;
const RUN_ID = /^[a-zA-Z0-9._:-]+$/;
const MODEL = /^[\w .+-]{1,80}$/;
const QUANT = /^(UD-)?Q[3-8](_[A-Z0-9]+)*$|^BF16$|^F16$/;
const CONTEXT = /^\d{1,8}$/;
const LOCAL_ORIGIN = /^http:\/\/127\.0\.0\.1:\d{2,5}$/;

export type StackLabOpenInput = {
  screen: StackLabScreen;
  id?: string;
  recipe?: string;
  model?: string;
  quant?: string;
  engine?: string;
  context?: number | string;
  run?: string;
};

export type StackLabOpen = {
  href: string;
  fallbackHref: string;
  localHref: string | null;
  label: string;
  fallbackLabel: string;
  fallbackBody: string;
  screen: StackLabScreen;
  id: string | null;
};

export function isStackLabScreen(value: string): value is StackLabScreen {
  return (STACK_LAB_SCREENS as readonly string[]).includes(value);
}

function screenNeedsId(screen: StackLabScreen): boolean {
  return screen === 'recipes' || screen === 'profile' || screen === 'backends' || screen === 'harnesses';
}

export function isAllowlistedStackLabId(screen: StackLabScreen, id: string | undefined): boolean {
  if (!id) return !screenNeedsId(screen);
  if (screen === 'recipes') return RECIPE_ID.test(id);
  if (screen === 'profile') return (STACK_LAB_PROFILE_IDS as readonly string[]).includes(id);
  if (screen === 'backends') return (STACK_LAB_BACKEND_IDS as readonly string[]).includes(id);
  if (screen === 'harnesses') return (STACK_LAB_HARNESS_IDS as readonly string[]).includes(id);
  if (screen === 'results') return RUN_ID.test(id);
  return false;
}

function cleanQuery(input: StackLabOpenInput): URLSearchParams | null {
  const params = new URLSearchParams();
  const recipe = input.recipe ?? (input.screen === 'recipes' ? input.id : undefined);
  if (recipe) {
    if (!RECIPE_ID.test(recipe)) return null;
    params.set('recipe', recipe);
  }
  if (input.model) {
    if (!MODEL.test(input.model) || /Qwen2\.5|Qwen3-8B/i.test(input.model)) return null;
    params.set('model', input.model);
  }
  if (input.quant) {
    if (!QUANT.test(input.quant)) return null;
    params.set('quant', input.quant);
  }
  if (input.engine) {
    if (!(STACK_LAB_BACKEND_IDS as readonly string[]).includes(input.engine)) return null;
    params.set('engine', input.engine);
  }
  if (input.context != null && input.context !== '') {
    const ctx = String(input.context);
    if (!CONTEXT.test(ctx)) return null;
    params.set('context', ctx);
  }
  if (input.run) {
    if (!RUN_ID.test(input.run)) return null;
    params.set('run', input.run);
  }
  return params;
}

export function stackLabLocalOrigin(raw = process.env.STACK_LAB_LOCAL_ORIGIN): string | null {
  const value = (raw ?? '').trim().replace(/\/$/, '');
  if (!value) return null;
  if (!LOCAL_ORIGIN.test(value)) return null;
  return value;
}

function labelFor(screen: StackLabScreen): string {
  return screen === 'recipes' || screen === 'profile' ? 'Apply in Stack Lab' : 'Open in Stack Lab';
}

export function openInStackLab(input: StackLabOpenInput): StackLabOpen | null {
  if (!isStackLabScreen(input.screen)) return null;
  const id = input.id?.trim() || undefined;
  if (!isAllowlistedStackLabId(input.screen, id)) return null;
  const params = cleanQuery(input);
  if (!params) return null;
  const path = id ? `/${input.screen}/${id}` : `/${input.screen}`;
  const query = params.toString();
  const href = `${STACK_LAB_SCHEME}:/${path}${query ? `?${query}` : ''}`;
  const localOrigin = stackLabLocalOrigin();
  const localHref = localOrigin ? `${localOrigin}/open${path}${query ? `?${query}` : ''}` : null;
  return {
    href,
    fallbackHref: STACK_LAB_FALLBACK_HREF,
    localHref,
    label: labelFor(input.screen),
    fallbackLabel: STACK_LAB_FALLBACK_LABEL,
    fallbackBody: STACK_LAB_FALLBACK_BODY,
    screen: input.screen,
    id: id ?? null,
  };
}

export function parseStackLabHref(href: string): StackLabOpen | null {
  const trimmed = href.trim();
  if (!trimmed.toLowerCase().startsWith(`${STACK_LAB_SCHEME}:`)) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== `${STACK_LAB_SCHEME}:`) return null;
  const parts = [url.hostname, ...url.pathname.split('/').filter(Boolean)].filter(Boolean);
  const screen = parts[0];
  const id = parts[1];
  if (!screen || !isStackLabScreen(screen)) return null;
  const input: StackLabOpenInput = { screen, id };
  for (const key of STACK_LAB_QUERY_KEYS) {
    const value = url.searchParams.get(key);
    if (value) input[key] = value;
  }
  const built = openInStackLab(input);
  return built;
}

export function isAllowlistedStackLabHref(href: string): boolean {
  return parseStackLabHref(href) !== null;
}

export const HOUSE_STACK_LAB = {
  daily: {
    screen: 'recipes' as const,
    id: STACK_LAB_HOUSE_RECIPES[0],
    recipe: STACK_LAB_HOUSE_RECIPES[0],
    model: 'Qwen3.6-35B-A3B',
    quant: 'UD-Q5_K_XL',
    engine: 'llamacpp' as const,
    context: 262144,
  },
  flash: {
    screen: 'recipes' as const,
    id: STACK_LAB_HOUSE_RECIPES[1],
    recipe: STACK_LAB_HOUSE_RECIPES[1],
    model: 'Qwen 3.8 Flash',
    quant: 'UD-Q6_K_XL',
    engine: 'strata' as const,
    context: 262144,
  },
  reliable: { screen: 'profile' as const, id: 'qwen-reliable' },
  fastAgent: { screen: 'profile' as const, id: 'qwen-fast-agent' },
  doctor: { screen: 'doctor' as const },
  home: { screen: 'home' as const },
  results: { screen: 'results' as const },
  llama: { screen: 'backends' as const, id: 'llamacpp' },
  strata: { screen: 'backends' as const, id: 'strata' },
  hermes: { screen: 'harnesses' as const, id: 'hermes' },
  bench: { screen: 'bench' as const },
};

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export function assertStackLabOpenValid(): string[] {
  const errors: string[] = [];
  const daily = openInStackLab(HOUSE_STACK_LAB.daily);
  if (!daily) errors.push('daily recipe handoff failed');
  if (daily && !daily.href.startsWith(`${STACK_LAB_SCHEME}:`)) errors.push('daily href must use scheme');
  if (openInStackLab({ screen: 'recipes', id: '../etc/passwd' })) errors.push('must reject path id');
  if (openInStackLab({ screen: 'harnesses', id: 'not-a-harness' })) errors.push('must reject unknown harness');
  if (openInStackLab({ screen: 'backends', id: 'vllm' })) errors.push('must not hand off unmeasured engines as first');
  if (openInStackLab({ screen: 'recipes', id: STACK_LAB_HOUSE_RECIPES[0], quant: 'Q2_K' })) {
    errors.push('must reject Q1/Q2 quants');
  }
  if (openInStackLab({ screen: 'home', id: 'nope' })) errors.push('home must not take an id');
  if (stackLabLocalOrigin('https://evil.example')) errors.push('must reject non-localhost origin');
  if (stackLabLocalOrigin('http://127.0.0.1:9')) errors.push('must reject short localhost port');
  const blob = [
    STACK_LAB_FALLBACK_BODY,
    STACK_LAB_FALLBACK_LABEL,
    daily?.href ?? '',
    daily?.fallbackHref ?? '',
  ].join('\n');
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/github\.com\/.+\/releases/i.test(blob)) errors.push('invented download');
  if (!/packages are not published yet/i.test(blob)) errors.push('fallback must say unpublished');
  return [...new Set(errors)];
}
