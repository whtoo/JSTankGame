/**
 * ObjectPool - Generic object pooling for performance optimization
 *
 * Reduces garbage collection pressure by reusing objects instead of
 * constantly creating and destroying them. Ideal for bullets, enemies,
 * particles, and other frequently instantiated entities.
 */

export interface Poolable {
    active: boolean;
    reset(...args: unknown[]): void;
}

export class ObjectPool<T extends Poolable> {
    private pool: T[] = [];
    private factory: () => T;
    private initialSize: number;
    private maxPoolSize: number;
    private currentSize: number = 0;

    /**
     * Create a new ObjectPool
     * @param factory Function that creates new instances
     * @param initialSize Number of objects to pre-allocate
     * @param maxPoolSize Maximum number of pooled objects (0 = unlimited)
     */
    constructor(factory: () => T, initialSize: number = 10, maxPoolSize: number = 100) {
        this.factory = factory;
        this.initialSize = initialSize;
        this.maxPoolSize = maxPoolSize;
        this._preallocate();
    }

    /**
     * Pre-allocate objects for immediate use
     */
    private _preallocate(): void {
        for (let i = 0; i < this.initialSize; i++) {
            const obj = this.factory();
            obj.active = false;
            this.pool.push(obj);
        }
        this.currentSize = this.pool.length;
    }

    /**
     * Acquire an object from the pool
     * @param args Arguments to pass to the object's reset method
     * @returns An active object from the pool
     */
    acquire(...args: unknown[]): T {
        // Try to find an inactive object in the pool
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].active) {
                this.pool[i].active = true;
                this.pool[i].reset(...args);
                return this.pool[i];
            }
        }

        // No inactive objects found, create new one if under max size
        if (this.maxPoolSize === 0 || this.currentSize < this.maxPoolSize) {
            const obj = this.factory();
            obj.active = true;
            obj.reset(...args);
            this.pool.push(obj);
            this.currentSize++;
            return obj;
        }

        // Pool exhausted, recycle oldest inactive object
        const oldestInactive = this.pool.find(o => !o.active);
        if (oldestInactive) {
            oldestInactive.active = true;
            oldestInactive.reset(...args);
            return oldestInactive;
        }

        // Should not happen under normal circumstances
        throw new Error('ObjectPool exhausted and no recyclable objects available');
    }

    /**
     * Release an object back to the pool
     * @param obj The object to release
     */
    release(obj: T): void {
        if (obj && obj.active) {
            obj.active = false;
        }
    }

    /**
     * Get all active objects from the pool
     */
    getActiveObjects(): T[] {
        return this.pool.filter(obj => obj.active);
    }

    /**
     * Get count of active objects
     */
    getActiveCount(): number {
        return this.pool.filter(obj => obj.active).length;
    }

    /**
     * Get total pool size (active + inactive)
     */
    getTotalSize(): number {
        return this.pool.length;
    }

    /**
     * Clear the pool, releasing all objects
     */
    clear(): void {
        for (const obj of this.pool) {
            obj.active = false;
        }
    }

    /**
     * Shrink pool to minimum size (for memory management)
     */
    shrink(): void {
        const activeObjects = this.pool.filter(obj => obj.active);
        const inactiveObjects = this.pool.filter(obj => !obj.active);

        // Keep only initialSize of inactive objects
        const excessInactive = inactiveObjects.slice(this.initialSize);
        this.pool = [...activeObjects, ...inactiveObjects.slice(0, this.initialSize)];
        this.currentSize = this.pool.length;
    }

    /**
     * Get pool statistics for debugging
     */
    getStats() {
        const activeCount = this.getActiveCount();
        return {
            active: activeCount,
            inactive: this.pool.length - activeCount,
            total: this.pool.length,
            utilization: activeCount / this.pool.length
        };
    }
}

/**
 * BulletPool - Specialized pool for Bullet objects
 */
import { Bullet } from '../entities/Bullet.js';
import type { Direction } from '../types/index.js';

class PooledBullet extends Bullet implements Poolable {
    reset(
        x: number,
        y: number,
        direction: Direction,
        owner: 'player' | 'enemy',
        powerLevel: number = 0
    ): void {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.owner = owner;
        this.powerLevel = Math.min(3, Math.max(0, powerLevel));
        this.size = 8 + (this.powerLevel * 2);
        this.width = this.size;
        this.height = this.size;
        this.active = true;
        this.speed = 12;
    }
}

export class BulletPool extends ObjectPool<PooledBullet> {
    constructor(initialSize: number = 20, maxPoolSize: number = 100) {
        super(
            () => new PooledBullet(0, 0, 'w', 'player', 0),
            initialSize,
            maxPoolSize
        );
    }

    /**
     * Convenience method to acquire a bullet with typed parameters
     */
    acquireBullet(
        x: number,
        y: number,
        direction: Direction,
        owner: 'player' | 'enemy',
        powerLevel: number = 0
    ): Bullet {
        return this.acquire(x, y, direction, owner, powerLevel);
    }
}
