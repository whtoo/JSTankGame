import { GameObjManager } from './managers/GameObjManager.js';
import { Render } from './rendering/Render.js';
import { APWatcher } from './input/APWatcher.js';
// CSS import, assuming Webpack handles this (e.g., with style-loader/css-loader)
import '../css/main.css';

// The main game setup and initialization function
export function setupGame() {
    // Ensure the DOM is fully loaded before trying to get canvas or attach body listeners
    window.addEventListener('load', eventWindowLoaded, false);
}

function eventWindowLoaded() {
    // canvasApp sets up the core game components
    canvasApp();
}

function canvasSupport() {
    // Modern browsers all support canvas, so this check is mostly legacy.
    // Could add more robust feature detection if needed.
    return !!document.createElement('canvas').getContext;
}

function canvasApp() {
    if (!canvasSupport()) {
        console.error("HTML5 Canvas is not supported in this browser.");
        // Optionally, display a message to the user in the DOM
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

    // Instantiate game components
    const gameManager = new GameObjManager();
    // Render instance needs the main canvas context and a reference to the game manager
    const render = new Render(context, gameManager);
    // APWatcher needs a reference to the game manager to update its command object
    const apWatcher = new APWatcher(gameManager); // apWatcher sets up its own event listeners

    // Game is now initialized. Render loop is started within Render's constructor (initGameLoop).
    // Input listeners are active via APWatcher.
    // Game objects are managed by GameObjManager.

    // console.log("Game setup complete. APWatcher, GameManager, and Render initialized.");
}

// Call setupGame to kick things off
setupGame();

// Note: The original extreem-engine.js also had an export default setupGame.
// If this module (main.js) is the new entry point for Webpack,
// then just calling setupGame() might be sufficient, and no export is strictly needed
// unless other parts of a larger system were intended to call setupGame() again.
// For now, keeping the export signature similar if it was intended.
// However, typically, an entry point module executes its setup code directly.
// If setupGame is exported, then another file (the actual webpack entry) would import and call it.
// Given the current structure, direct execution by calling setupGame() here is fine.
// Removing the export if this is the final entry point.
// Let's assume this will be the main entry point for Webpack for now.
// export default setupGame; // Remove if this is the direct entry for webpack.
// If webpack.config.js points to this file, the `setupGame()` call is enough.
