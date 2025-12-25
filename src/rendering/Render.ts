import tankbrigade from '/tankbrigade.png?url';
import { ImageResource } from '../utils/ImageResource.js';
import { getMapConfig } from '../game/MapConfig.js';
import { TileType } from '../game/levels/LevelConfig.js';
import type { GameObjManager as GameObjManagerType } from '../managers/GameObjManager.js';
import type { LevelManager } from '../game/levels/LevelManager.js';
import type { CollisionSystem } from '../systems/CollisionSystem.js';
import type { ISpriteAnimSheet } from '../animation/SpriteAnimSheet.js';
import { getTileAtlas, type TileAtlas } from './TileAtlas.js';
import { getTileRegistry, type TileRegistry } from './TileRegistry.js';
import type { AnimationFrame } from '../types/index.js';
import type { Direction } from '../types/index.js';

interface RenderOptions {
    levelManager?: LevelManager | null;
    collisionSystem?: CollisionSystem | null;
}

interface Viewport {
    x: number;
    y: number;
    width: number;
    height: number;
    enabled: boolean;
}

interface TankLike {
    x: number;
    y: number;
    centerX?: number;
    centerY?: number;
    width: number;
    height: number;
    destW?: number;
    destH?: number;
    arc: number;
    animSheet?: ISpriteAnimSheet | null;
    isPlayer?: boolean;
    color?: string;
    active?: boolean;
}

interface BulletLike {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Render - Handles all game rendering to canvas
 */
export class Render {
    context: CanvasRenderingContext2D;
    gameManager: GameObjManagerType;
    levelManager: LevelManager | null;
    collisionSystem: CollisionSystem | null;
    tileSheet: HTMLImageElement | null;
    lastTime: number;
    offscreenCanvas: HTMLCanvasElement;
    offscreenContext: CanvasRenderingContext2D | null;
    mapConfig: ReturnType<typeof getMapConfig>;
    viewport: Viewport;
    tileAtlas: TileAtlas;
    tileRegistry: TileRegistry;

    constructor(canvasContext: CanvasRenderingContext2D, gameManagerInstance: GameObjManagerType, options: RenderOptions = {}) {
        this.context = canvasContext;
        this.gameManager = gameManagerInstance;
        this.levelManager = options.levelManager || null;
        this.collisionSystem = options.collisionSystem || null;
        this.tileSheet = null;
        this.lastTime = 0;

        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = 800;
        this.offscreenCanvas.height = 500;
        this.offscreenContext = this.offscreenCanvas.getContext('2d');

        // Use map config for dimensions
        this.mapConfig = getMapConfig();

        // Get global instances
        this.tileAtlas = getTileAtlas();
        this.tileRegistry = getTileRegistry();

        // Initialize viewport (disabled by default for full-map rendering)
        this.viewport = {
            x: 0,
            y: 0,
            width: canvasContext.canvas.width || 800,
            height: canvasContext.canvas.height || 600,
            enabled: false
        };

        // Bind renderFrame to this instance
        this.renderFrame = this.renderFrame.bind(this);

        // Initialize asynchronously
        this._initialize();
    }

    /**
     * Enable viewport culling for performance
     */
    enableViewportCulling(enabled: boolean): void {
        this.viewport.enabled = enabled;
    }

    /**
     * Set viewport position
     */
    setViewport(x: number, y: number): void {
        this.viewport.x = x;
        this.viewport.y = y;
    }

    /**
     * Update viewport size (call on canvas resize)
     */
    updateViewportSize(): void {
        this.viewport.width = this.context.canvas.width;
        this.viewport.height = this.context.canvas.height;
    }

    /**
     * Check if an entity is within the viewport
     */
    private _isInViewport(x: number, y: number, width: number, height: number): boolean {
        if (!this.viewport.enabled) return true;

        // Add padding to prevent popping at edges
        const padding = 50;
        return (
            x + width > this.viewport.x - padding &&
            x < this.viewport.x + this.viewport.width + padding &&
            y + height > this.viewport.y - padding &&
            y < this.viewport.y + this.viewport.height + padding
        );
    }

    /**
     * Get visible map bounds for optimized rendering
     */
    private _getVisibleMapBounds(): { startX: number; endX: number; startY: number; endY: number } {
        if (!this.viewport.enabled) {
            const mapData = this._getMapData();
            return {
                startX: 0,
                endX: mapData[0]?.length || 0,
                startY: 0,
                endY: mapData.length || 0
            };
        }

        const tileRenderSize = this.mapConfig.tileRenderSize;
        return {
            startX: Math.max(0, Math.floor(this.viewport.x / tileRenderSize)),
            endX: Math.min(
                Math.ceil((this.viewport.x + this.viewport.width) / tileRenderSize) + 1,
                26 // Max map columns
            ),
            startY: Math.max(0, Math.floor(this.viewport.y / tileRenderSize)),
            endY: Math.min(
                Math.ceil((this.viewport.y + this.viewport.height) / tileRenderSize) + 1,
                26 // Max map rows
            )
        };
    }

    async _initialize(): Promise<void> {
        try {
            // Load spritesheet
            const imageLoader = new ImageResource(tankbrigade);
            this.tileSheet = await imageLoader.load();

            // Initialize tile atlas
            await this.tileAtlas.init();

            // Initialize tile registry
            await this.tileRegistry.init();

            // Cache the map
            this._offscreenCache();
        } catch (error) {
            console.error("Failed to initialize Render component:", error);
        }
    }

    /**
     * Get current map data (from level manager or default)
     */
    _getMapData(): number[][] {
        if (this.levelManager) {
            const grid = this.levelManager.getMapGrid();
            if (grid) return grid;
        }
        // Fallback to default map
        const { mapData: defaultMapData } = getMapConfig();
        return defaultMapData;
    }

    /**
     * Recache the offscreen canvas when level changes
     */
    refreshMapCache(): void {
        if (this.tileSheet) {
            this._offscreenCache();
        }
    }

    _offscreenCache(): void {
        if (!this.tileSheet || !this.offscreenContext) {
            console.error("Tilesheet not loaded, cannot cache offscreen map.");
            return;
        }

        const mapData = this._getMapData();

        this.offscreenContext.fillStyle = "#000000";
        const mapRows = mapData.length;
        const mapCols = mapData[0].length;
        const { tileRenderSize, tileSourceSize, tilesPerRowInSheet } = this.mapConfig;

        // Resize canvas to fit map
        this.offscreenCanvas.width = mapCols * tileRenderSize;
        this.offscreenCanvas.height = mapRows * tileRenderSize;

        this.offscreenContext.fillRect(0, 0, mapCols * tileRenderSize, mapRows * tileRenderSize);

        for (let rowCtr = 0; rowCtr < mapRows; rowCtr++) {
            for (let colCtr = 0; colCtr < mapCols; colCtr++) {
                const tileId = mapData[rowCtr][colCtr];

                // Try to get tile rect from registry first (JSON-based)
                let sourceX: number, sourceY: number;

                const tileRect = this.tileRegistry.getTileRect(tileId);
                if (tileRect) {
                    // Use JSON config coordinates
                    sourceX = tileRect.x;
                    sourceY = tileRect.y;
                } else {
                    // Fallback to grid-based calculation for unknown tiles
                    const adjustedTileId = tileId - 1;
                    sourceX = (adjustedTileId % tilesPerRowInSheet) * tileSourceSize;
                    sourceY = Math.floor(adjustedTileId / tilesPerRowInSheet) * tileSourceSize;
                }

                this.offscreenContext.drawImage(
                    this.tileSheet,
                    sourceX, sourceY,
                    tileSourceSize, tileSourceSize,
                    colCtr * tileRenderSize, rowCtr * tileRenderSize,
                    tileRenderSize, tileRenderSize
                );
            }
        }
    }

    /**
     * Renders a single frame - called by GameLoop
     */
    renderFrame(alpha = 1): void {
        if (!this.tileSheet || !this.context || !this.gameManager) {
            return;
        }

        // Clear canvas
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

        // Render layers (order matters for visibility)
        this.drawMap();
        this.drawBase(); // Draw base/eagle before grass
        this.drawGrass(); // Grass hides tanks
        this.drawPlayer();
        this.drawEnemies();
        this.drawBullets();

        // Debug info
        this._drawFps();
        this._drawLevelInfo();
    }

    /**
     * Draw the base/eagle (briefcase)
     * Note: The base is already rendered in the offscreen cache via the grid,
     * so this method can be used for additional effects or to override the cached version.
     */
    drawBase(): void {
        if (!this.levelManager) return;

        const basePos = this.levelManager.getBasePosition();
        if (!basePos) return;

        const tileRenderSize = this.mapConfig.tileRenderSize;
        const tileSourceSize = this.mapConfig.tileSourceSize;
        const x = basePos.x * tileRenderSize;
        const y = basePos.y * tileRenderSize;

        // Try to use tile from registry first
        let sourceX: number, sourceY: number;

        // Eagle/briefcase is typically at tile ID 102, try registry first
        const tileRect = this.tileRegistry.getTileRect(102);
        if (tileRect) {
            sourceX = tileRect.x;
            sourceY = tileRect.y;
        } else {
            // Fallback to grid-based calculation
            const adjustedTileId = 102 - 1;
            sourceX = (adjustedTileId % this.mapConfig.tilesPerRowInSheet) * tileSourceSize;
            sourceY = Math.floor(adjustedTileId / this.mapConfig.tilesPerRowInSheet) * tileSourceSize;
        }

        this.context.drawImage(
            this.tileSheet,
            sourceX, sourceY,
            tileSourceSize, tileSourceSize,
            x, y,
            tileRenderSize, tileRenderSize
        );

        // Also draw a protective structure around base
        this._drawBaseProtection(x, y);
    }

    /**
     * Draw protective walls around base
     */
    _drawBaseProtection(centerX: number, centerY: number): void {
        const tileSize = this.mapConfig.tileRenderSize;

        // Draw brick walls around the base (like in original Battle City)
        this.context.fillStyle = '#8B4513'; // Brown brick color

        // Top and bottom walls
        for (let i = -1; i <= 1; i++) {
            // Top
            this.context.fillRect(centerX - tileSize + 4, centerY - tileSize + 4, tileSize - 8, 4);
            // Bottom
            this.context.fillRect(centerX - tileSize + 4, centerY + tileSize, tileSize - 8, 4);
        }

        // Side walls (with gaps for entry)
        this.context.fillRect(centerX - tileSize + 4, centerY - tileSize + 4, 4, tileSize - 8);
        this.context.fillRect(centerX + tileSize, centerY - tileSize + 4, 4, tileSize - 8);
    }

    /**
     * Draw grass tiles (which hide tanks)
     * Note: Grass is already in the offscreen cache, but we redraw it on top
     * to hide tanks that pass underneath (like the original Battle City)
     */
    drawGrass(): void {
        const mapData = this._getMapData();
        const { tileRenderSize, tileSourceSize, tilesPerRowInSheet } = this.mapConfig;
        const bounds = this._getVisibleMapBounds();

        for (let rowCtr = bounds.startY; rowCtr < bounds.endY; rowCtr++) {
            for (let colCtr = bounds.startX; colCtr < bounds.endX; colCtr++) {
                const tileId = mapData[rowCtr]?.[colCtr];
                if (tileId === TileType.GRASS) {
                    let sourceX: number, sourceY: number;

                    // Try to get tile rect from registry first (JSON-based)
                    const tileRect = this.tileRegistry.getTileRect(tileId);
                    if (tileRect) {
                        sourceX = tileRect.x;
                        sourceY = tileRect.y;
                    } else {
                        // Fallback to grid-based calculation
                        const adjustedTileId = tileId - 1;
                        sourceX = (adjustedTileId % tilesPerRowInSheet) * tileSourceSize;
                        sourceY = Math.floor(adjustedTileId / tilesPerRowInSheet) * tileSourceSize;
                    }

                    this.context.drawImage(
                        this.tileSheet as HTMLImageElement,
                        sourceX, sourceY,
                        tileSourceSize, tileSourceSize,
                        colCtr * tileRenderSize, rowCtr * tileRenderSize,
                        tileRenderSize, tileRenderSize
                    );
                }
            }
        }
    }

    /**
     * Draw the main map (from offscreen canvas)
     */
    drawMap(): void {
        this.context.drawImage(this.offscreenCanvas, 0, 0,
            this.offscreenCanvas.width, this.offscreenCanvas.height);
    }

    drawPlayer(): void {
        const players = this.gameManager.gameObjects;
        if (!players || players.length === 0) return;

        const item = players[0];
        if (!item.active) return;

        this._drawTank(item);
    }

    /**
     * Draw enemy tanks
     */
    drawEnemies(): void {
        if (!this.gameManager.enemies) return;

        const enemies = this.gameManager.enemies;
        for (const enemy of enemies) {
            if (enemy.active && this._isInViewport(enemy.x, enemy.y, enemy.width, enemy.height)) {
                this._drawTank(enemy);
            }
        }
    }

    /**
     * Draw a tank (player or enemy)
     */
    _drawTank(tank: TankLike): void {
        const angleInRadians = tank.arc / 180 * Math.PI;

        // Handle different tank types: TankPlayer uses centerX/centerY/destW/destH,
        // EnemyTank uses x/y/width/height
        const posX = tank.centerX ?? tank.x;
        const posY = tank.centerY ?? tank.y;
        const tankW = tank.destW ?? tank.width;
        const tankH = tank.destH ?? tank.height;

        if (!tank.animSheet) {
            // Fallback: draw simple tank
            this.context.save();
            this.context.translate(posX, posY);
            this.context.rotate(angleInRadians);
            this.context.fillStyle = tank.isPlayer ? '#FFD700' : (tank.color || '#FFFFFF');
            this.context.fillRect(-tankW / 2, -tankH / 2, tankW, tankH);
            this.context.restore();
            return;
        }

        const animFrame = tank.animSheet.getFrames();
        if (!animFrame) {
            // Fallback: draw simple tank
            this.context.save();
            this.context.translate(posX, posY);
            this.context.rotate(angleInRadians);
            this.context.fillStyle = tank.isPlayer ? '#FFD700' : (tank.color || '#FFFFFF');
            this.context.fillRect(-tankW / 2, -tankH / 2, tankW, tankH);
            this.context.restore();
            return;
        }

        this.context.save();
        this.context.translate(posX, posY);
        this.context.rotate(angleInRadians);
        this.context.drawImage(
            this.tileSheet as HTMLImageElement,
            animFrame.sourceDx, animFrame.sourceDy,
            animFrame.sourceW, animFrame.sourceH,
            -tankW / 2, -tankH / 2,
            tankW, tankH
        );
        this.context.restore();
    }

    drawBullets(): void {
        if (!this.gameManager.getBullets) return;

        const bullets = this.gameManager.getBullets();
        if (bullets && bullets.length > 0) {
            for (const bullet of bullets) {
                if (this._isInViewport(bullet.x, bullet.y, bullet.width, bullet.height)) {
                    this._drawBullet(bullet);
                }
            }
        }

        // Draw enemy bullets
        if (this.gameManager.enemies) {
            for (const enemy of this.gameManager.enemies) {
                if (enemy.active && enemy.getBullets) {
                    const enemyBullets = enemy.getBullets();
                    if (enemyBullets) {
                        for (const bullet of enemyBullets) {
                            if (this._isInViewport(bullet.x, bullet.y, bullet.width, bullet.height)) {
                                this._drawBullet(bullet);
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Draw a single bullet
     */
    _drawBullet(bullet: BulletLike): void {
        this.context.save();
        // NES Battle City style: white bullets
        this.context.fillStyle = '#FFFFFF';
        this.context.fillRect(
            bullet.x - bullet.width / 2,
            bullet.y - bullet.height / 2,
            bullet.width,
            bullet.height
        );
        this.context.restore();
    }

    _drawFps(): void {
        const now = performance.now();
        const delta = now - this.lastTime;
        const fps = delta > 0 ? 1000 / delta : 60;
        this.lastTime = now;

        this.context.fillStyle = '#FFFFFF';
        this.context.fillText(`${Math.round(fps)} fps`, 20, 60);
    }

    _drawLevelInfo(): void {
        if (!this.levelManager) return;

        this.context.fillStyle = '#FFFFFF';
        this.context.font = 'bold 16px monospace';

        // NES Battle City style: 1P at top left
        this.context.fillText('1P', 20, 24);

        // Enemy count display (like original game)
        const enemyConfig = this.levelManager.getEnemyConfig();
        if (enemyConfig && this.gameManager.enemies) {
            const remaining = enemyConfig.total - this.gameManager.enemies.filter(e => e.active).length;
            // Draw enemy icons (simplified as X marks)
            this.context.font = '14px monospace';
            this.context.fillText(`×${remaining}`, 60, 24);
        }

        // Level indicator at top right
        const level = this.levelManager.getCurrentLevelNumber();
        this.context.font = 'bold 14px monospace';
        this.context.textAlign = 'right';
        this.context.fillText(`STAGE ${level}`, 780, 24);
        this.context.textAlign = 'left';
    }

    // ========================================================================
    // TileAtlas-based rendering methods
    // ========================================================================

    /**
     * Draw a tile by name using TileAtlas
     * @param tileName - Name from entities.json (e.g., 'wall_steel', 'explosion_small')
     * @param destX - Destination X on canvas
     * @param destY - Destination Y on canvas
     * @param destW - Optional destination width
     * @param destH - Optional destination height
     * @returns true if tile was drawn, false if not found
     */
    drawTileByName(
        tileName: string,
        destX: number,
        destY: number,
        destW?: number,
        destH?: number
    ): boolean {
        if (!this.tileSheet || !this.tileAtlas.isReady()) {
            console.warn('Cannot draw tile: spritesheet or atlas not ready');
            return false;
        }

        return this.tileAtlas.drawTile(
            this.context,
            this.tileSheet,
            tileName,
            destX,
            destY,
            destW,
            destH
        );
    }

    /**
     * Draw explosion effect at position
     * @param x - Canvas X position
     * @param y - Canvas Y position
     * @param size - 'small', 'medium', or 'large'
     */
    drawExplosion(x: number, y: number, size: 'small' | 'medium' | 'large' = 'medium'): void {
        const tileName = `explosion_${size}`;
        this.drawTileByName(tileName, x - 16, y - 16, 32, 32);
    }

    /**
     * Draw a bullet/projetile sprite
     * @param x - Center X position
     * @param y - Center Y position
     * @param type - 'small' for regular bullet, 'heavy' for shell
     */
    drawProjectile(x: number, y: number, type: 'small' | 'heavy' = 'small'): void {
        const tileName = type === 'heavy' ? 'shell_heavy' : 'bullet_small';
        this.drawTileByName(tileName, x - 16, y - 16, 32, 32);
    }

    /**
     * Draw base/eagle using TileAtlas
     * Alternative to drawBase() that uses the config system
     */
    drawBaseFromAtlas(tileX: number, tileY: number): void {
        const tileRenderSize = this.mapConfig.tileRenderSize;
        this.drawTileByName('eagle_icon', tileX * tileRenderSize, tileY * tileRenderSize, tileRenderSize, tileRenderSize);
    }

    /**
     * Check if a tile exists in the atlas
     */
    hasTile(tileName: string): boolean {
        return this.tileAtlas.hasTile(tileName);
    }

    /**
     * Get all available tile names in a category
     */
    getTilesInCategory(category: string): string[] {
        return this.tileAtlas.getTilesByCategory(category);
    }
}
