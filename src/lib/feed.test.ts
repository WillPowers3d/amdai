import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runs } from './run-card-data';
import {
  LAB_NOTES_FEED,
  LAB_NOTES_FEED_TITLE,
  assertFeedValid,
  collectFeedItems,
  renderRss,
} from './feed';

describe('Lab Notes RSS feed', () => {
  it('includes blog posts, updates, and official run cards without inventing numbers', () => {
    const items = collectFeedItems(runs);
    const xml = renderRss(items);
    assert.deepEqual(assertFeedValid(xml, items), []);
    assert.equal(LAB_NOTES_FEED, '/rss.xml');
    assert.match(LAB_NOTES_FEED_TITLE, /AMDai/);
    assert.ok(items.some((item) => item.href.startsWith('/blog/')));
    assert.ok(items.some((item) => item.href.startsWith('/updates')));
    assert.ok(items.some((item) => item.href.startsWith('/results/')));
    assert.match(xml, /<atom:link[^>]+rel="self"/);
    assert.match(xml, /amdai-bench\/run@1/);
    assert.doesNotMatch(xml, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(xml, /\$\d|\bMSRP\b/);
    assert.doesNotMatch(xml, /ASRock|Taichi|motherboard/i);
  });
});
