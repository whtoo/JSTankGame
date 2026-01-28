# Tileset Analysis: tileset_full.json

## Overview

This document provides a comprehensive analysis of `resources/tileset_full.json`, the complete tileset definition for JSTankGame. This analysis supports the tilemap converter development by documenting tile ID mappings, properties, and structural information.

## Metadata

| Property | Value |
|----------|-------|
| Version | 1.1 |
| Tiled Version | 1.11.0 |
| Name | Tank Brigade Complete Tileset |
| Tile Width | 33 pixels |
| Tile Height | 33 pixels |
| Spacing | 0 pixels |
| Margin | 0 pixels |
| Columns | 24 |
| Total Tile Count | 432 |
| Image Source | tankbrigade.png (800×600) |

## Tile ID Mapping Table

The following table documents all defined tiles with their properties. Note: Only tiles with explicit definitions are listed (tile IDs 0-324 with gaps). Undefined tile IDs likely correspond to empty/transparent areas in the tileset image.

| Tile ID | Type | Name | Passable | Destructible | Hit Points | Description | Pixel X | Pixel Y |
|---------|------|------|----------|--------------|------------|-------------|---------|---------|
| 0 | empty | Empty Space | true | false | - | Black background, open area | - | - |
| 16 | empty_variant | Empty Variant | true | false | - | Alternative empty tile | - | - |
| 17 | wall | Brick Wall | false | true | 4 | Red brick pattern wall | 0 | 132 |
| 54 | base_eagle | Eagle Base | false | true | 1 | The base to defend | 363 | 33 |
| 55 | wall_side | Wall Side | false | true | 3 | Side wall piece | 231 | 66 |
| 59 | concrete | Concrete Block | false | false | 999 | White concrete block | 363 | 66 |
| 60 | concrete_variant | Concrete Variant | false | false | 999 | Alternative concrete block | 396 | 66 |
| 74 | terrain_mixed | Mixed Terrain | true | false | - | Mixed terrain tile | 66 | 99 |
| 78 | wall_concrete | Concrete Wall | false | false | 999 | Concrete wall section | 198 | 99 |
| 99 | grass | Grass Terrain | true | false | - | Green grass with texture | 99 | 132 |
| 100 | wall_brick | Brick Wall Damaged | false | true | 2 | Damaged brick wall | 132 | 132 |
| 102 | wall_brick_solid | Solid Brick Wall | false | true | 3 | Solid brick wall | 198 | 132 |
| 139 | water | Water | false | false | - | Water terrain - impassable | 627 | 165 |
| 314 | grass_variant | Grass Variant 1 | true | false | - | Alternative grass texture | 66 | 429 |
| 315 | grass_variant | Grass Variant 2 | true | false | - | - | 99 | 429 |
| 316 | grass_variant | Grass Variant 3 | true | false | - | - | 132 | 429 |
| 317 | grass_variant | Grass Variant 4 | true | false | - | - | 165 | 429 |
| 318 | grass_variant | Grass Variant 5 | true | false | - | - | 198 | 429 |
| 319 | grass_variant | Grass Variant 6 | true | false | - | - | 231 | 429 |
| 320 | grass_variant | Grass Variant 7 | true | false | - | - | 264 | 429 |
| 321 | grass_variant | Grass Variant 8 | true | false | - | - | 297 | 429 |
| 322 | grass_variant | Grass Variant 9 | true | false | - | - | 330 | 429 |
| 323 | grass_variant | Grass Variant 10 | true | false | - | - | 363 | 429 |
| 324 | grass_variant | Grass Variant 11 | true | false | - | - | 396 | 429 |
| 73 | player_tank | Player Tank | - | - | - | Yellow player tank | 33 | 99 |
| 74 | enemy_tank | Enemy Tank | - | - | - | Green enemy tank | 66 | 99 |

**⚠️ Duplicate Tile ID Warning**: Tile ID `74` appears twice in the tileset:
1. As `terrain_mixed` (passable terrain)
2. As `enemy_tank` (game object)

This is likely a data error. The game may treat tile ID 74 as either terrain or enemy tank depending on context. For the converter, consider using `enemy_tank` for tank objects and `terrain_mixed` for terrain tiles, but note the conflict.

## Notes on Tile Properties

1. **Passable/Destructible**: Properties marked "-" indicate the property is not applicable (e.g., tanks are neither passable terrain nor destructible obstacles).
2. **Hit Points**: 
   - Destructible walls have hit points (2-4)
   - Concrete blocks have 999 HP (effectively indestructible)
   - Base eagle has 1 HP (critical target)
3. **Pixel Coordinates**: Coordinates within `tankbrigade.png` where the tile's top-left corner is located. Used for sprite sheet rendering.
4. **Tile Types**: 
   - `empty`, `empty_variant`: Background/empty space
   - `wall`, `wall_side`, `wall_brick`, `wall_brick_solid`, `wall_concrete`: Various wall types
   - `concrete`, `concrete_variant`: Indestructible concrete blocks
   - `grass`, `grass_variant`: Passable terrain that provides cover
   - `water`: Impassable, indestructible water terrain
   - `base_eagle`: Critical destructible base objective
   - `player_tank`, `enemy_tank`: Tank entities (not terrain tiles)

## Obstacles Categorization

The tileset includes explicit categorization of obstacle tiles:

### Impassable Tiles (Cannot be traversed)
Tile IDs: 17, 54, 55, 59, 60, 78, 100, 102, 139

### Destructible Obstacles (Can be destroyed)
Tile IDs: 17, 54, 55, 100, 102

### Indestructible Obstacles (Cannot be destroyed)
Tile IDs: 59, 60, 78, 139

## Terrain Categorization

### Passable Terrain (Can be traversed)
Tile IDs: 0, 16, 74, 99, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324

### Cover-Providing Terrain (Provides defensive cover)
Tile IDs: 99, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324

## Tank Sprites Animation Data

The tileset includes animation definitions for tank sprites:

### Green Tank Animations
- **Description**: Green tank animations
- **Frame IDs**: 
  - Up: [18, 42]
  - Up-right: [19, 43]
  - Right: [66, 90]
  - Down-right: [91, 115]
  - Down: [114, 138]
  - Down-left: [139, 163]
  - Left: [162, 186]
  - Up-left: [187, 211]
- **Pixel Coordinates** (in tankbrigade.png):
  - Up: (594,0) and (627,0)
  - Right: (594,66) and (627,66)
  - Down: (594,132) and (627,132)
  - Left: (594,198) and (627,198)

### Blue Tank Animations
- **Description**: Blue tank animations
- **Frame IDs**:
  - Up: [162, 186]
  - Right: [210, 234]
  - Down: [258, 282]
  - Left: [306, 330]
- **Pixel Coordinates**:
  - Up: (594,198) and (627,198)
  - Right: (594,264) and (627,264)
  - Down: (594,330) and (627,330)
  - Left: (594,396) and (627,396)

**Note**: Frame IDs correspond to tile IDs within the tileset. Each animation consists of two frames for smooth movement.

## Color-to-Tile Mapping (From External Analysis)

Based on previous analysis of target image `target_pic_1.jpeg`, the following color mappings have been identified:

| Color (Hex) | RGB | Tile ID | Tile Type | Visual Description |
|-------------|-----|---------|-----------|-------------------|
| #B42828 | rgb(180, 40, 40) | 17 | wall | Red brick wall |
| #DCDCDC | rgb(220, 220, 220) | 59 | concrete | White concrete block |
| #3CC83C | rgb(60, 200, 60) | 99 | grass | Green grass terrain |
| #FFDC00 | rgb(255, 220, 0) | 73 | player_tank | Yellow player tank |
| Black + white eagle | N/A | 54 | base_eagle | Base eagle (critical target) |
| #000000 | rgb(0, 0, 0) | 0 | empty | Empty space |

**Important**: These color mappings are **not stored in the tileset JSON**. They were derived from visual analysis of the target image and are essential for the image-to-tilemap conversion algorithm.

## Structural Notes

### JSON Structure
The tileset file follows the Tiled JSON format with custom extensions:
- `tiles`: Array of tile definitions with `id`, `type`, and `properties`
- `tank_sprites`: Custom section for tank animation data
- `obstacles`: Custom categorization of impassable/destructible tiles
- `terrain`: Custom categorization of passable/cover-providing tiles

### Tile Dimensions
- Source image: 800×600 pixels
- Tile size: 33×33 pixels
- Grid: 24 columns × (600/33 ≈ 18 rows) = 432 tiles total
- Pixel coordinates are zero-based (top-left origin)

### Usage in Game
- The game uses `TileMapLoader` to load tileset and map data
- `TileMapRenderer` renders tiles using pixel coordinates from tileset
- Collision detection uses `passable` property and obstacle categorization

## Implications for Tilemap Converter

1. **Tile ID Mapping**: Converter must map detected colors to tile IDs using the color mapping table above.
2. **Property Assignment**: Converter should assign appropriate properties (passable, destructible, hitPoints) based on tile type.
3. **Object vs Terrain**: Tank tiles (73, 74) are game objects, not terrain tiles. They may need special handling.
4. **JSON Output**: Converter should generate Tiled JSON format compatible with existing `TileMapLoader`.
5. **Coordinate System**: Converter must account for tile size mismatch (source image 16×16 vs tileset 33×33).

## Conclusion

The `tileset_full.json` provides a comprehensive definition of all game tiles with properties essential for gameplay logic. For the tilemap converter, the key requirements are:
- Accurate color-to-tile-ID mapping
- Proper assignment of tile properties
- Generation of Tiled JSON format with appropriate layer structure
- Handling of special objects (tanks, base) as object layer entries

This analysis provides the foundation for developing a robust image-to-tilemap conversion tool.

---
*Analysis performed: 2026-01-28*
*Source file: resources/tileset_full.json*
*Related files: resources/tileset.json (simplified version)*
