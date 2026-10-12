import { parse } from 'yaml';
import matrixRaw from '../data/version-matrix.yaml?raw';

export type MatrixStatus = 'official' | 'first_party' | 'cited' | 'no_data';

export type MatrixCard = { id: string; name: string; gfx: string };
export type MatrixRocm = { version: string; notes: string; notes_label: string };
export type MatrixEngine = { id: string; name: string };
export type MatrixCell = {
  card: string;
  rocm: string;
  engine: string;
  status: MatrixStatus;
  text: string;
  source: string;
  source_label: string;
};

export type MatrixFile = {
  as_of: string;
  cards: MatrixCard[];
  rocm: MatrixRocm[];
  engines: MatrixEngine[];
  cells: MatrixCell[];
};

export const matrixFile = parse(matrixRaw) as MatrixFile;

export function cellFor(card: string, rocm: string, engine: string): MatrixCell | undefined {
  return matrixFile.cells.find((row) => row.card === card && row.rocm === rocm && row.engine === engine);
}
