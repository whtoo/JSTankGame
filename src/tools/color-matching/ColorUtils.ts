/**
 * Color utility functions for image-to-tilemap conversion
 * Handles hex to RGB conversion, color distance calculations, and color normalization
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

/**
 * Convert hex color string to RGB object
 * Supports: #RGB, #RRGGBB, #RRGGBBAA formats
 */
export function hexToRgb(hex: string): RGB {
  // Remove # prefix
  hex = hex.replace(/^#/, '');

  // Handle shorthand (#RGB -> #RRGGBB)
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }

  // Parse hex values
  const bigint = parseInt(hex, 16);
  
  if (hex.length === 8) {
    // RGBA format - ignore alpha for matching
    return {
      r: (bigint >> 24) & 255,
      g: (bigint >> 16) & 255,
      b: (bigint >> 8) & 255
    };
  }

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

/**
 * Convert RGB object to hex string
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number): string => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Calculate Euclidean distance between two RGB colors
 * Result is normalized to 0-441.67 range (max distance in RGB space)
 */
export function rgbDistance(color1: RGB, color2: RGB): number {
  const dr = color1.r - color2.r;
  const dg = color1.g - color2.g;
  const db = color1.b - color2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Calculate weighted Euclidean distance (human perception weighted)
 * Weights: R=0.3, G=0.59, B=0.11 (luminance-based)
 */
export function weightedRgbDistance(color1: RGB, color2: RGB): number {
  const dr = (color1.r - color2.r) * 0.3;
  const dg = (color1.g - color2.g) * 0.59;
  const db = (color1.b - color2.b) * 0.11;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Calculate Delta E (CIE76) color difference in Lab color space
 * More perceptually uniform than RGB distance
 */
export function deltaE(rgb1: RGB, rgb2: RGB): number {
  const lab1 = rgbToLab(rgb1);
  const lab2 = rgbToLab(rgb2);
  
  return Math.sqrt(
    Math.pow(lab1.l - lab2.l, 2) +
    Math.pow(lab1.a - lab2.a, 2) +
    Math.pow(lab1.b - lab2.b, 2)
  );
}

/**
 * Convert RGB to Lab color space
 */
export function rgbToLab(rgb: RGB): { l: number; a: number; b: number } {
  // RGB to XYZ
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  r *= 100;
  g *= 100;
  b *= 100;

  const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = r * 0.0193 + g * 0.1192 + b * 0.9505;

  // XYZ to Lab
  const xRef = 95.047;
  const yRef = 100.000;
  const zRef = 108.883;

  const fx = pivotXyz(x / xRef);
  const fy = pivotXyz(y / yRef);
  const fz = pivotXyz(z / zRef);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  };
}

function pivotXyz(t: number): number {
  return t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116;
}

/**
 * Extract RGB values from ImageData at specific coordinates
 */
export function getPixelColor(imageData: ImageData, x: number, y: number): RGB {
  const index = (y * imageData.width + x) * 4;
  return {
    r: imageData.data[index],
    g: imageData.data[index + 1],
    b: imageData.data[index + 2]
  };
}

/**
 * Get RGBA values including alpha channel
 */
export function getPixelColorWithAlpha(imageData: ImageData, x: number, y: number): RGBA {
  const index = (y * imageData.width + x) * 4;
  return {
    r: imageData.data[index],
    g: imageData.data[index + 1],
    b: imageData.data[index + 2],
    a: imageData.data[index + 3]
  };
}

/**
 * Calculate average color from multiple sample points
 */
export function averageColors(colors: RGB[]): RGB {
  if (colors.length === 0) {
    return { r: 0, g: 0, b: 0 };
  }

  const sum = colors.reduce(
    (acc, color) => ({
      r: acc.r + color.r,
      g: acc.g + color.g,
      b: acc.b + color.b
    }),
    { r: 0, g: 0, b: 0 }
  );

  return {
    r: Math.round(sum.r / colors.length),
    g: Math.round(sum.g / colors.length),
    b: Math.round(sum.b / colors.length)
  };
}

/**
 * Normalize color to reduce noise
 * Rounds values to nearest multiple of factor (e.g., 16 for 16-color reduction)
 */
export function normalizeColor(color: RGB, factor: number = 1): RGB {
  if (factor <= 1) return color;
  
  const normalize = (value: number): number => {
    return Math.round(value / factor) * factor;
  };

  return {
    r: normalize(color.r),
    g: normalize(color.g),
    b: normalize(color.b)
  };
}

/**
 * Check if color is essentially black/empty (for transparency detection)
 */
export function isEmptyColor(color: RGB, threshold: number = 30): boolean {
  return color.r < threshold && color.g < threshold && color.b < threshold;
}

/**
 * Check if alpha channel indicates transparency
 */
export function isTransparent(rgba: RGBA, threshold: number = 128): boolean {
  return rgba.a < threshold;
}

/**
 * Predefined color palette for common tile types
 */
export const DEFAULT_COLOR_PALETTE: Record<string, RGB> = {
  // Terrain
  'grass': { r: 60, g: 200, b: 60 },      // #3CC83C
  'water': { r: 0, g: 100, b: 200 },      // #0064C8
  'dirt': { r: 139, g: 90, b: 43 },       // #8B5A2B
  'sand': { r: 238, g: 214, b: 175 },     // #EED6AF
  
  // Walls/Obstacles
  'brick': { r: 180, g: 40, b: 40 },      // #B42828
  'concrete': { r: 220, g: 220, b: 220 }, // #DCDCDC
  'stone': { r: 128, g: 128, b: 128 },    // #808080
  
  // Objects
  'player': { r: 255, g: 220, b: 0 },     // #FFDC00 - Yellow
  'enemy': { r: 200, g: 50, b: 50 },      // #C83232 - Red
  'base': { r: 0, g: 150, b: 255 },       // #0096FF - Blue
  
  // Special
  'empty': { r: 0, g: 0, b: 0 },          // #000000
  'unknown': { r: 255, g: 0, b: 255 }     // #FF00FF - Magenta for debugging
};

/**
 * Get color name from RGB if it matches a palette color within tolerance
 */
export function getColorName(color: RGB, tolerance: number = 50): string | null {
  for (const [name, paletteColor] of Object.entries(DEFAULT_COLOR_PALETTE)) {
    if (rgbDistance(color, paletteColor) <= tolerance) {
      return name;
    }
  }
  return null;
}
