/**
 * SmartTileTypes - 智能瓦片切割的类型定义
 * 
 * 支持矩形瓦片、精灵分类、感知哈希等高级特性
 */

/**
 * 瓦片尺寸（支持矩形）
 */
export interface TileDimensions {
  width: number;
  height: number;
}

/**
 * 扩展的网格信息
 */
export interface SmartGridInfo extends TileDimensions {
  cols: number;
  rows: number;
  detected: boolean;
  confidence: number;
  detectionMethod: string;
}

/**
 * 瓦片分类结果
 */
export interface TileClassification {
  gridX: number;
  gridY: number;
  pixelX: number;
  pixelY: number;
  isSprite: boolean;
  entropy: number;
  frequencyScore: number;
  edgeDensity: number;
  uniqueColors: number;
  perceptualHash: string;
  confidence: number;
}

/**
 * 颜色分析结果
 */
export interface ColorAnalysis {
  uniqueColors: number;
  entropy: number;
  dominantColors: Array<{
    r: number;
    g: number;
    b: number;
    frequency: number;
  }>;
  palette: number[][];
}

/**
 * 智能瓦片配置
 */
export interface SmartTileConfig {
  // 网格信息
  tileWidth: number;
  tileHeight: number;
  cols: number;
  rows: number;
  isAutoDetected: boolean;
  confidence: number;
  
  // 分类结果
  uniqueTileCount: number;
  sprites: TileClassification[];
  backgroundTiles: TileClassification[];
  allClassifications: TileClassification[][];
  
  // 分析数据
  colorAnalysis: ColorAnalysis;
  
  // 原始图像引用
  sourceImage?: HTMLImageElement;
  sourceImageData?: ImageData;
}

/**
 * 智能切割选项
 */
export interface SmartTileSlicerOptions {
  // 尺寸检测
  autoDetectSize: boolean;
  expectedTileWidth?: number;
  expectedTileHeight?: number;
  minTileSize: number;
  maxTileSize: number;
  
  // 精灵检测
  enableSpriteDetection: boolean;
  entropyThreshold: number;
  spriteConfidenceThreshold: number;
  
  // 哈希与去重
  enablePerceptualHash: boolean;
  hashSize: number;
  
  // NES优化
  enableNESOptimization: boolean;
  nestileSize: number;
  maxPaletteColors: number;
  
  // 采样设置
  sampleRows: number;
  sampleStep: number;
}

/**
 * 默认选项
 */
export const DEFAULT_SMART_TILE_OPTIONS: SmartTileSlicerOptions = {
  autoDetectSize: true,
  minTileSize: 8,
  maxTileSize: 64,
  enableSpriteDetection: true,
  entropyThreshold: 1.5,
  spriteConfidenceThreshold: 0.6,
  enablePerceptualHash: true,
  hashSize: 8,
  enableNESOptimization: false,
  nestileSize: 8,
  maxPaletteColors: 4,
  sampleRows: 100,
  sampleStep: 10
};

/**
 * 周期性检测结果
 */
export interface PeriodicityResult {
  period: number;
  score: number;
  confidence: number;
  method: string;
}

/**
 * 2D周期性检测结果
 */
export interface TileSizeDetectionResult {
  width: PeriodicityResult;
  height: PeriodicityResult;
  combinedScore: number;
}

/**
 * 精灵检测结果
 */
export interface SpriteDetectionResult {
  isSprite: boolean;
  confidence: number;
  features: {
    entropy: number;
    frequencyScore: number;
    edgeDensity: number;
    colorCount: number;
  };
}

/**
 * 瓦片提取结果
 */
export interface ExtractedTile {
  id: number;
  gridX: number;
  gridY: number;
  pixelX: number;
  pixelY: number;
  width: number;
  height: number;
  imageData: ImageData;
  classification?: TileClassification;
}

/**
 * 去重结果
 */
export interface DeduplicationResult {
  uniqueTiles: ExtractedTile[];
  tileMapping: Map<number, number>;
  duplicates: Map<number, number[]>;
}