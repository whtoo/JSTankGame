/**
 * SpriteAnimSheet - Multi-frame animation sprite sheet
 */

import { SpriteAnimation } from './SpriteAnimation.js';
import type { AnimationFrame, ISpriteAnimSheet } from '../types/index.js';

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
