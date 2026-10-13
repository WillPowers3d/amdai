import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import {
  REQUIRED_SHANNON_HREFS,
  SHANNON_CITED_LABEL,
  SHANNON_HUB_LINKS,
  SHANNON_PUBLISHED,
  assertShannonLabValid,
  loadShannonLab,
  shannonBlob,
  shannonIdea,
  shannonIdeas,
} from './shannon-lab';

const here = dirname(fileURLToPath(import.meta.url));
const file = loadShannonLab();

describe('Shannon community lab', () => {
  it('keeps the Oct 12 article and Oct 5 P100 cite, labeled not measured', () => {
    assert.deepEqual(assertShannonLabValid(file), []);
    assert.equal(file.as_of, SHANNON_PUBLISHED);
    assert.equal(file.cited_label, SHANNON_CITED_LABEL);
    assert.equal(file.article.date, '2026-10-12');
    assert.match(file.article.href, /2109744566001938923/);
    assert.equal(file.p100_post.decode, '~33 tok/s');
    assert.equal(file.p100_post.model, 'Qwen 3.8 27B');
    assert.match(file.p100_post.note, /not measured/i);
    assert.match(file.p100_post.note, /NVIDIA/);
    assert.ok(shannonIdea('radeon-vii'));
    assert.ok(shannonIdea('thermite'));
    assert.doesNotMatch(shannonIdea('thermite')!.body, /github\.com/);
    assert.equal(shannonIdeas('harnesses').length, 3);
  });

  it('keeps house rules and required hub links', () => {
    const blob = shannonBlob(file);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b|coming soon/i);
    assert.match(blob, /Q3 stays a labeled estimate/);
    assert.match(blob, /llama\.cpp first/);
    const hrefs = new Set(SHANNON_HUB_LINKS.map((link) => link.href));
    for (const required of REQUIRED_SHANNON_HREFS) {
      assert.ok(hrefs.has(required), required);
    }
    assert.equal(shouldNoindex('/labs/shannon'), false);
    assert.equal(isSitemapExcluded('/labs/shannon'), false);
    assert.ok(primaryNav.some((item) => item.href === '/labs/shannon'));
  });

  it('wires harness, hardware, secure-lab, and autoresearch pages', () => {
    const harnessYaml = readFileSync(join(here, '../data/harnesses.yaml'), 'utf8');
    const hermesPage = readFileSync(join(here, '../pages/harnesses/[slug].astro'), 'utf8');
    const harnessIndex = readFileSync(join(here, '../pages/harnesses/index.astro'), 'utf8');
    const hardware = readFileSync(join(here, '../content/guides/hardware.mdx'), 'utf8');
    const secure = readFileSync(join(here, '../pages/secure-lab.astro'), 'utf8');
    const auto = readFileSync(join(here, '../pages/autoresearch.astro'), 'utf8');
    const hub = readFileSync(join(here, '../pages/labs/shannon.astro'), 'utf8');
    assert.match(harnessYaml, /id: herdr/);
    assert.match(harnessYaml, /id: coolify/);
    assert.match(harnessYaml, /Cited, not measured by AMDai/);
    assert.match(hermesPage, /bot mode/);
    assert.match(harnessIndex, /iamMrDuncan/);
    assert.match(hardware, /Radeon VII/);
    assert.match(hardware, /not measured/i);
    assert.match(secure, /Proxmox/);
    assert.match(secure, /Cited, not measured by AMDai/);
    assert.match(auto, /Prometheus/);
    assert.match(auto, /Thermite/);
    assert.doesNotMatch(auto, /coming soon/i);
    assert.match(hub, /How I run my Lab/);
    assert.match(hub, /2109744566001938923/);
  });
});
