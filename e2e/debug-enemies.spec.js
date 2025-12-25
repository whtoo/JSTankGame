import { test, expect } from '@playwright/test';

/**
 * Debug enemy spawning
 */

test.describe('Debug Enemy Spawning', () => {

  test('check enemy count and spawning', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Check initial state
    const initialState = await page.evaluate(() => {
      if (window.gameManager && window.gameManager.enemies) {
        return {
          enemiesRemaining: window.gameManager.enemiesRemaining,
          enemiesOnField: window.gameManager.enemiesOnField,
          enemiesCount: window.gameManager.enemies ? window.gameManager.enemies.length : 0
        };
      }
      return { error: 'gameManager not found' };
    });
    console.log('Initial state:', initialState);

    // Wait for spawning
    await page.waitForTimeout(5000);

    // Check state after spawning
    const afterSpawn = await page.evaluate(() => {
      if (window.gameManager) {
        return {
          enemiesRemaining: window.gameManager.enemiesRemaining,
          enemiesOnField: window.gameManager.enemiesOnField,
          enemiesCount: window.gameManager.enemies ? window.gameManager.enemies.length : 0
        };
      }
      return { error: 'gameManager not found' };
    });
    console.log('After spawning:', afterSpawn);

    // Check if enemies are visible
    const enemyInfo = await page.evaluate(() => {
      if (window.gameManager && window.gameManager.enemies) {
        const enemies = window.gameManager.enemies;
        return enemies.map(e => ({
          id: e.id,
          active: e.active,
          x: Math.round(e.x),
          y: Math.round(e.y),
          type: e.type
        }));
      }
      return [];
    });
    console.log('Enemy details:', enemyInfo);
  });

  test('check rendering of specific enemies', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(6000); // Wait for multiple spawns

    // Get detailed enemy info
    const details = await page.evaluate(() => {
      const result = {
        gameManagerExists: !!window.gameManager,
        enemyCount: 0,
        activeEnemies: [],
        canvasInfo: null
      };

      if (window.gameManager) {
        result.enemyCount = window.gameManager.enemies ? window.gameManager.enemies.length : 0;
        result.activeEnemies = window.gameManager.enemies
          ? window.gameManager.enemies.filter(e => e.active).map(e => ({
            type: e.type,
            x: Math.round(e.x),
            y: Math.round(e.y),
            width: e.width,
            height: e.height,
            hasAnimSheet: !!e.animSheet
          }))
          : [];
      }

      const canvas = document.getElementById('canvas');
      if (canvas) {
        result.canvasInfo = {
          width: canvas.width,
          height: canvas.height
        };
      }

      return result;
    });

    console.log('Enemy rendering details:', JSON.stringify(details, null, 2));

    // Screenshot for visual reference
    await page.locator('#canvas').screenshot({
      path: 'test-results/debug-enemies.png'
    });
  });
});
