/**
 * MapConfig - Map data and constants
 * Extracted from Render.js to separate data from rendering logic
 */

import type { MapConfig as IMapConfig } from '../types/index.js';

// Map tile grid data (tile IDs from spritesheet)
export const mapData: number[][] = [
    [78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 55, 78, 78, 78, 78],
    [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
    [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
    [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
    [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 100, 100, 100, 100, 55, 102, 102, 102, 102],
    [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 100, 100, 100, 100, 55, 102, 102, 102, 102],
    [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
    [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
    [102, 102, 100, 100, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
    [102, 102, 100, 100, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
    [102, 102, 100, 100, 102, 102, 102, 102, 60, 60, 60, 60, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
    [102, 102, 102, 102, 102, 102, 102, 102, 60, 74, 74, 60, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102],
    [102, 102, 102, 102, 102, 102, 102, 102, 60, 74, 74, 60, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102]
];

/** Map dimensions */
export const MAP_CONFIG: IMapConfig = {
    cols: 23,
    rows: 13,
    tileRenderSize: 33,  // Visual size on canvas (matches TMX tilewidth/tileheight)
    tileSourceSize: 33,  // Size in spritesheet (tankbrigade.png uses 33x33 tiles)
    tilesPerRowInSheet: 24,  // 800px / 33px ≈ 24.24, so 24 tiles per row
    indexOffset: 1,      // TMX uses 1-indexed GIDs, need to subtract 1 for 0-indexed array access
    playerBounds: {
        minX: 0,
        maxX: 22,  // 0-indexed: 23 columns means indices 0-22
        minY: 0,
        maxY: 12   // 0-indexed: 13 rows means indices 0-12
    }
};

/**
 * Get map data
 */
export function getMapData(): number[][] {
    return mapData;
}

/**
 * Get map configuration
 */
export function getMapConfig(): IMapConfig {
    return MAP_CONFIG;
}
