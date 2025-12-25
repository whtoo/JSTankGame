import tankbrigade from '../../resources/tankbrigade.png';
import { ImageResource } from '../utils/ImageResource.js';
import { getMapConfig } from '../game/MapConfig.js';
import { TileType } from '../game/levels/LevelConfig.js';

export class Render {
    /**
     * @param {CanvasRenderingContext2D} canvasContext - The canvas 2D context
     * @param {GameObjManager} gameManager - Reference to game object manager
     * @param {object} options - Configuration options
     * @param {LevelManager} options.levelManager - Level manager instance (optional)
     * @param {CollisionSystem} options.collisionSystem - Collision system instance
     */
    constructor(canvasContext, gameManagerInstance, options = {}) {
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

        // Bind renderFrame to this instance
        this.renderFrame = this.renderFrame.bind(this);

        // Initialize asynchronously
        this._initialize();
    }

    async _initialize() {
        try {
            const imageLoader = new ImageResource(tankbrigade);
            this.tileSheet = await imageLoader.load();
            this._offscreenCache();
        } catch (error) {
            console.error("Failed to initialize Render component:", error);
        }
    }

    /**
     * Get current map data (from level manager or default)
     * @returns {number[][]} 2D array of tile IDs
     */
    _getMapData() {
        if (this.levelManager) {
            const grid = this.levelManager.getMapGrid();
            if (grid) return grid;
        }
        // Fallback to default map
        const { mapData: defaultMapData } = require('../game/MapConfig.js');
        return defaultMapData;
    }

    /**
     * Recache the offscreen canvas when level changes
     */
    refreshMapCache() {
        if (this.tileSheet) {
            this._offscreenCache();
        }
    }

    _offscreenCache() {
        if (!this.tileSheet) {
            console.error("Tilesheet not loaded, cannot cache offscreen map.");
            return;
        }

        const mapData = this._getMapData();

        this.offscreenContext.fillStyle = "#000000";
        const mapRows = mapData.length;
        const mapCols = mapData[0].length;
        const { tileRenderSize, tileSourceSize, tilesPerRowInSheet, indexOffset } = this.mapConfig;

        // Resize canvas to fit map
        this.offscreenCanvas.width = mapCols * tileRenderSize;
        this.offscreenCanvas.height = mapRows * tileRenderSize;

        this.offscreenContext.fillRect(0, 0, mapCols * tileRenderSize, mapRows * tileRenderSize);

        for (let rowCtr = 0; rowCtr < mapRows; rowCtr++) {
            for (let colCtr = 0; colCtr < mapCols; colCtr++) {
                // The map data uses 1-based tile IDs from TMX (firstgid=1), so we don't need indexOffset
                // TMX tile IDs are already 1-indexed and correctly point to spritesheet positions
                const tileId = mapData[rowCtr][colCtr];
                // For TMX compatibility, tile IDs are 1-indexed, convert to 0-indexed for calculation
                const adjustedTileId = tileId - 1;
                // Use tileSourceSize (32) for source coordinates
                const sourceX = (adjustedTileId % tilesPerRowInSheet) * tileSourceSize;
                const sourceY = Math.floor(adjustedTileId / tilesPerRowInSheet) * tileSourceSize;

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
     * @param {number} alpha - Interpolation alpha (0-1), defaults to 1
     */
    renderFrame(alpha = 1) {
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
    drawBase() {
        if (!this.levelManager) return;

        const basePos = this.levelManager.getBasePosition();
        if (!basePos) return;

        const tileRenderSize = this.mapConfig.tileRenderSize;
        const tileSourceSize = this.mapConfig.tileSourceSize;
        const x = basePos.x * tileRenderSize;
        const y = basePos.y * tileRenderSize;

        // Draw eagle/briefcase sprite
        // Eagle is at TMX tile ID 102 (1-indexed), convert to 0-indexed for calculation
        const adjustedTileId = 102 - 1;
        // Use tileSourceSize (32) for source coordinates
        const sourceX = (adjustedTileId % this.mapConfig.tilesPerRowInSheet) * tileSourceSize;
        const sourceY = Math.floor(adjustedTileId / this.mapConfig.tilesPerRowInSheet) * tileSourceSize;

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
    _drawBaseProtection(centerX, centerY) {
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
    drawGrass() {
        const mapData = this._getMapData();
        const { tileRenderSize, tileSourceSize, tilesPerRowInSheet } = this.mapConfig;

        for (let rowCtr = 0; rowCtr < mapData.length; rowCtr++) {
            for (let colCtr = 0; colCtr < mapData[rowCtr].length; colCtr++) {
                const tileId = mapData[rowCtr][colCtr];
                if (tileId === TileType.GRASS) {
                    // TMX tile IDs are 1-indexed, convert to 0-indexed for calculation
                    const adjustedTileId = tileId - 1;
                    // Use tileSourceSize (32) for source coordinates
                    const sourceX = (adjustedTileId % tilesPerRowInSheet) * tileSourceSize;
                    const sourceY = Math.floor(adjustedTileId / tilesPerRowInSheet) * tileSourceSize;

                    this.context.drawImage(
                        this.tileSheet,
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
    drawMap() {
        this.context.drawImage(this.offscreenCanvas, 0, 0,
            this.offscreenCanvas.width, this.offscreenCanvas.height);
    }

    drawPlayer() {
        const players = this.gameManager.gameObjects;
        if (!players || players.length === 0) return;

        const item = players[0];
        if (!item.active) return;

        this._drawTank(item);
    }

    /**
     * Draw enemy tanks
     */
    drawEnemies() {
        if (!this.gameManager.enemies) return;

        const enemies = this.gameManager.enemies;
        for (const enemy of enemies) {
            if (enemy.active) {
                this._drawTank(enemy);
            }
        }
    }

    /**
     * Draw a tank (player or enemy)
     * @param {object} tank - Tank object with position properties and arc
     */
    _drawTank(tank) {
        const angleInRadians = tank.arc / 180 * Math.PI;

        // Handle different tank types: TankPlayer uses centerX/centerY/destW/destH,
        // EnemyTank uses x/y/width/height
        const posX = tank.centerX || tank.x;
        const posY = tank.centerY || tank.y;
        const tankW = tank.destW || tank.width;
        const tankH = tank.destH || tank.height;

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
            this.tileSheet,
            animFrame.sourceDx, animFrame.sourceDy,
            animFrame.sourceW, animFrame.sourceH,
            -tankW / 2, -tankH / 2,
            tankW, tankH
        );
        this.context.restore();
    }

    drawBullets() {
        if (!this.gameManager.getBullets) return;

        const bullets = this.gameManager.getBullets();
        if (bullets && bullets.length > 0) {
            for (const bullet of bullets) {
                this._drawBullet(bullet);
            }
        }

        // Draw enemy bullets
        if (this.gameManager.enemies) {
            for (const enemy of this.gameManager.enemies) {
                if (enemy.active && enemy.getBullets) {
                    const enemyBullets = enemy.getBullets();
                    if (enemyBullets) {
                        for (const bullet of enemyBullets) {
                            this._drawBullet(bullet);
                        }
                    }
                }
            }
        }
    }

    /**
     * Draw a single bullet
     */
    _drawBullet(bullet) {
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

    _drawFps() {
        const now = performance.now();
        const delta = now - this.lastTime;
        const fps = delta > 0 ? 1000 / delta : 60;
        this.lastTime = now;

        this.context.fillStyle = '#FFFFFF';
        this.context.fillText(`${Math.round(fps)} fps`, 20, 60);
    }

    _drawLevelInfo() {
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
}
