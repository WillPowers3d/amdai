import { parse } from 'yaml';
import raw from '../data/flash-daily.yaml?raw';
import { parseFlashDaily, type FlashDailyFile } from './flash-daily';

export const flashDaily: FlashDailyFile = parseFlashDaily(parse(raw));
