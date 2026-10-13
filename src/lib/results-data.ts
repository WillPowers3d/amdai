import catalog from '../data/amdai-bench.v1.json';
import { parseAmdaiBench, type AmdaiBenchFile } from './results';

export const amdaiBenchFile: AmdaiBenchFile = parseAmdaiBench(catalog);
