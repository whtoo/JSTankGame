//单桢动画
export class SpriteAnimation {
    constructor(sX, sY) {
        // Spritesheet tiles are 32x32 pixels
        this.sourceDx = sX * 32;
        this.sourceDy = sY * 32;
        this.sourceW = 32;
        this.sourceH = 32;
    }
}
