# 新 Tilemap 系统使用指南

## 概述

本系统为 JSTankGame 项目添加了完整的 Tilemap 支持，包括：
- 基于 `tankbrigade.png` 的瓦片地图渲染
- 坦克精灵动画系统
- JSON 格式关卡定义
- 完整的碰撞检测和瓦片属性查询

## 文件结构

```
resources/
├── tankbrigade.png              # 原始精灵图集
├── tileset_full.json            # 完整瓦片定义 (新增)
├── level_custom.json            # 示例自定义关卡 (新增)
└── tileset_analyzed.json        # 自动生成的瓦片分析

src/
├── entities/
│   └── anim_tilemap.json        # 坦克动画配置 (新增)
├── game/
│   ├── TileMapLoader.ts         # 地图加载器 (已有)
│   ├── TileMapSpriteAnimator.ts # 坦克动画管理器 (新增)
│   └── TileMapIntegrationExample.ts # 集成示例 (新增)
├── rendering/
│   └── TileMapRenderer.ts       # 地图渲染器 (新增)

tools/
└── tile_analyzer.py             # 瓦片分析工具 (新增)

test/
└── tilemap_test.html            # 测试页面 (新增)

docs/
├── TILEMAP_ADAPTATION_PLAN.md   # 适配计划文档
├── TILEMAP_IMPLEMENTATION_SUMMARY.md # 实现总结
└── NEW_TILEMAP_SYSTEM_README.md # 本文件
```

## 快速开始

### 1. 加载关卡

```typescript
import { getTileMapRenderer } from './rendering/TileMapRenderer.js';

const renderer = getTileMapRenderer();
await renderer.loadLevel('resources/level_custom.json', 'resources/tileset_full.json');
```

### 2. 渲染地图

```typescript
// 在渲染循环中
renderer.renderAllLayers({
  ctx: canvasContext,
  spriteSheet: tankImage,
  viewportX: 0,
  viewportY: 0
});
```

### 3. 创建坦克动画

```typescript
import { TankAnimatorFactory } from './game/TileMapSpriteAnimator.js';

// 创建玩家坦克动画
const playerAnim = TankAnimatorFactory.create('player_green_lvl1', 'up');

// 在游戏循环中更新
playerAnim.update(timestamp);

// 渲染坦克
renderer.renderTank(ctx, spriteSheet, playerAnim, x, y);
```

### 4. 处理移动和碰撞

```typescript
// 检查是否可以移动到指定网格位置
if (renderer.isTilePassable(gridX, gridY)) {
  // 移动玩家
}

// 获取瓦片信息
const tile = renderer.getTileAt(gridX, gridY);
console.log(tile?.gid); // 全局瓦片ID
```

## 瓦片类型参考

### 障碍物 (不可通行)

| GID | 类型 | 说明 |
|-----|------|------|
| 18 | wall | 砖墙 (可破坏) |
| 55 | base_eagle | 老家/基地 (可破坏) |
| 56 | wall_side | 墙边 (可破坏) |
| 60 | concrete | 混凝土 (不可破坏) |
| 61 | concrete_variant | 混凝土变体 |
| 79 | wall_concrete | 混凝土墙 |
| 101 | wall_brick | 损坏砖墙 |
| 103 | wall_brick_solid | 实砖墙 |
| 140 | water | 水域 |

### 地形 (可通行)

| GID | 类型 | 说明 |
|-----|------|------|
| 1 | empty | 空地 |
| 17 | empty_variant | 空地变体 |
| 75 | terrain_mixed | 混合地形 |
| 100 | grass | 草地 (提供掩护) |
| 315+ | grass_variant | 草地变体 |

### 坦克精灵 (仅用于动画)

| 类型 | 瓦片ID范围 | 说明 |
|------|------------|------|
| green_tank | 19-144 | 绿色坦克 (6方向x2帧) |
| blue_tank | 163-288 | 蓝色坦克 (6方向x2帧) |
| white_tank | 205-373 | 白色坦克 (4方向x2帧) |

## 动画配置

### 预定义动画类型

```typescript
// 玩家坦克
'player_green_lvl1'  // 基础绿色坦克
'player_green_lvl2'  // 强化绿色坦克
'player_green_lvl3'  // 高级绿色坦克

// 敌人坦克
'enemy_green_lvl1'   // 基础绿色敌人
'enemy_green_lvl2'   // 快速绿色敌人
'enemy_green_lvl3'   // 重型绿色敌人
'enemy_blue_lvl1'    // 基础蓝色敌人
'enemy_blue_lvl2'    // 快速蓝色敌人
'enemy_white_lvl1'   // 白色装甲敌人
```

### 自定义动画

```typescript
import { TileMapSpriteAnimator } from './game/TileMapSpriteAnimator.js';

const customAnim = new TileMapSpriteAnimator({
  type: 'Player',
  description: '自定义坦克',
  tileIds: {
    up: [18, 42],
    right: [66, 90],
    down: [114, 138],
    left: [162, 186]
  },
  pixelCoords: {
    up: [{x: 594, y: 0}, {x: 627, y: 0}],
    right: [{x: 594, y: 66}, {x: 627, y: 66}],
    down: [{x: 594, y: 132}, {x: 627, y: 132}],
    left: [{x: 594, y: 198}, {x: 627, y: 198}]
  },
  frameCount: 2,
  frameDuration: 200
}, 'up');
```

## 关卡JSON格式

### 最小关卡示例

```json
{
  "version": "1.1",
  "name": "My Level",
  "width": 23,
  "height": 13,
  "tilewidth": 33,
  "tileheight": 33,
  "tilesets": [{
    "firstgid": 1,
    "name": "tankbrigade",
    "filename": "tileset_full.json"
  }],
  "layers": [{
    "name": "Ground",
    "type": "tilelayer",
    "data": [1, 1, 1, ...]  // 23x13 = 299个瓦片ID
  }],
  "objects": {
    "player": {
      "position": {"gridX": 11, "gridY": 11}
    },
    "base": {
      "position": {"gridX": 11, "gridY": 11}
    }
  }
}
```

### 完整示例

参见 `resources/level_custom.json`

## 工具使用

### 瓦片分析器

```bash
# 分析特定瓦片
python3 tools/tile_analyzer.py -a 100 102 139

# 导出所有瓦片为单独图片
python3 tools/tile_analyzer.py -e output/tiles/

# 生成完整配置文件
python3 tools/tile_analyzer.py -c -o resources/tileset_new.json
```

## 性能优化建议

1. **使用离屏缓存**
```typescript
// 预渲染静态地图层
renderer.prerenderLayer(spriteSheet, 0);
```

2. **视口裁剪**
```typescript
renderer.renderLayer({
  ctx,
  spriteSheet,
  viewportX: camera.x,
  viewportY: camera.y,
  viewportWidth: canvas.width,
  viewportHeight: canvas.height
}, 0);
```

3. **缓存动画器**
```typescript
import { getCachedAnimator } from './game/TileMapSpriteAnimator.js';

// 使用缓存避免重复创建
const animator = getCachedAnimator('player_green_lvl1', 'up');
```

## 调试

### 打开测试页面

```bash
# 启动开发服务器
npm run dev

# 访问测试页面
open http://localhost:5173/test/tilemap_test.html
```

### 启用调试渲染

```typescript
// 在渲染循环中调用
renderer.renderDebugInfo(ctx);
```

## 常见问题

### Q: 瓦片ID和GID的区别？
A: GID = firstgid + 本地瓦片ID。firstgid通常为1，所以GID 100对应的本地ID是99。

### Q: 如何添加新关卡？
A: 1. 复制 `level_custom.json` 2. 修改 `data` 数组 3. 更新对象位置

### Q: 坦克动画不播放？
A: 确保在每一帧调用 `animator.update(timestamp)`

### Q: 碰撞检测不准确？
A: 检查网格坐标计算是否正确，使用 `renderer.pixelToGrid()` 转换

## 更新日志

### v1.1.0
- ✅ 完整的 tileset_full.json 配置
- ✅ 坦克动画系统
- ✅ TileMapRenderer 渲染器
- ✅ 关卡JSON格式定义
- ✅ Python 分析工具
- ✅ 测试页面

## 许可证

参见项目根目录 LICENSE 文件
