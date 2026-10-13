/**
 * Lab Notes → Radeon Stack Lab handoff.
 * Documented scheme only (docs/deeplink.md). No invented screens or query shapes.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isQ4PlusQuant } from './quant-guard';

export const STACK_LAB_SCHEME = 'amdai-stack-lab';
export const STACK_LAB_COMPAT_SCHEME = 'radeon-stack-lab';
export const STACK_LAB_FALLBACK_HREF = '/stack-lab#install';
export const STACK_LAB_FALLBACK_LABEL = 'Stack Lab install notes';
export const STACK_LAB_FALLBACK_BODY =
  'If the app is not installed, packages are not published yet. There is no public download URL. Read the';
export const STACK_LAB_LOCAL_NOTE = 'If Stack Lab is already running on this machine,';
export const STACK_LAB_LOCAL_LABEL = 'open the local app';
export const STACK_LAB_LOCAL_ORIGIN = 'http://127.0.0.1:47321';
export const STACK_LAB_OPEN_LABEL = 'Open in Stack Lab';

export const STACK_LAB_SCREENS = [
  'recipes',
  'rig',
  'doctor',
  'planner',
  'library',
  'support',
  'updates',
  'profile',
  'speech',
] as const;

export type StackLabScreen = (typeof STACK_LAB_SCREENS)[number];

export const STACK_LAB_PROFILE_IDS = ['qwen-reliable', 'qwen-fast-agent'] as const;
export const STACK_LAB_HOUSE_RECIPES = [
  'qwen36-35b.llamacpp-vulkan.262k',
  'qwen38-flash.strata.262k',
] as const;

const ID = /^[a-z0-9][a-z0-9.-]+$/;
const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const Q4_FLOOR = new RegExp(`floor is q${'4'}|q${'4'} floor|q${'4'} and up only`, 'i');

export type StackLabOpenInput = {
  screen: StackLabScreen;
  id?: string;
};

export type StackLabOpen = {
  href: string;
  fallbackHref: string;
  localHref: string;
  label: string;
  fallbackLabel: string;
  fallbackBody: string;
  localNote: string;
  localLabel: string;
  screen: StackLabScreen;
  id: string | null;
};

export function isStackLabScreen(value: string): value is StackLabScreen {
  return (STACK_LAB_SCREENS as readonly string[]).includes(value);
}

function screenNeedsId(screen: StackLabScreen): boolean {
  return screen === 'profile';
}

function walkRecipeJson(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkRecipeJson(full, out);
    else if (name.endsWith('.json')) out.push(full);
  }
  return out;
}

function recipeRoots(): string[] {
  const here = dirname(fileURLToPath(import.meta.url));
  return [join(here, '../data/recipes'), join(process.cwd(), 'src/data/recipes')];
}

/** Filesystem allowlist — do not import recipes-data (Vite glob) from this module. */
export function knownStackLabRecipeIds(): readonly string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const root of recipeRoots()) {
    for (const file of walkRecipeJson(root)) {
      let row: {
        id?: string;
        model?: string;
        official?: string;
        withdrawn?: unknown;
        weights?: { quant?: string };
      };
      try {
        row = JSON.parse(readFileSync(file, 'utf8')) as typeof row;
      } catch {
        continue;
      }
      const id = row.id?.trim();
      const quant = row.weights?.quant ?? '';
      if (!id || seen.has(id) || row.withdrawn) continue;
      if (!isQ4PlusQuant(quant)) continue;
      if (BANNED.test(`${row.model ?? ''} ${row.official ?? ''} ${id}`)) continue;
      seen.add(id);
      ids.push(id);
    }
    if (ids.length) break;
  }
  return ids;
}

export function isAllowlistedStackLabId(screen: StackLabScreen, id: string | undefined): boolean {
  if (!id) return !screenNeedsId(screen);
  if (!ID.test(id)) return false;
  if (BANNED.test(id)) return false;
  if (screen === 'recipes') return knownStackLabRecipeIds().includes(id);
  if (screen === 'profile') return (STACK_LAB_PROFILE_IDS as readonly string[]).includes(id);
  return false;
}

export function stackLabPath(screen: StackLabScreen, id?: string | null): string {
  return id ? `${screen}/${id}` : screen;
}

export function stackLabHref(screen: StackLabScreen, id?: string | null): string {
  return `${STACK_LAB_SCHEME}:${stackLabPath(screen, id)}`;
}

export function stackLabLocalHref(screen: StackLabScreen, id?: string | null): string {
  return `${STACK_LAB_LOCAL_ORIGIN}/#${stackLabPath(screen, id)}`;
}

export function openInStackLab(input: StackLabOpenInput): StackLabOpen | null {
  if (!isStackLabScreen(input.screen)) return null;
  const id = input.id?.trim() || undefined;
  if (!isAllowlistedStackLabId(input.screen, id)) return null;
  return {
    href: stackLabHref(input.screen, id),
    fallbackHref: STACK_LAB_FALLBACK_HREF,
    localHref: stackLabLocalHref(input.screen, id),
    label: STACK_LAB_OPEN_LABEL,
    fallbackLabel: STACK_LAB_FALLBACK_LABEL,
    fallbackBody: STACK_LAB_FALLBACK_BODY,
    localNote: STACK_LAB_LOCAL_NOTE,
    localLabel: STACK_LAB_LOCAL_LABEL,
    screen: input.screen,
    id: id ?? null,
  };
}

export function openInStackLabForRecipe(recipe: {
  id: string;
  model: string;
  official: string;
  weights: { quant: string };
}): StackLabOpen | null {
  if (!isQ4PlusQuant(recipe.weights.quant)) return null;
  if (BANNED.test(`${recipe.model} ${recipe.official} ${recipe.id}`)) return null;
  return openInStackLab({ screen: 'recipes', id: recipe.id });
}

const HREF = /^(amdai-stack-lab):([a-z]+)(?:\/([a-z0-9][a-z0-9.-]+))?$/i;

export function parseStackLabHref(href: string): StackLabOpen | null {
  const trimmed = href.trim();
  const match = trimmed.match(HREF);
  if (!match) return null;
  const screen = match[2];
  const id = match[3];
  if (!screen || !isStackLabScreen(screen)) return null;
  return openInStackLab({ screen, id });
}

export function isAllowlistedStackLabHref(href: string): boolean {
  return parseStackLabHref(href) !== null;
}

export const HOUSE_STACK_LAB = {
  recipes: { screen: 'recipes' as const },
  daily: { screen: 'recipes' as const, id: STACK_LAB_HOUSE_RECIPES[0] },
  flash: { screen: 'recipes' as const, id: STACK_LAB_HOUSE_RECIPES[1] },
  reliable: { screen: 'profile' as const, id: 'qwen-reliable' },
  fastAgent: { screen: 'profile' as const, id: 'qwen-fast-agent' },
  doctor: { screen: 'doctor' as const },
  planner: { screen: 'planner' as const },
  library: { screen: 'library' as const },
  support: { screen: 'support' as const },
  rig: { screen: 'rig' as const },
  updates: { screen: 'updates' as const },
  speech: { screen: 'speech' as const },
};

export function assertStackLabOpenValid(): string[] {
  const errors: string[] = [];
  const hub = openInStackLab(HOUSE_STACK_LAB.recipes);
  if (!hub || hub.href !== stackLabHref('recipes')) errors.push('recipes hub handoff failed');
  const daily = openInStackLab(HOUSE_STACK_LAB.daily);
  if (!daily) errors.push('daily recipe handoff failed');
  if (daily && daily.href !== stackLabHref('recipes', STACK_LAB_HOUSE_RECIPES[0])) {
    errors.push('daily href must be amdai-stack-lab:recipes/<id>');
  }
  if (daily && daily.localHref !== stackLabLocalHref('recipes', STACK_LAB_HOUSE_RECIPES[0])) {
    errors.push('daily local href must use 127.0.0.1:47321 hash');
  }
  if (daily && daily.label !== STACK_LAB_OPEN_LABEL) errors.push('label must be Open in Stack Lab');
  if (openInStackLab({ screen: 'recipes', id: '../etc/passwd' })) errors.push('must reject path id');
  if (openInStackLab({ screen: 'recipes', id: 'not-a-recipe' })) errors.push('must reject unknown recipe');
  if (openInStackLab({ screen: 'profile', id: 'qwen-abliterated' })) errors.push('must reject unknown profile');
  if (openInStackLab({ screen: 'recipes', id: 'qwen2.5-7b.llamacpp' })) errors.push('must reject banned model id');
  if (openInStackLab({ screen: 'doctor', id: 'nope' })) errors.push('doctor must not take an id');
  if (openInStackLab({ screen: 'speech', id: 'nope' })) errors.push('speech must not take an id');
  const speech = openInStackLab(HOUSE_STACK_LAB.speech);
  if (!speech || speech.href !== stackLabHref('speech')) errors.push('speech workload handoff failed');
  if (openInStackLab({ screen: 'custom' as StackLabScreen })) errors.push('custom has no mapped Lab Notes page');
  if (isAllowlistedStackLabHref('amdai-stack-lab://recipes/qwen36-35b.llamacpp-vulkan.262k')) {
    errors.push('must reject invented :// shape');
  }
  if (isAllowlistedStackLabHref(`${STACK_LAB_COMPAT_SCHEME}:recipes`)) {
    errors.push('compat scheme is secondary — do not emit it as primary');
  }
  for (const id of STACK_LAB_HOUSE_RECIPES) {
    if (!knownStackLabRecipeIds().includes(id)) errors.push(`house recipe missing from catalog: ${id}`);
  }
  const blob = [
    STACK_LAB_FALLBACK_BODY,
    STACK_LAB_FALLBACK_LABEL,
    STACK_LAB_OPEN_LABEL,
    daily?.href ?? '',
    daily?.fallbackHref ?? '',
    daily?.localHref ?? '',
  ].join('\n');
  if (BANNED.test(blob)) errors.push('banned model');
  if (Q1Q2.test(blob)) errors.push('Q1/Q2 listed');
  if (Q4_FLOOR.test(blob)) errors.push('Q4-floor phrase');
  if (/github\.com\/.+\/releases/i.test(blob)) errors.push('invented download');
  if (!/packages are not published yet/i.test(blob)) errors.push('fallback must say unpublished');
  return [...new Set(errors)];
}
