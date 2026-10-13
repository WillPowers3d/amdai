import { expect, test } from '@playwright/test';

test('Path dropdown stays open on a diagonal mouse path into the panel', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto('/');

  const item = page.locator('.mega-item').filter({ hasText: 'Path' }).first();
  const trigger = item.locator('.mega-trigger');
  const panel = item.locator('.mega-panel');

  await expect(trigger).toBeVisible();
  await expect(panel).toBeHidden();

  const t = await trigger.boundingBox();
  if (!t) throw new Error('Path trigger has no box');
  await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2);
  await expect(panel).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');

  const link = panel.locator('a').first();
  const p = await panel.boundingBox();
  const l = await link.boundingBox();
  if (!p || !l) throw new Error('Path panel has no box');

  await page.mouse.move(t.x + t.width - 4, t.y + t.height - 2);
  await page.mouse.move(l.x + 16, l.y + 12, { steps: 14 });
  await expect(panel).toBeVisible();
  await expect(link).toBeVisible();

  await trigger.click();
  await expect(panel).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');

  await trigger.click();
  await expect(panel).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
});
