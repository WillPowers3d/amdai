import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUYER_PAGE_BASELINE, pageHashModified } from './page-hashes';

const here = dirname(fileURLToPath(import.meta.url));

describe('buyer-page freshness', () => {
  it('falls back to the 2026-10-30 baseline when a can-run row has no hash', () => {
    assert.equal(BUYER_PAGE_BASELINE, '2026-10-30');
    assert.equal(pageHashModified('/can-run/missing-row', '2026-10-14'), BUYER_PAGE_BASELINE);
    assert.equal(pageHashModified('/compare/missing-row', '2026-10-14'), BUYER_PAGE_BASELINE);
    assert.equal(pageHashModified('/faq-not-in-manifest', '2026-10-16'), '2026-10-16');
  });

  it('passes the freshness manifest selftest', () => {
    const script = join(here, '../../scripts/freshness_manifest.py');
    const out = execFileSync('python3', [script, '--selftest'], { encoding: 'utf8' });
    assert.match(out, /selftest ok/);
  });
});
