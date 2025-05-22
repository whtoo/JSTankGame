JSTankGame
==========

## 为什么要重新开始写这个项目？
因为，我就是想要重启`自制小游戏`😂。

## Done
- [x] 构建工具升级
- [x] 去除tilemap的细线
- [x] 引入rx替换vanllia event
- [x] 边界检查和障碍物碰撞检测
- [x] tank速度太快了减慢
- [x] ES6改造
    - [x] es6模块化
    - [x] 基于生成器的原生rx系统
    - [x] 基于promise的资源加载

## Todo
- [ ] 基于Reactive和Tree-Rendering的优化渲染机制
    - [ ] 基于Tree-Rendering的精灵渲染
    - [ ] 增加渲染树
    - [ ] 增加diff-rendering
    - [ ] dirty-check
    - [ ] 从dirty-check到passive-depency-graph

## 游戏架构

### 类图

```mermaid
classDiagram
    class GameManager {
        -render: Render
        -options: Object
        -isRunning: boolean
        -lastFrameTime: number
        -frameRate: number
        -frameInterval: number
        -accumulator: number
        +constructor(render, options)
        +startGameLoop()
        +stopGameLoop()
        -_gameLoop()
        -_update(deltaTime)
        -renderGame()
    }

    class GraphicRender {
        -_dom: HTMLElement
        -_options: Object
        +constructor(dom, options)
        +render(renderTree)
    }

    class GameObjManager {
        +gameObjects: Array
        +cmd: Object
        +inputState: Object
        +isInited: number
        +constructor()
    }

    class Render {
        +tileSheet: Image
        +mapTitle: Array
        +isReady: boolean
        +readyCallbacks: Array
        +constructor()
        +eventShipLoaded(res)
        +onReady(callback)
        +init()
        +isValidPosition(x, y)
        +updateGame(deltaTime)
        +drawScreen()
        +drawPlayer(tileSheet)
        +drawMap(tileSheet)
    }

    class ImageResouce {
        +url: string
        +img: Image
        +cb: Function
        +constructor(url)
        +_onLoad(evt)
        +onLoad(func)
        +image()
    }

    class Observable {
        +generator: Function
        +constructor(generator)
        +subscribe(observer)
        +static fromEvent(target, eventName)
    }

    class Player {
        +sourceDx: number
        +sourceDy: number
        +sourceW: number
        +sourceH: number
        +animSheet: SpriteAnimSheet
        +constructor()
    }

    class TankPlayer {
        +direction: string
        +tankName: string
        +isPlayer: boolean
        +destCook: number
        +destX: number
        +destY: number
        +destW: number
        +destH: number
        +arc: number
        +angleInRadians: number
        +halfDestW: number
        +halfDestH: number
        +X: number
        +Y: number
        +centerX: number
        +centerY: number
        +static speedM: number
        +constructor(tankID, initDirection, isUser)
        +updateSelfCoor()
        +rotationAP(direction, cmd)
    }

    class SpriteAnimSheet {
        +animationFrames: Array
        +animLength: number
        +orderIndex: number
        +constructor(startAnim, stopAnim, X)
        +getFrames()
    }

    class SpriteAnimation {
        +sourceDx: number
        +sourceDy: number
        +sourceW: number
        +sourceH: number
        +constructor(sX, sY)
    }

    class APWatcher {
        +constructor()
    }

    GameManager --> Render : uses
    GameObjManager --> TankPlayer : contains
    TankPlayer --|> Player : extends
    TankPlayer --> SpriteAnimSheet : has
    SpriteAnimSheet --> SpriteAnimation : contains
    Render --> ImageResouce : uses
    APWatcher --> GameObjManager : uses
```

### 序列图

```mermaid
sequenceDiagram
    participant Window
    participant SetupGame
    participant CanvasApp
    participant GameObjManager
    participant Render
    participant APWatcher
    participant GameManager

    Window->>SetupGame: load
    SetupGame->>Window: addEventListener('load')
    Window->>SetupGame: eventWindowLoaded
    SetupGame->>CanvasApp: call
    CanvasApp->>CanvasApp: canvasSupport()
    CanvasApp->>GameObjManager: new
    CanvasApp->>Render: new
    Render->>ImageResouce: new(tankbrigade)
    ImageResouce->>ImageResouce: load image
    ImageResouce->>Render: eventShipLoaded
    Render->>Render: init()
    Render->>Render: offscreenCache()
    Render->>Render: requestAnimFrame(drawScreen)
    CanvasApp->>APWatcher: new
    CanvasApp->>GameManager: new(render)
    Render->>GameManager: onReady(callback)
    GameManager->>GameManager: startGameLoop()
    loop Game Loop
        GameManager->>GameManager: _gameLoop()
        GameManager->>GameManager: _update(deltaTime)
        GameManager->>Render: updateGame(deltaTime)
        Render->>GameObjManager: update player positions
        GameManager->>GameManager: renderGame()
        GameManager->>Render: drawScreen()
        Render->>Render: drawMap()
        Render->>Render: drawPlayer()
        Render->>GameManager: requestAnimFrame(_gameLoop)
    end
```

### 活动图

```mermaid
graph TD
    A[开始] --> B[加载游戏资源]
    B --> C[初始化游戏组件]
    C --> D[创建游戏对象管理器]
    D --> E[创建渲染器]
    E --> F[创建输入控制器]
    F --> G[创建游戏管理器]
    G --> H[等待渲染器准备就绪]
    H --> I[开始游戏循环]
    I --> J[更新游戏状态]
    J --> K{检查输入}
    K -->|有输入| L[更新玩家方向和位置]
    K -->|无输入| M[保持当前状态]
    L --> N[检查边界和碰撞]
    M --> N
    N -->|有碰撞| O[阻止移动]
    N -->|无碰撞| P[允许移动]
    O --> Q[渲染游戏]
    P --> Q
    Q --> R[计算FPS]
    R --> S[请求下一帧]
    S --> J
```
