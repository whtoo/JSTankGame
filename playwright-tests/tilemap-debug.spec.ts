/**
 * Playwright Debug Script: Tile Map Integration
 * Run with: npx playwright test playwright-tests/tilemap-debug.spec.ts --reporter=line
 */

import { test, expect } from '@playwright/test';

test.describe('Tile Map System Debug', () => {
  test('page loads without errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('http://localhost:8081/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Report errors
    if (errors.length > 0) {
      console.log('Errors found:', JSON.stringify(errors, null, 2));
    }
    
    // Check title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Should not have critical JS errors
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('net::')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});
