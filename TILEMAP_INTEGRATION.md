# 瓦片地图系统集成说明

## 概述

已成功集成基于Tiled标准JSON格式的瓦片地图系统到JSTankGame项目中。新的系统支持标准Tiled格式，便于地图编辑和扩展。

## 新增文件

### 1. 类型定义

**src/types/TilemapConfig.ts**
- 定义Tiled JSON格式的类型接口
- 包含地图、图层、对象、瓦片集等完整类型定义
- 支持GID（全局瓦片ID）系统

### 2. 地图加载器

**src/game/TileMapLoader.ts**
- 加载和解析Tiled JSON格式地图
- 支持tileset.json和level2.json格式
- 提供瓦片属性查询（通行性、可破坏性、生命值）
- 坐标转换（网格坐标↔像素坐标）
- 缓存机制，避免重复加载

核心功能：
```typescript
- loadLevel(levelPath, tilesetPath)     // 加载关卡
- getTileByGID(gid, tileset)         // 根据GID获取瓦片
- isTilePassable(gid, tileset)         // 检查是否可通行
- isTileDestructible(gid, tileset)      // 检查是否可破坏
- gridToPixel(gridX, gridY)          // 网格坐标转像素坐标
- pixelToGrid(pixelX, pixelY)          // 像素坐标转网格坐标
```

### 3. 关卡管理器

**src/game/levels/TileLevelManager.ts**
- 使用TileMapLoader加载Tiled JSON关卡
- 提供与现有LevelManager兼容的接口
- 支持从地图对象中提取玩家位置、敌人生成点
- 关卡进度管理

核心功能：
```typescript
- init()                                    // 初始化并加载所有关卡
- loadLevel(levelNum)                     // 加载指定关卡
- loadNextLevel()                        // 加载下一关
- getMapData()                             // 获取地图数据
- getMapGrid()                            // 获取网格数据（兼容）
- getPlayerStart()                         // 获取玩家起始位置
- getBasePosition()                        // 获取基地位置
- getEnemySpawnPoints()                   // 获取敌人生成点
- completeLevel()                          // 完成当前关卡
```

### 4. 配置文件

**resources/tileset.json**
- 瓦片图集定义（Tiled标准格式）
- 定义7种瓦片类型及其属性
- 包含图集图片信息和网格配置

**resources/level2.json**
- 关卡2地图定义（Tiled标准格式）
- 23×13网格，瓦片尺寸33×33像素
- 包含2个图层（地形层和对象层）
- 定义玩家、敌人生成点位置

**resources/TILEMAP_README.md**
- 完整的瓦片地图使用说明文档
- 包含GID系统说明
- 坐标系统说明
- 游戏引擎集成示例代码
- 性能优化建议

## 集成方式

### 方式一：直接使用新的TileLevelManager

```typescript
import { getTileLevelManager } from './game/levels/TileLevelManager';

// 初始化
const levelManager = getTileLevelManager();
await levelManager.init();

// 加载关卡
levelManager.loadLevel(1);

// 获取地图数据
const mapData = levelManager.getMapData();
const tileset = mapData?.tilesetData;

// 获取瓦片属性
const tile = tileMapLoader.getTileByGID(100, tileset);
const isPassable = tile?.properties?.passable;
```

### 方式二：在Render中集成

```typescript
import { getTileMapLoader } from '../game/TileMapLoader';

const render = new Render(context, gameManager, {
  levelManager,
  tileMapLoader: getTileMapLoader()
});

// 在渲染时使用tileMapLoader
const tileset = render.tileMapLoader?.getCachedMap('level2.json')?.tilesetData;
if (tileset) {
  const tile = tileMapLoader.getTileByGID(gid, tileset);
}
```

## 瓦片类型参考

| 类型ID | 名称 | 可通行 | 可破坏 | 生命值 |
|---------|------|---------|----------|----------|
| 0       | empty    | ✓       | ✗       | -        |
| 17      | wall     | ✗       | ✓       | 4        |
| 99      | grass    | ✓       | ✗       | -        |
| 59      | concrete | ✓       | ✗       | 999      |
| 54      | base_eagle | ✗   | ✓       | 1        |

## GID系统说明

- **GID = firstgid + 局部瓦片ID**
- **局部瓦片ID = GID - firstgid**
- **0表示空瓦片**（不渲染）

示例：
```javascript
const firstgid = 1;
const gid = 100;
const localId = gid - firstgid; // 99
```

## 坐标系统

### 网格坐标
- 原点：左上角 (0,0)
- X轴向右递增
- Y轴向下递增
- 范围：X[0,22], Y[0,12]

### 像素坐标
- 瓦片尺寸：33×33像素
- 转换公式：
  ```javascript
  pixelX = gridX × 33
  pixelY = gridY × 33
  ```

## 使用Tiled编辑器

1. 在Tiled中打开`resources/tankMap.tmx`
2. 修改地图布局
3. 导出为JSON格式：
   - File > Export As
   - 选择JSON格式
   - 保存为`level2.json`（或其他名称）
4. 更新TileLevelManager中的关卡列表配置

## 游戏引擎集成示例

### 碰撞检测

```typescript
import { getTileMapLoader } from './game/TileMapLoader';

const tileMapLoader = getTileMapLoader();
const mapData = await tileMapLoader.loadLevel('level2.json', 'tileset.json');
const { gridData, columns, rows } = mapData;

function canMoveTo(pixelX: pixelY): boolean {
  const { gridX, gridY } = tileMapLoader.pixelToGrid(pixelX, pixelY, tileWidth, tileHeight);

  // 边界检查
  if (gridX < 0 || gridX >= columns || gridY < 0 || gridY >= rows) {
    return false;
  }

  const gid = tileMapLoader.getGID(gridX, gridY, gridData, columns);
  return tileMapLoader.isTilePassable(gid, tileset);
}
```

### 渲染地图

```typescript
function renderMap(ctx, mapData, tileset): void {
  const { gridData, firstgid, columns, rows, tileWidth, tileHeight } = mapData;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const gid = gridData[y * columns + x];

      if (gid === 0) continue; // 跳过空瓦片

      const localId = gid - firstgid;
      const tile = tileset.tiles?.find(t => t.id === localId);

      if (tile) {
        // 计算源矩形位置
        const sourceX = (localId % tileset.columns) * tileset.tilewidth;
        const sourceY = Math.floor(localId / tileset.columns) * tileset.tileheight;

        // 绘制瓦片
        ctx.drawImage(
          spriteSheet,
          sourceX, sourceY,
          tileset.tilewidth, tileset.tileheight,
          x * tileWidth, y * tileHeight,
          tileWidth, tileHeight
        );
      }
    }
  }
}
```

### 加载游戏实体

```typescript
import { getTileLevelManager } from './game/levels/TileLevelManager';

const levelManager = getTileLevelManager();
await levelManager.init();

// 获取玩家起始位置
const playerStart = levelManager.getPlayerStart();
if (playerStart) {
  createPlayer(playerStart.gridX, playerStart.gridY);
}

// 获取敌人生成点
const enemySpawns = levelManager.getEnemySpawnPoints();
enemySpawns.forEach(spawn => {
  createEnemy(spawn.gridX, spawn.gridY);
});
```

## 性能优化建议

1. **离屏缓存**
   - 将常用瓦片预渲染到离屏Canvas
   - 减少每帧绘制操作

2. **视口裁剪**
   - 只渲染视口内的瓦片
   - 减少不必要的绘制调用

3. **脏矩形更新**
   - 只重绘变化的瓦片区域
   - 提高渲染效率

4. **瓦片查找优化**
   - 使用Map数据结构快速查找
   - 避免数组遍历

## 兼容性说明

新的TileLevelManager提供了与原LevelManager兼容的接口：
- `getMapGrid()` - 返回二维网格数据
- `getTileAt(x, y)` - 获取指定位置的瓦片ID
- `getPlayerStart()` - 获取玩家起始位置
- `getBasePosition()` - 获取基地位置
- `getEnemySpawnPoints()` - 获取敌人生成点

这样可以逐步迁移，无需大规模重写现有代码。

## 扩展新关卡

1. 在Tiled中创建新地图
2. 设置tileset为`tileset.json`
3. 导出为JSON格式
4. 在TileLevelManager的`loadLevelLevels()`方法中添加到关卡列表：
   ```typescript
   const availableLevels = ['level2.json', 'level3.json'];
   ```

## 注意事项

1. **tileset.json和level2.json必须在resources目录下**
2. **瓦片尺寸必须一致**（33×33像素）
3. **GID从1开始**，0表示空瓦片
4. **坐标系统使用网格坐标**，像素坐标由渲染层转换
5. **地图加载是异步的**，需要使用await

## 技术支持

- Tiled官方文档: https://www.mapeditor.org/
- TMX/JSON格式规范: https://doc.mapeditor.org/
- 项目README: ./README.md

## 迁移步骤

如果要从旧的LevelManager完全迁移到TileLevelManager：

1. 更新所有使用LevelManager的代码为TileLevelManager
2. 更新main.ts中的初始化代码
3. 测试所有关卡功能
4. 逐步移除旧的LevelManager相关代码

## 下一步工作

- [ ] 修复类型错误
- [ ] 更新Render类以完全支持TileMapLoader
- [ ] 添加瓦片破坏效果
- [ ] 实现多层渲染支持
- [ ] 添加动画瓦片支持
- [ ] 完善碰撞检测系统
- [ ] 添加性能优化（离屏缓存、视口裁剪）
