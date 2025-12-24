/**
 * Bullet entity representing a projectile fired by tanks.
 *
 * @module entities/Bullet
 */

export class Bullet {
  /**
   * Creates a new Bullet instance.
   *
   * @param {number} x - Initial X position (pixel coordinates)
   * @param {number} y - Initial Y position (pixel coordinates)
   * @param {string} direction - Direction of travel ('w', 's', 'a', 'd')
   * @param {string} owner - Owner identifier ('player' or 'enemy')
   * @param {number} powerLevel - Weapon power level (0-3)
   */
  constructor(x, y, direction, owner, powerLevel = 0) {
    // Position properties (pixel-based)
    this.x = x;
    this.y = y;

    // Direction: 'w' (up), 's' (down), 'a' (left), 'd' (right)
    this.direction = direction;

    // Owner tracking for collision logic
    this.owner = owner;

    // Power level (0-3) - affects size and damage
    this.powerLevel = Math.min(3, Math.max(0, powerLevel));

    // Movement speed - faster than tank (tank speed is 6)
    this.speed = 12;

    // Size based on power level: 8, 10, 12, 14 pixels
    this.size = 8 + (this.powerLevel * 2);

    // Bounds for collision and rendering
    this.width = this.size;
    this.height = this.size;

    // Active state - false when bullet should be removed
    this.active = true;

    // Sprite properties (following Player.js pattern)
    // TODO: Update with actual sprite coordinates when bullet sprites are available
    this.sourceDx = 528;
    this.sourceDy = 99;
    this.sourceW = 16;
    this.sourceH = 16;
  }

  /**
   * Updates bullet position based on direction and delta time.
   * Frame-rate independent movement.
   *
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    const moveDistance = this.speed * (deltaTime * 60);

    switch (this.direction) {
      case 'w':
        this.y -= moveDistance;
        break;
      case 's':
        this.y += moveDistance;
        break;
      case 'a':
        this.x -= moveDistance;
        break;
      case 'd':
        this.x += moveDistance;
        break;
    }
  }

  /**
   * Checks if bullet is outside map boundaries.
   *
   * @param {number} mapWidth - Map width in pixels
   * @param {number} mapHeight - Map height in pixels
   * @returns {boolean} True if bullet is out of bounds
   */
  isOutOfBounds(mapWidth, mapHeight) {
    return (
      this.x < 0 ||
      this.x >= mapWidth ||
      this.y < 0 ||
      this.y >= mapHeight
    );
  }
}
