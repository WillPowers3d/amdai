import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import type { SavedRigMatch } from './rig-match';
import {
  assertProblemsValid,
  filterProblems,
  forumDiscussPath,
  parseRocmProblems,
  problemMatchesRig,
  problemsForRig,
  type RocmProblem,
} from './rocm-problems';

const raw = readFileSync(new URL('../data/rocm-problems.yaml', import.meta.url), 'utf8');
const file = parseRocmProblems(parse(raw));
const problems: RocmProblem[] = file.problems;

const r9700Linux: SavedRigMatch = {
  name: 'local-desktop',
  gpu: 'Radeon AI PRO R9700',
  gfx: 'gfx1201',
  rocmVersion: '10.1.0',
  backend: 'llama.cpp',
  os: 'Linux',
  distro: 'Ubuntu',
};

const ollamaWindows: SavedRigMatch = {
  name: 'windows box',
  gpu: 'R9700',
  gfx: 'gfx1201',
  backend: 'ollama',
  os: 'Windows',
};

const gfx1031: SavedRigMatch = {
  name: '6750',
  gpu: 'RX 6750 XT',
  gfx: 'gfx1031',
  backend: 'llama.cpp',
  os: 'Linux',
};

describe('ROCm problems tracker', () => {
  it('seeds unique cited rows and never uses reserved page slugs', () => {
    assert.ok(file.as_of);
    assert.ok(problems.length >= 8);
    const errors = assertProblemsValid(file);
    assert.deepEqual(errors, []);
    const ids = problems.map((row) => row.id);
    assert.ok(ids.includes('ollama-r9700-windows'));
    assert.ok(ids.includes('ollama-gfx1201-tensile'));
    assert.ok(ids.includes('hsa-override-unofficial'));
    assert.ok(ids.includes('mode1-reset-gfx12'));
    assert.ok(ids.includes('windows-wsl-preview'));
  });

  it('only cites http(s) upstream links and marks the fine-tune KI as TODO', () => {
    for (const problem of problems) {
      assert.ok(problem.upstream.length, problem.id);
      for (const link of problem.upstream) {
        assert.match(link.href, /^https:\/\//, `${problem.id} ${link.title}`);
      }
    }
    const todo = problems.find((row) => row.id === 'rocm-10-0-finetune-reset');
    assert.equal(todo?.todo, true);
    assert.match(todo?.workaround ?? '', /TODO/);
  });

  it('filters by GPU, OS, and status without inventing rows', () => {
    const gfx = filterProblems(problems, { gpu: 'gfx1201' });
    assert.ok(gfx.some((row) => row.id === 'ollama-r9700-windows'));
    assert.ok(gfx.every((row) => row.affected_gfx.includes('gfx1201') || row.affected_gfx.length === 0));

    const windows = filterProblems(problems, { os: 'Windows' });
    assert.ok(windows.some((row) => row.id === 'windows-wsl-preview'));
    assert.ok(windows.every((row) => row.affected_os.includes('Windows') || row.affected_os.includes('WSL') || row.affected_os.length === 0));

    const open = filterProblems(problems, { status: 'open' });
    assert.ok(open.every((row) => row.status === 'open'));
    assert.ok(open.some((row) => row.id === 'mode1-reset-gfx12'));
  });

  it('matches saved rigs the same way stack updates do', () => {
    const windowsHits = problemsForRig(ollamaWindows, problems).map((row) => row.id);
    assert.ok(windowsHits.includes('ollama-r9700-windows'));
    assert.ok(windowsHits.includes('hsa-override-unofficial'));
    assert.ok(!windowsHits.includes('ollama-gfx1201-tensile'));

    const linuxHits = problemsForRig(r9700Linux, problems).map((row) => row.id);
    assert.ok(linuxHits.includes('mode1-reset-gfx12'));
    assert.ok(linuxHits.includes('ubuntu-rocm-package-shadow'));
    assert.ok(!linuxHits.includes('ollama-r9700-windows'));
    assert.ok(!linuxHits.includes('gfx1031-hsa-override'));

    const old = problemMatchesRig(
      problems.find((row) => row.id === 'gfx1031-hsa-override')!,
      gfx1031,
    );
    assert.equal(old.matched, true);
    assert.ok(old.reasons.some((reason) => reason.includes('gfx1031')));
  });

  it('builds a site-relative Discuss in forum URL with the problem prefilled', () => {
    const problem = problems.find((row) => row.id === 'mode1-reset-gfx12')!;
    const href = forumDiscussPath(problem);
    assert.ok(href.startsWith('/forum/new?'));
    assert.ok(href.includes('pattern=mode1-reset-gfx12'));
    assert.ok(href.includes('category=hardware-builds'));
    assert.ok(!href.includes('://'));
  });
});
