import { parse } from 'yaml';
import raw from '../data/local-desktop-dual.yaml?raw';
import { parselocal-desktopDual, type DualFile } from './local-desktop-dual';

export const local-desktopDual: DualFile = parselocal-desktopDual(parse(raw));
