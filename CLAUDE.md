# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JSTankGame is a JavaScript-based 2D tank battle game. The codebase has been refactored to use modern ES6+ practices with a modular architecture. The project follows a simplified Entity-Component System pattern with clear separation between game logic, rendering, input handling, and resource management.

## Common Commands

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Run tests
npm run test
```

## Architecture

### Entry Point and Flow

1. **src/extreem-engine.js** - Minimal webpack entry point that delegates to main.js
2. **src/main.js** - Orchestrates game initialization, sets up event listeners
3. **src/managers/GameObjManager.js** - Manages game objects and player state
4. **src/rendering/Render.js** - Central rendering engine with game loop integration

### Core Game Loop

The game uses a render-driven loop through `Render.drawScreen()`:
- Calculates delta time for frame-rate independent movement
- Updates game state before rendering
- Uses `requestAnimationFrame` for smooth 60fps rendering

### Key Modules

| Module | Purpose |
|--------|---------|
| `src/managers/GameObjManager.js` | Manages game objects, maintains command object for input state |
| `src/rendering/Render.js` | Handles all rendering, offscreen canvas caching, sprite drawing |
| `src/input/APWatcher.js` | Keyboard input processing with boundary checking |
| `src/entities/TankPlayer.js` | Player tank entity with movement and rotation logic |
| `src/animation/SpriteAnimSheet.js` | Frame-based sprite animation system |
| `src/utils/ImageResource.js` | Promise-based image loading |

### Input Processing Pipeline

```
APWatcher (keyboard events)
  -> updates shared cmd object
  -> TankPlayer.rotationAP() processes commands
  -> Render.updateGame() applies movement
```

### Resource Management

- **ImageResource**: Promise-based image loading with error handling
- **Offscreen Caching**: Map tiles pre-rendered to offscreen canvas for performance
- **Sprite Animation**: Frame-based animation system via SpriteAnimSheet

## Project Structure

```
src/
├── animation/          # Sprite animation system
├── entities/          # Game entities (Player, TankPlayer)
├── input/             # Input handling
├── managers/          # Game object management
├── rendering/         # Rendering engine
├── utils/             # Utility functions
├── main.js            # Main orchestration
└── extreem-engine.js  # Webpack entry point
```

## Build System

- **Webpack 5** with Babel transpilation for ES6+ compatibility
- **Jest** with jsdom environment for testing
- Entry point: `src/extreem-engine.js`
- Development server includes hot reload

## Known Limitations and Todo

See `docs/tasks.md` for comprehensive improvement roadmap. Key areas:
- Entity-Component System refactoring (partially complete)
- Tree-based rendering with diff algorithms
- State management system with proper transitions
- TypeScript integration
- Enhanced testing with visual regression

## Architecture Diagrams

The README.md contains detailed Mermaid diagrams showing:
- Class relationships between game components
- Sequence diagram for game initialization and loop
- Activity diagram for game flow
