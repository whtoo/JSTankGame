# Tilemap Converter Learnings

## 2026-01-28 04:41:00 - Initial Analysis

### Existing Tilemap System Architecture

#### 1. Core Components Discovered
- **TileMapLoader** (`src/game/TileMapLoader.ts`): Loads Tiled JSON maps and tilesets
  - `loadLevel(levelPath, tilesetPath): Promise<LoadedMap>`
  - `getTileByGID(gid, tileset): TileDefinition | null`
  - `isTilePassable(gid, tileset): boolean`
  - `isTileDestructible(gid, tileset): boolean`
  - `getTileHitPoints(gid, tileset): number`
  - Coordinate conversion methods: `gridToPixel`, `pixelToGrid`

- **TileMapRenderer** (`src/rendering/TileMapRenderer.ts`): Renders tilemaps (to be examined)
- **TileMapSpriteAnimator** (`src/game/TileMapSpriteAnimator.ts`): Handles sprite animations
- **TileMapRegistry** (`src/rendering/TileMapRegistry.ts`): Manages tile properties
- **TileMapIntegrationExample** (`src/game/TileMapIntegrationExample.ts`): Example usage

#### 2. Type Definitions (`src/types/TilemapConfig.ts`)
- **TiledMap**: Complete Tiled JSON map interface
  - `version`, `tiledversion`, `name`, `type`
  - `width`, `height`, `tilewidth`, `tileheight`
  - `tilesets: TilesetInfo[]`
  - `layers: MapLayer[]`
  - `properties?: MapProperties`
  
- **MapLayer**: Tile layer with data array
  - `id`, `name`, `type`, `width`, `height`
  - `data: number[]` (tile GIDs)

- **TileDefinition**: Individual tile properties
  - `id`: Local tile ID (0-based)
  - `type`: Tile category (e.g., "wall", "grass", "tank")
  - `properties`: Game-specific properties (passable, destructible, hitPoints, etc.)

- **TilesetData**: Complete tileset definition
  - `tiles?: TileDefinition[]` (array of tile definitions)
  - `firstgid?: number` (global ID offset, typically 1)

#### 3. Key Interfaces for Converter
Our ImageToTilemapConverter must produce `TiledMap` objects that match:
- Tile size: 33×33 pixels (based on level3.json)
- GID calculation: `firstgid` + local tile ID
- Layer structure: At least one `tilelayer` with `data` array
- Object layer: Optional objects layer for player, base, enemies

### Color Mapping Strategy
Based on previous analysis:
- Red brick (#B42828) → tile ID 17 (wall, destructible, 4 HP)
- White brick (#DCDCDC) → tile ID 59 (concrete, indestructible)
- Green grass (#3CC83C) → tile ID 99 (grass, passable, provides cover)
- Yellow tank (#FFDC00) → tile ID 73 (player_tank, faction: player)
- Base eagle (black+white) → tile ID 54 (base_eagle, critical, destructible, 1 HP)
- Empty (#000000) → tile ID 0 (empty, passable)

### Technical Considerations
1. **Size Conversion**: Source image uses 16×16 tiles, game uses 33×33 tiles
   - Option: Keep 33×33 in output, scale during conversion or rendering
   - Current level3.json uses 33×33 with 20×15 grid

2. **Color Matching Algorithm**:
   - Euclidean distance in RGB space
   - Tolerance threshold (e.g., 50)
   - Consider HSV for better color perception matching

3. **Object Detection**:
   - Player tank: Yellow pixels at specific positions
   - Base: Pattern recognition (black background + white eagle)
   - Could use manual specification initially

### Next Steps
1. Examine TileMapRenderer to understand rendering requirements
2. Check tileset_full.json for exact tile properties
3. Review ImageResource for image loading patterns
4. Design converter class interface
5. Implement prototype with test image