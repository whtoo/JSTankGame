/**
 * TileMatcher - 基于像素相似度的瓦片匹配工具
 * 
 * 功能：将目标图片中的瓦片与瓦片图集中的瓦片进行像素级匹配
 * 处理：支持缩放检测，使用多种相似度算法
 */

/**
 * 瓦片签名 - 用于快速比较
 */
export interface TileSignature {
  tileId: number;
  averageColor: { r: number; g: number; b: number };
  histogram: number[];
  edges: number[];
}

/**
 * 匹配结果
 */
export interface MatchResult {
  tileId: number;
  confidence: number;
  method: string;
}

/**
 * 匹配选项
 */
export interface MatchingOptions {
  targetTileSize: number;
  sourceTileSize: number;
  useMultiScale: boolean;
  confidenceThreshold: number;
  preferredMethods: string[];
}

/**
 * 计算两个颜色的欧几里得距离
 */
export function colorDistance(
  c1: { r: number; g: number; b: number },
  c2: { r: number; g: number; b: number }
): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

/**
 * 计算平均颜色
 */
export function calculateAverageColor(imageData: ImageData): { r: number; g: number; b: number } {
  const data = imageData.data;
  let r = 0, g = 0, b = 0;
  const pixelCount = imageData.width * imageData.height;
  
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  
  return {
    r: Math.round(r / pixelCount),
    g: Math.round(g / pixelCount),
    b: Math.round(b / pixelCount)
  };
}

/**
 * 计算颜色直方图（简化版 - 每个通道8个bins）
 */
export function calculateHistogram(imageData: ImageData): number[] {
  const data = imageData.data;
  const histogram = new Array(512).fill(0); // 8x8x8 = 512 bins
  const pixelCount = imageData.width * imageData.height;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = Math.floor(data[i] / 32);
    const g = Math.floor(data[i + 1] / 32);
    const b = Math.floor(data[i + 2] / 32);
    const bin = r * 64 + g * 8 + b;
    histogram[bin]++;
  }
  
  // 归一化
  return histogram.map(h => h / pixelCount);
}

/**
 * 提取瓦片签名
 */
export function extractTileSignature(imageData: ImageData, tileId: number): TileSignature {
  return {
    tileId,
    averageColor: calculateAverageColor(imageData),
    histogram: calculateHistogram(imageData),
    edges: extractEdgeFeatures(imageData)
  };
}

/**
 * 提取边缘特征（简化版）
 */
function extractEdgeFeatures(imageData: ImageData): number[] {
  const { width, height, data } = imageData;
  const edges = [];
  
  // 采样边缘点
  const samplePoints = [
    { x: 0, y: 0 },
    { x: width - 1, y: 0 },
    { x: 0, y: height - 1 },
    { x: width - 1, y: height - 1 },
    { x: Math.floor(width / 2), y: Math.floor(height / 2) }
  ];
  
  for (const point of samplePoints) {
    const idx = (point.y * width + point.x) * 4;
    edges.push(data[idx], data[idx + 1], data[idx + 2]);
  }
  
  return edges;
}

/**
 * 从瓦片图集提取所有瓦片签名
 */
export function extractTilesetSignatures(
  tilesetImage: HTMLImageElement,
  tileSize: number,
  columns: number,
  tileCount: number
): TileSignature[] {
  const canvas = document.createElement('canvas');
  canvas.width = tileSize;
  canvas.height = tileSize;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  const signatures: TileSignature[] = [];
  
  for (let i = 0; i < tileCount; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = col * tileSize;
    const y = row * tileSize;
    
    // 清除画布
    ctx.clearRect(0, 0, tileSize, tileSize);
    
    // 绘制瓦片
    ctx.drawImage(tilesetImage, x, y, tileSize, tileSize, 0, 0, tileSize, tileSize);
    
    // 提取像素数据
    const imageData = ctx.getImageData(0, 0, tileSize, tileSize);
    
    // 创建签名
    signatures.push(extractTileSignature(imageData, i));
  }
  
  return signatures;
}

/**
 * 从目标图片提取瓦片
 */
export function extractTargetTile(
  targetImage: HTMLImageElement,
  gridX: number,
  gridY: number,
  tileSize: number
): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = tileSize;
  canvas.height = tileSize;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  const x = gridX * tileSize;
  const y = gridY * tileSize;
  
  ctx.drawImage(targetImage, x, y, tileSize, tileSize, 0, 0, tileSize, tileSize);
  
  return ctx.getImageData(0, 0, tileSize, tileSize);
}

/**
 * 计算直方图相似度（使用交集）
 */
export function histogramSimilarity(hist1: number[], hist2: number[]): number {
  let intersection = 0;
  
  for (let i = 0; i < hist1.length; i++) {
    intersection += Math.min(hist1[i], hist2[i]);
  }
  
  return intersection;
}

/**
 * 基于平均颜色匹配
 */
export function matchByAverageColor(
  targetSignature: TileSignature,
  tilesetSignatures: TileSignature[]
): MatchResult {
  let bestMatch = 0;
  let minDistance = Infinity;
  
  for (const sig of tilesetSignatures) {
    const dist = colorDistance(targetSignature.averageColor, sig.averageColor);
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = sig.tileId;
    }
  }
  
  // 将距离转换为置信度（距离越小，置信度越高）
  const confidence = Math.max(0, 1 - minDistance / 441.67); // 441.67 = sqrt(255^2 * 3)
  
  return {
    tileId: bestMatch,
    confidence,
    method: 'averageColor'
  };
}

/**
 * 基于直方图匹配
 */
export function matchByHistogram(
  targetSignature: TileSignature,
  tilesetSignatures: TileSignature[]
): MatchResult {
  let bestMatch = 0;
  let maxSimilarity = 0;
  
  for (const sig of tilesetSignatures) {
    const similarity = histogramSimilarity(targetSignature.histogram, sig.histogram);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      bestMatch = sig.tileId;
    }
  }
  
  return {
    tileId: bestMatch,
    confidence: maxSimilarity,
    method: 'histogram'
  };
}

/**
 * 综合匹配 - 使用多种方法并加权
 */
export function matchTile(
  targetImageData: ImageData,
  tilesetSignatures: TileSignature[],
  options: Partial<MatchingOptions> = {}
): MatchResult {
  const opts: MatchingOptions = {
    targetTileSize: 32,
    sourceTileSize: 33,
    useMultiScale: true,
    confidenceThreshold: 0.7,
    preferredMethods: ['averageColor', 'histogram'],
    ...options
  };
  
  // 提取目标瓦片签名
  const targetSignature = extractTileSignature(targetImageData, -1);
  
  // 使用多种方法匹配
  const results: MatchResult[] = [];
  
  if (opts.preferredMethods.includes('averageColor')) {
    results.push(matchByAverageColor(targetSignature, tilesetSignatures));
  }
  
  if (opts.preferredMethods.includes('histogram')) {
    results.push(matchByHistogram(targetSignature, tilesetSignatures));
  }
  
  // 选择置信度最高的结果
  const bestResult = results.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  );
  
  return bestResult;
}

/**
 * 批量匹配 - 将整张目标图片映射到瓦片ID
 */
export function matchTargetImage(
  targetImage: HTMLImageElement,
  tilesetSignatures: TileSignature[],
  gridCols: number,
  gridRows: number,
  targetTileSize: number
): number[][] {
  const tileGrid: number[][] = [];
  
  for (let y = 0; y < gridRows; y++) {
    tileGrid[y] = [];
    
    for (let x = 0; x < gridCols; x++) {
      try {
        // 提取目标瓦片
        const tileData = extractTargetTile(targetImage, x, y, targetTileSize);
        
        // 匹配瓦片
        const match = matchTile(tileData, tilesetSignatures);
        
        tileGrid[y][x] = match.tileId;
      } catch (error) {
        console.warn(`Failed to match tile at (${x}, ${y}):`, error);
        tileGrid[y][x] = 0; // 默认空瓦片
      }
    }
  }
  
  return tileGrid;
}

/**
 * 检测目标图片的瓦片尺寸
 * 通过分析图像的重复模式来推断瓦片大小
 */
export function detectTargetTileSize(image: HTMLImageElement): number {
  // 常见游戏瓦片尺寸
  const commonSizes = [16, 20, 24, 32, 40, 48, 64];
  
  // 计算图像尺寸
  const width = image.width;
  const height = image.height;
  
  // 查找能整除图像尺寸的瓦片大小
  const validSizes = commonSizes.filter(size => 
    width % size === 0 && height % size === 0
  );
  
  if (validSizes.length === 0) {
    // 如果没有完美的匹配，选择最接近的
    console.warn('No perfect tile size match found, using estimation');
    return estimateTileSize(width, height);
  }
  
  // 返回最常见的瓦片尺寸（通常是32或16）
  return validSizes.includes(32) ? 32 : 
         validSizes.includes(16) ? 16 : 
         validSizes[0];
}

/**
 * 估算瓦片尺寸（当没有完美匹配时）
 */
function estimateTileSize(width: number, height: number): number {
  // 假设是标准游戏地图比例
  const aspectRatio = width / height;
  
  // 常见的地图尺寸
  if (aspectRatio === 4 / 3) {
    // 可能是20x15网格 @ 16px = 320x240（但已缩放）
    const scaleX = width / 320;
    const scaleY = height / 240;
    return Math.round(16 * ((scaleX + scaleY) / 2));
  }
  
  // 默认返回32
  return 32;
}