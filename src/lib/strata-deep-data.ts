import { parse } from 'yaml';
import raw from '../data/strata-deep.yaml?raw';
import { parseStrataDeep, type StrataDeepFile } from './strata-deep';

export const strataDeep: StrataDeepFile = parseStrataDeep(parse(raw));
