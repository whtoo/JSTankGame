# 图片转tilemap系统实现计划

## 已完成的工作
1. ✅ **系统分析**：完整的tilemap架构理解
2. ✅ **图片分析**：颜色映射和网格结构识别
3. ✅ **数据格式**：Tiled JSON格式定义和示例
4. ✅ **算法设计**：颜色识别和网格转换算法
5. ✅ **示例关卡**：手动创建的level3.json

## 待实现的完整系统

### 1. 核心转换引擎
**位置**: `src/tools/ImageToTilemapConverter.ts`
**功能**:
- 加载图像文件（支持JPG、PNG、WebP）
- Canvas像素分析
- 颜色匹配算法（欧几里得距离 + HSV空间）
- 网格划分和对象检测
- Tiled JSON生成

**接口**:
```typescript
interface ConversionOptions {
  tileSize: number;          // 输出图块尺寸（默认33）
  colorTolerance: number;    // 颜色容差（默认50）
  outputFormat: 'tiled-json' | 'legacy-json';
}

class ImageToTilemapConverter {
  async convert(imageFile: File, options: ConversionOptions): Promise<TiledMap>;
  async convertFromUrl(imageUrl: string, options: ConversionOptions): Promise<TiledMap>;
  async convertFromPath(imagePath: string, options: ConversionOptions): Promise<TiledMap>;
}
```

### 2. 用户界面
**位置**: `tools/image-to-tilemap/`
**文件**:
- `index.html` - 主界面
- `style.css` - 样式
- `converter.js` - 前端逻辑
- `preview.js` - 网格预览

**功能**:
- 拖放图片上传
- 实时预览转换结果
- 颜色映射配置
- JSON下载
- 集成到现有游戏测试

### 3. 命令行工具
**位置**: `scripts/convert-image-to-level.ts`
**功能**:
```bash
npm run convert-level -- --image=path/to/image.jpg --output=levels/levelX.json
```

**选项**:
- `--image`：输入图片路径
- `--output`：输出JSON路径
- `--tile-size`：图块尺寸（默认33）
- `--colors`：自定义颜色映射文件
- `--preview`：生成预览图像

### 4. 集成到游戏开发工作流
**功能**:
- 游戏内关卡编辑器集成
- 实时预览和编辑
- 版本控制和分享
- 批量处理

## 技术实现细节

### 颜色识别算法
```typescript
function pixelToTileId(r: number, g: number, b: number): number {
  const colorMap = [
    { r: 180, g: 40, b: 40, id: 17 },    // 红砖
    { r: 220, g: 220, b: 220, id: 59 },  // 白砖
    { r: 60, g: 200, b: 60, id: 99 },    // 绿草
    { r: 255, g: 220, b: 0, id: 73 },    // 坦克
    { r: 0, g: 0, b: 0, id: 0 }          // 空地
  ];
  
  // 欧几里得距离
  let minDistance = Infinity;
  let bestId = 0;
  
  for (const color of colorMap) {
    const distance = Math.sqrt(
      Math.pow(r - color.r, 2) +
      Math.pow(g - color.g, 2) +
      Math.pow(b - color.b, 2)
    );
    
    if (distance < minDistance && distance < options.colorTolerance) {
      minDistance = distance;
      bestId = color.id;
    }
  }
  
  return bestId;
}
```

### 网格检测算法
```typescript
function detectGrid(imageData: ImageData, tileSize: number): {
  cols: number;
  rows: number;
  grid: number[][];
} {
  const width = imageData.width;
  const height = imageData.height;
  
  const cols = Math.floor(width / tileSize);
  const rows = Math.floor(height / tileSize);
  
  const grid: number[][] = [];
  
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      // 采样图块中心区域
      const centerX = Math.floor(x * tileSize + tileSize / 2);
      const centerY = Math.floor(y * tileSize + tileSize / 2);
      
      const pixelIndex = (centerY * width + centerX) * 4;
      const r = imageData.data[pixelIndex];
      const g = imageData.data[pixelIndex + 1];
      const b = imageData.data[pixelIndex + 2];
      
      grid[y][x] = pixelToTileId(r, g, b);
    }
  }
  
  return { cols, rows, grid };
}
```

### 对象检测
```typescript
function detectObjects(grid: number[][]): MapObject[] {
  const objects: MapObject[] = [];
  const visited = new Set<string>();
  
  // 检测基地（特殊图案）
  // 检测坦克位置
  // 检测出生点
  
  return objects;
}
```

## 开发阶段

### 阶段一：基础转换器（1周）
1. 核心算法实现和测试
2. 简单的命令行工具
3. 单元测试套件

### 阶段二：用户界面（2周）
1. 网页界面开发
2. 实时预览功能
3. 配置和导出功能

### 阶段三：集成和优化（1周）
1. 游戏内集成
2. 性能优化
3. 错误处理和验证

### 阶段四：高级功能（2周）
1. 批量处理
2. 模板匹配
3. 机器学习增强
4. 社区功能

## 测试策略

### 单元测试
- 颜色识别算法精度
- 网格检测准确性
- JSON生成正确性

### 集成测试
- 完整转换流程
- 不同图片格式支持
- 边界条件处理

### 用户测试
- 易用性评估
- 转换成功率统计
- 性能基准测试

## 性能考虑

1. **大图像处理**：使用Web Workers分块处理
2. **实时预览**：降采样和缓存
3. **内存使用**：及时释放图像数据
4. **浏览器兼容性**：渐进增强策略

## 后续步骤

### 立即开始（本周）
1. 创建基础转换器类
2. 实现核心算法
3. 创建简单的测试页面

### 短期目标（1个月）
1. 完成可用的转换工具v1.0
2. 集成到游戏开发流程
3. 收集用户反馈

### 长期愿景（3个月）
1. 完整的可视化关卡编辑器
2. AI增强的图案识别
3. 社区分享平台

---
*计划创建时间：2026-01-28 12:40:00*
*基于已完成的分析工作制定*