/**
 * TileMapIntegrationExample - 展示如何集成新的Tilemap系统到现有项目
 * 
 * 使用场景:
 * 1. 加载和渲染tilemap关卡
 * 2. 使用tilemap瓦片创建坦克动画
 * 3. 碰撞检测和瓦片属性查询
 */

import { getTileMapRenderer } from '../rendering/TileMapRenderer.js';
import { 
  TileMapSpriteAnimator, 
  TankAnimatorFactory,
  getCachedAnimator 
} from './TileMapSpriteAnimator.js';
import { getTileMapLoader } from './TileMapLoader.js';
import type { Direction } from '../types/index.js';

/**
 * 集成示例类
 */
export class TileMapIntegrationExample {
  private renderer = getTileMapRenderer();
  private tileMapLoader = getTileMapLoader();
  private spriteSheet: HTMLImageElement | null = null;
  
  // 游戏实体
  private playerAnimator: TileMapSpriteAnimator | null = null;
  private enemyAnimators: Map<string, TileMapSpriteAnimator> = new Map();
  
  /**
   * 初始化并加载资源
   */
  async init(spriteSheetPath: string): Promise<boolean> {
    try {
      // 加载精灵图
      this.spriteSheet = await this.loadImage(spriteSheetPath);
      
      // 加载关卡
      const loaded = await this.renderer.loadLevel(
        'resources/level_custom.json',
        'resources/tileset_full.json'
      );
      
      if (!loaded) {
        console.error('Failed to load level');
        return false;
      }
      
      // 创建玩家坦克动画
      this.playerAnimator = TankAnimatorFactory.create('player_green_lvl1', 'up');
      
      // 创建敌人坦克动画
      this.enemyAnimators.set('enemy1', 
        TankAnimatorFactory.create('enemy_green_lvl1', 'down')!);
      this.enemyAnimators.set('enemy2', 
        TankAnimatorFactory.create('enemy_blue_lvl1', 'left')!);
      
      console.log('TileMap integration initialized successfully');
      return true;
    } catch (error) {
      console.error('Initialization error:', error);
      return false;
    }
  }
  
  /**
   * 加载图片
   */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
  
  /**
   * 渲染完整场景
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.spriteSheet) return;
    
    // 1. 渲染地图背景层
    this.renderer.renderLayer({
      ctx,
      spriteSheet: this.spriteSheet,
      viewportX: 0,
      viewportY: 0
    }, 0); // 第一层: Ground Layer
    
    // 2. 渲染玩家坦克
    if (this.playerAnimator) {
      const playerPos = { x: 363, y: 363 }; // 11,11 网格位置
      this.renderer.renderTank(
        ctx,
        this.spriteSheet,
        this.playerAnimator,
        playerPos.x,
        playerPos.y
      );
    }
    
    // 3. 渲染敌人坦克
    const enemyPositions = [
      { id: 'enemy1', x: 132, y: 66 },   // 4,2 网格
      { id: 'enemy2', x: 594, y: 66 }    // 18,2 网格
    ];
    
    for (const enemy of enemyPositions) {
      const animator = this.enemyAnimators.get(enemy.id);
      if (animator) {
        this.renderer.renderTank(
          ctx,
          this.spriteSheet,
          animator,
          enemy.x,
          enemy.y
        );
      }
    }
    
    // 4. 渲染覆盖层(草地等)
    this.renderer.renderLayer({
      ctx,
      spriteSheet: this.spriteSheet
    }, 1); // 第二层: Cover Layer
  }
  
  /**
   * 更新动画
   */
  update(timestamp: number): void {
    // 更新玩家动画
    this.playerAnimator?.update(timestamp);
    
    // 更新敌人动画
    for (const animator of this.enemyAnimators.values()) {
      animator.update(timestamp);
    }
  }
  
  /**
   * 处理玩家移动输入
   */
  handlePlayerMove(direction: Direction): void {
    if (!this.playerAnimator) return;
    
    // 更新动画方向
    this.playerAnimator.setDirection(direction);
    
    // 计算新位置
    const currentPos = { x: 11, y: 11 }; // 当前网格位置
    let newX = currentPos.x;
    let newY = currentPos.y;
    
    switch (direction) {
      case 'up': newY--; break;
      case 'down': newY++; break;
      case 'left': newX--; break;
      case 'right': newX++; break;
    }
    
    // 碰撞检测
    if (this.canMoveTo(newX, newY)) {
      // 更新位置 (实际项目中更新玩家实体位置)
      console.log(`Player moved to (${newX}, ${newY})`);
    }
  }
  
  /**
   * 检查是否可以移动到指定位置
   */
  canMoveTo(gridX: number, gridY: number): boolean {
    // 检查地图边界
    const mapDims = this.renderer.getMapDimensions();
    if (!mapDims) return false;
    
    const tileSize = this.renderer.getTileSize();
    const maxCol = mapDims.width / tileSize;
    const maxRow = mapDims.height / tileSize;
    
    if (gridX < 0 || gridX >= maxCol || gridY < 0 || gridY >= maxRow) {
      return false;
    }
    
    // 检查瓦片是否可通行
    return this.renderer.isTilePassable(gridX, gridY);
  }
  
  /**
   * 射击并检查命中
   */
  handleShoot(startX: number, startY: number, direction: Direction): void {
    // 简单的射线检测
    let checkX = startX;
    let checkY = startY;
    const maxDistance = 10; // 最大检测距离
    
    for (let i = 0; i < maxDistance; i++) {
      switch (direction) {
        case 'up': checkY--; break;
        case 'down': checkY++; break;
        case 'left': checkX--; break;
        case 'right': checkX++; break;
      }
      
      const tileInfo = this.renderer.getTileAt(checkX, checkY);
      if (!tileInfo) continue;
      
      // 检查是否击中不可通行瓦片
      if (!this.renderer.isTilePassable(checkX, checkY)) {
        console.log(`Hit tile at (${checkX}, ${checkY}), GID: ${tileInfo.gid}`);
        
        // 检查是否可破坏
        if (this.renderer.isTileDestructible(checkX, checkY)) {
          console.log('Tile is destructible!');
          // TODO: 破坏瓦片逻辑
        }
        break;
      }
    }
  }
  
  /**
   * 获取关卡信息
   */
  getLevelInfo(): object | null {
    const map = this.renderer.getCurrentMap();
    if (!map) return null;
    
    return {
      width: map.columns,
      height: map.rows,
      tileSize: map.tileWidth,
      totalTiles: map.columns * map.rows,
      layers: map.mapData.layers.length
    };
  }
  
  /**
   * 渲染调试信息
   */
  renderDebugInfo(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(5, 5, 200, 100);
    
    ctx.fillStyle = '#0f0';
    ctx.font = '12px monospace';
    
    const info = this.getLevelInfo();
    if (info) {
      ctx.fillText(`Map: ${info.width}x${info.height}`, 10, 25);
      ctx.fillText(`TileSize: ${info.tileSize}px`, 10, 45);
      ctx.fillText(`Layers: ${info.layers}`, 10, 65);
    }
    
    if (this.playerAnimator) {
      ctx.fillText(`Dir: ${this.playerAnimator.getDirection()}`, 10, 85);
    }
  }
}

/**
 * 快速集成函数 - 在现有GameLoop中使用
 * 
 * 使用示例:
 * 
 * ```typescript
 * const tilemapExample = new TileMapIntegrationExample();
 * 
 * // 初始化
 * await tilemapExample.init('resources/tankbrigade.png');
 * 
 * // 游戏循环
 * function gameLoop(timestamp: number) {
 *   // 更新
 *   tilemapExample.update(timestamp);
 *   
 *   // 渲染
 *   tilemapExample.render(ctx);
 *   tilemapExample.renderDebugInfo(ctx);
 *   
 *   requestAnimationFrame(gameLoop);
 * }
 * 
 * // 输入处理
 * inputHandler.onMove = (dir) => tilemapExample.handlePlayerMove(dir);
 * inputHandler.onShoot = () => tilemapExample.handleShoot(11, 11, 'up');
 * ```
 */
export async function setupTileMapIntegration(
  spriteSheetPath: string
): Promise<TileMapIntegrationExample | null> {
  const integration = new TileMapIntegrationExample();
  const success = await integration.init(spriteSheetPath);
  return success ? integration : null;
}
