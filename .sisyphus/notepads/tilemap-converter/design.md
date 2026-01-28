# ImageToTilemapConverter Design Document

## 2026-01-28 05:00:00 - Converter Architecture Design

### 1. Overview

**Goal**: Create a tool that converts design images (like target_pic_1.jpeg) into Tiled JSON format compatible with existing TileMapLoader system.

**Input**: Image file (JPG, PNG, WebP) with grid-based design (20×15 tiles, 16×16 pixels per tile)

**Output**: Valid Tiled JSON map file (33×33 pixels per tile) with:
- Terrain layer (tile IDs mapped from image colors)
- Object layer (player spawn, base position)
- Map properties (level metadata)

### 2. Architecture Components

#### 2.1 Core Converter Class
```typescript
// Location: src/tools/ImageToTilemapConverter.ts
class ImageToTilemapConverter {
  // Configuration
  private options: ConversionOptions;
  
  // State
  private colorMap: ColorToTileMap[];
  private tileSize: number = 33;
  
  // Methods
  async convert(imageFile: File, options?: Partial<ConversionOptions>): Promise<TiledMap>;
  async convertFromUrl(imageUrl: string, options?: Partial<ConversionOptions>): Promise<TiledMap>;
  async convertFromPath(imagePath: string, options?: Partial<ConversionOptions>): Promise<TiledMap>;
  
  // Utilities
  private analyzeImage(image: HTMLImageElement): ImageAnalysisResult;
  private detectGrid(imageData: ImageData): GridDetectionResult;
  private mapPixelsToTiles(imageData: ImageData, grid: GridInfo): number[][];
  private detectObjects(grid: number[][], imageData: ImageData): MapObject[];
  private generateTiledMap(grid: number[][], objects: MapObject[]): TiledMap;
}
```

#### 2.2 Supporting Interfaces
```typescript
interface ConversionOptions {
  tileSize: number;           // Output tile size (default: 33)
  colorTolerance: number;     // Euclidean distance tolerance (default: 50)
  detectGrid: boolean;        // Auto-detect grid (default: true)
  gridCols?: number;          // Manual grid columns (if detectGrid false)
  gridRows?: number;          // Manual grid rows (if detectGrid false)
  tileWidth?: number;         // Manual tile width in pixels (if detectGrid false)
  tileHeight?: number;        // Manual tile height in pixels (if detectGrid false)
}

interface ColorToTileMap {
  color: { r: number; g: number; b: number; a?: number };
  hex: string;
  tileId: number;
  tileName: string;
  tolerance?: number;
}

interface ImageAnalysisResult {
  width: number;
  height: number;
  grid: GridInfo;
  dominantColors: DominantColor[];
}

interface GridInfo {
  cols: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
  detected: boolean;
}

interface MapObject {
  type: 'player' | 'base' | 'enemy' | 'spawn';
  gridX: number;
  gridY: number;
  pixelX: number;
  pixelY: number;
  properties?: Record<string, any>;
}
```

### 3. Color Mapping Strategy

#### 3.1 Default Color-to-Tile Mapping
Based on analysis of target_pic_1.jpeg and tileset_full.json:

```typescript
const DEFAULT_COLOR_MAP: ColorToTileMap[] = [
  {
    color: { r: 180, g: 40, b: 40 },    // #B42828
    hex: '#B42828',
    tileId: 17,
    tileName: 'Brick Wall',
    tolerance: 50
  },
  {
    color: { r: 220, g: 220, b: 220 },  // #DCDCDC
    hex: '#DCDCDC',
    tileId: 59,
    tileName: 'Concrete Block',
    tolerance: 30
  },
  {
    color: { r: 60, g: 200, b: 60 },    // #3CC83C
    hex: '#3CC83C',
    tileId: 99,
    tileName: 'Grass Terrain',
    tolerance: 40
  },
  {
    color: { r: 255, g: 220, b: 0 },    // #FFDC00
    hex: '#FFDC00',
    tileId: 73,
    tileName: 'Player Tank',
    tolerance: 40
  },
  {
    color: { r: 0, g: 0, b: 0 },        // #000000
    hex: '#000000',
    tileId: 0,
    tileName: 'Empty Space',
    tolerance: 10
  }
];
```

#### 3.2 Color Matching Algorithm
```typescript
function findBestTileId(r: number, g: number, b: number, colorMap: ColorToTileMap[]): number {
  let minDistance = Infinity;
  let bestTileId = 0; // Default to empty
  
  for (const colorDef of colorMap) {
    const distance = Math.sqrt(
      Math.pow(r - colorDef.color.r, 2) +
      Math.pow(g - colorDef.color.g, 2) +
      Math.pow(b - colorDef.color.b, 2)
    );
    
    if (distance < minDistance && distance < (colorDef.tolerance || 50)) {
      minDistance = distance;
      bestTileId = colorDef.tileId;
    }
  }
  
  return bestTileId;
}
```

#### 3.3 Special Cases
- **Base Eagle**: Pattern detection (black background + white eagle shape)
- **Anti-aliasing**: Use tolerance and sample multiple pixels per tile
- **Mixed colors**: Use dominant color in tile region

### 4. Grid Detection Algorithm

#### 4.1 Auto-detection (for unknown images)
```typescript
function detectGridFromImage(imageData: ImageData): GridInfo {
  // Analyze pixel changes to find grid boundaries
  // Look for repeating patterns and color boundaries
  // Default to known values for classic NES Battle City:
  return {
    cols: 20,
    rows: 15,
    tileWidth: 16,  // Source image tile size
    tileHeight: 16,
    detected: true
  };
}
```

#### 4.2 Grid to Tile Conversion
```typescript
function createTileGrid(imageData: ImageData, grid: GridInfo, colorMap: ColorToTileMap[]): number[][] {
  const tileGrid: number[][] = [];
  const { cols, rows, tileWidth, tileHeight } = grid;
  
  for (let y = 0; y < rows; y++) {
    tileGrid[y] = [];
    for (let x = 0; x < cols; x++) {
      // Sample multiple points within tile for better accuracy
      const samplePoints = [
        { x: tileWidth / 2, y: tileHeight / 2 },          // Center
        { x: tileWidth / 4, y: tileHeight / 4 },          // Top-left quadrant
        { x: 3 * tileWidth / 4, y: tileHeight / 4 },      // Top-right quadrant
        { x: tileWidth / 4, y: 3 * tileHeight / 4 },      // Bottom-left quadrant
        { x: 3 * tileWidth / 4, y: 3 * tileHeight / 4 }   // Bottom-right quadrant
      ];
      
      const colors = samplePoints.map(point => {
        const pixelX = Math.floor(x * tileWidth + point.x);
        const pixelY = Math.floor(y * tileHeight + point.y);
        const pixelIndex = (pixelY * imageData.width + pixelX) * 4;
        return {
          r: imageData.data[pixelIndex],
          g: imageData.data[pixelIndex + 1],
          b: imageData.data[pixelIndex + 2]
        };
      });
      
      // Use mode (most common) tile ID from samples
      const tileIds = colors.map(color => findBestTileId(color.r, color.g, color.b, colorMap));
      tileGrid[y][x] = getMode(tileIds);
    }
  }
  
  return tileGrid;
}
```

### 5. Object Detection

#### 5.1 Player Tank Detection
```typescript
function detectPlayerTank(tileGrid: number[][], imageData: ImageData): MapObject | null {
  // Look for tile ID 73 in grid
  for (let y = 0; y < tileGrid.length; y++) {
    for (let x = 0; x < tileGrid[y].length; x++) {
      if (tileGrid[y][x] === 73) {
        // Convert to pixel coordinates (using 33px output tile size)
        const pixelX = x * 33 + 16;  // Center of tile
        const pixelY = y * 33 + 16;
        
        return {
          type: 'player',
          gridX: x,
          gridY: y,
          pixelX,
          pixelY,
          properties: {
            direction: 'up',  // Default direction
            faction: 'player'
          }
        };
      }
    }
  }
  
  return null;
}
```

#### 5.2 Base Detection
```typescript
function detectBase(tileGrid: number[][], imageData: ImageData): MapObject | null {
  // Pattern detection for eagle on black background
  // For initial version, use manual position or color-based detection
  // Look for black tile (#000000) with specific pattern
  
  // Simplified: Look for tile ID 54 in grid or pattern match
  for (let y = 0; y < tileGrid.length; y++) {
    for (let x = 0; x < tileGrid[y].length; x++) {
      if (tileGrid[y][x] === 54) {
        const pixelX = x * 33 + 16;
        const pixelY = y * 33 + 16;
        
        return {
          type: 'base',
          gridX: x,
          gridY: y,
          pixelX,
          pixelY,
          properties: {
            critical: true,
            hitPoints: 1,
            faction: 'player'
          }
        };
      }
    }
  }
  
  return null;
}
```

### 6. Tiled JSON Generation

#### 6.1 Map Structure
```typescript
function generateTiledMap(
  tileGrid: number[][],
  objects: MapObject[],
  options: ConversionOptions
): TiledMap {
  const cols = tileGrid[0].length;
  const rows = tileGrid.length;
  
  // Flatten grid data for Tiled JSON
  const layerData: number[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Apply firstgid offset (typically 1)
      layerData.push(tileGrid[y][x] === 0 ? 0 : tileGrid[y][x] + 1);
    }
  }
  
  // Create objects layer
  const objectLayerObjects = objects.map(obj => ({
    id: obj.type === 'player' ? 1 : 2,
    name: obj.type === 'player' ? 'Player Start' : 'Base',
    type: obj.type,
    gid: obj.type === 'player' ? 74 : 55, // GID with firstgid offset
    x: obj.pixelX,
    y: obj.pixelY,
    width: options.tileSize,
    height: options.tileSize
  }));
  
  return {
    version: '1.10',
    tiledversion: '1.11.0',
    name: `Converted Level - ${new Date().toISOString()}`,
    type: 'map',
    orientation: 'orthogonal',
    renderorder: 'right-down',
    width: cols,
    height: rows,
    tilewidth: options.tileSize,
    tileheight: options.tileSize,
    nextobjectid: objectLayerObjects.length + 1,
    backgroundcolor: '#000000',
    properties: {
      level: 3,
      playerLives: 3,
      enemies: 20,
      difficulty: 'normal',
      description: 'Automatically converted from image',
      convertedDate: new Date().toISOString()
    },
    tilesets: [
      {
        firstgid: 1,
        name: 'Tank Brigade Complete Tileset',
        filename: '../tileset_full.json'
      }
    ],
    layers: [
      {
        id: 1,
        name: 'Ground Layer',
        type: 'tilelayer',
        width: cols,
        height: rows,
        opacity: 1,
        visible: true,
        x: 0,
        y: 0,
        data: layerData
      },
      {
        id: 2,
        name: 'Object Layer',
        type: 'objectgroup',
        width: cols,
        height: rows,
        opacity: 1,
        visible: true,
        x: 0,
        y: 0,
        objects: objectLayerObjects
      }
    ]
  };
}
```

### 7. Integration with Existing System

#### 7.1 Validation with TileMapLoader
```typescript
async function validateGeneratedMap(tiledMap: TiledMap): Promise<boolean> {
  try {
    const tileMapLoader = getTileMapLoader();
    // Save to temporary file and attempt to load
    const tempPath = `/temp/validation-${Date.now()}.json`;
    // Implementation depends on environment
    return true;
  } catch (error) {
    console.error('Map validation failed:', error);
    return false;
  }
}
```

#### 7.2 Usage Example
```typescript
// Browser environment
const converter = new ImageToTilemapConverter();
const fileInput = document.getElementById('image-upload') as HTMLInputElement;
const file = fileInput.files[0];

const tiledMap = await converter.convert(file, {
  tileSize: 33,
  colorTolerance: 50
});

// Download JSON
const jsonStr = JSON.stringify(tiledMap, null, 2);
const blob = new Blob([jsonStr], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'converted-level.json';
a.click();
```

### 8. File Structure

```
src/tools/
├── ImageToTilemapConverter.ts    # Main converter class
├── color-matching/
│   ├── ColorMatcher.ts           # Color matching algorithms
│   ├── ColorUtils.ts             # Color conversion utilities
│   └── ColorMaps.ts              # Predefined color mappings
├── grid-detection/
│   ├── GridDetector.ts           # Grid detection algorithms
│   └── GridUtils.ts              # Grid analysis utilities
├── object-detection/
│   ├── ObjectDetector.ts         # Object detection
│   └── PatternMatcher.ts         # Pattern matching for special objects
└── tiled-json/
    ├── TiledJsonGenerator.ts     # Tiled JSON generation
    └── TiledJsonValidator.ts     # JSON validation
```

### 9. Testing Strategy

#### 9.1 Unit Tests
- Color matching accuracy
- Grid detection correctness
- Tile ID mapping validation
- Object detection precision

#### 9.2 Integration Tests
- Complete conversion pipeline
- Output validation with TileMapLoader
- Round-trip: convert → load → render

#### 9.3 Visual Tests
- Compare rendered output with source image
- Verify tile placement accuracy

### 10. Performance Considerations

1. **Large images**: Use Web Workers for pixel analysis
2. **Memory usage**: Release ImageData after processing
3. **Caching**: Cache color matching results
4. **Progressive processing**: Process in chunks for UI responsiveness

### 11. Next Implementation Steps

1. **Phase 1**: Core converter with hardcoded grid (20×15, 16px tiles)
2. **Phase 2**: Add auto-grid detection
3. **Phase 3**: Enhanced object detection (pattern matching)
4. **Phase 4**: UI integration and preview
5. **Phase 5**: Batch processing and optimization

### 12. Success Metrics

- **Accuracy**: >90% tile matching accuracy
- **Performance**: <5 seconds for 320×240 images
- **Compatibility**: Output loads successfully with TileMapLoader
- **Usability**: Simple interface with preview and configuration