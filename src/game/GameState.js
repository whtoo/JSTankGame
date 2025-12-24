/**
 * GameState - Finite State Machine for game states
 * Handles transitions between menu, playing, paused, and game over
 */

// State definitions
export const GameStateType = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAMEOVER: 'gameover'
};

/**
 * Base state class
 */
export class GameState {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.isActive = false;
    }

    enter() {
        this.isActive = true;
    }

    exit() {
        this.isActive = false;
    }

    update(deltaTime) {
        // Override in subclasses
    }

    handleInput(input) {
        // Override in subclasses
    }
}

/**
 * Menu state - shows title screen
 */
export class MenuState extends GameState {
    enter() {
        super.enter();
        // TODO: Show menu UI
        console.log('Entered Menu state');
    }

    update(deltaTime) {
        // Auto-start on first input
    }
}

/**
 * Playing state - main game loop
 */
export class PlayingState extends GameState {
    enter() {
        super.enter();
        console.log('Entered Playing state');
    }

    update(deltaTime) {
        // Game logic handled by GameObjManager
    }
}

/**
 * Paused state - frozen game state
 */
export class PausedState extends GameState {
    enter() {
        super.enter();
        console.log('Entered Paused state');
    }
}

/**
 * GameOver state - show game over screen
 */
export class GameOverState extends GameState {
    constructor(stateManager, score = 0) {
        super(stateManager);
        this.score = score;
    }

    enter() {
        super.enter();
        console.log(`Entered GameOver state with score: ${this.score}`);
    }
}

/**
 * State Manager - manages game state transitions
 */
export class StateManager {
    constructor() {
        this.states = {};
        this.currentState = null;
        this.score = 0;
        this.level = 1;
        this.lives = 3;

        // Register states
        this.registerState(GameStateType.MENU, MenuState);
        this.registerState(GameStateType.PLAYING, PlayingState);
        this.registerState(GameStateType.PAUSED, PausedState);
        this.registerState(GameStateType.GAMEOVER, GameOverState);
    }

    registerState(type, StateClass) {
        this.states[type] = {
            class: StateClass,
            instance: null
        };
    }

    getState(type) {
        if (!this.states[type]) {
            throw new Error(`Unknown state type: ${type}`);
        }

        if (!this.states[type].instance) {
            this.states[type].instance = new this.states[type].class(this);
        }

        return this.states[type].instance;
    }

    changeState(newStateType, ...args) {
        if (this.currentState) {
            this.currentState.exit();
        }

        const newState = this.getState(newStateType);

        // Pass arguments if it's GameOverState with score
        if (newStateType === GameStateType.GAMEOVER && args.length > 0) {
            newState.score = args[0];
        }

        this.currentState = newState;
        this.currentState.enter();

        return newState;
    }

    update(deltaTime) {
        if (this.currentState) {
            this.currentState.update(deltaTime);
        }
    }

    handleInput(input) {
        if (this.currentState) {
            this.currentState.handleInput(input);
        }
    }

    // Convenience methods
    startGame() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        return this.changeState(GameStateType.PLAYING);
    }

    pause() {
        if (this.currentState?.constructor.name === 'PlayingState') {
            return this.changeState(GameStateType.PAUSED);
        }
    }

    resume() {
        if (this.currentState?.constructor.name === 'PausedState') {
            return this.changeState(GameStateType.PLAYING);
        }
    }

    gameOver(score = 0) {
        return this.changeState(GameStateType.GAMEOVER, score);
    }

    toMenu() {
        return this.changeState(GameStateType.MENU);
    }

    addScore(points) {
        this.score += points;
    }

    getScore() {
        return this.score;
    }
}
