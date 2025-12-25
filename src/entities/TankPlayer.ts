/**
 * TankPlayer - Player controlled tank
 */

import { Player } from './Player.js';
import { Bullet } from './Bullet.js';
import type { Direction, ISpriteAnimSheet } from '../types/index.js';

export interface CommandObject {
    nextX: number;
    nextY: number;
    stop: boolean;
    fire?: boolean;
}

export class TankPlayer extends Player {
    direction: Direction;
    tankName: string;
    isPlayer: number | boolean;
    destCook: number;
    destX: number;
    destY: number;
    destW: number;
    destH: number;
    arc: number;
    X: number;
    Y: number;
    centerX: number;
    centerY: number;
    speedM: number;
    per: number;
    powerLevel: number;
    maxBullets: number;
    activeBullets: Bullet[];
    animSheet?: ISpriteAnimSheet & { orderIndex?: number };

    constructor(tankID: string, initDirection: Direction, isUser: number | boolean) {
        super();
        this.direction = initDirection;
        this.tankName = tankID;
        this.isPlayer = isUser;

        this.destCook = 33; // Size of a tile or step distance
        this.destX = 6;     // Initial X position in terms of tiles/grid units
        this.destY = 4;     // Initial Y position in terms of tiles/grid units
        this.destW = 33;    // Width of the tank on canvas
        this.destH = 33;    // Height of the tank on canvas
        this.arc = 0;       // Rotation angle in degrees

        // Pixel coordinates, derived from grid position
        this.X = this.destX * this.destCook;
        this.Y = this.destY * this.destCook;
        this.centerX = this.X + this.destW * 0.5;
        this.centerY = this.Y + this.destH * 0.5;

        this.speedM = 6; // Movement speed multiplier
        this.per = this.speedM / 60;

        // Weapon/shooting properties
        this.powerLevel = 0;
        this.maxBullets = 1;
        this.activeBullets = [];
    }

    updateSelfCoor(): void {
        this.X = this.destX * this.destCook;
        this.Y = this.destY * this.destCook;
        this.centerX = this.X + this.destW * 0.5;
        this.centerY = this.Y + this.destH * 0.5;
    }

    /**
     * Handles rotation and sets up movement intention in the cmd object
     */
    rotationAP(directionAttempt: Direction, cmd: CommandObject): void {
        if (directionAttempt !== this.direction) {
            this.direction = directionAttempt;
            // Set arc based on the new direction
            switch (this.direction) {
                case 'w': case 'up': this.arc = 270; break;
                case 's': case 'down': this.arc = 90; break;
                case 'a': case 'left': this.arc = 180; break;
                case 'd': case 'right': this.arc = 0; break;
            }
        }

        if (cmd.stop === false) {
            switch (this.direction) {
                case 'w': case 'up': cmd.nextY = -this.per; break;
                case 's': case 'down': cmd.nextY = this.per; break;
                case 'a': case 'left': cmd.nextX = -this.per; break;
                case 'd': case 'right': cmd.nextX = this.per; break;
            }
            if (this.animSheet && this.animSheet.orderIndex !== undefined) {
                this.animSheet.orderIndex++;
            }
        }
    }

    /**
     * Attempts to fire a bullet if max concurrent bullets not reached.
     */
    shoot(): Bullet | null {
        if (this.activeBullets.length >= this.maxBullets) {
            return null;
        }

        const owner = (this.isPlayer === 0 || this.isPlayer === true) ? 'player' : 'enemy';
        const bullet = new Bullet(
            this.centerX,
            this.centerY,
            this.direction,
            owner,
            this.powerLevel
        );

        this.activeBullets.push(bullet);
        return bullet;
    }

    /**
     * Upgrades weapon to next power level (0 -> 1 -> 2 -> 3).
     */
    upgradeWeapon(): void {
        this.powerLevel = Math.min(3, this.powerLevel + 1);
        if (this.powerLevel >= 2) {
            this.maxBullets = 2;
        }
    }

    /**
     * Resets weapon to base level.
     */
    resetWeapon(): void {
        this.powerLevel = 0;
        this.maxBullets = 1;
        this.activeBullets = [];
    }

    /**
     * Removes a bullet from active tracking.
     */
    removeBullet(bullet: Bullet): void {
        if (!bullet) return;

        const index = this.activeBullets.indexOf(bullet);
        if (index !== -1) {
            this.activeBullets.splice(index, 1);
        }
    }
}
