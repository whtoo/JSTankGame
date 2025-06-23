import { SpriteAnimation } from './SpriteAnimation.js';

describe('SpriteAnimation', () => {
  describe('constructor', () => {
    it('should correctly calculate sourceDx and sourceDy', () => {
      const sX = 10; // Example sprite sheet X-coordinate (tile index)
      const sY = 5;  // Example sprite sheet Y-coordinate (tile index)
      const animation = new SpriteAnimation(sX, sY);

      // Assuming tile width/height is 33 as used in the class
      expect(animation.sourceDx).toBe(sX * 33);
      expect(animation.sourceDy).toBe(sY * 33);
      expect(animation.sourceW).toBe(33);
      expect(animation.sourceH).toBe(33);
    });

    it('should handle zero coordinates', () => {
      const animation = new SpriteAnimation(0, 0);
      expect(animation.sourceDx).toBe(0);
      expect(animation.sourceDy).toBe(0);
      expect(animation.sourceW).toBe(33);
      expect(animation.sourceH).toBe(33);
    });
  });
});
