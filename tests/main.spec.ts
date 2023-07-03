import { test, expect } from '@playwright/test';

test.describe('request', () => {
  test('does things', async ({ page }) => {
    await page.goto('/page-1.html');
    await expect(page).toHaveURL('/page-1.html');
    await expect(page).toHaveTitle('Page 1');
  });
});
