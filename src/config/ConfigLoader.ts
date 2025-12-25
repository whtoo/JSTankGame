/**
 * ConfigLoader - Loads and caches JSON configuration files
 * Provides centralized access to animation and tile configuration data
 */

import type { AnimationConfig, EntitiesConfig, AnimationDefinition, TileDefinition } from '../types/index.js';

/** Cached configuration data */
interface CachedConfigs {
  animation: AnimationConfig | null;
  entities: EntitiesConfig | null;
}

class ConfigLoader {
  private static instance: ConfigLoader;
  private configs: CachedConfigs;
  private loadPromises: {
    animation: Promise<AnimationConfig> | null;
    entities: Promise<EntitiesConfig> | null;
  };

  private constructor() {
    this.configs = {
      animation: null,
      entities: null
    };
    this.loadPromises = {
      animation: null,
      entities: null
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
   * Caches the result after first load
   */
  async loadAnimationConfig(): Promise<AnimationConfig> {
    if (this.configs.animation) {
      return this.configs.animation;
    }

    if (this.loadPromises.animation) {
      return this.loadPromises.animation;
    }

    this.loadPromises.animation = fetch('/src/entities/anim.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load anim.json: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        this.configs.animation = data;
        return data;
      });

    return this.loadPromises.animation;
  }

  /**
   * Load entities configuration (entities.json)
   * Caches the result after first load
   */
  async loadEntitiesConfig(): Promise<EntitiesConfig> {
    if (this.configs.entities) {
      return this.configs.entities;
    }

    if (this.loadPromises.entities) {
      return this.loadPromises.entities;
    }

    this.loadPromises.entities = fetch('/src/entities/entities.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load entities.json: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        this.configs.entities = data;
        return data;
      });

    return this.loadPromises.entities;
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
