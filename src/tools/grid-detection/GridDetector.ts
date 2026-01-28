/**
 * GridDetector - Analyzes images to detect grid structures
 * Detects tile boundaries based on color changes and edge detection
 */

import { getPixelColor, rgbDistance } from '../color-matching/ColorUtils';

/**
 * Grid detection result
 */
export interface GridDetectionResult {
  cols: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
  detected: boolean;
  confidence: number;
}

/**
 * Configuration for grid detection
 */
export interface GridDetectionConfig {
  /** Expected tile size (0 for auto-detect) */
  expectedTileSize: number;
  /** Min tile size to consider */
  minTileSize: number;
  /** Max tile size to consider */
  maxTileSize: number;
  /** Color change threshold for edge detection */
  edgeThreshold: number;
  /** Whether to use multiple detection methods */
  useMultipleMethods: boolean;
}

/** Default configuration */
export const DEFAULT_GRID_CONFIG: GridDetectionConfig = {
  expectedTileSize: 0,
  minTileSize: 8,
  maxTileSize: 64,
  edgeThreshold: 30,
  useMultipleMethods: true
};

/**
 * Service for detecting grid structures in images
 */
export class GridDetector {
  private config: GridDetectionConfig;

  constructor(config: Partial<GridDetectionConfig> = {}) {
    this.config = { ...DEFAULT_GRID_CONFIG, ...config };
  }

  /**
   * Detect grid structure from image data
   */
  detectGrid(imageData: ImageData): GridDetectionResult {
    // If expected tile size is provided, use it
    if (this.config.expectedTileSize > 0) {
      return this.detectWithFixedSize(imageData, this.config.expectedTileSize);
    }

    // Otherwise auto-detect
    if (this.config.useMultipleMethods) {
      return this.autoDetectGrid(imageData);
    }

    // Fallback to simple detection
    return this.detectWithEdgeAnalysis(imageData);
  }

  /**
   * Auto-detect grid using multiple methods
   */
  private autoDetectGrid(imageData: ImageData): GridDetectionResult {
    const methods: Array<() => GridDetectionResult> = [
      () => this.detectWithEdgeAnalysis(imageData),
      () => this.detectWithColorChangeAnalysis(imageData),
      () => this.detectWithCommonSizes(imageData)
    ];

    let bestResult: GridDetectionResult = {
      cols: 0,
      rows: 0,
      tileWidth: 0,
      tileHeight: 0,
      detected: false,
      confidence: 0
    };

    for (const method of methods) {
      try {
        const result = method();
        if (result.detected && result.confidence > bestResult.confidence) {
          bestResult = result;
        }
      } catch (e) {
        // Continue to next method
      }
    }

    return bestResult;
  }

  /**
   * Detect grid with a fixed tile size
   */
  private detectWithFixedSize(imageData: ImageData, tileSize: number): GridDetectionResult {
    const { width, height } = imageData;

    if (width % tileSize !== 0 || height % tileSize !== 0) {
      return {
        cols: Math.floor(width / tileSize),
        rows: Math.floor(height / tileSize),
        tileWidth: tileSize,
        tileHeight: tileSize,
        detected: false,
        confidence: 0.5
      };
    }

    return {
      cols: width / tileSize,
      rows: height / tileSize,
      tileWidth: tileSize,
      tileHeight: tileSize,
      detected: true,
      confidence: 0.9
    };
  }

  /**
   * Detect grid using edge analysis
   * Looks for strong vertical and horizontal edges
   */
  private detectWithEdgeAnalysis(imageData: ImageData): GridDetectionResult {
    const { width, height } = imageData;

    // Calculate edge strength for each row and column
    const horizontalEdges = this.findHorizontalEdges(imageData);
    const verticalEdges = this.findVerticalEdges(imageData);

    // Find repeating patterns
    const tileHeight = this.findRepeatingPattern(horizontalEdges, this.config.minTileSize, this.config.maxTileSize);
    const tileWidth = this.findRepeatingPattern(verticalEdges, this.config.minTileSize, this.config.maxTileSize);

    if (tileWidth === 0 || tileHeight === 0) {
      return {
        cols: 0, rows: 0, tileWidth: 0, tileHeight: 0, detected: false, confidence: 0
      };
    }

    return {
      cols: Math.floor(width / tileWidth),
      rows: Math.floor(height / tileHeight),
      tileWidth,
      tileHeight,
      detected: true,
      confidence: this.calculateConfidence(horizontalEdges, verticalEdges, tileWidth, tileHeight)
    };
  }

  /**
   * Detect grid by analyzing color changes
   */
  private detectWithColorChangeAnalysis(imageData: ImageData): GridDetectionResult {
    const { width, height } = imageData;

    // Calculate color variance for each position
    const horizontalVariance = new Array(height).fill(0);
    const verticalVariance = new Array(width).fill(0);

    for (let y = 0; y < height; y++) {
      for (let x = 1; x < width; x++) {
        const color1 = getPixelColor(imageData, x - 1, y);
        const color2 = getPixelColor(imageData, x, y);
        verticalVariance[x] += rgbDistance(color1, color2);
      }
    }

    for (let x = 0; x < width; x++) {
      for (let y = 1; y < height; y++) {
        const color1 = getPixelColor(imageData, x, y - 1);
        const color2 = getPixelColor(imageData, x, y);
        horizontalVariance[y] += rgbDistance(color1, color2);
      }
    }

    // Normalize
    for (let i = 0; i < width; i++) {
      verticalVariance[i] /= height;
    }
    for (let i = 0; i < height; i++) {
      horizontalVariance[i] /= width;
    }

    // Find peaks
    const tileWidth = this.findPeaksPattern(verticalVariance, this.config.minTileSize, this.config.maxTileSize);
    const tileHeight = this.findPeaksPattern(horizontalVariance, this.config.minTileSize, this.config.maxTileSize);

    if (tileWidth === 0 || tileHeight === 0) {
      return {
        cols: 0, rows: 0, tileWidth: 0, tileHeight: 0, detected: false, confidence: 0
      };
    }

    return {
      cols: Math.floor(width / tileWidth),
      rows: Math.floor(height / tileHeight),
      tileWidth,
      tileHeight,
      detected: true,
      confidence: 0.7
    };
  }

  /**
   * Try common tile sizes
   */
  private detectWithCommonSizes(imageData: ImageData): GridDetectionResult {
    const { width, height } = imageData;
    const commonSizes = [16, 20, 24, 32, 40, 48, 64];

    let bestSize = 0;
    let bestScore = 0;

    for (const size of commonSizes) {
      if (width % size === 0 && height % size === 0) {
        const cols = width / size;
        const rows = height / size;

        // Score based on how square the grid is (prefer balanced grids)
        const aspectRatio = Math.min(cols, rows) / Math.max(cols, rows);
        const score = aspectRatio * (20 - Math.abs(20 - cols)) / 20; // Prefer ~20 columns

        if (score > bestScore) {
          bestScore = score;
          bestSize = size;
        }
      }
    }

    if (bestSize === 0) {
      return {
        cols: 0, rows: 0, tileWidth: 0, tileHeight: 0, detected: false, confidence: 0
      };
    }

    return {
      cols: width / bestSize,
      rows: height / bestSize,
      tileWidth: bestSize,
      tileHeight: bestSize,
      detected: true,
      confidence: 0.6
    };
  }

  /**
   * Find horizontal edges
   */
  private findHorizontalEdges(imageData: ImageData): number[] {
    const { width, height } = imageData;
    const edges = new Array(height).fill(0);

    for (let y = 1; y < height; y++) {
      let edgeStrength = 0;
      for (let x = 0; x < width; x++) {
        const color1 = getPixelColor(imageData, x, y - 1);
        const color2 = getPixelColor(imageData, x, y);
        edgeStrength += rgbDistance(color1, color2);
      }
      edges[y] = edgeStrength / width;
    }

    return edges;
  }

  /**
   * Find vertical edges
   */
  private findVerticalEdges(imageData: ImageData): number[] {
    const { width, height } = imageData;
    const edges = new Array(width).fill(0);

    for (let x = 1; x < width; x++) {
      let edgeStrength = 0;
      for (let y = 0; y < height; y++) {
        const color1 = getPixelColor(imageData, x - 1, y);
        const color2 = getPixelColor(imageData, x, y);
        edgeStrength += rgbDistance(color1, color2);
      }
      edges[x] = edgeStrength / height;
    }

    return edges;
  }

  /**
   * Find repeating pattern in edge data
   */
  private findRepeatingPattern(edges: number[], minSize: number, maxSize: number): number {
    const autocorr = this.calculateAutocorrelation(edges);

    // Find peaks in autocorrelation
    let bestPeriod = 0;
    let bestScore = 0;

    for (let period = minSize; period <= maxSize && period < autocorr.length / 2; period++) {
      if (autocorr[period] > bestScore) {
        bestScore = autocorr[period];
        bestPeriod = period;
      }
    }

    return bestPeriod;
  }

  /**
   * Find peaks pattern in variance data
   */
  private findPeaksPattern(variance: number[], minSize: number, maxSize: number): number {
    // Find local maxima
    const peaks: number[] = [];

    for (let i = 1; i < variance.length - 1; i++) {
      if (variance[i] > variance[i - 1] && variance[i] > variance[i + 1]) {
        peaks.push(i);
      }
    }

    if (peaks.length < 2) return 0;

    // Calculate distances between peaks
    const distances: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      const dist = peaks[i] - peaks[i - 1];
      if (dist >= minSize && dist <= maxSize) {
        distances.push(dist);
      }
    }

    if (distances.length === 0) return 0;

    // Find most common distance
    const distanceCounts = new Map<number, number>();
    for (const dist of distances) {
      distanceCounts.set(dist, (distanceCounts.get(dist) || 0) + 1);
    }

    let bestDistance = 0;
    let bestCount = 0;

    for (const [dist, count] of distanceCounts) {
      if (count > bestCount) {
        bestCount = count;
        bestDistance = dist;
      }
    }

    return bestDistance;
  }

  /**
   * Calculate autocorrelation of array
   */
  private calculateAutocorrelation(data: number[]): number[] {
    const n = data.length;
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const autocorr = new Array(n).fill(0);

    for (let lag = 0; lag < n; lag++) {
      let sum = 0;
      let count = 0;

      for (let i = 0; i < n - lag; i++) {
        sum += (data[i] - mean) * (data[i + lag] - mean);
        count++;
      }

      autocorr[lag] = count > 0 ? sum / count : 0;
    }

    // Normalize
    const max = Math.max(...autocorr.slice(1));
    if (max > 0) {
      for (let i = 1; i < autocorr.length; i++) {
        autocorr[i] /= max;
      }
    }

    return autocorr;
  }

  /**
   * Calculate detection confidence
   */
  private calculateConfidence(
    horizontalEdges: number[],
    verticalEdges: number[],
    tileWidth: number,
    tileHeight: number
  ): number {
    // Check how well the detected size aligns with actual edges
    const hAlignment = this.checkAlignment(horizontalEdges, tileHeight);
    const vAlignment = this.checkAlignment(verticalEdges, tileWidth);

    return (hAlignment + vAlignment) / 2;
  }

  /**
   * Check how well a period aligns with edges
   */
  private checkAlignment(edges: number[], period: number): number {
    let alignmentScore = 0;
    const numPeriods = Math.floor(edges.length / period);

    for (let i = 0; i < numPeriods; i++) {
      const pos = i * period;
      if (pos < edges.length) {
        alignmentScore += edges[pos];
      }
    }

    return alignmentScore / numPeriods;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<GridDetectionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): GridDetectionConfig {
    return { ...this.config };
  }
}
