/**
 * Collision System - Handles collision detection for tanks, bullets, and terrain
 */

import { TileType } from '../game/levels/LevelConfig.js';
import type { Direction, CollisionResult, Position, Size } from '../types/index.js';
import type { LevelManager } from '../game/levels/LevelManager.js';
import type { TileMapLoader } from '../game/TileMapLoader.js';

interface TankBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface BulletBounds extends Position, Size {
    owner: 'player' | 'enemy';
}

interface TankEntity {
    x: number;
    y: number;
    width: number;
    height: number;
    isPlayer?: boolean;
    takeDamage?(): number;
}

interface CollisionSystemOptions {
    tileSize?: number;
    gridSize?: number;
    onTankHitWall?: () => void;
    onBulletHitWall?: () => void;
    onBulletHitTank?: () => void;
    onBaseHit?: () => void;
}

export class CollisionSystem {
    levelManager: LevelManager | null;
    tileMapLoader: TileMapLoader | null;
    tileSize: number;
    gridSize: number;
    private gridCache: number[][] | null;
    private cacheTimestamp: number;

    constructor(levelManager: LevelManager | null, options: CollisionSystemOptions = {}) {
        this.levelManager = levelManager;
        this.tileMapLoader = null;
        this.tileSize = options.tileSize || 33;
        this.gridSize = options.gridSize || 32;
        this.gridCache = null;
        this.cacheTimestamp = 0;
    }

    setTileMapLoader(loader: TileMapLoader | null): void {
        this.tileMapLoader = loader;
    }

    /**
     * Get map grid with caching for performance
     */
    private _getMapGrid(): number[][] | null {
        if (!this.levelManager) return null;

        const currentTimestamp = Date.now();
        // Cache for 100ms to avoid excessive map grid lookups
        if (this.gridCache && currentTimestamp - this.cacheTimestamp < 100) {
            return this.gridCache;
        }

        this.gridCache = this.levelManager.getMapGrid();
        this.cacheTimestamp = currentTimestamp;
        return this.gridCache;
    }

    /**
     * Invalidate grid cache (call when map changes)
     */
    invalidateCache(): void {
        this.gridCache = null;
    }

    /**
     * Check if a tank collides with any walls
     */
    checkTankCollision(tank: TankBounds, direction: Direction, speed: number): CollisionResult {
        const grid = this._getMapGrid();
        if (!grid) return { collision: false, type: 'none' };

        let newX = tank.x;
        let newY = tank.y;

        switch (direction) {
            case 'w': case 'up': newY -= speed; break;
            case 's': case 'down': newY += speed; break;
            case 'a': case 'left': newX -= speed; break;
            case 'd': case 'right': newX += speed; break;
        }

        const halfSize = tank.width / 2;
        const corners = [
            { x: newX - halfSize, y: newY - halfSize },
            { x: newX + halfSize, y: newY - halfSize },
            { x: newX - halfSize, y: newY + halfSize },
            { x: newX + halfSize, y: newY + halfSize }
        ];

        for (const corner of corners) {
            const tileX = Math.floor(corner.x / this.tileSize);
            const tileY = Math.floor(corner.y / this.tileSize);

            if (this.isSolidTile(tileX, tileY)) {
                return { collision: true, type: 'wall' };
            }
        }

        return { collision: false, type: 'none' };
    }

    /**
     * Check if a tile is solid (impassable)
     */
    isSolidTile(x: number, y: number): boolean {
        if (!this.levelManager) {
            return false;
        }

        const grid = this._getMapGrid();
        if (!grid || y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) {
            return false;
        }

        const tileId = grid[y][x];

        // Use TileMapLoader to check passability if available
        if (this.tileMapLoader) {
            const tilesetData = this.tileMapLoader.getCachedMap('level2.json')?.tilesetData;
            if (tilesetData) {
                return !this.tileMapLoader.isTilePassable(tileId, tilesetData);
            }
        }

        // Fallback to old method using TileType constants
        const solidTiles = [TileType.BRICK, TileType.STEEL, TileType.WATER, TileType.BASE];
        return solidTiles.includes(tileId);
    }

    /**
     * Check if tile is destructible
     */
    isDestructibleTile(x: number, y: number): boolean {
        const grid = this._getMapGrid();
        if (!grid || y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) {
            return false;
        }
        return grid[y][x] === TileType.BRICK;
    }

    /**
     * Check bullet collision with walls and tanks
     */
    checkBulletCollision(bullet: BulletBounds, tanks: TankEntity[], isPlayerBullet: boolean): CollisionResult {
        const tileX = Math.floor(bullet.x / this.tileSize);
        const tileY = Math.floor(bullet.y / this.tileSize);

        // Check if bullet hit base
        if (this.levelManager) {
            const basePos = this.levelManager.getBasePosition();
            if (basePos && Math.abs(bullet.x - basePos.x * this.tileSize - this.tileSize/2) < this.tileSize &&
                Math.abs(bullet.y - basePos.y * this.tileSize - this.tileSize/2) < this.tileSize) {
                return { type: 'base', collision: true };
            }
        }

        // Check wall collision
        if (this.isSolidTile(tileX, tileY)) {
            return {
                type: 'wall',
                collision: true,
                tileX,
                tileY,
                destructible: this.isDestructibleTile(tileX, tileY)
            };
        }

        // Check tank collision
        for (const tank of tanks) {
            if (tank.isPlayer === isPlayerBullet) continue;

            const dx = bullet.x - tank.x;
            const dy = bullet.y - tank.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < (tank.width / 2 + bullet.width / 2)) {
                return {
                    type: 'tank',
                    collision: true,
                    target: tank
                };
            }
        }

        return { type: 'none', collision: false };
    }

    /**
     * Destroy a tile (for destructible walls)
     */
    destroyTile(x: number, y: number): boolean {
        const grid = this._getMapGrid();
        if (grid && y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
            if (this.isDestructibleTile(x, y)) {
                grid[y][x] = TileType.EMPTY;
                this.invalidateCache(); // Invalidate cache after modification
                return true;
            }
        }
        return false;
    }
}

export default CollisionSystem;
