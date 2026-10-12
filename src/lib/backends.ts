import { parse } from 'yaml';
import backendsRaw from '../data/backends.yaml?raw';

export type BackendVerdict = 'default' | 'ok' | 'try' | 'advanced' | 'caution';

export type Backend = {
  id: string;
  name: string;
  short: string;
  verdict: BackendVerdict;
  backends: string;
  best_for: string;
  worst_for: string;
  rocm: string;
  caveats: string;
  when: string;
  href: string;
};

export type BackendsFile = {
  as_of: string;
  default_id: string;
  backends: Backend[];
};

export const backendsFile = parse(backendsRaw) as BackendsFile;
export const backends = backendsFile.backends;

export const verdictLabel: Record<BackendVerdict, string> = {
  default: 'Start here',
  ok: 'Fine second path',
  try: 'Measured try',
  advanced: 'Advanced / experimental',
  caution: 'Use with eyes open',
};
