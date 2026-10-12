import { sqlAll, sqlGet, sqlRun } from './db/client';
import { newId, newToken } from './crypto';
import { assertQuantAllowed } from '../lib/quant-guard';
import type { RigModel, SavedRigMatch } from '../lib/rig-match';

const BACKENDS = ['llama.cpp', 'strata', 'vllm', 'ollama', 'lmstudio', 'other'] as const;

export type RigInput = {
  name: string;
  gpu: string;
  gpuCount: number;
  vramGb: number;
  ramGb: number;
  gfx?: string;
  cpu?: string;
  os?: string;
  distro?: string;
  rocmVersion?: string;
  backend: string;
  backendVersion?: string;
  models: RigModel[];
  context: number;
  priority: string;
  usage: string;
  style: string;
  shareQuery?: string;
};

export type RigRow = {
  id: string;
  user_id: string;
  name: string;
  gpu: string;
  gpu_count: number;
  vram_gb: number;
  ram_gb: number;
  gfx: string | null;
  cpu: string | null;
  os: string | null;
  distro: string | null;
  rocm_version: string | null;
  backend: string;
  backend_version: string | null;
  models_json: string;
  context: number;
  priority: string;
  usage: string;
  style: string;
  share_query: string | null;
  rss_token: string;
  created_at: number;
  updated_at: number;
};

export function parseModels(json: string): RigModel[] {
  try {
    const parsed = JSON.parse(json) as RigModel[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function validateRig(body: Partial<RigInput>): RigInput {
  const name = (body.name ?? '').trim();
  if (!name) throw new Error('Name is required.');
  const gpu = (body.gpu ?? '').trim();
  if (!gpu) throw new Error('GPU is required.');
  const backend = (body.backend ?? 'llama.cpp').trim();
  if (!BACKENDS.includes(backend as (typeof BACKENDS)[number])) throw new Error('Unknown backend.');
  const models = (body.models ?? []).map((m) => ({
    name: (m.name ?? '').trim(),
    quant: assertQuantAllowed(m.quant ?? ''),
  }));
  if (models.some((m) => !m.name)) throw new Error('Each model needs a name.');
  return {
    name,
    gpu,
    gpuCount: Math.min(4, Math.max(1, Number(body.gpuCount) || 1)),
    vramGb: Math.max(1, Number(body.vramGb) || 1),
    ramGb: Math.max(0, Number(body.ramGb) || 0),
    gfx: body.gfx?.trim() || '',
    cpu: body.cpu?.trim() || '',
    os: body.os?.trim() || '',
    distro: body.distro?.trim() || '',
    rocmVersion: body.rocmVersion?.trim() || '',
    backend,
    backendVersion: body.backendVersion?.trim() || '',
    models,
    context: Math.max(1, Number(body.context) || 4096),
    priority: body.priority === 'size' ? 'size' : 'speed',
    usage: body.usage === 'hybrid' ? 'hybrid' : 'local',
    style: body.style === 'abliterated' ? 'abliterated' : 'standard',
    shareQuery: body.shareQuery ?? '',
  };
}

export function toMatch(row: RigRow): SavedRigMatch {
  return {
    name: row.name,
    gpu: row.gpu,
    gfx: row.gfx ?? undefined,
    rocmVersion: row.rocm_version ?? undefined,
    backend: row.backend,
    backendVersion: row.backend_version ?? undefined,
    models: parseModels(row.models_json),
    os: row.os ?? undefined,
    distro: row.distro ?? undefined,
  };
}

export function toPublic(row: RigRow) {
  return {
    id: row.id,
    name: row.name,
    gpu: row.gpu,
    gpuCount: row.gpu_count,
    vramGb: row.vram_gb,
    ramGb: row.ram_gb,
    gfx: row.gfx,
    cpu: row.cpu,
    os: row.os,
    distro: row.distro,
    rocmVersion: row.rocm_version,
    backend: row.backend,
    backendVersion: row.backend_version,
    models: parseModels(row.models_json),
    context: row.context,
    priority: row.priority,
    usage: row.usage,
    style: row.style,
    shareQuery: row.share_query,
    rssToken: row.rss_token,
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function listRigs(userId: string): Promise<RigRow[]> {
  return sqlAll<RigRow>('SELECT * FROM rigs WHERE user_id = ?', [userId]);
}

export async function insertRig(userId: string, input: RigInput): Promise<RigRow> {
  const now = Date.now();
  const row: RigRow = {
    id: newId('rig'),
    user_id: userId,
    name: input.name,
    gpu: input.gpu,
    gpu_count: input.gpuCount,
    vram_gb: input.vramGb,
    ram_gb: input.ramGb,
    gfx: input.gfx || null,
    cpu: input.cpu || null,
    os: input.os || null,
    distro: input.distro || null,
    rocm_version: input.rocmVersion || null,
    backend: input.backend,
    backend_version: input.backendVersion || null,
    models_json: JSON.stringify(input.models),
    context: input.context,
    priority: input.priority,
    usage: input.usage,
    style: input.style,
    share_query: input.shareQuery || null,
    rss_token: newToken(),
    created_at: now,
    updated_at: now,
  };
  sqlRun(
    `INSERT INTO rigs (id, user_id, name, gpu, gpu_count, vram_gb, ram_gb, gfx, cpu, os, distro, rocm_version, backend, backend_version, models_json, context, priority, usage, style, share_query, rss_token, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id, row.user_id, row.name, row.gpu, row.gpu_count, row.vram_gb, row.ram_gb, row.gfx, row.cpu, row.os, row.distro,
      row.rocm_version, row.backend, row.backend_version, row.models_json, row.context, row.priority, row.usage, row.style,
      row.share_query, row.rss_token, row.created_at, row.updated_at,
    ],
  );
  return row;
}

export async function updateRig(userId: string, id: string, input: RigInput) {
  sqlRun(
    `UPDATE rigs SET name=?, gpu=?, gpu_count=?, vram_gb=?, ram_gb=?, gfx=?, cpu=?, os=?, distro=?, rocm_version=?, backend=?, backend_version=?, models_json=?, context=?, priority=?, usage=?, style=?, share_query=?, updated_at=?
     WHERE id=? AND user_id=?`,
    [
      input.name, input.gpu, input.gpuCount, input.vramGb, input.ramGb, input.gfx || null, input.cpu || null, input.os || null,
      input.distro || null, input.rocmVersion || null, input.backend, input.backendVersion || null, JSON.stringify(input.models),
      input.context, input.priority, input.usage, input.style, input.shareQuery || null, Date.now(), id, userId,
    ],
  );
}

export async function deleteRig(userId: string, id: string) {
  sqlRun('DELETE FROM rigs WHERE id = ? AND user_id = ?', [id, userId]);
}

export function findRigByRss(token: string): RigRow | undefined {
  return sqlGet<RigRow>('SELECT * FROM rigs WHERE rss_token = ?', [token]);
}
