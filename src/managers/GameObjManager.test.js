import { GameObjManager } from './GameObjManager.js';
import { Bullet } from '../entities/Bullet.js';

describe('GameObjManager', () => {
  let gameManager;

  beforeEach(() => {
    gameManager = new GameObjManager();
  });

  describe('constructor', () => {
    it('should initialize with empty bullets array', () => {
      expect(gameManager.bullets).toEqual([]);
    });

    it('should have fire property in cmd object', () => {
      expect(gameManager.cmd.fire).toBeDefined();
      expect(gameManager.cmd.fire).toBe(false);
    });

    it('should initialize with gameObjects array', () => {
      expect(gameManager.gameObjects).toBeDefined();
      expect(gameManager.gameObjects.length).toBe(1);
    });
  });

  describe('addBullet', () => {
    it('should add bullet to bullets array', () => {
      const bullet = new Bullet(50, 50, 'w', 'player', 0);
      gameManager.addBullet(bullet);
      expect(gameManager.bullets.length).toBe(1);
      expect(gameManager.bullets[0]).toBe(bullet);
    });

    it('should not add inactive bullets', () => {
      const bullet = new Bullet(50, 50, 'w', 'player', 0);
      bullet.active = false;
      gameManager.addBullet(bullet);
      expect(gameManager.bullets.length).toBe(0);
    });

    it('should not add null bullets', () => {
      gameManager.addBullet(null);
      expect(gameManager.bullets.length).toBe(0);
    });
  });

  describe('removeBullet', () => {
    it('should remove bullet from bullets array', () => {
      const bullet = new Bullet(50, 50, 'w', 'player', 0);
      gameManager.bullets.push(bullet);
      expect(gameManager.bullets.length).toBe(1);

      gameManager.removeBullet(bullet);
      expect(gameManager.bullets.length).toBe(0);
    });

    it('should call removeBullet on player', () => {
      const player = gameManager.gameObjects[0];
      const bullet = new Bullet(50, 50, 'w', 'player', 0);
      gameManager.bullets.push(bullet);

      // Mock removeBullet on player
      player.removeBullet = jest.fn();

      gameManager.removeBullet(bullet);
      expect(player.removeBullet).toHaveBeenCalledWith(bullet);
    });

    it('should handle removing non-existent bullet', () => {
      const bullet = new Bullet(50, 50, 'w', 'player', 0);
      expect(() => gameManager.removeBullet(bullet)).not.toThrow();
    });
  });

  describe('updateBullets', () => {
    it('should update all bullets', () => {
      const bullet1 = new Bullet(50, 50, 'w', 'player', 0);
      const bullet2 = new Bullet(100, 100, 'd', 'player', 0);
      gameManager.bullets.push(bullet1, bullet2);

      const initialY1 = bullet1.y;
      const initialX2 = bullet2.x;

      gameManager.updateBullets(1 / 60, 800, 600);

      expect(bullet1.y).toBeLessThan(initialY1);
      expect(bullet2.x).toBeGreaterThan(initialX2);
    });

    it('should remove out-of-bounds bullets', () => {
      const bullet = new Bullet(50, 50, 'w', 'player', 0);
      gameManager.bullets.push(bullet);

      // Move bullet out of bounds
      bullet.y = -10;

      gameManager.updateBullets(1 / 60, 800, 600);

      expect(gameManager.bullets.length).toBe(0);
    });

    it('should handle empty bullets array', () => {
      expect(() => gameManager.updateBullets(1 / 60, 800, 600)).not.toThrow();
    });

    it('should not remove bullets within bounds', () => {
      const bullet = new Bullet(400, 300, 'w', 'player', 0);
      gameManager.bullets.push(bullet);

      gameManager.updateBullets(1 / 60, 800, 600);

      expect(gameManager.bullets.length).toBe(1);
    });
  });

  describe('getBullets', () => {
    it('should return bullets array', () => {
      const bullet = new Bullet(50, 50, 'w', 'player', 0);
      gameManager.bullets.push(bullet);

      const bullets = gameManager.getBullets();
      expect(bullets).toEqual(gameManager.bullets);
    });

    it('should return empty array when no bullets', () => {
      const bullets = gameManager.getBullets();
      expect(bullets).toEqual([]);
    });
  });
});
