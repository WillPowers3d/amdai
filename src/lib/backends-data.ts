import { parse } from 'yaml';
import raw from '../data/backends.yaml?raw';
import { parseBackends, type Backend, type BackendsFile } from './backends';

export const backendsFile: BackendsFile = parseBackends(parse(raw));

export function backends(): Backend[] {
  return backendsFile.engines;
}

export function backend(id: string): Backend | undefined {
  return backendsFile.engines.find((row) => row.id === id);
}
