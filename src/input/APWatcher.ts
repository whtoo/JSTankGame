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
    private keyUpHandler: ((e: KeyboardEvent) => void) | null;
    private keyDownHandler: ((e: KeyboardEvent) => void) | null;
    private isDestroyed: boolean;

    constructor(gameManagerInstance: GameObjManagerInterface) {
        this.gm = gameManagerInstance;
        this.body = document.querySelector('body');
        this.keyUpHandler = null;
        this.keyDownHandler = null;
        this.isDestroyed = false;

        if (!this.body) {
            console.error("APWatcher: document.body not found at construction time.");
            return;
        }
        this._setupListeners();
    }

    private _setupListeners(): void {
        // Store handler references for proper cleanup
        this.keyUpHandler = (e: KeyboardEvent) => this.keyWatcherUp(e);
        this.keyDownHandler = (e: KeyboardEvent) => this.keyWatchDown(e);

        this.body?.addEventListener('keyup', this.keyUpHandler);
        this.body?.addEventListener('keypress', this.keyDownHandler);
    }

    /**
     * Clean up event listeners to prevent memory leaks
     * Call this when the game is being destroyed or unloaded
     */
    destroy(): void {
        if (this.isDestroyed) return;

        if (this.body && this.keyUpHandler) {
            this.body.removeEventListener('keyup', this.keyUpHandler);
        }
        if (this.body && this.keyDownHandler) {
            this.body.removeEventListener('keypress', this.keyDownHandler);
        }

        this.keyUpHandler = null;
        this.keyDownHandler = null;
        this.body = null;
        this.gm = null as unknown as GameObjManagerInterface;
        this.isDestroyed = true;
    }

    /**
     * Check if the watcher has been destroyed
     */
    isDestroyedWatcher(): boolean {
        return this.isDestroyed;
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

        // Use e.key for modern keyboard event handling
        // Supports both WASD and arrow keys
        switch (e.key) {
            case 'w':
            case 'W':
            case 'ArrowUp':
                if (player.destY > 0) {
                    player.rotationAP('w', cmd);
                }
                break;
            case 's':
            case 'S':
            case 'ArrowDown':
                if (player.destY < 13) {
                    player.rotationAP('s', cmd);
                }
                break;
            case 'a':
            case 'A':
            case 'ArrowLeft':
                if (player.destX > 0) {
                    player.rotationAP('a', cmd);
                }
                break;
            case 'd':
            case 'D':
            case 'ArrowRight':
                if (player.destX < 24) {
                    player.rotationAP('d', cmd);
                }
                break;
            case ' ':
            case 'Spacebar':
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
