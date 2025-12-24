import tankbrigade from '../../resources/tankbrigade.png'; // Adjusted path
import { ImageResource } from '../utils/ImageResource.js'; // Corrected import name

export class Render {
    // Constructor is now async to handle image loading
    constructor(canvasContext, gameManagerInstance) {
        this.context = canvasContext;
        this.gameManager = gameManagerInstance;
        this.tileSheet = null;
        this.lastTime = new Date().getTime(); // Ensure it's a number for calculations

        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = 800;
        this.offscreenCanvas.height = 500;
        this.offscreenContext = this.offscreenCanvas.getContext('2d');

        this.mapTitle = [
            [78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 55, 78, 78, 78, 78],
            [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
            [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
            [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
            [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 100, 100, 100, 100, 55, 102, 102, 102, 102],
            [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 100, 100, 100, 100, 55, 102, 102, 102, 102],
            [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
            [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
            [102, 102, 100, 100, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
            [102, 102, 100, 100, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
            [102, 102, 100, 100, 102, 102, 102, 102, 60, 60, 60, 60, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
            [102, 102, 102, 102, 102, 102, 102, 102, 60, 74, 74, 60, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102],
            [102, 102, 102, 102, 102, 102, 102, 102, 60, 74, 74, 60, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102]
        ];

        // Bind drawScreen to this instance for requestAnimationFrame
        this.drawScreen = this.drawScreen.bind(this);

        // Initialize asynchronously
        this._initialize();
    }

    async _initialize() {
        try {
            const imageLoader = new ImageResource(tankbrigade);
            this.tileSheet = await imageLoader.load();
            this._offscreenCache(); // Cache the map background
            this.initGameLoop();   // Start the game loop
        } catch (error) {
            console.error("Failed to initialize Render component:", error);
            // Handle error appropriately, e.g., display a message to the user
        }
    }

    _requestAnimFrame() { // Note: callback parameter was unused and removed in previous step
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            ((cb) => {
                window.setTimeout(cb, 1000 / 60); // Fallback to 60 FPS
            });
    }

    _calculateFps() {
        const now = new Date().getTime();
        const fps = 1000 / (now - this.lastTime);
        this.lastTime = now;
        return fps;
    }

    _offscreenCache() {
        if (!this.tileSheet) {
            console.error("Tilesheet not loaded, cannot cache offscreen map.");
            return;
        }
        this.offscreenContext.fillStyle = "#aaaaaa"; // Background color for map area
        const mapRows = this.mapTitle.length;
        const mapCols = this.mapTitle[0].length; // Assuming all rows have same length
        const tileRenderSize = 33; // Visual size of the tile on canvas
        const tileSourceSize = 32; // Actual size of the tile in the spritesheet

        // Adjust fillRect to cover the exact map dimensions
        this.offscreenContext.fillRect(0, 0, mapCols * tileRenderSize, mapRows * tileRenderSize);

        const mapIndexOffset = -1; // Original code had this offset, seems TMX related.

        for (let rowCtr = 0; rowCtr < mapRows; rowCtr++) {
            for (let colCtr = 0; colCtr < mapCols; colCtr++) {
                const tileId = this.mapTitle[rowCtr][colCtr] + mapIndexOffset;
                // Assuming mapCols in original calculation was based on distinct tiles in a row of the tilesheet, not map display cols.
                // This needs to be verified against the actual tilesheet layout.
                // For now, let's assume a fixed number of tiles per row in the sheet, e.g. 24 as used before.
                const tilesPerRowInSheet = 24; // This might need to be a class const or configurable
                const sourceX = (tileId % tilesPerRowInSheet) * tileRenderSize;
                const sourceY = Math.floor(tileId / tilesPerRowInSheet) * tileRenderSize;

                this.offscreenContext.drawImage(
                    this.tileSheet,
                    sourceX, sourceY,
                    tileSourceSize, tileSourceSize, // Use actual tile size from sheet
                    colCtr * tileRenderSize, rowCtr * tileRenderSize,
                    tileRenderSize, tileRenderSize // Render at target size
                );
            }
        }
    }

    // Renamed from init to avoid confusion with game initialization.
    // This starts the continuous rendering loop.
    initGameLoop() {
        this._requestAnimFrame()(this.drawScreen);
    }

    // Game logic update step - TODO: This should be expanded and potentially moved
    // to GameManager or a dedicated game loop manager.
    updateGame(deltaTime) {
        if (!this.gameManager || !this.gameManager.gameObjects || this.gameManager.gameObjects.length === 0) {
            return;
        }
        const player = this.gameManager.gameObjects[0];
        const cmd = this.gameManager.cmd;

        // Movement update
        if (cmd.stop === false) {
            // Apply movement based on cmd.nextX/Y which are set by TankPlayer.rotationAP
            // These represent fractions of a tile.
            if (cmd.nextY !== 0) {
                player.destY += cmd.nextY;
            }
            if (cmd.nextX !== 0) {
                player.destX += cmd.nextX;
            }

            // Boundary checks (example, these should be more robust or map-data driven)
            // Assuming map grid is 0-12 for Y and 0-23 for X based on old APWatcher checks
            player.destY = Math.max(0, Math.min(player.destY, 13));
            player.destX = Math.max(0, Math.min(player.destX, 23));

            player.updateSelfCoor(); // Update pixel X, Y based on new destX, destY
        }

        // Firing logic
        if (cmd.fire && player && player.shoot) {
            const bullet = player.shoot();
            if (bullet && this.gameManager.addBullet) {
                this.gameManager.addBullet(bullet);
            }
            cmd.fire = false; // Reset fire trigger after processing
        }

        // Bullet updates
        if (this.gameManager.updateBullets) {
            // Map dimensions: 23 cols * 33px, 13 rows * 33px
            const mapWidth = 23 * 33;  // 759px
            const mapHeight = 13 * 33; // 429px
            this.gameManager.updateBullets(deltaTime, mapWidth, mapHeight);
        }
    }


    drawScreen() {
        if (!this.tileSheet || !this.context || !this.gameManager) {
            // console.error("Render components not ready for drawScreen.");
            this._requestAnimFrame()(this.drawScreen);
            return;
        }

        const now = new Date().getTime();
        const deltaTime = (now - this.lastTime) / 1000.0; // Delta time in seconds

        this.updateGame(deltaTime); // Update game logic

        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

        this.drawMap();
        this.drawPlayer();
        this.drawBullets();

        this.context.fillStyle = 'cornflowerblue';
        this.context.fillText(`${this._calculateFps().toFixed()} fps`, 20, 60);

        this.lastTime = now; // Update lastTime for the next frame's deltaTime calculation
        this._requestAnimFrame()(this.drawScreen);
    }

    drawPlayer() {
        const players = this.gameManager.gameObjects;
        if (!players || players.length === 0) return;

        const item = players[0]; // Assuming only one player

        // Animation and drawing logic
        const angleInRadians = item.arc / 180 * Math.PI;
        if (!item.animSheet) {
            console.warn("Player item has no animSheet", item);
            return;
        }
        const animFrame = item.animSheet.getFrames();
        if (!animFrame) {
            console.warn("Animation sheet did not return a frame.", item.animSheet);
            return;
        }

        this.context.save();
        this.context.translate(item.centerX, item.centerY);
        this.context.rotate(angleInRadians);
        this.context.drawImage(
            this.tileSheet,
            animFrame.sourceDx, animFrame.sourceDy,
            animFrame.sourceW, animFrame.sourceH,
            -item.destW / 2, -item.destH / 2, // Draw centered
            item.destW, item.destH
        );
        this.context.restore();
    }

    drawMap() {
        this.context.drawImage(this.offscreenCanvas, 0, 0,
            this.offscreenCanvas.width, this.offscreenCanvas.height);
    }

    /**
     * Draws all active bullets on the canvas.
     * Bullets are drawn as colored rectangles (yellow for player, red for enemy).
     * TODO: Replace with sprite rendering when bullet sprites are available.
     */
    drawBullets() {
        if (!this.gameManager.getBullets) return;

        const bullets = this.gameManager.getBullets();
        if (!bullets || bullets.length === 0) return;

        for (const bullet of bullets) {
            this.context.save();

            // Draw bullet as colored rectangle (yellow for player, red for enemy)
            // TODO: Replace with sprite rendering once bullet sprites are available
            this.context.fillStyle = bullet.owner === 'player' ? '#ffff00' : '#ff0000';
            this.context.fillRect(
                bullet.x - bullet.width / 2,
                bullet.y - bullet.height / 2,
                bullet.width,
                bullet.height
            );

            this.context.restore();
        }
    }
}
