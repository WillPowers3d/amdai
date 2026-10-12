export type StackComponent =
  | 'rocm'
  | 'llama.cpp'
  | 'strata'
  | 'vllm'
  | 'ollama'
  | 'gfx'
  | 'model'
  | 'kernel'
  | 'backend';

export type StackSeverity = 'info' | 'warn' | 'critical';

export type StackUpdate = {
  id: string;
  date: string;
  component: StackComponent;
  affected_versions: string[];
  affected_gpus: string[];
  affected_gfx: string[];
  affected_backends: string[];
  affected_models: string[];
  affected_os: string[];
  severity: StackSeverity;
  summary: string;
  source_url: string;
  source_title: string;
  todo?: boolean;
};

export type RigModel = {
  name: string;
  quant: string;
};

export type SavedRigMatch = {
  name?: string;
  gpu?: string;
  gpuCount?: number;
  gfx?: string;
  rocmVersion?: string;
  backend?: string;
  backendVersion?: string;
  models?: RigModel[];
  os?: string;
  distro?: string;
};

export type MatchReason = {
  updateId: string;
  matched: boolean;
  reasons: string[];
};

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

export function normalizeUpdate(row: Partial<StackUpdate> & Pick<StackUpdate, 'id' | 'date' | 'component' | 'summary' | 'source_url' | 'source_title'>): StackUpdate {
  return {
    id: row.id,
    date: row.date,
    component: row.component,
    affected_versions: asStringList(row.affected_versions),
    affected_gpus: asStringList(row.affected_gpus),
    affected_gfx: asStringList(row.affected_gfx),
    affected_backends: asStringList(row.affected_backends),
    affected_models: asStringList(row.affected_models),
    affected_os: asStringList(row.affected_os),
    severity: row.severity ?? 'info',
    summary: row.summary,
    source_url: row.source_url,
    source_title: row.source_title,
    todo: Boolean(row.todo),
  };
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

function hasAnyTarget(update: StackUpdate): boolean {
  return (
    update.affected_versions.length +
      update.affected_gpus.length +
      update.affected_gfx.length +
      update.affected_backends.length +
      update.affected_models.length +
      update.affected_os.length >
    0
  );
}

/**
 * Does this update apply to this saved rig?
 * TODO rows still match (shown labeled TODO). The notify script skips emailing them.
 */
export function updateMatchesRig(update: StackUpdate, rig: SavedRigMatch): MatchReason {
  const reasons: string[] = [];

  if (update.affected_gpus.length) {
    if (listHas(update.affected_gpus, rig.gpu)) reasons.push(`gpu ${rig.gpu}`);
    else return { updateId: update.id, matched: false, reasons: ['gpu does not match'] };
  }

  if (update.affected_gfx.length) {
    if (listHas(update.affected_gfx, rig.gfx)) reasons.push(`gfx ${rig.gfx}`);
    else return { updateId: update.id, matched: false, reasons: ['gfx does not match'] };
  }

  if (update.affected_backends.length) {
    if (listHas(update.affected_backends, rig.backend)) reasons.push(`backend ${rig.backend}`);
    else return { updateId: update.id, matched: false, reasons: ['backend does not match'] };
  }

  if (update.affected_os.length) {
    const osHit = listHas(update.affected_os, rig.os) || listHas(update.affected_os, rig.distro);
    if (osHit) reasons.push(`os ${rig.os ?? rig.distro}`);
    else return { updateId: update.id, matched: false, reasons: ['os does not match'] };
  }

  if (update.affected_models.length) {
    const names = (rig.models ?? []).map((m) => m.name);
    const hit = names.find((name) => listHas(update.affected_models, name));
    if (hit) reasons.push(`model ${hit}`);
    else return { updateId: update.id, matched: false, reasons: ['model does not match'] };
  }

  if (update.affected_versions.length) {
    const versionField =
      update.component === 'rocm'
        ? rig.rocmVersion
        : rig.backendVersion || rig.rocmVersion;
    if (versionTouches(update.affected_versions, versionField)) {
      reasons.push(`version ${versionField}`);
    } else if (versionField) {
      return { updateId: update.id, matched: false, reasons: ['version does not match'] };
    }
  }

  if (reasons.length === 0 && !hasAnyTarget(update)) {
    reasons.push('applies to every saved rig');
  }

  if (reasons.length === 0) {
    if (update.component === 'rocm' && (rig.rocmVersion || rig.gfx || rig.gpu)) {
      reasons.push('ROCm-class rig');
    }
    if (update.component === 'llama.cpp' && listHas(['llama.cpp', 'llamacpp'], rig.backend)) {
      reasons.push('llama.cpp backend');
    }
    if (update.component === 'strata' && listHas(['strata'], rig.backend)) {
      reasons.push('Strata backend');
    }
    if (update.component === 'vllm' && listHas(['vllm'], rig.backend)) {
      reasons.push('vLLM backend');
    }
    if (update.component === 'ollama' && listHas(['ollama'], rig.backend)) {
      reasons.push('Ollama backend');
    }
    if (update.component === 'kernel' && (rig.os || rig.distro)) {
      reasons.push('has an OS/distro');
    }
  }

  return { updateId: update.id, matched: reasons.length > 0, reasons };
}

export function updatesForRig(rig: SavedRigMatch, updates: StackUpdate[]): StackUpdate[] {
  return updates.filter((update) => updateMatchesRig(update, rig).matched);
}

export function updatesForRigs(
  rigs: SavedRigMatch[],
  updates: StackUpdate[],
): { rig: SavedRigMatch; updates: StackUpdate[] }[] {
  return rigs.map((rig) => ({ rig, updates: updatesForRig(rig, updates) }));
}
