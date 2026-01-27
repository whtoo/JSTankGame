/**
 * TileMapSpriteAnimator - Manages tank sprite animations using tilemap tile IDs
 * Provides frame-based animation for tanks using the tankbrigade.png tileset
 */

import type { Direction, AnimationDirection } from '../types/index.js';

/**
 * Animation frame data
 */
export interface AnimationFrame {
  tileId: number;
  pixelX: number;
  pixelY: number;
  width: number;
  height: number;
}

/**
 * Tank animation configuration
 */
export interface TankAnimationConfig {
  type: 'Player' | 'Enemy';
  description: string;
  tileIds: {
    up: number[];
    right: number[];
    down: number[];
    left: number[];
  };
  pixelCoords: {
    up: Array<{ x: number; y: number }>;
    right: Array<{ x: number; y: number }>;
    down: Array<{ x: number; y: number }>;
    left: Array<{ x: number; y: number }>;
  };
  frameCount: number;
  frameDuration: number;
}

/**
 * Sprite animator for tilemap-based tank animations
 */
export class TileMapSpriteAnimator {
  private config: TankAnimationConfig;
  private currentDirection: AnimationDirection;
  private currentFrame: number;
  private lastFrameTime: number;
  private isPlaying: boolean;

  constructor(config: TankAnimationConfig, initialDirection: Direction = 'up') {
    this.config = config;
    this.currentDirection = this._mapDirection(initialDirection);
    this.currentFrame = 0;
    this.lastFrameTime = 0;
    this.isPlaying = true;
  }

  /**
   * Map game direction to animation direction
   */
  private _mapDirection(dir: Direction): AnimationDirection {
    switch (dir) {
      case 'w':
      case 'up':
        return 'up';
      case 'd':
      case 'right':
        return 'right';
      case 's':
      case 'down':
        return 'down';
      case 'a':
      case 'left':
        return 'left';
      default:
        return 'up';
    }
  }

  /**
   * Set animation direction
   */
  setDirection(dir: Direction): void {
    const newDirection = this._mapDirection(dir);
    if (newDirection !== this.currentDirection) {
      this.currentDirection = newDirection;
      this.currentFrame = 0; // Reset frame on direction change
    }
  }

  /**
   * Get current animation direction
   */
  getDirection(): AnimationDirection {
    return this.currentDirection;
  }

  /**
   * Start animation
   */
  play(): void {
    this.isPlaying = true;
  }

  /**
   * Stop animation
   */
  pause(): void {
    this.isPlaying = false;
  }

  /**
   * Reset to first frame
   */
  reset(): void {
    this.currentFrame = 0;
    this.lastFrameTime = 0;
  }

  /**
   * Update animation frame
   * @param timestamp Current time in milliseconds
   */
  update(timestamp: number): void {
    if (!this.isPlaying) return;

    if (timestamp - this.lastFrameTime > this.config.frameDuration) {
      const frameCount = this.config.frameCount;
      this.currentFrame = (this.currentFrame + 1) % frameCount;
      this.lastFrameTime = timestamp;
    }
  }

  /**
   * Get current animation frame
   */
  getCurrentFrame(): AnimationFrame {
    const tileIds = this.config.tileIds[this.currentDirection];
    const pixelCoords = this.config.pixelCoords[this.currentDirection];
    
    const frameIndex = Math.min(this.currentFrame, tileIds.length - 1);
    
    return {
      tileId: tileIds[frameIndex],
      pixelX: pixelCoords[frameIndex].x,
      pixelY: pixelCoords[frameIndex].y,
      width: 33,
      height: 33
    };
  }

  /**
   * Get frame for specific direction (without changing current direction)
   */
  getFrameForDirection(dir: Direction): AnimationFrame {
    const direction = this._mapDirection(dir);
    const tileIds = this.config.tileIds[direction];
    const pixelCoords = this.config.pixelCoords[direction];
    
    const frameIndex = Math.min(this.currentFrame, tileIds.length - 1);
    
    return {
      tileId: tileIds[frameIndex],
      pixelX: pixelCoords[frameIndex].x,
      pixelY: pixelCoords[frameIndex].y,
      width: 33,
      height: 33
    };
  }

  /**
   * Get all frames for current direction
   */
  getAllFramesForCurrentDirection(): AnimationFrame[] {
    const tileIds = this.config.tileIds[this.currentDirection];
    const pixelCoords = this.config.pixelCoords[this.currentDirection];
    
    return tileIds.map((tileId, index) => ({
      tileId,
      pixelX: pixelCoords[index].x,
      pixelY: pixelCoords[index].y,
      width: 33,
      height: 33
    }));
  }
}

/**
 * Predefined tank animation configurations based on tileset analysis
 */
export const TANK_ANIMATIONS: Record<string, TankAnimationConfig> = {
  player_green_lvl1: {
    type: 'Player',
    description: '基础绿色玩家坦克',
    tileIds: {
      up: [18, 42],
      right: [66, 90],
      down: [114, 138],
      left: [162, 186]
    },
    pixelCoords: {
      up: [{ x: 594, y: 0 }, { x: 627, y: 0 }],
      right: [{ x: 594, y: 66 }, { x: 627, y: 66 }],
      down: [{ x: 594, y: 132 }, { x: 627, y: 132 }],
      left: [{ x: 594, y: 198 }, { x: 627, y: 198 }]
    },
    frameCount: 2,
    frameDuration: 200
  },
  
  player_green_lvl2: {
    type: 'Player',
    description: '强化绿色玩家坦克',
    tileIds: {
      up: [19, 43],
      right: [67, 91],
      down: [115, 139],
      left: [163, 187]
    },
    pixelCoords: {
      up: [{ x: 627, y: 0 }, { x: 660, y: 0 }],
      right: [{ x: 627, y: 66 }, { x: 660, y: 66 }],
      down: [{ x: 627, y: 132 }, { x: 660, y: 132 }],
      left: [{ x: 627, y: 198 }, { x: 660, y: 198 }]
    },
    frameCount: 2,
    frameDuration: 180
  },

  enemy_green_lvl1: {
    type: 'Enemy',
    description: '基础绿色敌人坦克',
    tileIds: {
      up: [21, 45],
      right: [69, 93],
      down: [117, 141],
      left: [165, 189]
    },
    pixelCoords: {
      up: [{ x: 693, y: 0 }, { x: 726, y: 0 }],
      right: [{ x: 693, y: 66 }, { x: 726, y: 66 }],
      down: [{ x: 693, y: 132 }, { x: 726, y: 132 }],
      left: [{ x: 693, y: 198 }, { x: 726, y: 198 }]
    },
    frameCount: 2,
    frameDuration: 250
  },

  enemy_blue_lvl1: {
    type: 'Enemy',
    description: '基础蓝色敌人坦克',
    tileIds: {
      up: [163, 187],
      right: [211, 235],
      down: [259, 283],
      left: [307, 331]
    },
    pixelCoords: {
      up: [{ x: 627, y: 198 }, { x: 660, y: 198 }],
      right: [{ x: 627, y: 264 }, { x: 660, y: 264 }],
      down: [{ x: 627, y: 330 }, { x: 660, y: 330 }],
      left: [{ x: 627, y: 396 }, { x: 660, y: 396 }]
    },
    frameCount: 2,
    frameDuration: 220
  }
};

/**
 * Factory for creating tank animators
 */
export class TankAnimatorFactory {
  /**
   * Create animator by tank type
   */
  static create(tankType: string, initialDirection: Direction = 'up'): TileMapSpriteAnimator | null {
    const config = TANK_ANIMATIONS[tankType];
    if (!config) {
      console.warn(`Unknown tank type: ${tankType}`);
      return null;
    }
    return new TileMapSpriteAnimator(config, initialDirection);
  }

  /**
   * Get available tank types
   */
  static getAvailableTypes(): string[] {
    return Object.keys(TANK_ANIMATIONS);
  }

  /**
   * Get tank config by type
   */
  static getConfig(tankType: string): TankAnimationConfig | null {
    return TANK_ANIMATIONS[tankType] || null;
  }
}

/**
 * Global animator cache
 */
const animatorCache = new Map<string, TileMapSpriteAnimator>();

/**
 * Get or create cached animator
 */
export function getCachedAnimator(tankType: string, initialDirection: Direction = 'up'): TileMapSpriteAnimator | null {
  const cacheKey = `${tankType}_${initialDirection}`;
  
  if (!animatorCache.has(cacheKey)) {
    const animator = TankAnimatorFactory.create(tankType, initialDirection);
    if (animator) {
      animatorCache.set(cacheKey, animator);
    }
    return animator;
  }
  
  return animatorCache.get(cacheKey)!;
}

/**
 * Clear animator cache
 */
export function clearAnimatorCache(): void {
  animatorCache.clear();
}
