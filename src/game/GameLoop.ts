/**
 * FixedTimeStep - Fixed timestep accumulator for game loop
 * Ensures consistent game logic updates regardless of frame rate
 */

export class FixedTimeStep {
    fixedDelta: number;
    maxDelta: number;
    accumulator: number;
    currentTime: number;
    frameCount: number;
    totalTime: number;
    epsilon: number;

    constructor(fixedDelta: number = 1 / 60, maxDelta: number = 0.1) {
        this.fixedDelta = fixedDelta;  // Fixed timestep (e.g., 60 updates per second)
        this.maxDelta = maxDelta;      // Cap for variable delta
        this.accumulator = 0;
        this.currentTime = 0;
        this.frameCount = 0;
        this.totalTime = 0;
        this.epsilon = 1e-10; // Small value to handle floating point precision
    }

    /**
     * Reset the accumulator
     */
    reset(): void {
        this.accumulator = 0;
        this.frameCount = 0;
        this.totalTime = 0;
    }

    /**
     * Update accumulator with current frame time
     */
    update(deltaTime: number): number {
        // Cap delta to prevent spiral of death
        const cappedDelta = Math.min(deltaTime, this.maxDelta);

        this.accumulator += cappedDelta;
        this.totalTime += cappedDelta;
        this.currentTime += cappedDelta;

        return this.fixedDelta;
    }

    /**
     * Check if we should perform a fixed update
     */
    shouldUpdate(): boolean {
        return this.accumulator >= this.fixedDelta - this.epsilon;
    }

    /**
     * Consume fixed timesteps from accumulator
     */
    consume(): number {
        let count = 0;
        const threshold = this.fixedDelta - this.epsilon;
        while (this.accumulator >= threshold) {
            this.accumulator -= this.fixedDelta;
            count++;
            this.frameCount++;
        }
        // Clamp tiny negative values to zero
        if (this.accumulator < this.epsilon && this.accumulator > -this.epsilon) {
            this.accumulator = 0;
        }
        return count;
    }

    /**
     * Get current FPS based on fixed timestep
     */
    getCurrentFps(): number {
        return this.totalTime > 0 ? this.frameCount / this.totalTime : 0;
    }

    /**
     * Get remaining accumulator value (for interpolation)
     */
    getRemaining(): number {
        return this.accumulator;
    }

    /**
     * Get alpha for interpolation (0-1)
     */
    getAlpha(): number {
        return this.fixedDelta > 0 ? this.accumulator / this.fixedDelta : 0;
    }
}

/**
 * Enhanced GameLoop with fixed timestep
 */

interface GameLoopOptions {
    fixedDelta?: number;
    maxDelta?: number;
    interpolate?: boolean;
}

export class GameLoop {
    gameObjManager: any; // TODO: Add proper type
    render: any; // TODO: Add proper type
    stateManager: any; // TODO: Add proper type
    isRunning: boolean;
    lastTime: number;
    frameRequestId: number | null;
    timeStep: FixedTimeStep;
    interpolate: boolean;

    constructor(gameObjManager: any, render: any, stateManager: any = null, options: GameLoopOptions = {}) {
        this.gameObjManager = gameObjManager;
        this.render = render;
        this.stateManager = stateManager;
        this.isRunning = false;
        this.lastTime = 0;
        this.frameRequestId = null;

        // Fixed timestep configuration
        const {
            fixedDelta = 1 / 60,
            maxDelta = 0.1,
            interpolate = true
        } = options;

        this.timeStep = new FixedTimeStep(fixedDelta, maxDelta);
        this.interpolate = interpolate;

        // Bind methods
        this.tick = this.tick.bind(this);
    }

    /**
     * Starts the game loop
     */
    start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.timeStep.reset();
        this.frameRequestId = this._requestAnimFrame()(this.tick);
    }

    /**
     * Stops the game loop
     */
    stop(): void {
        this.isRunning = false;
        if (this.frameRequestId) {
            cancelAnimationFrame(this.frameRequestId);
            this.frameRequestId = null;
        }
    }

    /**
     * Main game loop tick
     */
    tick(currentTime: number): void {
        if (!this.isRunning) return;

        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        // Update time accumulator
        this.timeStep.update(deltaTime);

        // Update state manager
        if (this.stateManager) {
            this.stateManager.update(this.timeStep.fixedDelta);
        }

        // Perform fixed updates
        const updateCount = this.timeStep.consume();
        if (updateCount > 0) {
            // Only update game logic when in playing state
            const shouldUpdate = !this.stateManager ||
                this.stateManager.currentState?.constructor.name === 'PlayingState';

            if (shouldUpdate) {
                // Run multiple fixed updates if needed
                for (let i = 0; i < updateCount; i++) {
                    this.gameObjManager.update(this.timeStep.fixedDelta);
                }
            }
        }

        // Calculate interpolation alpha
        const alpha = this.interpolate ? this.timeStep.getAlpha() : 1;

        // Render with interpolation
        this.render.renderFrame(alpha);

        // Schedule next frame
        this.frameRequestId = this._requestAnimFrame()(this.tick);
    }

    _requestAnimFrame(): (callback: FrameRequestCallback) => number {
        return window.requestAnimationFrame ||
            (window as any).webkitRequestAnimationFrame ||
            (window as any).mozRequestAnimationFrame ||
            (window as any).oRequestAnimationFrame ||
            (window as any).msRequestAnimationFrame ||
            ((cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 1000 / 60));
    }

    /**
     * Get current FPS
     */
    getFps(): number {
        return this.timeStep.getCurrentFps();
    }
}
