import tankbrigade from '/tankbrigade.png?url';
import { ImageResource } from '../utils/ImageResource.js';
import type { GameObjManager as GameObjManagerType } from '../managers/GameObjManager.js';
import type { LevelManager } from '../game/levels/LevelManager.js';
import type { CollisionSystem } from '../systems/CollisionSystem.js';
import type { SpriteAnimSheet } from '../animation/SpriteAnimSheet.js';
import { getTileAtlas, type TileAtlas } from './TileAtlas.js';
import type { TileMapLoader } from '../game/TileMapLoader.js';

interface RenderOptions {
    levelManager?: LevelManager | null;
    collisionSystem?: CollisionSystem | null;
    tileMapLoader?: TileMapLoader | null;
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
    animSheet?: SpriteAnimSheet | null;
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

export class Render {
    context: CanvasRenderingContext2D;
    gameManager: GameObjManagerType;
    levelManager: LevelManager | null;
    collisionSystem: CollisionSystem | null;
    tileMapLoader: TileMapLoader | null;
    tileSheet: HTMLImageElement | null;
    lastTime: number;
    offscreenCanvas: HTMLCanvasElement;
    offscreenContext: CanvasRenderingContext2D | null;
    viewport: Viewport;

    constructor(canvasContext: CanvasRenderingContext2D, gameManagerInstance: GameObjManagerType, options: RenderOptions = {}) {
        this.context = canvasContext;
        this.gameManager = gameManagerInstance;
        this.levelManager = options.levelManager || null;
        this.collisionSystem = options.collisionSystem || null;
        this.tileMapLoader = options.tileMapLoader || null;
        this.lastTime = 0;

        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = 800;
        this.offscreenCanvas.height = 500;
        this.offscreenContext = this.offscreenCanvas.getContext('2d');

        this.tileSheet = null as HTMLImageElement;

        this.viewport = {
            x: 0,
            y: 0,
            width: canvasContext.canvas.width || 800,
            height: canvasContext.canvas.height || 600,
            enabled: false
        };

        this.renderFrame = this.renderFrame.bind(this);
        this._initialize();
    }

    enableViewportCulling(enabled: boolean): void {
        this.viewport.enabled = enabled;
    }

    setViewport(x: number, y: number): void {
        this.viewport.x = x;
        this.viewport.y = y;
    }

    updateViewportSize(): void {
        this.viewport.width = this.context.canvas.width;
        this.viewport.height = this.context.canvas.height;
    }

    private _isInViewport(x: number, y: number, width: number, height: number): boolean {
        if (!this.viewport.enabled) return true;

        const padding = 50;
        return (
            x + width > this.viewport.x - padding &&
            x < this.viewport.x + this.viewport.width + padding &&
            y + height > this.viewport.y - padding &&
            y < this.viewport.y + this.viewport.height + padding
        );
    }

    async _initialize(): Promise<void> {
        try {
            const imageLoader = new ImageResource(tankbrigade);
            this.tileSheet = await imageLoader.load();

            const tileAtlas = getTileAtlas();
            await tileAtlas.init();

            this._cacheMap();
        } catch (error) {
            console.error("Failed to initialize Render component:", error);
        }
    }

    refreshMapCache(): void {
        if (this.tileSheet) {
            this._cacheMap();
        }
    }

    private _getTileMapData(): { gridData: number[][], columns: number, rows: number } | null {
        if (this.tileMapLoader) {
            const loadedMap = this.tileMapLoader.getCachedMap('level2.json');
            console.log('Loaded map from TileMapLoader:', loadedMap ? 'found' : 'not found');
            if (loadedMap) {
                // Convert 1D array to 2D array for rendering
                const { gridData: flatGridData, columns: cols, rows } = loadedMap;
                const gridData: number[][] = [];
                
                for (let y = 0; y < rows; y++) {
                    const rowStart = y * cols;
                    gridData.push(flatGridData.slice(rowStart, rowStart + cols));
                }
                
                return { gridData, columns: cols, rows };
            }
        }

        return null;
    }

    private _cacheMap(): void {
        if (!this.tileSheet || !this.offscreenContext) {
            console.error("TileSheet not loaded, cannot cache map.");
            return;
        }

        const tileMapData = this._getTileMapData();
        if (!tileMapData) {
            console.error("No tile map data available");
            return;
        }

        const { gridData, columns: mapCols, rows: mapRows } = tileMapData;
        const tileRenderSize = 33;

        if (mapCols === 0 || mapRows === 0) return;

        this.offscreenCanvas.width = mapCols * tileRenderSize;
        this.offscreenCanvas.height = mapRows * tileRenderSize;

        this.offscreenContext.fillStyle = "#000000";
        this.offscreenContext.fillRect(0, 0, mapCols * tileRenderSize, mapRows * tileRenderSize);

        for (let rowCtr = 0; rowCtr < mapRows; rowCtr++) {
            for (let colCtr = 0; colCtr < mapCols; colCtr++) {
                const gid = gridData[rowCtr][colCtr];

                if (gid === 0) continue;

                // Calculate source coordinates from tileset
                const sourceX = ((gid - 1) % 24) * 32;
                const sourceY = Math.floor((gid - 1) / 24) * 32;

                this.offscreenContext.drawImage(
                    this.tileSheet,
                    sourceX,
                    sourceY,
                    32,
                    32,
                    colCtr * tileRenderSize,
                    rowCtr * tileRenderSize,
                    tileRenderSize,
                    tileRenderSize
                );
            }
        }
    }

    drawMap(): void {
        this.context.drawImage(this.offscreenCanvas, 0, 0,
            this.offscreenCanvas.width, this.offscreenCanvas.height);
    }

    drawBase(): void {
        if (!this.tileSheet) return;

        const tileAtlas = getTileAtlas();
        if (!tileAtlas.isReady()) {
            console.warn("TileAtlas not initialized");
            return;
        }

        const tileMapData = this._getTileMapData();
        if (!tileMapData) {
            return;
        }

        // Find the base tile (GID 54 from tileset.json)
        const { gridData } = tileMapData;
        let baseX = -1;
        let baseY = -1;

        for (let y = 0; y < gridData.length; y++) {
            for (let x = 0; x < gridData[y].length; x++) {
                if (gridData[y][x] === 54) {
                    baseX = x;
                    baseY = y;
                    break;
                }
            }
            if (baseX >= 0) break;
        }

        if (baseX < 0) {
            return;
        }

        const tileRenderSize = 33;
        const destX = baseX * tileRenderSize;
        const destY = baseY * tileRenderSize;

        // Draw base tile using TileAtlas
        tileAtlas.drawTile(
            this.context,
            this.tileSheet,
            'eagle_icon',
            destX,
            destY,
            tileRenderSize,
            tileRenderSize
        );

        this._drawBaseProtection(destX, destY);
    }

    private _drawBaseProtection(centerX: number, centerY: number): void {
        const tileSize = 33;

        this.context.fillStyle = '#8B4513';

        for (let i = -1; i <= 1; i++) {
            this.context.fillRect(centerX - tileSize + 4, centerY - tileSize + 4, tileSize - 8, 4);
            this.context.fillRect(centerX - tileSize + 4, centerY + tileSize, tileSize - 8, 4);
            this.context.fillRect(centerX + tileSize + 4, centerY - tileSize + 4, 4, tileSize - 8);
            this.context.fillRect(centerX - tileSize + 4, centerY + tileSize, 4, tileSize - 8);
        }

        this.context.fillRect(centerX - tileSize + 4, centerY - tileSize + 4, tileSize - 8, 4);
        this.context.fillRect(centerX + tileSize + 4, centerY + tileSize, tileSize - 8, 4);
    }

    drawGrass(): void {
        if (!this.tileSheet) return;

        const tileAtlas = getTileAtlas();
        if (!tileAtlas.isReady()) {
            console.warn("TileAtlas not initialized");
            return;
        }

        const tileMapData = this._getTileMapData();
        if (!tileMapData) {
            return;
        }

        const { gridData } = tileMapData;
        const tileRenderSize = 33;

        // Find and draw grass tiles (GID 99 from tileset.json)
        for (let y = 0; y < gridData.length; y++) {
            for (let x = 0; x < gridData[y].length; x++) {
                if (gridData[y][x] === 99) {
                    const destX = x * tileRenderSize;
                    const destY = y * tileRenderSize;

                    tileAtlas.drawTile(
                        this.context,
                        this.tileSheet,
                        'grass_land',
                        destX,
                        destY,
                        tileRenderSize,
                        tileRenderSize
                    );
                }
            }
        }
    }

    drawPlayer(): void {
        const players = this.gameManager.gameObjects;
        if (!players || players.length === 0) return;

        const item = players[0];
        if (!item.active) return;

        this._drawTank(item);
    }

    drawEnemies(): void {
        if (!this.gameManager.enemies) return;

        const enemies = this.gameManager.enemies;
        for (const enemy of enemies) {
            if (enemy.active && this._isInViewport(enemy.x, enemy.y, enemy.width, enemy.height)) {
                this._drawTank(enemy);
            }
        }
    }

    private _drawTank(tank: TankLike): void {
        const angleInRadians = tank.arc / 180 * Math.PI;

        const posX = tank.centerX ?? tank.x;
        const posY = tank.centerY ?? tank.y;
        const tankW = tank.destW ?? tank.width;
        const tankH = tank.destH ?? tank.height;

        if (!tank.animSheet) {
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

    private _drawBullet(bullet: BulletLike): void {
        this.context.save();
        this.context.fillStyle = '#FFFFFF';
        this.context.fillRect(
            bullet.x - bullet.width / 2,
            bullet.y - bullet.height / 2,
            bullet.width,
            bullet.height
        );
        this.context.restore();
    }

    private _drawFps(): void {
        const now = performance.now();
        const delta = now - this.lastTime;
        const fps = delta > 0 ? 1000 / delta : 60;
        this.lastTime = now;

        this.context.fillStyle = '#FFFFFF';
        this.context.fillText(`${Math.round(fps)} fps`, 20, 60);
    }

    private _drawLevelInfo(): void {
        if (!this.levelManager) return;

        this.context.fillStyle = '#FFFFFF';
        this.context.font = 'bold 16px monospace';

        this.context.fillText('1P', 20, 24);

        const enemyConfig = this.levelManager.getEnemyConfig();
        if (enemyConfig && this.gameManager.enemies) {
            const remaining = enemyConfig.total - this.gameManager.enemies.filter(e => e.active).length;
            this.context.font = '14px monospace';
            this.context.fillText(`×${remaining}`, 60, 24);
        }

        const level = this.levelManager.getCurrentLevelNumber();
        this.context.font = 'bold 14px monospace';
        this.context.textAlign = 'right';
        this.context.fillText(`STAGE ${level}`, 780, 24);
        this.context.textAlign = 'left';
    }

    renderFrame(alpha = 1): void {
        if (!this.tileSheet || !this.context || !this.gameManager) {
            return;
        }

        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

        this.drawMap();
        this.drawBase();
        this.drawGrass();
        this.drawPlayer();
        this.drawEnemies();
        this.drawBullets();

        this._drawFps();
        this._drawLevelInfo();
    }
}
