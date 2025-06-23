import { TankPlayer } from '../entities/TankPlayer.js';
import { SpriteAnimSheet } from '../animation/SpriteAnimSheet.js';

export class GameObjManager {
    constructor() {
        const objList = [];
        // Create a single player tank for now
        for (let i = 0; i < 1; i++) {
            const player = new TankPlayer(`Tank${i}`, 'w', 0); // Initial direction 'w' (up)
            player.animSheet = new SpriteAnimSheet(3, 9, 16); // Assign animation sheet
            objList.push(player);
        }
        this.gameObjects = objList; // List of all game objects (currently just one player)

        // Command object for player actions, shared with input handler (APWatcher)
        // and potentially game loop.
        this.cmd = {
            nextX: 0,    // Intended movement delta X for the current frame/update
            nextY: 0,    // Intended movement delta Y for the current frame/update
            stop: true   // Flag to indicate if movement should stop (e.g., on key release)
        };
        this.isInited = 0; // TODO: What is this for? Can it be removed or clarified?
    }

    // TODO: Add methods to manage game objects, e.g., add, remove, updateAll, etc.
}
