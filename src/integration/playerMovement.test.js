import { GameObjManager } from '../managers/GameObjManager.js';
import { APWatcher } from '../input/APWatcher.js';
// TankPlayer is implicitly created by GameObjManager, so not directly imported here for instantiation.

// Helper to simulate key events (can be imported if we move it to a shared test util)
function simulateKeyEvent(target, type, which) {
  const event = new KeyboardEvent(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'which', { value: which, writable: false });
  target.dispatchEvent(event);
}

/**
 * Simulates the core game update logic for player movement based on cmd object.
 * This is extracted from Render.updateGame for testability.
 * @param {Object} gameManager - The game manager instance.
 * @param {number} deltaTime - The time since the last update (currently not used by this simplified version).
 */
function updatePlayerMovement(gameManager, deltaTime = 1/60) {
  if (!gameManager || !gameManager.gameObjects || gameManager.gameObjects.length === 0) {
    return;
  }
  const player = gameManager.gameObjects[0];
  const cmd = gameManager.cmd;

  if (cmd.stop === false) {
    if (cmd.nextY !== 0) {
      player.destY += cmd.nextY;
    }
    if (cmd.nextX !== 0) {
      player.destX += cmd.nextX;
    }

    // Boundary checks (example from Render.updateGame)
    player.destY = Math.max(0, Math.min(player.destY, 13));
    player.destX = Math.max(0, Math.min(player.destX, 23));

    player.updateSelfCoor();
  }
}


describe('Player Movement Integration', () => {
  let gameManager;
  let apWatcher;
  let player; // Reference to the player instance within gameManager
  let body;

  beforeEach(() => {
    // Set up a fresh body for each test
    document.body.innerHTML = '';
    body = document.body;

    gameManager = new GameObjManager();
    player = gameManager.gameObjects[0]; // Get the player instance
    apWatcher = new APWatcher(gameManager);

    // Reset player position and cmd state for each test for consistency
    player.destX = 6; // Default start X
    player.destY = 4; // Default start Y
    player.updateSelfCoor();
    gameManager.cmd = { nextX: 0, nextY: 0, stop: true };
  });

  it('should move player up when "w" is pressed and game is updated', () => {
    const initialDestY = player.destY;
    const expectedDeltaPerFrame = -player.per; // 'w' moves up

    // 1. Simulate key press (updates gameManager.cmd via player.rotationAP)
    simulateKeyEvent(body, 'keypress', 119); // 'w' key
    expect(gameManager.cmd.stop).toBe(false);
    // player.rotationAP will set cmd.nextY to -player.per

    // 2. Simulate game update (reads gameManager.cmd and updates player position)
    updatePlayerMovement(gameManager);

    expect(player.destY).toBeCloseTo(initialDestY + expectedDeltaPerFrame);
    expect(player.Y).toBeCloseTo((initialDestY + expectedDeltaPerFrame) * player.destCook);

    // Simulate another update frame with key still held (implicitly, cmd.stop is false)
    updatePlayerMovement(gameManager);
    expect(player.destY).toBeCloseTo(initialDestY + (2 * expectedDeltaPerFrame));

    // 3. Simulate key release
    simulateKeyEvent(body, 'keyup', 119);
    expect(gameManager.cmd.stop).toBe(true);
    const destYAfterKeyUp = player.destY;

    // 4. Simulate game update after key release (player should not move)
    updatePlayerMovement(gameManager);
    expect(player.destY).toBeCloseTo(destYAfterKeyUp); // No change
  });

  it('should move player left when "a" is pressed and game is updated', () => {
    const initialDestX = player.destX;
    const expectedDeltaPerFrame = -player.per; // 'a' moves left

    simulateKeyEvent(body, 'keypress', 97); // 'a' key
    updatePlayerMovement(gameManager);

    expect(player.destX).toBeCloseTo(initialDestX + expectedDeltaPerFrame);
    expect(player.X).toBeCloseTo((initialDestX + expectedDeltaPerFrame) * player.destCook);

    simulateKeyEvent(body, 'keyup', 97);
    const destXAfterKeyUp = player.destX;
    updatePlayerMovement(gameManager);
    expect(player.destX).toBeCloseTo(destXAfterKeyUp);
  });

  it('should move player down when "s" is pressed and game is updated', () => {
    const initialDestY = player.destY;
    const expectedDeltaPerFrame = player.per; // 's' moves down

    simulateKeyEvent(body, 'keypress', 115); // 's' key
    updatePlayerMovement(gameManager);

    expect(player.destY).toBeCloseTo(initialDestY + expectedDeltaPerFrame);

    simulateKeyEvent(body, 'keyup', 115);
  });

  it('should move player right when "d" is pressed and game is updated', () => {
    const initialDestX = player.destX;
    const expectedDeltaPerFrame = player.per; // 'd' moves right

    simulateKeyEvent(body, 'keypress', 100); // 'd' key
    updatePlayerMovement(gameManager);

    expect(player.destX).toBeCloseTo(initialDestX + expectedDeltaPerFrame);

    simulateKeyEvent(body, 'keyup', 100);
  });

  it('should handle multiple key presses and updates correctly (e.g., move, change direction, move)', () => {
    const initialDestX = player.destX;
    const initialDestY = player.destY;

    // Press 'd' (right), update twice
    simulateKeyEvent(body, 'keypress', 100); // 'd'
    updatePlayerMovement(gameManager);
    updatePlayerMovement(gameManager);
    expect(player.destX).toBeCloseTo(initialDestX + 2 * player.per);
    expect(player.destY).toBeCloseTo(initialDestY); // No Y movement

    // Now press 's' (down), update once
    // Key press for 's' will change direction in player.rotationAP and reset cmd.nextX/Y
    // before setting cmd.nextY for 's'
    simulateKeyEvent(body, 'keypress', 115); // 's'
    const currentXAfterD = player.destX; // X should not change on this 's' update cycle
    updatePlayerMovement(gameManager);

    expect(player.destX).toBeCloseTo(currentXAfterD); // X should not have changed from previous
    expect(player.destY).toBeCloseTo(initialDestY + player.per); // Y moves one step

    simulateKeyEvent(body, 'keyup', 100); // Release 'd' (though 's' is now active)
    simulateKeyEvent(body, 'keyup', 115); // Release 's'
  });

  it('should respect boundaries', () => {
    player.destX = 0.05; // Very close to left boundary
    player.destY = 0.05; // Very close to top boundary
    player.updateSelfCoor();

    // Try to move left ('a')
    simulateKeyEvent(body, 'keypress', 97); // 'a'
    updatePlayerMovement(gameManager); // cmd.nextX will be -player.per
    expect(player.destX).toBe(0); // Should be clamped to 0

    // Try to move up ('w')
    simulateKeyEvent(body, 'keypress', 119); // 'w'
    updatePlayerMovement(gameManager); // cmd.nextY will be -player.per
    expect(player.destY).toBe(0); // Should be clamped to 0

    // Check right boundary (max 23)
    player.destX = 22.95;
    player.updateSelfCoor();
    simulateKeyEvent(body, 'keypress', 100); // 'd'
    updatePlayerMovement(gameManager);
    expect(player.destX).toBe(23);

    // Check bottom boundary (max 13)
    player.destY = 12.95;
    player.updateSelfCoor();
    simulateKeyEvent(body, 'keypress', 115); // 's'
    updatePlayerMovement(gameManager);
    expect(player.destY).toBe(13);

    simulateKeyEvent(body, 'keyup', 97);
    simulateKeyEvent(body, 'keyup', 119);
    simulateKeyEvent(body, 'keyup', 100);
    simulateKeyEvent(body, 'keyup', 115);
  });
});
