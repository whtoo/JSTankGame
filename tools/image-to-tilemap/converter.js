/**
 * Browser-compatible Image to Tilemap Converter
 * Standalone version for the web interface
 */

// ============================================================================
// Color Utilities
// ============================================================================

function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

function rgbDistance(color1, color2) {
  const dr = color1.r - color2.r;
  const dg = color1.g - color2.g;
  const db = color1.b - color2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function getPixelColor(imageData, x, y) {
  const index = (y * imageData.width + x) * 4;
  return {
    r: imageData.data[index],
    g: imageData.data[index + 1],
    b: imageData.data[index + 2]
  };
}

// ============================================================================
// Default Color Map (based on tileset_full.json)
// ============================================================================

const DEFAULT_COLOR_MAP = [
  { color: { r: 180, g: 40, b: 40 }, hex: '#B42828', tileId: 17, tileName: 'Brick Wall', tolerance: 50 },
  { color: { r: 220, g: 220, b: 220 }, hex: '#DCDCDC', tileId: 59, tileName: 'Concrete Block', tolerance: 30 },
  { color: { r: 60, g: 200, b: 60 }, hex: '#3CC83C', tileId: 99, tileName: 'Grass Terrain', tolerance: 40 },
  { color: { r: 255, g: 220, b: 0 }, hex: '#FFDC00', tileId: 73, tileName: 'Player Tank', tolerance: 40 },
  { color: { r: 0, g: 0, b: 0 }, hex: '#000000', tileId: 0, tileName: 'Empty Space', tolerance: 10 },
  { color: { r: 200, g: 50, b: 50 }, hex: '#C83232', tileId: 74, tileName: 'Enemy Tank', tolerance: 40 },
  { color: { r: 0, g: 150, b: 255 }, hex: '#0096FF', tileId: 54, tileName: 'Eagle Base', tolerance: 40 },
  { color: { r: 0, g: 100, b: 200 }, hex: '#0064C8', tileId: 139, tileName: 'Water', tolerance: 40 },
];

// ============================================================================
// ImageToTilemapConverter
// ============================================================================

export class ImageToTilemapConverter {
  constructor(options = {}) {
    this.options = {
      tileSize: 33,
      colorTolerance: 50,
      detectGrid: true,
      useMultiSampling: true,
      samplesPerSide: 3,
      ...options
    };
    this.colorMap = DEFAULT_COLOR_MAP;
  }

  async convert(imageFile, options = {}) {
    const opts = { ...this.options, ...options };
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const result = this.processImage(img, opts);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(imageFile);
    });
  }

  processImage(image, options) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    
    const analysis = this.analyzeImage(image);
    const grid = options.detectGrid 
      ? this.detectGrid(imageData) 
      : { 
          cols: options.gridCols || 20, 
          rows: options.gridRows || 15,
          tileWidth: Math.floor(image.width / (options.gridCols || 20)),
          tileHeight: Math.floor(image.height / (options.gridRows || 15)),
          detected: false 
        };
    
    const tileGrid = this.mapPixelsToTiles(imageData, grid, options);
    const objects = this.detectObjects(tileGrid, grid);
    const tiledMap = this.generateTiledMap(tileGrid, objects, grid, options);
    
    return {
      tiledMap,
      analysis,
      grid,
      tileGrid,
      objects,
      sourceImage: image
    };
  }

  analyzeImage(image) {
    return {
      width: image.width,
      height: image.height,
      aspectRatio: image.width / image.height
    };
  }

  detectGrid(imageData) {
    const { width, height } = imageData;
    
    // Try common tile sizes
    const commonSizes = [16, 20, 24, 32, 40, 48];
    
    for (const size of commonSizes) {
      if (width % size === 0 && height % size === 0) {
        return {
          cols: width / size,
          rows: height / size,
          tileWidth: size,
          tileHeight: size,
          detected: true
        };
      }
    }
    
    // Default to 16px tiles
    const tileSize = 16;
    return {
      cols: Math.floor(width / tileSize),
      rows: Math.floor(height / tileSize),
      tileWidth: tileSize,
      tileHeight: tileSize,
      detected: false
    };
  }

  mapPixelsToTiles(imageData, grid, options) {
    const tileGrid = [];
    const { cols, rows, tileWidth, tileHeight } = grid;
    
    for (let gy = 0; gy < rows; gy++) {
      tileGrid[gy] = [];
      
      for (let gx = 0; gx < cols; gx++) {
        const startX = gx * tileWidth;
        const startY = gy * tileHeight;
        
        if (options.useMultiSampling) {
          tileGrid[gy][gx] = this.matchTileWithMultiSampling(
            imageData, startX, startY, tileWidth, tileHeight, options
          );
        } else {
          const centerX = Math.floor(startX + tileWidth / 2);
          const centerY = Math.floor(startY + tileHeight / 2);
          tileGrid[gy][gx] = this.findBestTileId(
            getPixelColor(imageData, centerX, centerY),
            options.colorTolerance
          );
        }
      }
    }
    
    return tileGrid;
  }

  matchTileWithMultiSampling(imageData, startX, startY, tileWidth, tileHeight, options) {
    const samplesPerSide = options.samplesPerSide || 3;
    const tileIds = [];
    
    for (let sy = 0; sy < samplesPerSide; sy++) {
      for (let sx = 0; sx < samplesPerSide; sx++) {
        const x = startX + Math.floor((sx + 0.5) * tileWidth / samplesPerSide);
        const y = startY + Math.floor((sy + 0.5) * tileHeight / samplesPerSide);
        
        if (x < imageData.width && y < imageData.height) {
          const color = getPixelColor(imageData, x, y);
          tileIds.push(this.findBestTileId(color, options.colorTolerance));
        }
      }
    }
    
    return this.getMode(tileIds.length > 0 ? tileIds : [0]);
  }

  findBestTileId(color, tolerance) {
    let minDistance = Infinity;
    let bestTileId = 0;
    
    for (const mapping of this.colorMap) {
      const distance = rgbDistance(color, mapping.color);
      const mapTolerance = mapping.tolerance || tolerance;
      
      if (distance < minDistance && distance < mapTolerance) {
        minDistance = distance;
        bestTileId = mapping.tileId;
      }
    }
    
    return bestTileId;
  }

  getMode(array) {
    const frequency = new Map();
    let maxFreq = 0;
    let mode = array[0] || 0;
    
    for (const item of array) {
      const freq = (frequency.get(item) || 0) + 1;
      frequency.set(item, freq);
      
      if (freq > maxFreq) {
        maxFreq = freq;
        mode = item;
      }
    }
    
    return mode;
  }

  detectObjects(tileGrid, grid) {
    const objects = [];
    const { cols, rows } = grid;
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const tileId = tileGrid[y][x];
        
        if (tileId === 73) {
          objects.push({
            type: 'player',
            gridX: x,
            gridY: y,
            pixelX: x * grid.tileWidth,
            pixelY: y * grid.tileHeight,
            tileId: 73
          });
        } else if (tileId === 74) {
          objects.push({
            type: 'enemy',
            gridX: x,
            gridY: y,
            pixelX: x * grid.tileWidth,
            pixelY: y * grid.tileHeight,
            tileId: 74
          });
        } else if (tileId === 54) {
          objects.push({
            type: 'base',
            gridX: x,
            gridY: y,
            pixelX: x * grid.tileWidth,
            pixelY: y * grid.tileHeight,
            tileId: 54
          });
        }
      }
    }
    
    return objects;
  }

  generateTiledMap(tileGrid, objects, grid, options) {
    const { cols, rows } = grid;
    
    // Flatten tile grid for Tiled format (row-major order)
    const data = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        data.push(tileGrid[y][x]);
      }
    }
    
    // Build Tiled JSON structure
    const tiledMap = {
      version: '1.1',
      tiledversion: '1.11.0',
      name: 'Generated Map',
      type: 'map',
      orientation: 'orthogonal',
      renderorder: 'right-down',
      width: cols,
      height: rows,
      tilewidth: options.tileSize,
      tileheight: options.tileSize,
      nextobjectid: objects.length + 1,
      backgroundcolor: '#000000',
      properties: {
        generated: true,
        generatedAt: new Date().toISOString()
      },
      tilesets: [
        {
          firstgid: 1,
          name: 'Tank Brigade',
          filename: 'tileset_full.json'
        }
      ],
      layers: [
        {
          id: 1,
          name: 'Ground',
          type: 'tilelayer',
          width: cols,
          height: rows,
          opacity: 1,
          visible: true,
          x: 0,
          y: 0,
          data: data.map(id => id + 1) // Tiled uses 1-based indexing
        }
      ],
      objects: {}
    };
    
    // Add objects layer
    if (objects.length > 0) {
      const playerObj = objects.find(o => o.type === 'player');
      const baseObj = objects.find(o => o.type === 'base');
      const enemyObjs = objects.filter(o => o.type === 'enemy');
      
      if (playerObj) {
        tiledMap.objects.player = {
          id: 1,
          name: 'Player',
          type: 'player_tank',
          gid: 74, // Adjusted for firstgid
          position: {
            gridX: playerObj.gridX,
            gridY: playerObj.gridY,
            pixelX: playerObj.pixelX,
            pixelY: playerObj.pixelY
          }
        };
      }
      
      if (baseObj) {
        tiledMap.objects.base = {
          id: 2,
          name: 'Base',
          type: 'base_eagle',
          gid: 55,
          position: {
            gridX: baseObj.gridX,
            gridY: baseObj.gridY,
            pixelX: baseObj.pixelX,
            pixelY: baseObj.pixelY
          }
        };
      }
      
      if (enemyObjs.length > 0) {
        tiledMap.objects.enemies = enemyObjs.map((obj, i) => ({
          id: 10 + i,
          name: `Enemy ${i + 1}`,
          type: 'enemy_tank',
          gid: 75,
          position: {
            gridX: obj.gridX,
            gridY: obj.gridY,
            pixelX: obj.pixelX,
            pixelY: obj.pixelY
          }
        }));
      }
    }
    
    return tiledMap;
  }
}

export default ImageToTilemapConverter;
