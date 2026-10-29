import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PII_TEXT } from './pii-denylist';
import {
  LAB_LOG_MARKDOWN,
  loadLabLogFile,
  renderLabLogMarkdown,
  staticLabLogEntries,
} from './lab-log';
import { assertLlmsValid, renderLlmsFullTxt, renderLlmsTxt } from './llms';
import { canonicalUrl, SITE_ORIGIN } from './seo';

const here = dirname(fileURLToPath(import.meta.url));

describe('AI readability', () => {
  it('keeps trailing-slash canonicals and generated llms full text', () => {
    assert.equal(canonicalUrl('/lab-log'), `${SITE_ORIGIN}/lab-log/`);
    assert.equal(canonicalUrl('/compare'), `${SITE_ORIGIN}/compare/`);
    assert.equal(canonicalUrl(LAB_LOG_MARKDOWN), `${SITE_ORIGIN}/lab-log.md`);
    assert.deepEqual(assertLlmsValid(), []);
    const short = renderLlmsTxt();
    const full = renderLlmsFullTxt();
    assert.match(short, /https:\/\/amdai\.net\/lab-log\//);
    assert.match(full, /# AMDai lab log/);
    assert.ok(full.length > 20_000);
    assert.doesNotMatch(short, PII_TEXT);
    assert.doesNotMatch(full, PII_TEXT);
  });

  it('renders a repo snapshot that crawlers can read without JavaScript', () => {
    const file = loadLabLogFile();
    const baked = staticLabLogEntries(file);
    assert.ok(baked.length >= 10);
    const md = renderLabLogMarkdown(file);
    assert.ok(md.includes(file.entries[0]!.title));
    const page = readFileSync(join(here, '../pages/lab-log.astro'), 'utf8');
    assert.match(page, /staticLabLogEntries/);
    assert.match(page, /hydrate/);
    const layout = readFileSync(join(here, '../layouts/Base.astro'), 'utf8');
    assert.match(layout, /page-main/);
    assert.match(layout, /skip-link/);
    assert.match(layout, /article:modified_time/);
    const robots = readFileSync(join(here, '../../public/robots.txt'), 'utf8');
    assert.match(robots, /OAI-SearchBot/);
    assert.match(robots, /ChatGPT-User/);
    assert.match(robots, /llms\.txt/);
    assert.match(robots, /Disallow:\s*\/go\//);
    assert.match(robots, /Sitemap:\s*https:\/\/amdai\.net\/sitemap/);
  });
});
