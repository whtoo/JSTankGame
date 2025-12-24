import { APWatcher } from './APWatcher.js';

// Mock the Player class and its rotationAP method
const mockPlayerRotationAP = jest.fn();
const mockPlayer = {
  destX: 10, // Initial dummy position
  destY: 10,
  rotationAP: mockPlayerRotationAP,
};

// Mock GameManager
const mockGameManager = {
  gameObjects: [mockPlayer], // APWatcher expects player at index 0
  cmd: {
    nextX: 0,
    nextY: 0,
    stop: true,
    fire: false,
  },
};

// Helper to simulate key events
function simulateKeyEvent(target, type, which) {
  const event = new KeyboardEvent(type, { bubbles: true, cancelable: true });
  // JSDOM doesn't fully implement e.which, so we set it manually.
  Object.defineProperty(event, 'which', { value: which, writable: false });
  target.dispatchEvent(event);
}


describe('APWatcher', () => {
  let apWatcher;
  let body;

  beforeEach(() => {
    // Reset mocks and gameManager state before each test
    mockPlayerRotationAP.mockClear();
    mockGameManager.cmd = { nextX: 0, nextY: 0, stop: true, fire: false };
    mockGameManager.gameObjects[0] = mockPlayer; // Ensure player mock is reset if modified

    // Set up a fresh body for each test to avoid listener conflicts
    document.body.innerHTML = ''; // Clear previous body content if any
    body = document.body; // APWatcher attaches listeners to document.body

    apWatcher = new APWatcher(mockGameManager);
  });

  afterEach(() => {
    // Clean up listeners if APWatcher had a destroy method
    // if (apWatcher.destroy) {
    //   apWatcher.destroy();
    // }
    // For now, relying on fresh body for isolation.
  });

  describe('keyWatchDown', () => {
    it('should set cmd.stop to false on key press', () => {
      simulateKeyEvent(body, 'keypress', 119); // 'w' key
      expect(mockGameManager.cmd.stop).toBe(false);
    });

    it('should call player.rotationAP with "w" and cmd for "w" key (119)', () => {
      simulateKeyEvent(body, 'keypress', 119); // 'w' key
      expect(mockPlayerRotationAP).toHaveBeenCalledWith('w', mockGameManager.cmd);
    });

    it('should call player.rotationAP with "s" and cmd for "s" key (115)', () => {
      simulateKeyEvent(body, 'keypress', 115); // 's' key
      expect(mockPlayerRotationAP).toHaveBeenCalledWith('s', mockGameManager.cmd);
    });

    it('should call player.rotationAP with "a" and cmd for "a" key (97)', () => {
      simulateKeyEvent(body, 'keypress', 97); // 'a' key
      expect(mockPlayerRotationAP).toHaveBeenCalledWith('a', mockGameManager.cmd);
    });

    it('should call player.rotationAP with "d" and cmd for "d" key (100)', () => {
      simulateKeyEvent(body, 'keypress', 100); // 'd' key
      expect(mockPlayerRotationAP).toHaveBeenCalledWith('d', mockGameManager.cmd);
    });

    it('should reset cmd.nextX and cmd.nextY to 0 before calling rotationAP', () => {
      mockGameManager.cmd.nextX = 5;
      mockGameManager.cmd.nextY = 5;
      simulateKeyEvent(body, 'keypress', 119); // 'w' key
      // Check that rotationAP was called after nextX/Y were reset within keyWatchDown
      // This relies on keyWatchDown resetting them *before* calling rotationAP
      expect(mockPlayerRotationAP.mock.calls[0][1].nextX).toBe(0); // cmd.nextX should be 0 when passed to rotationAP
      expect(mockPlayerRotationAP.mock.calls[0][1].nextY).toBe(0); // cmd.nextY should be 0
    });

    // Boundary condition checks (these depend on player's internal state)
    it('should call rotationAP if player is within top boundary for "w"', () => {
      mockPlayer.destY = 1; // Within boundary
      simulateKeyEvent(body, 'keypress', 119); // 'w'
      expect(mockPlayerRotationAP).toHaveBeenCalled();
    });

    it('should NOT call rotationAP if player is at top boundary for "w"', () => {
      mockPlayer.destY = 0; // At boundary
      simulateKeyEvent(body, 'keypress', 119); // 'w'
      // Note: APWatcher's current logic is `player.destY > 0`. If it's 0, it won't call.
      expect(mockPlayerRotationAP).not.toHaveBeenCalled();
    });

    // Add similar boundary tests for s, a, d if needed, adjusting mockPlayer.destY/destX
  });

  describe('keyWatchDown - firing', () => {
    it('should set cmd.fire to true for spacebar (32)', () => {
      simulateKeyEvent(body, 'keypress', 32); // Spacebar
      expect(mockGameManager.cmd.fire).toBe(true);
    });

    it('should not call rotationAP for spacebar', () => {
      simulateKeyEvent(body, 'keypress', 32); // Spacebar
      expect(mockPlayerRotationAP).not.toHaveBeenCalled();
    });
  });

  describe('keyWatcherUp - firing', () => {
    it('should set cmd.stop to true on key up', () => {
      // First, simulate a key press to set stop to false
      simulateKeyEvent(body, 'keypress', 119); // 'w' key
      expect(mockGameManager.cmd.stop).toBe(false);

      simulateKeyEvent(body, 'keyup', 119); // 'w' key release
      expect(mockGameManager.cmd.stop).toBe(true);
    });

    it('should set cmd.nextX and cmd.nextY to 0 on key up', () => {
      mockGameManager.cmd.nextX = 5; // Simulate some movement intention
      mockGameManager.cmd.nextY = -5;

      simulateKeyEvent(body, 'keyup', 119); // 'w' key release
      expect(mockGameManager.cmd.nextX).toBe(0);
      expect(mockGameManager.cmd.nextY).toBe(0);
    });
  });
});
