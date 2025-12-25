/**
 * SpriteAnimSheet - Multi-frame animation sprite sheet
 * Supports both legacy grid-based and new JSON-based animations
 */

import { SpriteAnimation } from './SpriteAnimation.js';
import type { AnimationFrame, ISpriteAnimSheet, Direction, AnimationDirection } from '../types/index.js';

/**
 * Legacy grid-based animation sheet
 * Uses tile row/column indices to calculate sprite positions
 */
export class SpriteAnimSheet implements ISpriteAnimSheet {
    private animationFrames: SpriteAnimation[];
    private animLength: number;
    private orderIndex: number;

    constructor(startAnim: number, stopAnim: number, X: number) {
        this.animationFrames = [];
        this.animLength = stopAnim - startAnim + 1;
        this.orderIndex = 0;

        for (let i = 0; i < this.animLength; i++) {
            const item = new SpriteAnimation(X, i + startAnim);
            this.animationFrames.push(item);
        }
    }

    getFrames(): AnimationFrame {
        const frame = this.animationFrames[this.orderIndex % this.animLength];
        this.orderIndex++;
        return frame;
    }
}

/**
 * Config-based directional animation sheet
 * Loads animation frames from JSON configuration
 * Each direction (up/down/left/right) has its own sprite
 */
export class DirectionalAnimSheet implements ISpriteAnimSheet {
    private frames: Map<AnimationDirection, AnimationFrame>;
    private currentDirection: AnimationDirection;

    constructor(directionalFrames: Map<AnimationDirection, AnimationFrame>, initialDirection: Direction = 'up') {
        this.frames = directionalFrames;
        this.currentDirection = this._mapDirection(initialDirection);
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
        }
    }

    /**
     * Update the current animation direction
     */
    setDirection(dir: Direction): void {
        this.currentDirection = this._mapDirection(dir);
    }

    /**
     * Get the current frame based on direction
     */
    getFrames(): AnimationFrame | null {
        return this.frames.get(this.currentDirection) || null;
    }

    /**
     * Get frame for specific direction (without changing current)
     */
    getFrameForDirection(dir: Direction): AnimationFrame | null {
        return this.frames.get(this._mapDirection(dir)) || null;
    }
}

/**
 * Factory for creating animation sheets from configuration
 */
export class AnimSheetFactory {
    /**
     * Create a DirectionalAnimSheet from animation sequences
     * @param sequences - Animation sequences for each direction
     * @param initialDirection - Starting direction
     */
    static fromSequences(
        sequences: Record<AnimationDirection, { x: number; y: number; w: number; h: number }>,
        initialDirection: Direction = 'up'
    ): DirectionalAnimSheet {
        const frames = new Map<AnimationDirection, AnimationFrame>();

        for (const [dir, rect] of Object.entries(sequences)) {
            frames.set(
                dir as AnimationDirection,
                SpriteAnimation.fromSpriteRect(rect)
            );
        }

        return new DirectionalAnimSheet(frames, initialDirection);
    }
}
