import { parse } from 'yaml';
import raw from '../data/bios.yaml?raw';
import { parseBios, type BiosFile } from './bios';

export const biosFile: BiosFile = parseBios(parse(raw));
