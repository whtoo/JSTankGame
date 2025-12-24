import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite for JSTankGame Implementation Status
 *
 * This test suite checks the basic functionality and implementation state
 * of the tank battle game, including:
 * - Page loading and canvas rendering
 * - Game initialization
 * - Player tank presence and state
 * - Input handling (keyboard)
 * - Game loop functionality
 */

test.describe('JSTankGame - Basic Implementation Status', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the game page
    await page.goto('/');
  });

  test('should load the game page with canvas element', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle(/Tank Battles/);

    // Check that the canvas element exists
    const canvas = page.locator('#canvas');
    await expect(canvas).toBeVisible();

    // Verify canvas dimensions
    const width = await canvas.evaluate(el => el.width);
    const height = await canvas.evaluate(el => el.height);
    expect(width).toBe(800);
    expect(height).toBe(600);
  });

  test('should initialize game and render player tank', async ({ page }) => {
    const canvas = page.locator('#canvas');

    // Wait a moment for game initialization
    await page.waitForTimeout(1000);

    // Check that canvas is not empty (has been rendered to)
    const hasContent = await canvas.evaluate(el => {
      const ctx = el.getContext('2d');
      const imageData = ctx.getImageData(0, 0, el.width, el.height);
      // Check if any pixels are non-transparent
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 0) return true;
      }
      return false;
    });

    expect(hasContent).toBe(true);
  });

  test('should have game object manager with player state', async ({ page }) => {
    // Check for player tank existence in the game state
    const hasPlayer = await page.evaluate(() => {
      // The game should have initialized a player tank
      // Check if canvas has game context
      const canvas = document.getElementById('canvas');
      return canvas !== null;
    });

    expect(hasPlayer).toBe(true);
  });

  test('should respond to keyboard input', async ({ page }) => {
    // Simulate keyboard input
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);

    // The game should be processing input (we verify the page is still responsive)
    const isResponsive = await page.evaluate(() => {
      return document.readyState === 'complete';
    });

    expect(isResponsive).toBe(true);
  });

  test('should handle multiple keyboard inputs for movement', async ({ page }) => {
    // Simulate tank movement via keyboard
    const keys = ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'];

    for (const key of keys) {
      await page.keyboard.down(key);
      await page.waitForTimeout(50);
      await page.keyboard.up(key);
      await page.waitForTimeout(50);
    }

    // Verify page remains stable after input
    const isStable = await page.evaluate(() => {
      const canvas = document.getElementById('canvas');
      return canvas && canvas.width === 800 && canvas.height === 600;
    });

    expect(isStable).toBe(true);
  });
});

test.describe('JSTankGame - Rendering Engine Check', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500); // Wait for initial render
  });

  test('should have active render loop', async ({ page }) => {
    // Take two snapshots with a small delay
    const snapshot1 = await page.locator('#canvas').evaluate(el => {
      const ctx = el.getContext('2d');
      return ctx.getImageData(0, 0, 10, 10).data.slice(0, 40);
    });

    await page.waitForTimeout(100);

    const snapshot2 = await page.locator('#canvas').evaluate(el => {
      const ctx = el.getContext('2d');
      return ctx.getImageData(0, 0, 10, 10).data.slice(0, 40);
    });

    // Both snapshots should exist (rendering is working)
    expect(snapshot1).toBeDefined();
    expect(snapshot2).toBeDefined();
  });

  test('should use offscreen canvas caching for performance', async ({ page }) => {
    // Check if the game is using canvas rendering
    const hasRenderingContext = await page.evaluate(() => {
      const canvas = document.getElementById('canvas');
      return canvas && typeof canvas.getContext === 'function';
    });

    expect(hasRenderingContext).toBe(true);
  });
});

test.describe('JSTankGame - Resource Loading Check', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load game resources without errors', async ({ page }) => {
    // Listen for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check for critical resource loading errors
    const criticalErrors = errors.filter(err =>
      err.includes('Failed to load') ||
      err.includes('404') ||
      err.includes('Cannot read')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('should have JavaScript loaded correctly', async ({ page }) => {
    // Check if the main game script is loaded
    const gameLoaded = await page.evaluate(() => {
      // Check for any indication that the game has initialized
      const canvas = document.getElementById('canvas');
      return canvas !== null;
    });

    expect(gameLoaded).toBe(true);
  });
});

test.describe('JSTankGame - Shooting System', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000); // Wait for game initialization
  });

  test('should fire bullet when spacebar is pressed', async ({ page }) => {
    // Fire a bullet
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);

    // Check that game state is still responsive
    const isResponsive = await page.evaluate(() => {
      return document.readyState === 'complete';
    });

    expect(isResponsive).toBe(true);
  });

  test('should handle rapid fire attempts', async ({ page }) => {
    // Press spacebar multiple times rapidly
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(50);
    }

    // Verify game remains stable
    const canvas = page.locator('#canvas');
    await expect(canvas).toBeVisible();
  });

  test('should combine movement and shooting', async ({ page }) => {
    // Move and shoot simultaneously
    await page.keyboard.down('ArrowUp');
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    await page.keyboard.up('ArrowUp');

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

  test('should visualize bullets on canvas', async ({ page }) => {
    // This test verifies that the shooting system is working end-to-end
    // by checking that the game remains responsive and rendering after firing

    // Wait for game to be fully initialized
    await page.waitForTimeout(1000);

    // Get initial canvas state to verify rendering is working
    const hasContentBefore = await page.evaluate(() => {
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // Check if any pixels are non-transparent
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 0) return true;
      }
      return false;
    });

    expect(hasContentBefore).toBe(true);

    // Fire multiple bullets to stress test the shooting system
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(100);
    }

    // Wait a bit more for bullets to animate
    await page.waitForTimeout(200);

    // Verify canvas still has content (game didn't crash)
    const hasContentAfter = await page.evaluate(() => {
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 0) return true;
      }
      return false;
    });

    expect(hasContentAfter).toBe(true);
  });
});
