import { TankPlayer } from '../entities/TankPlayer.js';
import { EnemyTank } from '../entities/EnemyTank.js';
import { SpriteAnimSheet } from '../animation/SpriteAnimSheet.js';
import { getMapConfig } from '../game/MapConfig.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { BulletPool } from '../pooling/ObjectPool.js';
import type { LevelManager } from '../game/levels/LevelManager.js';
import type { CollisionSystem as CollisionSystemType } from '../systems/CollisionSystem.js';
import type { Bullet } from '../entities/Bullet.js';
import type { Direction } from '../types/index.js';

interface GameObjManagerOptions {
    levelManager?: LevelManager | null;
    collisionSystem?: CollisionSystemType | null;
}

interface CommandObject {
    nextX: number;
    nextY: number;
    stop: boolean;
    fire?: boolean;
}

interface Bounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

interface MapDimensions {
    width: number;
    height: number;
}

interface GameState {
    player: TankPlayer;
}

/**
 * GameObjManager - Manages all game objects (player, enemies, bullets)
 */
export class GameObjManager {
    levelManager: LevelManager | null;
    collisionSystem: CollisionSystemType;
    gameObjects: TankPlayer[];
    cmd: CommandObject;
    bullets: Bullet[];
    enemies: EnemyTank[];
    enemiesRemaining: number;
    enemiesOnField: number;
    spawnTimer: number;
    spawnInterval: number;
    mapConfig: ReturnType<typeof getMapConfig>;
    score?: number;
    private bulletPool: BulletPool;

    // Optional callbacks
    onEnemyDestroyed?: (enemy: EnemyTank, points: number) => void;
    onBaseDestroyed?: () => void;

    constructor(options: GameObjManagerOptions = {}) {
        this.levelManager = options.levelManager || null;
        this.collisionSystem = options.collisionSystem ||
            new CollisionSystem(this.levelManager, { tileSize: 33 });

        // Initialize bullet pool (20 pre-allocated bullets, max 100)
        this.bulletPool = new BulletPool(20, 100);

        // Create player tank
        const playerStart = this.levelManager ? this.levelManager.getPlayerStart() : null;
        const startX = playerStart ? playerStart.x * 33 + 33/2 : 12 * 33 + 33/2;
        const startY = playerStart ? playerStart.y * 33 + 33/2 : 12 * 33 + 33/2;
        const startDir = playerStart ? playerStart.direction : 'w';

        const player = new TankPlayer('Player', startDir, 0);
        player.x = startX;
        player.y = startY;
        player.updateSelfCoor();
        // Player tank sprites: row 0, columns 0-7 (4 directions × 2 frames for animation)
        player.animSheet = new SpriteAnimSheet(0, 7, 0);

        this.gameObjects = [player];

        // Command object for player actions
        this.cmd = {
            nextX: 0,
            nextY: 0,
            stop: true,
            fire: false
        };

        // Bullets management
        this.bullets = [];

        // Enemies management
        this.enemies = [];
        this.enemiesRemaining = 0;
        this.enemiesOnField = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 3.0;

        // Cache map config
        this.mapConfig = getMapConfig();

        // Initialize enemies from level
        this._initEnemies();
    }

    /**
     * Initialize enemies from level configuration
     */
    _initEnemies(): void {
        if (!this.levelManager || !this.levelManager.currentLevel) return;

        const enemyConfig = this.levelManager.getEnemyConfig();
        if (!enemyConfig) return;

        this.enemiesRemaining = enemyConfig.total;
        this.enemiesOnField = 0;
        this.spawnInterval = enemyConfig.spawnInterval || 3.0;
        this.spawnTimer = 0;
        this.enemies = [];
    }

    /**
     * Spawn an enemy at a spawn point
     */
    spawnEnemy(): EnemyTank | null {
        if (!this.levelManager) return null;

        const enemyConfig = this.levelManager.getEnemyConfig();
        if (!enemyConfig || this.enemiesOnField >= enemyConfig.maxOnField) return null;

        const spawnPoints = this.levelManager.getEnemySpawnPoints();
        if (spawnPoints.length === 0) return null;

        // Select random spawn point
        const spawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];

        // Select random enemy type
        const type = this.levelManager.selectRandomEnemyType();

        // Convert grid coordinates to pixel coordinates (center of tile)
        const tileSize = this.mapConfig.tileRenderSize;
        const pixelX = spawnPoint.x * tileSize + tileSize / 2;
        const pixelY = spawnPoint.y * tileSize + tileSize / 2;

        const enemy = new EnemyTank({
            type,
            x: pixelX,
            y: pixelY,
            direction: 's' // Enemies spawn facing down
        });

        this.enemies.push(enemy);
        this.enemiesOnField++;
        this.enemiesRemaining--;

        return enemy;
    }

    /**
     * Get the player bounds (from level manager or default config)
     */
    getBounds(): Bounds {
        if (this.levelManager && this.levelManager.currentLevel) {
            const grid = this.levelManager.getMapGrid();
            if (grid && grid[0]) {
                return {
                    minX: 0,
                    maxX: grid[0].length - 1,
                    minY: 0,
                    maxY: grid.length - 1
                };
            }
        }
        return this.mapConfig.playerBounds;
    }

    /**
     * Get map dimensions
     */
    getMapDimensions(): MapDimensions {
        if (this.levelManager && this.levelManager.currentLevel) {
            const grid = this.levelManager.getMapGrid();
            if (grid) {
                return {
                    width: grid[0].length,
                    height: grid.length
                };
            }
        }
        return {
            width: this.mapConfig.cols,
            height: this.mapConfig.rows
        };
    }

    /**
     * Get all tanks (player + enemies) for collision checking
     */
    getAllTanks(): (TankPlayer | EnemyTank)[] {
        const tanks = [...this.gameObjects];
        for (const enemy of this.enemies) {
            if (enemy.active) {
                tanks.push(enemy);
            }
        }
        return tanks;
    }

    /**
     * Main game update method - handles all game logic
     */
    update(deltaTime: number): void {
        if (!this.gameObjects || this.gameObjects.length === 0) {
            return;
        }

        const player = this.gameObjects[0];
        const cmd = this.cmd;
        const bounds = this.getBounds();
        const mapDims = this.getMapDimensions();

        // Player movement with collision detection
        if (cmd.stop === false) {
            let newDestY = player.destY;
            let newDestX = player.destX;

            if (cmd.nextY !== 0) newDestY += cmd.nextY;
            if (cmd.nextX !== 0) newDestX += cmd.nextX;

            // Calculate new pixel position
            const newX = newDestX * this.mapConfig.tileRenderSize;
            const newY = newDestY * this.mapConfig.tileRenderSize;

            // Determine movement direction
            let moveDir: Direction | null = null;
            if (cmd.nextX !== 0) moveDir = cmd.nextX > 0 ? 'd' : 'a';
            else if (cmd.nextY !== 0) moveDir = cmd.nextY > 0 ? 's' : 'w';

            // Calculate movement distance in pixels
            const moveDist = Math.max(Math.abs(cmd.nextX), Math.abs(cmd.nextY)) * this.mapConfig.tileRenderSize;

            // Check collision with walls
            const collision = this.collisionSystem.checkTankCollision(
                { x: newX, y: newY, width: 30, height: 30 },
                moveDir,
                moveDist
            );

            if (!collision.collision) {
                player.destY = Math.max(bounds.minY, Math.min(newDestY, bounds.maxY));
                player.destX = Math.max(bounds.minX, Math.min(newDestX, bounds.maxX));
                player.updateSelfCoor();
            }
        }

        // Firing logic
        if (cmd.fire && player && player.shoot) {
            const bullet = player.shoot();
            if (bullet && this.addBullet) {
                this.addBullet(bullet);
            }
            cmd.fire = false;
        }

        // Update enemies
        this._updateEnemies(deltaTime);

        // Update bullets with collision detection
        if (this.updateBullets) {
            const mapWidth = mapDims.width * this.mapConfig.tileRenderSize;
            const mapHeight = mapDims.height * this.mapConfig.tileRenderSize;
            this._updateAllBullets(deltaTime, mapWidth, mapHeight);
        }

        // Spawn new enemies
        this._updateSpawning(deltaTime);
    }

    /**
     * Update all enemies
     */
    _updateEnemies(deltaTime: number): void {
        const player = this.gameObjects[0];
        const gameState: GameState = { player };

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.active) {
                this.enemies.splice(i, 1);
                continue;
            }

            // Store old position for collision rollback
            const oldX = enemy.x;
            const oldY = enemy.y;

            enemy.update(deltaTime, gameState);

            // Check collision with walls after enemy moves
            const collision = this.collisionSystem.checkTankCollision(
                { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height },
                enemy.direction,
                enemy.speed * deltaTime * 60
            );

            if (collision.collision) {
                // Revert position if collision detected
                enemy.x = oldX;
                enemy.y = oldY;
                // Change direction when hitting wall
                enemy.changeRandomDirection();
            }

            // Add enemy bullets to game bullets
            if (enemy.activeBullets) {
                for (const bullet of enemy.activeBullets) {
                    if (bullet && bullet.active && !this.bullets.includes(bullet)) {
                        this.bullets.push(bullet);
                    }
                }
            }
        }
    }

    /**
     * Update enemy spawning
     */
    _updateSpawning(deltaTime: number): void {
        if (this.enemiesRemaining <= 0) return;

        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        }
    }

    /**
     * Update all bullets with collision
     */
    _updateAllBullets(deltaTime: number, mapWidth: number, mapHeight: number): void {
        const player = this.gameObjects[0];
        const allTanks = this.getAllTanks();

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(deltaTime);

            // Check collision
            const collision = this.collisionSystem.checkBulletCollision(
                bullet,
                allTanks,
                bullet.owner === 'player'
            );

            if (collision.type !== 'none') {
                // Handle collision
                if (collision.type === 'wall') {
                    // Destroy brick walls
                    if (collision.destructible) {
                        this.collisionSystem.destroyTile(collision.tileX, collision.tileY);
                    }
                    bullet.active = false;
                    this._removeBullet(bullet);
                } else if (collision.type === 'tank') {
                    const points = collision.target.takeDamage();
                    if (points > 0 && this.onEnemyDestroyed) {
                        this.onEnemyDestroyed(collision.target, points);
                    }
                    bullet.active = false;
                    this._removeBullet(bullet);
                } else if (collision.type === 'base') {
                    // Base destroyed - game over
                    if (this.onBaseDestroyed) {
                        this.onBaseDestroyed();
                    }
                    bullet.active = false;
                    this._removeBullet(bullet);
                }
            }

            // Remove out-of-bounds bullets
            if (bullet.isOutOfBounds(mapWidth, mapHeight)) {
                this._removeBullet(bullet);
            }
        }
    }

    /**
     * Remove a bullet from tracking and release back to pool
     */
    _removeBullet(bullet: Bullet): void {
        const index = this.bullets.indexOf(bullet);
        if (index !== -1) {
            this.bullets.splice(index, 1);
        }

        // Release bullet back to pool
        this.bulletPool.release(bullet);

        // Also remove from player's tracking
        const player = this.gameObjects[0];
        if (player && player.removeBullet) {
            player.removeBullet(bullet);
        }

        // Remove from enemy tracking
        for (const enemy of this.enemies) {
            if (enemy.active && enemy.removeBullet) {
                enemy.removeBullet(bullet);
            }
        }
    }

    /**
     * Adds a bullet to the game using the object pool.
     * @deprecated Use acquireBullet instead for better performance
     */
    addBullet(bullet: Bullet): void {
        if (bullet && bullet.active) {
            this.bullets.push(bullet);
        }
    }

    /**
     * Acquire a bullet from the object pool.
     * @param x Bullet X position
     * @param y Bullet Y position
     * @param direction Bullet direction
     * @param owner Bullet owner ('player' or 'enemy')
     * @param powerLevel Bullet power level (0-3)
     * @returns A bullet from the pool
     */
    acquireBullet(
        x: number,
        y: number,
        direction: Direction,
        owner: 'player' | 'enemy',
        powerLevel: number = 0
    ): Bullet {
        const bullet = this.bulletPool.acquireBullet(x, y, direction, owner, powerLevel);
        this.bullets.push(bullet);
        return bullet;
    }

    /**
     * Removes a bullet from the game.
     */
    removeBullet(bullet: Bullet): void {
        this._removeBullet(bullet);
    }

    /**
     * Updates all bullets (movement, bounds checking).
     * This method is kept for backward compatibility.
     */
    updateBullets(deltaTime: number, mapWidth: number, mapHeight: number): void {
        // Use the full update with collision detection
        this._updateAllBullets(deltaTime, mapWidth, mapHeight);
    }

    /**
     * Gets all active bullets.
     */
    getBullets(): Bullet[] {
        return this.bullets;
    }

    /**
     * Get score
     */
    getScore(): number {
        return this.score || 0;
    }

    /**
     * Add score
     */
    addScore(points: number): void {
        this.score = (this.score || 0) + points;
    }

    /**
     * Clean up resources
     * Call this when the game is being destroyed or unloaded
     */
    destroy(): void {
        // Clear all arrays
        this.bullets = [];
        this.enemies = [];
        this.gameObjects = [];

        // Clear bullet pool
        this.bulletPool.clear();

        // Reset counters
        this.enemiesRemaining = 0;
        this.enemiesOnField = 0;
        this.spawnTimer = 0;

        // Clear callbacks
        this.onEnemyDestroyed = undefined;
        this.onBaseDestroyed = undefined;

        // Clear collision system cache if available
        if (this.collisionSystem && typeof this.collisionSystem.invalidateCache === 'function') {
            this.collisionSystem.invalidateCache();
        }
    }

    /**
     * Get bullet pool statistics for debugging
     */
    getBulletPoolStats() {
        return this.bulletPool.getStats();
    }
}
