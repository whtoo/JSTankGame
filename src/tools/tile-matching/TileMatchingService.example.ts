/**
 * TileMatchingService 使用示例
 */

import { TileMatchingService, type TileMatchingServiceOptions } from './TileMatchingService';

// 创建服务实例
const service = new TileMatchingService({
  tilesetTileSize: 33,
  tilesetColumns: 24,
  tilesetTileCount: 432,
  targetTileSize: 48,
  confidenceThreshold: 0.7,
  parallelProcessing: true,
  cacheSignatures: true
});

// 使用示例流程：
async function exampleUsage() {
  try {
    // 1. 加载瓦片图集签名
    const tilesetSignatures = await service.loadTilesetSignatures(
      'path/to/tileset.png', // 或 HTMLImageElement
      {
        tilesetTileSize: 33,
        tilesetColumns: 24,
        tilesetTileCount: 432
      }
    );
    
    console.log(`Loaded ${tilesetSignatures.signatures.length} tile signatures`);
    
    // 2. 假设有目标图像和网格信息
    const targetImage = new Image(); // 实际应加载图像
    const gridInfo = {
      cols: 20,
      rows: 15,
      tileWidth: 48,
      tileHeight: 48,
      detected: true
    };
    
    // 3. 匹配整个网格
    const matchGrid = await service.matchGrid(
      targetImage,
      gridInfo,
      tilesetSignatures,
      {
        parallelProcessing: true,
        confidenceThreshold: 0.7
      }
    );
    
    // 4. 计算统计信息
    const stats = service.calculateMatchStatistics(matchGrid);
    console.log('Matching statistics:', stats);
    
    // 5. 使用匹配结果
    console.log(`Matched ${stats.totalTiles} tiles`);
    console.log(`High confidence: ${stats.highConfidenceTiles} tiles`);
    console.log(`Average confidence: ${stats.averageConfidence.toFixed(3)}`);
    
  } catch (error) {
    console.error('Tile matching failed:', error);
  }
}

// 注意：实际使用时需要确保图像已加载完成
