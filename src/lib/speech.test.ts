import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SPEECH_CITED_LABEL,
  SPEECH_DESCRIPTION,
  SPEECH_FIT_ROWS,
  SPEECH_MODELS,
  SPEECH_SPEED_LABEL,
  SPEECH_TITLE,
  assertSpeechValid,
  speechBlob,
  speechHrefs,
} from './speech';

const here = dirname(fileURLToPath(import.meta.url));

describe('local speech guide', () => {
  it('stays cited, whisper.cpp-first, and invents no speeds', () => {
    assert.deepEqual(assertSpeechValid(), []);
    assert.equal(SPEECH_TITLE, 'Local speech on Radeon');
    assert.equal(SPEECH_CITED_LABEL, 'Cited, not measured on local-desktop');
    assert.equal(SPEECH_SPEED_LABEL, 'not yet measured by AMDai');
    assert.ok(SPEECH_DESCRIPTION.length >= 70);
    assert.ok(SPEECH_DESCRIPTION.length <= 160);
    const blob = speechBlob();
    assert.match(blob, /whisper\.cpp/);
    assert.match(blob, /Piper/);
    assert.match(blob, /llama\.cpp/);
    assert.match(blob, /not yet measured by AMDai/);
    assert.match(blob, /estimate/i);
    assert.match(blob, /~273 MB/);
    assert.match(blob, /~3\.9 GB/);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /TODO|TBD|FIXME|coming soon/i);
    assert.doesNotMatch(blob, /\$\d|\bMSRP\b/);
    const hrefs = speechHrefs();
    for (const href of ['/gpus/r9700', '/gpus/strix-halo', '/setup/windows', '/multi-gpu', '/calculator', '/stack-lab']) {
      assert.ok(hrefs.includes(href), href);
    }
    assert.ok(SPEECH_FIT_ROWS.every((row) => row.speed === SPEECH_SPEED_LABEL));
    assert.equal(SPEECH_MODELS.length, 5);
  });

  it('is a real page with NextSteps and the Speech Stack Lab workload CTA', () => {
    const page = readFileSync(join(here, '../pages/speech.astro'), 'utf8');
    assert.match(page, /NextSteps/);
    assert.match(page, /OpenInStackLab/);
    assert.match(page, /HOUSE_STACK_LAB\.speech/);
    assert.doesNotMatch(page, /HOUSE_STACK_LAB\.(daily|flash|reliable|fastAgent)/);
    assert.doesNotMatch(page, /coming soon/i);
    assert.doesNotMatch(page, /Qwen2\.5|Qwen3-8B/);
  });
});
