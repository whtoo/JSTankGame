/**
 * TileMatchingService - 瓦片匹配服务
 * 
 * 功能：集成颜色匹配和像素签名匹配，提供缓存、并行处理和错误处理
 */

import type { 
  TileSignature, 
  MatchResult as TileMatchResult,
  MatchingOptions as TileMatchingOptions 
} from './TileMatcher';
import {
  extractTilesetSignatures,
  extractTargetTile,
  matchTile as tileMatch,
  calculateAverageColor,
  colorDistance
} from './TileMatcher';
import type { ColorToTileMap } from '../ImageToTilemapConverter';

// ============================================================================
// 错误类型定义
// ============================================================================

export type TileMatchingErrorCode =
  | 'SIGNATURE_EXTRACTION_FAILED'
  | 'TILE_EXTRACTION_FAILED'
  | 'LOW_CONFIDENCE_MATCH'
  | 'NO_VALID_MATCH'
  | 'TILESET_LOAD_FAILED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'INVALID_TILE_SIZE'
  | 'INVALID_IMAGE_SOURCE'
  | 'CACHE_ERROR';

export class TileMatchingError extends Error {
  constructor(
    message: string,
    public code: TileMatchingErrorCode,
    public context?: any
  ) {
    super(message);
    this.name = 'TileMatchingError';
  }
}

// ============================================================================
// 接口定义
// ============================================================================

export interface TileMatchingServiceOptions {
  /** 是否启用瓦片匹配 */
  enabled: boolean;
  /** 瓦片图集图像或URL */
  tilesetImage?: HTMLImageElement | string;
  /** 源瓦片尺寸（瓦片图集中的瓦片大小） */
  tilesetTileSize: number;                  // 33
  /** 瓦片图集列数 */
  tilesetColumns: number;                   // 24
  /** 瓦片图集总瓦片数 */
  tilesetTileCount: number;                 // 432
  /** 目标瓦片尺寸（目标图片中的瓦片大小） */
  targetTileSize: number;                   // 48
  /** 使用的匹配方法 */
  matchingMethods: string[];
  /** 置信度阈值，低于此值使用备选方案 */
  confidenceThreshold: number;              // 0.0-1.0
  /** 是否使用混合匹配（颜色+像素） */
  useHybridMatching: boolean;
  /** 是否在置信度低时回退到颜色匹配 */
  colorMatchFallback: boolean;
  /** 是否启用并行处理 */
  parallelProcessing: boolean;
  /** 是否缓存签名 */
  cacheSignatures: boolean;
}

export interface MatchingResult {
  tileId: number;
  confidence: number;
  method: string;
  usedFallback: boolean;
}

export interface TileMatchGrid {
  tileIds: number[][];
  confidences: number[][];
  methods: string[][];
}

export interface TilesetSignatures {
  signatures: TileSignature[];
  extractedAt: number;
  tileSize: number;
  tileCount: number;
  hash: string;
}

export interface GridInfo {
  cols: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
  detected: boolean;
}

export interface MatchStatistics {
  totalTiles: number;
  highConfidenceTiles: number;
  mediumConfidenceTiles: number;
  lowConfidenceTiles: number;
  averageConfidence: number;
  matchingMethods: string[];
}

// ============================================================================
// 主服务类
// ============================================================================

export class TileMatchingService {
  private signatureCache = new Map<string, TilesetSignatures>();
  private tilesetImage: HTMLImageElement | null = null;
  private defaultOptions: TileMatchingServiceOptions;

  constructor(options?: Partial<TileMatchingServiceOptions>) {
    this.defaultOptions = {
      enabled: true,
      tilesetTileSize: 33,
      tilesetColumns: 24,
      tilesetTileCount: 432,
      targetTileSize: 48,
      matchingMethods: ['averageColor', 'histogram'],
      confidenceThreshold: 0.7,
      useHybridMatching: true,
      colorMatchFallback: true,
      parallelProcessing: false,
      cacheSignatures: true,
      ...options
    };
  }

  // ==========================================================================
  // 公共方法
  // ==========================================================================

  /**
   * 加载并缓存瓦片图集签名
   */
  async loadTilesetSignatures(
    tilesetSource: HTMLImageElement | string,
    options: Partial<TileMatchingServiceOptions> = {}
  ): Promise<TilesetSignatures> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    // 生成缓存键
    const cacheKey = this.generateCacheKey(tilesetSource, mergedOptions);
    
    // 检查缓存
    if (mergedOptions.cacheSignatures && this.signatureCache.has(cacheKey)) {
      const cached = this.signatureCache.get(cacheKey)!;
      console.log(`Using cached tileset signatures (${cached.signatures.length} tiles)`);
      return cached;
    }
    
    try {
      // 加载瓦片图集图像
      const tilesetImage = await this.loadImage(tilesetSource);
      this.tilesetImage = tilesetImage;
      
      // 验证图像尺寸
      this.validateTilesetImage(tilesetImage, mergedOptions);
      
      // 提取签名
      console.log(`Extracting signatures for ${mergedOptions.tilesetTileCount} tiles...`);
      const signatures = extractTilesetSignatures(
        tilesetImage,
        mergedOptions.tilesetTileSize,
        mergedOptions.tilesetColumns,
        mergedOptions.tilesetTileCount
      );
      
      if (signatures.length !== mergedOptions.tilesetTileCount) {
        throw new TileMatchingError(
          `Expected ${mergedOptions.tilesetTileCount} signatures, got ${signatures.length}`,
          'SIGNATURE_EXTRACTION_FAILED',
          { expected: mergedOptions.tilesetTileCount, actual: signatures.length }
        );
      }
      
      const result: TilesetSignatures = {
        signatures,
        extractedAt: Date.now(),
        tileSize: mergedOptions.tilesetTileSize,
        tileCount: mergedOptions.tilesetTileCount,
        hash: cacheKey
      };
      
      // 缓存结果
      if (mergedOptions.cacheSignatures) {
        this.signatureCache.set(cacheKey, result);
        console.log(`Cached tileset signatures with key: ${cacheKey.substring(0, 32)}...`);
      }
      
      return result;
    } catch (error) {
      if (error instanceof TileMatchingError) {
        throw error;
      }
      throw new TileMatchingError(
        `Failed to load tileset signatures: ${error}`,
        'SIGNATURE_EXTRACTION_FAILED',
        { originalError: error }
      );
    }
  }

  /**
   * 匹配单个瓦片
   */
  async matchTile(
    targetTileData: ImageData,
    signatures: TilesetSignatures,
    options: Partial<TileMatchingServiceOptions> = {}
  ): Promise<MatchingResult> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      // 配置TileMatcher选项
      const tileMatcherOptions: Partial<TileMatchingOptions> = {
        targetTileSize: mergedOptions.targetTileSize,
        sourceTileSize: mergedOptions.tilesetTileSize,
        confidenceThreshold: mergedOptions.confidenceThreshold,
        preferredMethods: mergedOptions.matchingMethods
      };
      
      // 使用TileMatcher进行像素级匹配
      const tileMatchResult = tileMatch(targetTileData, signatures.signatures, tileMatcherOptions);
      
      // 检查置信度阈值
      if (tileMatchResult.confidence >= mergedOptions.confidenceThreshold) {
        return {
          tileId: tileMatchResult.tileId,
          confidence: tileMatchResult.confidence,
          method: tileMatchResult.method,
          usedFallback: false
        };
      }
      
      // 置信度低于阈值，使用颜色匹配回退
      if (mergedOptions.colorMatchFallback) {
        return this.colorMatchFallback(targetTileData, signatures);
      }
      
      // 返回低置信度匹配
      return {
        tileId: tileMatchResult.tileId,
        confidence: tileMatchResult.confidence,
        method: tileMatchResult.method,
        usedFallback: false
      };
    } catch (error) {
      // 匹配失败，使用颜色匹配回退
      if (mergedOptions.colorMatchFallback) {
        console.warn(`Tile matching failed, using color fallback:`, error);
        return this.colorMatchFallback(targetTileData, signatures);
      }
      
      throw new TileMatchingError(
        `Failed to match tile: ${error}`,
        'NO_VALID_MATCH',
        { originalError: error }
      );
    }
  }

  /**
   * 匹配整个网格（顺序处理）
   */
  async matchGrid(
    targetImage: HTMLImageElement,
    grid: GridInfo,
    signatures: TilesetSignatures,
    options: Partial<TileMatchingServiceOptions> = {}
  ): Promise<TileMatchGrid> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    // 如果启用并行处理，使用并行版本
    if (mergedOptions.parallelProcessing) {
      return this.matchGridParallel(targetImage, grid, signatures, mergedOptions);
    }
    
    const tileIds: number[][] = [];
    const confidences: number[][] = [];
    const methods: string[][] = [];
    
    // 验证目标图像尺寸
    this.validateTargetImage(targetImage, grid, mergedOptions);
    
    console.log(`Matching ${grid.rows}x${grid.cols} grid (${grid.rows * grid.cols} tiles)...`);
    
    for (let y = 0; y < grid.rows; y++) {
      tileIds[y] = [];
      confidences[y] = [];
      methods[y] = [];
      
      for (let x = 0; x < grid.cols; x++) {
        try {
          // 从目标图像提取瓦片
          const tileData = extractTargetTile(
            targetImage,
            x, y,
            mergedOptions.targetTileSize
          );
          
          // 匹配瓦片
          const match = await this.matchTile(tileData, signatures, mergedOptions);
          
          tileIds[y][x] = match.tileId;
          confidences[y][x] = match.confidence;
          methods[y][x] = match.method;
        } catch (error) {
          console.warn(`Tile matching failed at (${x}, ${y}):`, error);
          
          // 使用空瓦片作为占位符
          tileIds[y][x] = 0;
          confidences[y][x] = 0;
          methods[y][x] = 'error';
        }
      }
      
      // 进度报告（每行）
      if (y % 5 === 0 || y === grid.rows - 1) {
        console.log(`  Processed ${y + 1}/${grid.rows} rows`);
      }
    }
    
    console.log(`Grid matching completed: ${grid.rows}x${grid.cols}`);
    
    return { tileIds, confidences, methods };
  }

  /**
   * 匹配整个网格（并行处理 - 基本实现）
   */
  async matchGridParallel(
    targetImage: HTMLImageElement,
    grid: GridInfo,
    signatures: TilesetSignatures,
    options: TileMatchingServiceOptions
  ): Promise<TileMatchGrid> {
    console.log(`Starting parallel grid matching (${grid.rows}x${grid.cols})...`);
    
    const tileIds: number[][] = Array(grid.rows).fill(null).map(() => Array(grid.cols).fill(0));
    const confidences: number[][] = Array(grid.rows).fill(null).map(() => Array(grid.cols).fill(0));
    const methods: string[][] = Array(grid.rows).fill(null).map(() => Array(grid.cols).fill('pending'));
    
    // 验证目标图像尺寸
    this.validateTargetImage(targetImage, grid, options);
    
    // 创建所有瓦片的匹配任务
    const matchTasks: Array<{
      x: number;
      y: number;
      promise: Promise<{ x: number; y: number; result: MatchingResult }>;
    }> = [];
    
    for (let y = 0; y < grid.rows; y++) {
      for (let x = 0; x < grid.cols; x++) {
        matchTasks.push({
          x,
          y,
          promise: (async () => {
            try {
              const tileData = extractTargetTile(targetImage, x, y, options.targetTileSize);
              const result = await this.matchTile(tileData, signatures, options);
              return { x, y, result };
            } catch (error) {
              console.warn(`Parallel tile matching failed at (${x}, ${y}):`, error);
              return {
                x,
                y,
                result: {
                  tileId: 0,
                  confidence: 0,
                  method: 'error',
                  usedFallback: false
                }
              };
            }
          })()
        });
      }
    }
    
    // 分批处理以避免内存问题（每批50个任务）
    const batchSize = 50;
    const results: Array<{ x: number; y: number; result: MatchingResult }> = [];
    
    for (let i = 0; i < matchTasks.length; i += batchSize) {
      const batch = matchTasks.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(task => task.promise));
      results.push(...batchResults);
      
      // 进度报告
      const progress = Math.min(i + batchSize, matchTasks.length);
      console.log(`  Parallel batch: ${progress}/${matchTasks.length} tiles`);
    }
    
    // 更新结果到网格
    for (const { x, y, result } of results) {
      tileIds[y][x] = result.tileId;
      confidences[y][x] = result.confidence;
      methods[y][x] = result.method;
    }
    
    console.log(`Parallel grid matching completed`);
    
    return { tileIds, confidences, methods };
  }

  /**
   * 颜色匹配回退（当像素匹配失败或置信度低时使用）
   */
  private colorMatchFallback(
    targetTileData: ImageData,
    signatures: TilesetSignatures
  ): MatchingResult {
    try {
      // 计算目标瓦片的平均颜色
      const targetAvgColor = calculateAverageColor(targetTileData);
      
      // 在签名中查找最接近的平均颜色
      let bestMatchId = 0;
      let minDistance = Infinity;
      
      for (const sig of signatures.signatures) {
        const dist = colorDistance(targetAvgColor, sig.averageColor);
        if (dist < minDistance) {
          minDistance = dist;
          bestMatchId = sig.tileId;
        }
      }
      
      // 将距离转换为置信度（距离越小，置信度越高）
      // 最大可能距离 = sqrt(255^2 * 3) ≈ 441.67
      const maxDistance = 441.67;
      const confidence = Math.max(0, 1 - minDistance / maxDistance);
      
      return {
        tileId: bestMatchId,
        confidence,
        method: 'colorFallback',
        usedFallback: true
      };
    } catch (error) {
      // 如果颜色匹配也失败，返回空瓦片
      console.error('Color matching fallback failed:', error);
      return {
        tileId: 0,
        confidence: 0,
        method: 'error',
        usedFallback: true
      };
    }
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(
    tilesetSource: HTMLImageElement | string,
    options: TileMatchingServiceOptions
  ): string {
    let sourceIdentifier: string;
    
    if (typeof tilesetSource === 'string') {
      // 如果是URL，使用URL作为标识符
      sourceIdentifier = `url:${tilesetSource}`;
    } else {
      // 如果是HTMLImageElement，使用图像属性
      sourceIdentifier = `img:${tilesetSource.width}x${tilesetSource.height}:${tilesetSource.src}`;
    }
    
    // 包含选项的哈希
    const optionsStr = JSON.stringify({
      tileSize: options.tilesetTileSize,
      columns: options.tilesetColumns,
      tileCount: options.tilesetTileCount,
      targetTileSize: options.targetTileSize,
      methods: options.matchingMethods,
      confidenceThreshold: options.confidenceThreshold
    });
    
    // 生成简单哈希 - 使用字符串哈希函数避免btoa编码问题
    const str = sourceIdentifier + optionsStr;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    
    return `tileset:${Math.abs(hash).toString(36)}`;
  }

  // ==========================================================================
  // 私有工具方法
  // ==========================================================================

  /**
   * 加载图像（支持URL或HTMLImageElement）
   */
  private async loadImage(source: HTMLImageElement | string): Promise<HTMLImageElement> {
    if (source instanceof HTMLImageElement) {
      if (source.complete && source.naturalWidth > 0) {
        return source;
      }
      // 图像可能仍在加载，等待加载完成
      return new Promise((resolve, reject) => {
        source.onload = () => resolve(source);
        source.onerror = () => reject(new TileMatchingError(
          'Failed to load image element',
          'TILESET_LOAD_FAILED',
          { src: source.src }
        ));
      });
    }
    
    // 从URL加载图像
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new TileMatchingError(
        `Failed to load image from URL: ${source}`,
        'TILESET_LOAD_FAILED',
        { url: source }
      ));
      
      img.src = source;
    });
  }

  /**
   * 验证瓦片图集图像
   */
  private validateTilesetImage(
    image: HTMLImageElement,
    options: TileMatchingServiceOptions
  ): void {
    const { tilesetTileSize, tilesetColumns, tilesetTileCount } = options;
    
    // 检查图像尺寸是否与瓦片配置匹配
    const expectedWidth = tilesetColumns * tilesetTileSize;
    const expectedHeight = Math.ceil(tilesetTileCount / tilesetColumns) * tilesetTileSize;
    
    if (image.width !== expectedWidth || image.height !== expectedHeight) {
      console.warn(
        `Tileset image dimensions (${image.width}x${image.height}) ` +
        `don't match expected dimensions (${expectedWidth}x${expectedHeight})`
      );
    }
    
    // 检查瓦片尺寸是否合理
    if (tilesetTileSize < 1 || tilesetTileSize > 256) {
      throw new TileMatchingError(
        `Invalid tile size: ${tilesetTileSize}`,
        'INVALID_TILE_SIZE',
        { tileSize: tilesetTileSize }
      );
    }
  }

  /**
   * 验证目标图像
   */
  private validateTargetImage(
    image: HTMLImageElement,
    grid: GridInfo,
    options: TileMatchingServiceOptions
  ): void {
    const { targetTileSize } = options;
    const { cols, rows } = grid;
    
    // 计算预期的图像尺寸
    const expectedWidth = cols * targetTileSize;
    const expectedHeight = rows * targetTileSize;
    
    if (image.width < expectedWidth || image.height < expectedHeight) {
      throw new TileMatchingError(
        `Target image too small: ${image.width}x${image.height}, ` +
        `expected at least ${expectedWidth}x${expectedHeight}`,
        'INVALID_TILE_SIZE',
        { 
          actual: { width: image.width, height: image.height },
          expected: { width: expectedWidth, height: expectedHeight }
        }
      );
    }
    
    // 检查目标瓦片尺寸是否合理
    if (targetTileSize < 1 || targetTileSize > 256) {
      throw new TileMatchingError(
        `Invalid target tile size: ${targetTileSize}`,
        'INVALID_TILE_SIZE',
        { targetTileSize }
      );
    }
  }

  /**
   * 计算匹配统计信息
   */
  calculateMatchStatistics(matchGrid: TileMatchGrid): MatchStatistics {
    const { tileIds, confidences } = matchGrid;
    const rows = tileIds.length;
    const cols = tileIds[0]?.length || 0;
    const totalTiles = rows * cols;
    
    if (totalTiles === 0) {
      return {
        totalTiles: 0,
        highConfidenceTiles: 0,
        mediumConfidenceTiles: 0,
        lowConfidenceTiles: 0,
        averageConfidence: 0,
        matchingMethods: []
      };
    }
    
    let highConfidence = 0;
    let mediumConfidence = 0;
    let lowConfidence = 0;
    let totalConfidence = 0;
    
    // 收集所有置信度
    const allConfidences: number[] = [];
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const confidence = confidences[y][x] || 0;
        allConfidences.push(confidence);
        
        if (confidence >= 0.8) {
          highConfidence++;
        } else if (confidence >= 0.5) {
          mediumConfidence++;
        } else {
          lowConfidence++;
        }
        
        totalConfidence += confidence;
      }
    }
    
    // 收集使用的匹配方法
    const methodSet = new Set<string>();
    matchGrid.methods.forEach(row => row.forEach(method => methodSet.add(method)));
    
    return {
      totalTiles,
      highConfidenceTiles: highConfidence,
      mediumConfidenceTiles: mediumConfidence,
      lowConfidenceTiles: lowConfidence,
      averageConfidence: totalTiles > 0 ? totalConfidence / totalTiles : 0,
      matchingMethods: Array.from(methodSet)
    };
  }

  /**
   * 清除签名缓存
   */
  clearCache(): void {
    this.signatureCache.clear();
    console.log('Tile signature cache cleared');
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.signatureCache.size,
      keys: Array.from(this.signatureCache.keys())
    };
  }
}
