/**
 * Inference-engine catalog. Logic lives here so tests never import YAML via ?raw.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

export type BackendVerdict = 'default' | 'ok' | 'try' | 'advanced' | 'caution';

export type BackendSource = {
  title: string;
  href: string;
};

export type Backend = {
  id: string;
  name: string;
  short: string;
  verdict: BackendVerdict;
  used_on_our_rig: boolean;
  version: string;
  homepage: string;
  docs: string;
  repo?: string;
  what: string;
  architecture: string;
  well: string;
  badly: string;
  rocm_level: string;
  vulkan: string;
  quants: string;
  multi_gpu: string;
  offload: string;
  moe: string;
  context: string;
  concurrency: string;
  api: string;
  difficulty: string;
  best_for: string;
  worst_for: string;
  when: string;
  install: string;
  run: string;
  tuning: string;
  choose: string;
  sources: BackendSource[];
};

export type BackendsFile = {
  as_of: string;
  default_id: string;
  notes: string[];
  flowchart_fallback: string[];
  engines: Backend[];
};

export const BACKEND_VERDICTS: BackendVerdict[] = ['default', 'ok', 'try', 'advanced', 'caution'];

export const verdictLabel: Record<BackendVerdict, string> = {
  default: 'Start here',
  ok: 'Fine second path',
  try: 'Measured try',
  advanced: 'Advanced / experimental',
  caution: 'Use with eyes open',
};

export const COMPARE_COLUMNS: { key: keyof Backend; label: string }[] = [
  { key: 'rocm_level', label: 'Radeon / ROCm' },
  { key: 'vulkan', label: 'Vulkan' },
  { key: 'quants', label: 'Quants' },
  { key: 'multi_gpu', label: 'Multi-GPU' },
  { key: 'offload', label: 'CPU / RAM offload' },
  { key: 'moe', label: 'MoE' },
  { key: 'context', label: 'Practical context' },
  { key: 'concurrency', label: 'Concurrency' },
  { key: 'api', label: 'API' },
  { key: 'difficulty', label: 'Setup' },
  { key: 'best_for', label: 'Best for' },
  { key: 'worst_for', label: 'Worst for' },
];

const VERDICT_SET = new Set<string>(BACKEND_VERDICTS);

const REQUIRED_IDS = [
  'llamacpp',
  'strata',
  'vllm',
  'ollama',
  'lmstudio',
  'lemonade',
  'sglang',
  'exllama',
  'mlc',
  'ktransformers',
  'pytorch',
];

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function asSources(value: unknown): BackendSource[] {
  if (!Array.isArray(value)) return [];
  const sources: BackendSource[] = [];
  for (const row of value) {
    if (!row || typeof row !== 'object') continue;
    const rec = row as Record<string, unknown>;
    if (typeof rec.title !== 'string' || typeof rec.href !== 'string') continue;
    sources.push({ title: rec.title, href: rec.href });
  }
  return sources;
}

export function normalizeBackend(row: Partial<Backend> & Pick<Backend, 'id' | 'name' | 'short'>): Backend {
  const verdict = BACKEND_VERDICTS.includes(row.verdict as BackendVerdict)
    ? (row.verdict as BackendVerdict)
    : 'caution';
  return {
    id: row.id,
    name: row.name,
    short: row.short,
    verdict,
    used_on_our_rig: Boolean(row.used_on_our_rig),
    version: row.version ?? '',
    homepage: row.homepage ?? '',
    docs: row.docs ?? '',
    repo: row.repo,
    what: row.what ?? '',
    architecture: row.architecture ?? '',
    well: row.well ?? '',
    badly: row.badly ?? '',
    rocm_level: row.rocm_level ?? '',
    vulkan: row.vulkan ?? '',
    quants: row.quants ?? '',
    multi_gpu: row.multi_gpu ?? '',
    offload: row.offload ?? '',
    moe: row.moe ?? '',
    context: row.context ?? '',
    concurrency: row.concurrency ?? '',
    api: row.api ?? '',
    difficulty: row.difficulty ?? '',
    best_for: row.best_for ?? '',
    worst_for: row.worst_for ?? '',
    when: row.when ?? '',
    install: row.install ?? '',
    run: row.run ?? '',
    tuning: row.tuning ?? '',
    choose: row.choose ?? '',
    sources: asSources(row.sources),
  };
}

export function parseBackends(raw: unknown): BackendsFile {
  const parsed = raw as Partial<BackendsFile> & {
    engines?: Array<Partial<Backend> & Pick<Backend, 'id' | 'name' | 'short'>>;
  };
  return {
    as_of: parsed.as_of ?? '',
    default_id: parsed.default_id ?? 'llamacpp',
    notes: asStringList(parsed.notes),
    flowchart_fallback: asStringList(parsed.flowchart_fallback),
    engines: (parsed.engines ?? []).map((row) => normalizeBackend(row)),
  };
}

export function backendPath(id: string): string {
  return `/backends/${id}`;
}

export function usedOnOurRig(list: Backend[]): Backend[] {
  return list.filter((row) => row.used_on_our_rig);
}

/** Which-one flowchart. Defaults to llama.cpp. Text fallback is flowchart_fallback. */
export const BACKEND_FLOWCHART = `flowchart TD
  start["Need tokens on a Radeon tonight?"] --> llama["llama.cpp\\nVulkan 35B: 102.39 / 90.52 / 44.4 tok/s\\nMeasured on our rig, 2026-10"]
  llama --> proven{"Daily driver already\\nworks on /v1?"}
  proven -->|"No"| stay["Stay on llama.cpp\\ncurl /v1, then a harness"]
  proven -->|"Yes, want Flash agent"| strata["Strata v0.1.42\\n~32.6 tok/s vs llama.cpp ~16\\nfirst-party Flash Q6"]
  proven -->|"Several clients / batching"| vllm["vLLM ROCm\\n0.31 try — not default PyPI"]
  proven -->|"Want a GUI"| gui{"GPU meter moves?"}
  gui -->|"Yes"| lm["LM Studio or Ollama\\nstill a black box"]
  gui -->|"No"| stay
  vllm --> pin["Pin a ROCm image/wheel\\nAMD 10.0 combo is still 0.27"]
  strata --> hermes["Point Hermes at :8083"]
`;

export function assertBackendsValid(file: BackendsFile): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  if (!file.as_of) errors.push('missing as_of');
  if (!file.engines.some((row) => row.id === file.default_id)) {
    errors.push(`default_id ${file.default_id} is not in the catalog`);
  }
  if (file.default_id !== 'llamacpp') errors.push('default_id must be llamacpp');
  if (file.flowchart_fallback.length < 4) errors.push('flowchart_fallback is too short');

  let llamacppUsed = false;
  let strataUsed = false;

  for (const row of file.engines) {
    if (ids.has(row.id)) errors.push(`duplicate id ${row.id}`);
    ids.add(row.id);
    if (!/^[a-z0-9-]+$/.test(row.id)) errors.push(`${row.id} is not a kebab slug`);
    if (!VERDICT_SET.has(row.verdict)) errors.push(`${row.id} bad verdict`);
    if (!row.sources.length) errors.push(`${row.id} has no sources`);
    for (const source of row.sources) {
      if (!/^https:\/\//.test(source.href)) errors.push(`${row.id} non-https ${source.href}`);
    }
    if (!row.what) errors.push(`${row.id} missing what`);
    if (!/Q3|Q1\s*\/\s*Q2|Q1 and Q2/i.test(row.quants)) {
      errors.push(`${row.id} must list Q3 or say Q1/Q2 stay off`);
    }
    if (row.id === 'llamacpp' && row.used_on_our_rig) llamacppUsed = true;
    if (row.id === 'strata' && row.used_on_our_rig) strataUsed = true;
    if (row.used_on_our_rig && row.id !== 'llamacpp' && row.id !== 'strata') {
      errors.push(`${row.id} is marked used_on_our_rig — only llamacpp and strata are`);
    }
  }

  for (const id of REQUIRED_IDS) {
    if (!ids.has(id)) errors.push(`missing required engine ${id}`);
  }
  if (!llamacppUsed) errors.push('llamacpp must be marked used_on_our_rig');
  if (!strataUsed) errors.push('strata must be marked used_on_our_rig');

  const strata = file.engines.find((row) => row.id === 'strata');
  if (strata && !/32\.6/.test(`${strata.well} ${strata.choose} ${strata.short}`)) {
    errors.push('strata must cite the first-party 32.6 tok/s figure');
  }
  const llamacpp = file.engines.find((row) => row.id === 'llamacpp');
  const llamaBlob = llamacpp ? `${llamacpp.moe} ${llamacpp.choose} ${llamacpp.context}` : '';
  if (llamacpp && !/102\.39/.test(llamaBlob)) {
    errors.push('llamacpp must cite the first-party 35B 102.39 tok/s figure');
  }
  if (llamacpp && !/Measured on our rig, 2026-10/.test(llamaBlob)) {
    errors.push('llamacpp 35B figures must be labeled Measured on our rig, 2026-10');
  }

  return errors;
}

/** Filesystem load for tests and post-build tools. Pages still use backends-data (?raw). */
let backendsCache: Backend[] | null = null;

export function loadBackendsFromFs(): Backend[] {
  if (backendsCache) return backendsCache;
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(here, '../data/backends.yaml'), join(process.cwd(), 'src/data/backends.yaml')];
  for (const file of candidates) {
    if (existsSync(file)) {
      backendsCache = parseBackends(parse(readFileSync(file, 'utf8'))).engines;
      return backendsCache;
    }
  }
  throw new Error('backends.yaml missing');
}
