/**
 * LevelManager - Manages level loading and progression
 *
 * Responsibilities:
 * - Load level data from JSON
 * - Track current level
 * - Handle level transitions
 * - Provide level data to game systems
 */
import levelsData from './levels.json';
import {
    DEFAULT_LEVEL_CONFIG,
    TileType,
    EnemyType,
    Difficulty
} from './LevelConfig.js';

export class LevelManager {
    constructor(options = {}) {
        this.levels = levelsData.levels;
        this.meta = levelsData.meta;
        this.currentLevelIndex = 0;
        this.currentLevel = null;
        this.isLevelComplete = false;
        this.isGameOver = false;

        // Options
        this.startLevel = options.startLevel || 1;
        this.loopLevels = options.loopLevels !== undefined ? options.loopLevels : false;

        // Event callbacks
        this.onLevelStart = options.onLevelStart || null;
        this.onLevelComplete = options.onLevelComplete || null;
        this.onGameOver = options.onGameOver || null;

        // Initialize
        if (this.startLevel > 1) {
            this.loadLevel(this.startLevel);
        } else {
            this.loadLevel(1);
        }
    }

    /**
     * Get total number of levels
     * @returns {number}
     */
    getTotalLevels() {
        return this.levels.length;
    }

    /**
     * Get current level number (1-indexed)
     * @returns {number}
     */
    getCurrentLevelNumber() {
        return this.currentLevelIndex + 1;
    }

    /**
     * Load a specific level
     * @param {number} levelNum - Level number (1-indexed)
     * @returns {object|null} Level data or null if invalid
     */
    loadLevel(levelNum) {
        if (levelNum < 1 || levelNum > this.levels.length) {
            console.warn(`Level ${levelNum} does not exist`);
            return null;
        }

        this.currentLevelIndex = levelNum - 1;
        this.currentLevel = this._createLevelData(this.levels[this.currentLevelIndex]);
        this.isLevelComplete = false;

        // Notify level start
        if (this.onLevelStart) {
            this.onLevelStart(this.currentLevel);
        }

        return this.currentLevel;
    }

    /**
     * Load next level
     * @returns {object|null} Next level data or null if no more levels
     */
    loadNextLevel() {
        const nextLevelNum = this.currentLevelIndex + 2; // +1 for 1-indexed, +1 for next
        if (nextLevelNum > this.levels.length) {
            if (this.loopLevels) {
                return this.loadLevel(1);
            }
            // Game complete
            this.isGameOver = true;
            if (this.onGameOver) {
                this.onGameOver({ victory: true, finalLevel: this.getTotalLevels() });
            }
            return null;
        }
        return this.loadLevel(nextLevelNum);
    }

    /**
     * Get current level data
     * @returns {object|null}
     */
    getCurrentLevel() {
        return this.currentLevel;
    }

    /**
     * Get the map grid
     * @returns {number[][]|null}
     */
    getMapGrid() {
        return this.currentLevel ? this.currentLevel.grid : null;
    }

    /**
     * Get tile at position
     * @param {number} x - Grid X
     * @param {number} y - Grid Y
     * @returns {number} Tile ID
     */
    getTileAt(x, y) {
        if (!this.currentLevel || !this.currentLevel.grid) return TileType.EMPTY;
        if (y < 0 || y >= this.currentLevel.grid.length) return TileType.EMPTY;
        if (x < 0 || x >= this.currentLevel.grid[y].length) return TileType.EMPTY;
        return this.currentLevel.grid[y][x];
    }

    /**
     * Set tile at position
     * @param {number} x - Grid X
     * @param {number} y - Grid Y
     * @param {number} tileId - New tile ID
     */
    setTileAt(x, y, tileId) {
        if (this.currentLevel && this.currentLevel.grid) {
            if (y >= 0 && y < this.currentLevel.grid.length &&
                x >= 0 && x < this.currentLevel.grid[y].length) {
                this.currentLevel.grid[y][x] = tileId;
            }
        }
    }

    /**
     * Get player start position
     * @returns {object|null}
     */
    getPlayerStart() {
        return this.currentLevel ? this.currentLevel.playerStart : null;
    }

    /**
     * Get base position
     * @returns {object|null}
     */
    getBasePosition() {
        return this.currentLevel ? this.currentLevel.basePosition : null;
    }

    /**
     * Get enemy spawn points
     * @returns {Array|null}
     */
    getEnemySpawnPoints() {
        return this.currentLevel ? this.currentLevel.enemies.spawnPoints : null;
    }

    /**
     * Get enemy configuration
     * @returns {object|null}
     */
    getEnemyConfig() {
        return this.currentLevel ? this.currentLevel.enemies : null;
    }

    /**
     * Get total enemies for current level
     * @returns {number}
     */
    getTotalEnemies() {
        return this.currentLevel ? this.currentLevel.enemies.total : 0;
    }

    /**
     * Get max enemies on field
     * @returns {number}
     */
    getMaxEnemiesOnField() {
        return this.currentLevel ? this.currentLevel.enemies.maxOnField : 4;
    }

    /**
     * Get spawn interval
     * @returns {number}
     */
    getSpawnInterval() {
        return this.currentLevel ? this.currentLevel.enemies.spawnInterval : 3.0;
    }

    /**
     * Get time limit
     * @returns {number} Time limit in seconds (0 = no limit)
     */
    getTimeLimit() {
        return this.currentLevel ? this.currentLevel.timeLimit : 0;
    }

    /**
     * Get level difficulty
     * @returns {string}
     */
    getDifficulty() {
        return this.currentLevel ? this.currentLevel.difficulty : Difficulty.NORMAL;
    }

    /**
     * Check if base/eagle is protected
     * @returns {boolean}
     */
    hasFortress() {
        return this.currentLevel ? this.currentLevel.specialFeatures.hasFortress : true;
    }

    /**
     * Complete current level
     */
    completeLevel() {
        this.isLevelComplete = true;
        if (this.onLevelComplete) {
            this.onLevelComplete({
                level: this.getCurrentLevelNumber(),
                stars: this.calculateStars()
            });
        }
    }

    /**
     * Calculate stars earned for current level (to be implemented with actual game data)
     * @returns {number} 1-3 stars
     */
    calculateStars() {
        // Placeholder - should be calculated based on time, enemies killed, etc.
        return 3;
    }

    /**
     * Get power-up configuration
     * @returns {Array|null}
     */
    getPowerUpConfig() {
        return this.currentLevel ? this.currentLevel.powerups : null;
    }

    /**
     * Select a random enemy type based on weights
     * @returns {string} Enemy type
     */
    selectRandomEnemyType() {
        if (!this.currentLevel || !this.currentLevel.enemies.types) {
            return EnemyType.BASIC;
        }

        const types = this.currentLevel.enemies.types;
        const totalWeight = types.reduce((sum, t) => sum + t.weight, 0);
        let random = Math.random() * totalWeight;

        for (const type of types) {
            random -= type.weight;
            if (random <= 0) {
                return type.type;
            }
        }

        return types[types.length - 1].type;
    }

    /**
     * Reset to first level
     */
    reset() {
        this.loadLevel(1);
        this.isGameOver = false;
    }

    /**
     * Internal method to create enriched level data
     * @private
     */
    _createLevelData(levelTemplate) {
        return {
            ...DEFAULT_LEVEL_CONFIG,
            ...levelTemplate,
            enemies: {
                ...DEFAULT_LEVEL_CONFIG.enemies,
                ...levelTemplate.enemies
            },
            specialFeatures: {
                ...DEFAULT_LEVEL_CONFIG.specialFeatures,
                ...levelTemplate.specialFeatures
            }
        };
    }

    /**
     * Get level by number
     * @param {number} levelNum
     * @returns {object|null}
     */
    getLevelByNumber(levelNum) {
        if (levelNum < 1 || levelNum > this.levels.length) return null;
        return this.levels[levelNum - 1];
    }

    /**
     * Check if there's a next level
     * @returns {boolean}
     */
    hasNextLevel() {
        return this.currentLevelIndex < this.levels.length - 1;
    }

    /**
     * Get all level metadata
     * @returns {Array}
     */
    getAllLevelInfo() {
        return this.levels.map(l => ({
            id: l.id,
            name: l.name,
            difficulty: l.difficulty,
            enemyCount: l.enemies.total,
            timeLimit: l.timeLimit
        }));
    }
}

export default LevelManager;
