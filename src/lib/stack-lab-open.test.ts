import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  HOUSE_STACK_LAB,
  STACK_LAB_FALLBACK_HREF,
  STACK_LAB_SCHEME,
  assertStackLabOpenValid,
  isAllowlistedStackLabHref,
  openInStackLab,
  parseStackLabHref,
  stackLabLocalOrigin,
} from './stack-lab-open';

describe('Open in Stack Lab helper', () => {
  it('builds allowlisted scheme links and rejects everything else', () => {
    assert.deepEqual(assertStackLabOpenValid(), []);
    const daily = openInStackLab(HOUSE_STACK_LAB.daily);
    assert.ok(daily);
    assert.equal(daily.label, 'Apply in Stack Lab');
    assert.equal(daily.fallbackHref, STACK_LAB_FALLBACK_HREF);
    assert.match(daily.href, new RegExp(`^${STACK_LAB_SCHEME}://recipes/qwen36-35b\\.llamacpp-vulkan\\.262k`));
    assert.match(daily.href, /engine=llamacpp/);
    assert.match(daily.href, /quant=UD-Q5_K_XL/);
    assert.match(daily.href, /context=262144/);
    assert.equal(daily.localHref, null);
    assert.ok(isAllowlistedStackLabHref(daily.href));
    assert.equal(parseStackLabHref(daily.href)?.id, HOUSE_STACK_LAB.daily.id);

    const hermes = openInStackLab(HOUSE_STACK_LAB.hermes);
    assert.ok(hermes);
    assert.equal(hermes.label, 'Open in Stack Lab');
    assert.match(hermes.href, /\/harnesses\/hermes$/);

    assert.equal(openInStackLab({ screen: 'recipes', id: 'https://evil.example' }), null);
    assert.equal(openInStackLab({ screen: 'profile', id: 'qwen-abliterated' }), null);
    assert.equal(openInStackLab({ screen: 'home', model: 'Qwen2.5-7B' }), null);
    assert.equal(isAllowlistedStackLabHref('https://example.com/stack-lab'), false);
    assert.equal(isAllowlistedStackLabHref('stacklab://recipes/x'), false);
    assert.equal(stackLabLocalOrigin('http://127.0.0.1:7429'), 'http://127.0.0.1:7429');
    assert.equal(stackLabLocalOrigin('http://10.0.0.2:7429'), null);
    const withLocal = openInStackLab(HOUSE_STACK_LAB.doctor);
    assert.ok(withLocal);
    assert.equal(withLocal.localHref, null);
  });

  it('encodes query values and keeps house recipes llama.cpp first', () => {
    const flash = openInStackLab({
      ...HOUSE_STACK_LAB.flash,
      model: 'Qwen 3.8 Flash',
    });
    assert.ok(flash);
    assert.match(flash.href, /model=Qwen\+3\.8\+Flash/);
    assert.match(flash.href, /engine=strata/);
    const llama = openInStackLab(HOUSE_STACK_LAB.llama);
    assert.ok(llama);
    assert.match(llama.href, /\/backends\/llamacpp$/);
  });
});
