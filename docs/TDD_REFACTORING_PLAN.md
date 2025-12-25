# JSTankGame TDD 重构计划

## 概述

本文档提供了使用测试驱动开发（TDD）方法将当前 JSTankGame 重构为完整 FC 坦克大战复刻版本的详细计划。

## 一、当前实现 vs 经典游戏对比

### 1.1 已实现功能 ✅

| 功能模块 | 当前实现 | 经典游戏 | 状态 |
|---------|---------|---------|------|
| 基础渲染 | Canvas 渲染 + 离屏缓存 | 类似 | ✅ 匹配 |
| 玩家移动 | WASD 四方向移动 | 方向键移动 | ✅ 匹配 |
| 旋转系统 | 0°/90°/180°/270° | 四方向 | ✅ 匹配 |
| 精灵动画 | 帧动画系统 | 精灵动画 | ✅ 匹配 |
| 地图渲染 | 硬编码地图 (13x23) | 多关卡地图 | ⚠️ 部分 |
| 输入处理 | 键盘事件 | 键盘/手柄 | ⚠️ 部分 |

### 1.2 缺失核心功能 ❌

| 功能模块 | 经典游戏特性 | 优先级 |
|---------|-------------|-------|
| **射击系统** | 玩家可发射子弹，击中敌人/障碍物 | 🔴 P0 |
| **敌人系统** | 4种敌人类型（基础/快速/强力/装甲） | 🔴 P0 |
| **子弹碰撞** | 子弹与墙体/坦克的碰撞检测 | 🔴 P0 |
| **可破坏地形** | 砖墙可被破坏，钢墙需要高级武器 | 🔴 P0 |
| **大本营保护** | 保护老鹰，被毁则游戏结束 | 🔴 P0 |
| **道具系统** | 6种道具（手雷/头盔/铁锹/星星/坦克/计时器） | 🟡 P1 |
| **关卡系统** | 35个不同关卡 | 🟡 P1 |
| **生命系统** | 多条命，20,000分奖励生命 | 🟡 P1 |
| **计分系统** | 不同敌人不同分数 | 🟡 P1 |
| **双人模式** | 双人同屏合作 | 🟢 P2 |
| **音效系统** | 射击/爆炸/移动音效 | 🟢 P2 |
| **游戏状态** | 开始/暂停/游戏结束/胜利 | 🟡 P1 |

## 二、经典游戏详细规格

### 2.1 玩家坦克规格

```
属性：
- 移动：4方向网格对齐移动
- 射击：同时只能有1发子弹在场（默认）
- 生命：1发子弹即毁（除非有护盾）
- 护盾：每关开始时短暂保护
- 武器等级：4个等级（通过星星道具升级）

武器等级：
- Level 0: 默认速度
- Level 1: 快速子弹
- Level 2: 可同时发射2发子弹
- Level 3: 子弹可破坏钢墙，对砖墙伤害翻倍
```

### 2.2 敌人坦克规格

| 类型 | 分数 | 生命值 | 移动速度 | 子弹速度 | 特点 |
|-----|------|--------|---------|---------|------|
| Basic Tank | 100 | 1 | 慢 (1) | 慢 (1) | 威胁较小 |
| Fast Tank | 200 | 1 | 快 (3) | 普通 (2) | 对大本营威胁大 |
| Power Tank | 300 | 1 | 普通 (2) | 快 (3) | 破坏砖墙快 |
| Armor Tank | 400 | 4 | 普通 (2) | 普通 (2) | 需4发子弹，被击中变灰 |

每关敌人数量：20辆

### 2.3 地形规格

| 地形 | 坦克通过 | 子弹通过 | 可破坏 | 特殊属性 |
|-----|---------|---------|--------|---------|
| 空地 | ✅ | ✅ | - | 无 |
| 砖墙 | ❌ | ❌ | ✅ (4击) | 普通子弹需4击，高级子弹需2击 |
| 钢墙 | ❌ | ❌ | ⚠️ | 仅最高级子弹可破坏 (2击) |
| 树木 | ✅ | ✅ | ❌ | 遮挡坦克和子弹视线 |
| 水 | ❌ | ✅ | ❌ | 坦克不可通过，子弹可飞过 |
| 冰 | ✅ | ✅ | ❌ | 坦克移动会打滑 |

地图尺寸：13行 × 23列（每个格子16×16像素）

### 2.4 道具规格

道具生成规则：每关第4、11、18辆敌人出现时闪烁，被击中后生成道具

| 道具 | 效果 | 分数 |
|-----|------|------|
| Grenade (手雷) | 消灭屏幕上所有敌人 | 500 |
| Helmet (头盔) | 获得临时护盾 | 500 |
| Shovel (铁锹) | 大本营周围砖墙变为钢墙（临时）+ 修复 | 500 |
| Star (星星) | 武器升级（最高4级） | 500 |
| Tank (坦克) | 额外生命 | 500 |
| Timer (计时器) | 冻结所有敌人 | 500 |

## 二、E2E 测试结果 (2024-12-24)

### 2.1 Playwright 测试设置

已成功配置 Playwright E2E 测试框架：

| 文件 | 描述 |
|------|------|
| `playwright.config.js` | Playwright 配置文件 |
| `e2e/game-status.spec.js` | E2E 测试套件 |

### 2.2 测试结果摘要

**所有测试通过：9/9 ✓**

```
✓ 1. 页面加载与 Canvas 元素验证 (458ms)
✓ 2. 游戏初始化与玩家坦克渲染 (1.4s)
✓ 3. 游戏对象管理器与玩家状态 (329ms)
✓ 4. 键盘输入响应 (438ms)
✓ 5. 方向键移动处理 (741ms)
✓ 6. 渲染循环活跃状态 (998ms)
✓ 7. Canvas 渲染上下文 (817ms)
✓ 8. 资源加载无控制台错误 (2.4s)
✓ 9. JavaScript 正确加载 (397ms)

总计: 9 passed (14.2s)
```

### 2.3 发现的问题与备注

#### 问题 1: 无射击系统
- **严重程度**: 🔴 P0 (阻断)
- **描述**: 玩家坦克无法发射子弹
- **影响**: 游戏核心玩法缺失
- **任务**: 实现阶段 1 射击系统

#### 问题 2: 无敌人系统
- **严重程度**: 🔴 P0 (阻断)
- **描述**: 游戏中没有敌人
- **影响**: 无法进行战斗
- **任务**: 实现阶段 3 敌人系统

#### 问题 3: 无碰撞检测
- **严重程度**: 🔴 P0 (阻断)
- **描述**: 坦克可穿过墙壁，无碰撞逻辑
- **影响**: 地形无实际作用
- **任务**: 实现阶段 2 碰撞检测系统

#### 问题 4: 无大本营保护
- **严重程度**: 🔴 P0 (阻断)
- **描述**: 没有大本营和老鹰
- **影响**: 无法输掉游戏
- **任务**: 实现阶段 4 大本营系统

#### 问题 5: 硬编码地图
- **严重程度**: 🟡 P1 (重要)
- **描述**: 地图数据硬编码在代码中
- **影响**: 难以添加新关卡
- **任务**: 提取地图配置到独立文件

#### 问题 6: 无游戏状态管理
- **严重程度**: 🟡 P1 (重要)
- **描述**: 游戏永远运行，无开始/暂停/结束
- **影响**: 无法完成完整游戏流程
- **任务**: 实现阶段 6 游戏状态管理

### 2.4 当前架构评估

**优点:**
- 模块化架构清晰 (entities/managers/rendering 分离)
- Canvas 渲染高效 (离屏缓存)
- 精灵动画系统完善
- 输入处理正确

**需改进:**
- 缺少 ECS 系统的完整实现
- 游戏循环由渲染驱动 (应改为固定时间步长)
- 状态管理分散在多个模块

### 2.5 测试脚本命令

```bash
# 运行 E2E 测试
npm run test:e2e

# 使用 UI 模式
npm run test:e2e:ui

# 调试模式
npm run test:e2e:debug

# 查看测试报告
npx playwright show-report

# 运行所有测试
npm run test:all
```

## 三、TypeScript + Vite 迁移计划 (Phase -1)

**目标：** 将项目从 Webpack + JavaScript 迁移到 Vite + TypeScript，为后续开发提供更好的类型安全和开发体验。

### 迁移步骤

#### -1.1 基础设施配置

**任务：**
- [ ] 安装 Vite 和 TypeScript 依赖
- [ ] 创建 `tsconfig.json` 配置文件
- [ ] 创建 `vite.config.ts` 配置文件
- [ ] 更新 `package.json` 构建脚本
- [ ] 移除 Webpack 相关配置和依赖

**配置文件示例：**

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["src"]
}
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 8080,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  assetsInclude: ['**/*.png', '**/*.json']
});
```

#### -1.2 核心类型定义

**创建类型定义文件：**

```typescript
// src/types/index.ts
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Direction {
  value: 'w' | 'a' | 's' | 'd' | 'up' | 'left' | 'down' | 'right';
}

export interface TankConfig {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: Direction['value'];
  speed: number;
  isPlayer?: boolean;
}

export interface BulletConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: Direction['value'];
  speed: number;
  owner: 'player' | 'enemy';
  powerLevel: number;
}

export interface TileConfig {
  type: number;
  destructible: boolean;
  health?: number;
}

export interface MapConfig {
  cols: number;
  rows: number;
  tileRenderSize: number;
  tileSourceSize: number;
  tilesPerRowInSheet: number;
  indexOffset: number;
}

export interface CollisionResult {
  collision: boolean;
  type: 'none' | 'wall' | 'tank' | 'base';
  destructible?: boolean;
  tileX?: number;
  tileY?: number;
  target?: any;
}

export interface AnimationFrame {
  sourceDx: number;
  sourceDy: number;
  sourceW: number;
  sourceH: number;
}

export interface SpriteAnimSheet {
  getFrames(): AnimationFrame;
}
```

#### -1.3 模块转换顺序

**按依赖顺序转换模块：**

1. **类型定义** (`src/types/`)
   - [ ] `index.ts` - 核心类型定义

2. **工具模块** (`src/utils/`)
   - [ ] `ImageResource.js` → `ImageResource.ts`
   - [ ] `Logger.js` → `Logger.ts`
   - [ ] `KeyInputEvent.js` → `KeyInputEvent.ts`

3. **配置模块** (`src/game/`)
   - [ ] `GameConfig.js` → `GameConfig.ts`
   - [ ] `MapConfig.js` → `MapConfig.ts`
   - [ ] `GameState.js` → `GameState.ts`
   - [ ] `GameLoop.js` → `GameLoop.ts`

4. **关卡模块** (`src/game/levels/`)
   - [ ] `LevelConfig.js` → `LevelConfig.ts`
   - [ ] `LevelManager.js` → `LevelManager.ts`

5. **动画模块** (`src/animation/`)
   - [ ] `SpriteAnimation.js` → `SpriteAnimation.ts`
   - [ ] `SpriteAnimSheet.js` → `SpriteAnimSheet.ts`

6. **实体模块** (`src/entities/`)
   - [ ] `Bullet.js` → `Bullet.ts`
   - [ ] `Player.js` → `Player.ts`
   - [ ] `TankPlayer.js` → `TankPlayer.ts`
   - [ ] `EnemyTank.js` → `EnemyTank.ts`

7. **输入模块** (`src/input/`)
   - [ ] `APWatcher.js` → `APWatcher.ts`

8. **系统模块** (`src/systems/`)
   - [ ] `CollisionSystem.js` → `CollisionSystem.ts`

9. **管理器模块** (`src/managers/`)
   - [ ] `GameObjManager.js` → `GameObjManager.ts`

10. **渲染模块** (`src/rendering/`)
    - [ ] `Render.js` → `Render.ts`

11. **入口文件**
    - [ ] `main.js` → `main.ts`
    - [ ] `extreem-engine.js` → `extreem-engine.ts`

#### -1.4 测试文件转换

**将测试文件转换为 TypeScript：**

```bash
# 更新 Jest 配置支持 TypeScript
npm install --save-dev ts-jest @types/jest

# 转换测试文件（示例）
src/**/*.test.js → src/**/*.test.ts
src/integration/*.test.js → src/integration/*.test.ts
```

**新的 Jest 配置：**

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

#### -1.5 更新 HTML 入口

**修改 `index.html` 使用 Vite 方式：**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tank Battles in TypeScript</title>
  <link rel="stylesheet" href="/css/main.css">
</head>
<body>
  <canvas id="gameCanvas"></canvas>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

#### -1.6 迁移验收标准

**完成标准：**
- [ ] 所有 `.js` 文件已转换为 `.ts`
- [ ] 无 TypeScript 编译错误
- [ ] 所有测试通过
- [ ] 开发服务器正常启动
- [ ] 生产构建成功
- [ ] E2E 测试通过

### 迁移后的目录结构

```
src/
├── animation/          # 动画模块
│   ├── SpriteAnimation.ts
│   ├── SpriteAnimSheet.ts
│   └── *.test.ts
├── entities/           # 实体模块
│   ├── Bullet.ts
│   ├── Player.ts
│   ├── TankPlayer.ts
│   ├── EnemyTank.ts
│   └── *.test.ts
├── game/               # 游戏核心
│   ├── GameConfig.ts
│   ├── MapConfig.ts
│   ├── GameState.ts
│   ├── GameLoop.ts
│   └── levels/
│       ├── LevelConfig.ts
│       ├── LevelManager.ts
│       └── levels.json
├── input/              # 输入处理
│   ├── APWatcher.ts
│   └── *.test.ts
├── managers/           # 管理器
│   ├── GameObjManager.ts
│   └── *.test.ts
├── rendering/          # 渲染
│   ├── Render.ts
│   └── *.test.ts
├── systems/            # 游戏系统
│   ├── CollisionSystem.ts
│   └── *.test.ts
├── types/              # 类型定义 ⭐ 新增
│   └── index.ts
├── utils/              # 工具
│   ├── ImageResource.ts
│   ├── Logger.ts
│   ├── KeyInputEvent.ts
│   └── *.test.ts
├── integration/        # 集成测试
│   └── *.test.ts
├── main.ts             # 主入口
└── extreem-engine.ts   # Vite 入口
```

### 迁移收益

| 方面 | 改进 |
|-----|------|
| **类型安全** | 编译时类型检查，减少运行时错误 |
| **IDE 支持** | 更好的自动完成和重构支持 |
| **代码质量** | 强制类型定义提高代码可维护性 |
| **开发体验** | Vite 的极速热更新 |
| **构建速度** | Vite 比 Webpack 快 10-100 倍 |
| **测试体验** | TypeScript + Jest 更好的测试支持 |

### 迁移时间估计

- **基础设施配置**: 0.5 天
- **类型定义**: 0.5 天
- **模块转换**: 2-3 天
- **测试转换**: 0.5 天
- **调试和修复**: 1 天

**总计：约 4-5 天完成迁移**

---

## 三、TDD 重构计划

### 阶段 0：测试基础设施完善 (Week 1)

**目标：** 建立完善的测试框架和可测试的架构

```javascript
// 测试文件结构示例
// tests/unit/components/Bullet.test.js
// tests/integration/Combat.test.js
// tests/e2e/FullGame.test.js
```

#### 0.1 添加测试工具库

```javascript
// tests/helpers/gameTestHelpers.js
export class GameTestHelpers {
  static createMockCanvas() { /* ... */ }
  static createMockInput() { /* ... */ }
  static simulateKeyPress(key) { /* ... */ }
  static waitForFrames(count) { /* ... */ }
}
```

**测试用例：**
- [ ] 创建测试辅助工具
- [ ] 设置测试快照系统（用于视觉回归）
- [ ] 创建 mock 资源加载器

### 阶段 1：射击系统 (Week 2-3) 🔴 P0

#### 1.1 子弹实体 (Bullet.js)

```javascript
// src/entities/Bullet.js
class Bullet {
  constructor(owner, x, y, direction, powerLevel = 0)
  update(deltaTime)
  isOutOfBounds()
  getDamage()
  canDestroySteel()
}
```

**测试用例：**
```javascript
describe('Bullet', () => {
  test('should create bullet with correct position and direction', () => {
    const bullet = new Bullet('player', 100, 100, 'up', 0);
    expect(bullet.x).toBe(100);
    expect(bullet.y).toBe(100);
    expect(bullet.direction).toBe('up');
  });

  test('should move in correct direction', () => {
    const bullet = new Bullet('player', 100, 100, 'up');
    bullet.update(16); // 16ms delta
    expect(bullet.y).toBeLessThan(100);
  });

  test('should detect out of bounds', () => {
    const bullet = new Bullet('player', 0, 0, 'up');
    bullet.update(16);
    expect(bullet.isOutOfBounds()).toBe(true);
  });

  test('power level 3 bullets can destroy steel', () => {
    const bullet = new Bullet('player', 100, 100, 'up', 3);
    expect(bullet.canDestroySteel()).toBe(true);
  });

  test('lower power bullets cannot destroy steel', () => {
    const bullet = new Bullet('player', 100, 100, 'up', 0);
    expect(bullet.canDestroySteel()).toBe(false);
  });
});
```

#### 1.2 玩家射击能力

```javascript
// 修改 TankPlayer.js
class TankPlayer {
  // 新增属性
  bullets = []
  maxConcurrentBullets = 1
  powerLevel = 0
  canShoot = true

  // 新增方法
  shoot() {
    if (!this.canShoot || this.bullets.length >= this.maxConcurrentBullets) {
      return null;
    }
    const bullet = new Bullet(this, this.getBarrelPosition(), this.direction, this.powerLevel);
    this.bullets.push(bullet);
    return bullet;
  }

  removeBullet(bullet) {
    this.bullets = this.bullets.filter(b => b !== bullet);
  }

  upgradeWeapon() {
    this.powerLevel = Math.min(this.powerLevel + 1, 3);
    if (this.powerLevel >= 2) {
      this.maxConcurrentBullets = 2;
    }
  }

  resetWeapon() {
    this.powerLevel = 0;
    this.maxConcurrentBullets = 1;
  }
}
```

**测试用例：**
```javascript
describe('TankPlayer Shooting', () => {
  test('should create bullet when shooting', () => {
    const player = new TankPlayer(0, 'up', true);
    const bullet = player.shoot();
    expect(bullet).toBeDefined();
    expect(player.bullets.length).toBe(1);
  });

  test('should not exceed max concurrent bullets', () => {
    const player = new TankPlayer(0, 'up', true);
    player.shoot();
    const secondBullet = player.shoot();
    expect(secondBullet).toBeNull();
  });

  test('should allow 2 bullets at power level 2', () => {
    const player = new TankPlayer(0, 'up', true);
    player.powerLevel = 2;
    player.maxConcurrentBullets = 2;
    player.shoot();
    const secondBullet = player.shoot();
    expect(secondBullet).toBeDefined();
    expect(player.bullets.length).toBe(2);
  });

  test('should remove bullet when called', () => {
    const player = new TankPlayer(0, 'up', true);
    const bullet = player.shoot();
    player.removeBullet(bullet);
    expect(player.bullets.length).toBe(0);
  });

  test('upgradeWeapon should increase power level', () => {
    const player = new TankPlayer(0, 'up', true);
    player.upgradeWeapon();
    expect(player.powerLevel).toBe(1);
  });

  test('upgradeWeapon should max at level 3', () => {
    const player = new TankPlayer(0, 'up', true);
    player.powerLevel = 3;
    player.upgradeWeapon();
    expect(player.powerLevel).toBe(3);
  });

  test('resetWeapon should reset to default', () => {
    const player = new TankPlayer(0, 'up', true);
    player.powerLevel = 3;
    player.maxConcurrentBullets = 2;
    player.resetWeapon();
    expect(player.powerLevel).toBe(0);
    expect(player.maxConcurrentBullets).toBe(1);
  });
});
```

#### 1.3 子弹管理器

```javascript
// src/managers/BulletManager.js
class BulletManager {
  constructor()
  addBullet(bullet)
  removeBullet(bullet)
  updateAll(deltaTime)
  checkCollisions(tanks, map)
  getAll()
}
```

**测试用例：**
```javascript
describe('BulletManager', () => {
  test('should add and track bullets', () => {
    const manager = new BulletManager();
    const bullet = new Bullet('player', 100, 100, 'up');
    manager.addBullet(bullet);
    expect(manager.getAll().length).toBe(1);
  });

  test('should remove bullets that go out of bounds', () => {
    const manager = new BulletManager();
    const bullet = new Bullet('player', 0, 0, 'up');
    manager.addBullet(bullet);
    manager.updateAll(16);
    expect(manager.getAll().length).toBe(0);
  });

  test('should detect bullet-brick collision', () => {
    // 测试子弹与砖墙碰撞
  });

  test('should detect bullet-tank collision', () => {
    // 测试子弹与坦克碰撞
  });
});
```

### 阶段 2：碰撞检测系统 (Week 3-4) 🔴 P0

#### 2.1 地形碰撞

```javascript
// src/collision/MapCollision.js
class MapCollision {
  static canTankMoveTo(x, y, mapData)
  static canBulletPassThrough(x, y, mapData)
  static getTileAt(x, y, mapData)
  static damageTile(x, y, mapData, damage)
}
```

**测试用例：**
```javascript
describe('MapCollision', () => {
  test('should allow movement on empty tile', () => {
    const canMove = MapCollision.canTankMoveTo(100, 100, emptyMap);
    expect(canMove).toBe(true);
  });

  test('should block movement on brick wall', () => {
    const canMove = MapCollision.canTankMoveTo(brickWallX, brickWallY, brickMap);
    expect(canMove).toBe(false);
  });

  test('should block movement on steel wall', () => {
    const canMove = MapCollision.canTankMoveTo(steelX, steelY, steelMap);
    expect(canMove).toBe(false);
  });

  test('should block movement on water', () => {
    const canMove = MapCollision.canTankMoveTo(waterX, waterY, waterMap);
    expect(canMove).toBe(false);
  });

  test('should allow movement on ice', () => {
    const canMove = MapCollision.canTankMoveTo(iceX, iceY, iceMap);
    expect(canMove).toBe(true);
  });

  test('bullets should pass through water', () => {
    const canPass = MapCollision.canBulletPassThrough(waterX, waterY, waterMap);
    expect(canPass).toBe(true);
  });

  test('bullets should be blocked by brick wall', () => {
    const canPass = MapCollision.canBulletPassThrough(brickX, brickY, brickMap);
    expect(canPass).toBe(false);
  });

  test('brick wall should be damaged by bullet', () => {
    const map = JSON.parse(JSON.stringify(brickMap));
    MapCollision.damageTile(brickX, brickY, map, 1);
    expect(MapCollision.getTileAt(brickX, brickY, map).health).toBe(3);
  });

  test('brick wall should be destroyed after 4 hits', () => {
    const map = JSON.parse(JSON.stringify(brickMap));
    MapCollision.damageTile(brickX, brickY, map, 4);
    expect(MapCollision.getTileAt(brickX, brickY, map)).toBe(null);
  });
});
```

#### 2.2 坦克间碰撞

```javascript
// src/collision/TankCollision.js
class TankCollision {
  static checkTankToTank(tank1, tank2)
  static checkTankToBullet(tank, bullet)
  static getBoundingBox(tank)
}
```

**测试用例：**
```javascript
describe('TankCollision', () => {
  test('should detect overlapping tanks', () => {
    const tank1 = new TankPlayer(0, 'up', true);
    tank1.x = 100;
    tank1.y = 100;
    const tank2 = new TankPlayer(1, 'up', false);
    tank2.x = 100;
    tank2.y = 100;
    expect(TankCollision.checkTankToTank(tank1, tank2)).toBe(true);
  });

  test('should not detect non-overlapping tanks', () => {
    const tank1 = new TankPlayer(0, 'up', true);
    tank1.x = 100;
    tank1.y = 100;
    const tank2 = new TankPlayer(1, 'up', false);
    tank2.x = 200;
    tank2.y = 200;
    expect(TankCollision.checkTankToTank(tank1, tank2)).toBe(false);
  });

  test('should detect bullet hit on enemy', () => {
    const tank = new TankPlayer(0, 'up', false);
    const bullet = new Bullet('player', tank.x, tank.y, 'up');
    expect(TankCollision.checkTankToBullet(tank, bullet)).toBe(true);
  });

  test('should not detect owner bullet collision', () => {
    const tank = new TankPlayer(0, 'up', true);
    const bullet = new Bullet('player', tank.x, tank.y, 'up');
    bullet.owner = tank;
    expect(TankCollision.checkTankToBullet(tank, bullet)).toBe(false);
  });
});
```

### 阶段 3：敌人系统 (Week 5-6) 🔴 P0

#### 3.1 敌人实体

```javascript
// src/entities/EnemyTank.js
class EnemyTank extends TankPlayer {
  constructor(type, spawnPoint)
  getType() // Returns: 'basic' | 'fast' | 'power' | 'armor'
  getScore()
  getHealth()
  getMaxHealth()
  aiUpdate(deltaTime, playerPosition, mapData)
}
```

**敌人类型配置：**
```javascript
// src/config/EnemyTypes.js
export const ENEMY_TYPES = {
  basic: { score: 100, health: 1, speed: 1, bulletSpeed: 1 },
  fast: { score: 200, health: 1, speed: 3, bulletSpeed: 2 },
  power: { score: 300, health: 1, speed: 2, bulletSpeed: 3 },
  armor: { score: 400, health: 4, speed: 2, bulletSpeed: 2 }
};
```

**测试用例：**
```javascript
describe('EnemyTank', () => {
  test('basic enemy should have correct stats', () => {
    const enemy = new EnemyTank('basic', { x: 0, y: 0 });
    expect(enemy.getScore()).toBe(100);
    expect(enemy.getHealth()).toBe(1);
  });

  test('fast enemy should move faster', () => {
    const enemy = new EnemyTank('fast', { x: 0, y: 0 });
    expect(enemy.getSpeed()).toBeGreaterThan(new EnemyTank('basic', { x: 0, y: 0 }).getSpeed());
  });

  test('armor enemy should take 4 hits to destroy', () => {
    const enemy = new EnemyTank('armor', { x: 0, y: 0 });
    for (let i = 0; i < 3; i++) {
      enemy.takeDamage();
      expect(enemy.isAlive()).toBe(true);
    }
    enemy.takeDamage();
    expect(enemy.isAlive()).toBe(false);
  });

  test('enemy should change color when damaged (armor type)', () => {
    const enemy = new EnemyTank('armor', { x: 0, y: 0 });
    const initialColor = enemy.getColor();
    enemy.takeDamage();
    expect(enemy.getColor()).not.toBe(initialColor);
  });
});
```

#### 3.2 敌人生成器

```javascript
// src/managers/EnemySpawner.js
class EnemySpawner {
  constructor(levelConfig)
  spawnNext()
  getRemainingCount()
  setSpawnCallback(callback)
  isFlashingTank() // For power-up spawn logic
}
```

**测试用例：**
```javascript
describe('EnemySpawner', () => {
  test('should spawn 20 enemies per level', () => {
    const spawner = new EnemySpawner({ enemyCount: 20 });
    let count = 0;
    spawner.setSpawnCallback(() => count++);
    for (let i = 0; i < 20; i++) {
      spawner.spawnNext();
    }
    expect(count).toBe(20);
  });

  test('4th, 11th, 18th tanks should be flashing', () => {
    const spawner = new EnemySpawner({ enemyCount: 20 });
    const flashingIndices = [4, 11, 18];
    flashingIndices.forEach(index => {
      // 验证对应位置是闪烁坦克
    });
  });

  test('should not spawn beyond enemy count', () => {
    const spawner = new EnemySpawner({ enemyCount: 20 });
    for (let i = 0; i < 25; i++) {
      spawner.spawnNext();
    }
    expect(spawner.getSpawnedCount()).toBe(20);
  });
});
```

#### 3.3 敌人 AI

```javascript
// src/ai/EnemyAI.js
class EnemyAI {
  constructor(enemyTank)
  update(deltaTime, playerPosition, mapData)
  selectDirection()
  shouldShoot()
}

// AI 行为策略
// - 基础: 随机移动，偶尔射击
// - 进阶: 朝向玩家移动，瞄准玩家
// - 高级: 寻找路径到玩家，预判玩家位置
```

**测试用例：**
```javascript
describe('EnemyAI', () => {
  test('should change direction when blocked', () => {
    const enemy = new EnemyTank('basic', { x: 0, y: 0 });
    const ai = new EnemyAI(enemy);
    const map = createMapWithWall();
    ai.update(16, { x: 100, y: 0 }, map);
    expect(enemy.direction).not.toBe('up');
  });

  test('should shoot when player is in line', () => {
    const enemy = new EnemyTank('power', { x: 0, y: 100 });
    const ai = new EnemyAI(enemy);
    ai.update(16, { x: 0, y: 200 }, emptyMap);
    expect(ai.shouldShoot()).toBe(true);
  });
});
```

### 阶段 4：大本营系统 (Week 7) 🔴 P0

```javascript
// src/entities/Headquarters.js
class Headquarters {
  constructor(x, y)
  isDestroyed()
  destroy()
  repair()
  fortifyWalls() // 铁锹道具效果
}
```

**测试用例：**
```javascript
describe('Headquarters', () => {
  test('should be destroyed when hit by bullet', () => {
    const hq = new Headquarters(100, 100);
    const bullet = new Bullet('enemy', 100, 100, 'down');
    hq.hitBy(bullet);
    expect(hq.isDestroyed()).toBe(true);
  });

  test('should trigger game over when destroyed', () => {
    const hq = new Headquarters(100, 100);
    hq.destroy();
    expect(hq.isDestroyed()).toBe(true);
  });

  test('fortify should turn brick to steel', () => {
    const hq = new Headquarters(100, 100);
    hq.fortifyWalls();
    // 验证周围墙变为钢墙
  });
});
```

### 阶段 5：道具系统 (Week 8-9) 🟡 P1

```javascript
// src/entities/PowerUp.js
class PowerUp {
  constructor(type, x, y)
  getType()
  apply(player)
}

// src/managers/PowerUpManager.js
class PowerUpManager {
  spawnAt(x, y)
  updateAll(deltaTime)
  checkPickup(player)
  activate(type)
}
```

**测试用例：**
```javascript
describe('PowerUp', () => {
  test('grenade should destroy all enemies', () => {
    const powerUp = new PowerUp('grenade', 100, 100);
    const enemies = [
      new EnemyTank('basic', { x: 0, y: 0 }),
      new EnemyTank('fast', { x: 50, y: 0 })
    ];
    powerUp.apply(null, enemies);
    expect(enemies.every(e => e.isAlive())).toBe(false);
  });

  test('star should upgrade weapon', () => {
    const player = new TankPlayer(0, 'up', true);
    const powerUp = new PowerUp('star', 100, 100);
    powerUp.apply(player);
    expect(player.powerLevel).toBe(1);
  });

  test('helmet should give temporary shield', () => {
    const player = new TankPlayer(0, 'up', true);
    const powerUp = new PowerUp('helmet', 100, 100);
    powerUp.apply(player);
    expect(player.hasShield()).toBe(true);
  });

  test('timer should freeze enemies', () => {
    const powerUp = new PowerUp('timer', 100, 100);
    const enemies = [new EnemyTank('basic', { x: 0, y: 0 })];
    powerUp.apply(null, enemies);
    expect(enemies[0].isFrozen()).toBe(true);
  });
});
```

### 阶段 6：游戏状态管理 (Week 10) 🟡 P1

```javascript
// src/game/GameState.js
class GameState {
  getState() // 'menu' | 'playing' | 'paused' | 'gameover' | 'victory'
  setState(state)
  pause()
  resume()
}

// src/game/ScoreManager.js
class ScoreManager {
  addScore(points)
  getScore()
  getHighScore()
  checkExtraLife() // 每20,000分奖励生命
}
```

### 阶段 7：关卡系统 (Week 11-12) 🟡 P1

```javascript
// src/game/LevelManager.js
class LevelManager {
  constructor()
  loadLevel(levelNumber)
  getCurrentLevel()
  nextLevel()
  getMapData()
}

// 关卡数据格式
const LEVEL_1 = {
  map: [/* 13x23 tile array */],
  enemyTypes: ['basic', 'basic', 'fast', ...], // 20 enemies
  spawnPoints: [{ x: 0, y: 0 }, ...]
};
```

### 阶段 8：双人模式 (Week 13) 🟢 P2

```javascript
// 支持第二个玩家
const player2 = new TankPlayer(1, 'up', true);
player2.setInputKeys({ up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', shoot: 'Enter' });
```

### 阶段 9：音效系统 (Week 14) 🟢 P2

```javascript
// src/audio/AudioManager.js
class AudioManager {
  playShoot()
  playExplosion()
  playPowerUp()
  playBackgroundMusic()
  setVolume(volume)
}
```

## 四、实施建议

### 4.1 开发流程

1. **红灯-绿灯-重构循环：**
   - 先写失败的测试用例
   - 实现最小可行代码使测试通过
   - 重构代码，保持测试通过

2. **测试层次：**
   ```
   单元测试: 测试单个类/方法
   集成测试: 测试多个组件协作
   E2E测试: 测试完整游戏流程
   ```

3. **持续集成：**
   - 每次提交前运行测试
   - 保持测试覆盖率 > 80%

### 4.2 优先级实施顺序

```
第一阶段 (必须): 射击 + 碰撞 + 敌人 + 大本营
第二阶段 (重要): 道具 + 关卡 + 状态管理
第三阶段 (增强): 双人 + 音效 + 视觉效果
```

### 4.3 技术债务处理

在重构过程中同时解决现有问题：
- [ ] 硬编码地图数据移到配置文件
- [ ] 游戏循环改为固定时间步长
- [ ] 添加完整的错误处理
- [ ] TypeScript 迁移（可选）

## 五、验收标准

### 5.1 功能验收

- [ ] 玩家可以发射子弹并摧毁敌人
- [ ] 4种敌人类型表现不同
- [ ] 可破坏地形系统完整工作
- [ ] 大本营被毁时游戏结束
- [ ] 所有6种道具正确工作
- [ ] 完整的关卡流程（开始 -> 游戏 -> 结束）
- [ ] 计分和生命系统

### 5.2 质量验收

- [ ] 所有核心功能有单元测试
- [ ] 关键流程有集成测试
- [ ] 测试覆盖率 > 80%
- [ ] 无控制台错误或警告
- [ ] 性能：60fps 稳定运行

## 六、时间线总结

| 阶段 | 功能 | 时间 |
|-----|------|------|
| 0 | 测试基础设施 | 1周 |
| 1 | 射击系统 | 2周 |
| 2 | 碰撞检测 | 2周 |
| 3 | 敌人系统 | 2周 |
| 4 | 大本营保护 | 1周 |
| 5 | 道具系统 | 2周 |
| 6 | 游戏状态 | 1周 |
| 7 | 关卡系统 | 2周 |
| 8+ | 双人/音效 | 按需 |

**总计：约 13 周完成核心功能**

---

Sources:
- [StrategyWiki - Battle City Gameplay](https://strategywiki.org/wiki/Battle_City/Gameplay)
- [GameFAQs - Battle City Guide](https://gamefaqs.gamespot.com/nes/562966-battle-city/faqs/29287)
