import { parse } from 'yaml';
import raw from '../data/rocm-problems.yaml?raw';
import { parseRocmProblems, type RocmProblem, type RocmProblemsFile } from './rocm-problems';

export const rocmProblemsFile: RocmProblemsFile = parseRocmProblems(parse(raw));

export function rocmProblems(): RocmProblem[] {
  return rocmProblemsFile.problems;
}

export function rocmProblem(id: string): RocmProblem | undefined {
  return rocmProblemsFile.problems.find((row) => row.id === id);
}
