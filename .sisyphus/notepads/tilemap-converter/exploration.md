# Tilemap System Exploration Results

## 2026-01-28 04:49:00 - Complete File Inventory

### Core Architecture Files
1. **TileMapLoader** (`/src/game/TileMapLoader.ts`) - Primary interface for loading Tiled JSON maps
   - `TileMapLoader` class with `loadLevel(levelPath, tilesetPath): Promise<LoadedMap>`
   - `LoadedMap` interface containing `mapData`, `tilesetData`, `gridData`, `columns`, `rows`, `tileWidth`, `tileHeight`
   - Utility methods: `getTileByGID`, `isTilePassable`, `isTileDestructible`, `gridToPixel`, `pixelToGrid`
   - Singleton access via `getTileMapLoader()`

2. **TileMapRenderer** (`/src/rendering/TileMapRenderer.ts`) - Rendering engine for tilemap layers
   - `TileMapRenderer` class with `renderLayer`, `renderAllLayers`, `prerenderLayer`
   - `TileMapRenderContext` interface for rendering parameters
   - Integrates with `TileMapLoader` for tile data
   - Uses offscreen canvas for layer caching and `ImageData` for layer cache storage

3. **TileMapRegistry** (`/src/rendering/TileMapRegistry.ts`) - Unified tile registry
   - `TileMapEntry` interface with tile properties
   - `TileMapRegistry` singleton for tile lookup by ID/name
   - Bridges legacy `entities.json` and new `tileset.json` formats

### Supporting Systems
4. **TileMapSpriteAnimator** (`/src/game/TileMapSpriteAnimator.ts`) - Animation system using tile IDs
5. **TileLevelManager** (`/src/game/levels/TileLevelManager.ts`) - Level management with Tiled maps
6. **TileAtlas** (`/src/rendering/TileAtlas.ts`) - Configuration-based tile rendering
7. **CollisionSystem** (`/src/systems/CollisionSystem.ts`) - Uses `TileMapLoader` for passability checks

### Data Files
8. **Tileset JSONs** (`/resources/tileset.json`, `tileset_full.json`) - Tiled tileset definitions
9. **Level JSONs** (`/resources/level1.json`, `level2.json`, `levels/level3.json`) - Tiled map files
10. **Animation Config** (`/src/entities/anim_tilemap.json`) - Tilemap-based tank animations

### Type Definitions
11. **TilemapConfig** (`/src/types/TilemapConfig.ts`) - Complete Tiled JSON TypeScript interfaces
   - `TiledMap` interface for complete map structure
   - `TilesetData` for tileset definitions
   - `TileDefinition` for individual tile properties
   - `MapLayer` for layer data with `data: number[]` array

12. **Core Types** (`/src/types/index.ts`) - `TilesetInfo`, `TileDefinition`, `AnimationDirection`

### Integration Points
13. **Main entry** (`/src/main.ts`) - Loads tilemap system on startup
14. **GameObjManager** (`/src/managers/GameObjManager.ts`) - Connects tilemap to collision system
15. **Render** (`/src/rendering/Render.ts`) - Integrates tilemap data for rendering

## Key Interfaces for Converter Development

### TileMapLoader Interface
```typescript
interface LoadedMap {
  mapData: TiledMap;
  tilesetData: TilesetData;
  gridData: number[];
  firstgid: number;
  columns: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
}

class TileMapLoader {
  async loadLevel(levelPath: string, tilesetPath: string): Promise<LoadedMap>;
  getTileByGID(gid: number, tileset: TilesetData): TileDefinition | null;
  isTilePassable(gid: number, tileset: TilesetData): boolean;
  isTileDestructible(gid: number, tileset: TilesetData): boolean;
  getTileHitPoints(gid: number, tileset: TilesetData): number;
  gridToPixel(gridX, gridY, tileWidth, tileHeight): { x, y };
  pixelToGrid(pixelX, pixelY, tileWidth, tileHeight): { gridX, gridY };
}
```

### TiledMap Structure Requirements
- Tile size: 33×33 pixels (based on level3.json)
- GID calculation: `firstgid` + local tile ID (firstgid typically 1)
- Layer structure: At least one `tilelayer` with `data` array
- Object layer: Optional objects layer for player, base, enemies
- Properties: Map-level metadata like level number, difficulty, enemy count

### Tile Properties (from TileDefinition)
- `passable`: boolean - can entities move through
- `destructible`: boolean - can be destroyed
- `hitPoints`: number - health points
- `providesCover`: boolean - provides protection
- `critical`: boolean - critical objective (e.g., base)
- `faction`: string - player or enemy affiliation
- `name`: string - descriptive name

## Implementation Implications for Converter

1. **Output Format**: Must produce valid `TiledMap` structure
2. **Tile Mapping**: Color-to-tile ID mapping must match existing tileset definitions
3. **GID Calculation**: Need to apply `firstgid` offset (typically 1)
4. **Coordinate System**: Pixel positions need conversion to grid coordinates
5. **Object Detection**: Player, base, enemies need placement in object layer
6. **Property Assignment**: Tile properties should match tileset definitions

## Next Steps for Converter Design
1. Study `tileset_full.json` for exact tile property definitions
2. Understand color-to-tile mapping from previous analysis
3. Design converter to output compatible `TiledMap`
4. Use existing `TileMapLoader` for validation
5. Integrate with `TileMapRenderer` for visual verification