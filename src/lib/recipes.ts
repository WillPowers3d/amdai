/**
 * First-party launch recipes. A recipe is one model on one card with ROCm
 * metadata and a sourced proof. Build fails on Q1/Q2 or a number without a
 * source. Q3 is allowed and must be labeled estimate/community unless measured.
 * Tests import this file — not the JSON glob.
 */

import { z } from 'astro/zod';
import { assertQuantAllowed, isQ3Quant } from './quant-guard';
import { ALLOWED_TOK_S as BENCH_TOK } from './benchmarks';
import { systemRamNeedFromQuery, type CalcInput, type SystemRamNeed } from './calculator';
import type { StackUpdate } from './rig-match';

export const MEASURED_LABEL = 'Measured on our rig, 2026-10';

export const EVIDENCE_TIERS = ['tested-our-rig', 'community', 'sibling', 'cited-external', 'load-only'] as const;
export type EvidenceTier = (typeof EVIDENCE_TIERS)[number];

export const GATE_IDS = ['load', 'chat', 'reasoning', 'tools', 'long_context', 'speed'] as const;
export type GateId = (typeof GATE_IDS)[number];
export type GateStatus = 'pass' | 'fail' | 'not_measured';

export const GATE_COPY: Record<GateId, { title: string; meaning: string }> = {
  load: {
    title: 'Loads on the named GPU',
    meaning:
      'The process attaches to the discrete card (rocminfo / --list-devices agrees). We do not publish a time-limit SLA.',
  },
  chat: {
    title: 'A reply finishes',
    meaning: 'Generate ends. The server does not hang mid-token. This is not a quality score.',
  },
  reasoning: {
    title: 'Thinking channel (when the model has one)',
    meaning:
      'A distinct thought block and a final answer both appear. Not measured on our seeded recipes yet.',
  },
  tools: {
    title: 'A tool call is used',
    meaning:
      'The server emits a tool call and consumes the result. Not measured on our seeded recipes yet.',
  },
  long_context: {
    title: 'Stated context actually ran',
    meaning:
      'The run used the context we printed (262144 for the daily driver). We do not publish a planted-token recall score.',
  },
  speed: {
    title: 'Decode recorded',
    meaning: 'tok/s at the stated context, sourced. No invented floor.',
  },
};

export const TIER_LABEL: Record<EvidenceTier, string> = {
  'tested-our-rig': 'Tested on our rig',
  community: 'Community-verified',
  sibling: 'Sibling card',
  'cited-external': 'Cited external',
  'load-only': 'Load only',
};

const ALLOWED_PROOF_NUMBERS = new Set<number>([...BENCH_TOK, 116.5, 1814]);

const gateStatus = z.enum(['pass', 'fail', 'not_measured']);

export const recipeSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9.-]+$/),
  card: z.string(),
  model_id: z.enum(['qwen36', 'flash']),
  model: z.string(),
  official: z.string(),
  weights: z.object({
    repo: z.string(),
    commit: z.string().nullable(),
    filename: z.string(),
    quant: z.string(),
  }),
  backend: z.enum(['llamacpp', 'strata']),
  build: z.enum(['hip', 'vulkan']),
  rocm_version: z.string().nullable(),
  gfx: z.string(),
  override: z.string().nullable(),
  ctx: z.number().int().positive(),
  ctx_label: z.string(),
  card_count: z.number().int().min(1).max(4),
  flags_todo: z.boolean(),
  needs: z.object({
    host_ram_gb: z.number().nullable(),
    min_kit_gb: z.number().nullable().optional(),
    full_ctx_kit_gb: z.number().nullable().optional(),
    disk_gb: z.number().nullable(),
  }),
  proof: z
    .array(
      z.object({
        date: z.string(),
        who: z.string(),
        tier: z.enum(EVIDENCE_TIERS),
        source: z.string().min(4),
        gates: z.object({
          load: gateStatus,
          chat: gateStatus,
          reasoning: gateStatus,
          tools: gateStatus,
          long_context: gateStatus,
          speed: gateStatus,
        }),
        decode: z.number().nullable(),
        prefill: z.number().nullable(),
        log_hash: z.string().nullable(),
      }),
    )
    .min(1),
  withdrawn: z
    .object({
      date: z.string(),
      reason: z.string(),
      source: z.string().min(4),
    })
    .nullable(),
  launch: z.object({
    family: z.enum(['llamacpp', 'strata']),
    todo_flags: z.boolean(),
    env: z.array(z.string()),
    lines: z.array(z.string()).min(1),
  }),
  calculator: z.string().startsWith('/calculator?'),
  notes: z.array(z.string()),
});

export type Recipe = z.infer<typeof recipeSchema>;

export function recipeSystemRam(recipe: Recipe): SystemRamNeed | null {
  if (!recipe.calculator.includes('?')) return null;
  return systemRamNeedFromQuery(recipe.calculator);
}

export function parseRecipe(raw: unknown, file = 'recipe'): Recipe {
  const parsed = recipeSchema.parse(raw);
  assertQuantAllowed(parsed.weights.quant);
  if (isQ3Quant(parsed.weights.quant)) {
    const notes = parsed.notes.join(' ');
    if (!/estimate|community/i.test(notes)) {
      throw new Error(`${file}: Q3 recipe must be labeled estimate or community unless measured`);
    }
  }
  for (const proof of parsed.proof) {
    if (proof.decode != null && !ALLOWED_PROOF_NUMBERS.has(proof.decode)) {
      throw new Error(`${file}: unsourced decode ${proof.decode}`);
    }
    if (proof.prefill != null && !ALLOWED_PROOF_NUMBERS.has(proof.prefill)) {
      throw new Error(`${file}: unsourced prefill ${proof.prefill}`);
    }
    if ((proof.decode != null || proof.prefill != null) && !proof.source.trim()) {
      throw new Error(`${file}: number without a source`);
    }
  }
  if (/Qwen2\.5|Qwen3-8B/i.test(`${parsed.model} ${parsed.official}`)) {
    throw new Error(`${file}: banned model name`);
  }
  return parsed;
}

export function parseRecipes(raws: { file: string; data: unknown }[]): Recipe[] {
  const list = raws.map((row) => parseRecipe(row.data, row.file));
  const ids = new Set<string>();
  for (const row of list) {
    if (ids.has(row.id)) throw new Error(`duplicate recipe id ${row.id}`);
    ids.add(row.id);
  }
  return list;
}

export function liveRecipes(list: Recipe[]): Recipe[] {
  return list.filter((row) => !row.withdrawn);
}

export function recipesForCard(list: Recipe[], card: string): Recipe[] {
  return liveRecipes(list).filter((row) => row.card === card);
}

export function recipesForModel(list: Recipe[], modelId: string): Recipe[] {
  return liveRecipes(list).filter((row) => row.model_id === modelId);
}

export function matchRecipe(list: Recipe[], input: CalcInput): Recipe | null {
  const live = liveRecipes(list);
  const card = input.gpuId;
  const model = input.modelId === 'custom' ? null : input.modelId;
  if (!model) return null;
  const quantHint =
    input.quantId === 'q4_k_m'
      ? 'Q4'
      : input.quantId === 'q5_k_m'
        ? 'Q5'
        : input.quantId === 'q6_k'
          ? 'Q6'
          : input.quantId === 'q3_k_m' ||
              input.quantId === 'q3_k_s' ||
              input.quantId === 'q3_k_xl' ||
              input.quantId === 'iq3'
            ? 'Q3'
            : null;
  if (!quantHint) return null;

  const candidates = live.filter((row) => {
    if (row.card !== card) return false;
    if (row.model_id !== model) return false;
    if (row.card_count !== input.gpuCount) return false;
    if (!row.weights.quant.includes(quantHint)) return false;
    if (model === 'qwen36' && input.split) return false;
    return true;
  });

  if (!candidates.length) return null;

  const exact = candidates.find((row) => row.ctx === input.context);
  if (exact) return exact;
  if (input.context <= 8192) {
    return candidates.find((row) => row.ctx_label === 'short') ?? candidates[0] ?? null;
  }
  return candidates[0] ?? null;
}

export function pickRecipes(list: Recipe[], gpu: string, vram: number | null): Recipe[] {
  const live = liveRecipes(list).filter((row) => {
    if (row.card !== gpu && !row.card.includes(gpu) && gpu && !gpu.includes(row.card)) return false;
    return true;
  });
  const ranked = [...live].sort((a, b) => {
    const aDaily = a.model_id === 'qwen36' && a.backend === 'llamacpp' ? 0 : 1;
    const bDaily = b.model_id === 'qwen36' && b.backend === 'llamacpp' ? 0 : 1;
    if (aDaily !== bDaily) return aDaily - bDaily;
    return b.ctx - a.ctx;
  });
  void vram;
  return ranked.slice(0, 3);
}

export function withdrawalUpdates(list: Recipe[]): StackUpdate[] {
  return list
    .filter((row) => row.withdrawn)
    .map((row) => ({
      id: `withdrawn-${row.id}`,
      date: row.withdrawn!.date,
      component: row.backend === 'strata' ? 'strata' : 'llama.cpp',
      affected_versions: [],
      affected_gpus: [row.card],
      affected_gfx: [row.gfx],
      affected_backends: [row.backend === 'strata' ? 'strata' : 'llama.cpp'],
      affected_models: [row.model],
      affected_os: [],
      severity: 'warn' as const,
      summary: `Recipe ${row.id} withdrawn: ${row.withdrawn!.reason}`,
      source_url: row.withdrawn!.source.startsWith('http') ? row.withdrawn!.source : '/contribute',
      source_title: row.withdrawn!.source,
    }));
}

export function proofTokS(recipe: Recipe): number | null {
  return recipe.proof[0]?.decode ?? null;
}

export function launchText(recipe: Recipe): string {
  const env = recipe.launch.env.length ? `${recipe.launch.env.join('\n')}\n` : '';
  return `${env}${recipe.launch.lines.join('\n')}\n`;
}

export function catalogPayload(list: Recipe[]) {
  return {
    as_of: '2026-10',
    label: MEASURED_LABEL,
    recipes: liveRecipes(list).map((row) => ({
      id: row.id,
      card: row.card,
      model: row.model,
      model_id: row.model_id,
      quant: row.weights.quant,
      backend: row.backend,
      build: row.build,
      rocm_version: row.rocm_version,
      gfx: row.gfx,
      override: row.override,
      ctx: row.ctx,
      decode: proofTokS(row),
      prefill: row.proof[0]?.prefill ?? null,
      tier: row.proof[0]?.tier ?? 'tested-our-rig',
      source: row.proof[0]?.source ?? '',
      calculator: row.calculator,
    })),
  };
}
