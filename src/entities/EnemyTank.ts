/**
 * Enemy Tank - AI-controlled enemy tank
 */

import { Bullet } from './Bullet.js';
import { SpriteAnimSheet } from '../animation/SpriteAnimSheet.js';
import {
    directionToAngle,
    angleToDirection,
    getOppositeDirection,
    getValidTurnDirections,
    getRandomValidDirection,
    getMovementVector,
    distance,
    getDirectionToward
} from '../utils/MovementUtils.js';
import type { Direction, EnemyType, ISpriteAnimSheet } from '../types/index.js';

interface EnemyTankOptions {
    id?: string;
    type: EnemyType;
    x: number;
    y: number;
    direction: Direction;
    animSheet?: ISpriteAnimSheet;
}

interface EnemyTankConfig {
    speed: number;
    armor: number;
    fireRate: number;
    points: number;
    width?: number;
    height?: number;
    color?: string;
}

interface GameState {
    player?: {
        active?: boolean;
        x: number;
        y: number;
    };
}

export class EnemyTank {
    id: string;
    type: EnemyType;
    x: number;
    y: number;
    direction: Direction;
    speed: number;
    armor: number;
    fireRate: number;
    points: number;
    width: number;
    height: number;
    arc: number;
    color: string;
    active: boolean;
    isPlayer: boolean;
    owner: string;
    moveTimer: number;
    fireTimer: number;
    directionChangeTimer: number;
    isMoving: boolean;
    animSheet: ISpriteAnimSheet;
    activeBullets: Bullet[];
    maxBullets: number;
    powerLevel: number;
    targetPosition: { x: number; y: number } | null;
    state: string;

    static CONFIGS: Record<EnemyType, EnemyTankConfig> = {
        basic: {
            speed: 2,
            armor: 1,
            fireRate: 0.5,
            points: 100,
            width: 30,
            height: 30,
            color: '#FFFFFF'  // White - basic enemy
        },
        fast: {
            speed: 4,
            armor: 1,
            fireRate: 0.3,
            points: 200,
            width: 26,
            height: 26,
            color: '#FFD700'  // Gold - fast enemy
        },
        power: {
            speed: 1,
            armor: 2,
            fireRate: 0.8,
            points: 300,
            width: 34,
            height: 34,
            color: '#87CEEB'  // Light blue - power enemy
        },
        armor: {
            speed: 1.5,
            armor: 4,
            fireRate: 0.6,
            points: 400,
            width: 38,
            height: 38,
            color: '#FF6B6B'  // Light red - armored enemy
        }
    };

    constructor(options: EnemyTankOptions) {
        this.id = options.id || `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.type = options.type || 'basic';
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.direction = options.direction || 'w';

        const config = EnemyTank.CONFIGS[this.type] || EnemyTank.CONFIGS.basic;

        this.speed = config.speed;
        this.armor = config.armor;
        this.fireRate = config.fireRate;
        this.points = config.points;

        this.width = config.width || 32;
        this.height = config.height || 32;
        this.arc = directionToAngle(this.direction);
        this.color = config.color || '#ff0000';

        this.active = true;
        this.isPlayer = false;
        this.owner = 'enemy';
        this.moveTimer = 0;
        this.fireTimer = Math.random() * 2;
        this.directionChangeTimer = 0;
        this.isMoving = false;

        this.animSheet = options.animSheet || new SpriteAnimSheet(0, 7, 1);

        this.activeBullets = [];
        this.maxBullets = 1;
        this.powerLevel = 0;

        this.targetPosition = null;
        this.state = 'patrol';
    }

    update(deltaTime: number, gameState: GameState): void {
        if (!this.active) return;

        this.fireTimer += deltaTime;
        this.directionChangeTimer += deltaTime;

        this.updateAI(deltaTime, gameState);
        this.updateBullets(deltaTime);
    }

    updateAI(deltaTime: number, gameState: GameState): void {
        if (this.directionChangeTimer > 1.0 || !this.isMoving) {
            this.makeDecision(gameState);
            this.directionChangeTimer = 0;
        }

        if (this.fireTimer > this.fireRate) {
            if (this.shouldFire(gameState)) {
                this.fire();
                this.fireTimer = 0;
            }
        }

        if (this.isMoving) {
            this.move(deltaTime);
        }
    }

    makeDecision(_gameState: GameState): void {
        if (Math.random() < 0.7) {
            this.changeRandomDirection();
        }

        this.isMoving = Math.random() > 0.3;
    }

    changeRandomDirection(): void {
        this.direction = getRandomValidDirection(this.direction);
        this.arc = directionToAngle(this.direction);
    }

    move(deltaTime: number): void {
        const moveAmount = this.speed * deltaTime * 60;
        const movement = getMovementVector(this.direction, moveAmount);

        this.x += movement.x;
        this.y += movement.y;

        if (this.animSheet) {
            this.animSheet.getFrames();
        }
    }

    shouldFire(gameState: GameState): boolean {
        if (!gameState.player || !gameState.player.active) return false;

        const dist = distance(this.x, this.y, gameState.player.x, gameState.player.y);

        if (dist > 400) return false;

        const aimDir = getDirectionToward(this.x, this.y, gameState.player.x, gameState.player.y);
        return this.direction === aimDir || Math.random() < 0.1;
    }

    getAimDirection(player: { x: number; y: number }): Direction {
        return getDirectionToward(this.x, this.y, player.x, player.y);
    }

    fire(): Bullet | null {
        if (this.activeBullets.length >= this.maxBullets) return null;

        const bullet = new Bullet(
            this.x,
            this.y,
            this.direction,
            'enemy',
            this.powerLevel
        );

        this.activeBullets.push(bullet);
        return bullet;
    }

    updateBullets(_deltaTime: number): void {
        for (let i = this.activeBullets.length - 1; i >= 0; i--) {
            const bullet = this.activeBullets[i];
            // bullet.update(deltaTime); // Updated in main loop

            if (bullet.active === false) {
                this.activeBullets.splice(i, 1);
                this.removeBullet(bullet);
            }
        }
    }

    removeBullet(bullet: Bullet): void {
        const index = this.activeBullets.indexOf(bullet);
        if (index !== -1) {
            this.activeBullets.splice(index, 1);
        }
    }

    takeDamage(): number {
        this.armor--;
        if (this.armor <= 0) {
            this.active = false;
            return this.points;
        }
        return 0;
    }

    getBullets(): Bullet[] {
        return this.activeBullets;
    }
}

export default EnemyTank;
