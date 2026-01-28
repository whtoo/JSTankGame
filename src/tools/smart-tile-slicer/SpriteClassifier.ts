/**
 * SpriteClassifier - 精灵分类器
 * 
 * 使用颜色熵、频率分析和边缘密度来区分动态精灵和静态背景瓦片
 * 
 * 精灵特征：高熵、低频率变化、高边缘密度
 * 背景特征：低熵、高频率变化（重复纹理）、低边缘密度
 */

import type { SpriteDetectionResult } from './SmartTileTypes';

export interface ClassificationOptions {
  entropyThreshold: number;
  spriteConfidenceThreshold: number;
  edgeDensityWeight: number;
  entropyWeight: number;
  frequencyWeight: number;
}

export const DEFAULT_CLASSIFICATION_OPTIONS: ClassificationOptions = {
  entropyThreshold: 1.5,
  spriteConfidenceThreshold: 0.6,
  edgeDensityWeight: 0.3,
  entropyWeight: 0.4,
  frequencyWeight: 0.3
};

/**
 * 分析瓦片并分类
 */
export function classifyTile(
  imageData: ImageData,
  frequencyScore: number,
  options: Partial<ClassificationOptions> = {}
): SpriteDetectionResult {
  const opts = { ...DEFAULT_CLASSIFICATION_OPTIONS, ...options };
  
  const entropy = calculateColorEntropy(imageData);
  const edgeDensity = calculateEdgeDensity(imageData);
  const colorCount = countUniqueColors(imageData);
  
  // 计算精灵分数
  // 高熵、低频率变化、高边缘密度 = 更可能是精灵
  const entropyScore = Math.min(entropy / 3, 1);
  const frequencyScoreNorm = 1 - Math.min(frequencyScore, 1);
  const edgeScore = Math.min(edgeDensity * 2, 1);
  
  const spriteScore = 
    (entropyScore * opts.entropyWeight) +
    (frequencyScoreNorm * opts.frequencyWeight) +
    (edgeScore * opts.edgeDensityWeight);
  
  return {
    isSprite: spriteScore > opts.spriteConfidenceThreshold,
    confidence: spriteScore,
    features: {
      entropy,
      frequencyScore,
      edgeDensity,
      colorCount
    }
  };
}

/**
 * 计算颜色熵 (Shannon Entropy)
 * 高熵 = 颜色分布均匀 = 细节丰富 = 可能是精灵
 */
export function calculateColorEntropy(imageData: ImageData): number {
  const colorCounts = new Map<number, number>();
  const data = imageData.data;
  const totalPixels = imageData.width * imageData.height;
  
  for (let i = 0; i < data.length; i += 4) {
    const quantized = quantizeColor(data[i], data[i + 1], data[i + 2]);
    colorCounts.set(quantized, (colorCounts.get(quantized) || 0) + 1);
  }
  
  let entropy = 0;
  for (const count of colorCounts.values()) {
    const probability = count / totalPixels;
    entropy -= probability * Math.log2(probability);
  }
  
  return entropy;
}

/**
 * 计算边缘密度
 * 使用简单的Sobel算子检测边缘
 */
export function calculateEdgeDensity(imageData: ImageData): number {
  const { data, width, height } = imageData;
  let edgeCount = 0;
  const threshold = 30;
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      // 水平梯度
      const gx = 
        Math.abs(data[idx - 4] - data[idx + 4]) +
        Math.abs(data[idx - 3] - data[idx + 5]) +
        Math.abs(data[idx - 2] - data[idx + 6]);
      
      // 垂直梯度
      const gy = 
        Math.abs(data[idx - width * 4] - data[idx + width * 4]) +
        Math.abs(data[idx - width * 4 + 1] - data[idx + width * 4 + 1]) +
        Math.abs(data[idx - width * 4 + 2] - data[idx + width * 4 + 2]);
      
      const gradient = Math.sqrt(gx * gx + gy * gy);
      if (gradient > threshold) edgeCount++;
    }
  }
  
  return edgeCount / (width * height);
}

/**
 * 计算频率变化分数
 * 通过分析瓦片内的重复模式
 */
export function calculateFrequencyVariation(imageData: ImageData): number {
  const { data, width, height } = imageData;
  const patternCounts = new Map<string, number>();
  
  // 采样2x2模式
  for (let y = 0; y < height - 1; y += 2) {
    for (let x = 0; x < width - 1; x += 2) {
      const idx = (y * width + x) * 4;
      const pattern = `${data[idx]},${data[idx + 4]},${data[idx + width * 4]},${data[idx + width * 4 + 4]}`;
      patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
    }
  }
  
  // 计算重复率
  let maxCount = 0;
  for (const count of patternCounts.values()) {
    if (count > maxCount) maxCount = count;
  }
  
  const totalPatterns = Math.ceil(width / 2) * Math.ceil(height / 2);
  return maxCount / totalPatterns;
}

/**
 * 统计唯一颜色数
 */
export function countUniqueColors(imageData: ImageData): number {
  const colors = new Set<number>();
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const quantized = quantizeColor(data[i], data[i + 1], data[i + 2]);
    colors.add(quantized);
  }
  
  return colors.size;
}

/**
 * 量化颜色（降低精度）
 * 像素游戏通常颜色较少，降低精度有助于识别
 */
function quantizeColor(r: number, g: number, b: number): number {
  const qr = Math.floor(r / 32) * 32;
  const qg = Math.floor(g / 32) * 32;
  const qb = Math.floor(b / 32) * 32;
  return (qr << 16) | (qg << 8) | qb;
}

/**
 * 批量分类瓦片
 */
export function classifyTiles(
  tiles: ImageData[],
  frequencyScores: number[],
  options?: Partial<ClassificationOptions>
): SpriteDetectionResult[] {
  return tiles.map((tile, i) => 
    classifyTile(tile, frequencyScores[i] || 0, options)
  );
}

/**
 * 分析整张图片的频率分布
 */
export function analyzeFrequencyDistribution(
  image: HTMLImageElement,
  tileWidth: number,
  tileHeight: number
): number[] {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  
  ctx.drawImage(image, 0, 0);
  
  const cols = Math.floor(image.width / tileWidth);
  const rows = Math.floor(image.height / tileHeight);
  const scores: number[] = [];
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const data = ctx.getImageData(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
      const score = calculateFrequencyVariation(data);
      scores.push(score);
    }
  }
  
  return scores;
}