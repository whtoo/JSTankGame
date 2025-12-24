/**
 * Level Configuration Schema
 *
 * Defines the JSON structure for level data, inspired by NES Battle City (1985).
 *
 * Level JSON Schema:
 * {
 *   "id": 1,                    // Level number
 *   "name": "Level 1",          // Display name
 *   "difficulty": "easy",       // easy, normal, hard, expert
 *   "grid": [[]],               // 2D array of tile IDs
 *   "playerStart": {            // Player spawn position (grid coordinates)
 *     "x": 12,
 *     "y": 12,
 *     "direction": "w"          // w=up, s=down, a=left, d=right
 *   },
 *   "basePosition": {           // Eagle/briefcase position
 *     "x": 12,
 *     "y": 0
 *   },
 *   "enemies": {                // Enemy spawn configuration
 *     "total": 20,              // Total enemies to spawn
 *     "maxOnField": 4,          // Max enemies simultaneously
 *     "spawnPoints": [          // Spawn locations (grid coords)
 *       {"x": 0, "y": 0},
 *       {"x": 12, "y": 0},
 *       {"x": 24, "y": 0}
 *     ],
 *     "types": [                // Enemy types and weights
 *       {"type": "basic", "weight": 60},
 *       {"type": "fast", "weight": 25},
 *       {"type": "power", "weight": 15}
 *     ],
 *     "spawnInterval": 3.0      // Seconds between spawns
 *   },
 *   "timeLimit": 120,           // Time limit in seconds (0 = no limit)
 *   "powerups": [               // Power-up spawn configuration
 *     {"type": "helmet", "chance": 5},
 *     {"type": "star", "chance": 5},
 *     {"type": "tank", "chance": 3}
 *   ],
 *   "backgroundMusic": "battle", // Music theme
 *   "specialFeatures": {        // Special level features
 *     "hasBridges": false,
 *     "hasFortress": true,
 *     "destroyableWalls": true
 *   }
 * }
 *
 * Tile ID Reference:
 * 0 = empty
 * 55 = brick (destroyable)
 * 60 = steel (indestructible)
 * 74 = water (impassable)
 * 78 = grass (hides tanks)
 * 100 = ice (slippery)
 * 102 = base/eagle
 */

// Level tile types
export const TileType = {
    EMPTY: 0,
    BRICK: 55,      // Destroyable
    STEEL: 60,      // Indestructible
    WATER: 74,      // Impassable
    GRASS: 78,      // Concealing
    ICE: 100,       // Slippery
    BASE: 102       // Eagle/Briefcase
};

// Enemy tank types
export const EnemyType = {
    BASIC: 'basic',     // Normal tank
    FAST: 'fast',       // Speed: 2x, Armor: weak
    POWER: 'power',     // Speed: slow, Armor: strong
    ARMOR: 'armor',     // Heavy armor
    SHOOTER: 'shooter'  // Fast fire rate
};

// Level difficulty presets
export const Difficulty = {
    EASY: 'easy',
    NORMAL: 'normal',
    HARD: 'hard',
    EXPERT: 'expert'
};

// Power-up types
export const PowerUpType = {
    HELMET: 'helmet',   // Temporary invincibility
    STAR: 'star',       // Upgrade weapon
    TANK: 'tank',       // Extra life
    SHOVEL: 'shovel',   // Steel walls around base
    CLOCK: 'clock',     // Stop enemies
    GRENADE: 'grenade', // Destroy all enemies
    MEDAL: 'medal'      // Power-up all tanks temporarily
};

// Default level settings
export const DEFAULT_LEVEL_CONFIG = {
    enemies: {
        total: 20,
        maxOnField: 4,
        spawnInterval: 3.0
    },
    timeLimit: 0,
    backgroundMusic: 'battle',
    specialFeatures: {
        hasBridges: false,
        hasFortress: true,
        destroyableWalls: true
    }
};

/**
 * Get tile type from tile ID
 * @param {number} tileId - Tile ID from map
 * @returns {string} Tile type name
 */
export function getTileType(tileId) {
    const types = {
        [TileType.EMPTY]: 'empty',
        [TileType.BRICK]: 'brick',
        [TileType.STEEL]: 'steel',
        [TileType.WATER]: 'water',
        [TileType.GRASS]: 'grass',
        [TileType.ICE]: 'ice',
        [TileType.BASE]: 'base'
    };
    return types[tileId] || 'unknown';
}

/**
 * Check if tile is passable
 * @param {number} tileId - Tile ID
 * @returns {boolean} True if tanks can pass
 */
export function isTilePassable(tileId) {
    const impassable = [TileType.BRICK, TileType.STEEL, TileType.WATER, TileType.BASE];
    return !impassable.includes(tileId);
}

/**
 * Check if tile is destructible
 * @param {number} tileId - Tile ID
 * @returns {boolean} True if tile can be destroyed
 */
export function isTileDestructible(tileId) {
    return tileId === TileType.BRICK;
}

/**
 * Check if tile provides concealment
 * @param {number} tileId - Tile ID
 * @returns {boolean} True if tile hides tanks
 */
export function isTileConcealing(tileId) {
    return tileId === TileType.GRASS;
}
