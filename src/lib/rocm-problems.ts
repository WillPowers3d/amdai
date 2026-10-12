import type { SavedRigMatch } from './rig-match';
import { forumCategory } from './forum-categories';

export type ProblemStatus = 'open' | 'workaround' | 'fixed';

export type ProblemLink = {
  title: string;
  href: string;
  repo?: string;
};

export type RocmProblem = {
  id: string;
  title: string;
  summary: string;
  impact: string;
  status: ProblemStatus;
  fixed_in?: string;
  workaround: string;
  affected_gpus: string[];
  affected_gfx: string[];
  affected_os: string[];
  affected_backends: string[];
  affected_versions: string[];
  forum_category: string;
  last_checked: string;
  todo?: boolean;
  upstream: ProblemLink[];
};

export type RocmProblemsFile = {
  as_of: string;
  problems: RocmProblem[];
};

export const PROBLEM_PAGE_SLUGS = ['help', 'report', 'contribute', 'works'] as const;

export const PROBLEM_STATUSES: ProblemStatus[] = ['open', 'workaround', 'fixed'];

const RESERVED = new Set<string>(PROBLEM_PAGE_SLUGS);

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function asLinks(value: unknown): ProblemLink[] {
  if (!Array.isArray(value)) return [];
  const links: ProblemLink[] = [];
  for (const row of value) {
    if (!row || typeof row !== 'object') continue;
    const rec = row as Record<string, unknown>;
    if (typeof rec.title !== 'string' || typeof rec.href !== 'string') continue;
    links.push({
      title: rec.title,
      href: rec.href,
      repo: typeof rec.repo === 'string' ? rec.repo : undefined,
    });
  }
  return links;
}

export function normalizeProblem(row: Partial<RocmProblem> & Pick<RocmProblem, 'id' | 'title' | 'summary'>): RocmProblem {
  const status = PROBLEM_STATUSES.includes(row.status as ProblemStatus) ? (row.status as ProblemStatus) : 'open';
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    impact: row.impact ?? '',
    status,
    fixed_in: row.fixed_in,
    workaround: row.workaround ?? '',
    affected_gpus: asStringList(row.affected_gpus),
    affected_gfx: asStringList(row.affected_gfx),
    affected_os: asStringList(row.affected_os),
    affected_backends: asStringList(row.affected_backends),
    affected_versions: asStringList(row.affected_versions),
    forum_category: row.forum_category ?? 'install-drivers',
    last_checked: row.last_checked ?? '',
    todo: Boolean(row.todo),
    upstream: asLinks(row.upstream),
  };
}

export function parseRocmProblems(raw: unknown): RocmProblemsFile {
  const parsed = raw as { as_of?: string; problems?: Array<Partial<RocmProblem> & Pick<RocmProblem, 'id' | 'title' | 'summary'>> };
  return {
    as_of: parsed.as_of ?? '',
    problems: (parsed.problems ?? []).map((row) => normalizeProblem(row)),
  };
}

export function problemPath(id: string): string {
  return `/rocm-problems/${id}`;
}

export function statusLabel(status: ProblemStatus, fixedIn?: string): string {
  if (status === 'fixed') return fixedIn ? `Fixed in ${fixedIn}` : 'Fixed';
  if (status === 'workaround') return 'Workaround';
  return 'Open';
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function includesNormalized(haystack: string, needle: string): boolean {
  return normalize(haystack).includes(normalize(needle));
}

function listHas(list: string[] | undefined, value: string | undefined): boolean {
  if (!value) return false;
  return (list ?? []).some((item) => includesNormalized(value, item) || includesNormalized(item, value));
}

function versionTouches(versions: string[], installed: string | undefined): boolean {
  if (!installed) return false;
  if (versions.length === 0) return true;
  return versions.some((v) => includesNormalized(installed, v) || includesNormalized(v, installed));
}

export type ProblemMatch = {
  problemId: string;
  matched: boolean;
  reasons: string[];
};

export function problemMatchesRig(problem: RocmProblem, rig: SavedRigMatch): ProblemMatch {
  const reasons: string[] = [];

  if (problem.affected_gpus.length) {
    if (listHas(problem.affected_gpus, rig.gpu)) reasons.push(`gpu ${rig.gpu}`);
    else return { problemId: problem.id, matched: false, reasons: ['gpu does not match'] };
  }

  if (problem.affected_gfx.length) {
    if (listHas(problem.affected_gfx, rig.gfx)) reasons.push(`gfx ${rig.gfx}`);
    else return { problemId: problem.id, matched: false, reasons: ['gfx does not match'] };
  }

  if (problem.affected_backends.length) {
    if (listHas(problem.affected_backends, rig.backend)) reasons.push(`backend ${rig.backend}`);
    else return { problemId: problem.id, matched: false, reasons: ['backend does not match'] };
  }

  if (problem.affected_os.length) {
    const osHit = listHas(problem.affected_os, rig.os) || listHas(problem.affected_os, rig.distro);
    if (osHit) reasons.push(`os ${rig.os ?? rig.distro}`);
    else return { problemId: problem.id, matched: false, reasons: ['os does not match'] };
  }

  if (problem.affected_versions.length) {
    if (versionTouches(problem.affected_versions, rig.rocmVersion)) {
      reasons.push(`ROCm ${rig.rocmVersion}`);
    } else if (rig.rocmVersion) {
      return { problemId: problem.id, matched: false, reasons: ['version does not match'] };
    }
  }

  const targeted =
    problem.affected_gpus.length +
      problem.affected_gfx.length +
      problem.affected_os.length +
      problem.affected_backends.length +
      problem.affected_versions.length >
    0;

  if (reasons.length === 0 && !targeted) {
    reasons.push('listed as a general consumer ROCm gap');
  }

  return { problemId: problem.id, matched: reasons.length > 0, reasons };
}

export function problemsForRig(rig: SavedRigMatch, problems: RocmProblem[]): RocmProblem[] {
  return problems.filter((problem) => problemMatchesRig(problem, rig).matched);
}

export type ProblemFilters = {
  gpu?: string;
  os?: string;
  status?: string;
};

export function filterProblems(problems: RocmProblem[], filters: ProblemFilters): RocmProblem[] {
  return problems.filter((problem) => {
    if (filters.status && problem.status !== filters.status) return false;
    if (filters.gpu) {
      const gpu = filters.gpu;
      const hit =
        listHas(problem.affected_gfx, gpu) ||
        listHas(problem.affected_gpus, gpu) ||
        (problem.affected_gfx.length === 0 && problem.affected_gpus.length === 0);
      if (!hit) return false;
    }
    if (filters.os) {
      const os = filters.os;
      const hit = listHas(problem.affected_os, os) || problem.affected_os.length === 0;
      if (!hit) return false;
    }
    return true;
  });
}

export function uniqueFilterValues(problems: RocmProblem[]): { gpus: string[]; oses: string[] } {
  const gpus = new Set<string>();
  const oses = new Set<string>();
  for (const problem of problems) {
    for (const gfx of problem.affected_gfx) gpus.add(gfx);
    for (const gpu of problem.affected_gpus) gpus.add(gpu);
    for (const os of problem.affected_os) oses.add(os);
  }
  return {
    gpus: [...gpus].sort((a, b) => a.localeCompare(b)),
    oses: [...oses].sort((a, b) => a.localeCompare(b)),
  };
}

export function forumDiscussPath(problem: RocmProblem): string {
  const category = forumCategory(problem.forum_category)?.slug ?? 'install-drivers';
  const params = new URLSearchParams({
    category,
    pattern: problem.id,
    title: problem.title.slice(0, 140),
    body: discussBody(problem),
  });
  return `/forum/new?${params.toString()}`;
}

export function forumProblemSearchPath(problem: RocmProblem): string {
  const params = new URLSearchParams({ q: problem.title, pattern: problem.id });
  return `/forum/search?${params.toString()}`;
}

export function discussBody(problem: RocmProblem): string {
  const links = problem.upstream.map((link) => `- ${link.title} — ${link.href}`).join('\n');
  return [
    problem.summary.trim(),
    '',
    `Tracker: ${problemPath(problem.id)}`,
    `Status: ${statusLabel(problem.status, problem.fixed_in)}`,
    '',
    'Upstream:',
    links || '- (none listed)',
    '',
    'My setup:',
    '<!-- attach a saved rig; paste rocminfo / versions below -->',
    '',
  ].join('\n');
}

export function worksBody(input: {
  problem?: RocmProblem | null;
  rigName?: string;
  gpu?: string;
  gfx?: string;
  os?: string;
  rocm?: string;
  backend?: string;
  backendVersion?: string;
  notes?: string;
}): string {
  const lines = [
    'Works on my rig.',
    '',
    input.problem ? `Related tracker item: ${problemPath(input.problem.id)} (${input.problem.title})` : 'Not tied to a single tracker item.',
    '',
    `- Rig: ${input.rigName || 'unsaved'}`,
    `- GPU: ${input.gpu || 'unknown'}`,
    `- gfx: ${input.gfx || 'unknown'}`,
    `- OS: ${input.os || 'unknown'}`,
    `- ROCm: ${input.rocm || 'not set'}`,
    `- Backend: ${input.backend || 'unknown'}${input.backendVersion ? ` ${input.backendVersion}` : ''}`,
    '',
    input.notes?.trim() || 'What worked: (command, model, quant, context — no invented tok/s.)',
    '',
  ];
  return lines.join('\n');
}

export function assertProblemsValid(file: RocmProblemsFile): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const problem of file.problems) {
    if (RESERVED.has(problem.id)) errors.push(`${problem.id} collides with a page slug`);
    if (ids.has(problem.id)) errors.push(`duplicate id ${problem.id}`);
    ids.add(problem.id);
    if (!/^[a-z0-9-]+$/.test(problem.id)) errors.push(`${problem.id} is not a kebab slug`);
    if (!problem.last_checked) errors.push(`${problem.id} missing last_checked`);
    if (!problem.upstream.length) errors.push(`${problem.id} has no upstream links`);
    for (const link of problem.upstream) {
      if (!/^https:\/\//.test(link.href)) errors.push(`${problem.id} non-https ${link.href}`);
    }
    if (problem.status === 'fixed' && !problem.fixed_in) {
      errors.push(`${problem.id} is fixed but has no fixed_in`);
    }
    if (!forumCategory(problem.forum_category)) {
      errors.push(`${problem.id} unknown forum category ${problem.forum_category}`);
    }
  }
  return errors;
}
