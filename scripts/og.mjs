/**
 * Deprecated launcher. Prefer `npm run og` (`tsx src/scripts/og.ts`).
 * Catalog and measured ledes live in src/lib/og.ts — do not duplicate them here.
 */
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const child = spawn(process.execPath, ['--import', 'tsx', join(root, 'src/scripts/og.ts'), ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: root,
});
child.on('exit', (code) => process.exit(code ?? 1));
