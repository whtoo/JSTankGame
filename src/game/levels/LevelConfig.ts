/**
 * Level Configuration Schema
 *
 * Defines the JSON structure for level data, inspired by NES Battle City (1985).
 */

import type { LevelConfig, Direction, EnemyType, PowerUpType } from '../../types/index.js';

// Level tile types
export const TileType = {
    EMPTY: 0,
    BRICK: 55,      // Destroyable
    STEEL: 60,      // Indestructible
    WATER: 74,      // Impassable
    GRASS: 78,      // Concealing
    ICE: 100,       // Slippery
    BASE: 102       // Eagle/Briefcase
} as const;

export type TileTypeValue = typeof TileType[keyof typeof TileType];

// Level difficulty presets
export const Difficulty = {
    EASY: 'easy',
    NORMAL: 'normal',
    HARD: 'hard',
    EXPERT: 'expert'
} as const;

export type DifficultyValue = typeof Difficulty[keyof typeof Difficulty];

// Default level settings
export const DEFAULT_LEVEL_CONFIG: Partial<LevelConfig> = {
    enemies: {
        total: 20,
        maxOnField: 4,
        spawnPoints: [],
        types: [],
        spawnInterval: 3.0
    },
    timeLimit: 0,
    powerups: [],
    backgroundMusic: 'battle',
    specialFeatures: {
        hasBridges: false,
        hasFortress: true,
        destroyableWalls: true
    }
};

/**
 * Get tile type from tile ID
 */
export function getTileType(tileId: number): string {
    const types: Record<number, string> = {
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
 */
export function isTilePassable(tileId: number): boolean {
    const impassable = [TileType.BRICK, TileType.STEEL, TileType.WATER, TileType.BASE];
    return !impassable.includes(tileId);
}

/**
 * Check if tile is destructible
 */
export function isTileDestructible(tileId: number): boolean {
    return tileId === TileType.BRICK;
}

/**
 * Check if tile provides concealment
 */
export function isTileConcealing(tileId: number): boolean {
    return tileId === TileType.GRASS;
}
