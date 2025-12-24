/**
 * Tests for GameState module
 */
import { GameStateType, StateManager, MenuState, PlayingState, PausedState, GameOverState } from './GameState.js';

describe('StateManager', () => {
    let stateManager;

    beforeEach(() => {
        stateManager = new StateManager();
    });

    describe('constructor', () => {
        it('should initialize with default values', () => {
            expect(stateManager.score).toBe(0);
            expect(stateManager.level).toBe(1);
            expect(stateManager.lives).toBe(3);
            expect(stateManager.currentState).toBeNull();
        });

        it('should register all states', () => {
            expect(stateManager.states[GameStateType.MENU]).toBeDefined();
            expect(stateManager.states[GameStateType.PLAYING]).toBeDefined();
            expect(stateManager.states[GameStateType.PAUSED]).toBeDefined();
            expect(stateManager.states[GameStateType.GAMEOVER]).toBeDefined();
        });
    });

    describe('getState', () => {
        it('should return menu state instance', () => {
            const state = stateManager.getState(GameStateType.MENU);
            expect(state).toBeInstanceOf(MenuState);
        });

        it('should return playing state instance', () => {
            const state = stateManager.getState(GameStateType.PLAYING);
            expect(state).toBeInstanceOf(PlayingState);
        });

        it('should return paused state instance', () => {
            const state = stateManager.getState(GameStateType.PAUSED);
            expect(state).toBeInstanceOf(PausedState);
        });

        it('should return game over state instance', () => {
            const state = stateManager.getState(GameStateType.GAMEOVER);
            expect(state).toBeInstanceOf(GameOverState);
        });

        it('should return same instance on subsequent calls', () => {
            const state1 = stateManager.getState(GameStateType.PLAYING);
            const state2 = stateManager.getState(GameStateType.PLAYING);
            expect(state1).toBe(state2);
        });
    });

    describe('changeState', () => {
        it('should transition to playing state', () => {
            const state = stateManager.changeState(GameStateType.PLAYING);
            expect(state).toBeInstanceOf(PlayingState);
            expect(stateManager.currentState).toBe(state);
            expect(state.isActive).toBe(true);
        });

        it('should transition to paused state', () => {
            stateManager.changeState(GameStateType.PLAYING);
            const state = stateManager.changeState(GameStateType.PAUSED);
            expect(state).toBeInstanceOf(PausedState);
            expect(stateManager.currentState).toBe(state);
        });

        it('should transition to game over state with score', () => {
            const score = 1000;
            const state = stateManager.changeState(GameStateType.GAMEOVER, score);
            expect(state).toBeInstanceOf(GameOverState);
            expect(state.score).toBe(score);
        });

        it('should transition to menu state', () => {
            stateManager.changeState(GameStateType.PLAYING);
            const state = stateManager.changeState(GameStateType.MENU);
            expect(state).toBeInstanceOf(MenuState);
        });

        it('should exit previous state', () => {
            const playingState = stateManager.changeState(GameStateType.PLAYING);
            const menuState = stateManager.changeState(GameStateType.MENU);
            expect(playingState.isActive).toBe(false);
            expect(menuState.isActive).toBe(true);
        });
    });

    describe('convenience methods', () => {
        it('startGame should reset stats and enter playing state', () => {
            stateManager.score = 500;
            stateManager.level = 5;
            stateManager.lives = 1;

            const state = stateManager.startGame();

            expect(stateManager.score).toBe(0);
            expect(stateManager.level).toBe(1);
            expect(stateManager.lives).toBe(3);
            expect(state).toBeInstanceOf(PlayingState);
        });

        it('pause should enter paused state from playing', () => {
            stateManager.startGame();
            const state = stateManager.pause();
            expect(state).toBeInstanceOf(PausedState);
        });

        it('resume should enter playing state from paused', () => {
            stateManager.startGame();
            stateManager.pause();
            const state = stateManager.resume();
            expect(state).toBeInstanceOf(PlayingState);
        });

        it('gameOver should enter game over state', () => {
            stateManager.startGame();
            const state = stateManager.gameOver(1500);
            expect(state).toBeInstanceOf(GameOverState);
            expect(state.score).toBe(1500);
        });

        it('toMenu should enter menu state', () => {
            stateManager.startGame();
            const state = stateManager.toMenu();
            expect(state).toBeInstanceOf(MenuState);
        });

        it('addScore should increment score', () => {
            stateManager.addScore(100);
            stateManager.addScore(50);
            expect(stateManager.getScore()).toBe(150);
        });
    });

    describe('update', () => {
        it('should call update on current state', () => {
            stateManager.changeState(GameStateType.PLAYING);
            const updateSpy = jest.spyOn(stateManager.currentState, 'update');
            stateManager.update(0.016);
            expect(updateSpy).toHaveBeenCalledWith(0.016);
        });

        it('should not throw when currentState is null', () => {
            expect(() => stateManager.update(0.016)).not.toThrow();
        });
    });
});

describe('GameState classes', () => {
    describe('MenuState', () => {
        it('should be active after enter', () => {
            const stateManager = new StateManager();
            const state = new MenuState(stateManager);
            state.enter();
            expect(state.isActive).toBe(true);
        });
    });

    describe('PlayingState', () => {
        it('should be active after enter', () => {
            const stateManager = new StateManager();
            const state = new PlayingState(stateManager);
            state.enter();
            expect(state.isActive).toBe(true);
        });
    });

    describe('PausedState', () => {
        it('should be active after enter', () => {
            const stateManager = new StateManager();
            const state = new PausedState(stateManager);
            state.enter();
            expect(state.isActive).toBe(true);
        });
    });

    describe('GameOverState', () => {
        it('should store score', () => {
            const stateManager = new StateManager();
            const state = new GameOverState(stateManager, 2000);
            expect(state.score).toBe(2000);
        });

        it('should be active after enter', () => {
            const stateManager = new StateManager();
            const state = new GameOverState(stateManager, 1000);
            state.enter();
            expect(state.isActive).toBe(true);
        });
    });
});
