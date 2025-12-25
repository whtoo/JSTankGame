/**
 * Enemy Tank - AI-controlled enemy tank
 */
import { Bullet } from '../entities/Bullet.js';
import { SpriteAnimSheet } from '../animation/SpriteAnimSheet.js';

export class EnemyTank {
    /**
     * @param {object} options - Configuration options
     * @param {string} options.type - Enemy type: basic, fast, power, armor
     * @param {number} options.x - Spawn X (pixels)
     * @param {number} options.y - Spawn Y (pixels)
     * @param {string} options.direction - Initial direction
     */
    constructor(options) {
        this.id = options.id || `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.type = options.type || 'basic';
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.direction = options.direction || 'w';

        // Tank properties based on type
        const config = EnemyTank.CONFIGS[this.type] || EnemyTank.CONFIGS.basic;

        this.speed = config.speed;
        this.armor = config.armor; // Hits to destroy
        this.fireRate = config.fireRate;
        this.points = config.points;

        // Visual properties
        this.width = config.width || 32;
        this.height = config.height || 32;
        this.arc = this.directionToArc(this.direction);
        this.color = config.color || '#ff0000';

        // State
        this.active = true;
        this.isPlayer = false;
        this.owner = 'enemy';
        this.moveTimer = 0;
        this.fireTimer = Math.random() * 2; // Random start delay
        this.directionChangeTimer = 0;
        this.isMoving = false;

        // Animation
        // Enemy tank sprites: row 1, columns 0-7 (same layout as player but different row)
        if (options.animSheet) {
            this.animSheet = options.animSheet;
        } else {
            this.animSheet = new SpriteAnimSheet(0, 7, 1);
        }

        // Bullets
        this.activeBullets = [];
        this.maxBullets = 1;
        this.powerLevel = 0;

        // AI state
        this.targetPosition = null;
        this.state = 'patrol'; // patrol, chase, retreat
    }

    /**
     * Enemy type configurations
     * Colors follow NES Battle City style
     */
    static CONFIGS = {
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

    /**
     * Convert direction to angle
     */
    directionToArc(dir) {
        const angles = { 'w': 0, 's': 180, 'a': 270, 'd': 90 };
        return angles[dir] || 0;
    }

    /**
     * Convert angle to direction
     */
    arcToDirection(arc) {
        // Normalize arc to 0-360
        const normalized = ((arc % 360) + 360) % 360;

        if (normalized >= 315 || normalized < 45) return 'w';
        if (normalized >= 45 && normalized < 135) return 'd';
        if (normalized >= 135 && normalized < 225) return 's';
        return 'a';
    }

    /**
     * Update enemy AI and state
     * @param {number} deltaTime - Time since last frame
     * @param {object} gameState - Game state including player position
     */
    update(deltaTime, gameState) {
        if (!this.active) return;

        // Update timers
        this.fireTimer += deltaTime;
        this.directionChangeTimer += deltaTime;

        // AI decision making
        this.updateAI(deltaTime, gameState);

        // Update bullets
        this.updateBullets(deltaTime);
    }

    /**
     * AI decision making
     */
    updateAI(deltaTime, gameState) {
        // Decide whether to move or change direction
        if (this.directionChangeTimer > 1.0 || !this.isMoving) {
            this.makeDecision(gameState);
            this.directionChangeTimer = 0;
        }

        // Fire if ready and has line of sight
        if (this.fireTimer > this.fireRate) {
            if (this.shouldFire(gameState)) {
                this.fire();
                this.fireTimer = 0;
            }
        }

        // Update position if moving
        if (this.isMoving) {
            this.move(deltaTime);
        }
    }

    /**
     * Make movement decision
     */
    makeDecision(gameState) {
        // Random direction change (70% chance)
        if (Math.random() < 0.7) {
            this.changeRandomDirection();
        }

        // 30% chance to stop
        this.isMoving = Math.random() > 0.3;
    }

    /**
     * Change to a random valid direction
     */
    changeRandomDirection() {
        const directions = ['w', 's', 'a', 'd'];
        const currentDir = this.direction;

        // Filter out opposite direction
        const opposites = { 'w': 's', 's': 'w', 'a': 'd', 'd': 'a' };
        const validDirs = directions.filter(d => d !== opposites[currentDir]);

        this.direction = validDirs[Math.floor(Math.random() * validDirs.length)];
        this.arc = this.directionToArc(this.direction);
    }

    /**
     * Move in current direction
     */
    move(deltaTime) {
        const moveAmount = this.speed * deltaTime * 60; // Normalize to 60fps

        switch (this.direction) {
            case 'w': this.y -= moveAmount; break;
            case 's': this.y += moveAmount; break;
            case 'a': this.x -= moveAmount; break;
            case 'd': this.x += moveAmount; break;
        }

        // Update animation
        if (this.animSheet) {
            this.animSheet.getFrames();
        }
    }

    /**
     * Check if should fire at player
     */
    shouldFire(gameState) {
        if (!gameState.player || !gameState.player.active) return false;

        // Check distance
        const dx = gameState.player.x - this.x;
        const dy = gameState.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only fire if relatively close
        if (distance > 400) return false;

        // Check if facing player
        const aimDir = this.getAimDirection(gameState.player);
        return this.direction === aimDir || Math.random() < 0.1; // 10% random fire
    }

    /**
     * Get direction to player
     */
    getAimDirection(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;

        if (Math.abs(dy) > Math.abs(dx)) {
            return dy < 0 ? 'w' : 's';
        } else {
            return dx < 0 ? 'a' : 'd';
        }
    }

    /**
     * Fire a bullet
     */
    fire() {
        if (this.activeBullets.length >= this.maxBullets) return null;

        const bullet = new Bullet({
            x: this.x,
            y: this.y,
            direction: this.direction,
            speed: 5,
            owner: 'enemy',
            powerLevel: this.powerLevel,
            isPlayer: false
        });

        this.activeBullets.push(bullet);
        return bullet;
    }

    /**
     * Update active bullets
     */
    updateBullets(deltaTime) {
        for (let i = this.activeBullets.length - 1; i >= 0; i--) {
            const bullet = this.activeBullets[i];
            bullet.update(deltaTime);

            if (bullet.active === false || !bullet.isActive) {
                this.activeBullets.splice(i, 1);
                this.removeBullet(bullet);
            }
        }
    }

    /**
     * Remove bullet from tracking
     */
    removeBullet(bullet) {
        const index = this.activeBullets.indexOf(bullet);
        if (index !== -1) {
            this.activeBullets.splice(index, 1);
        }
    }

    /**
     * Take damage
     * @returns {number} - Points awarded if destroyed
     */
    takeDamage() {
        this.armor--;
        if (this.armor <= 0) {
            this.active = false;
            return this.points;
        }
        return 0;
    }

    /**
     * Get bullet for rendering/game logic
     */
    getBullets() {
        return this.activeBullets;
    }
}

export default EnemyTank;
