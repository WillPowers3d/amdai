import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FETCH_TIMEOUT_MS, loadCatalog, loadSnapshotCatalog } from '../catalog.mjs';

describe('amdai-fit-mcp catalog loader', () => {
  it('loads the bundled snapshot with every v1 file', () => {
    const catalog = loadSnapshotCatalog();
    assert.equal(catalog.source, 'snapshot');
    for (const name of ['index', 'gpus', 'models', 'stacks', 'measured', 'rocm-issues', 'backends']) {
      assert.ok(catalog[name], name);
      assert.equal(catalog[name].schema_version, '1.0');
    }
    assert.ok(catalog.gpus.gpus.length > 0);
    assert.ok(catalog.models.models.length > 0);
  });

  it('falls back to the snapshot when live fetch times out', async () => {
    const fetchImpl = () =>
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('aborted')), 5);
      });
    const catalog = await loadCatalog({ fetchImpl, timeoutMs: 20 });
    assert.ok(catalog.source === 'snapshot' || catalog.source === 'mixed');
    assert.ok(catalog.gpus.gpus.length > 0);
    assert.ok(FETCH_TIMEOUT_MS <= 3000);
  });
});
