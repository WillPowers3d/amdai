import { parse } from 'yaml';
import errorsRaw from '../data/errors.yaml?raw';

export type ErrorPattern = {
  id: string;
  title: string;
  match: string[];
  cause: string;
  fix: string;
  source: string;
  source_label: string;
  tags: string[];
};

export type ErrorsFile = {
  as_of: string;
  errors: ErrorPattern[];
};

export const errorsFile = parse(errorsRaw) as ErrorsFile;
export const errorPatterns = errorsFile.errors;

export type ErrorMatch = {
  pattern: ErrorPattern;
  score: number;
  hits: string[];
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function matchErrors(query: string): ErrorMatch[] {
  const q = normalize(query);
  if (!q) return [];
  const scored: ErrorMatch[] = [];
  for (const pattern of errorPatterns) {
    const hits = pattern.match.filter((needle) => q.includes(normalize(needle)));
    if (hits.length === 0) continue;
    const score = hits.reduce((sum, needle) => sum + needle.length, 0);
    scored.push({ pattern, score, hits });
  }
  return scored.sort((a, b) => b.score - a.score);
}
