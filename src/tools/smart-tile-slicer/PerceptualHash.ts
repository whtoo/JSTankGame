/**
 * PerceptualHash - 感知哈希实现
 * 
 * 用于快速检测相似瓦片，容忍轻微颜色差异
 * 算法：降采样 -> 灰度化 -> 计算平均值 -> 生成二进制哈希
 */

export interface PerceptualHashOptions {
  hashSize: number;
  ignoreColor: boolean;
}

export const DEFAULT_PHASH_OPTIONS: PerceptualHashOptions = {
  hashSize: 8,
  ignoreColor: false
};

/**
 * 计算感知哈希
 */
export function calculatePerceptualHash(
  imageData: ImageData,
  options: Partial<PerceptualHashOptions> = {}
): string {
  const opts = { ...DEFAULT_PHASH_OPTIONS, ...options };
  const { data, width, height } = imageData;
  const size = opts.hashSize;
  
  // 降采样到 size x size
  const resized = resizeToGrid(data, width, height, size);
  
  // 计算平均值
  const avg = resized.reduce((sum, val) => sum + val, 0) / resized.length;
  
  // 生成二进制哈希
  let hash = '';
  for (let i = 0; i < resized.length; i++) {
    hash += resized[i] > avg ? '1' : '0';
  }
  
  return hash;
}

/**
 * 使用最近邻插值降采样
 */
function resizeToGrid(
  data: Uint8ClampedArray,
  srcWidth: number,
  srcHeight: number,
  targetSize: number
): number[] {
  const result: number[] = [];
  
  for (let y = 0; y < targetSize; y++) {
    for (let x = 0; x < targetSize; x++) {
      const srcX = Math.floor((x / targetSize) * srcWidth);
      const srcY = Math.floor((y / targetSize) * srcHeight);
      const idx = (srcY * srcWidth + srcX) * 4;
      
      // 转换为灰度值
      const gray = Math.floor(
        0.299 * data[idx] + 
        0.587 * data[idx + 1] + 
        0.114 * data[idx + 2]
      );
      
      result.push(gray);
    }
  }
  
  return result;
}

/**
 * 计算两个哈希的汉明距离
 */
export function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) {
    throw new Error('Hash lengths must match');
  }
  
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  
  return distance;
}

/**
 * 计算哈希相似度 (0-1)
 */
export function hashSimilarity(hash1: string, hash2: string): number {
  const maxDistance = hash1.length;
  const distance = hammingDistance(hash1, hash2);
  return 1 - (distance / maxDistance);
}

/**
 * 查找相似瓦片
 */
export function findSimilarTiles(
  targetHash: string,
  candidateHashes: Map<number, string>,
  threshold: number = 0.8
): Array<{ tileId: number; similarity: number }> {
  const results: Array<{ tileId: number; similarity: number }> = [];
  
  for (const [tileId, hash] of candidateHashes) {
    const similarity = hashSimilarity(targetHash, hash);
    if (similarity >= threshold) {
      results.push({ tileId, similarity });
    }
  }
  
  return results.sort((a, b) => b.similarity - a.similarity);
}

/**
 * 瓦片去重
 */
export function deduplicateTiles(
  hashes: Map<number, string>,
  similarityThreshold: number = 0.9
): {
  uniqueIds: number[];
  mapping: Map<number, number>;
  groups: Map<number, number[]>;
} {
  const uniqueIds: number[] = [];
  const mapping = new Map<number, number>();
  const groups = new Map<number, number[]>();
  
  const processed = new Set<number>();
  
  for (const [tileId, hash] of hashes) {
    if (processed.has(tileId)) continue;
    
    // 查找相似瓦片
    const similar = findSimilarTiles(hash, hashes, similarityThreshold);
    const group = similar.map(s => s.tileId);
    
    // 第一个作为代表
    const representative = tileId;
    uniqueIds.push(representative);
    groups.set(representative, group);
    
    // 映射所有相似瓦片到代表
    for (const id of group) {
      mapping.set(id, representative);
      processed.add(id);
    }
  }
  
  return { uniqueIds, mapping, groups };
}