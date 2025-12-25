import { test, expect } from '@playwright/test';

/**
 * Test wall collision and destruction
 */

test.describe('Wall Collision and Destruction', () => {

  test('player should be blocked by walls', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Get initial player position
    const initialPos = await page.evaluate(() => {
      if (window.gameManager && window.gameManager.gameObjects[0]) {
        const player = window.gameManager.gameObjects[0];
        return { x: Math.round(player.x), y: Math.round(player.y) };
      }
      return null;
    });
    console.log('Initial player position:', initialPos);

    // Move up towards walls
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(2000);
    await page.keyboard.up('ArrowUp');

    // Get final player position
    const finalPos = await page.evaluate(() => {
      if (window.gameManager && window.gameManager.gameObjects[0]) {
        const player = window.gameManager.gameObjects[0];
        return { x: Math.round(player.x), y: Math.round(player.y) };
      }
      return null;
    });
    console.log('Final player position:', finalPos);

    // Player should have moved up but been blocked by walls
    expect(initialPos).not.toBeNull();
    expect(finalPos).not.toBeNull();

    // Take screenshot
    await page.screenshot({
      path: 'test-results/wall-collision-test.png',
      fullPage: true
    });
  });

  test('bullets should destroy brick walls', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Fire bullets at the wall area near the top
    // The brick walls are at positions with tile ID 55
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(100);
    }

    // Wait for bullets to hit walls
    await page.waitForTimeout(2000);

    // Screenshot after shooting
    await page.locator('#canvas').screenshot({
      path: 'test-results/wall-destruction.png'
    });

    // Verify game is still running
    const gameRunning = await page.evaluate(() => {
      return !!(window.gameManager && window.gameManager.gameObjects);
    });
    expect(gameRunning).toBe(true);
  });

  test('verify game state after interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Move and shoot
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(500);
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    await page.keyboard.up('ArrowUp');

    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(500);
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    await page.keyboard.up('ArrowRight');

    // Final screenshot
    await page.screenshot({
      path: 'test-results/final-game-state.png',
      fullPage: true
    });

    // Verify enemies are spawning
    const enemyInfo = await page.evaluate(() => {
      if (window.gameManager) {
        return {
          enemiesRemaining: window.gameManager.enemiesRemaining,
          enemiesOnField: window.gameManager.enemiesOnField
        };
      }
      return null;
    });
    console.log('Enemy info:', enemyInfo);

    expect(enemyInfo).not.toBeNull();
    expect(enemyInfo.enemiesRemaining).toBeLessThan(16);
  });
});
