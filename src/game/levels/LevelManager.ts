/**
 * LevelManager - Manages level loading and progression
 */

import levelsData from './levels.json';
import type { LevelConfig, Direction, EnemyType } from '../../types/index.js';
import { DEFAULT_LEVEL_CONFIG, TileType } from './LevelConfig.js';

// The imported levelsData is already parsed by Vite
const levelsDataParsed = levelsData as { levels: LevelConfig[]; meta: any };

interface LevelManagerOptions {
    startLevel?: number;
    loopLevels?: boolean;
    onLevelStart?: (level: LevelConfig) => void;
    onLevelComplete?: (data: { level: number; stars: number }) => void;
    onGameOver?: (data: { victory: boolean; finalLevel: number }) => void;
}

interface LevelInfo {
    id: number;
    name: string;
    difficulty: string;
    enemyCount: number;
    timeLimit: number;
}

export class LevelManager {
    levels: LevelConfig[];
    meta: { totalLevels: number; version: string; basedOn: string };
    currentLevelIndex: number;
    currentLevel: LevelConfig | null;
    isLevelComplete: boolean;
    isGameOver: boolean;

    // Options
    startLevel: number;
    loopLevels: boolean;

    // Event callbacks
    onLevelStart: ((level: LevelConfig) => void) | null;
    onLevelComplete: ((data: { level: number; stars: number }) => void) | null;
    onGameOver: ((data: { victory: boolean; finalLevel: number }) => void) | null;

    constructor(options: LevelManagerOptions = {}) {
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
     */
    getTotalLevels(): number {
        return this.levels.length;
    }

    /**
     * Get current level number (1-indexed)
     */
    getCurrentLevelNumber(): number {
        return this.currentLevelIndex + 1;
    }

    /**
     * Load a specific level
     */
    loadLevel(levelNum: number): LevelConfig | null {
        if (levelNum < 1 || levelNum > this.levels.length) {
            console.warn(`Level ${levelNum} does not exist`);
            return null;
        }

        this.currentLevelIndex = levelNum - 1;
        this.currentLevel = this._createLevelData(this.levels[this.currentLevelIndex]);
        this.isLevelComplete = false;

        // Notify level start
        if (this.onLevelStart && this.currentLevel) {
            this.onLevelStart(this.currentLevel);
        }

        return this.currentLevel;
    }

    /**
     * Load next level
     */
    loadNextLevel(): LevelConfig | null {
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
     */
    getCurrentLevel(): LevelConfig | null {
        return this.currentLevel;
    }

    /**
     * Get the map grid
     */
    getMapGrid(): number[][] | null {
        return this.currentLevel ? this.currentLevel.grid : null;
    }

    /**
     * Get tile at position
     */
    getTileAt(x: number, y: number): number {
        if (!this.currentLevel || !this.currentLevel.grid) return TileType.EMPTY;
        if (y < 0 || y >= this.currentLevel.grid.length) return TileType.EMPTY;
        if (x < 0 || x >= this.currentLevel.grid[y].length) return TileType.EMPTY;
        return this.currentLevel.grid[y][x];
    }

    /**
     * Set tile at position
     */
    setTileAt(x: number, y: number, tileId: number): void {
        if (this.currentLevel && this.currentLevel.grid) {
            if (y >= 0 && y < this.currentLevel.grid.length &&
                x >= 0 && x < this.currentLevel.grid[y].length) {
                this.currentLevel.grid[y][x] = tileId;
            }
        }
    }

    /**
     * Get player start position
     */
    getPlayerStart(): { x: number; y: number; direction: Direction } | null {
        return this.currentLevel ? this.currentLevel.playerStart : null;
    }

    /**
     * Get base position
     */
    getBasePosition(): { x: number; y: number } | null {
        return this.currentLevel ? this.currentLevel.basePosition : null;
    }

    /**
     * Get enemy spawn points
     */
    getEnemySpawnPoints(): Array<{ x: number; y: number }> | null {
        return this.currentLevel ? this.currentLevel.enemies.spawnPoints : null;
    }

    /**
     * Get enemy configuration
     */
    getEnemyConfig(): LevelConfig['enemies'] | null {
        return this.currentLevel ? this.currentLevel.enemies : null;
    }

    /**
     * Get total enemies for current level
     */
    getTotalEnemies(): number {
        return this.currentLevel ? this.currentLevel.enemies.total : 0;
    }

    /**
     * Get max enemies on field
     */
    getMaxEnemiesOnField(): number {
        return this.currentLevel ? this.currentLevel.enemies.maxOnField : 4;
    }

    /**
     * Get spawn interval
     */
    getSpawnInterval(): number {
        return this.currentLevel ? this.currentLevel.enemies.spawnInterval : 3.0;
    }

    /**
     * Get time limit
     */
    getTimeLimit(): number {
        return this.currentLevel ? this.currentLevel.timeLimit : 0;
    }

    /**
     * Get level difficulty
     */
    getDifficulty(): string {
        return this.currentLevel ? this.currentLevel.difficulty : 'normal';
    }

    /**
     * Check if base/eagle is protected
     */
    hasFortress(): boolean {
        return this.currentLevel ? this.currentLevel.specialFeatures.hasFortress : true;
    }

    /**
     * Complete current level
     */
    completeLevel(): void {
        this.isLevelComplete = true;
        if (this.onLevelComplete) {
            this.onLevelComplete({
                level: this.getCurrentLevelNumber(),
                stars: this.calculateStars()
            });
        }
    }

    /**
     * Calculate stars earned for current level
     */
    calculateStars(): number {
        // Placeholder - should be calculated based on time, enemies killed, etc.
        return 3;
    }

    /**
     * Get power-up configuration
     */
    getPowerUpConfig(): LevelConfig['powerups'] | null {
        return this.currentLevel ? this.currentLevel.powerups : null;
    }

    /**
     * Select a random enemy type based on weights
     */
    selectRandomEnemyType(): EnemyType {
        if (!this.currentLevel || !this.currentLevel.enemies.types) {
            return 'basic';
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
    reset(): void {
        this.loadLevel(1);
        this.isGameOver = false;
    }

    /**
     * Internal method to create enriched level data
     */
    _createLevelData(levelTemplate: LevelConfig): LevelConfig {
        return {
            ...DEFAULT_LEVEL_CONFIG,
            ...levelTemplate,
            grid: levelTemplate.grid,
            id: levelTemplate.id,
            name: levelTemplate.name,
            difficulty: levelTemplate.difficulty,
            playerStart: levelTemplate.playerStart,
            basePosition: levelTemplate.basePosition,
            enemies: {
                ...DEFAULT_LEVEL_CONFIG.enemies,
                ...levelTemplate.enemies
            },
            specialFeatures: {
                ...DEFAULT_LEVEL_CONFIG.specialFeatures,
                ...levelTemplate.specialFeatures
            }
        } as LevelConfig;
    }

    /**
     * Get level by number
     */
    getLevelByNumber(levelNum: number): LevelConfig | null {
        if (levelNum < 1 || levelNum > this.levels.length) return null;
        return this.levels[levelNum - 1];
    }

    /**
     * Check if there's a next level
     */
    hasNextLevel(): boolean {
        return this.currentLevelIndex < this.levels.length - 1;
    }

    /**
     * Get all level metadata
     */
    getAllLevelInfo(): LevelInfo[] {
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
