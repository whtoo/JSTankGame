/**
 * Quick UI Check Script
 * Run with: node playwright-tests/ui-check.js
 */

const { chromium } = require('playwright');

async function checkUI() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Starting UI check...\n');
  
  try {
    // Navigate to page
    await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
    console.log('✓ Page loaded');
    
    // Check canvas
    const canvas = await page.$('canvas#canvas');
    if (canvas) {
      const box = await canvas.boundingBox();
      console.log(`✓ Canvas found: ${box.width}x${box.height}`);
    } else {
      console.log('✗ Canvas not found');
    }
    
    // Wait for game to initialize
    await page.waitForTimeout(2000);
    
    // Check for game manager
    const gameManager = await page.evaluate(() => {
      return typeof window.gameManager !== 'undefined';
    });
    console.log(gameManager ? '✓ Game manager loaded' : '✗ Game manager not found');
    
    // Check for level manager
    const levelManager = await page.evaluate(() => {
      return typeof window.gameLevelManager !== 'undefined';
    });
    console.log(levelManager ? '✓ Level manager loaded' : '✗ Level manager not found');
    
    // Check console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    
    if (consoleErrors.length > 0) {
      console.log(`\n✗ Console errors (${consoleErrors.length}):`);
      consoleErrors.forEach(e => console.log(`  - ${e}`));
    } else {
      console.log('✓ No console errors');
    }
    
    console.log('\n=== UI Check Complete ===');
    
  } catch (error) {
    console.error('Error during UI check:', error.message);
  } finally {
    await browser.close();
  }
}

checkUI();
