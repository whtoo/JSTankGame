/**
 * TileRegistry - Maps tile IDs to tile names from entities.json
 * Bridges the gap between numeric tile IDs in map data and named tiles in JSON config
 */

import type { TileDefinition } from '../types/index.js';
import { getConfigLoader } from '../config/ConfigLoader.js';

/**
 * Registry entry for a tile
 */
interface TileRegistryEntry {
    id: number;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    category: string;
}

/**
 * TileRegistry - Maps numeric tile IDs to tile definitions
 * Supports both legacy grid-based tiles and arbitrary positioned tiles
 */
export class TileRegistry {
    private static instance: TileRegistry;
    private idToName: Map<number, string>;
    private nameToEntry: Map<string, TileRegistryEntry>;
    private initialized: boolean;

    private constructor() {
        this.idToName = new Map();
        this.nameToEntry = new Map();
        this.initialized = false;
    }

    static getInstance(): TileRegistry {
        if (!TileRegistry.instance) {
            TileRegistry.instance = new TileRegistry();
        }
        return TileRegistry.instance;
    }

    /**
     * Initialize the registry by loading entities.json
     * Maps each tile to a sequential ID starting from 1
     * (matches TMX 1-based indexing convention)
     */
    async init(): Promise<void> {
        if (this.initialized) return;

        const config = await getConfigLoader().loadEntitiesConfig();
        let currentId = 1;

        for (const layer of config.layers) {
            for (const tile of layer.tiles) {
                // Map sequential ID to tile name
                this.idToName.set(currentId, tile.name);

                // Store full entry data
                this.nameToEntry.set(tile.name, {
                    id: currentId,
                    name: tile.name,
                    x: tile.x,
                    y: tile.y,
                    width: tile.width,
                    height: tile.height,
                    category: layer.category
                });

                currentId++;
            }
        }

        this.initialized = true;
        console.log(`TileRegistry initialized with ${currentId - 1} tiles`);
    }

    /**
     * Get tile name by ID
     */
    getTileName(id: number): string | null {
        return this.idToName.get(id) || null;
    }

    /**
     * Get tile entry by ID
     */
    getTileEntry(id: number): TileRegistryEntry | null {
        const name = this.getTileName(id);
        if (!name) return null;
        return this.nameToEntry.get(name) || null;
    }

    /**
     * Get tile entry by name
     */
    getTileEntryByName(name: string): TileRegistryEntry | null {
        return this.nameToEntry.get(name) || null;
    }

    /**
     * Get source rectangle for a tile by ID
     * Returns { x, y, w, h } for drawImage
     */
    getTileRect(id: number): { x: number; y: number; w: number; h: number } | null {
        const entry = this.getTileEntry(id);
        if (!entry) return null;

        return {
            x: entry.x,
            y: entry.y,
            w: entry.width,
            h: entry.height
        };
    }

    /**
     * Check if a tile ID exists
     */
    hasTile(id: number): boolean {
        return this.idToName.has(id);
    }

    /**
     * Get all tile IDs in a category
     */
    getTilesInCategory(category: string): number[] {
        const result: number[] = [];
        for (const [id, name] of this.idToName) {
            const entry = this.nameToEntry.get(name);
            if (entry && entry.category === category) {
                result.push(id);
            }
        }
        return result.sort((a, b) => a - b);
    }

    /**
     * Get category for a tile ID
     */
    getTileCategory(id: number): string | null {
        const entry = this.getTileEntry(id);
        return entry?.category || null;
    }

    /**
     * Check if registry is initialized
     */
    isReady(): boolean {
        return this.initialized;
    }

    /**
     * Clear the registry (useful for testing)
     */
    clear(): void {
        this.idToName.clear();
        this.nameToEntry.clear();
        this.initialized = false;
    }
}

/**
 * Get global tile registry instance
 */
export function getTileRegistry(): TileRegistry {
    return TileRegistry.getInstance();
}

/**
 * Initialize the global tile registry
 */
export async function initTileRegistry(): Promise<void> {
    const registry = getTileRegistry();
    await registry.init();
}
