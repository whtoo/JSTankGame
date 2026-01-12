import type {
  TiledMap,
  TilesetData,
  TileDefinition
} from '../types/TilemapConfig';

export interface LoadedMap {
  mapData: TiledMap;
  tilesetData: TilesetData;
  gridData: number[];
  firstgid: number;
  columns: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
}

export class TileMapLoader {
  private loadedMaps: Map<string, LoadedMap>;

  constructor() {
    this.loadedMaps = new Map();
  }

  async loadLevel(levelPath: string, tilesetPath: string): Promise<LoadedMap> {
    try {
      const [tilesetResponse, levelResponse] = await Promise.all([
        fetch(`/${tilesetPath}`),
        fetch(`/${levelPath}`)
      ]);

      const tilesetData: TilesetData = await tilesetResponse.json();
      const mapData: TiledMap = await levelResponse.json();

      if (!mapData.tilesets || mapData.tilesets.length === 0) {
        throw new Error('Map has no tilesets defined');
      }

      const firstTileset = mapData.tilesets[0];
      const firstgid = firstTileset.firstgid ?? 1;

      const tileLayer = mapData.layers.find(layer => layer.type === 'tilelayer');
      if (!tileLayer) {
        throw new Error('No tile layer found in map');
      }

      const gridData = tileLayer.data;
      const columns = mapData.width;
      const rows = mapData.height;

      const loadedMap: LoadedMap = {
        mapData,
        tilesetData,
        gridData,
        firstgid,
        columns,
        rows,
        tileWidth: mapData.tilewidth,
        tileHeight: mapData.tileheight
      };

      this.loadedMaps.set(levelPath, loadedMap);
      return loadedMap;
    } catch (error) {
      console.error(`Failed to load level ${levelPath}:`, error);
      throw error;
    }
  }

  getCachedMap(levelPath: string): LoadedMap | undefined {
    return this.loadedMaps.get(levelPath);
  }

  getTileByGID(gid: number, tileset: TilesetData): TileDefinition | null {
    if (gid === 0) return null;

    const firstgid = tileset.firstgid ?? 1;
    const localId = gid - firstgid;

    if (!tileset.tiles) return null;

    return tileset.tiles.find(tile => tile.id === localId) || null;
  }

  getTileName(gid: number, tileset: TilesetData): string | null {
    const tile = this.getTileByGID(gid, tileset);
    return tile?.properties?.name || null;
  }

  getTileCategory(gid: number, tileset: TilesetData): string | null {
    const tile = this.getTileByGID(gid, tileset);
    return tile?.type || null;
  }

  isTilePassable(gid: number, tileset: TilesetData): boolean {
    const tile = this.getTileByGID(gid, tileset);
    return tile ? (tile.properties?.passable ?? true) : true;
  }

  isTileDestructible(gid: number, tileset: TilesetData): boolean {
    const tile = this.getTileByGID(gid, tileset);
    return tile ? (tile.properties?.destructible ?? false) : false;
  }

  getTileHitPoints(gid: number, tileset: TilesetData): number {
    const tile = this.getTileByGID(gid, tileset);
    return tile ? (tile.properties?.hitPoints ?? 0) : 0;
  }

  gridToPixel(gridX: number, gridY: number, tileWidth: number, tileHeight: number): { x: number; y: number } {
    return {
      x: gridX * tileWidth,
      y: gridY * tileHeight
    };
  }

  pixelToGrid(pixelX: number, pixelY: number, tileWidth: number, tileHeight: number): { gridX: number; gridY: number } {
    return {
      gridX: Math.floor(pixelX / tileWidth),
      gridY: Math.floor(pixelY / tileHeight)
    };
  }

  getGID(gridX: number, gridY: number, gridData: number[], columns: number): number {
    const index = gridY * columns + gridX;
    return gridData[index] || 0;
  }

  setGID(gridX: number, gridY: number, gid: number, gridData: number[], columns: number): void {
    const index = gridY * columns + gridX;
    gridData[index] = gid;
  }

  clearCache(): void {
    this.loadedMaps.clear();
  }
}

let globalTileMapLoader: TileMapLoader | null = null;

export function getTileMapLoader(): TileMapLoader {
  if (!globalTileMapLoader) {
    globalTileMapLoader = new TileMapLoader();
  }
  return globalTileMapLoader;
}
