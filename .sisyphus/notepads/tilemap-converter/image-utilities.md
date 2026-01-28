# Image Processing Utilities and Canvas Usage Patterns

## 2026-01-28 04:50:00 - Analysis Results

### Core Image Loading Patterns

#### 1. ImageResource Class (`/src/utils/ImageResource.ts`)
The primary image loading utility using Promises with error handling:

```typescript
export class ImageResource {
  url: string;
  img: HTMLImageElement;
  cb: Function;

  constructor(url: string) {
    this.url = url;
    this.img = new Image();
  }

  _onLoad(evt: Event): void {
    // Implementation
  }

  onLoad(func: Function): ImageResource {
    this.cb = func;
    return this;
  }

  image(): HTMLImageElement {
    return this.img;
  }
}
```

**Usage Pattern**:
- Create `ImageResource` instance with image URL
- Call `onLoad()` with callback function
- Image loads asynchronously
- Used by `Render` class for loading tank brigade spritesheet

#### 2. Render Class Integration (`/src/rendering/Render.ts`)
```typescript
// Example from Render.ts
this.tileSheet = new ImageResource('resources/tankbrigade.png');
// Loads image and waits for ready
```

### Canvas API Usage Patterns

#### 1. Context Acquisition
```typescript
// From main.ts
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const context = canvas.getContext('2d');
```

#### 2. Offscreen Canvas Creation
```typescript
// From Render.ts and TileMapRenderer.ts
this.offscreenCanvas = document.createElement('canvas');
this.offscreenCanvas.width = mapWidth;
this.offscreenCanvas.height = mapHeight;
this.offscreenCtx = this.offscreenCanvas.getContext('2d');
```

#### 3. Drawing Operations
**Basic drawing**:
```typescript
ctx.drawImage(
  spriteSheet,
  sourceX, sourceY,
  tileSize, tileSize,
  destX, destY,
  tileSize, tileSize
);
```

**Tile rendering** (TileAtlas.ts):
```typescript
drawTile(ctx: CanvasRenderingContext2D, tileId: number, x: number, y: number): void {
  const tile = this.getTileById(tileId);
  if (tile) {
    ctx.drawImage(
      this.image,
      tile.sourceX, tile.sourceY,
      tile.width, tile.height,
      x, y,
      tile.width, tile.height
    );
  }
}
```

**Batch rendering**:
```typescript
drawTileBatch(ctx: CanvasRenderingContext2D, tileIds: number[], positions: {x: number, y: number}[]): void {
  // Optimized batch drawing
}
```

#### 4. Transformations for Rotation
```typescript
// From Render.ts for tank rotation
ctx.save();
ctx.translate(centerX, centerY);
ctx.rotate(angleInRadians);
ctx.translate(-centerX, -centerY);
ctx.drawImage(...);
ctx.restore();
```

#### 5. ImageData Usage (TileMapRenderer.ts)
```typescript
// Layer caching with ImageData
private layerCache: Map<string, ImageData> = new Map();

// Note: Current usage is for caching rendered layers, not pixel analysis
// but demonstrates ImageData familiarity in codebase
```

### Color Manipulation Patterns

#### 1. Hex Color Usage
```typescript
// From various render files
ctx.fillStyle = '#FFD700'; // Gold
ctx.fillStyle = '#404040'; // Dark gray
ctx.fillStyle = '#000000'; // Black
```

#### 2. RGBA for Transparency
```typescript
ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black
```

#### 3. Enemy Tank Colors (EnemyTank.ts)
```typescript
// Color definitions for different enemy types
const ENEMY_COLORS = {
  basic: '#FF0000',    // Red
  fast: '#00FF00',     // Green
  armor: '#0000FF',    // Blue
  boss: '#FF00FF'      // Purple
};
```

### Coordinate Conversion Utilities

#### 1. Grid-Pixel Conversion (TileMapLoader.ts)
```typescript
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
```

#### 2. Tile Size Constants
- **Render tile size**: 33 pixels (`tileRenderSize` in TileAtlas.ts)
- **Map tile size**: 33 pixels (from level JSON files)

### Missing Utilities for Tilemap Conversion

#### 1. Pixel Analysis Functions
- No existing `getImageData` usage for pixel color analysis
- No `putImageData` for image manipulation
- No color space conversion utilities

#### 2. Color Conversion Utilities
- No hex to RGB conversion functions
- No RGB to HSL conversion
- No color distance calculation

#### 3. Image Processing
- No image resizing functions
- No cropping utilities
- No image format conversion

### Recommended Approach for Tilemap Converter

#### 1. Image Loading
```typescript
// Use existing ImageResource pattern
const imageResource = new ImageResource(imagePath);
const image = await new Promise<HTMLImageElement>((resolve, reject) => {
  imageResource.onLoad(() => resolve(imageResource.image()));
});
```

#### 2. Canvas Setup for Pixel Analysis
```typescript
const canvas = document.createElement('canvas');
canvas.width = image.width;
canvas.height = image.height;
const ctx = canvas.getContext('2d');
ctx.drawImage(image, 0, 0);
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const pixelData = imageData.data; // Uint8ClampedArray
```

#### 3. Color Matching Algorithm
```typescript
function getTileIdFromColor(r: number, g: number, b: number): number {
  // Use color mapping from notepad analysis
  // Implement Euclidean distance or HSV comparison
  // Return tile ID (0 for empty)
}
```

#### 4. Grid Detection
```typescript
function detectGridSize(imageData: ImageData): { cols: number; rows: number; tileSize: number } {
  // Analyze image to detect grid pattern
  // Default: 20×15 grid with 16×16 tiles (from source image)
  // Convert to 33×33 tiles for game output
}
```

### Implementation Priorities

1. **Leverage existing patterns**: Use `ImageResource` for loading, existing coordinate conversion
2. **Implement missing utilities**: Create color matching and pixel analysis functions
3. **Follow established conventions**: Use same tile size (33px) and coordinate systems
4. **Reuse type definitions**: Use `TiledMap` interface from `TilemapConfig.ts`
5. **Integrate with validation**: Use `TileMapLoader` to validate generated maps

### References
- `ImageResource.ts`: Promise-based image loading
- `Render.ts`: Canvas context management and drawing patterns
- `TileAtlas.ts`: Tile rendering abstractions
- `TileMapLoader.ts`: Coordinate conversion utilities
- Existing color-to-tile mapping from notepad analysis