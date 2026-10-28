import { parse } from 'yaml';
import raw from '../data/motherboards.yaml?raw';
import { parseMotherboards, type MotherboardsFile } from './motherboards';

export const motherboardsFile: MotherboardsFile = parseMotherboards(parse(raw));
export const motherboards = motherboardsFile.boards;
