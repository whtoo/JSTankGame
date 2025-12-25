/**
 * Bullet entity representing a projectile fired by tanks.
 */

import type { Direction } from '../types/index.js';

export class Bullet {
    x: number;
    y: number;
    direction: Direction;
    owner: 'player' | 'enemy';
    powerLevel: number;
    speed: number;
    size: number;
    width: number;
    height: number;
    active: boolean;
    sourceDx: number;
    sourceDy: number;
    sourceW: number;
    sourceH: number;

    constructor(x: number, y: number, direction: Direction, owner: 'player' | 'enemy', powerLevel: number = 0) {
        // Position properties (pixel-based)
        this.x = x;
        this.y = y;

        // Direction
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
     */
    update(deltaTime: number): void {
        const moveDistance = this.speed * (deltaTime * 60);

        switch (this.direction) {
            case 'w':
            case 'up':
                this.y -= moveDistance;
                break;
            case 's':
            case 'down':
                this.y += moveDistance;
                break;
            case 'a':
            case 'left':
                this.x -= moveDistance;
                break;
            case 'd':
            case 'right':
                this.x += moveDistance;
                break;
        }
    }

    /**
     * Checks if bullet is outside map boundaries.
     */
    isOutOfBounds(mapWidth: number, mapHeight: number): boolean {
        return (
            this.x < 0 ||
            this.x >= mapWidth ||
            this.y < 0 ||
            this.y >= mapHeight
        );
    }
}
