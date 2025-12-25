/**
 * SpriteAnimation - Single frame animation
 * Represents one frame from the spritesheet
 */

import type { AnimationFrame, SpriteRect } from '../types/index.js';

export class SpriteAnimation implements AnimationFrame {
    sourceDx: number;
    sourceDy: number;
    sourceW: number;
    sourceH: number;

    constructor(sX: number, sY: number) {
        // Spritesheet tiles are 32x32 pixels
        this.sourceDx = sX * 32;
        this.sourceDy = sY * 32;
        this.sourceW = 32;
        this.sourceH = 32;
    }

    /**
     * Create from absolute sprite rectangle (from JSON config)
     */
    static fromSpriteRect(rect: SpriteRect): SpriteAnimation {
        const anim = new SpriteAnimation(0, 0);
        anim.sourceDx = rect.x;
        anim.sourceDy = rect.y;
        anim.sourceW = rect.w;
        anim.sourceH = rect.h;
        return anim;
    }
}
