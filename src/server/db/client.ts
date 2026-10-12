import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { databasePath, requireAccounts } from '../config';

type SqlRunner = {
  exec: (sql: string) => void;
  prepare: (sql: string) => { run: (...args: unknown[]) => void; all: (...args: unknown[]) => unknown[]; get: (...args: unknown[]) => unknown };
};

let sqlite: DatabaseSync | null = null;

export function getSqlite(): DatabaseSync {
  requireAccounts();
  if (sqlite) return sqlite;
  const path = resolve(databasePath());
  mkdirSync(dirname(path), { recursive: true });
  sqlite = new DatabaseSync(path);
  sqlite.exec('PRAGMA journal_mode = WAL;');
  sqlite.exec('PRAGMA foreign_keys = ON;');
  sqlite.exec(readFileSync(new URL('./migrations/0001_init.sql', import.meta.url), 'utf8'));
  return sqlite;
}

/** Drizzle-shaped helper used by session/users/rigs. */
export function getDb() {
  const db = getSqlite();
  return {
    sqlite: db,
    insert: () => {
      throw new Error('use getSqlite()');
    },
  };
}

export function sqlAll<T>(query: string, params: unknown[] = []): T[] {
  return getSqlite().prepare(query).all(...params) as T[];
}

export function sqlGet<T>(query: string, params: unknown[] = []): T | undefined {
  return getSqlite().prepare(query).get(...params) as T | undefined;
}

export function sqlRun(query: string, params: unknown[] = []): void {
  getSqlite().prepare(query).run(...params);
}

export type { SqlRunner };
