import { parse } from 'yaml';
import stackUpdatesRaw from '../data/stack-updates.yaml?raw';
import { normalizeUpdate, type StackUpdate } from './rig-match';

export type { StackComponent, StackSeverity, StackUpdate, SavedRigMatch, RigModel, MatchReason } from './rig-match';
export { updateMatchesRig, updatesForRig, updatesForRigs, normalizeUpdate } from './rig-match';

export type StackUpdatesFile = {
  as_of: string;
  updates: StackUpdate[];
};

export function parseStackUpdates(raw: string): StackUpdatesFile {
  const parsed = parse(raw) as { as_of?: string; updates?: Parameters<typeof normalizeUpdate>[0][] };
  return {
    as_of: parsed.as_of ?? '',
    updates: (parsed.updates ?? []).map((row) => normalizeUpdate(row)),
  };
}

export const stackUpdatesFile = parseStackUpdates(stackUpdatesRaw);

export function stackUpdates(): StackUpdate[] {
  return stackUpdatesFile.updates;
}
