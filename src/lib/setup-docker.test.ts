import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { isSitemapExcluded, shouldNoindex } from './seo';
import {
  REQUIRED_SETUP_DOCKER_HREFS,
  SETUP_DOCKER_CITED_LABEL,
  SETUP_DOCKER_COMPOSE,
  SETUP_DOCKER_PUBLISHED,
  SETUP_DOCKER_ROCM_IMAGE,
  SETUP_DOCKER_SOURCES,
  SETUP_DOCKER_STEPS,
  SETUP_DOCKER_TRACKS,
  SETUP_DOCKER_VULKAN_IMAGE,
  assertSetupDockerValid,
  setupDockerBlob,
  setupDockerHrefs,
} from './setup-docker';

const here = dirname(fileURLToPath(import.meta.url));

describe('Docker / Podman llama.cpp setup', () => {
  it('keeps cited tracks, official images, and house rules', () => {
    assert.deepEqual(assertSetupDockerValid(), []);
    assert.equal(SETUP_DOCKER_PUBLISHED, '2026-10-14');
    assert.equal(SETUP_DOCKER_CITED_LABEL, 'Cited, not measured on local-desktop');
    assert.equal(SETUP_DOCKER_TRACKS[0]?.id, 'vulkan');
    assert.equal(SETUP_DOCKER_TRACKS[1]?.id, 'rocm');
    assert.equal(SETUP_DOCKER_TRACKS[1]?.recommend, false);
    assert.equal(SETUP_DOCKER_VULKAN_IMAGE, 'ghcr.io/ggml-org/llama.cpp:server-vulkan');
    assert.equal(SETUP_DOCKER_ROCM_IMAGE, 'ghcr.io/ggml-org/llama.cpp:server-rocm');
    assert.ok(SETUP_DOCKER_STEPS.length >= 10);
    assert.ok(SETUP_DOCKER_SOURCES.every((row) => row.href.startsWith('https://')));
    const blob = setupDockerBlob();
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/);
    assert.doesNotMatch(blob, /floor is q4|q4 floor|q4 and up only/i);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /not measured on local-desktop/i);
    assert.match(blob, /Minimum system RAM needed/);
    assert.match(blob, /RAM needed at full context/);
    assert.match(blob, /\/dev\/kfd/);
    assert.match(blob, /\/dev\/dri/);
    assert.match(SETUP_DOCKER_COMPOSE, /127\.0\.0\.1:8080:8080/);
    const hrefs = setupDockerHrefs();
    for (const required of REQUIRED_SETUP_DOCKER_HREFS) {
      assert.ok(
        hrefs.some((href) => href === required || href.startsWith(`${required}/`)),
        required,
      );
    }
  });

  it('wires the dedicated page and stays in the sitemap', () => {
    const page = readFileSync(join(here, '../pages/setup/docker.astro'), 'utf8');
    const hub = readFileSync(join(here, '../pages/setup.astro'), 'utf8');
    assert.match(page, /not measured on local-desktop/i);
    assert.match(page, /llama\.cpp/);
    assert.match(page, /Open in Stack Lab/);
    assert.match(page, /NextSteps/);
    assert.match(page, /SETUP_DOCKER_COMPOSE/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.match(hub, /\/setup\/docker/);
    assert.equal(shouldNoindex('/setup/docker'), false);
    assert.equal(isSitemapExcluded('/setup/docker'), false);
    assert.ok(primaryNav.some((item) => item.href === '/setup/docker'));
  });
});
