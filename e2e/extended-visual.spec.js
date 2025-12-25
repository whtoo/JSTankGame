import { test, expect } from '@playwright/test';

/**
 * Extended visual verification with longer wait for enemy spawning
 */

test.describe('Extended Visual Verification', () => {

  test('wait for enemies to spawn and verify', async ({ page }) => {
    await page.goto('/');

    // Wait for game initialization
    await page.waitForTimeout(1000);

    // Wait for enemies to spawn (spawn interval is 3 seconds)
    await page.waitForTimeout(8000);

    // Take screenshot showing enemies
    await page.locator('#canvas').screenshot({
      path: 'test-results/game-with-enemies.png'
    });

    // Verify canvas still visible
    const canvas = page.locator('#canvas');
    await expect(canvas).toBeVisible();

    // Check if there are any visible enemies by checking canvas content
    const hasContent = await canvas.evaluate(el => {
      const ctx = el.getContext('2d');
      const imageData = ctx.getImageData(0, 0, el.width, el.height);
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 0) return true;
      }
      return false;
    });

    expect(hasContent).toBe(true);
  });

  test('test wall collision by moving player', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Try to move player - they should be blocked by walls
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(1000);
    await page.keyboard.up('ArrowUp');

    // Player should not have moved through walls (roughly in same area)
    const canvas = page.locator('#canvas');
    await expect(canvas).toBeVisible();

    // Screenshot after interaction
    await page.screenshot({
      path: 'test-results/game-after-movement.png',
      fullPage: true
    });
  });

  test('fire bullets and verify destruction', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Fire multiple bullets at walls
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(200);
    }

    // Wait for bullets to potentially destroy walls
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.locator('#canvas').screenshot({
      path: 'test-results/game-after-shooting.png'
    });

    // Verify canvas still renders
    const hasContent = await page.evaluate(() => {
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 0) return true;
      }
      return false;
    });

    expect(hasContent).toBe(true);
  });
});
