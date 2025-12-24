/**
 * FixedTimeStep - Fixed timestep accumulator for game loop
 * Ensures consistent game logic updates regardless of frame rate
 */
export class FixedTimeStep {
    /**
     * @param {number} fixedDelta - Fixed timestep in seconds (default: 1/60)
     * @param {number} maxDelta - Maximum delta to prevent spiral of death
     */
    constructor(fixedDelta = 1 / 60, maxDelta = 0.1) {
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
    reset() {
        this.accumulator = 0;
        this.frameCount = 0;
        this.totalTime = 0;
    }

    /**
     * Update accumulator with current frame time
     * @param {number} deltaTime - Time since last frame in seconds
     * @returns {number} - The fixed timestep to use for updates
     */
    update(deltaTime) {
        // Cap delta to prevent spiral of death
        const cappedDelta = Math.min(deltaTime, this.maxDelta);

        this.accumulator += cappedDelta;
        this.totalTime += cappedDelta;
        this.currentTime += cappedDelta;

        return this.fixedDelta;
    }

    /**
     * Check if we should perform a fixed update
     * @returns {boolean}
     */
    shouldUpdate() {
        return this.accumulator >= this.fixedDelta - this.epsilon;
    }

    /**
     * Consume fixed timesteps from accumulator
     * @returns {number} - Number of updates to perform
     */
    consume() {
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
     * @returns {number}
     */
    getCurrentFps() {
        return this.totalTime > 0 ? this.frameCount / this.totalTime : 0;
    }

    /**
     * Get remaining accumulator value (for interpolation)
     * @returns {number}
     */
    getRemaining() {
        return this.accumulator;
    }

    /**
     * Get alpha for interpolation (0-1)
     * @returns {number}
     */
    getAlpha() {
        return this.fixedDelta > 0 ? this.accumulator / this.fixedDelta : 0;
    }
}

/**
 * Enhanced GameLoop with fixed timestep
 */
export class GameLoop {
    /**
     * @param {GameObjManager} gameObjManager - Game object manager
     * @param {Render} render - Rendering engine
     * @param {StateManager} stateManager - Game state manager (optional)
     * @param {Object} options - Loop options
     */
    constructor(gameObjManager, render, stateManager = null, options = {}) {
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
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.timeStep.reset();
        this.frameRequestId = this._requestAnimFrame()(this.tick);
    }

    /**
     * Stops the game loop
     */
    stop() {
        this.isRunning = false;
        if (this.frameRequestId) {
            cancelAnimationFrame(this.frameRequestId);
            this.frameRequestId = null;
        }
    }

    /**
     * Main game loop tick
     * @param {number} currentTime - Current timestamp from requestAnimationFrame
     */
    tick(currentTime) {
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

    _requestAnimFrame() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            ((cb) => setTimeout(cb, 1000 / 60));
    }

    /**
     * Get current FPS
     */
    getFps() {
        return this.timeStep.getCurrentFps();
    }
}
