import { test, expect } from '@playwright/test';

/**
 * Visual verification tests with screenshots
 */

test.describe('Visual Verification', () => {

  test('take game screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for game to initialize

    // Take a screenshot of the canvas area
    await page.locator('#canvas').screenshot({
      path: 'test-results/game-screenshot.png'
    });

    // Verify canvas exists
    const canvas = page.locator('#canvas');
    await expect(canvas).toBeVisible();
  });

  test('game screen elements verification', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Check page title
    await expect(page).toHaveTitle(/Tank Battles/);

    // Verify canvas has correct dimensions
    const canvas = page.locator('#canvas');
    const box = await canvas.boundingBox();

    expect(box.width).toBe(800);
    expect(box.height).toBe(600);

    // Take full page screenshot
    await page.screenshot({
      path: 'test-results/full-page-screenshot.png',
      fullPage: true
    });
  });

  test('verify game rendering after interaction', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);

    // Interact with the game
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(500);
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    // Screenshot after interaction
    await page.locator('#canvas').screenshot({
      path: 'test-results/game-after-interaction.png'
    });

    // Verify canvas still visible
    await expect(page.locator('#canvas')).toBeVisible();
  });
});
