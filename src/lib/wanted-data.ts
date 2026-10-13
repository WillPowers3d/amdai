import { parse } from 'yaml';
import raw from '../data/wanted.yaml?raw';
import { parseWanted } from './wanted';

export const wantedFile = parseWanted(parse(raw));
