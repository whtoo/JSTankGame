/**
 * Core type definitions for JSTankGame
 */

/** Position coordinates */
export interface Position {
  x: number;
  y: number;
}

/** Size dimensions */
export interface Size {
  width: number;
  height: number;
}

/** Direction type */
export type Direction = 'w' | 'a' | 's' | 'd' | 'up' | 'left' | 'down' | 'right';

/** Tank configuration */
export interface TankConfig {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: Direction;
  speed: number;
  isPlayer?: boolean;
}

/** Bullet configuration */
export interface BulletConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: Direction;
  speed: number;
  owner: 'player' | 'enemy';
  powerLevel: number;
}

/** Tile configuration */
export interface TileConfig {
  type: number;
  destructible: boolean;
  health?: number;
}

/** Map configuration */
export interface MapConfig {
  cols: number;
  rows: number;
  tileRenderSize: number;
  tileSourceSize: number;
  tilesPerRowInSheet: number;
  indexOffset: number;
  playerBounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

/** Collision result */
export interface CollisionResult {
  collision: boolean;
  type: 'none' | 'wall' | 'tank' | 'base';
  destructible?: boolean;
  tileX?: number;
  tileY?: number;
  target?: any;
}

/** Animation frame */
export interface AnimationFrame {
  sourceDx: number;
  sourceDy: number;
  sourceW: number;
  sourceH: number;
}

/** Sprite animation sheet interface */
export interface ISpriteAnimSheet {
  getFrames(): AnimationFrame | null;
}

/** Canvas 2D context type */
export type CanvasContext = CanvasRenderingContext2D;

/** Game state type */
export type GameState = 'menu' | 'playing' | 'paused' | 'gameover' | 'victory';

/** Enemy type */
export type EnemyType = 'basic' | 'fast' | 'power' | 'armor';

/** Power-up type */
export type PowerUpType = 'grenade' | 'helmet' | 'shovel' | 'star' | 'tank' | 'timer';

/** Level configuration */
export interface LevelConfig {
  id: number;
  name: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  grid: number[][];
  playerStart: {
    x: number;
    y: number;
    direction: Direction;
  };
  basePosition: {
    x: number;
    y: number;
  };
  enemies: {
    total: number;
    maxOnField: number;
    spawnPoints: Array<{ x: number; y: number }>;
    types: Array<{ type: EnemyType; weight: number }>;
    spawnInterval: number;
  };
  timeLimit: number;
  powerups: Array<{ type: PowerUpType; chance: number }>;
  backgroundMusic: string;
  specialFeatures: {
    hasBridges: boolean;
    hasFortress: boolean;
    destroyableWalls: boolean;
  };
}

/** Enemy configuration by type */
export interface EnemyTypeConfig {
  speed: number;
  armor: number;
  fireRate: number;
  points: number;
  width?: number;
  height?: number;
  color?: string;
}

/** Game loop callback */
export type GameLoopCallback = (deltaTime: number) => void;

/** Key map */
export interface KeyMap {
  up: string[];
  down: string[];
  left: string[];
  right: string[];
  fire: string[];
  pause: string[];
  menu?: string[];
}
