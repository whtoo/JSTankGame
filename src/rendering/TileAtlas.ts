/**
 * TileAtlas - Manages tile rendering using entities.json configuration
 * Provides efficient tile lookup and rendering with caching support
 */

import type { EntitiesConfig, TileDefinition, TileLayer } from '../types/index.js';
import { getConfigLoader } from '../config/ConfigLoader.js';

/**
 * Cached tile entry with pre-computed values
 */
interface CachedTile {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  category: string;
}

/**
 * TileAtlas for configuration-based tile rendering
 */
export class TileAtlas {
  private config: EntitiesConfig | null;
  private tileCache: Map<string, CachedTile>;
  private categoryCache: Map<string, Set<string>>;

  constructor() {
    this.config = null;
    this.tileCache = new Map();
    this.categoryCache = new Map();
  }

  /**
   * Initialize the tile atlas with configuration
   */
  async init(): Promise<void> {
    this.config = await getConfigLoader().loadEntitiesConfig();
    this._buildCache();
  }

  /**
   * Build internal lookup cache
   */
  private _buildCache(): void {
    if (!this.config) return;

    this.tileCache.clear();
    this.categoryCache.clear();

    for (const layer of this.config.layers) {
      const categoryTiles = new Set<string>();

      for (const tile of layer.tiles) {
        // Add to tile lookup cache
        this.tileCache.set(tile.name, {
          name: tile.name,
          x: tile.x,
          y: tile.y,
          width: tile.width,
          height: tile.height,
          category: layer.category
        });

        // Add to category index
        categoryTiles.add(tile.name);
      }

      this.categoryCache.set(layer.category, categoryTiles);
    }
  }

  /**
   * Check if atlas is initialized
   */
  isReady(): boolean {
    return this.config !== null;
  }

  /**
   * Get tile by name
   */
  getTile(name: string): CachedTile | null {
    return this.tileCache.get(name) || null;
  }

  /**
   * Get tile coordinates for rendering
   * Returns sourceX, sourceY, sourceW, sourceH
   */
  getTileRect(name: string): { x: number; y: number; w: number; h: number } | null {
    const tile = this.tileCache.get(name);
    if (!tile) return null;

    return {
      x: tile.x,
      y: tile.y,
      w: tile.width,
      h: tile.height
    };
  }

  /**
   * Get all tile names in a category
   */
  getTilesByCategory(category: string): string[] {
    const tiles = this.categoryCache.get(category);
    return tiles ? Array.from(tiles) : [];
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    return Array.from(this.categoryCache.keys());
  }

  /**
   * Get tileset info
   */
  getTilesetInfo(): EntitiesConfig['tileset_info'] | null {
    return this.config?.tileset_info || null;
  }

  /**
   * Draw a tile to the given context
   * @param ctx - Canvas rendering context
   * @param tileName - Name of the tile to draw
   * @param spriteSheet - The spritesheet image
   * @param destX - Destination X position
   * @param destY - Destination Y position
   * @param destW - Destination width (optional, defaults to tile size)
   * @param destH - Destination height (optional, defaults to tile size)
   */
  drawTile(
    ctx: CanvasRenderingContext2D,
    spriteSheet: HTMLImageElement,
    tileName: string,
    destX: number,
    destY: number,
    destW?: number,
    destH?: number
  ): boolean {
    const tile = this.tileCache.get(tileName);
    if (!tile) {
      console.warn(`Tile not found: ${tileName}`);
      return false;
    }

    ctx.drawImage(
      spriteSheet,
      tile.x, tile.y,
      tile.width, tile.height,
      destX, destY,
      destW ?? tile.width,
      destH ?? tile.height
    );

    return true;
  }

  /**
   * Draw multiple tiles in a batch
   * Useful for rendering map layers
   */
  drawTileBatch(
    ctx: CanvasRenderingContext2D,
    spriteSheet: HTMLImageElement,
    tiles: Array<{
      name: string;
      x: number;
      y: number;
      w?: number;
      h?: number;
    }>
  ): void {
    for (const tile of tiles) {
      this.drawTile(ctx, spriteSheet, tile.name, tile.x, tile.y, tile.w, tile.h);
    }
  }

  /**
   * Check if a tile exists
   */
  hasTile(name: string): boolean {
    return this.tileCache.has(name);
  }

  /**
   * Get category for a tile
   */
  getTileCategory(name: string): string | null {
    const tile = this.tileCache.get(name);
    return tile?.category || null;
  }
}

/**
 * Global tile atlas instance
 */
let globalTileAtlas: TileAtlas | null = null;

/**
 * Get or create the global tile atlas instance
 */
export function getTileAtlas(): TileAtlas {
  if (!globalTileAtlas) {
    globalTileAtlas = new TileAtlas();
  }
  return globalTileAtlas;
}

/**
 * Initialize the global tile atlas (call during game startup)
 */
export async function initTileAtlas(): Promise<void> {
  const atlas = getTileAtlas();
  await atlas.init();
}
