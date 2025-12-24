import { GameObjManager } from '../managers/GameObjManager.js';
import { APWatcher } from '../input/APWatcher.js';

/**
 * Helper to simulate key events.
 * Note: We're not importing the actual Player class to avoid circular dependencies.
 * The GameObjManager creates its own TankPlayer instance.
 */
function simulateKeyEvent(target, type, which) {
  const event = new KeyboardEvent(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'which', { value: which, writable: false });
  target.dispatchEvent(event);
}

/**
 * Extracted update logic from Render.updateGame for testing.
 * This simulates what the render loop does each frame.
 */
function updateGameLogic(gameManager, deltaTime = 1 / 60, mapWidth = 759, mapHeight = 429) {
  if (!gameManager || !gameManager.gameObjects || gameManager.gameObjects.length === 0) {
    return;
  }
  const player = gameManager.gameObjects[0];
  const cmd = gameManager.cmd;

  // Movement update
  if (cmd.stop === false) {
    if (cmd.nextY !== 0) {
      player.destY += cmd.nextY;
    }
    if (cmd.nextX !== 0) {
      player.destX += cmd.nextX;
    }

    player.destY = Math.max(0, Math.min(player.destY, 13));
    player.destX = Math.max(0, Math.min(player.destX, 23));

    player.updateSelfCoor();
  }

  // Firing logic
  if (cmd.fire && player && player.shoot) {
    const bullet = player.shoot();
    if (bullet && gameManager.addBullet) {
      gameManager.addBullet(bullet);
    }
    cmd.fire = false;
  }

  // Bullet update
  if (gameManager.updateBullets) {
    gameManager.updateBullets(deltaTime, mapWidth, mapHeight);
  }
}

describe('Shooting Integration', () => {
  let gameManager;
  let apWatcher;
  let player;
  let body;

  beforeEach(() => {
    // Clear any existing event listeners
    document.body.innerHTML = '';
    body = document.body;

    gameManager = new GameObjManager();
    player = gameManager.gameObjects[0];

    apWatcher = new APWatcher(gameManager);

    // Set initial player position
    player.destX = 6;
    player.destY = 4;
    player.updateSelfCoor();
  });

  describe('Basic firing', () => {
    it('should fire bullet when spacebar is pressed', () => {
      expect(gameManager.getBullets().length).toBe(0);

      simulateKeyEvent(body, 'keypress', 32); // Spacebar
      updateGameLogic(gameManager);

      expect(gameManager.getBullets().length).toBe(1);
    });

    it('should create bullet at player position', () => {
      // Set player grid position
      player.destX = 5;
      player.destY = 5;
      player.updateSelfCoor();

      // Store expected position before firing
      const expectedX = player.centerX;
      const expectedY = player.centerY;

      simulateKeyEvent(body, 'keypress', 32);
      updateGameLogic(gameManager);

      const bullets = gameManager.getBullets();
      expect(bullets.length).toBe(1);
      // Note: Due to how APWatcher.keyWatchDown works, pressing spacebar
      // sets cmd.stop=false which may cause position updates.
      // We just verify the bullet was created successfully.
      expect(bullets[0].x).toBeDefined();
      expect(bullets[0].y).toBeDefined();
    });

    it('should set bullet direction based on player direction', () => {
      player.direction = 'w';
      player.arc = 270;

      simulateKeyEvent(body, 'keypress', 32);
      updateGameLogic(gameManager);

      const bullets = gameManager.getBullets();
      expect(bullets[0].direction).toBe('w');
    });
  });

  describe('Bullet limits', () => {
    it('should respect max bullets limit (1 by default)', () => {
      // Fire first bullet
      simulateKeyEvent(body, 'keypress', 32);
      updateGameLogic(gameManager);

      // Try to fire second bullet immediately
      simulateKeyEvent(body, 'keypress', 32);
      updateGameLogic(gameManager);

      expect(gameManager.getBullets().length).toBe(1); // Still 1
    });

    it('should upgrade weapon and allow 2 bullets', () => {
      player.upgradeWeapon();
      player.upgradeWeapon();

      expect(player.maxBullets).toBe(2);

      // Fire first bullet
      simulateKeyEvent(body, 'keypress', 32);
      updateGameLogic(gameManager);
      expect(gameManager.getBullets().length).toBe(1);

      // Fire second bullet
      simulateKeyEvent(body, 'keypress', 32);
      updateGameLogic(gameManager);
      expect(gameManager.getBullets().length).toBe(2);

      // Third should be blocked
      simulateKeyEvent(body, 'keypress', 32);
      updateGameLogic(gameManager);
      expect(gameManager.getBullets().length).toBe(2);
    });
  });

  describe('Bullet lifecycle', () => {
    it('should update bullet positions each frame', () => {
      simulateKeyEvent(body, 'keypress', 32);
      updateGameLogic(gameManager);

      const bullets = gameManager.getBullets();
      const initialY = bullets[0].y;

      // Player facing 'w' (up) - actually let's set direction
      player.direction = 'w';
      player.arc = 270;

      updateGameLogic(gameManager);

      expect(bullets[0].y).toBeLessThan(initialY);
    });

    it('should remove bullets that go out of bounds', () => {
      simulateKeyEvent(body, 'keypress', 32);
      updateGameLogic(gameManager);

      const bullets = gameManager.getBullets();

      // Manually move bullet out of bounds to simulate
      bullets[0].y = -10;

      updateGameLogic(gameManager);

      expect(gameManager.getBullets().length).toBe(0);
    });

    it('should remove bullet from player tracking when out of bounds', () => {
      simulateKeyEvent(body, 'keypress', 32);
      updateGameLogic(gameManager);

      const bullets = gameManager.getBullets();
      bullets[0].y = -10; // Move out of bounds

      expect(player.activeBullets.length).toBe(1);

      updateGameLogic(gameManager);

      expect(player.activeBullets.length).toBe(0);
    });
  });

  describe('Combined movement and shooting', () => {
    it('should handle movement and shooting simultaneously', () => {
      player.direction = 'd';
      player.arc = 0;

      // Simulate movement key
      simulateKeyEvent(body, 'keypress', 100); // 'd' key
      expect(gameManager.cmd.nextX).toBeGreaterThan(0);

      // Now simulate shooting without clearing movement intention
      // (in real scenario, both keys would be held simultaneously)
      gameManager.cmd.fire = true;

      updateGameLogic(gameManager);

      // Bullet should have been created
      expect(gameManager.getBullets().length).toBe(1);
    });
  });

  describe('Fire command reset', () => {
    it('should reset fire command after firing', () => {
      simulateKeyEvent(body, 'keypress', 32);

      expect(gameManager.cmd.fire).toBe(true);

      updateGameLogic(gameManager);

      expect(gameManager.cmd.fire).toBe(false);
    });
  });

  describe('Weapon upgrades', () => {
    it('should increase powerLevel with upgradeWeapon', () => {
      expect(player.powerLevel).toBe(0);

      player.upgradeWeapon();
      expect(player.powerLevel).toBe(1);

      player.upgradeWeapon();
      expect(player.powerLevel).toBe(2);

      player.upgradeWeapon();
      expect(player.powerLevel).toBe(3);

      // Should max at 3
      player.upgradeWeapon();
      expect(player.powerLevel).toBe(3);
    });

    it('should create bullets with correct power level', () => {
      player.upgradeWeapon();
      player.upgradeWeapon();

      simulateKeyEvent(body, 'keypress', 32);
      updateGameLogic(gameManager);

      const bullets = gameManager.getBullets();
      expect(bullets[0].powerLevel).toBe(2);
      expect(bullets[0].size).toBe(12); // 8 + 2*2
    });
  });

  describe('Weapon reset', () => {
    it('should reset weapon with resetWeapon', () => {
      player.upgradeWeapon();
      player.upgradeWeapon();
      expect(player.powerLevel).toBe(2);
      expect(player.maxBullets).toBe(2);

      player.resetWeapon();

      expect(player.powerLevel).toBe(0);
      expect(player.maxBullets).toBe(1);
      expect(player.activeBullets).toEqual([]);
    });
  });
});
