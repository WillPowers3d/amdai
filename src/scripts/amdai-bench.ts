#!/usr/bin/env npx tsx
/**
 * Stack Lab / overnight emitter for amdai-bench/run@1.
 * One JSON object per jsonl line. Validates against the published schema.
 *
 *   npx tsx src/scripts/amdai-bench.ts validate [files...]
 *   npx tsx src/scripts/amdai-bench.ts emit            # stdin JSON → one card
 *   npx tsx src/scripts/amdai-bench.ts append <file>   # stdin JSON → append jsonl
 */

import { appendFileSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RUN_SCHEMA,
  assertRunSetValid,
  emitRunCard,
  parseJsonl,
  parseRunCard,
  runCardToJsonl,
  schemaDocument,
  type RunCard,
} from '../lib/run-card';

function readStdin(): string {
  return readFileSync(0, 'utf8');
}

function defaultJsonlFiles(): string[] {
  const here = fileURLToPath(import.meta.url);
  const root = join(dirname(here), '../../data/runs');
  try {
    if (!statSync(root).isDirectory()) return [];
  } catch {
    return [];
  }
  return readdirSync(root)
    .filter((name) => name.endsWith('.jsonl'))
    .map((name) => join(root, name));
}

function loadFiles(paths: string[]): RunCard[] {
  const cards: RunCard[] = [];
  for (const file of paths) {
    cards.push(...parseJsonl(readFileSync(file, 'utf8'), file));
  }
  return cards;
}

function validate(paths: string[]): void {
  const files = paths.length ? paths : defaultJsonlFiles();
  if (!files.length) {
    console.error('no jsonl files');
    process.exit(1);
  }
  const cards = loadFiles(files);
  const errors = assertRunSetValid(cards);
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log(`ok ${cards.length} cards · schema ${RUN_SCHEMA} · ${files.length} file(s)`);
}

function emit(): void {
  const raw = JSON.parse(readStdin()) as unknown;
  const card = emitRunCard(raw as Omit<RunCard, 'schema'>);
  process.stdout.write(`${JSON.stringify(card, null, 2)}\n`);
}

function append(file: string): void {
  if (!file) {
    console.error('append needs a jsonl path');
    process.exit(1);
  }
  const raw = JSON.parse(readStdin()) as unknown;
  const card = parseRunCard({ ...(raw as object), schema: RUN_SCHEMA }, file);
  appendFileSync(file, runCardToJsonl(card));
  console.log(`appended ${card.run_id} → ${file}`);
}

function help(): void {
  const schema = schemaDocument();
  process.stdout.write(
    [
      `amdai-bench · ${RUN_SCHEMA}`,
      `schema $id: ${String(schema.$id ?? '')}`,
      '',
      'validate [files...]   check jsonl (defaults to data/runs/*.jsonl)',
      'emit                  stdin JSON → one official card on stdout',
      'append <file>         stdin JSON → append one jsonl line',
      '',
    ].join('\n'),
  );
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === 'validate') validate(rest);
else if (cmd === 'emit') emit();
else if (cmd === 'append') append(rest[0] ?? '');
else help();
