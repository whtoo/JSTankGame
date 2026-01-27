# Tank Brigade Tilemap 适配计划

## 1. 资源分析

### 1.1 tankbrigade.png 图集结构

```
图集尺寸: 800x600 像素
瓦片尺寸: 33x33 像素
网格布局: 24列 x 18行 = 432个瓦片
```

#### 区域划分

| 区域 | 行范围 | 列范围 | 瓦片ID范围 | 用途 |
|------|--------|--------|------------|------|
| 特效区 | 0-1 | 0-17 | 0-47 | 爆炸、子弹、图标 |
| 地形区A | 2-5 | 0-17 | 48-143 | 砖墙、混凝土墙 |
| 地形区B | 6-11 | 0-17 | 144-287 | 草地、水域、雪地 |
| 坦克区-绿 | 0-5 | 18-23 | 18-143 | 绿色坦克动画(6帧x6方向) |
| 坦克区-蓝 | 6-11 | 18-23 | 162-287 | 蓝色坦克动画(6帧x6方向) |
| 坦克区-白 | 8-11 | 12-17 | 204-287 | 白色坦克动画(4帧x6方向) |
| 底部Logo | 16-17 | 0-23 | 384-431 | Tank Brigade标题 |

### 1.2 坦克精灵动画结构

#### 绿色坦克 (6行 x 6列)
```
方向映射 (每行是一个方向):
第1行 (ID 18-23): 上 (Up)
第2行 (ID 42-47): 右上 (Up-Right)
第3行 (ID 66-71): 右 (Right)
第4行 (ID 90-95): 右下 (Down-Right)
第5行 (ID 114-119): 下 (Down)
第6行 (ID 138-143): 左下/其他 (Left/Other)
```

#### 蓝色坦克 (6行 x 6列)
```
第1行 (ID 162-167): 上 (Up)
第2行 (ID 186-191): 右上 (Up-Right)
第3行 (ID 210-215): 右 (Right)
第4行 (ID 234-239): 右下 (Down-Right)
第5行 (ID 258-263): 下 (Down)
第6行 (ID 282-287): 左下/其他 (Left/Other)
```

### 1.3 tankMap.tmx 使用的瓦片

```
瓦片ID    行  列    类型推测
--------------------------------
16        0   16   特效/图标
42        1   18   坦克帧
55        2   7    地形
60        2   12   地形
74        3   2    地形
78        3   6    地形
100       4   4    砖墙
102       4   6    砖墙
139       5   19   坦克帧
314-324   13  2-12 草地/水域纹理 (第1行)
338-348   14  2-12 草地/水域纹理 (第2行)
362-372   15  2-12 草地/水域纹理 (第3行)
386-396   16  2-12 草地/水域纹理 (第4行)
410-420   17  2-12 草地/水域纹理 (第5行)
```

---

## 2. 瓦片类型定义 (更新 tileset.json)

### 2.1 地形瓦片

```json
{
  "tiles": [
    {"id": 0, "type": "empty", "properties": {"passable": true, "destructible": false}},
    {"id": 17, "type": "wall", "properties": {"passable": false, "destructible": true, "hitPoints": 4}},
    {"id": 54, "type": "base_eagle", "properties": {"passable": false, "destructible": true, "critical": true}},
    {"id": 59, "type": "concrete", "properties": {"passable": true, "destructible": false, "hitPoints": 999}},
    {"id": 99, "type": "grass", "properties": {"passable": true, "destructible": false, "providesCover": true}},
    {"id": 100, "type": "wall_damaged", "properties": {"passable": false, "destructible": true, "hitPoints": 2}},
    {"id": 102, "type": "wall_brick", "properties": {"passable": false, "destructible": true, "hitPoints": 3}},
    {"id": 139, "type": "water", "properties": {"passable": false, "destructible": false}},
    {"id": 314, "type": "grass_terrain", "properties": {"passable": true, "destructible": false}}
  ]
}
```

### 2.2 坦克精灵定义

```json
{
  "tiles": [
    {"id": 18, "type": "tank_green_up_1", "properties": {"faction": "player", "direction": "up"}},
    {"id": 42, "type": "tank_green_up_2", "properties": {"faction": "player", "direction": "up"}},
    {"id": 66, "type": "tank_green_right_1", "properties": {"faction": "player", "direction": "right"}},
    {"id": 90, "type": "tank_green_down_1", "properties": {"faction": "player", "direction": "down"}},
    {"id": 114, "type": "tank_green_left_1", "properties": {"faction": "player", "direction": "left"}},
    {"id": 162, "type": "tank_blue_up_1", "properties": {"faction": "enemy", "direction": "up"}},
    {"id": 186, "type": "tank_blue_up_2", "properties": {"faction": "enemy", "direction": "up"}},
    {"id": 210, "type": "tank_blue_right_1", "properties": {"faction": "enemy", "direction": "right"}},
    {"id": 234, "type": "tank_blue_down_1", "properties": {"faction": "enemy", "direction": "down"}},
    {"id": 258, "type": "tank_blue_left_1", "properties": {"faction": "enemy", "direction": "left"}}
  ]
}
```

---

## 3. 动画配置 (更新 anim.json)

### 3.1 玩家坦克动画

```json
{
  "player_green": {
    "type": "Player",
    "description": "绿色玩家坦克 - 4方向",
    "tileIds": {
      "up": [18, 42],
      "right": [66, 90],
      "down": [114, 138],
      "left": [162, 186]
    },
    "animationSpeed": 200
  },
  "player_blue": {
    "type": "Player",
    "description": "蓝色玩家坦克 - 4方向",
    "tileIds": {
      "up": [162, 186],
      "right": [210, 234],
      "down": [258, 282],
      "left": [306, 330]
    },
    "animationSpeed": 200
  }
}
```

### 3.2 敌人坦克动画

```json
{
  "enemy_green": {
    "type": "Enemy",
    "description": "绿色敌人坦克",
    "tileIds": {
      "up": [18, 42, 66],
      "right": [90, 114, 138],
      "down": [162, 186, 210],
      "left": [234, 258, 282]
    }
  },
  "enemy_blue": {
    "type": "Enemy",
    "description": "蓝色敌人坦克",
    "tileIds": {
      "up": [162, 186, 210],
      "right": [234, 258, 282],
      "down": [306, 330, 354],
      "left": [378, 402, 426]
    }
  }
}
```

---

## 4. 关卡地图JSON格式

### 4.1 标准关卡结构

```json
{
  "version": "1.0",
  "name": "Level 1",
  "width": 23,
  "height": 13,
  "tileWidth": 33,
  "tileHeight": 33,
  "tileset": "tileset.json",
  "layers": [
    {
      "name": "ground",
      "type": "tilelayer",
      "data": [78, 78, 78, ...]
    },
    {
      "name": "objects",
      "type": "tilelayer",
      "data": [16, 16, 16, ...]
    }
  ],
  "entities": {
    "playerSpawn": {"x": 8, "y": 2},
    "basePosition": {"x": 11, "y": 11},
    "enemySpawns": [
      {"x": 6, "y": 1},
      {"x": 16, "y": 1}
    ]
  }
}
```

### 4.2 地图元素编码

```
空地块:      0 或 16 (empty)
砖墙:        17, 100, 102 (wall, wall_damaged, wall_brick)
混凝土墙:    59 (concrete)
草地:        99, 314-420 (grass, grass_terrain)
水域:        139 (water)
老家/基地:   54 (base_eagle)
玩家起始:    73 (player_tank) - 对象层
敌人起始:    74 (enemy_tank) - 对象层
```

---

## 5. 实施步骤

### Phase 1: 配置更新
1. ✅ 分析tankbrigade.png图集结构
2. ⬜ 更新 `resources/tileset.json` - 添加完整瓦片定义
3. ⬜ 更新 `src/entities/anim.json` - 添加坦克动画定义
4. ⬜ 更新 `src/entities/entities.json` - 添加精灵定义

### Phase 2: 工具开发
1. ⬜ 创建 `tools/tile_extractor.py` - 瓦片提取工具
2. ⬜ 创建 `tools/tile_analyzer.py` - 图集分析工具
3. ⬜ 创建 `tools/level_editor.py` - 简单关卡编辑器

### Phase 3: 代码集成
1. ⬜ 更新 `TileMapLoader.ts` - 支持新瓦片类型
2. ⬜ 更新 `TileRegistry.ts` - 注册新瓦片
3. ⬜ 更新 `Render.ts` - 支持新渲染方式
4. ⬜ 创建 `TankSpriteAnimator.ts` - 坦克动画管理器

### Phase 4: 测试验证
1. ⬜ 创建测试关卡
2. ⬜ 验证瓦片渲染
3. ⬜ 验证坦克动画
4. ⬜ 验证碰撞检测

---

## 6. 关键坐标参考

### 6.1 坦克精灵坐标 (像素)

```
绿色坦克:
  上:     (594, 0),   (627, 0)
  右上:   (594, 33),  (627, 33)
  右:     (594, 66),  (627, 66)
  右下:   (594, 99),  (627, 99)
  下:     (594, 132), (627, 132)
  左:     (594, 165), (627, 165)

蓝色坦克:
  上:     (594, 198), (627, 198)
  右:     (594, 264), (627, 264)
  下:     (594, 330), (627, 330)
  左:     (594, 396), (627, 396)
```

### 6.2 关键地形瓦片坐标

```
砖墙:
  ID 100: (132, 132) - 标准砖墙
  ID 102: (198, 132) - 另一种砖墙

混凝土:
  ID 59:  (363, 66)  - 混凝土块

草地:
  ID 99:  (99, 132)  - 草地

基地:
  ID 54:  (198, 66)  - 老家/鹰标志
```

---

## 7. 技术实现细节

### 7.1 瓦片ID到像素的转换

```typescript
function tileIdToPixel(tileId: number, cols: number = 24, tileSize: number = 33): {x: number, y: number} {
  const row = Math.floor(tileId / cols);
  const col = tileId % cols;
  return {
    x: col * tileSize,
    y: row * tileSize
  };
}
```

### 7.2 GID系统

```
GID = firstgid + local_tile_id
local_tile_id = GID - firstgid

示例:
firstgid = 1
tile_id = 17 (砖墙)
GID = 1 + 17 = 18
```

### 7.3 动画帧更新

```typescript
class TankAnimator {
  private currentFrame: number = 0;
  private lastUpdate: number = 0;
  private frameInterval: number = 200; // ms

  update(timestamp: number, direction: Direction): number {
    if (timestamp - this.lastUpdate > this.frameInterval) {
      this.currentFrame = (this.currentFrame + 1) % 2; // 2帧动画
      this.lastUpdate = timestamp;
    }
    return this.getTileIdForDirection(direction, this.currentFrame);
  }
}
```

---

## 8. 注意事项

1. **瓦片尺寸**: 实际使用33x33像素，不是32x32
2. **坐标原点**: 左上角 (0,0)
3. **GID偏移**: 所有GID需要减去firstgid(=1)得到本地ID
4. **动画帧**: 坦克有2-3帧动画，需要循环播放
5. **方向映射**: 坦克有4个主要方向（上、右、下、左）
