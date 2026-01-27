/**
 * TankPlayer - Player controlled tank
 */

import { Player } from './Player.js';
import { Bullet } from './Bullet.js';
import { directionToAngle, getMovementVector } from '../utils/MovementUtils.js';
import type { Direction, ISpriteAnimSheet } from '../types/index.js';

// Union type to support both legacy and new animation systems
export type TankAnimSheet = ISpriteAnimSheet & {
    setDirection?(dir: Direction): void;
};

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
    active: boolean;
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
    animSheet?: TankAnimSheet;

    constructor(tankID: string, initDirection: Direction, isUser: number | boolean) {
        super();
        this.direction = initDirection;
        this.tankName = tankID;
        this.isPlayer = isUser;
        this.active = true;  // 确保坦克是激活状态

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
            this.arc = directionToAngle(directionAttempt);

            // Update direction for DirectionalAnimSheet
            if (this.animSheet && this.animSheet.setDirection) {
                this.animSheet.setDirection(this.direction);
            }
        }

        if (cmd.stop === false) {
            const movement = getMovementVector(this.direction, this.per);
            cmd.nextX = movement.x;
            cmd.nextY = movement.y;
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

    /**
     * Constrain player position within map bounds.
     * Ensures the tank stays fully inside the viewport.
     * @param mapWidth Map width in pixels
     * @param mapHeight Map height in pixels
     */
    constrainToBounds(mapWidth: number, mapHeight: number): void {
        const halfW = this.destW / 2;
        const halfH = this.destH / 2;

        // Constrain center position (using centerX/centerY)
        this.centerX = Math.max(halfW, Math.min(this.centerX, mapWidth - halfW));
        this.centerY = Math.max(halfH, Math.min(this.centerY, mapHeight - halfH));

        // Recalculate X/Y from center
        this.X = this.centerX - this.destW / 2;
        this.Y = this.centerY - this.destH / 2;

        // Recalculate tile position
        this.destX = Math.floor(this.X / this.destCook);
        this.destY = Math.floor(this.Y / this.destCook);
    }
}
