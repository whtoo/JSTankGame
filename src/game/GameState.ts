/**
 * GameState - Finite State Machine for game states
 * Handles transitions between menu, playing, paused, and game over
 */

import type { GameState as IGameState } from '../types/index.js';

// State definitions
export const GameStateType = {
    MENU: 'menu' as const,
    PLAYING: 'playing' as const,
    PAUSED: 'paused' as const,
    GAMEOVER: 'gameover' as const
};

export type GameStateTypeValue = typeof GameStateType[keyof typeof GameStateType];

/** Base state class */
export class GameState {
    stateManager: StateManager;
    isActive: boolean = false;

    constructor(stateManager: StateManager) {
        this.stateManager = stateManager;
    }

    enter(): void {
        this.isActive = true;
    }

    exit(): void {
        this.isActive = false;
    }

    update(_deltaTime: number): void {
        // Override in subclasses
    }

    handleInput(_input: unknown): void {
        // Override in subclasses
    }
}

/** Menu state - shows title screen */
export class MenuState extends GameState {
    enter(): void {
        super.enter();
        console.log('Entered Menu state');
    }

    update(_deltaTime: number): void {
        // Auto-start on first input
    }
}

/** Playing state - main game loop */
export class PlayingState extends GameState {
    enter(): void {
        super.enter();
        console.log('Entered Playing state');
    }

    update(_deltaTime: number): void {
        // Game logic handled by GameObjManager
    }
}

/** Paused state - frozen game state */
export class PausedState extends GameState {
    enter(): void {
        super.enter();
        console.log('Entered Paused state');
    }
}

/** GameOver state - show game over screen */
export class GameOverState extends GameState {
    score: number = 0;

    constructor(stateManager: StateManager, score: number = 0) {
        super(stateManager);
        this.score = score;
    }

    enter(): void {
        super.enter();
        console.log(`Entered GameOver state with score: ${this.score}`);
    }
}

/** State Manager - manages game state transitions */
export class StateManager {
    private states: Record<string, { class: new (sm: StateManager, ...args: unknown[]) => GameState; instance: GameState | null }> = {};
    currentState: GameState | null = null;
    score: number = 0;
    level: number = 1;
    lives: number = 3;

    constructor() {
        // Register states
        this.registerState(GameStateType.MENU, MenuState);
        this.registerState(GameStateType.PLAYING, PlayingState);
        this.registerState(GameStateType.PAUSED, PausedState);
        this.registerState(GameStateType.GAMEOVER, GameOverState);
    }

    registerState(type: string, StateClass: new (sm: StateManager, ...args: unknown[]) => GameState): void {
        this.states[type] = {
            class: StateClass,
            instance: null
        };
    }

    getState(type: string): GameState {
        if (!this.states[type]) {
            throw new Error(`Unknown state type: ${type}`);
        }

        if (!this.states[type].instance) {
            this.states[type].instance = new this.states[type].class(this);
        }

        return this.states[type].instance!;
    }

    changeState(newStateType: GameStateTypeValue, ...args: unknown[]): GameState {
        if (this.currentState) {
            this.currentState.exit();
        }

        const newState = this.getState(newStateType);

        // Pass arguments if it's GameOverState with score
        if (newStateType === GameStateType.GAMEOVER && args.length > 0) {
            if (newState instanceof GameOverState) {
                newState.score = args[0] as number;
            }
        }

        this.currentState = newState;
        this.currentState.enter();

        return newState;
    }

    update(deltaTime: number): void {
        if (this.currentState) {
            this.currentState.update(deltaTime);
        }
    }

    handleInput(input: unknown): void {
        if (this.currentState) {
            this.currentState.handleInput(input);
        }
    }

    // Convenience methods
    startGame(): GameState {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        return this.changeState(GameStateType.PLAYING);
    }

    pause(): GameState | undefined {
        if (this.currentState?.constructor.name === 'PlayingState') {
            return this.changeState(GameStateType.PAUSED);
        }
    }

    resume(): GameState | undefined {
        if (this.currentState?.constructor.name === 'PausedState') {
            return this.changeState(GameStateType.PLAYING);
        }
    }

    gameOver(score: number = 0): GameState {
        return this.changeState(GameStateType.GAMEOVER, score);
    }

    toMenu(): GameState {
        return this.changeState(GameStateType.MENU);
    }

    addScore(points: number): void {
        this.score += points;
    }

    getScore(): number {
        return this.score;
    }
}
