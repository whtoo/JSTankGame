/**
 * 颜色匹配工具
 * 使用欧几里得距离算法将RGB颜色映射到瓦片ID
 */

import type { ColorToTileMap } from '../ImageToTilemapConverter';

/**
 * 计算两个RGB颜色之间的欧几里得距离
 */
export function calculateColorDistance(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  );
}

/**
 * 查找最佳匹配的瓦片ID
 * 基于欧几里得距离和容差值
 */
export function findBestTileId(
  r: number,
  g: number,
  b: number,
  colorMap: ColorToTileMap[]
): number {
  let minDistance = Infinity;
  let bestTileId = 0; // 默认返回空瓦片

  for (const colorDef of colorMap) {
    const distance = calculateColorDistance(
      r, g, b,
      colorDef.color.r,
      colorDef.color.g,
      colorDef.color.b
    );
    
    // 检查是否在容差范围内且距离更小
    const tolerance = colorDef.tolerance || 50;
    if (distance < minDistance && distance < tolerance) {
      minDistance = distance;
      bestTileId = colorDef.tileId;
    }
  }

  return bestTileId;
}

/**
 * 批量处理像素数据
 * 将ImageData转换为瓦片ID网格
 */
export function pixelsToTileGrid(
  imageData: ImageData,
  colorMap: ColorToTileMap[],
  gridCols: number,
  gridRows: number,
  tileWidth: number,
  tileHeight: number
): number[][] {
  const tileGrid: number[][] = [];

  for (let gridY = 0; gridY < gridRows; gridY++) {
    tileGrid[gridY] = [];
    
    for (let gridX = 0; gridX < gridCols; gridX++) {
      // 采样瓦片中心点的颜色
      const sampleX = Math.floor(gridX * tileWidth + tileWidth / 2);
      const sampleY = Math.floor(gridY * tileHeight + tileHeight / 2);
      
      const pixelIndex = (sampleY * imageData.width + sampleX) * 4;
      const r = imageData.data[pixelIndex];
      const g = imageData.data[pixelIndex + 1];
      const b = imageData.data[pixelIndex + 2];
      
      tileGrid[gridY][gridX] = findBestTileId(r, g, b, colorMap);
    }
  }

  return tileGrid;
}

/**
 * 改进的采样算法
 * 采样瓦片内多个点以提高准确性
 */
export function pixelsToTileGridWithMultiSampling(
  imageData: ImageData,
  colorMap: ColorToTileMap[],
  gridCols: number,
  gridRows: number,
  tileWidth: number,
  tileHeight: number
): number[][] {
  const tileGrid: number[][] = [];

  // 采样点位置（相对坐标）
  const samplePoints = [
    { x: 0.5, y: 0.5 },   // 中心
    { x: 0.25, y: 0.25 }, // 左上
    { x: 0.75, y: 0.25 }, // 右上
    { x: 0.25, y: 0.75 }, // 左下
    { x: 0.75, y: 0.75 }  // 右下
  ];

  for (let gridY = 0; gridY < gridRows; gridY++) {
    tileGrid[gridY] = [];
    
    for (let gridX = 0; gridX < gridCols; gridX++) {
      const tileIds: number[] = [];
      
      // 采样每个点
      for (const point of samplePoints) {
        const sampleX = Math.floor(gridX * tileWidth + point.x * tileWidth);
        const sampleY = Math.floor(gridY * tileHeight + point.y * tileHeight);
        
        // 边界检查
        if (sampleX >= 0 && sampleX < imageData.width && 
            sampleY >= 0 && sampleY < imageData.height) {
          const pixelIndex = (sampleY * imageData.width + sampleX) * 4;
          const r = imageData.data[pixelIndex];
          const g = imageData.data[pixelIndex + 1];
          const b = imageData.data[pixelIndex + 2];
          
          tileIds.push(findBestTileId(r, g, b, colorMap));
        }
      }
      
      // 使用出现最频繁的瓦片ID
      tileGrid[gridY][gridX] = getMode(tileIds.length > 0 ? tileIds : [0]);
    }
  }

  return tileGrid;
}

/**
 * 获取数组中出现最频繁的元素
 */
function getMode<T>(array: T[]): T {
  const frequency = new Map<T, number>();
  let maxFreq = 0;
  let mode = array[0] || 0 as T;

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