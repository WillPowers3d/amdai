/**
 * Evidence-only "Runs on" labels for /new-models.
 * MLX stays off (not a Radeon path). Unknown beats a guess.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RUN_ENGINE_IDS = [
  'llamacpp',
  'strata',
  'vllm',
  'ollama',
  'lmstudio',
  'lemonade',
  'sglang',
] as const;

export type RunEngineId = (typeof RUN_ENGINE_IDS)[number];
export type RunStatus = 'yes' | 'unknown';
export type RunEvidence =
  | ''
  | 'gguf'
  | 'llamacpp-arch'
  | 'vllm-arch'
  | 'ollama-library'
  | 'backends-strata'
  | 'sglang-arch';

export type RunOnHit = {
  id: RunEngineId;
  status: RunStatus;
  evidence: RunEvidence;
};

export type EngineCatalogs = {
  as_of: string;
  llamacpp: string[];
  vllm: string[];
  ollama: string[];
  sglang: string[];
};

export const RUN_ENGINES: {
  id: RunEngineId;
  label: string;
  note: string;
  href: string;
}[] = [
  { id: 'llamacpp', label: 'llama.cpp', note: 'Vulkan / ROCm', href: '/backends/llamacpp' },
  { id: 'strata', label: 'Strata', note: 'ROCm (HIP)', href: '/backends/strata' },
  { id: 'vllm', label: 'vLLM', note: 'ROCm', href: '/backends/vllm' },
  { id: 'ollama', label: 'Ollama', note: 'ROCm', href: '/backends/ollama' },
  { id: 'lmstudio', label: 'LM Studio', note: 'Vulkan / ROCm', href: '/backends/lmstudio' },
  { id: 'lemonade', label: 'Lemonade', note: 'Vulkan / ROCm', href: '/backends/lemonade' },
  { id: 'sglang', label: 'SGLang', note: 'ROCm', href: '/backends/sglang' },
];

export const ENGINE_ARCH_SOURCES = {
  llamacpp: 'https://raw.githubusercontent.com/ggml-org/llama.cpp/master/conversion/__init__.py',
  vllm: 'https://raw.githubusercontent.com/vllm-project/vllm/master/vllm/model_executor/models/registry.py',
  ollama: 'https://ollama.com/library',
  sglang: 'https://docs.sglang.io/docs/supported-models/generative_models',
  strata: '/backends/strata',
} as const;

const EMPTY_CATALOGS: EngineCatalogs = {
  as_of: '',
  llamacpp: [],
  vllm: [],
  ollama: [],
  sglang: [],
};

const STRATA_FLASH = /qwen3\.8[-_ ]?flash/i;

function catalogPath(cwd = process.cwd()): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(cwd === process.cwd() ? here : cwd, cwd === process.cwd() ? '../data/engine-arch.json' : 'src/data/engine-arch.json');
}

export function emptyRunsOn(): RunOnHit[] {
  return RUN_ENGINE_IDS.map((id) => ({ id, status: 'unknown' as const, evidence: '' as const }));
}

export function engineLabel(id: RunEngineId): string {
  return RUN_ENGINES.find((row) => row.id === id)?.label ?? id;
}

export function engineNote(id: RunEngineId): string {
  return RUN_ENGINES.find((row) => row.id === id)?.note ?? '';
}

export function normalizeArch(value: string | null | undefined): string {
  return String(value || '').trim();
}

export function archInList(architecture: string | null | undefined, list: Iterable<string>): boolean {
  const arch = normalizeArch(architecture);
  if (!arch) return false;
  const set = list instanceof Set ? list : new Set(list);
  if (set.has(arch)) return true;
  const lower = arch.toLowerCase();
  for (const item of set) {
    if (item.toLowerCase() === lower) return true;
  }
  return false;
}

const SIZE_TOKEN = /^(?:\d+(?:\.\d+)?B|A\d)/i;
const STOP_TOKEN = /^(instruct|chat|it|base|next|flash|thinking|coder|vl|vision|moe)$/i;

/** Family slug used only against an official Ollama library entry. */
export function ollamaFamilySlug(id: string, name: string): string | null {
  const cands = ollamaFamilyCandidates(id, name);
  return cands[0] ?? null;
}

export function ollamaFamilyCandidates(id: string, name: string): string[] {
  const base = (name || id.split('/').pop() || id).trim();
  if (!base) return [];
  const tokens = base.split(/[-_]/).filter(Boolean);
  if (!tokens.length) return [];
  const kept: string[] = [];
  for (const tok of tokens) {
    if (SIZE_TOKEN.test(tok) || STOP_TOKEN.test(tok)) break;
    kept.push(tok);
  }
  if (!kept.length) kept.push(tokens[0]!);
  const compact = kept.join('').toLowerCase();
  const dashed = kept.join('-').toLowerCase();
  const first = tokens[0]!.toLowerCase();
  return [...new Set([dashed, compact, first].filter(Boolean))];
}

export function ollamaLibraryHit(id: string, name: string, library: Iterable<string>): string | null {
  const set = new Set([...library].map((item) => item.toLowerCase()));
  const hits = ollamaFamilyCandidates(id, name).filter((slug) => set.has(slug));
  hits.sort((a, b) => b.length - a.length);
  return hits[0] ?? null;
}

export function strataFlashHit(id: string, name: string): boolean {
  return STRATA_FLASH.test(`${id} ${name}`);
}

export function loadEngineCatalogs(cwd = process.cwd()): EngineCatalogs {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(cwd, 'src/data/engine-arch.json'),
    join(here, '../data/engine-arch.json'),
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    try {
      const parsed = JSON.parse(readFileSync(file, 'utf8')) as EngineCatalogs;
      if (parsed && Array.isArray(parsed.llamacpp)) {
        return {
          as_of: typeof parsed.as_of === 'string' ? parsed.as_of : '',
          llamacpp: parsed.llamacpp.map(String),
          vllm: (parsed.vllm ?? []).map(String),
          ollama: (parsed.ollama ?? []).map(String),
          sglang: (parsed.sglang ?? []).map(String),
        };
      }
    } catch {
      /* fall through */
    }
  }
  return { ...EMPTY_CATALOGS };
}

export function deriveRunsOn(
  row: { id: string; name: string; architecture?: string | null; gguf?: unknown[] },
  catalogs: EngineCatalogs = loadEngineCatalogs(),
): RunOnHit[] {
  const arch = normalizeArch(row.architecture);
  const hasGguf = Array.isArray(row.gguf) && row.gguf.length > 0;
  const llamaArch = archInList(arch, catalogs.llamacpp);
  const vllmArch = archInList(arch, catalogs.vllm);
  const sglangArch = archInList(arch, catalogs.sglang);
  const ollamaSlug = ollamaLibraryHit(row.id, row.name, catalogs.ollama);
  const strata = strataFlashHit(row.id, row.name);

  const hit = (id: RunEngineId, yes: boolean, evidence: RunEvidence): RunOnHit => ({
    id,
    status: yes ? 'yes' : 'unknown',
    evidence: yes ? evidence : '',
  });

  return [
    hit('llamacpp', hasGguf || llamaArch, hasGguf ? 'gguf' : llamaArch ? 'llamacpp-arch' : ''),
    hit('strata', strata, strata ? 'backends-strata' : ''),
    hit('vllm', vllmArch, vllmArch ? 'vllm-arch' : ''),
    hit('ollama', Boolean(ollamaSlug), ollamaSlug ? 'ollama-library' : ''),
    hit('lmstudio', hasGguf, hasGguf ? 'gguf' : ''),
    hit('lemonade', hasGguf, hasGguf ? 'gguf' : ''),
    hit('sglang', sglangArch, sglangArch ? 'sglang-arch' : ''),
  ];
}

export function normalizeRunsOn(raw: unknown): RunOnHit[] {
  const byId = new Map<string, RunOnHit>();
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== 'object') continue;
      const rec = item as Record<string, unknown>;
      if (!RUN_ENGINE_IDS.includes(rec.id as RunEngineId)) continue;
      if (rec.id === 'mlx') continue;
      const status: RunStatus = rec.status === 'yes' ? 'yes' : 'unknown';
      const evidence = typeof rec.evidence === 'string' ? (rec.evidence as RunEvidence) : '';
      byId.set(String(rec.id), {
        id: rec.id as RunEngineId,
        status,
        evidence: status === 'yes' ? evidence : '',
      });
    }
  } else if (raw && typeof raw === 'object') {
    for (const id of RUN_ENGINE_IDS) {
      const value = (raw as Record<string, unknown>)[id];
      if (value === 'yes' || (value && typeof value === 'object' && (value as { status?: string }).status === 'yes')) {
        byId.set(id, { id, status: 'yes', evidence: '' });
      }
    }
  }
  return RUN_ENGINE_IDS.map((id) => byId.get(id) ?? { id, status: 'unknown', evidence: '' });
}

export function yesEngineIds(runsOn: RunOnHit[] | undefined): RunEngineId[] {
  return (runsOn ?? []).filter((hit) => hit.status === 'yes').map((hit) => hit.id);
}

export function runsOnLabel(runsOn: RunOnHit[] | undefined): string {
  const yes = (runsOn ?? []).filter((hit) => hit.status === 'yes');
  if (!yes.length) return 'unknown';
  return yes.map((hit) => engineLabel(hit.id)).join(', ');
}

export function assertEngineCatalogsValid(catalogs: EngineCatalogs = loadEngineCatalogs()): string[] {
  const errors: string[] = [];
  if (!Array.isArray(catalogs.llamacpp)) errors.push('llamacpp list');
  if (!Array.isArray(catalogs.vllm)) errors.push('vllm list');
  if (!Array.isArray(catalogs.ollama)) errors.push('ollama list');
  if (!Array.isArray(catalogs.sglang)) errors.push('sglang list');
  const blob = JSON.stringify(catalogs);
  if (/\bmlx\b/i.test(blob) && /"mlx"/.test(blob)) errors.push('mlx listed');
  return errors;
}

void catalogPath;
