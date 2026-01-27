/**
 * TileMapRenderer - Renders tilemap-based levels with proper tile support
 * Integrates with the TileMapLoader and new tileset configuration
 */

import type { LoadedMap } from '../game/TileMapLoader.js';
import { getTileMapLoader } from '../game/TileMapLoader.js';
import type { TileMapSpriteAnimator } from '../game/TileMapSpriteAnimator.js';

/**
 * Render context for tilemap rendering
 */
export interface TileMapRenderContext {
  ctx: CanvasRenderingContext2D;
  spriteSheet: HTMLImageElement;
  viewportX?: number;
  viewportY?: number;
  viewportWidth?: number;
  viewportHeight?: number;
}

/**
 * Tile render info
 */
interface TileRenderInfo {
  gid: number;
  localId: number;
  x: number;
  y: number;
  pixelX: number;
  pixelY: number;
}

/**
 * Enhanced tilemap renderer
 */
export class TileMapRenderer {
  private tileMapLoader = getTileMapLoader();
  private currentMap: LoadedMap | null = null;
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;
  private layerCache: Map<string, ImageData> = new Map();
  private tileSize: number = 33;

  /**
   * Load a level for rendering
   */
  async loadLevel(levelPath: string, tilesetPath: string = 'tileset_full.json'): Promise<boolean> {
    try {
      this.currentMap = await this.tileMapLoader.loadLevel(levelPath, tilesetPath);
      this.tileSize = this.currentMap.tileWidth;
      
      // Initialize offscreen canvas for caching
      const mapWidth = this.currentMap.columns * this.tileSize;
      const mapHeight = this.currentMap.rows * this.tileSize;
      
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCanvas.width = mapWidth;
      this.offscreenCanvas.height = mapHeight;
      this.offscreenCtx = this.offscreenCanvas.getContext('2d');
      
      // Clear cache when loading new level
      this.layerCache.clear();
      
      return true;
    } catch (error) {
      console.error('Failed to load level for rendering:', error);
      return false;
    }
  }

  /**
   * Set current map (for already loaded maps)
   */
  setCurrentMap(map: LoadedMap): void {
    this.currentMap = map;
    this.tileSize = map.tileWidth;
  }

  /**
   * Get current map
   */
  getCurrentMap(): LoadedMap | null {
    return this.currentMap;
  }

  /**
   * Render entire map to offscreen canvas (for caching)
   */
  prerenderLayer(spriteSheet: HTMLImageElement, layerIndex: number = 0): void {
    if (!this.currentMap || !this.offscreenCtx) return;

    const { gridData, columns, rows, firstgid, tilesetData } = this.currentMap;
    
    // Find tile layer
    const tileLayer = this.currentMap.mapData.layers[layerIndex];
    if (!tileLayer || tileLayer.type !== 'tilelayer') return;

    const layerData = tileLayer.data;
    const cols = tilesetData.columns || 24;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const index = y * columns + x;
        const gid = layerData[index];

        if (gid === 0) continue; // Skip empty tiles

        const localId = gid - firstgid;
        const sourceX = (localId % cols) * this.tileSize;
        const sourceY = Math.floor(localId / cols) * this.tileSize;
        const destX = x * this.tileSize;
        const destY = y * this.tileSize;

        this.offscreenCtx.drawImage(
          spriteSheet,
          sourceX, sourceY,
          this.tileSize, this.tileSize,
          destX, destY,
          this.tileSize, this.tileSize
        );
      }
    }
  }

  /**
   * Render map layer
   */
  renderLayer(context: TileMapRenderContext, layerIndex: number = 0): void {
    const { ctx, spriteSheet } = context;
    
    if (!this.currentMap) {
      console.warn('No map loaded for rendering');
      return;
    }

    const { gridData, columns, rows, firstgid, tilesetData } = this.currentMap;
    
    // Find tile layer
    const tileLayer = this.currentMap.mapData.layers[layerIndex];
    if (!tileLayer || tileLayer.type !== 'tilelayer') return;

    const layerData = tileLayer.data;
    const cols = tilesetData.columns || 24;

    // Calculate visible range for viewport culling
    const viewportX = context.viewportX || 0;
    const viewportY = context.viewportY || 0;
    const viewportWidth = context.viewportWidth || ctx.canvas.width;
    const viewportHeight = context.viewportHeight || ctx.canvas.height;

    const startCol = Math.floor(viewportX / this.tileSize);
    const endCol = Math.min(columns, Math.ceil((viewportX + viewportWidth) / this.tileSize));
    const startRow = Math.floor(viewportY / this.tileSize);
    const endRow = Math.min(rows, Math.ceil((viewportY + viewportHeight) / this.tileSize));

    for (let y = startRow; y < endRow; y++) {
      for (let x = startCol; x < endCol; x++) {
        const index = y * columns + x;
        const gid = layerData[index];

        if (gid === 0) continue; // Skip empty tiles

        const localId = gid - firstgid;
        const sourceX = (localId % cols) * this.tileSize;
        const sourceY = Math.floor(localId / cols) * this.tileSize;
        const destX = x * this.tileSize - viewportX;
        const destY = y * this.tileSize - viewportY;

        ctx.drawImage(
          spriteSheet,
          sourceX, sourceY,
          this.tileSize, this.tileSize,
          destX, destY,
          this.tileSize, this.tileSize
        );
      }
    }
  }

  /**
   * Render all visible layers
   */
  renderAllLayers(context: TileMapRenderContext): void {
    if (!this.currentMap) return;

    const layers = this.currentMap.mapData.layers;
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (layer.visible !== false) {
        this.renderLayer(context, i);
      }
    }
  }

  /**
   * Render single tile by GID
   */
  renderTile(
    ctx: CanvasRenderingContext2D,
    spriteSheet: HTMLImageElement,
    gid: number,
    destX: number,
    destY: number,
    destWidth?: number,
    destHeight?: number
  ): void {
    if (!this.currentMap || gid === 0) return;

    const { firstgid, tilesetData } = this.currentMap;
    const localId = gid - firstgid;
    const cols = tilesetData.columns || 24;
    
    const sourceX = (localId % cols) * this.tileSize;
    const sourceY = Math.floor(localId / cols) * this.tileSize;

    ctx.drawImage(
      spriteSheet,
      sourceX, sourceY,
      this.tileSize, this.tileSize,
      destX, destY,
      destWidth || this.tileSize,
      destHeight || this.tileSize
    );
  }

  /**
   * Render tank sprite using animator
   */
  renderTank(
    ctx: CanvasRenderingContext2D,
    spriteSheet: HTMLImageElement,
    animator: TileMapSpriteAnimator,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): void {
    const frame = animator.getCurrentFrame();
    
    ctx.drawImage(
      spriteSheet,
      frame.pixelX, frame.pixelY,
      frame.width, frame.height,
      x, y,
      width || frame.width,
      height || frame.height
    );
  }

  /**
   * Get tile info at grid position
   */
  getTileAt(gridX: number, gridY: number, layerIndex: number = 0): TileRenderInfo | null {
    if (!this.currentMap) return null;

    const { columns, rows, firstgid, gridData } = this.currentMap;
    
    if (gridX < 0 || gridX >= columns || gridY < 0 || gridY >= rows) {
      return null;
    }

    const tileLayer = this.currentMap.mapData.layers[layerIndex];
    if (!tileLayer || tileLayer.type !== 'tilelayer') return null;

    const index = gridY * columns + gridX;
    const gid = tileLayer.data[index];

    return {
      gid,
      localId: gid - firstgid,
      x: gridX,
      y: gridY,
      pixelX: gridX * this.tileSize,
      pixelY: gridY * this.tileSize
    };
  }

  /**
   * Convert pixel to grid coordinates
   */
  pixelToGrid(pixelX: number, pixelY: number): { x: number; y: number } {
    return {
      x: Math.floor(pixelX / this.tileSize),
      y: Math.floor(pixelY / this.tileSize)
    };
  }

  /**
   * Convert grid to pixel coordinates
   */
  gridToPixel(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: gridX * this.tileSize,
      y: gridY * this.tileSize
    };
  }

  /**
   * Get map dimensions in pixels
   */
  getMapDimensions(): { width: number; height: number } | null {
    if (!this.currentMap) return null;
    
    return {
      width: this.currentMap.columns * this.tileSize,
      height: this.currentMap.rows * this.tileSize
    };
  }

  /**
   * Get tile size
   */
  getTileSize(): number {
    return this.tileSize;
  }

  /**
   * Check if tile is passable
   */
  isTilePassable(gridX: number, gridY: number, layerIndex: number = 0): boolean {
    if (!this.currentMap) return true;

    const tileInfo = this.getTileAt(gridX, gridY, layerIndex);
    if (!tileInfo) return false;

    const { tilesetData } = this.currentMap;
    return this.tileMapLoader.isTilePassable(tileInfo.gid, tilesetData);
  }

  /**
   * Check if tile is destructible
   */
  isTileDestructible(gridX: number, gridY: number, layerIndex: number = 0): boolean {
    if (!this.currentMap) return false;

    const tileInfo = this.getTileAt(gridX, gridY, layerIndex);
    if (!tileInfo) return false;

    const { tilesetData } = this.currentMap;
    return this.tileMapLoader.isTileDestructible(tileInfo.gid, tilesetData);
  }

  /**
   * Clear render cache
   */
  clearCache(): void {
    this.layerCache.clear();
    if (this.offscreenCtx && this.offscreenCanvas) {
      this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    }
  }
}

/**
 * Global renderer instance
 */
let globalRenderer: TileMapRenderer | null = null;

/**
 * Get or create global renderer
 */
export function getTileMapRenderer(): TileMapRenderer {
  if (!globalRenderer) {
    globalRenderer = new TileMapRenderer();
  }
  return globalRenderer;
}

/**
 * Reset global renderer
 */
export function resetTileMapRenderer(): void {
  globalRenderer = null;
}
