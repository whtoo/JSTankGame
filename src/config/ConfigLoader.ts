/**
 * ConfigLoader - Loads and caches JSON configuration files
 * Provides centralized access to animation and tile configuration data
 */

import type { AnimationConfig, EntitiesConfig, AnimationDefinition, TileDefinition } from '../types/index.js';
import animationConfigJson from '../entities/anim.json' assert { type: 'json' };
import entitiesConfigJson from '../entities/entities.json' assert { type: 'json' };

/** Cached configuration data */
interface CachedConfigs {
  animation: AnimationConfig | null;
  entities: EntitiesConfig | null;
}

class ConfigLoader {
  private static instance: ConfigLoader;
  private configs: CachedConfigs;

  private constructor() {
    this.configs = {
      animation: animationConfigJson as AnimationConfig,
      entities: entitiesConfigJson as EntitiesConfig
    };
  }

  /** Get singleton instance */
  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  /**
   * Load animation configuration (anim.json)
   * Returns pre-loaded config immediately
   */
  async loadAnimationConfig(): Promise<AnimationConfig> {
    return this.configs.animation!;
  }

  /**
   * Load entities configuration (entities.json)
   * Returns pre-loaded config immediately
   */
  async loadEntitiesConfig(): Promise<EntitiesConfig> {
    return this.configs.entities!;
  }

  /**
   * Get animation definition by name
   */
  async getAnimation(animName: string): Promise<AnimationDefinition | null> {
    const config = await this.loadAnimationConfig();
    return config.animations[animName] || null;
  }

  /**
   * Get tile definition by name
   */
  async getTile(tileName: string): Promise<TileDefinition | null> {
    const config = await this.loadEntitiesConfig();

    for (const layer of config.layers) {
      const tile = layer.tiles.find(t => t.name === tileName);
      if (tile) {
        return tile;
      }
    }

    return null;
  }

  /**
   * Get all tiles in a category
   */
  async getTilesByCategory(category: string): Promise<TileDefinition[]> {
    const config = await this.loadEntitiesConfig();
    const layer = config.layers.find(l => l.category === category);
    return layer?.tiles || [];
  }

  /**
   * Get tileset info
   */
  async getTilesetInfo(): Promise<EntitiesConfig['tileset_info']> {
    const config = await this.loadEntitiesConfig();
    return config.tileset_info;
  }

  /**
   * Get all available animation names
   */
  async getAnimationNames(): Promise<string[]> {
    const config = await this.loadAnimationConfig();
    return Object.keys(config.animations);
  }

  /**
   * Get all available categories
   */
  async getCategories(): Promise<string[]> {
    const config = await this.loadEntitiesConfig();
    return config.layers.map(l => l.category);
  }

  /**
   * Check if configs are loaded
   */
  isAnimationConfigLoaded(): boolean {
    return this.configs.animation !== null;
  }

  isEntitiesConfigLoaded(): boolean {
    return this.configs.entities !== null;
  }
}

// Export singleton instance getter
export function getConfigLoader(): ConfigLoader {
  return ConfigLoader.getInstance();
}

// Export class for testing
export { ConfigLoader };
