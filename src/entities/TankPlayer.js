import { Player } from './Player.js';
import { Bullet } from './Bullet.js';
// SpriteAnimSheet will be assigned externally after instantiation, so not imported here directly for construction.
// import { SpriteAnimSheet } from '../animation/SpriteAnimSheet.js';

export class TankPlayer extends Player {
    constructor(tankID, initDirection, isUser) {
        super();
        this.direction = initDirection; // 'w', 's', 'a', 'd'
        this.tankName = tankID;
        this.isPlayer = isUser; // 0 for player, could be boolean true/false. TODO: Standardize to boolean.

        this.destCook = 33; // Size of a tile or step distance
        this.destX = 6;     // Initial X position in terms of tiles/grid units
        this.destY = 4;     // Initial Y position in terms of tiles/grid units
        this.destW = 33;    // Width of the tank on canvas
        this.destH = 33;    // Height of the tank on canvas
        this.arc = 0;       // Rotation angle in degrees (0: right, 90: down, 180: left, 270: up)

        // Pixel coordinates, derived from grid position
        this.X = this.destX * this.destCook;
        this.Y = this.destY * this.destCook;
        this.centerX = this.X + this.destW * 0.5;
        this.centerY = this.Y + this.destH * 0.5;

        this.speedM = 6; // Movement speed multiplier
        // Movement per frame (delta for destX/destY), assuming 60 FPS for now.
        // This 'per' is effectively a fraction of a tile to move per input update.
        this.per = this.speedM / 60;

        // Weapon/shooting properties
        this.powerLevel = 0;        // Current weapon power level (0-3)
        this.maxBullets = 1;        // Max concurrent bullets based on powerLevel
        this.activeBullets = [];    // Track bullets fired by this tank
    }

    updateSelfCoor() {
        this.X = this.destX * this.destCook;
        this.Y = this.destY * this.destCook;
        this.centerX = this.X + this.destW * 0.5;
        this.centerY = this.Y + this.destH * 0.5;
    }

    // Handles rotation and sets up movement intention in the cmd object
    rotationAP(directionAttempt, cmd) { // directionAttempt is the attempted direction from input
        if (directionAttempt !== this.direction) {
            this.direction = directionAttempt;
            // Set arc based on the new direction
            switch (this.direction) {
                case 'w': this.arc = 270; break; // Up
                case 's': this.arc = 90;  break; // Down
                case 'a': this.arc = 180; break; // Left
                case 'd': this.arc = 0;   break; // Right
                default: break; // Should not happen with w,a,s,d keys
            }
        }

        // If movement is active (cmd.stop is false), set cmd.nextX/Y based on the current (possibly new) direction.
        // APWatcher.keyWatchDown is responsible for resetting cmd.nextX/Y to 0 *before* calling this method.
        if (cmd.stop === false) {
            // Ensure cmd.nextX/Y are explicitly set for the current direction for this tick
            // Redundant if APWatcher always resets, but good for clarity if rotationAP could be called from elsewhere.
            // For this specific integration, APWatcher does reset them.
            // cmd.nextX = 0;
            // cmd.nextY = 0;

            switch (this.direction) {
                case 'w': cmd.nextY = -this.per; break;
                case 's': cmd.nextY = this.per;  break;
                case 'a': cmd.nextX = -this.per; break;
                case 'd': cmd.nextX = this.per;  break;
                default:
                    // This case should ideally not be reached if input is only w,a,s,d
                    // If it is, ensure no accidental movement from previous cmd values.
                    // However, APWatcher resets cmd.nextX/Y before calling rotationAP,
                    // so this explicit reset here might be redundant for the current call path.
                    // cmd.nextX = 0;
                    // cmd.nextY = 0;
                    break;
            }
            if (this.animSheet) {
                this.animSheet.orderIndex++; // Advance animation frame
            }
        }
        // If cmd.stop is true, APWatcher's keyUp handler should have already reset cmd.nextX/Y to 0.
        // So, no explicit else needed here to zero them out if already handled by caller.
    }

    /**
     * Attempts to fire a bullet if max concurrent bullets not reached.
     *
     * @returns {Bullet|null} The fired bullet or null if cannot fire
     */
    shoot() {
        // Check if can fire (respect max bullets)
        if (this.activeBullets.length >= this.maxBullets) {
            return null;
        }

        // Create bullet at tank center, facing current direction
        // Note: isPlayer is 0 for player (not boolean), so we check truthiness differently
        const owner = (this.isPlayer === 0 || this.isPlayer === true) ? 'player' : 'enemy';
        const bullet = new Bullet(
            this.centerX,
            this.centerY,
            this.direction,
            owner,
            this.powerLevel
        );

        // Track this bullet
        this.activeBullets.push(bullet);

        return bullet;
    }

    /**
     * Upgrades weapon to next power level (0 -> 1 -> 2 -> 3).
     * At power level 2+, max concurrent bullets increases to 2.
     */
    upgradeWeapon() {
        this.powerLevel = Math.min(3, this.powerLevel + 1);
        if (this.powerLevel >= 2) {
            this.maxBullets = 2;
        }
    }

    /**
     * Resets weapon to base level.
     * Clears active bullets tracking.
     */
    resetWeapon() {
        this.powerLevel = 0;
        this.maxBullets = 1;
        this.activeBullets = [];
    }

    /**
     * Removes a bullet from active tracking.
     * Called when bullet is destroyed or goes out of bounds.
     *
     * @param {Bullet} bullet - The bullet to remove
     */
    removeBullet(bullet) {
        if (!bullet) return;

        const index = this.activeBullets.indexOf(bullet);
        if (index !== -1) {
            this.activeBullets.splice(index, 1);
        }
    }
}
