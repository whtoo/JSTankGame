import { Player } from './Player.js';
// SpriteAnimSheet will be assigned externally after instantiation, so not imported here directly for construction.
// import { SpriteAnimSheet } from '../animation/SpriteAnimSheet.js';

export class TankPlayer extends Player {
    constructor(tankID, initDirection, isUser) {
        super();
        this.direction = initDirection; // 'w', 's', 'a', 'd'
        this.tankName = tankID;
        this.isPlayer = isUser; // 0 for player, could be boolean true/false. TODO: Standardize to boolean.

        this.destCook = 33; // Size of a tile or step distance
        this.destX = 6;     // Initial X position in terms of tiles/grid units
        this.destY = 4;     // Initial Y position in terms of tiles/grid units
        this.destW = 33;    // Width of the tank on canvas
        this.destH = 33;    // Height of the tank on canvas
        this.arc = 0;       // Rotation angle in degrees (0: right, 90: down, 180: left, 270: up)

        // Pixel coordinates, derived from grid position
        this.X = this.destX * this.destCook;
        this.Y = this.destY * this.destCook;
        this.centerX = this.X + this.destW * 0.5;
        this.centerY = this.Y + this.destH * 0.5;

        this.speedM = 6; // Movement speed multiplier
        // Movement per frame (delta for destX/destY), assuming 60 FPS for now.
        // This 'per' is effectively a fraction of a tile to move per input update.
        this.per = this.speedM / 60;

    }

    updateSelfCoor() {
        this.X = this.destX * this.destCook;
        this.Y = this.destY * this.destCook;
        this.centerX = this.X + this.destW * 0.5;
        this.centerY = this.Y + this.destH * 0.5;
    }

    // Handles rotation and sets up movement intention in the cmd object
    rotationAP(direction, cmd) {
        if (direction !== this.direction) {
            cmd.nextX = 0; // Reset movement intention if direction changes
            cmd.nextY = 0;
            switch (direction) {
                case 'w':
                    this.arc = 270; // Up
                    break;
                case 's':
                    this.arc = 90;  // Down
                    break;
                case 'a':
                    this.arc = 180; // Left
                    break;
                case 'd':
                    this.arc = 0;   // Right
                    break;
                default:
                    break;
            }
            this.direction = direction;
        } else { // Direction is the same, so process movement
            if (cmd.stop === false) { // If game is not stopped / input is active
                if (this.animSheet) {
                    this.animSheet.orderIndex++; // Advance animation frame
                }
                // Set movement intention based on current direction
                // cmd.nextX and cmd.nextY store the DELTA for this frame based on 'per'
                // These values will be used by the game loop or renderer to update actual position (destX/destY)
                switch (direction) {
                    case 'w':
                        cmd.nextY = -this.per; // Move up (negative Y)
                        break;
                    case 's':
                        cmd.nextY = this.per;  // Move down (positive Y)
                        break;
                    case 'a':
                        cmd.nextX = -this.per; // Move left (negative X)
                        break;
                    case 'd':
                        cmd.nextX = this.per;  // Move right (positive X)
                        break;
                    default:
                        break;
                }
            }
            // this.updateSelfCoor(); // Position update should happen in a game loop based on cmd.nextX/Y, not here.
                                   // Calling it here would make it update based on old destX/Y if cmd.stop is true.
        }
    }
}
