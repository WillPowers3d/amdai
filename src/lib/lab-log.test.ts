import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { primaryNav } from './site';
import { documentTitle, isSitemapExcluded, pageDescription, shouldNoindex } from './seo';
import { pageJsonLd, personJsonLdHits } from './jsonld';
import {
  EMPTY_LAB_LOG,
  LAB_LOG_DESCRIPTION,
  LAB_LOG_H1,
  LAB_LOG_JSON,
  LAB_LOG_PATH,
  LAB_LOG_TITLE,
  assertLabLogValid,
  groupLabLogByDay,
  kindLabel,
  latestLabLogEntries,
  loadLabLogFile,
  normalizeLabLog,
  projectLabel,
  sortEntriesNewestFirst,
  type LabLogEntry,
} from './lab-log';

const here = dirname(fileURLToPath(import.meta.url));

function sample(over: Partial<LabLogEntry> = {}): LabLogEntry {
  return {
    id: 'lab-log-open',
    date: '2026-10-23T18:00:00.000Z',
    project: 'idea-lab',
    kind: 'progress',
    title: 'The lab log is open',
    summary: 'Public record of results, progress, and failures.',
    ...over,
  };
}

describe('lab log', () => {
  it('keeps copy, labels, and an empty file safe', () => {
    assert.equal(LAB_LOG_PATH, '/lab-log');
    assert.equal(LAB_LOG_JSON, '/data/lab-log.json');
    assert.equal(LAB_LOG_TITLE, 'Lab log');
    assert.equal(LAB_LOG_H1, 'Lab log');
    assert.ok(LAB_LOG_DESCRIPTION.length >= 70);
    assert.ok(LAB_LOG_DESCRIPTION.length <= 160);
    assert.equal(projectLabel('dual-r9700'), 'Dual R9700 speed');
    assert.equal(projectLabel('idea-lab'), 'Idea lab');
    assert.equal(kindLabel('failure'), 'Failed');
    assert.deepEqual(assertLabLogValid(EMPTY_LAB_LOG), []);
    assert.equal(latestLabLogEntries(EMPTY_LAB_LOG).length, 0);
  });

  it('loads the seed, newest first, and never invents a banned row', () => {
    const file = loadLabLogFile();
    assert.deepEqual(assertLabLogValid(file), []);
    assert.ok(file.entries.length >= 1);
    assert.equal(file.entries[0]?.id, 'lab-log-open');
    assert.match(file.entries[0]!.summary, /No invented tok\/s/);
    const blob = JSON.stringify(file);
    assert.doesNotMatch(blob, /Qwen2\.5|Qwen3-8B/);
    assert.doesNotMatch(blob, /local-desktop|amdai|amdai/i);
    assert.doesNotMatch(blob, /\/home\/|\/Users\//);
    assert.doesNotMatch(blob, /\b(?:IQ[12][_-]|Q[12][_-])/i);
    const grouped = groupLabLogByDay([
      sample({ id: 'old', date: '2026-10-20T12:00:00.000Z', title: 'Old' }),
      sample({ id: 'new', date: '2026-10-23T18:00:00.000Z', title: 'New' }),
      sample({ id: 'mid', date: '2026-10-23T12:00:00.000Z', title: 'Mid' }),
    ]);
    assert.equal(grouped[0]?.date, '2026-10-23');
    assert.deepEqual(grouped[0]?.entries.map((row) => row.id), ['new', 'mid']);
    assert.equal(grouped[1]?.date, '2026-10-20');
    assert.equal(sortEntriesNewestFirst(grouped[0]!.entries)[0]?.id, 'new');
    const latest = latestLabLogEntries({ as_of: file.as_of, entries: grouped.flatMap((day) => day.entries) }, 3);
    assert.equal(latest[0]?.id, 'new');
    const dropped = normalizeLabLog({
      as_of: 'nope',
      entries: [{ id: 'x' } as LabLogEntry, sample({ kind: 'nope' as LabLogEntry['kind'] })],
    });
    assert.equal(dropped.entries.length, 0);
  });

  it('wires the page, strip, nav, and JSON-LD', () => {
    const page = readFileSync(join(here, '../pages/lab-log.astro'), 'utf8');
    const strip = readFileSync(join(here, '../components/LabLogStrip.astro'), 'utf8');
    const home = readFileSync(join(here, '../pages/index.astro'), 'utf8');
    assert.match(page, /LAB_LOG_H1/);
    assert.match(page, /ll-filters/);
    assert.match(page, /hydrate/);
    assert.match(page, /\/data\/lab-log\.json/);
    assert.match(page, /The log is starting/);
    assert.match(page, /Failed/);
    assert.match(page, /Dual R9700 speed/);
    assert.match(page, /Idea lab/);
    assert.match(page, /NextSteps/);
    assert.match(strip, /Latest from the lab/);
    assert.match(strip, /\/data\/lab-log\.json/);
    assert.match(home, /LabLogStrip/);
    assert.equal(shouldNoindex(LAB_LOG_PATH), false);
    assert.equal(isSitemapExcluded(LAB_LOG_PATH), false);
    assert.ok(primaryNav.some((item) => item.href === LAB_LOG_PATH && item.label === 'Lab log'));
    assert.ok(documentTitle(LAB_LOG_PATH).endsWith(' · AMDai'));
    assert.ok(pageDescription(LAB_LOG_PATH).length <= 160);
    const ld = pageJsonLd({
      pathname: LAB_LOG_PATH,
      title: documentTitle(LAB_LOG_PATH),
      description: pageDescription(LAB_LOG_PATH),
    });
    assert.equal(personJsonLdHits(ld).length, 0);
    const collection = ld.find((node) => node['@type'] === 'CollectionPage');
    assert.ok(collection);
    assert.ok(collection.name);
    assert.doesNotMatch(JSON.stringify(ld), /"@type"\s*:\s*"Person"/);
  });
});
