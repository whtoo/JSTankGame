/**
 * TileLevelManager - Manages levels using Tiled JSON format
 */

import type {
  LoadedMap,
  Position
} from '../../game/TileMapLoader.js';
import type { LevelManagerOptions } from './LevelManager.js';
import { getTileMapLoader } from '../../game/TileMapLoader.js';

/**
 * Enemy configuration from Tiled map
 */
export interface TileLevelEnemyConfig {
  total: number;
  maxOnField: number;
  spawnInterval: number;
  spawnPoints: Position[];
}

/**
 * Level data from Tiled JSON
 */
export interface TileLevelData {
  id: number;
  name: string;
  mapData: LoadedMap;
  enemies: TileLevelEnemyConfig;
}

/**
 * TileLevelManager - Level manager using Tiled JSON maps
 */
export class TileLevelManager {
  private levels: TileLevelData[];
  private currentLevelIndex: number;
  private currentLevel: TileLevelData | null;
  private isLevelComplete: boolean;
  private isGameOver: boolean;

  // Options
  private startLevel: number;
  private loopLevels: boolean;

  // Event callbacks
  public onLevelStart: ((level: TileLevelData) => void) | null;
  public onLevelComplete: ((data: { level: number; stars: number }) => void) | null;
  public onGameOver: ((data: { victory: boolean; finalLevel: number }) => void) | null;

  constructor(options: LevelManagerOptions = {}) {
    this.levels = [];
    this.currentLevelIndex = 0;
    this.currentLevel = null;
    this.isLevelComplete = false;
    this.isGameOver = false;

    this.startLevel = options.startLevel || 1;
    this.loopLevels = options.loopLevels !== undefined ? options.loopLevels : false;

    this.onLevelStart = options.onLevelStart || null;
    this.onLevelComplete = options.onLevelComplete || null;
    this.onGameOver = options.onGameOver || null;
  }

  /**
   * Initialize level manager with Tiled JSON levels
   */
  async init(): Promise<void> {
    await this.loadLevelLevels();
    if (this.startLevel > 1) {
      this.loadLevel(this.startLevel);
    } else {
      this.loadLevel(1);
    }
  }

  /**
   * Load all level definitions
   */
  private async loadLevelLevels(): Promise<void> {
    const mapLoader = getTileMapLoader();
    const availableLevels = ['level1.json'];

    for (const levelFile of availableLevels) {
      try {
        const loadedMap = await mapLoader.loadLevel(levelFile, 'tileset_full.json');

        const tileLevelData: TileLevelData = {
          id: parseInt(levelFile.match(/\d+/)?.[0] || 1),
          name: loadedMap.mapData.name || levelFile,
          mapData: loadedMap,
          enemies: this._parseEnemyConfig(loadedMap.mapData)
        };

        this.levels.push(tileLevelData);
      } catch (error) {
        console.error(`Failed to load level ${levelFile}:`, error);
      }
    }
  }

  /**
   * Parse enemy configuration from map data
   */
  private _parseEnemyConfig(mapData: any): TileLevelEnemyConfig {
    const properties = mapData.properties || {};

    return {
      total: properties.enemies || 0,
      maxOnField: properties.maxOnField || 4,
      spawnInterval: properties.spawnInterval || 3000,
      spawnPoints: this._extractSpawnPoints(mapData)
    };
  }

  /**
   * Extract spawn points from map objects
   */
  private _extractSpawnPoints(mapData: any): Position[] {
    const spawnPoints: Position[] = [];

    if (mapData.objects?.spawnPoints) {
      for (const point of mapData.objects.spawnPoints) {
        spawnPoints.push(point.position);
      }
    }

    return spawnPoints;
  }

  /**
   * Get current level number (1-indexed)
   */
  getCurrentLevelNumber(): number {
    return this.currentLevelIndex + 1;
  }

  /**
   * Get current level data
   */
  getCurrentLevel(): TileLevelData | null {
    return this.currentLevel;
  }

  /**
   * Get map grid data (for compatibility)
   */
  getMapGrid(): number[][] | null {
    if (!this.currentLevel) return null;

    const { gridData, columns } = this.currentLevel.mapData;

    const grid: number[][] = [];
    const rows = gridData.length / columns;

    for (let y = 0; y < rows; y++) {
      const rowStart = y * columns;
      const row = gridData.slice(rowStart, rowStart + columns);
      grid.push(row);
    }

    return grid;
  }

  /**
   * Get map data for rendering
   */
  getMapData(): LoadedMap | null {
    return this.currentLevel?.mapData || null;
  }

  /**
   * Get tile at position
   */
  getTileAt(x: number, y: number): number {
    if (!this.currentLevel) return 0;

    const { gridData, columns } = this.currentLevel.mapData;
    const index = y * columns + x;

    return gridData[index] || 0;
  }

  /**
   * Get player start position
   */
  getPlayerStart(): { x: number; y: number } | null {
    const objects = this.currentLevel?.mapData.mapData.objects;
    return objects?.player?.position || null;
  }

  /**
   * Get base position
   */
  getBasePosition(): { x: number; y: number } | null {
    const objects = this.currentLevel?.mapData.mapData.objects;

    if (objects?.spawnPoints && objects.spawnPoints.length > 0) {
      return objects.spawnPoints[0].position;
    }

    return null;
  }

  /**
   * Get enemy spawn points
   */
  getEnemySpawnPoints(): Array<{ x: number; y: number }> | null {
    const objects = this.currentLevel?.mapData.mapData.objects;
    return objects?.spawnPoints?.map(p => p.position) || [];
  }

  /**
   * Get enemy configuration
   */
  getEnemyConfig(): TileLevelEnemyConfig | null {
    return this.currentLevel?.enemies || null;
  }

  /**
   * Select a random enemy type (for compatibility with existing code)
   */
  selectRandomEnemyType(): string {
    const enemyTypes = ['basic', 'fast', 'power', 'armor'];
    return enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  }

  /**
   * Load a specific level
   */
  loadLevel(levelNum: number): TileLevelData | null {
    if (levelNum < 1 || levelNum > this.levels.length) {
      console.warn(`Level ${levelNum} does not exist`);
      return null;
    }

    this.currentLevelIndex = levelNum - 1;
    this.currentLevel = this.levels[this.currentLevelIndex];
    this.isLevelComplete = false;

    if (this.onLevelStart && this.currentLevel) {
      this.onLevelStart(this.currentLevel);
    }

    return this.currentLevel;
  }

  /**
   * Load next level
   */
  loadNextLevel(): TileLevelData | null {
    const nextLevelNum = this.currentLevelIndex + 2;

    if (nextLevelNum > this.levels.length) {
      if (this.loopLevels) {
        return this.loadLevel(1);
      }
      this.isGameOver = true;
      if (this.onGameOver) {
        this.onGameOver({ victory: true, finalLevel: this.getTotalLevels() });
      }
      return null;
    }

    return this.loadLevel(nextLevelNum);
  }

  /**
   * Get total number of levels
   */
  getTotalLevels(): number {
    return this.levels.length;
  }

  /**
   * Complete current level
   */
  completeLevel(): void {
    this.isLevelComplete = true;
    if (this.onLevelComplete && this.currentLevel) {
      this.onLevelComplete({
        level: this.getCurrentLevelNumber(),
        stars: this._calculateStars()
      });
    }
  }

  /**
   * Calculate stars (placeholder)
   */
  private _calculateStars(): number {
    return 3;
  }

  /**
   * Check if there's a next level
   */
  hasNextLevel(): boolean {
    return this.currentLevelIndex < this.levels.length - 1;
  }

  /**
   * Reset to first level
   */
  reset(): void {
    this.loadLevel(1);
    this.isGameOver = false;
  }

  /**
   * Get all level info
   */
  getAllLevelInfo(): Array<{ id: number; name: string; difficulty: string }> {
    return this.levels.map(l => ({
      id: l.id,
      name: l.name,
      difficulty: 'normal'
    }));
  }
}

/**
 * Singleton instance
 */
let globalTileLevelManager: TileLevelManager | null = null;

export function getTileLevelManager(): TileLevelManager {
  if (!globalTileLevelManager) {
    globalTileLevelManager = new TileLevelManager();
  }
  return globalTileLevelManager;
}
