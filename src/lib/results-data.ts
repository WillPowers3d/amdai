import { deriveV1Catalog } from './run-card';
import { runs } from './run-card-data';
import { parseAmdaiBench, type AmdaiBenchFile } from './results';

/** Derived from verified 35B single-card llama.cpp run cards. Does not invent Flash. */
export const amdaiBenchFile: AmdaiBenchFile = parseAmdaiBench(deriveV1Catalog(runs));
