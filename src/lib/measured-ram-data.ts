import { measuredRamHitsFromRuns } from './run-card';
import { runs } from './run-card-data';

/** Official 35B peak_system_ram_gb points for the calculator RAM lines. */
export const measuredRamHits = measuredRamHitsFromRuns(runs);
