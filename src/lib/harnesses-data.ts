import { parse } from 'yaml';
import raw from '../data/harnesses.yaml?raw';
import { parseHarnesses, type Harness, type HarnessesFile } from './harnesses';

export const harnessesFile: HarnessesFile = parseHarnesses(parse(raw));

export function harnesses(): Harness[] {
  return harnessesFile.harnesses;
}

export function harness(id: string): Harness | undefined {
  return harnessesFile.harnesses.find((row) => row.id === id);
}
