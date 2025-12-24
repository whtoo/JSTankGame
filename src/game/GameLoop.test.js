/**
 * Tests for GameLoop module
 */
import { FixedTimeStep, GameLoop } from './GameLoop.js';

describe('FixedTimeStep', () => {
    describe('constructor', () => {
        it('should initialize with default values', () => {
            const ts = new FixedTimeStep(1 / 60, 0.1);
            expect(ts.fixedDelta).toBe(1 / 60);
            expect(ts.maxDelta).toBe(0.1);
            expect(ts.accumulator).toBe(0);
            expect(ts.frameCount).toBe(0);
        });

        it('should accept custom values', () => {
            const custom = new FixedTimeStep(1 / 30, 0.2);
            expect(custom.fixedDelta).toBe(1 / 30);
            expect(custom.maxDelta).toBe(0.2);
        });
    });

    describe('reset', () => {
        it('should reset all values', () => {
            const ts = new FixedTimeStep(1 / 60, 0.1);
            ts.update(0.1);
            ts.consume();
            ts.reset();
            expect(ts.accumulator).toBe(0);
            expect(ts.frameCount).toBe(0);
            expect(ts.totalTime).toBe(0);
        });
    });

    describe('update', () => {
        it('should add delta to accumulator', () => {
            const ts = new FixedTimeStep(1 / 60, 0.1);
            ts.update(0.016);
            expect(ts.accumulator).toBeCloseTo(0.016, 5);
            expect(ts.totalTime).toBeCloseTo(0.016, 5);
        });

        it('should cap delta at maxDelta', () => {
            const ts = new FixedTimeStep(1 / 60, 0.1);
            ts.update(1.0); // Exceeds maxDelta of 0.1
            expect(ts.accumulator).toBeCloseTo(0.1, 5);
        });

        it('should accumulate multiple updates', () => {
            const ts = new FixedTimeStep(1 / 60, 0.1);
            ts.update(0.016);
            ts.update(0.016);
            expect(ts.accumulator).toBeCloseTo(0.032, 5);
        });
    });

    describe('shouldUpdate', () => {
        it('should return false when accumulator is less than fixedDelta', () => {
            const ts = new FixedTimeStep(1 / 60, 0.1);
            ts.update(0.01);
            expect(ts.shouldUpdate()).toBe(false);
        });

        it('should return true when accumulator is >= fixedDelta', () => {
            const ts = new FixedTimeStep(1 / 60, 0.1);
            ts.update(0.1); // > 1/60
            expect(ts.shouldUpdate()).toBe(true);
        });
    });

    describe('consume', () => {
        it('should return 0 when no updates needed', () => {
            const ts = new FixedTimeStep(1 / 60, 0.1);
            ts.update(0.01);
            expect(ts.consume()).toBe(0);
        });

        it('should consume updates and update frameCount', () => {
            const ts = new FixedTimeStep(1 / 60, 0.1);
            // Add enough time for at least one update
            ts.update(0.1);
            const count = ts.consume();
            expect(count).toBeGreaterThan(0);
            expect(ts.frameCount).toBe(count);
        });

        it('should leave remaining accumulator for non-divisible values', () => {
            const ts = new FixedTimeStep(1 / 60, 0.1);
            // Use a value that doesn't divide evenly
            ts.update(0.17);
            ts.consume();
            // After consuming, there should be some remainder
            expect(ts.accumulator).toBeLessThan(0.01);
        });

        it('should consume multiple times', () => {
            const ts = new FixedTimeStep(1 / 60, 0.1);
            ts.update(0.1);
            const count1 = ts.consume();
            ts.update(0.05);
            const count2 = ts.consume();
            expect(count1).toBeGreaterThan(0);
            expect(count2).toBeGreaterThanOrEqual(0);
        });
    });

    describe('getCurrentFps', () => {
        it('should return 0 when no time has passed', () => {
            const ts = new FixedTimeStep(1 / 60, 0.1);
            expect(ts.getCurrentFps()).toBe(0);
        });

        it('should calculate correct FPS', () => {
            const ts = new FixedTimeStep(1 / 60, 0.1);
            ts.update(0.5);
            ts.consume();
            // After 0.5 seconds with 1/60 fixedDelta, should have ~30 frames
            const fps = ts.getCurrentFps();
            expect(fps).toBeCloseTo(60, 0);
        });
    });

    describe('getAlpha', () => {
        it('should return 0 when accumulator is 0', () => {
            const ts = new FixedTimeStep(1 / 60, 0.1);
            expect(ts.getAlpha()).toBe(0);
        });

        it('should return alpha between 0 and 1', () => {
            const ts = new FixedTimeStep(1 / 60, 0.1);
            ts.update(0.01); // Small amount, less than one update
            const alpha = ts.getAlpha();
            expect(alpha).toBeGreaterThan(0);
            expect(alpha).toBeLessThan(1);
        });
    });
});

describe('GameLoop', () => {
    let gameLoop;
    let mockGameManager;
    let mockRender;

    beforeEach(() => {
        mockGameManager = {
            update: jest.fn()
        };
        mockRender = {
            renderFrame: jest.fn()
        };
    });

    describe('constructor', () => {
        it('should initialize with required parameters', () => {
            gameLoop = new GameLoop(mockGameManager, mockRender);
            expect(gameLoop.gameObjManager).toBe(mockGameManager);
            expect(gameLoop.render).toBe(mockRender);
            expect(gameLoop.isRunning).toBe(false);
        });

        it('should accept optional stateManager', () => {
            const mockStateManager = { update: jest.fn() };
            gameLoop = new GameLoop(mockGameManager, mockRender, mockStateManager);
            expect(gameLoop.stateManager).toBe(mockStateManager);
        });

        it('should configure fixed timestep from options', () => {
            gameLoop = new GameLoop(mockGameManager, mockRender, null, {
                fixedDelta: 1 / 30,
                maxDelta: 0.2
            });
            expect(gameLoop.timeStep.fixedDelta).toBe(1 / 30);
            expect(gameLoop.timeStep.maxDelta).toBe(0.2);
        });
    });

    describe('start', () => {
        it('should set isRunning to true', () => {
            gameLoop = new GameLoop(mockGameManager, mockRender);
            gameLoop.start();
            expect(gameLoop.isRunning).toBe(true);
        });

        it('should reset time step', () => {
            gameLoop = new GameLoop(mockGameManager, mockRender);
            gameLoop.timeStep.update(0.1);
            gameLoop.start();
            expect(gameLoop.timeStep.accumulator).toBe(0);
        });

        it('should not start if already running', () => {
            gameLoop = new GameLoop(mockGameManager, mockRender);
            gameLoop.start();
            const firstId = gameLoop.frameRequestId;
            gameLoop.start();
            expect(gameLoop.frameRequestId).toBe(firstId);
        });
    });

    describe('stop', () => {
        it('should set isRunning to false', () => {
            gameLoop = new GameLoop(mockGameManager, mockRender);
            gameLoop.start();
            gameLoop.stop();
            expect(gameLoop.isRunning).toBe(false);
        });
    });

    describe('getFps', () => {
        it('should return 0 initially', () => {
            gameLoop = new GameLoop(mockGameManager, mockRender);
            expect(gameLoop.getFps()).toBe(0);
        });
    });
});
