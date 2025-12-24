/**
 * Tests for MapConfig module
 */
import { mapData, MAP_CONFIG, getMapData, getMapConfig } from './MapConfig.js';

describe('MapConfig', () => {
    describe('mapData', () => {
        it('should be a 2D array', () => {
            expect(Array.isArray(mapData)).toBe(true);
            expect(mapData.length).toBeGreaterThan(0);
            mapData.forEach(row => {
                expect(Array.isArray(row)).toBe(true);
            });
        });

        it('should have consistent row lengths', () => {
            const firstRowLength = mapData[0].length;
            mapData.forEach(row => {
                expect(row.length).toBe(firstRowLength);
            });
        });

        it('should have correct number of rows and cols', () => {
            expect(mapData.length).toBe(13); // rows
            expect(mapData[0].length).toBe(23); // cols
        });
    });

    describe('MAP_CONFIG', () => {
        it('should have correct dimensions', () => {
            expect(MAP_CONFIG.cols).toBe(23);
            expect(MAP_CONFIG.rows).toBe(13);
        });

        it('should have correct tile sizes', () => {
            expect(MAP_CONFIG.tileRenderSize).toBe(33);
            expect(MAP_CONFIG.tileSourceSize).toBe(32);
        });

        it('should calculate width correctly', () => {
            expect(MAP_CONFIG.width).toBe(23 * 33);
        });

        it('should calculate height correctly', () => {
            expect(MAP_CONFIG.height).toBe(13 * 33);
        });

        it('should have player bounds', () => {
            expect(MAP_CONFIG.playerBounds.minX).toBe(0);
            expect(MAP_CONFIG.playerBounds.maxX).toBe(23);
            expect(MAP_CONFIG.playerBounds.minY).toBe(0);
            expect(MAP_CONFIG.playerBounds.maxY).toBe(13);
        });
    });

    describe('getMapData', () => {
        it('should return the mapData array', () => {
            const result = getMapData();
            expect(result).toBe(mapData);
        });
    });

    describe('getMapConfig', () => {
        it('should return the MAP_CONFIG object', () => {
            const result = getMapConfig();
            expect(result).toBe(MAP_CONFIG);
        });
    });
});
