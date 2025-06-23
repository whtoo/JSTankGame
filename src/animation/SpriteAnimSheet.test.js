import { SpriteAnimSheet } from './SpriteAnimSheet.js';
import { SpriteAnimation } from './SpriteAnimation.js';

// Mock SpriteAnimation to check if it's called correctly without testing its internals here again
jest.mock('./SpriteAnimation.js', () => {
  return {
    SpriteAnimation: jest.fn().mockImplementation((sX, sY) => {
      // Return a mock object that matches what SpriteAnimSheet expects
      return {
        sourceDx: sX * 33,
        sourceDy: sY * 33,
        sourceW: 33,
        sourceH: 33,
        // Add any other properties SpriteAnimSheet might access from a SpriteAnimation instance
      };
    }),
  };
});

describe('SpriteAnimSheet', () => {
  const startAnim = 3;
  const stopAnim = 5; // Results in 3 frames: 3, 4, 5
  const X = 16; // Sprite sheet X-coordinate for the animation strip

  beforeEach(() => {
    // Clear mock usage data before each test
    SpriteAnimation.mockClear();
  });

  describe('constructor', () => {
    it('should create the correct number of animation frames', () => {
      const sheet = new SpriteAnimSheet(startAnim, stopAnim, X);
      expect(sheet.animationFrames.length).toBe(stopAnim - startAnim + 1);
      expect(sheet.animLength).toBe(stopAnim - startAnim + 1);
    });

    it('should instantiate SpriteAnimation for each frame with correct parameters', () => {
      const sheet = new SpriteAnimSheet(startAnim, stopAnim, X);
      const expectedNumberOfFrames = stopAnim - startAnim + 1;
      expect(SpriteAnimation).toHaveBeenCalledTimes(expectedNumberOfFrames);

      for (let i = 0; i < expectedNumberOfFrames; i++) {
        // SpriteAnimation is called with (X, sY), where sY is (i + startAnim)
        expect(SpriteAnimation).toHaveBeenNthCalledWith(i + 1, X, i + startAnim);
      }
    });

    it('should initialize orderIndex to 0', () => {
      const sheet = new SpriteAnimSheet(startAnim, stopAnim, X);
      expect(sheet.orderIndex).toBe(0);
    });
  });

  describe('getFrames', () => {
    it('should return the correct frame based on orderIndex and animLength', () => {
      const sheet = new SpriteAnimSheet(startAnim, stopAnim, X); // 3 frames
      // Manually populate with identifiable mock frames if SpriteAnimation mock isn't sufficient
      // For this test, we rely on the mock returning something distinguishable if needed,
      // or just trust the array indexing.
      // Let's make the mock return distinguishable objects for this test:
      SpriteAnimation.mockImplementation((sX, sY) => ({ sX_val: sX, sY_val: sY }));

      const newSheet = new SpriteAnimSheet(startAnim, stopAnim, X); // Re-create with new mock behavior

      newSheet.orderIndex = 0;
      let frame1 = newSheet.getFrames();
      expect(frame1.sY_val).toBe(startAnim); // Frame for index 0 (sY = 0 + 3 = 3)

      newSheet.orderIndex = 1;
      let frame2 = newSheet.getFrames();
      expect(frame2.sY_val).toBe(startAnim + 1); // Frame for index 1 (sY = 1 + 3 = 4)

      newSheet.orderIndex = 2;
      let frame3 = newSheet.getFrames();
      expect(frame3.sY_val).toBe(startAnim + 2); // Frame for index 2 (sY = 2 + 3 = 5)
    });

    it('should loop through frames correctly using modulo operator', () => {
      const sheet = new SpriteAnimSheet(startAnim, stopAnim, X); // 3 frames (length = 3)
      SpriteAnimation.mockImplementation((sX, sY) => ({ sX_val: sX, sY_val: sY }));
      const newSheet = new SpriteAnimSheet(startAnim, stopAnim, X);


      newSheet.orderIndex = 3; // Should wrap around to the first frame (index 0)
      let frameLooped1 = newSheet.getFrames();
      expect(frameLooped1.sY_val).toBe(startAnim); // (3 % 3 = 0) -> sY = 0 + 3

      newSheet.orderIndex = 4; // Should wrap around to the second frame (index 1)
      let frameLooped2 = newSheet.getFrames();
      expect(frameLooped2.sY_val).toBe(startAnim + 1); // (4 % 3 = 1) -> sY = 1 + 3
    });

    it('should return the first frame if orderIndex is a multiple of animLength', () => {
      const sheet = new SpriteAnimSheet(startAnim, stopAnim, X); // 3 frames
      SpriteAnimation.mockImplementation((sX, sY) => ({ sX_val: sX, sY_val: sY }));
      const newSheet = new SpriteAnimSheet(startAnim, stopAnim, X);

      newSheet.orderIndex = newSheet.animLength * 2; // e.g., 6
      let frame = newSheet.getFrames();
      expect(frame.sY_val).toBe(startAnim);
    });
  });
});
