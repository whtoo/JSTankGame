/**
 * TileMapRegistry - Unified tile registry supporting Tiled JSON format
 * Bridges legacy entities.json and new tileset.json/level2.json formats
 */

import type { TileDefinition } from '../types/index.js';
import type { TilesetData } from '../types/TilemapConfig.js';

export interface TileMapEntry {
  id: number;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: {
    passable?: boolean;
    destructible?: boolean;
    hitPoints?: number;
    providesCover?: boolean;
    critical?: boolean;
  };
}

export interface TileMapRegistryOptions {
  useLegacyFormat?: boolean;
}

export class TileMapRegistry {
  private static instance: TileMapRegistry;
  private tilesetData: TilesetData | null = null;
  private idToEntry: Map<number, TileMapEntry>;
  private nameToEntry: Map<string, TileMapEntry>;
  private initialized: boolean = false;
  private useLegacyFormat: boolean;

  private constructor(options: TileMapRegistryOptions = {}) {
    this.idToEntry = new Map();
    this.nameToEntry = new Map();
    this.useLegacyFormat = options.useLegacyFormat ?? false;
  }

  static getInstance(options?: TileMapRegistryOptions): TileMapRegistry {
    if (!TileMapRegistry.instance) {
      TileMapRegistry.instance = new TileMapRegistry(options);
    }
    return TileMapRegistry.instance;
  }

  /**
   * Initialize registry with new tileset.json format
   */
  async initWithTileset(tilesetData: TilesetData): Promise<void> {
    if (this.initialized) {
      console.warn('TileMapRegistry already initialized');
      return;
    }

    this.tilesetData = tilesetData;
    const { tilewidth, tileheight, columns, tilecount } = tilesetData;

    // Build registry from tileset
    if (tilesetData.tiles) {
      for (const tile of tilesetData.tiles) {
        const localId = tile.id;
        const sourceX = (localId % columns) * tilewidth;
        const sourceY = Math.floor(localId / columns) * tileheight;

        const entry: TileMapEntry = {
          id: localId,
          name: tile.type || `tile_${localId}`,
          type: tile.type || 'basic',
          x: sourceX,
          y: sourceY,
          width: tilewidth,
          height: tileheight,
          properties: tile.properties
        };

        this.idToEntry.set(localId, entry);
        this.nameToEntry.set(entry.name, entry);
      }
    }

    this.initialized = true;
    console.log(`TileMapRegistry initialized with ${this.idToEntry.size} tiles from tileset`);
  }

  /**
   * Get tile entry by local ID (0-based within tileset)
   */
  getTileEntry(localId: number): TileMapEntry | null {
    return this.idToEntry.get(localId) || null;
  }

  /**
   * Get tile entry by name
   */
  getTileEntryByName(name: string): TileMapEntry | null {
    return this.nameToEntry.get(name) || null;
  }

  /**
   * Get source rectangle for rendering (for drawImage)
   */
  getTileRect(localId: number): { x: number; y: number; w: number; h: number } | null {
    const entry = this.getTileEntry(localId);
    if (!entry) return null;
    return { x: entry.x, y: entry.y, w: entry.width, h: entry.height };
  }

  /**
   * Get tile name by local ID
   */
  getTileName(localId: number): string | null {
    const entry = this.getTileEntry(localId);
    return entry?.name || null;
  }

  /**
   * Get tile type by local ID
   */
  getTileType(localId: number): string | null {
    const entry = this.getTileEntry(localId);
    return entry?.type || null;
  }

  /**
   * Check if tile is passable
   */
  isPassable(localId: number): boolean {
    const entry = this.getTileEntry(localId);
    return entry?.properties?.passable ?? true;
  }

  /**
   * Check if tile is destructible
   */
  isDestructible(localId: number): boolean {
    const entry = this.getTileEntry(localId);
    return entry?.properties?.destructible ?? false;
  }

  /**
   * Get tile hit points
   */
  getHitPoints(localId: number): number {
    const entry = this.getTileEntry(localId);
    return entry?.properties?.hitPoints ?? 0;
  }

  /**
   * Get tileset data
   */
  getTilesetData(): TilesetData | null {
    return this.tilesetData;
  }

  /**
   * Check if registry is initialized
   */
  isReady(): boolean {
    return this.initialized;
  }

  /**
   * Clear registry
   */
  clear(): void {
    this.idToEntry.clear();
    this.nameToEntry.clear();
    this.tilesetData = null;
    this.initialized = false;
  }

  /**
   * Get all tile entries
   */
  getAllTiles(): TileMapEntry[] {
    return Array.from(this.idToEntry.values());
  }

  /**
   * Get tiles by type
   */
  getTilesByType(type: string): TileMapEntry[] {
    return Array.from(this.nameToEntry.values()).filter(e => e.type === type);
  }

  /**
   * Get GID from local ID and firstgid
   */
  static toGID(localId: number, firstgid: number = 1): number {
    return firstgid + localId;
  }

  /**
   * Get local ID from GID
   */
  static fromGID(gid: number, firstgid: number = 1): number {
    return gid - firstgid;
  }
}

/**
 * Get global registry instance
 */
export function getTileMapRegistry(): TileMapRegistry {
  return TileMapRegistry.getInstance();
}

/**
 * Initialize registry with tileset data
 */
export async function initTileMapRegistry(tilesetData: TilesetData): Promise<TileMapRegistry> {
  const registry = getTileMapRegistry();
  await registry.initWithTileset(tilesetData);
  return registry;
}
