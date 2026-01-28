/**
 * SmartTileSlicer - 智能瓦片切割器
 * 
 * 核心特性：
 * 1. 支持矩形瓦片检测（2D自相关分析）
 * 2. 精灵 vs 背景分类
 * 3. 感知哈希去重
 * 4. NES风格优化
 * 
 * 继承自GridDetector，扩展了矩形检测和智能分类功能
 */

import { GridDetector } from '../grid-detection/GridDetector';
import type { GridDetectionConfig } from '../grid-detection/GridDetector';
import type {
  SmartTileSlicerOptions,
  SmartTileConfig,
  TileSizeDetectionResult,
  TileClassification,
  ColorAnalysis,
  ExtractedTile
} from './SmartTileTypes';
import { DEFAULT_SMART_TILE_OPTIONS } from './SmartTileTypes';
import { calculatePerceptualHash, deduplicateTiles } from './PerceptualHash';
import { classifyTile, calculateFrequencyVariation, calculateColorEntropy } from './SpriteClassifier';

export class SmartTileSlicer extends GridDetector {
  private smartOptions: SmartTileSlicerOptions;

  constructor(
    gridConfig?: Partial<GridDetectionConfig>,
    smartOptions?: Partial<SmartTileSlicerOptions>
  ) {
    super(gridConfig);
    this.smartOptions = { ...DEFAULT_SMART_TILE_OPTIONS, ...smartOptions };
  }

  /**
   * 智能切割主入口
   */
  async sliceSmart(image: HTMLImageElement): Promise<SmartTileConfig> {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);

    // 1. 检测瓦片尺寸（支持矩形）
    const tileSizeResult = this.smartOptions.autoDetectSize
      ? this.detectTileSize(imageData)
      : {
          width: { period: this.smartOptions.expectedTileWidth || 16, score: 1, confidence: 1, method: 'manual' },
          height: { period: this.smartOptions.expectedTileHeight || 16, score: 1, confidence: 1, method: 'manual' },
          combinedScore: 1
        };

    const tileWidth = tileSizeResult.width.period;
    const tileHeight = tileSizeResult.height.period;

    // 2. 计算网格
    const cols = Math.floor(image.width / tileWidth);
    const rows = Math.floor(image.height / tileHeight);

    // 3. 提取所有瓦片
    const tiles = this.extractAllTiles(ctx, cols, rows, tileWidth, tileHeight);

    // 4. 计算频率分布（用于精灵检测）
    const frequencyScores = tiles.map(t => calculateFrequencyVariation(t.imageData));

    // 5. 分类瓦片
    const classifications = this.classifyAllTiles(tiles, frequencyScores);

    // 6. 生成感知哈希
    const hashes = this.generateHashes(tiles);

    // 7. 去重
    const uniqueIds = this.smartOptions.enablePerceptualHash
      ? deduplicateTiles(hashes, 0.9).uniqueIds
      : tiles.map(t => t.id);

    // 8. 颜色分析
    const colorAnalysis = this.analyzeColorDistribution(tiles);

    // 9. 分离精灵和背景
    const sprites = classifications.filter(c => c.isSprite);
    const backgrounds = classifications.filter(c => !c.isSprite);

    return {
      tileWidth,
      tileHeight,
      cols,
      rows,
      isAutoDetected: this.smartOptions.autoDetectSize,
      confidence: tileSizeResult.combinedScore,
      uniqueTileCount: uniqueIds.length,
      sprites,
      backgroundTiles: backgrounds,
      allClassifications: this.reshapeClassifications(classifications, cols),
      colorAnalysis,
      sourceImage: image,
      sourceImageData: imageData
    };
  }

  /**
   * 检测瓦片尺寸（矩形支持）
   * 使用2D自相关分析
   */
  detectTileSize(imageData: ImageData): TileSizeDetectionResult {
    const gray = this.toGrayscale(imageData);
    
    // 水平方向周期性（检测垂直网格线）
    const hResult = this.findPeriodicity(gray, imageData.width, imageData.height, 'horizontal');
    
    // 垂直方向周期性（检测水平网格线）
    const vResult = this.findPeriodicity(gray, imageData.width, imageData.height, 'vertical');
    
    // 验证周期性
    const hValidation = this.validatePeriodicity(gray, imageData.width, imageData.height, hResult.period, 'horizontal');
    const vValidation = this.validatePeriodicity(gray, imageData.width, imageData.height, vResult.period, 'vertical');
    
    return {
      width: { ...hResult, confidence: hValidation },
      height: { ...vResult, confidence: vValidation },
      combinedScore: (hResult.score + vResult.score) / 2
    };
  }

  /**
   * 查找周期性
   */
  private findPeriodicity(
    gray: Uint8Array,
    imgW: number,
    imgH: number,
    direction: 'horizontal' | 'vertical'
  ): { period: number; score: number; method: string } {
    const isH = direction === 'horizontal';
    const maxSearch = Math.min(isH ? imgW : imgH, this.smartOptions.maxTileSize);
    const minSearch = this.smartOptions.minTileSize;
    
    // 使用自相关函数
    const scores = new Float32Array(maxSearch + 1);
    
    for (let period = minSearch; period <= maxSearch; period++) {
      let diff = 0;
      let count = 0;
      
      // 采样计算
      const sampleCount = Math.min(isH ? imgH : imgW, this.smartOptions.sampleRows);
      const step = Math.max(1, Math.floor((isH ? imgH : imgW) / sampleCount));
      
      for (let sample = 0; sample < (isH ? imgH : imgW); sample += step) {
        for (let i = 0; i < (isH ? imgW : imgH) - period; i++) {
          const idx1 = isH ? (sample * imgW + i) : (i * imgW + sample);
          const idx2 = isH ? (sample * imgW + i + period) : ((i + period) * imgW + sample);
          diff += Math.abs(gray[idx1] - gray[idx2]);
          count++;
        }
      }
      
      // 周期位置应该相似（差分小）
      scores[period] = 1.0 / (1.0 + diff / count);
    }
    
    // 优先选择常见的游戏瓦片尺寸
    const candidates = [8, 12, 16, 20, 24, 32, 48, 64].filter(p => p >= minSearch && p <= maxSearch);
    let bestPeriod = 16;
    let maxScore = 0;
    
    for (const p of candidates) {
      if (scores[p] > maxScore) {
        maxScore = scores[p];
        bestPeriod = p;
      }
    }
    
    return {
      period: bestPeriod,
      score: maxScore,
      method: 'autocorrelation'
    };
  }

  /**
   * 验证周期性
   */
  private validatePeriodicity(
    gray: Uint8Array,
    imgW: number,
    imgH: number,
    period: number,
    direction: 'horizontal' | 'vertical'
  ): number {
    const isH = direction === 'horizontal';
    const numPeriods = Math.floor((isH ? imgW : imgH) / period);
    let alignmentScore = 0;
    
    for (let i = 0; i < numPeriods; i++) {
      const pos = i * period;
      let edgeStrength = 0;
      
      if (isH) {
        // 检测垂直边缘
        for (let y = 0; y < imgH; y++) {
          if (pos > 0 && pos < imgW) {
            const idx1 = y * imgW + pos - 1;
            const idx2 = y * imgW + pos;
            edgeStrength += Math.abs(gray[idx1] - gray[idx2]);
          }
        }
      } else {
        // 检测水平边缘
        for (let x = 0; x < imgW; x++) {
          if (pos > 0 && pos < imgH) {
            const idx1 = (pos - 1) * imgW + x;
            const idx2 = pos * imgW + x;
            edgeStrength += Math.abs(gray[idx1] - gray[idx2]);
          }
        }
      }
      
      alignmentScore += edgeStrength / (isH ? imgH : imgW);
    }
    
    return Math.min(alignmentScore / numPeriods / 255, 1);
  }

  /**
   * 提取所有瓦片
   */
  private extractAllTiles(
    ctx: CanvasRenderingContext2D,
    cols: number,
    rows: number,
    tileWidth: number,
    tileHeight: number
  ): ExtractedTile[] {
    const tiles: ExtractedTile[] = [];
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const pixelX = x * tileWidth;
        const pixelY = y * tileHeight;
        
        tiles.push({
          id: y * cols + x,
          gridX: x,
          gridY: y,
          pixelX,
          pixelY,
          width: tileWidth,
          height: tileHeight,
          imageData: ctx.getImageData(pixelX, pixelY, tileWidth, tileHeight)
        });
      }
    }
    
    return tiles;
  }

  /**
   * 分类所有瓦片
   */
  private classifyAllTiles(
    tiles: ExtractedTile[],
    frequencyScores: number[]
  ): TileClassification[] {
    return tiles.map((tile, i) => {
      const result = classifyTile(tile.imageData, frequencyScores[i], {
        entropyThreshold: this.smartOptions.entropyThreshold,
        spriteConfidenceThreshold: this.smartOptions.spriteConfidenceThreshold
      });
      
      const hash = this.smartOptions.enablePerceptualHash
        ? calculatePerceptualHash(tile.imageData, { hashSize: this.smartOptions.hashSize })
        : '';
      
      return {
        gridX: tile.gridX,
        gridY: tile.gridY,
        pixelX: tile.pixelX,
        pixelY: tile.pixelY,
        isSprite: result.isSprite,
        entropy: result.features.entropy,
        frequencyScore: result.features.frequencyScore,
        edgeDensity: result.features.edgeDensity,
        uniqueColors: result.features.colorCount,
        perceptualHash: hash,
        confidence: result.confidence
      };
    });
  }

  /**
   * 生成感知哈希
   */
  private generateHashes(tiles: ExtractedTile[]): Map<number, string> {
    const hashes = new Map<number, string>();
    
    for (const tile of tiles) {
      const hash = calculatePerceptualHash(tile.imageData, {
        hashSize: this.smartOptions.hashSize
      });
      hashes.set(tile.id, hash);
    }
    
    return hashes;
  }

  /**
   * 颜色分布分析
   */
  private analyzeColorDistribution(tiles: ExtractedTile[]): ColorAnalysis {
    const allColors = new Map<number, number>();
    let totalEntropy = 0;
    const dominantColors: ColorAnalysis['dominantColors'] = [];
    
    for (const tile of tiles) {
      const entropy = calculateColorEntropy(tile.imageData);
      totalEntropy += entropy;
      
      // 统计颜色
      const data = tile.imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const quantized = this.quantizeColor(data[i], data[i + 1], data[i + 2]);
        allColors.set(quantized, (allColors.get(quantized) || 0) + 1);
      }
    }
    
    // 找出主导颜色
    const sortedColors = Array.from(allColors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    for (const [color, count] of sortedColors) {
      dominantColors.push({
        r: (color >> 16) & 0xFF,
        g: (color >> 8) & 0xFF,
        b: color & 0xFF,
        frequency: count
      });
    }
    
    return {
      uniqueColors: allColors.size,
      entropy: totalEntropy / tiles.length,
      dominantColors,
      palette: Array.from(allColors.keys()).map(c => [(c >> 16) & 0xFF, (c >> 8) & 0xFF, c & 0xFF])
    };
  }

  /**
   * 将分类结果重塑为二维数组
   */
  private reshapeClassifications(
    classifications: TileClassification[],
    cols: number
  ): TileClassification[][] {
    const result: TileClassification[][] = [];
    
    for (let y = 0; y < classifications.length / cols; y++) {
      result[y] = [];
      for (let x = 0; x < cols; x++) {
        result[y][x] = classifications[y * cols + x];
      }
    }
    
    return result;
  }

  /**
   * 转换为灰度
   */
  private toGrayscale(imageData: ImageData): Uint8Array {
    const { data, width, height } = imageData;
    const gray = new Uint8Array(width * height);
    
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      gray[j] = Math.floor(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    }
    
    return gray;
  }

  /**
   * 量化颜色
   */
  private quantizeColor(r: number, g: number, b: number): number {
    const qr = Math.floor(r / 32) * 32;
    const qg = Math.floor(g / 32) * 32;
    const qb = Math.floor(b / 32) * 32;
    return (qr << 16) | (qg << 8) | qb;
  }

  /**
   * 更新智能选项
   */
  updateSmartOptions(options: Partial<SmartTileSlicerOptions>): void {
    this.smartOptions = { ...this.smartOptions, ...options };
  }
}