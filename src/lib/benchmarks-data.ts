import { parse } from 'yaml';
import raw from '../data/benchmarks.yaml?raw';
import { parseBenchmarks, type BenchmarksFile } from './benchmarks';

export const benchmarksFile: BenchmarksFile = parseBenchmarks(parse(raw));
