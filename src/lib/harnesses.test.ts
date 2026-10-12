import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import {
  assertHarnessesValid,
  curlSnippet,
  endpointSet,
  harnessesByCategory,
  harnessPath,
  harnessSnippet,
  hybridLabel,
  parseHarnesses,
  parseQuizAnswers,
  parseQuizCombo,
  pickHarness,
  quizCombo,
  quizCombos,
  quizHasAnswers,
  quizResultPath,
  usedOnOurRig,
  type Harness,
} from './harnesses';

const raw = readFileSync(new URL('../data/harnesses.yaml', import.meta.url), 'utf8');
const file = parseHarnesses(parse(raw));
const list: Harness[] = file.harnesses;

describe('harness catalog', () => {
  it('seeds unique cited rows and never uses reserved page slugs', () => {
    assert.ok(file.as_of);
    assert.equal(file.llama_server_port, 8080);
    assert.equal(file.strata_port, 8083);
    assert.ok(list.length >= 19);
    assert.deepEqual(assertHarnessesValid(file), []);
    const ids = list.map((row) => row.id);
    assert.ok(ids.includes('hermes'));
    assert.ok(ids.includes('openhands'));
    assert.ok(ids.includes('cursor'));
    assert.ok(ids.includes('comfyui'));
    assert.ok(!ids.includes('compare'));
    assert.ok(!ids.includes('quiz'));
  });

  it('only cites http(s) sources and marks Hermes as used on our rig', () => {
    const hermes = list.find((row) => row.id === 'hermes');
    assert.equal(hermes?.used_on_our_rig, true);
    assert.deepEqual(
      usedOnOurRig(list).map((row) => row.id),
      ['hermes'],
    );
    for (const row of list) {
      assert.ok(row.sources.length, row.id);
      for (const source of row.sources) {
        assert.match(source.href, /^https:\/\//, `${row.id} ${source.title}`);
      }
    }
  });

  it('groups categories without inventing rows', () => {
    const agents = harnessesByCategory(list, 'agent');
    const chat = harnessesByCategory(list, 'chat');
    const image = harnessesByCategory(list, 'image');
    assert.ok(agents.some((row) => row.id === 'hermes'));
    assert.ok(agents.some((row) => row.id === 'claude-code'));
    assert.ok(chat.some((row) => row.id === 'open-webui'));
    assert.ok(chat.some((row) => row.id === 'llamacpp-webui'));
    assert.deepEqual(
      image.map((row) => row.id),
      ['comfyui'],
    );
    assert.equal(agents.length + chat.length + image.length, list.length);
    assert.equal(hybridLabel(list.find((row) => row.id === 'cursor')!), 'Hybrid-shaped');
    assert.equal(hybridLabel(list.find((row) => row.id === 'llamacpp-webui')!), 'Local only');
    assert.equal(harnessPath('hermes'), '/harnesses/hermes');
  });
});

describe('pick a harness quiz', () => {
  it('parses GET answers and ignores junk', () => {
    const answers = parseQuizAnswers('?job=agent&usage=local&surface=cli&tools=yes&extra=1');
    assert.deepEqual(answers, { job: 'agent', usage: 'local', surface: 'cli', tools: 'yes' });
    assert.equal(quizHasAnswers(parseQuizAnswers('')), false);
    assert.equal(parseQuizAnswers('?job=nope').job, undefined);
    assert.deepEqual(parseQuizCombo('chat-hybrid-desktop-no'), {
      job: 'chat',
      usage: 'hybrid',
      surface: 'desktop',
      tools: 'no',
    });
    assert.equal(quizCombo({ job: 'agent' }), 'agent-local-cli-yes');
    assert.equal(quizCombos().length, 48);
    assert.ok(quizCombos().includes('image-local-web-no'));
    assert.equal(quizResultPath({ job: 'image' }), '/harnesses/quiz/image-local-cli-yes');
  });

  it('routes image, chat, and agent surfaces to cited primaries', () => {
    assert.equal(pickHarness({ job: 'image' }, list).primary.id, 'comfyui');
    assert.equal(pickHarness({ job: 'chat', surface: 'desktop' }, list).primary.id, 'lm-studio');
    assert.equal(pickHarness({ job: 'chat', surface: 'web' }, list).primary.id, 'open-webui');
    assert.equal(pickHarness({ job: 'agent', surface: 'ide' }, list).primary.id, 'continue');
    assert.equal(pickHarness({ job: 'agent', surface: 'cli', usage: 'local' }, list).primary.id, 'hermes');
    assert.equal(pickHarness({ surface: 'desktop' }, list).primary.id, 'hermes');
    assert.equal(pickHarness({ surface: 'web' }, list).primary.id, 'openhands');
  });

  it('keeps Cursor off the local-first IDE pick and mentions hybrid when asked', () => {
    const localIde = pickHarness({ job: 'agent', surface: 'ide', usage: 'local' }, list);
    assert.equal(localIde.primary.id, 'continue');
    assert.ok(!localIde.alternates.some((row) => row.id === 'cursor'));
    assert.match(localIde.usageNote, /Fully local/);

    const hybridIde = pickHarness({ job: 'agent', surface: 'ide', usage: 'hybrid' }, list);
    assert.ok(hybridIde.alternates.some((row) => row.id === 'cursor'));
    assert.match(hybridIde.usageNote, /Hybrid/);
    assert.match(hybridIde.usageNote, /calculator/);
  });
});

describe('copy-paste snippets', () => {
  it('writes :8080 and :8083 bases without inventing serve flags', () => {
    const llama = endpointSet(file, 'llama');
    const strata = endpointSet(file, 'strata');
    assert.equal(llama.v1, 'http://127.0.0.1:8080/v1');
    assert.equal(strata.v1, 'http://127.0.0.1:8083/v1');

    const hermesLlama = harnessSnippet(list.find((row) => row.id === 'hermes')!, llama);
    const hermesStrata = harnessSnippet(list.find((row) => row.id === 'hermes')!, strata);
    assert.match(hermesLlama.code, /127\.0\.0\.1:8080\/v1/);
    assert.match(hermesStrata.code, /127\.0\.0\.1:8083\/v1/);
    assert.match(hermesLlama.note ?? '', /TODO/);

    const goose = harnessSnippet(list.find((row) => row.id === 'goose')!, llama);
    assert.match(goose.code, /OPENAI_HOST=http:\/\/127\.0\.0\.1:8080$/m);
    assert.ok(!goose.code.includes('8080/v1'));

    const claude = harnessSnippet(list.find((row) => row.id === 'claude-code')!, llama);
    assert.match(claude.code, /ANTHROPIC_BASE_URL=http:\/\/127\.0\.0\.1:8080$/m);
    assert.ok(!claude.code.includes('8080/v1'));

    const cursor = harnessSnippet(list.find((row) => row.id === 'cursor')!, llama);
    assert.equal(cursor.applicable, false);
    assert.ok(!cursor.code.includes('http://127.0.0.1:8080/v1'));

    const webui = harnessSnippet(list.find((row) => row.id === 'llamacpp-webui')!, strata);
    assert.equal(webui.applicable, false);
    assert.match(webui.code, /not documented/);

    const comfy = harnessSnippet(list.find((row) => row.id === 'comfyui')!, llama);
    assert.equal(comfy.applicable, false);
    assert.match(comfy.code, /8188/);
    assert.ok(!comfy.code.includes('chat/completions'));
  });

  it('proves /v1 with curl before a harness snippet', () => {
    const prove = curlSnippet(file, 'llama');
    assert.match(prove.code, /8080\/v1\/models/);
    assert.match(prove.code, /READY/);
    const strata = curlSnippet(file, 'strata');
    assert.match(strata.code, /8083\/v1\/chat\/completions/);
  });
});
