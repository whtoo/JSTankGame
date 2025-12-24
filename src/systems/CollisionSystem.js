/**
 * Collision System - Handles collision detection for tanks, bullets, and terrain
 */
import { TileType } from '../game/levels/LevelConfig.js';

export class CollisionSystem {
    /**
     * @param {LevelManager} levelManager - Level manager for map data
     * @param {object} options - Configuration options
     */
    constructor(levelManager, options = {}) {
        this.levelManager = levelManager;
        this.tileSize = options.tileSize || 33; // Render size in pixels
        this.gridSize = options.gridSize || 32; // Source sprite size

        // Collision callbacks
        this.onTankHitWall = options.onTankHitWall || null;
        this.onBulletHitWall = options.onBulletHitWall || null;
        this.onBulletHitTank = options.onBulletHitTank || null;
        this.onBaseHit = options.onBaseHit || null;
    }

    /**
     * Check if a tank collides with any walls
     * @param {object} tank - Tank object with x, y, width, height (in pixels)
     * @param {string} direction - Movement direction
     * @param {number} speed - Movement speed
     * @returns {object} - { collision: boolean, newX: number, newY: number }
     */
    checkTankCollision(tank, direction, speed) {
        const grid = this.levelManager.getMapGrid();
        if (!grid) return { collision: false, newX: tank.x, newY: tank.y };

        // Calculate new position
        let newX = tank.x;
        let newY = tank.y;

        switch (direction) {
            case 'w': newY -= speed; break;
            case 's': newY += speed; break;
            case 'a': newX -= speed; break;
            case 'd': newX += speed; break;
        }

        // Get tank bounding box at new position
        const halfSize = tank.width / 2;
        const corners = [
            { x: newX - halfSize, y: newY - halfSize }, // top-left
            { x: newX + halfSize, y: newY - halfSize }, // top-right
            { x: newX - halfSize, y: newY + halfSize }, // bottom-left
            { x: newX + halfSize, y: newY + halfSize }  // bottom-right
        ];

        // Check if any corner hits a wall
        for (const corner of corners) {
            const tileX = Math.floor(corner.x / this.tileSize);
            const tileY = Math.floor(corner.y / this.tileSize);

            if (this.isSolidTile(tileX, tileY)) {
                return { collision: true, newX: tank.x, newY: tank.y };
            }
        }

        return { collision: false, newX, newY };
    }

    /**
     * Check if a tile is solid (impassable)
     * @param {number} x - Grid X
     * @param {number} y - Grid Y
     * @returns {boolean}
     */
    isSolidTile(x, y) {
        // If no level manager, no walls exist
        if (!this.levelManager) {
            return false;
        }

        const grid = this.levelManager.getMapGrid();
        if (!grid || y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) {
            return false; // No solid walls outside map bounds
        }

        const tileId = grid[y][x];
        // Bricks, steel, water, and base are solid
        const solidTiles = [TileType.BRICK, TileType.STEEL, TileType.WATER, TileType.BASE];
        return solidTiles.includes(tileId);
    }

    /**
     * Check if tile is destructible
     * @param {number} x - Grid X
     * @param {number} y - Grid Y
     * @returns {boolean}
     */
    isDestructibleTile(x, y) {
        const grid = this.levelManager.getMapGrid();
        if (!grid || y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) {
            return false;
        }
        return grid[y][x] === TileType.BRICK;
    }

    /**
     * Check bullet collision with walls and tanks
     * @param {Bullet} bullet - Bullet object
     * @param {Array} tanks - Array of tank objects
     * @param {boolean} isPlayerBullet - Whether bullet belongs to player
     * @returns {object} - { type: 'wall'|'tank'|'none', position: {x, y}, target: object }
     */
    checkBulletCollision(bullet, tanks, isPlayerBullet) {
        // Check wall collision
        const tileX = Math.floor(bullet.x / this.tileSize);
        const tileY = Math.floor(bullet.y / this.tileSize);

        // Check if bullet hit base
        if (this.levelManager) {
            const basePos = this.levelManager.getBasePosition();
            if (basePos && Math.abs(bullet.x - basePos.x * this.tileSize - this.tileSize/2) < this.tileSize &&
                Math.abs(bullet.y - basePos.y * this.tileSize - this.tileSize/2) < this.tileSize) {
                return { type: 'base', position: { x: bullet.x, y: bullet.y } };
            }
        }

        // Check wall collision
        if (this.isSolidTile(tileX, tileY)) {
            return {
                type: 'wall',
                position: { x: tileX * this.tileSize + this.tileSize/2, y: tileY * this.tileSize + this.tileSize/2 },
                tileX,
                tileY,
                destructible: this.isDestructibleTile(tileX, tileY)
            };
        }

        // Check tank collision
        for (const tank of tanks) {
            if (tank.isPlayer === isPlayerBullet) continue; // Don't hit own tanks

            const dx = bullet.x - tank.x;
            const dy = bullet.y - tank.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < (tank.width / 2 + bullet.width / 2)) {
                return {
                    type: 'tank',
                    position: { x: bullet.x, y: bullet.y },
                    target: tank
                };
            }
        }

        return { type: 'none' };
    }

    /**
     * Destroy a tile (for destructible walls)
     * @param {number} x - Grid X
     * @param {number} y - Grid Y
     */
    destroyTile(x, y) {
        const grid = this.levelManager.getMapGrid();
        if (grid && y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
            if (this.isDestructibleTile(x, y)) {
                grid[y][x] = TileType.EMPTY;
                return true;
            }
        }
        return false;
    }

    /**
     * Get tile at pixel position
     * @param {number} x - Pixel X
     * @param {number} y - Pixel Y
     * @returns {object} - { tileId, type, gridX, gridY }
     */
    getTileAt(x, y) {
        const gridX = Math.floor(x / this.tileSize);
        const gridY = Math.floor(y / this.tileSize);
        const grid = this.levelManager.getMapGrid();

        if (!grid || gridY < 0 || gridY >= grid.length || gridX < 0 || gridX >= grid[0].length) {
            return { tileId: -1, type: 'out_of_bounds', gridX, gridY };
        }

        const tileId = grid[gridY][gridX];
        let type = 'empty';

        switch (tileId) {
            case TileType.BRICK: type = 'brick'; break;
            case TileType.STEEL: type = 'steel'; break;
            case TileType.WATER: type = 'water'; break;
            case TileType.GRASS: type = 'grass'; break;
            case TileType.ICE: type = 'ice'; break;
            case TileType.BASE: type = 'base'; break;
        }

        return { tileId, type, gridX, gridY };
    }

    /**
     * Check if a position is in water (tanks can't enter)
     * @param {number} x - Pixel X
     * @param {number} y - Pixel Y
     * @returns {boolean}
     */
    isInWater(x, y) {
        const tile = this.getTileAt(x, y);
        return tile.type === 'water';
    }

    /**
     * Check if a position is on ice (reduced friction)
     * @param {number} x - Pixel X
     * @param {number} y - Pixel Y
     * @returns {boolean}
     */
    isOnIce(x, y) {
        const tile = this.getTileAt(x, y);
        return tile.type === 'ice';
    }

    /**
     * Get spawn points for enemies
     * @returns {Array} - Array of {x, y} in pixels
     */
    getEnemySpawnPoints() {
        const spawnPoints = this.levelManager.getEnemySpawnPoints();
        return spawnPoints.map(sp => ({
            x: sp.x * this.tileSize + this.tileSize / 2,
            y: sp.y * this.tileSize + this.tileSize / 2
        }));
    }

    /**
     * Check if two rectangles overlap
     * @param {object} rect1 - {x, y, width, height}
     * @param {object} rect2 - {x, y, width, height}
     * @returns {boolean}
     */
    rectsOverlap(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
}

export default CollisionSystem;
