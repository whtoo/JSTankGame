/**
 * Type definitions for Tiled JSON map format
 */

/**
 * Tileset definition from tileset.json
 */
export interface TilesetInfo {
  firstgid: number;
  name: string;
  filename: string;
}

/**
 * Map layer definition
 */
export interface MapLayer {
  id: number;
  name: string;
  type: string;
  width: number;
  height: number;
  opacity: number;
  visible: boolean;
  x: number;
  y: number;
  data: number[];
}

/**
 * Object position (supports both grid and pixel coordinates)
 */
export interface Position {
  gridX: number;
  gridY: number;
  pixelX: number;
  pixelY: number;
}

/**
 * Player object from map
 */
export interface PlayerObject {
  id: number;
  name: string;
  type: string;
  gid: number;
  position: Position;
}

/**
 * Enemy object from map
 */
export interface EnemyObject {
  id: number;
  name: string;
  type: string;
  gid: number;
  position: Position;
}

/**
 * Spawn point object
 */
export interface SpawnPointObject {
  id: number;
  name: string;
  type: string;
  position: Position;
}

/**
 * Objects collection from map
 */
export interface MapObjects {
  player?: PlayerObject;
  enemies?: EnemyObject[];
  spawnPoints?: SpawnPointObject[];
}

/**
 * Map properties
 */
export interface MapProperties {
  level?: number;
  playerLives?: number;
  enemies?: number;
  [key: string]: any;
}

/**
 * Tiled JSON map format
 */
export interface TiledMap {
  version: string;
  tiledversion: string;
  name: string;
  type: string;
  orientation: string;
  renderorder: string;
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  nextobjectid: number;
  backgroundcolor: string;
  properties?: MapProperties;
  tilesets: TilesetInfo[];
  layers: MapLayer[];
  objects?: MapObjects;
}

/**
 * Tile definition from tileset.json
 */
export interface TileDefinition {
  id: number;
  type: string;
  properties?: {
    name?: string;
    passable?: boolean;
    destructible?: boolean;
    hitPoints?: number;
    providesCover?: boolean;
    critical?: boolean;
    faction?: string;
    moveSpeed?: number;
    fireRate?: number;
    description?: string;
  };
}

/**
 * Tileset JSON format
 */
export interface TilesetData {
  version: string;
  tiledversion: string;
  name: string;
  type: string;
  tilewidth: number;
  tileheight: number;
  spacing: number;
  margin: number;
  columns: number;
  tilecount: number;
  image: {
    source: string;
    width: number;
    height: number;
    trans: string | null;
  };
  tiles?: TileDefinition[];
  grid?: {
    orientation: string;
    width: number;
    height: number;
  };
  tilesets?: TilesetInfo[];
  firstgid?: number;
}
