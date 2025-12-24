import { Bullet } from './Bullet.js';

describe('Bullet', () => {
  let bullet;
  const startX = 100;
  const startY = 100;
  const startDirection = 'w';
  const startOwner = 'player';
  const startPowerLevel = 0;

  beforeEach(() => {
    bullet = new Bullet(startX, startY, startDirection, startOwner, startPowerLevel);
  });

  describe('constructor', () => {
    it('should initialize with provided parameters', () => {
      expect(bullet.x).toBe(startX);
      expect(bullet.y).toBe(startY);
      expect(bullet.direction).toBe(startDirection);
      expect(bullet.owner).toBe(startOwner);
      expect(bullet.powerLevel).toBe(startPowerLevel);
    });

    it('should set default speed', () => {
      expect(bullet.speed).toBe(12);
    });

    it('should set size based on power level', () => {
      expect(bullet.size).toBe(8); // Base size
    });

    it('should increase size with higher power level', () => {
      const poweredBullet = new Bullet(startX, startY, startDirection, startOwner, 2);
      expect(poweredBullet.size).toBe(12); // 8 + 2*2
    });

    it('should clamp power level between 0 and 3', () => {
      const overPowered = new Bullet(startX, startY, startDirection, startOwner, 10);
      expect(overPowered.powerLevel).toBe(3);
    });

    it('should clamp negative power level to 0', () => {
      const negativePower = new Bullet(startX, startY, startDirection, startOwner, -1);
      expect(negativePower.powerLevel).toBe(0);
    });

    it('should be active by default', () => {
      expect(bullet.active).toBe(true);
    });

    it('should have sprite properties for rendering', () => {
      expect(bullet.sourceW).toBe(16);
      expect(bullet.sourceH).toBe(16);
    });

    it('should set width and height based on size', () => {
      expect(bullet.width).toBe(8);
      expect(bullet.height).toBe(8);
    });
  });

  describe('update', () => {
    it('should move up when direction is "w"', () => {
      const initialY = bullet.y;
      bullet.update(1 / 60); // 1 frame at 60fps
      expect(bullet.y).toBeLessThan(initialY);
      expect(bullet.x).toBe(startX);
    });

    it('should move down when direction is "s"', () => {
      bullet.direction = 's';
      const initialY = bullet.y;
      bullet.update(1 / 60);
      expect(bullet.y).toBeGreaterThan(initialY);
      expect(bullet.x).toBe(startX);
    });

    it('should move left when direction is "a"', () => {
      bullet.direction = 'a';
      const initialX = bullet.x;
      bullet.update(1 / 60);
      expect(bullet.x).toBeLessThan(initialX);
      expect(bullet.y).toBe(startY);
    });

    it('should move right when direction is "d"', () => {
      bullet.direction = 'd';
      const initialX = bullet.x;
      bullet.update(1 / 60);
      expect(bullet.x).toBeGreaterThan(initialX);
      expect(bullet.y).toBe(startY);
    });

    it('should be frame-rate independent', () => {
      const initialY = bullet.y;
      bullet.update(1 / 30); // Slower frame rate
      const distance1 = initialY - bullet.y;

      bullet.y = initialY;
      bullet.update(1 / 60); // Faster frame rate (2x)
      const distance2 = initialY - bullet.y;

      // Should move approximately same distance
      expect(distance1).toBeCloseTo(distance2 * 2, 1);
    });

    it('should move at correct speed based on deltaTime', () => {
      const initialY = bullet.y;
      bullet.update(1); // 1 second
      // Speed is 12 pixels per second * 60fps = 720 pixels/second at 60fps reference
      // With deltaTime of 1, movement should be 12 * 1 * 60 = 720? No wait...
      // Let me recalculate: speed * (deltaTime * 60) = 12 * (1 * 60) = 720
      // But that's too fast. Let me check the formula again.
      // Actually: speed * (deltaTime * 60) means:
      // At 60fps (deltaTime = 1/60): 12 * (1/60 * 60) = 12 * 1 = 12 pixels per frame
      // At 1fps (deltaTime = 1): 12 * (1 * 60) = 720 pixels per second total
      expect(initialY - bullet.y).toBeCloseTo(720, 0);
    });
  });

  describe('isOutOfBounds', () => {
    it('should return true when x is negative', () => {
      bullet.x = -1;
      expect(bullet.isOutOfBounds(800, 600)).toBe(true);
    });

    it('should return true when x equals map width', () => {
      bullet.x = 800;
      expect(bullet.isOutOfBounds(800, 600)).toBe(true);
    });

    it('should return true when x exceeds map width', () => {
      bullet.x = 801;
      expect(bullet.isOutOfBounds(800, 600)).toBe(true);
    });

    it('should return true when y is negative', () => {
      bullet.y = -1;
      expect(bullet.isOutOfBounds(800, 600)).toBe(true);
    });

    it('should return true when y equals map height', () => {
      bullet.y = 600;
      expect(bullet.isOutOfBounds(800, 600)).toBe(true);
    });

    it('should return true when y exceeds map height', () => {
      bullet.y = 601;
      expect(bullet.isOutOfBounds(800, 600)).toBe(true);
    });

    it('should return false when within bounds', () => {
      expect(bullet.isOutOfBounds(800, 600)).toBe(false);
    });

    it('should return false when at boundary edge', () => {
      bullet.x = 799;
      bullet.y = 599;
      expect(bullet.isOutOfBounds(800, 600)).toBe(false);
    });
  });
});
