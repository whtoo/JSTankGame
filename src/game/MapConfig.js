/**
 * MapConfig - Map data and constants
 * Extracted from Render.js to separate data from rendering logic
 */

// Map tile grid data (tile IDs from spritesheet)
export const mapData = [
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

// Map dimensions
export const MAP_CONFIG = {
    cols: 23,
    rows: 13,
    tileRenderSize: 33,  // Visual size on canvas
    tileSourceSize: 32,  // Size in spritesheet
    tilesPerRowInSheet: 25,  // 800px / 32px = 25 tiles per row
    indexOffset: 0,      // TMX uses 1-indexed IDs, so no offset needed when we subtract 1

    // Computed pixel dimensions
    get width() { return this.cols * this.tileRenderSize; },
    get height() { return this.rows * this.tileRenderSize; },

    // Player movement boundaries (grid coordinates)
    playerBounds: {
        minX: 0,
        maxX: 23,
        minY: 0,
        maxY: 13
    }
};

/**
 * Get map data
 * @returns {number[][]} 2D array of tile IDs
 */
export function getMapData() {
    return mapData;
}

/**
 * Get map configuration
 * @returns {object} Map configuration object
 */
export function getMapConfig() {
    return MAP_CONFIG;
}
