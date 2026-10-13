import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { indexDist } from './site-qa';
import {
  FAILING_IMPACTS,
  formatA11yReport,
  isFailingImpact,
  listAuditPages,
  summarizeA11y,
  type A11yViolation,
} from './a11y-qa';

function row(partial: Partial<A11yViolation>): A11yViolation {
  return {
    id: 'color-contrast',
    impact: 'serious',
    help: 'Elements must have sufficient color contrast',
    helpUrl: 'https://dequeuniversity.com/rules/axe/color-contrast',
    theme: 'dark',
    path: '/qwen',
    nodes: 1,
    targets: ['.kicker'],
    ...partial,
  };
}

describe('a11y QA helpers', () => {
  it('fails only serious and critical impacts', () => {
    assert.deepEqual([...FAILING_IMPACTS].sort(), ['critical', 'serious']);
    assert.equal(isFailingImpact('critical'), true);
    assert.equal(isFailingImpact('serious'), true);
    assert.equal(isFailingImpact('moderate'), false);
    assert.equal(isFailingImpact('minor'), false);
    assert.equal(isFailingImpact(null), false);
  });

  it('skips redirect HTML when listing audit pages', () => {
    const root = join(tmpdir(), `amdai-a11y-${Date.now()}`);
    mkdirSync(root, { recursive: true });
    writeFileSync(
      join(root, 'index.html'),
      '<!doctype html><html lang="en"><body><main id="main">ok</main></body></html>',
    );
    mkdirSync(join(root, 'local-ai'), { recursive: true });
    writeFileSync(
      join(root, 'local-ai/index.html'),
      '<!doctype html><html><head><meta http-equiv="refresh" content="0;url=/software"></head><body>Redirecting to: /software</body></html>',
    );
    mkdirSync(join(root, 'go/amazon/r9700'), { recursive: true });
    writeFileSync(
      join(root, 'go/amazon/r9700/index.html'),
      '<!doctype html><html lang="en"><head><meta http-equiv="refresh" content="0;url=https://example.com"></head><body><a href="https://example.com">Continue</a></body></html>',
    );
    const pages = listAuditPages(indexDist(root));
    assert.deepEqual(pages, ['/']);
  });

  it('formats a dated report and counts failing rows', () => {
    const violations = [
      row({ impact: 'critical', id: 'label' }),
      row({ impact: 'serious', theme: 'light' }),
      row({ impact: 'moderate', id: 'heading-order' }),
    ];
    const summary = summarizeA11y(violations);
    assert.equal(summary.critical, 1);
    assert.equal(summary.serious, 1);
    assert.equal(summary.failing, 2);
    assert.equal(summary.moderate, 1);
    const report = formatA11yReport({
      asOf: '2026-10-13',
      pages: 12,
      themes: ['dark', 'light'],
      violations,
    });
    assert.match(report, /Accessibility QA · 2026-10-13/);
    assert.match(report, /Serious\/critical: 2/);
    assert.match(report, /label: 1/);
    assert.doesNotMatch(report, /heading-order: 1/);
  });
});
