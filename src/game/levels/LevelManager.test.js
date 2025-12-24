/**
 * Tests for LevelManager module
 */
import { LevelManager } from './LevelManager.js';
import {
    TileType,
    EnemyType,
    Difficulty
} from './LevelConfig.js';

describe('LevelManager', () => {
    let levelManager;

    beforeEach(() => {
        levelManager = new LevelManager({ startLevel: 1 });
    });

    afterEach(() => {
        // Clean up
    });

    describe('constructor', () => {
        it('should initialize with level 1 loaded', () => {
            expect(levelManager.getCurrentLevelNumber()).toBe(1);
            expect(levelManager.currentLevel).toBeDefined();
        });

        it('should load specified starting level', () => {
            const manager = new LevelManager({ startLevel: 3 });
            expect(manager.getCurrentLevelNumber()).toBe(3);
        });

        it('should have correct total levels', () => {
            expect(levelManager.getTotalLevels()).toBe(5);
        });
    });

    describe('loadLevel', () => {
        it('should load level by number', () => {
            const level = levelManager.loadLevel(2);
            expect(level).toBeDefined();
            expect(level.id).toBe(2);
            expect(levelManager.getCurrentLevelNumber()).toBe(2);
        });

        it('should return null for invalid level', () => {
            const level = levelManager.loadLevel(99);
            expect(level).toBeNull();
        });

        it('should trigger onLevelStart callback', () => {
            const callback = jest.fn();
            const manager = new LevelManager({
                startLevel: 1,
                onLevelStart: callback
            });
            manager.loadLevel(2);
            expect(callback).toHaveBeenCalled();
        });
    });

    describe('loadNextLevel', () => {
        it('should load next level', () => {
            levelManager.loadLevel(1);
            const nextLevel = levelManager.loadNextLevel();
            expect(nextLevel).toBeDefined();
            expect(levelManager.getCurrentLevelNumber()).toBe(2);
        });

        it('should return null when no more levels', () => {
            levelManager.loadLevel(5);
            const nextLevel = levelManager.loadNextLevel();
            expect(nextLevel).toBeNull();
        });

        it('should trigger onGameOver when all levels complete', () => {
            const callback = jest.fn();
            const manager = new LevelManager({
                startLevel: 5,
                onGameOver: callback
            });
            manager.loadNextLevel();
            expect(callback).toHaveBeenCalledWith({ victory: true, finalLevel: 5 });
        });
    });

    describe('getMapGrid', () => {
        it('should return grid data', () => {
            const grid = levelManager.getMapGrid();
            expect(grid).toBeDefined();
            expect(Array.isArray(grid)).toBe(true);
            expect(grid.length).toBeGreaterThan(0);
        });

        it('should have correct dimensions', () => {
            const grid = levelManager.getMapGrid();
            expect(grid.length).toBe(13); // 13 rows
            expect(grid[0].length).toBe(23); // 23 columns
        });
    });

    describe('getTileAt', () => {
        it('should return tile at position', () => {
            const tile = levelManager.getTileAt(0, 0);
            expect(typeof tile).toBe('number');
        });

        it('should return EMPTY for out of bounds', () => {
            expect(levelManager.getTileAt(-1, 0)).toBe(TileType.EMPTY);
            expect(levelManager.getTileAt(0, -1)).toBe(TileType.EMPTY);
        });
    });

    describe('setTileAt', () => {
        it('should modify tile at position', () => {
            const originalTile = levelManager.getTileAt(5, 5);
            levelManager.setTileAt(5, 5, TileType.STEEL);
            expect(levelManager.getTileAt(5, 5)).toBe(TileType.STEEL);

            // Restore original
            levelManager.setTileAt(5, 5, originalTile);
        });
    });

    describe('player and base positions', () => {
        it('should return player start position', () => {
            const start = levelManager.getPlayerStart();
            expect(start).toBeDefined();
            expect(start.x).toBeDefined();
            expect(start.y).toBeDefined();
            expect(start.direction).toBeDefined();
        });

        it('should return base position', () => {
            const base = levelManager.getBasePosition();
            expect(base).toBeDefined();
            expect(base.x).toBe(12);
            expect(base.y).toBe(0);
        });
    });

    describe('enemy configuration', () => {
        it('should return spawn points', () => {
            const spawnPoints = levelManager.getEnemySpawnPoints();
            expect(Array.isArray(spawnPoints)).toBe(true);
            expect(spawnPoints.length).toBeGreaterThan(0);
        });

        it('should return enemy config', () => {
            const config = levelManager.getEnemyConfig();
            expect(config).toBeDefined();
            expect(config.total).toBeGreaterThan(0);
            expect(config.maxOnField).toBeGreaterThan(0);
        });

        it('should return total enemies', () => {
            expect(levelManager.getTotalEnemies()).toBe(16); // Level 1
        });

        it('should return max enemies on field', () => {
            expect(levelManager.getMaxEnemiesOnField()).toBe(4);
        });

        it('should return spawn interval', () => {
            expect(levelManager.getSpawnInterval()).toBe(3.0);
        });
    });

    describe('level properties', () => {
        it('should return difficulty', () => {
            expect(levelManager.getDifficulty()).toBe(Difficulty.EASY);
        });

        it('should return time limit', () => {
            expect(typeof levelManager.getTimeLimit()).toBe('number');
        });

        it('should return fortress status', () => {
            expect(levelManager.hasFortress()).toBe(true);
        });
    });

    describe('selectRandomEnemyType', () => {
        it('should return valid enemy type', () => {
            const type = levelManager.selectRandomEnemyType();
            expect(Object.values(EnemyType)).toContain(type);
        });
    });

    describe('level info', () => {
        it('should return all level info', () => {
            const allInfo = levelManager.getAllLevelInfo();
            expect(allInfo.length).toBe(5);
            expect(allInfo[0].id).toBe(1);
            expect(allInfo[4].id).toBe(5);
        });

        it('should have correct level names', () => {
            const allInfo = levelManager.getAllLevelInfo();
            expect(allInfo[0].name).toBe("The Beginning");
            expect(allInfo[4].name).toBe("The Final Battle");
        });
    });

    describe('reset', () => {
        it('should reset to level 1', () => {
            levelManager.loadLevel(3);
            levelManager.reset();
            expect(levelManager.getCurrentLevelNumber()).toBe(1);
        });
    });

    describe('hasNextLevel', () => {
        it('should return true for level 1', () => {
            expect(levelManager.hasNextLevel()).toBe(true);
        });

        it('should return false for last level', () => {
            levelManager.loadLevel(5);
            expect(levelManager.hasNextLevel()).toBe(false);
        });
    });

    describe('completeLevel', () => {
        it('should trigger onLevelComplete callback', () => {
            const callback = jest.fn();
            const manager = new LevelManager({
                startLevel: 1,
                onLevelComplete: callback
            });
            manager.completeLevel();
            expect(callback).toHaveBeenCalled();
        });
    });
});

describe('LevelConfig', () => {
    describe('TileType', () => {
        it('should have correct values', () => {
            expect(TileType.EMPTY).toBe(0);
            expect(TileType.BRICK).toBe(55);
            expect(TileType.STEEL).toBe(60);
            expect(TileType.WATER).toBe(74);
            expect(TileType.GRASS).toBe(78);
            expect(TileType.ICE).toBe(100);
            expect(TileType.BASE).toBe(102);
        });
    });

    describe('EnemyType', () => {
        it('should have correct values', () => {
            expect(EnemyType.BASIC).toBe('basic');
            expect(EnemyType.FAST).toBe('fast');
            expect(EnemyType.POWER).toBe('power');
            expect(EnemyType.ARMOR).toBe('armor');
            expect(EnemyType.SHOOTER).toBe('shooter');
        });
    });

    describe('Difficulty', () => {
        it('should have correct values', () => {
            expect(Difficulty.EASY).toBe('easy');
            expect(Difficulty.NORMAL).toBe('normal');
            expect(Difficulty.HARD).toBe('hard');
            expect(Difficulty.EXPERT).toBe('expert');
        });
    });
});
