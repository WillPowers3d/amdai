import { expect, test } from '@playwright/test';

const PAGES = [
  '/',
  '/start',
  '/calculator',
  '/budget',
  '/can-run',
  '/can-run/qwen36-35b-on-rx-7900-xtx',
  '/compare/gpus',
  '/compare/r9700-vs-rx-9070-xt',
  '/compare/models',
  '/compare/models/qwen36-vs-flash',
  '/gpus/r9700',
  '/gpus/rx-9070-xt',
  '/setup',
  '/benchmarks',
] as const;

const WIDTHS = [375, 768] as const;

function isDecorative(tag: string): boolean {
  return tag.includes('silicon-grid') || tag.includes('silicon-glow') || tag.includes('silicon-die');
}

test.describe('shopper pages at phone and tablet widths', () => {
  for (const width of WIDTHS) {
    for (const path of PAGES) {
      test(`${path} at ${width}px keeps content in view`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
        expect(response?.ok(), `${path} should load`).toBeTruthy();

        const title = await page.title();
        expect(title.length).toBeGreaterThan(8);
        const desc = await page.locator('meta[name="description"]').getAttribute('content');
        expect(desc && desc.length > 20, `${path} needs a description`).toBeTruthy();
        const og = await page.locator('meta[property="og:image"]').getAttribute('content');
        expect(og, `${path} needs og:image`).toBeTruthy();

        const report = await page.evaluate(() => {
          const offenders: string[] = [];
          for (const el of document.querySelectorAll('body *')) {
            const style = getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden') continue;
            if (style.position === 'absolute' || style.position === 'fixed') continue;
            const r = el.getBoundingClientRect();
            if (r.width < 8 || r.height < 8) continue;
            if (r.right <= window.innerWidth + 2) continue;
            let parent = el.parentElement;
            let contained = false;
            while (parent) {
              const ps = getComputedStyle(parent);
              if (ps.overflowX === 'auto' || ps.overflowX === 'scroll' || ps.overflowX === 'clip') {
                contained = true;
                break;
              }
              parent = parent.parentElement;
            }
            if (contained) continue;
            const tag = `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${
              el.className && typeof el.className === 'string'
                ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
                : ''
            }`;
            offenders.push(tag);
            if (offenders.length >= 6) break;
          }
          const smallCtas = [...document.querySelectorAll('a.btn-primary, a[href^="/go/"], a[href^="amdai-stack-lab:"]')]
            .map((el) => {
              const r = el.getBoundingClientRect();
              return { href: el.getAttribute('href') || '', h: Math.round(r.height) };
            })
            .filter((row) => row.h > 0 && row.h < 40);
          return { offenders, smallCtas };
        });

        const contentOffenders = report.offenders.filter((tag) => !isDecorative(tag));
        expect(contentOffenders, `${path} @${width} overflow`).toEqual([]);
        expect(report.smallCtas, `${path} @${width} small CTAs`).toEqual([]);
      });
    }
  }
});
