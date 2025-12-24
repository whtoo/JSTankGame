/**
 * GameConfig - Centralized game configuration
 * Extracts magic numbers and settings into a single config file
 */

// Frame rate configuration
export const FPS_CONFIG = {
    target: 60,
    minDeltaTime: 1000 / 60,
    maxDeltaTime: 1000 / 30 // Cap to prevent spiral of death
};

// Player configuration
export const PLAYER_CONFIG = {
    speed: 0.05, // tiles per frame
    bulletSpeed: 0.3, // tiles per frame
    maxBullets: 1,
    maxPowerLevel: 3,
    startLives: 3,
    respawnDelay: 2000 // ms
};

// Bullet configuration
export const BULLET_CONFIG = {
    baseSize: 6,
    sizePerPower: 2,
    maxPower: 3,
    powerThreshold2: 2, // Power level for 2 bullets
    powerThreshold3: 3  // Power level for max bullets
};

// Canvas dimensions
export const CANVAS_CONFIG = {
    width: 800,
    height: 500,
    backgroundColor: '#000000'
};

// Tile configuration (matches MapConfig)
export const TILE_CONFIG = {
    renderSize: 33,
    sourceSize: 32,
    tilesPerRow: 24
};

// Game settings
export const GAME_CONFIG = {
    autoStart: true,
    showFps: true,
    debugMode: false
};

// Input configuration
export const INPUT_CONFIG = {
    // Key mappings can be customized here
    keyMap: {
        up: ['w', 'W', 'ArrowUp'],
        down: ['s', 'S', 'ArrowDown'],
        left: ['a', 'A', 'ArrowLeft'],
        right: ['d', 'D', 'ArrowRight'],
        fire: [' ', 'Enter'], // Space or Enter
        pause: ['p', 'P', 'Escape'],
        menu: ['Escape']
    }
};

/**
 * Get full game configuration
 */
export function getGameConfig() {
    return {
        fps: FPS_CONFIG,
        player: PLAYER_CONFIG,
        bullet: BULLET_CONFIG,
        canvas: CANVAS_CONFIG,
        tile: TILE_CONFIG,
        game: GAME_CONFIG,
        input: INPUT_CONFIG
    };
}

/**
 * Validate configuration
 */
export function validateConfig() {
    const errors = [];

    if (FPS_CONFIG.target <= 0) {
        errors.push('FPS target must be positive');
    }
    if (PLAYER_CONFIG.speed <= 0) {
        errors.push('Player speed must be positive');
    }
    if (CANVAS_CONFIG.width <= 0 || CANVAS_CONFIG.height <= 0) {
        errors.push('Canvas dimensions must be positive');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
