import { parse } from 'yaml';
import raw from '../data/local-desktop-dual.yaml?raw';
import { parseLocalDesktopDual, type DualFile } from './local-desktop-dual';

export const localDesktopDual: DualFile = parseLocalDesktopDual(parse(raw));
