/**
 * Upfront questions shared by /budget and /calculator.
 * URL params: priority, usage, style, minbudget, expandgpu.
 */
import type { Priority } from './priority';
import { DEFAULT_PRIORITY, isPriority, parsePriority, PRIORITY_COPY } from './priority';
import {
  DEFAULT_MIN_BUDGET,
  defaultExpandGpu,
  parseExpandGpu,
  parseMinBudget,
  writeMotherboardAskParams,
} from './motherboards';
import { abliteratedGuide, type AbliteratedRow } from './status';

export type Usage = 'local' | 'hybrid';
export type Style = 'standard' | 'abliterated';

export const DEFAULT_USAGE: Usage = 'local';
export const DEFAULT_STYLE: Style = 'standard';
export { DEFAULT_MIN_BUDGET, defaultExpandGpu };

export const USAGE_COPY: Record<Usage, { label: string; short: string; lede: string; verdict: string }> = {
  local: {
    label: 'Fully local',
    short: 'Local',
    lede:
      'The local model does the whole job. That pushes toward more VRAM, more system RAM, and a long context so you are not shipping tokens off-box. No cloud pricing is involved.',
    verdict:
      'Fully local: size the box so the local model can carry long context and the full file. More VRAM and RAM help. We do not quote a cloud price because there is no cloud in this path.',
  },
  hybrid: {
    label: 'Hybrid (local plus a cloud model like Claude, Grok or ChatGPT for token-heavy work)',
    short: 'Hybrid',
    lede:
      'Local plus a cloud model (Claude, Grok, ChatGPT, or similar) for token-heavy work. The local box handles privacy-sensitive, repetitive, or always-on tasks. The cloud can take long reasoning jobs. This page does not quote cloud prices or claim a savings figure.',
    verdict:
      'Hybrid: a cheaper local tier can be enough. Keep private or always-on work on the Radeon; send token-heavy reasoning to a cloud model you already use. No cloud pricing claims here.',
  },
};

export const STYLE_COPY: Record<Style, { label: string; short: string; lede: string }> = {
  standard: {
    label: 'Standard (original)',
    short: 'Standard',
    lede: 'Official instruct weights. This is the default and the reliability baseline. Prove Qwen3.6-35B-A3B before you swap.',
  },
  abliterated: {
    label: 'Abliterated / uncensored',
    short: 'Abliterated',
    lede:
      'Abliteration edits refusals in the weights. It can hurt quality. Verify the uploader and the file. You are responsible for what you run. Q1/Q2 stay off; Q3 is estimate/community unless measured. There is no tested-on-our-rig abliterated pick — being reworked. See the educational rows from the catalog, not an invented stack.',
  },
};

export type AskState = {
  priority: Priority;
  usage: Usage;
  style: Style;
  minBudget: boolean;
  expandGpu: boolean;
};

export function isUsage(value: string | null | undefined): value is Usage {
  return value === 'local' || value === 'hybrid';
}

export function isStyle(value: string | null | undefined): value is Style {
  return value === 'standard' || value === 'abliterated';
}

export function parseUsage(search: string): Usage {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const raw = q.get('usage');
  return isUsage(raw) ? raw : DEFAULT_USAGE;
}

export function parseStyle(search: string): Style {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const raw = q.get('style');
  return isStyle(raw) ? raw : DEFAULT_STYLE;
}

export { parseMinBudget, parseExpandGpu };

export function parseAsk(search: string): AskState {
  const minBudget = parseMinBudget(search);
  return {
    priority: parsePriority(search),
    usage: parseUsage(search),
    style: parseStyle(search),
    minBudget,
    expandGpu: parseExpandGpu(search, minBudget),
  };
}

export function askQuery(ask: AskState): Record<string, string> {
  return {
    priority: ask.priority,
    usage: ask.usage,
    style: ask.style,
    minbudget: ask.minBudget ? '1' : '0',
    expandgpu: ask.expandGpu ? '1' : '0',
  };
}

export function writeAskParams(url: URL, ask: AskState): void {
  url.searchParams.set('priority', ask.priority);
  url.searchParams.set('usage', ask.usage);
  url.searchParams.set('style', ask.style);
  writeMotherboardAskParams(url, ask);
}

/** Hybrid can take a cheaper tier. Fully local keeps the size/speed ladder. */
export function suggestedBudgetTier(priority: Priority, usage: Usage): 'starter' | 'mid' | 'enthusiast' | 'pro' {
  if (usage === 'hybrid') return priority === 'size' ? 'mid' : 'starter';
  return priority === 'size' ? 'pro' : 'enthusiast';
}

export function educationalAbliteratedRows(): AbliteratedRow[] {
  return abliteratedGuide.rows.filter((row) => row.kind !== 'control' && !row.method.startsWith('none'));
}

export function testedAbliteratedStatus(): 'being reworked' {
  return 'being reworked';
}

export { DEFAULT_PRIORITY, PRIORITY_COPY, isPriority, parsePriority };
export type { Priority };
