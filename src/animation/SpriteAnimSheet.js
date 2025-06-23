import { SpriteAnimation } from './SpriteAnimation.js';

//动画图册
export class SpriteAnimSheet {
    constructor(startAnim, stopAnim, X) {
        this.animationFrames = [];
        this.animLength = stopAnim - startAnim + 1;
        this.orderIndex = 0;

        for (let i = 0; i < this.animLength; i++) {
            const item = new SpriteAnimation(X, i + startAnim);
            this.animationFrames.push(item);
        }
    }

    getFrames() {
        return this.animationFrames[this.orderIndex % this.animLength];
    }
}
