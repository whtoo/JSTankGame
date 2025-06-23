/**
 * @author whtoo
 * @create_date 2013-11-20
 * @revise_date 2021-04-13 (Further revised for modularization)
 */

// This file is now just an entry point that delegates to main.js
// All class definitions and old setup logic have been moved to src/main.js and other modules.

import { setupGame } from './main.js';

// Initialize the game by calling the setup function from main.js
setupGame();

// Note: The original extreem-engine.js was the direct entry point for Webpack.
// It used to contain all the game code. Now, it serves to launch the modularized code in main.js.
// No export is needed from this file as it's the top-level entry script for the bundle.
// The actual game logic and any necessary exports are handled within main.js and the modules it imports.
