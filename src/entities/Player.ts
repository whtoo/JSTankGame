/**
 * Player - Base player class
 */

import type { ISpriteAnimSheet } from '../types/index.js';

export class Player {
    sourceDx: number;
    sourceDy: number;
    sourceW: number;
    sourceH: number;
    animSheet: ISpriteAnimSheet | null;

    constructor() {
        this.sourceDx = 528; // Default sprite sheet X offset
        this.sourceDy = 99;  // Default sprite sheet Y offset
        this.sourceW = 33;   // Default sprite width
        this.sourceH = 33;   // Default sprite height
        this.animSheet = null; // Will hold a SpriteAnimSheet instance
    }
}
