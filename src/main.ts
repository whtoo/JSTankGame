/**
 * Main game initialization and setup
 */

import { GameObjManager } from './managers/GameObjManager.js';
import { Render } from './rendering/Render.js';
import { APWatcher } from './input/APWatcher.js';
import { GameLoop } from './game/GameLoop.js';
import { StateManager } from './game/GameState.js';
import { setLogLevel, LogLevel } from './utils/Logger.js';
import { GAME_CONFIG } from './game/GameConfig.js';
import { getTileMapLoader } from './game/TileMapLoader.js';
import { TileLevelManager } from './game/levels/TileLevelManager.js';
import '../css/main.css';

// Configure logging
if (!GAME_CONFIG.debugMode) {
    setLogLevel(LogLevel.WARN);
}

// The main game setup and initialization function
export function setupGame(): void {
    window.addEventListener('load', eventWindowLoaded, false);
}

function eventWindowLoaded(): void {
    canvasApp();
}

function canvasSupport(): boolean {
    return !!document.createElement('canvas').getContext;
}

async function canvasApp(): Promise<void> {
    if (!canvasSupport()) {
        console.error("HTML5 Canvas is not supported in this browser.");
        return;
    }

    const theCanvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (!theCanvas) {
        console.error("Canvas element with ID 'canvas' not found in the DOM!");
        return;
    }

    const context = theCanvas.getContext("2d");
    if (!context) {
        console.error("Failed to get 2D rendering context for the canvas.");
        return;
    }

    // Instantiate level manager
    const tileLevelManager = new TileLevelManager({
        startLevel: 1,
        loopLevels: false,
        onLevelStart: (level) => {
            console.log(`Starting level ${level.id}: ${level.name}`);
        },
        onLevelComplete: (result) => {
            console.log(`Level ${result.level} completed! Stars: ${result.stars}`);
        },
        onGameOver: (result) => {
            console.log(result.victory ? "Victory!" : "Game Over");
        }
    });

    // Instantiate game components
    const tileMapLoader = getTileMapLoader();
    
    // Load map data FIRST (before creating Render)
    await tileMapLoader.loadLevel('level1.json', 'tileset_full.json');
    
    const gameManager = new GameObjManager({ levelManager: tileLevelManager });
    const render = new Render(context, gameManager, {
        levelManager: tileLevelManager,
        tileMapLoader: tileMapLoader
    });
    // Initialize input watcher (handles keyboard events internally)
    new APWatcher(gameManager);

    // Initialize animations from JSON config
    await gameManager.initAnimations();

    // Initialize TileLevelManager
    await tileLevelManager.init();

    // Create state manager
    const stateManager = new StateManager();

    // Create and start the game loop
    const gameLoop = new GameLoop(gameManager, render, stateManager, {
        fixedDelta: 1 / 60,
        maxDelta: 0.1,
        interpolate: true
    });

    // Setup level change handler to refresh render cache
    const originalOnLevelStart = tileLevelManager.onLevelStart?.bind(tileLevelManager);
    if (originalOnLevelStart) {
        tileLevelManager.onLevelStart = (level) => {
            originalOnLevelStart(level);
            render.refreshMapCache();
        };
    }

    // Start game
    if (GAME_CONFIG.autoStart) {
        stateManager.startGame();
    } else {
        stateManager.toMenu();
    }

    gameLoop.start();

    // Expose for debugging
    if (GAME_CONFIG.debugMode) {
        (window as any).gameLevelManager = tileLevelManager;
        (window as any).gameManager = gameManager;
        (window as any).gameLoop = gameLoop;
    }
}

setupGame();
