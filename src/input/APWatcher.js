// APWatcher handles keyboard input for player actions.
// "AP" might stand for Action Points or similar, related to controlling the player.
export class APWatcher {
    constructor(gameManagerInstance) {
        this.gm = gameManagerInstance; // Reference to the GameObjManager
        this.body = document.querySelector('body');
        if (!this.body) {
            console.error("APWatcher: document.body not found at construction time.");
            return;
        }
        this._setupListeners();
    }

    _setupListeners() {
        // Arrow functions ensure 'this' context is correct (points to APWatcher instance)
        this.body.onkeyup = (e) => this.keyWatcherUp(e);
        this.body.onkeypress = (e) => this.keyWatchDown(e); // onkeypress is somewhat legacy, consider keydown.
    }

    keyWatchDown(e) {
        if (!this.gm || !this.gm.gameObjects || this.gm.gameObjects.length === 0) {
            return; // No game manager or player object to control
        }
        const player = this.gm.gameObjects[0]; // Assuming player is always the first object
        const cmd = this.gm.cmd;

        if (cmd.stop) { // If previously stopped, start movement
            cmd.stop = false;
        }
        cmd.nextX = 0; // Reset previous frame's movement intention
        cmd.nextY = 0;


        // Using e.key for modern browsers, falling back to e.which for wider compatibility if needed.
        // For this refactor, sticking to e.which as per original code.
        // 'w' = 119, 's' = 115, 'a' = 97, 'd' = 100
        switch (e.which) {
            case 119: // w - Move Up
                // console.log('press w');
                if (player.destY > 0) { // Boundary check (example)
                    player.rotationAP('w', cmd);
                }
                break;
            case 115: // s - Move Down
                // console.log('press s');
                if (player.destY < 13) { // Boundary check (example, 13 might be map height boundary)
                    player.rotationAP('s', cmd);
                }
                break;
            case 97: // a - Move Left
                // console.log('press a');
                if (player.destX > 0) { // Boundary check (example)
                    player.rotationAP('a', cmd);
                }
                break;
            case 100: // d - Move Right
                // console.log('press d');
                if (player.destX < 24) { // Boundary check (example, 24 might be map width boundary)
                    player.rotationAP('d', cmd);
                }
                break;
            default:
                // console.log('press other key:', e.which);
                break;
        }
    }

    keyWatcherUp(e) {
        if (!this.gm) return;
        // Stop movement and reset movement intentions when any relevant key is released.
        // More specific key up handling could be implemented if needed (e.g. only stop for w,a,s,d)
        this.gm.cmd.stop = true;
        this.gm.cmd.nextX = 0;
        this.gm.cmd.nextY = 0;
    }

    // TODO: Method to unregister event listeners if APWatcher instance is ever destroyed.
    // destroy() {
    //     if (this.body) {
    //         this.body.onkeyup = null;
    //         this.body.onkeypress = null;
    //     }
    // }
}
