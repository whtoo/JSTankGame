/**
 * AnimManager - High-level animation management
 * Provides convenient API for creating animations from JSON config
 */

import { AnimSheetFactory, DirectionalAnimSheet } from './SpriteAnimSheet.js';
import { getConfigLoader } from '../config/ConfigLoader.js';
import type { ISpriteAnimSheet, Direction } from '../types/index.js';

/**
 * Cached animation sheets
 */
interface AnimationCache {
  [key: string]: ISpriteAnimSheet;
}

class AnimManager {
  private static instance: AnimManager;
  private cache: AnimationCache;

  private constructor() {
    this.cache = {};
  }

  static getInstance(): AnimManager {
    if (!AnimManager.instance) {
      AnimManager.instance = new AnimManager();
    }
    return AnimManager.instance;
  }

  /**
   * Load animation by name from JSON config
   * @param animName - Animation key from anim.json (e.g., 'player_green_lvl1')
   * @param initialDirection - Starting direction
   * @returns DirectionalAnimSheet or null if not found
   */
  async loadAnimation(
    animName: string,
    initialDirection: Direction = 'up'
  ): Promise<DirectionalAnimSheet | null> {
    // Check cache first
    const cacheKey = `${animName}_${initialDirection}`;
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey] as DirectionalAnimSheet;
    }

    // Load from config
    const animDef = await getConfigLoader().getAnimation(animName);
    if (!animDef) {
      console.warn(`Animation not found: ${animName}`);
      return null;
    }

    // Create animation sheet from sequences
    const animSheet = AnimSheetFactory.fromSequences(
      animDef.sequences,
      initialDirection
    );

    // Cache it
    this.cache[cacheKey] = animSheet;

    return animSheet;
  }

  /**
   * Preload multiple animations
   * Useful for loading all enemy/player animations at startup
   */
  async preloadAnimations(animNames: string[]): Promise<void> {
    await Promise.all(
      animNames.map(name => this.loadAnimation(name, 'up'))
    );
  }

  /**
   * Clear the animation cache
   */
  clearCache(): void {
    this.cache = {};
  }

  /**
   * Get all available animation names
   */
  getAvailableAnimations(): Promise<string[]> {
    return getConfigLoader().getAnimationNames();
  }
}

// Export singleton getter
export function getAnimManager(): AnimManager {
  return AnimManager.getInstance();
}

// Export class for testing
export { AnimManager };
