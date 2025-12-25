/**
 * MovementUtils - Shared movement utilities for tanks
 *
 * Extracts common movement logic to reduce code duplication
 * between TankPlayer and EnemyTank.
 */

import type { Direction } from '../types/index.js';

/**
 * Direction to angle conversion constants
 * Used by both player and enemy tanks for rotation
 */
export const DIRECTION_ANGLES: Readonly<Record<Direction, number>> = {
    w: 270,
    a: 180,
    s: 90,
    d: 0,
    up: 270,
    left: 180,
    down: 90,
    right: 0
} as const;

/**
 * Opposite directions for AI decision making
 */
export const OPPOSITE_DIRECTIONS: Readonly<Record<Direction, Direction>> = {
    w: 's',
    s: 'w',
    a: 'd',
    d: 'a',
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left'
} as const;

/**
 * Cardinal directions array
 */
export const CARDINAL_DIRECTIONS: Readonly<Direction[]> = ['w', 'a', 's', 'd'] as const;

/**
 * Convert direction to rotation angle (in degrees)
 * @param direction The direction to convert
 * @returns Rotation angle in degrees (0, 90, 180, 270)
 */
export function directionToAngle(direction: Direction): number {
    return DIRECTION_ANGLES[direction] ?? 0;
}

/**
 * Convert rotation angle to direction
 * @param angle Rotation angle in degrees
 * @returns Direction corresponding to the angle
 */
export function angleToDirection(angle: number): Direction {
    const normalized = ((angle % 360) + 360) % 360;

    if (normalized >= 315 || normalized < 45) return 'd';
    if (normalized >= 45 && normalized < 135) return 's';
    if (normalized >= 135 && normalized < 225) return 'a';
    return 'w';
}

/**
 * Get opposite direction
 * @param direction The input direction
 * @returns The opposite direction
 */
export function getOppositeDirection(direction: Direction): Direction {
    return OPPOSITE_DIRECTIONS[direction] ?? direction;
}

/**
 * Get valid movement directions (excluding opposite)
 * Used for AI decision making to prevent 180° turns
 * @param currentDirection The current direction
 * @returns Array of valid directions
 */
export function getValidTurnDirections(currentDirection: Direction): Direction[] {
    const opposite = getOppositeDirection(currentDirection);
    return CARDINAL_DIRECTIONS.filter(d => d !== opposite);
}

/**
 * Get random direction excluding opposite
 * @param currentDirection The current direction
 * @returns A random valid direction
 */
export function getRandomValidDirection(currentDirection: Direction): Direction {
    const validDirs = getValidTurnDirections(currentDirection);
    return validDirs[Math.floor(Math.random() * validDirs.length)];
}

/**
 * Calculate movement vector from direction and speed
 * @param direction Movement direction
 * @param speed Movement speed
 * @returns Movement vector {x, y}
 */
export function getMovementVector(direction: Direction, speed: number): { x: number; y: number } {
    switch (direction) {
        case 'w':
        case 'up':
            return { x: 0, y: -speed };
        case 's':
        case 'down':
            return { x: 0, y: speed };
        case 'a':
        case 'left':
            return { x: -speed, y: 0 };
        case 'd':
        case 'right':
            return { x: speed, y: 0 };
        default:
            return { x: 0, y: 0 };
    }
}

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get direction from one point to another
 * @param fromX Start X
 * @param fromY Start Y
 * @param toX Target X
 * @param toY Target Y
 * @returns Primary direction toward target
 */
export function getDirectionToward(fromX: number, fromY: number, toX: number, toY: number): Direction {
    const dx = toX - fromX;
    const dy = toY - fromY;

    if (Math.abs(dy) > Math.abs(dx)) {
        return dy < 0 ? 'w' : 's';
    } else {
        return dx < 0 ? 'a' : 'd';
    }
}

/**
 * Check if two directions are perpendicular
 */
export function areDirectionsPerpendicular(dir1: Direction, dir2: Direction): boolean {
    const perpendicularSets: Set<Direction>[] = [
        new Set(['w', 's']),
        new Set(['a', 'd'])
    ];
    return perpendicularSets.some(set => set.has(dir1) && set.has(dir2));
}

/**
 * Normalize angle to 0-360 range
 */
export function normalizeAngle(angle: number): number {
    return ((angle % 360) + 360) % 360;
}

/**
 * Interpolate angle for smooth rotation
 */
export function lerpAngle(current: number, target: number, factor: number): number {
    const diff = ((target - current + 180) % 360) - 180;
    return normalizeAngle(current + diff * factor);
}
