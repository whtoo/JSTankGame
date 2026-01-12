# 瓦片地图配置文件使用说明

## 文件结构

```
resources/
├── tileset.json          # 瓦片图集定义
├── level2.json            # 关卡2地图配置
├── tankMap.tmx            # Tiled编辑器源文件
└── tankbrigade.png        # 瓦片图集图片
```

## 配置文件格式说明

### tileset.json - 瓦片图集定义

基于Tiled标准格式，描述瓦片图集的元数据和属性：

**核心字段：**
- `tilewidth`: 单个瓦片宽度（像素）- 当前为33
- `tileheight`: 单个瓦片高度（像素）- 当前为33
- `columns`: 图集列数 - 当前为24列
- `tilecount`: 瓦片总数 - 当前为432个
- `image.source`: 图集图片文件名 - "tankbrigade.png"
- `image.width/height`: 图集图片尺寸 - 800×600像素

**tiles数组：**
定义游戏中使用的瓦片类型及其属性：
- `id`: 瓦片在图集中的局部ID（从0开始）
- `type`: 瓦片类型名称
- `properties`: 自定义游戏属性
  - `passable`: 是否可通行
  - `destructible`: 是否可破坏
  - `hitPoints`: 破坏所需生命值
  - `providesCover`: 是否提供掩护（半透明遮挡）

### level2.json - 关卡地图定义

**核心字段：**
- `width`: 地图宽度（列数）- 当前23列
- `height`: 地图高度（行数）- 当前13行
- `tilewidth`: 瓦片宽度（必须与tileset一致）- 33像素
- `tileheight`: 瓦片高度（必须与tileset一致）- 33像素
- `renderorder`: 渲染顺序（"right-down"表示从左上角开始，逐行向右下）

**tilesets数组：**
- `firstgid`: 第一个瓦片的全局ID（GID）- 当前为1
- `filename`: 引用的tileset文件 - "tileset.json"

**layers数组：**
每个图层包含：
- `data`: 瓦片GID数组，按行优先顺序排列
  - `0` 表示空瓦片（不绘制）
  - `GID > 0` 引用tileset中的瓦片
  - 计算公式：`局部ID = GID - firstgid`
  - 数组索引计算：`index = y × width + x`

当前定义的图层：
1. **Ground Layer** (id:1) - 地形层（草地、墙、混凝土等）
2. **Object Layer** (id:2) - 对象层（坦克、基地等）

**objects对象：**
- `player`: 玩家坦克位置和属性
- `enemies`: 敌人坦克数组
- `spawnPoints`: 生成点数组（用于实体生成）

每个对象包含：
- `gid`: 对应的瓦片GID
- `position`: 位置信息（网格坐标和像素坐标）
  - `gridX/gridY`: 网格坐标
  - `pixelX/pixelY`: 像素坐标

## GID（全局瓦片ID）系统

GID用于在地图数据中引用瓦片：

```
GID = firstgid + 局部瓦片ID
局部瓦片ID = GID - firstgid
```

示例：
- tileset的firstgid = 1
- 地图中GID = 100的瓦片
- 局部瓦片ID = 100 - 1 = 99

## 坐标系统

### 网格坐标
- **原点**: 左上角 (0,0)
- **X轴**: 向右递增
- **Y轴**: 向下递增
- **计算公式**:
  ```javascript
  pixelX = gridX × tilewidth
  pixelY = gridY × tileheight
  ```

### 像素坐标
- 直接使用像素值
- 用于精确放置对象
- 原点：左上角 (0,0)

### 当前关卡尺寸
- **总像素宽度**: 23 × 33 = 759像素
- **总像素高度**: 13 × 33 = 429像素

## 地图数据解析示例

### 二维数组转换

将一维data数组转换为二维网格：

```javascript
function parseMapData(data, width, height) {
  const map = [];
  for (let y = 0; y < height; y++) {
    const row = data.slice(y * width, (y + 1) * width);
    map.push(row);
  }
  return map;
}

// 使用示例
const groundLayer = parseMapData(level.layers[0].data, 23, 13);
console.log(groundLayer[5][10]); // 获取第6行第11列的瓦片GID
```

### 瓦片属性查找

根据GID查找瓦片属性：

```javascript
function getTileProperties(gid, tileset) {
  if (gid === 0) return null; // 空瓦片
  
  const firstgid = 1;
  const localId = gid - firstgid;
  
  // 查找瓦片定义
  return tileset.tiles.find(tile => tile.id === localId);
}

// 使用示例
const gid = 100; // 从地图数据中读取
const tileProps = getTileProperties(gid, tileset);
console.log(tileProps); // { id: 99, type: "grass", properties: {...} }
```

## 游戏引擎集成示例

### 加载地图和图集

```javascript
async function loadLevel(levelFile, tilesetFile) {
  // 加载tileset
  const tilesetResponse = await fetch(tilesetFile);
  const tileset = await tilesetResponse.json();
  
  // 加载地图配置
  const levelResponse = await fetch(levelFile);
  const level = await levelResponse.json();
  
  // 加载图集图片
  const imageResponse = await fetch(level.tilesets[0].image.source);
  const image = await createImageBitmap(await imageResponse.blob());
  
  return { level, tileset, image };
}

// 使用示例
const gameData = await loadLevel('resources/level2.json', 'resources/tileset.json');
```

### 渲染地图

```javascript
function renderMap(ctx, level, tileset, image, viewport) {
  const { width, height, tilewidth, tileheight } = level;
  const firstgid = level.tilesets[0].firstgid;
  
  // 遍历所有图层
  for (const layer of level.layers) {
    if (!layer.visible) continue;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const gid = layer.data[index];
        
        // 跳过空瓦片和视口外的瓦片
        if (gid === 0) continue;
        
        const pixelX = x * tilewidth;
        const pixelY = y * tileheight;
        
        if (!isInView(pixelX, pixelY, viewport)) continue;
        
        const localId = gid - firstgid;
        const tileX = (localId % tileset.columns) * tilewidth;
        const tileY = Math.floor(localId / tileset.columns) * tileheight;
        
        // 绘制瓦片
        ctx.drawImage(
          image,
          tileX, tileY, tilewidth, tileheight,        // 源矩形
          pixelX, pixelY, tilewidth, tileheight          // 目标位置
        );
      }
    }
  }
}

function isInView(x, y, viewport) {
  return x >= viewport.x &&
         y >= viewport.y &&
         x < viewport.x + viewport.width &&
         y < viewport.y + viewport.height;
}
```

### 碰撞检测

```javascript
function canMoveTo(pixelX, pixelY, level, tileset) {
  const gridX = Math.floor(pixelX / level.tilewidth);
  const gridY = Math.floor(pixelY / level.tileheight);
  
  // 边界检查
  if (gridX < 0 || gridX >= level.width ||
      gridY < 0 || gridY >= level.height) {
    return false;
  }
  
  const index = gridY * level.width + gridX;
  const gid = level.layers[0].data[index];
  
  if (gid === 0) return true; // 空瓦片可通行
  
  const firstgid = level.tilesets[0].firstgid;
  const localId = gid - firstgid;
  const tile = tileset.tiles.find(t => t.id === localId);
  
  return tile && tile.properties.passable;
}
```

### 瓦片破坏逻辑

```javascript
function damageTile(gridX, gridY, damage, level, tileset) {
  const index = gridY * level.width + gridX;
  const gid = level.layers[0].data[index];
  
  if (gid === 0) return false; // 空瓦片不可破坏
  
  const localId = gid - level.tilesets[0].firstgid;
  const tile = tileset.tiles.find(t => t.id === localId);
  
  if (!tile || !tile.properties.destructible) {
    return false;
  }
  
  tile.hitPoints = (tile.hitPoints || 0) - damage;
  
  if (tile.hitPoints <= 0) {
    // 瓦片被破坏，替换为空瓦片
    level.layers[0].data[index] = 0;
    playDestructionAnimation(gridX, gridY);
    return true;
  }
  
  return false;
}
```

### 实体生成

```javascript
function spawnEntities(level) {
  const entities = [];
  
  // 生成玩家
  if (level.objects.player) {
    entities.push({
      type: 'player',
      x: level.objects.player.position.pixelX,
      y: level.objects.player.position.pixelY,
      gid: level.objects.player.gid
    });
  }
  
  // 生成敌人
  if (level.objects.enemies) {
    level.objects.enemies.forEach(enemy => {
      entities.push({
        type: 'enemy',
        x: enemy.position.pixelX,
        y: enemy.position.pixelY,
        gid: enemy.gid
      });
    });
  }
  
  return entities;
}
```

## 瓦片类型参考

### 常用瓦片类型表

| ID | 类型 | 可通行 | 可破坏 | 描述 |
|----|------|---------|---------|------|
| 0  | empty    | ✓       | ✗       | 黑色背景，空区域 |
| 17 | wall     | ✗       | ✓       | 红砖墙，可破坏 |
| 59 | concrete | ✓       | ✗       | 白色混凝土，坚固 |
| 99 | grass    | ✓       | ✗       | 绿色草地，提供掩护 |
| 54 | base_eagle | ✗   | ✓       | 鹰旗基地，需要防守 |
| 73 | player_tank | - | - | 玩家坦克（黄色）|
| 74 | enemy_tank  | - | - | 敌人坦克（绿色）|

### 图层用途

- **Ground Layer**: 地形层，包含所有静态元素（墙、草地、混凝土、基地）
- **Object Layer**: 对象层，包含动态元素（坦克、特殊对象）

## 地图编辑

### 使用Tiled编辑器

1. 打开 `tankMap.tmx` 文件
2. 修改地图布局
3. 保存后导出为JSON格式：
   - File > Export As
   - 选择JSON格式
   - 保存为 `level2.json`

### 手动编辑JSON

修改图层数据：
```javascript
// 修改某个位置的瓦片
const index = y * width + x;
level.layers[0].data[index] = newGID;
```

添加新对象：
```javascript
level.objects.enemies.push({
  id: 5,
  name: "Enemy Tank 2",
  type: "enemy_tank",
  gid: 74,
  position: {
    gridX: 10,
    gridY: 5,
    pixelX: 330,
    pixelY: 165
  }
});
```

## 注意事项

1. **GID从1开始**，0表示空瓦片（不渲染）
2. **tilewidth和tileheight必须一致**，否则渲染会错位
3. **firstgid的值**影响所有GID的计算，通常是1
4. **图层顺序**决定渲染顺序，数组中先出现的在底层
5. **对象坐标**支持网格坐标和像素坐标，建议统一使用网格坐标
6. **columns和tilecount**需要根据实际图集图片计算
7. **properties中的游戏属性**可以根据游戏需要自定义

## 扩展指南

### 添加新关卡

1. 在Tiled中创建新地图
2. 设置相同尺寸和tileset
3. 导出为JSON格式
4. 修改level文件中的properties和objects

### 添加新瓦片

1. 在tileset.json的tiles数组中添加新条目
2. 确保id唯一且不超出tilecount
3. 定义properties中的游戏相关属性
4. 更新对应的图片资源

### 动画瓦片支持

如需支持动画，可在tile定义中添加：

```json
{
  "id": 75,
  "type": "animated_water",
  "animation": [
    { "tileid": 75, "duration": 200 },
    { "tileid": 76, "duration": 200 },
    { "tileid": 77, "duration": 200 },
    { "tileid": 78, "duration": 200 }
  ]
}
```

## 性能优化建议

1. **离屏渲染**: 将常用瓦片预渲染到离屏Canvas
   ```javascript
   const tileCache = {};
   function getTileImage(gid) {
     if (!tileCache[gid]) {
       tileCache[gid] = renderTileToCanvas(gid);
     }
     return tileCache[gid];
   }
   ```

2. **脏矩形更新**: 只重绘变化的区域
   ```javascript
   const dirtyRects = [];
   // 标记变化区域...
   // 只渲染dirtyRects中的瓦片
   ```

3. **分层渲染**: 背景层和对象层分开渲染，减少重绘

4. **视口裁剪**: 只渲染视口内的瓦片
   ```javascript
   const startX = Math.floor(viewport.x / tilewidth);
   const endX = Math.ceil((viewport.x + viewport.width) / tilewidth);
   const startY = Math.floor(viewport.y / tileheight);
   const endY = Math.ceil((viewport.y + viewport.height) / tileheight);
   
   for (let y = startY; y < endY; y++) {
     for (let x = startX; x < endX; x++) {
       // 渲染瓦片...
     }
   }
   ```

## 调试技巧

1. **可视化瓦片边界**:
   ```javascript
   ctx.strokeStyle = 'red';
   ctx.strokeRect(x * tilewidth, y * tileheight, tilewidth, tileheight);
   ```

2. **显示GID信息**:
   ```javascript
   ctx.fillStyle = 'white';
   ctx.fillText(gid, x * tilewidth + 5, y * tileheight + 10);
   ```

3. **检查碰撞区域**:
   ```javascript
   ctx.fillStyle = 'rgba(255,0,0,0.3)';
   // 高亮显示不可通行的瓦片
   ```

## 版本兼容性

- 兼容Tiled 1.11.0+的JSON格式
- 支持多tileset（当前使用1个）
- 支持多图层（当前使用2个）
- 支持自定义properties（用于游戏逻辑）

## 技术支持

如遇到问题，请参考：
- Tiled官方文档: https://doc.mapeditor.org/
- TMX格式规范: https://doc.mapeditor.org/en/stable/reference/tmx-map-format/
- JSON格式规范: https://doc.mapeditor.org/en/stable/reference/json-map-format/
