import { TankPlayer } from '../entities/TankPlayer.js';
import { SpriteAnimSheet } from '../animation/SpriteAnimSheet.js';

export class GameObjManager {
    constructor() {
        const objList = [];
        // Create a single player tank for now
        for (let i = 0; i < 1; i++) {
            const player = new TankPlayer(`Tank${i}`, 'w', 0); // Initial direction 'w' (up)
            player.animSheet = new SpriteAnimSheet(3, 9, 16); // Assign animation sheet
            objList.push(player);
        }
        this.gameObjects = objList; // List of all game objects (currently just one player)

        // Command object for player actions, shared with input handler (APWatcher)
        // and potentially game loop.
        this.cmd = {
            nextX: 0,    // Intended movement delta X for the current frame/update
            nextY: 0,    // Intended movement delta Y for the current frame/update
            stop: true,  // Flag to indicate if movement should stop (e.g., on key release)
            fire: false  // Flag to trigger shooting
        };
        this.isInited = 0; // TODO: What is this for? Can it be removed or clarified?

        // Bullets management
        this.bullets = []; // Track all active bullets in game
    }

    /**
     * Adds a bullet to the game.
     *
     * @param {Bullet} bullet - The bullet to add
     */
    addBullet(bullet) {
        if (bullet && bullet.active) {
            this.bullets.push(bullet);
        }
    }

    /**
     * Removes a bullet from the game.
     * Also notifies the tank owner to stop tracking it.
     *
     * @param {Bullet} bullet - The bullet to remove
     */
    removeBullet(bullet) {
        if (!bullet) return;

        const index = this.bullets.indexOf(bullet);
        if (index !== -1) {
            this.bullets.splice(index, 1);
        }

        // Also remove from owner's tracking
        const player = this.gameObjects[0];
        if (player && player.removeBullet) {
            player.removeBullet(bullet);
        }
    }

    /**
     * Updates all bullets (movement, bounds checking).
     * Removes bullets that go out of bounds.
     *
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {number} mapWidth - Map width in pixels
     * @param {number} mapHeight - Map height in pixels
     */
    updateBullets(deltaTime, mapWidth, mapHeight) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(deltaTime);

            // Remove out-of-bounds bullets
            if (bullet.isOutOfBounds(mapWidth, mapHeight)) {
                this.bullets.splice(i, 1);
                // Also remove from player's tracking
                const player = this.gameObjects[0];
                if (player && player.removeBullet) {
                    player.removeBullet(bullet);
                }
            }
        }
    }

    /**
     * Gets all active bullets.
     *
     * @returns {Array<Bullet>} Array of active bullets
     */
    getBullets() {
        return this.bullets;
    }

    // TODO: Add methods to manage game objects, e.g., add, remove, updateAll, etc.
}
