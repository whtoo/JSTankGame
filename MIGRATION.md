# System Migration to Tile-Based Rendering

## Overview

The rendering system has been migrated from the old LevelManager-based system to a new tile-based system using TileMapLoader and TileAtlas.

## Changes Made

### 1. TileMapLoader Integration (`src/game/TileMapLoader.ts`)

- Added `getTileName()` method to get tile names from GIDs
- Fixed grid data handling to use 1D arrays from Tiled JSON format
- Modified `loadLevel()` to properly parse 2D grid data from Tiled format

### 2. TileAtlas Integration (`src/rendering/TileAtlas.ts`)

- Provides tile definitions from `entities.json` configuration
- Supports tile lookup by name and category
- Includes `drawTile()` method for efficient tile rendering
- Caches tile definitions for performance

### 3. Render System Updates (`src/rendering/Render.ts`)

**Cache System:**
- Refactored `_cacheMap()` to use TileMapLoader's map data
- Uses GID-based tile coordinate calculation from tileset
- Converts 1D grid data to 2D arrays for rendering

**Base Rendering:**
- Updated `drawBase()` to locate base tile (GID 54) using TileAtlas
- Renders base using `tileAtlas.drawTile()` with 'eagle_icon' tile

**Grass Rendering:**
- Updated `drawGrass()` to locate grass tiles (GID 99) using TileAtlas
- Renders grass using `tileAtlas.drawTile()` with 'grass_land' tile

**Clean Up:**
- Removed unused `TileType` import
- Removed old `_getMapData()` method (replaced with `_getTileMapData()`)
- Added `_getTileMapData()` method to get complete tile data with dimensions

### 4. Game Manager Updates (`src/main.ts`)

- Replaced `LevelManager` with `TileLevelManager`
- Added `await tileLevelManager.init()` after map loading
- Fixed initialization order to ensure TileLevelManager is ready before rendering

### 5. Collision System Updates (`src/systems/CollisionSystem.ts`)

- Added `tileMapLoader` property to `CollisionSystem`
- Added `setTileMapLoader()` method for dependency injection
- Updated `isSolidTile()` to use TileMapLoader's `isTilePassable()` when available
- Fallback to old TileType constants for backward compatibility

### 6. Game Object Manager Updates (`src/managers/GameObjManager.ts`)

- Added `getTileMapLoader` import
- Updated constructor to set tileMapLoader in CollisionSystem

## Migration Benefits

1. **Better Modularity**: TileMapLoader and TileAtlas are independent, reusable modules
2. **Tiled JSON Support**: Direct support for Tiled map format
3. **Performance**: Offscreen caching with proper 2D grid handling
4. **Maintainability**: Clear separation between rendering logic and map data
5. **Extensibility**: TileAtlas allows easy addition of new tile types
6. **Backward Compatibility**: Old collision detection still works as fallback

## Usage Example

```typescript
// Get tile from TileAtlas
const tileAtlas = getTileAtlas();
tileAtlas.drawTile(
    context,
    spriteSheet,
    'eagle_icon',
    x, y,
    33, 33
);

// Get map data from TileMapLoader
const tileMapLoader = getTileMapLoader();
const mapData = tileMapLoader.getCachedMap('level2.json');
```

## Next Steps

- [ ] Add more tile types to entities.json
- [ ] Implement animated tile support
- [ ] Add tile layer support (multiple layers per map)
- [ ] Optimize rendering with culling
- [ ] Add unit tests for tile-based rendering
