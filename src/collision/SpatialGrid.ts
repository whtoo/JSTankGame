/**
 * SpatialGrid - Spatial partitioning for efficient collision detection
 *
 * Divides the game world into a grid of cells, allowing for O(1) lookup
 * of objects in a given area instead of O(n) checks against all objects.
 * This significantly improves performance when many objects exist.
 */

import type { Position, Size } from '../types/index.js';

export interface SpatialEntity {
    id: string | number;
    x: number;
    y: number;
    width: number;
    height: number;
    active?: boolean;
}

export interface SpatialQueryResult<T extends SpatialEntity> {
    entities: T[];
    cellBounds: { minX: number; maxX: number; minY: number; maxY: number };
}

export class SpatialGrid<T extends SpatialEntity> {
    private grid: Map<string, T[]> = new Map();
    private cellSize: number;
    private bounds: { width: number; height: number };
    private entityToCells: Map<string | number, Set<string>> = new Map();

    /**
     * Create a new SpatialGrid
     * @param cellSize Size of each grid cell (should be > largest entity)
     * @param worldWidth Total world width
     * @param worldHeight Total world height
     */
    constructor(cellSize: number = 64, worldWidth: number = 800, worldHeight: number = 600) {
        this.cellSize = cellSize;
        this.bounds = { width: worldWidth, height: worldHeight };
    }

    /**
     * Generate cell key for a given grid position
     */
    private _getCellKey(cellX: number, cellY: number): string {
        return `${cellX},${cellY}`;
    }

    /**
     * Get cell coordinates for a position
     */
    private _getCellCoords(x: number, y: number): { cellX: number; cellY: number } {
        return {
            cellX: Math.floor(x / this.cellSize),
            cellY: Math.floor(y / this.cellSize)
        };
    }

    /**
     * Get all cells that an entity occupies
     */
    private _getCellsForEntity(entity: T): string[] {
        const cells: string[] = [];
        const startX = Math.floor(entity.x / this.cellSize);
        const endX = Math.floor((entity.x + entity.width) / this.cellSize);
        const startY = Math.floor(entity.y / this.cellSize);
        const endY = Math.floor((entity.y + entity.height) / this.cellSize);

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                cells.push(this._getCellKey(x, y));
            }
        }
        return cells;
    }

    /**
     * Insert an entity into the spatial grid
     */
    insert(entity: T): void {
        if (entity.active === false) return;

        const cells = this._getCellsForEntity(entity);
        this.entityToCells.set(entity.id, new Set(cells));

        for (const cellKey of cells) {
            if (!this.grid.has(cellKey)) {
                this.grid.set(cellKey, []);
            }
            this.grid.get(cellKey)!.push(entity);
        }
    }

    /**
     * Update an entity's position in the grid
     * Call this when an entity moves
     */
    update(entity: T): void {
        this.remove(entity);
        this.insert(entity);
    }

    /**
     * Remove an entity from the grid
     */
    remove(entity: T): void {
        const cells = this.entityToCells.get(entity.id);
        if (!cells) return;

        for (const cellKey of cells) {
            const cellEntities = this.grid.get(cellKey);
            if (cellEntities) {
                const index = cellEntities.findIndex(e => e.id === entity.id);
                if (index !== -1) {
                    cellEntities.splice(index, 1);
                }
                // Remove empty cells
                if (cellEntities.length === 0) {
                    this.grid.delete(cellKey);
                }
            }
        }
        this.entityToCells.delete(entity.id);
    }

    /**
     * Query all entities in cells intersecting a rectangle
     * @param x Query rectangle x
     * @param y Query rectangle y
     * @param width Query rectangle width
     * @param height Query rectangle height
     * @returns All entities in the intersecting cells
     */
    query(x: number, y: number, width: number, height: number): T[] {
        const result = new Set<T>();
        const startX = Math.floor(x / this.cellSize);
        const endX = Math.floor((x + width) / this.cellSize);
        const startY = Math.floor(y / this.cellSize);
        const endY = Math.floor((y + height) / this.cellSize);

        for (let cellY = startY; cellY <= endY; cellY++) {
            for (let cellX = startX; cellX <= endX; cellX++) {
                const cellKey = this._getCellKey(cellX, cellY);
                const cellEntities = this.grid.get(cellKey);
                if (cellEntities) {
                    for (const entity of cellEntities) {
                        if (entity.active !== false) {
                            result.add(entity);
                        }
                    }
                }
            }
        }
        return Array.from(result);
    }

    /**
     * Query entities near a point with radius
     */
    queryNear(x: number, y: number, radius: number): T[] {
        return this.query(x - radius, y - radius, radius * 2, radius * 2);
    }

    /**
     * Get potential collisions for an entity using its bounds
     */
    getPotentialCollisions(entity: T): T[] {
        const candidates = this.query(entity.x, entity.y, entity.width, entity.height);
        return candidates.filter(e => e.id !== entity.id && (e.active !== false));
    }

    /**
     * Find entities within a circle
     */
    queryCircle(centerX: number, centerY: number, radius: number): T[] {
        const candidates = this.query(
            centerX - radius,
            centerY - radius,
            radius * 2,
            radius * 2
        );

        const result: T[] = [];
        for (const entity of candidates) {
            const dx = (entity.x + entity.width / 2) - centerX;
            const dy = (entity.y + entity.height / 2) - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= radius + Math.max(entity.width, entity.height) / 2) {
                result.push(entity);
            }
        }
        return result;
    }

    /**
     * Get all active entities in the grid
     */
    getAllEntities(): T[] {
        const allEntities = new Set<T>();
        for (const cellEntities of this.grid.values()) {
            for (const entity of cellEntities) {
                if (entity.active !== false) {
                    allEntities.add(entity);
                }
            }
        }
        return Array.from(allEntities);
    }

    /**
     * Clear all entities from the grid
     */
    clear(): void {
        this.grid.clear();
        this.entityToCells.clear();
    }

    /**
     * Update world bounds
     */
    setBounds(width: number, height: number): void {
        this.bounds = { width, height };
    }

    /**
     * Get grid statistics for debugging
     */
    getStats() {
        let totalEntities = 0;
        let maxCellSize = 0;
        let activeCells = 0;

        for (const [_, entities] of this.grid) {
            totalEntities += entities.length;
            maxCellSize = Math.max(maxCellSize, entities.length);
            activeCells++;
        }

        return {
            totalCells: activeCells,
            totalEntities,
            uniqueEntities: this.entityToCells.size,
            maxEntitiesPerCell: maxCellSize,
            avgEntitiesPerCell: activeCells > 0 ? totalEntities / activeCells : 0
        };
    }
}

/**
 * QuadTree - Alternative spatial partitioning for very large worlds
 * More complex than grid but better for sparse distributions
 */
export class QuadTreeNode<T extends SpatialEntity> {
    entities: T[] = [];
    children: QuadTreeNode<T>[] = [];
    bounds: { x: number; y: number; width: number; height: number };
    capacity: number;
    divided: boolean = false;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        capacity: number = 4
    ) {
        this.bounds = { x, y, width, height };
        this.capacity = capacity;
    }

    insert(entity: T): boolean {
        if (!this._contains(entity)) {
            return false;
        }

        if (this.entities.length < this.capacity) {
            this.entities.push(entity);
            return true;
        }

        if (!this.divided) {
            this._subdivide();
        }

        return (
            this.children[0].insert(entity) ||
            this.children[1].insert(entity) ||
            this.children[2].insert(entity) ||
            this.children[3].insert(entity)
        );
    }

    private _contains(entity: T): boolean {
        return (
            entity.x >= this.bounds.x &&
            entity.x < this.bounds.x + this.bounds.width &&
            entity.y >= this.bounds.y &&
            entity.y < this.bounds.y + this.bounds.height
        );
    }

    private _subdivide(): void {
        const { x, y, width, height } = this.bounds;
        const halfW = width / 2;
        const halfH = height / 2;

        this.children = [
            new QuadTreeNode<T>(x, y, halfW, halfH, this.capacity),
            new QuadTreeNode<T>(x + halfW, y, halfW, halfH, this.capacity),
            new QuadTreeNode<T>(x, y + halfH, halfW, halfH, this.capacity),
            new QuadTreeNode<T>(x + halfW, y + halfH, halfW, halfH, this.capacity)
        ];
        this.divided = true;

        // Re-insert existing entities into children
        for (const entity of this.entities) {
            for (const child of this.children) {
                child.insert(entity);
            }
        }
        this.entities = [];
    }

    query(range: { x: number; y: number; width: number; height: number }): T[] {
        const found: T[] = [];

        if (!this._intersects(range)) {
            return found;
        }

        for (const entity of this.entities) {
            if (this._inRange(entity, range)) {
                found.push(entity);
            }
        }

        if (this.divided) {
            for (const child of this.children) {
                found.push(...child.query(range));
            }
        }

        return found;
    }

    private _intersects(range: { x: number; y: number; width: number; height: number }): boolean {
        return !(
            range.x > this.bounds.x + this.bounds.width ||
            range.x + range.width < this.bounds.x ||
            range.y > this.bounds.y + this.bounds.height ||
            range.y + range.height < this.bounds.y
        );
    }

    private _inRange(entity: T, range: { x: number; y: number; width: number; height: number }): boolean {
        return (
            entity.x >= range.x &&
            entity.x < range.x + range.width &&
            entity.y >= range.y &&
            entity.y < range.y + range.height
        );
    }

    clear(): void {
        this.entities = [];
        this.children = [];
        this.divided = false;
    }
}

export class QuadTree<T extends SpatialEntity> {
    root: QuadTreeNode<T>;
    bounds: { x: number; y: number; width: number; height: number };

    constructor(
        width: number,
        height: number,
        x: number = 0,
        y: number = 0,
        capacity: number = 4
    ) {
        this.bounds = { x, y, width, height };
        this.root = new QuadTreeNode<T>(x, y, width, height, capacity);
    }

    insert(entity: T): boolean {
        return this.root.insert(entity);
    }

    query(x: number, y: number, width: number, height: number): T[] {
        return this.root.query({ x, y, width, height });
    }

    queryNear(x: number, y: number, radius: number): T[] {
        return this.query(x - radius, y - radius, radius * 2, radius * 2);
    }

    clear(): void {
        this.root = new QuadTreeNode<T>(
            this.bounds.x,
            this.bounds.y,
            this.bounds.width,
            this.bounds.height,
            this.root.capacity
        );
    }
}
