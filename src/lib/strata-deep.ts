/**
 * /backends/strata deep-dive copy. Cited numbers only.
 */

export const MEASURED_ON_OUR_RIG = 'Measured on our rig, 2026-10';

export const ALLOWED_STRATA_DEEP_NUMBERS = [
  32.6, 16, 32.8, 31.8, 18.5, 18.2, 17.9, 9, 20, 0.03, 0.1, 0.01, 0.15, 101.9, 96.4, 95.6, 87.6,
  46.54, 57.22, 790, 1150, 1280, 35, 55, 49.5, 49.9, 48.9, 884, 76, 154, 7, 262144,
] as const;

export type StrataCite = { title: string; href: string; date: string; figures: string };

export type StrataDeepFile = {
  as_of: string;
  pin: string;
  pin_date: string;
  homepage: string;
  release: string;
  repo: string;
  x_search: string;
  what: string;
  why_faster: string;
  limits: { title: string; body: string }[];
  first_party: Array<Record<string, unknown>>;
  community: StrataCite[];
  we_dont_use_q2: string;
};

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function parseStrataDeep(raw: unknown): StrataDeepFile {
  const rec = (raw ?? {}) as Record<string, unknown>;
  const limits = Array.isArray(rec.limits) ? rec.limits : [];
  const community = Array.isArray(rec.community) ? rec.community : [];
  const first = Array.isArray(rec.first_party) ? rec.first_party : [];
  const file: StrataDeepFile = {
    as_of: asString(rec.as_of),
    pin: asString(rec.pin),
    pin_date: asString(rec.pin_date),
    homepage: asString(rec.homepage),
    release: asString(rec.release),
    repo: asString(rec.repo),
    x_search: asString(rec.x_search),
    what: asString(rec.what),
    why_faster: asString(rec.why_faster),
    limits: limits.flatMap((row) => {
      if (!row || typeof row !== 'object') return [];
      const item = row as Record<string, unknown>;
      return [{ title: asString(item.title), body: asString(item.body) }];
    }),
    first_party: first.filter((row): row is Record<string, unknown> => !!row && typeof row === 'object'),
    community: community.flatMap((row) => {
      if (!row || typeof row !== 'object') return [];
      const item = row as Record<string, unknown>;
      if (typeof item.title !== 'string' || typeof item.href !== 'string') return [];
      return [
        {
          title: item.title,
          href: item.href,
          date: asString(item.date),
          figures: asString(item.figures),
        },
      ];
    }),
    we_dont_use_q2: asString(rec.we_dont_use_q2),
  };
  const errors = assertStrataDeepValid(file);
  if (errors.length) throw new Error(`strata-deep.yaml: ${errors.join('; ')}`);
  return file;
}

export function assertStrataDeepValid(file: StrataDeepFile): string[] {
  const errors: string[] = [];
  if (file.pin !== 'v0.1.42') errors.push('pin must be v0.1.42');
  if (file.pin_date !== '2026-10-10') errors.push('pin date must be 2026-10-10');
  if (!/expert cache/i.test(file.why_faster)) errors.push('why_faster must name the expert cache');
  if (!/32\.6/.test(file.why_faster) || !/\b16\b/.test(file.why_faster)) {
    errors.push('why_faster must cite 32.6 vs 16');
  }
  if (!/32\.8/.test(file.why_faster)) errors.push('why_faster must cite the two-card 32.8');
  if (!file.limits.some((row) => /prefill/i.test(row.title))) errors.push('prefill limit required');
  if (!file.limits.some((row) => /MTP/i.test(row.title) && /Q2/i.test(row.body))) {
    errors.push('MTP Q2 limit required');
  }
  if (!/do not use/i.test(file.we_dont_use_q2)) errors.push('must refuse Q2 as house');
  if (!/X \/ Twitter/i.test(file.x_search)) errors.push('X search note required');
  if (file.community.length < 6) errors.push('community cites too thin');
  for (const row of file.community) {
    if (!/^https:\/\//.test(row.href)) errors.push(`non-https ${row.href}`);
    if (!row.date) errors.push(`${row.title} missing date`);
    if (!row.figures) errors.push(`${row.title} missing figures`);
  }
  const required = ['32.6', '32.8', '31.8', '18.5', '101.9', '790', '1150', '49.5', 'Q2_0'];
  const blob = `${file.why_faster}\n${file.limits.map((row) => row.body).join('\n')}\n${file.community.map((row) => row.figures).join('\n')}`;
  for (const needle of required) {
    if (!blob.includes(needle)) errors.push(`missing cited figure ${needle}`);
  }
  return errors;
}
