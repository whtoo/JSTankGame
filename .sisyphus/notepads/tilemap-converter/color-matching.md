# Color Matching Algorithms and Image Processing Patterns

## 2026-01-28 05:11:00 - Codebase Analysis Results

### 1. Existing Color Usage Patterns

#### 1.1 Hex Color Strings
**Location**: Multiple files (`Render.ts`, `EnemyTank.ts`, `GameConfig.ts`)

**Pattern**:
```typescript
// In Render.ts for tank rendering
ctx.fillStyle = '#FFD700'; // Gold
ctx.fillStyle = '#404040'; // Dark gray

// In EnemyTank.ts for enemy type colors
const ENEMY_COLORS = {
  basic: '#FFFFFF',    // White
  fast: '#FFD700',     // Gold
  armor: '#87CEEB',    // Sky blue
  boss: '#FF6B6B'      // Light red
};

// In GameConfig.ts
backgroundColor: '#000000'
```

#### 1.2 RGBA for Transparency
**Location**: `TileMapIntegrationExample.ts`

**Pattern**:
```typescript
ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black
```

#### 1.3 Color Property in Interfaces
**Location**: `src/types/index.ts`

**Pattern**:
```typescript
interface EnemyTypeConfig {
  color?: string; // Optional hex color string
}
```

### 2. Image Processing Patterns

#### 2.1 ImageData Usage
**Location**: `TileMapRenderer.ts`

**Pattern**: Used for layer caching only, not for pixel analysis
```typescript
private layerCache: Map<string, ImageData> = new Map();

// Note: No getImageData or putImageData for pixel analysis
```

#### 2.2 Canvas Context Creation
**Location**: `Render.ts`, `main.ts`

**Pattern**:
```typescript
// Standard context acquisition
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const context = canvas.getContext('2d');

// Offscreen canvas for caching
const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');
```

### 3. Distance Calculation (Spatial Only)

**Location**: `src/utils/MovementUtils.ts`

**Pattern**: Euclidean distance for spatial coordinates only
```typescript
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
```

**Note**: This pattern can be adapted for color distance calculation.

### 4. Missing Utilities Identified

#### 4.1 Color Conversion Functions
- No `hexToRgb(hex: string): { r, g, b }`
- No `rgbToHex(r, g, b): string`
- No `rgbToHsl(r, g, b): { h, s, l }`
- No `hslToRgb(h, s, l): { r, g, b }`

#### 4.2 Color Matching Algorithms
- No Euclidean distance for colors
- No color tolerance/threshold systems
- No palette mapping utilities
- No dominant color extraction

#### 4.3 Pixel Analysis Utilities
- No `getImageData` usage for color sampling
- No `putImageData` for image manipulation
- No image resizing/cropping functions
- No pixel coordinate mapping utilities

### 5. Recommended Implementation for Tilemap Converter

#### 5.1 Color Conversion Utilities
```typescript
// Proposed new utilities in src/utils/ColorUtils.ts
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Implementation
}

export function rgbDistance(r1, g1, b1, r2, g2, b2): number {
  // Euclidean distance in RGB space
  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  );
}

export function findBestColorMatch(r, g, b, colorMap, tolerance = 50): number {
  // Find closest color in mapping with tolerance
}
```

#### 5.2 Pixel Analysis Pattern
```typescript
// Use existing ImageResource pattern for loading
const imageResource = new ImageResource(imagePath);
const image = await new Promise<HTMLImageElement>((resolve) => {
  imageResource.onLoad(() => resolve(imageResource.image()));
});

// Create canvas for pixel analysis
const canvas = document.createElement('canvas');
canvas.width = image.width;
canvas.height = image.height;
const ctx = canvas.getContext('2d');
ctx.drawImage(image, 0, 0);
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const pixelData = imageData.data; // Uint8ClampedArray
```

#### 5.3 Existing Color Mapping for Tilemap Conversion
Based on previous analysis of `target_pic_1.jpeg`:
- `#B42828` (r: 180, g: 40, b: 40) → tile ID 17 (red brick wall)
- `#DCDCDC` (r: 220, g: 220, b: 220) → tile ID 59 (white concrete)
- `#3CC83C` (r: 60, g: 200, b: 60) → tile ID 99 (green grass)
- `#FFDC00` (r: 255, g: 220, b: 0) → tile ID 73 (yellow player tank)
- Black + white eagle → tile ID 54 (base eagle)
- `#000000` (r: 0, g: 0, b: 0) → tile ID 0 (empty)

### 6. Implementation Priorities

1. **Color conversion utilities**: Implement `hexToRgb`, `rgbDistance` following project patterns
2. **Color matching algorithm**: Use Euclidean distance with tolerance threshold
3. **Pixel sampling**: Multiple sample points per tile for accuracy
4. **Anti-aliasing handling**: Use tolerance and majority voting
5. **Special pattern detection**: Base eagle detection using template matching

### 7. References

- `MovementUtils.ts`: Example of distance calculation pattern
- `ImageResource.ts`: Image loading pattern
- `Render.ts`: Canvas context management
- Existing color mapping from `.sisyphus/notepads/tilemap-conversion/learnings.md`

### 8. Notes

- The project has no existing color matching or conversion utilities
- Need to implement from scratch but follow established coding patterns
- Color mapping is external to tileset (derived from image analysis)
- Tolerance values need empirical testing (suggest starting with 50 Euclidean distance units)