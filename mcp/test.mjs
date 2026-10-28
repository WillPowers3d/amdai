// Automated MCP stdio tests. Protocol checks are offline; Hugging Face Range
// reads and the lab-log feed skip when AMDAI_SKIP_NETWORK=1 (or SKIP_NETWORK=1).
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const SERVER = join(here, 'server.mjs');
const skipNetwork = process.env.AMDAI_SKIP_NETWORK === '1' || process.env.SKIP_NETWORK === '1';
const MODERN_META = { 'io.modelcontextprotocol/protocolVersion': '2026-07-28' };
const EXPECTED_TOOLS = ['list_quants', 'plan_fit', 'best_quant', 'radeon_measured'];

function startServer() {
  const child = spawn(process.execPath, [SERVER], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: process.env,
  });
  const pending = new Map();
  const rl = createInterface({ input: child.stdout });
  rl.on('line', (line) => {
    if (!line.trim()) return;
    let msg;
    try { msg = JSON.parse(line); } catch { return; }
    const wait = pending.get(msg.id);
    if (wait) {
      pending.delete(msg.id);
      wait.resolve(msg);
    }
  });
  child.stderr.on('data', () => {});
  function rpc(id, method, params = {}) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`timeout waiting for ${method} id=${id}`));
      }, 60_000);
      pending.set(id, {
        resolve: (msg) => { clearTimeout(timer); resolve(msg); },
      });
      child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
  }
  async function stop() {
    child.stdin.end();
    await new Promise((resolve) => {
      if (child.exitCode !== null) return resolve();
      child.once('exit', resolve);
      setTimeout(() => { child.kill('SIGTERM'); resolve(); }, 2000);
    });
  }
  return { rpc, stop };
}

describe('package metadata', () => {
  it('keeps package.json, server.json, and mcpName in sync', () => {
    const pkg = JSON.parse(readFileSync(join(here, 'package.json'), 'utf8'));
    const server = JSON.parse(readFileSync(join(here, 'server.json'), 'utf8'));
    assert.equal(pkg.name, 'amdai-fit-mcp');
    assert.equal(pkg.mcpName, 'io.github.WillPowers3d/amdai-fit');
    assert.equal(server.name, pkg.mcpName);
    assert.equal(server.version, pkg.version);
    assert.equal(server.packages[0].identifier, pkg.name);
    assert.equal(server.packages[0].version, pkg.version);
    assert.equal(server.packages[0].registryType, 'npm');
    assert.equal(server.packages[0].transport.type, 'stdio');
    assert.equal(pkg.bin['amdai-fit-mcp'], 'server.mjs');
  });
});

describe('MCP protocol', () => {
  it('tools/list returns list_quants, plan_fit, best_quant, radeon_measured', async () => {
    const s = startServer();
    try {
      const res = await s.rpc(1, 'tools/list', { _meta: MODERN_META });
      assert.ok(res.result, JSON.stringify(res));
      const names = (res.result.tools || []).map((t) => t.name);
      assert.deepEqual(names, EXPECTED_TOOLS);
    } finally {
      await s.stop();
    }
  });

  it('plan_fit refuses a Q3 file without a network call', async () => {
    const s = startServer();
    try {
      const res = await s.rpc(2, 'tools/call', {
        name: 'plan_fit',
        arguments: { repo: 'unsloth/Qwen3.6-35B-A3B-GGUF', quant: 'UD-Q3_K_XL.gguf' },
        _meta: MODERN_META,
      });
      assert.equal(res.result?.isError, true);
      assert.match(res.result.content[0].text, /Quants below Q4 are not planned by this server/);
    } finally {
      await s.stop();
    }
  });

  it('legacy initialize works for 2025-06-18', async () => {
    const s = startServer();
    try {
      const res = await s.rpc(3, 'initialize', {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'amdai-fit-mcp-test', version: '0.0.0' },
      });
      assert.equal(res.result.protocolVersion, '2025-06-18');
      assert.equal(res.result.serverInfo?.name, 'amdai-fit');
      assert.ok(res.result.capabilities?.tools);
      const listed = await s.rpc(4, 'tools/list');
      const names = (listed.result.tools || []).map((t) => t.name);
      assert.deepEqual(names, EXPECTED_TOOLS);
    } finally {
      await s.stop();
    }
  });
});

describe('network tools', { skip: skipNetwork ? 'AMDAI_SKIP_NETWORK=1' : false }, () => {
  it('list_quants returns Q4+ entries and hides below-Q4', async () => {
    const s = startServer();
    try {
      const res = await s.rpc(10, 'tools/call', {
        name: 'list_quants',
        arguments: { repo: 'unsloth/Qwen3.6-35B-A3B-GGUF' },
        _meta: MODERN_META,
      });
      assert.equal(res.result?.isError, undefined);
      const out = res.result.structuredContent;
      assert.ok(Array.isArray(out.quants) && out.quants.length > 0);
      assert.ok(out.quants.some((q) => /Q5_K_XL|Q4_K/i.test(q)));
      assert.equal(out.quants.some((q) => /(^|[^A-Z0-9])(I?Q[123](_|-|\.|$)|IQ[123])/i.test(q.split('/').pop() || q)), false);
      assert.ok(out.hiddenBelowQ4 >= 1);
    } finally {
      await s.stop();
    }
  });

  it('plan_fit returns a fits-in-vram estimate for a Q5 file on one 32 GiB card', async () => {
    const s = startServer();
    try {
      const res = await s.rpc(11, 'tools/call', {
        name: 'plan_fit',
        arguments: {
          repo: 'unsloth/Qwen3.6-35B-A3B-GGUF',
          quant: 'Qwen3.6-35B-A3B-UD-Q5_K_XL.gguf',
          gpus: 1,
          vram_gib: 32,
          ctx: 262144,
        },
        _meta: MODERN_META,
      });
      assert.equal(res.result?.isError, undefined);
      const out = res.result.structuredContent;
      assert.equal(out.verdict, 'fits-in-vram');
      assert.match(out.note, /estimate/i);
    } finally {
      await s.stop();
    }
  });

  it('radeon_measured returns lab-log matches', async () => {
    const s = startServer();
    try {
      const res = await s.rpc(12, 'tools/call', {
        name: 'radeon_measured',
        arguments: { query: '35B decode R9700' },
        _meta: MODERN_META,
      });
      assert.equal(res.result?.isError, undefined);
      const out = res.result.structuredContent;
      assert.ok(Array.isArray(out.matches) && out.matches.length > 0);
    } finally {
      await s.stop();
    }
  });
});
