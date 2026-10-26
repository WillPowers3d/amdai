import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PII_TEXT } from './pii-denylist';
import { SITE_ORIGIN } from './seo';
import {
  assertLlmsValid,
  llmsFullLinks,
  llmsShortLinks,
  renderLlmsFullTxt,
  renderLlmsTxt,
} from './llms';

describe('llms.txt', () => {
  it('summarizes key pages without Person data or invented prices', () => {
    assert.deepEqual(assertLlmsValid(), []);
    const short = renderLlmsTxt();
    const full = renderLlmsFullTxt();
    assert.match(short, /^# AMDai/m);
    assert.match(short, new RegExp(`${SITE_ORIGIN}/start`));
    assert.match(short, new RegExp(`${SITE_ORIGIN}/gpus`));
    assert.match(short, new RegExp(`${SITE_ORIGIN}/sponsor`));
    assert.match(full, new RegExp(`${SITE_ORIGIN}/llms\\.txt`));
    assert.ok(full.length > short.length);
    assert.ok(llmsShortLinks().length >= 12);
    assert.ok(llmsFullLinks().length > llmsShortLinks().length);
    assert.doesNotMatch(short, PII_TEXT);
    assert.doesNotMatch(full, /"@type"\s*:\s*"Person"/);
  });
});
