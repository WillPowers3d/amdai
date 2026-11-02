/**
 * Shared types and house rules for PR B buyer-query pages.
 * No invented prices or tok/s. Street prices stay omitted unless live-read today.
 * GB means GiB. llama.cpp first. Q4 and up. Test machine is "local desktop".
 */

import { PII_TEXT } from './pii-denylist';

export const BUYER_PUBLISHED = '2026-11-02';
export const BUYER_CHECKED = '2026-11-02';
export const BUYER_REL = 'sponsored nofollow noopener';
export const BUY_R9700_HREF = '/where-to-buy-r9700';
export const LOCAL_DESKTOP = 'local desktop';
/** AMD launch MSRP already published on this site (r9700-street-price.yaml). */
export const R9700_MSRP = '$1,299';

export const QWEN36_REQ_PATH = '/models/qwen36/requirements';
export const FLASH_REQ_PATH = '/models/flash/requirements';
export const GLM_REQ_PATH = '/models/glm-53-flash/requirements';
export const BEST_GPU_PATH = '/best-amd-gpu-for-llm';
export const PC_BUILD_PATH = '/local-llm-pc-build';
export const R9700_REVIEW_PATH = '/gpus/r9700/review';
export const CODING_MODEL_PATH = '/best-local-coding-model-32gb';

export const BUYER_PATHS = [
  QWEN36_REQ_PATH,
  FLASH_REQ_PATH,
  GLM_REQ_PATH,
  BEST_GPU_PATH,
  PC_BUILD_PATH,
  R9700_REVIEW_PATH,
  CODING_MODEL_PATH,
] as const;

export const BUYER_REDIRECTS: Record<string, string> = {
  '/models/qwen36-35b/requirements': QWEN36_REQ_PATH,
  '/r9700-review': R9700_REVIEW_PATH,
};

export type BuyerLink = { href: string; label: string };

export type BuyerFaq = {
  id: string;
  question: string;
  answer: string;
  links: BuyerLink[];
};

export type BuyerSource = {
  id: string;
  title: string;
  href: string;
  checked: string;
  sourceDate: string;
  thirdParty: boolean;
};

export type BuyerTable = {
  caption: string;
  headers: string[];
  rows: string[][];
};

export type BuyerSection = {
  id: string;
  title: string;
  body?: string;
  table?: BuyerTable;
  code?: string;
  links?: BuyerLink[];
};

export type BuyerPick = {
  title: string;
  body: string;
  href: string;
  label: string;
  productId?: string;
};

export function decimalGbToGiB(decimalGb: number): number {
  return (decimalGb * 1e9) / 1024 ** 3;
}

export function canRunRequirementsPath(modelId: string): string | null {
  if (modelId === 'qwen36') return QWEN36_REQ_PATH;
  if (modelId === 'flash') return FLASH_REQ_PATH;
  if (modelId === 'glm-53-flash') return GLM_REQ_PATH;
  return null;
}

const BANNED = /Qwen2\.5|Qwen3-8B/i;
const Q1Q2 = /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/;
const HOME_PATH = /\/home\/|\/Users\/|C:\\Users\\/i;
const URGENCY = /\b(?:hurry|limited time|act now|don't miss|dont miss|last chance|today only|deal ends|while supplies|buy now)\b/i;
const HOSTNAME = /\bwtpai1\b/i;

export function assertBuyerCopy(blob: string, label: string): string[] {
  const errors: string[] = [];
  if (!/llama\.cpp/.test(blob)) errors.push(`${label}: must say llama.cpp`);
  if (!/local desktop/.test(blob)) errors.push(`${label}: must say local desktop`);
  if (BANNED.test(blob)) errors.push(`${label}: banned model name`);
  if (Q1Q2.test(blob)) errors.push(`${label}: q1/q2 visible`);
  if (URGENCY.test(blob)) errors.push(`${label}: pressure copy`);
  if (PII_TEXT.test(blob) || HOME_PATH.test(blob) || HOSTNAME.test(blob)) {
    errors.push(`${label}: PII`);
  }
  if (/TODO|TBD|FIXME|lorem ipsum/i.test(blob)) errors.push(`${label}: leftover copy`);
  return errors;
}

export function uniqueHrefs(links: BuyerLink[]): string[] {
  return [...new Set(links.map((link) => (link.href.split('?')[0] ?? link.href).split('#')[0] ?? link.href))];
}
