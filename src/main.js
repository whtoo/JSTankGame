import { GameObjManager } from './managers/GameObjManager.js';
import { Render } from './rendering/Render.js';
import { APWatcher } from './input/APWatcher.js';
import { GameLoop } from './game/GameLoop.js';
import { StateManager, GameStateType } from './game/GameState.js';
import { LevelManager } from './game/levels/LevelManager.js';
import { setLogLevel, LogLevel } from './utils/Logger.js';
import { GAME_CONFIG } from './game/GameConfig.js';
import '../css/main.css';

// Configure logging
if (!GAME_CONFIG.debugMode) {
    setLogLevel(LogLevel.WARN); // Only show warnings and errors in production
}

// The main game setup and initialization function
export function setupGame() {
    window.addEventListener('load', eventWindowLoaded, false);
}

function eventWindowLoaded() {
    canvasApp();
}

function canvasSupport() {
    return !!document.createElement('canvas').getContext;
}

function canvasApp() {
    if (!canvasSupport()) {
        console.error("HTML5 Canvas is not supported in this browser.");
        return;
    }

    const theCanvas = document.getElementById("canvas");
    if (!theCanvas) {
        console.error("Canvas element with ID 'canvas' not found in the DOM!");
        return;
    }

    const context = theCanvas.getContext("2d");
    if (!context) {
        console.error("Failed to get 2D rendering context for the canvas.");
        return;
    }

    // Instantiate level manager (loads level 1 by default)
    const levelManager = new LevelManager({
        startLevel: 1,
        loopLevels: false,
        onLevelStart: (level) => {
            console.log(`Starting level ${level.id}: ${level.name}`);
            // Refresh render cache when level changes
            // This will be handled by the render component
        },
        onLevelComplete: (result) => {
            console.log(`Level ${result.level} completed! Stars: ${result.stars}`);
            // TODO: Show level complete screen
        },
        onGameOver: (result) => {
            console.log(result.victory ? "Victory!" : "Game Over");
            // TODO: Show game over screen
        }
    });

    // Instantiate game components with level manager
    const gameManager = new GameObjManager({ levelManager });
    const render = new Render(context, gameManager, { levelManager });
    const apWatcher = new APWatcher(gameManager);

    // Create state manager
    const stateManager = new StateManager();

    // Create and start the game loop with fixed timestep
    const gameLoop = new GameLoop(gameManager, render, stateManager, {
        fixedDelta: 1 / 60,  // 60 updates per second
        maxDelta: 0.1,       // Cap for lag spikes
        interpolate: true    // Enable frame interpolation
    });

    // Setup input handlers for state transitions
    setupStateInputHandlers(apWatcher, stateManager, levelManager);

    // Setup level change handler to refresh render cache
    if (levelManager.onLevelStart) {
        const originalOnLevelStart = levelManager.onLevelStart.bind(levelManager);
        levelManager.onLevelStart = (level) => {
            originalOnLevelStart(level);
            render.refreshMapCache();
        };
    }

    // Start game in playing state (or menu based on config)
    if (GAME_CONFIG.autoStart) {
        stateManager.startGame();
    } else {
        stateManager.toMenu();
    }

    gameLoop.start();

    // Expose level manager for debugging
    if (GAME_CONFIG.debugMode) {
        window.gameLevelManager = levelManager;
        window.gameManager = gameManager;
        window.gameLoop = gameLoop;
    }

    // console.log("Game setup complete.");
}

/**
 * Setup input handlers for state transitions
 */
function setupStateInputHandlers(apWatcher, stateManager, levelManager) {
    // Pause functionality is handled by APWatcher keyup
    // Add additional state transition handlers here if needed
}

setupGame();
