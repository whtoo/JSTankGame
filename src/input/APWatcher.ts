/**
 * APWatcher handles keyboard input for player actions.
 */

import { CommandObject } from '../entities/TankPlayer.js';

export interface GameObjManagerInterface {
    gameObjects: Array<{ destX: number; destY: number; rotationAP(dir: string, cmd: CommandObject): void }>;
    cmd: CommandObject;
}

export class APWatcher {
    gm: GameObjManagerInterface;
    body: HTMLElement | null;

    constructor(gameManagerInstance: GameObjManagerInterface) {
        this.gm = gameManagerInstance;
        this.body = document.querySelector('body');
        if (!this.body) {
            console.error("APWatcher: document.body not found at construction time.");
            return;
        }
        this._setupListeners();
    }

    private _setupListeners(): void {
        this.body.onkeyup = (e: KeyboardEvent) => this.keyWatcherUp(e);
        this.body.onkeypress = (e: KeyboardEvent) => this.keyWatchDown(e);
    }

    keyWatchDown(e: KeyboardEvent): void {
        if (!this.gm || !this.gm.gameObjects || this.gm.gameObjects.length === 0) {
            return;
        }
        const player = this.gm.gameObjects[0];
        const cmd = this.gm.cmd;

        if (cmd.stop) {
            cmd.stop = false;
        }
        cmd.nextX = 0;
        cmd.nextY = 0;

        switch (e.which) {
            case 119: // w - Move Up
                if (player.destY > 0) {
                    player.rotationAP('w', cmd);
                }
                break;
            case 115: // s - Move Down
                if (player.destY < 13) {
                    player.rotationAP('s', cmd);
                }
                break;
            case 97: // a - Move Left
                if (player.destX > 0) {
                    player.rotationAP('a', cmd);
                }
                break;
            case 100: // d - Move Right
                if (player.destX < 24) {
                    player.rotationAP('d', cmd);
                }
                break;
            case 32: // Spacebar - Fire
                cmd.fire = true;
                break;
            default:
                break;
        }
    }

    keyWatcherUp(_e: KeyboardEvent): void {
        if (!this.gm) return;
        this.gm.cmd.stop = true;
        this.gm.cmd.nextX = 0;
        this.gm.cmd.nextY = 0;
    }
}
