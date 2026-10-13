/**
 * Motherboard BIOS notes. Logic lives here so tests never import YAML via ?raw.
 * Every claim must carry a citation id or todo: true. Board rows are submissions only.
 */

export type BiosSource = {
  title: string;
  href: string;
  publisher: string;
};

export type BiosClaim = {
  text: string;
  cite?: string;
  todo?: boolean;
};

export type BiosSetting = {
  id: string;
  title: string;
  topic: string;
  summary: string;
  claims: BiosClaim[];
};

export type BiosChipset = {
  id: string;
  name: string;
  socket: string;
  vendor: string;
  graphics: string;
  nvme: string;
  usable_pcie: string;
  expo_xmp: string;
  usb4: string;
  cite: string;
  notes: BiosClaim[];
};

export type BiosBoard = {
  id: string;
  vendor: string;
  model: string;
  chipset: string;
  bios_version: string;
  submitter: string;
  as_of: string;
  notes: string;
  cite?: string;
  todo?: boolean;
};

export type BiosFile = {
  as_of: string;
  rule: string;
  sources: Record<string, BiosSource>;
  settings: BiosSetting[];
  chipsets: BiosChipset[];
  boards: BiosBoard[];
  submit: {
    forum: string;
    file: string;
    fields: string[];
  };
};

export const REQUIRED_CHIPSETS = ['x870e', 'x670e', 'b650', 'z890'] as const;
export const REQUIRED_SETTING_IDS = [
  'above-4g',
  'rebar-sam',
  'csm',
  'pcie-gen-bifurcation',
  'expo-xmp',
  'iommu-sriov',
  'power-cstates',
  'fan-aspm',
] as const;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asClaims(value: unknown): BiosClaim[] {
  if (!Array.isArray(value)) return [];
  const claims: BiosClaim[] = [];
  for (const row of value) {
    const rec = asRecord(row);
    const text = asString(rec.text).trim();
    if (!text) continue;
    claims.push({
      text,
      cite: typeof rec.cite === 'string' ? rec.cite : undefined,
      todo: Boolean(rec.todo),
    });
  }
  return claims;
}

export function parseBios(raw: unknown): BiosFile {
  const rec = asRecord(raw);
  const sourcesRaw = asRecord(rec.sources);
  const sources: Record<string, BiosSource> = {};
  for (const [id, value] of Object.entries(sourcesRaw)) {
    const src = asRecord(value);
    sources[id] = {
      title: asString(src.title),
      href: asString(src.href),
      publisher: asString(src.publisher),
    };
  }

  const settings: BiosSetting[] = [];
  if (Array.isArray(rec.settings)) {
    for (const row of rec.settings) {
      const item = asRecord(row);
      settings.push({
        id: asString(item.id),
        title: asString(item.title),
        topic: asString(item.topic),
        summary: asString(item.summary),
        claims: asClaims(item.claims),
      });
    }
  }

  const chipsets: BiosChipset[] = [];
  if (Array.isArray(rec.chipsets)) {
    for (const row of rec.chipsets) {
      const item = asRecord(row);
      chipsets.push({
        id: asString(item.id),
        name: asString(item.name),
        socket: asString(item.socket),
        vendor: asString(item.vendor),
        graphics: asString(item.graphics),
        nvme: asString(item.nvme),
        usable_pcie: asString(item.usable_pcie),
        expo_xmp: asString(item.expo_xmp),
        usb4: asString(item.usb4),
        cite: asString(item.cite),
        notes: asClaims(item.notes),
      });
    }
  }

  const boards: BiosBoard[] = [];
  if (Array.isArray(rec.boards)) {
    for (const row of rec.boards) {
      const item = asRecord(row);
      boards.push({
        id: asString(item.id),
        vendor: asString(item.vendor),
        model: asString(item.model),
        chipset: asString(item.chipset),
        bios_version: asString(item.bios_version),
        submitter: asString(item.submitter),
        as_of: asString(item.as_of),
        notes: asString(item.notes),
        cite: typeof item.cite === 'string' ? item.cite : undefined,
        todo: Boolean(item.todo),
      });
    }
  }

  const submitRec = asRecord(rec.submit);
  const file: BiosFile = {
    as_of: asString(rec.as_of),
    rule: asString(rec.rule),
    sources,
    settings,
    chipsets,
    boards,
    submit: {
      forum: asString(submitRec.forum),
      file: asString(submitRec.file),
      fields: Array.isArray(submitRec.fields)
        ? submitRec.fields.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        : [],
    },
  };

  const errors = assertBiosValid(file);
  if (errors.length) throw new Error(`bios.yaml: ${errors.join('; ')}`);
  return file;
}

export function claimIsGrounded(claim: BiosClaim): boolean {
  return Boolean(claim.cite) || claim.todo === true;
}

export function sourceOf(file: BiosFile, id: string | undefined): BiosSource | undefined {
  if (!id) return undefined;
  return file.sources[id];
}

export function boardsForChipset(file: BiosFile, chipsetId: string): BiosBoard[] {
  return file.boards.filter((board) => board.chipset === chipsetId);
}

export function assertBiosValid(file: BiosFile): string[] {
  const errors: string[] = [];
  if (!file.as_of) errors.push('missing as_of');
  if (!file.rule) errors.push('missing rule');
  if (!file.submit.forum.startsWith('/forum/')) errors.push('submit.forum must be a /forum path');
  if (!file.submit.file.endsWith('bios.yaml')) errors.push('submit.file must point at bios.yaml');

  for (const [id, source] of Object.entries(file.sources)) {
    if (!source.title || source.title.length < 4) errors.push(`source ${id} missing title`);
    if (!/^https:\/\//.test(source.href)) errors.push(`source ${id} must be https`);
    if (!source.publisher) errors.push(`source ${id} missing publisher`);
  }

  const settingIds = new Set<string>();
  for (const setting of file.settings) {
    if (!setting.id || settingIds.has(setting.id)) errors.push(`bad or duplicate setting ${setting.id}`);
    settingIds.add(setting.id);
    if (!setting.claims.length) errors.push(`${setting.id} has no claims`);
    for (const [index, claim] of setting.claims.entries()) {
      if (!claimIsGrounded(claim)) errors.push(`${setting.id} claim ${index} needs a cite or todo`);
      if (claim.cite && !file.sources[claim.cite]) errors.push(`${setting.id} unknown cite ${claim.cite}`);
    }
  }
  for (const required of REQUIRED_SETTING_IDS) {
    if (!settingIds.has(required)) errors.push(`missing setting ${required}`);
  }

  const chipsetIds = new Set<string>();
  for (const chipset of file.chipsets) {
    if (!chipset.id || chipsetIds.has(chipset.id)) errors.push(`bad or duplicate chipset ${chipset.id}`);
    chipsetIds.add(chipset.id);
    if (!file.sources[chipset.cite]) errors.push(`${chipset.id} unknown chipset cite`);
    if (!chipset.notes.length) errors.push(`${chipset.id} has no notes`);
    for (const [index, note] of chipset.notes.entries()) {
      if (!claimIsGrounded(note)) errors.push(`${chipset.id} note ${index} needs a cite or todo`);
      if (note.cite && !file.sources[note.cite]) errors.push(`${chipset.id} unknown note cite ${note.cite}`);
    }
  }
  for (const required of REQUIRED_CHIPSETS) {
    if (!chipsetIds.has(required)) errors.push(`missing chipset ${required}`);
  }

  const boardIds = new Set<string>();
  for (const board of file.boards) {
    if (!board.id || boardIds.has(board.id)) errors.push(`bad or duplicate board ${board.id}`);
    boardIds.add(board.id);
    if (!chipsetIds.has(board.chipset)) errors.push(`board ${board.id} unknown chipset`);
    if (!board.cite && !board.todo) errors.push(`board ${board.id} needs a cite or todo`);
    if (board.cite && !file.sources[board.cite] && !/^https:\/\//.test(board.cite)) {
      errors.push(`board ${board.id} cite must be a source id or https URL`);
    }
  }

  return errors;
}
