export interface SubjectColorPreset {
  name: string;
  hex: string;
  border: string;
}

export interface CardContrastTheme {
  bgHex: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  chipBg: string;
  isLightBg: boolean;
  contrastRatio: number;
  wcagLevel: 'AAA' | 'AA' | 'Large Only';
}

export const SUBJECT_COLOR_PRESETS: SubjectColorPreset[] = [
  { name: 'Rose Pink', hex: '#FFD5DC', border: '#FDA4AF' },
  { name: 'Sky Blue', hex: '#D4E5FF', border: '#93C5FD' },
  { name: 'Mint Green', hex: '#D5F2DB', border: '#86EFAC' },
  { name: 'Soft Purple', hex: '#E9D5FF', border: '#D8B4FE' },
  { name: 'Warm Amber', hex: '#FEF08A', border: '#FDE047' },
  { name: 'Aqua Teal', hex: '#CCFBF1', border: '#5EEAD4' },
  { name: 'Peach Coral', hex: '#FED7AA', border: '#FDBA74' },
  { name: 'Lavender Mist', hex: '#E0E7FF', border: '#A5B4FC' },
  { name: 'Deep Forest', hex: '#00400C', border: '#166534' },
  { name: 'UniKL Royal', hex: '#1E3A8A', border: '#3B82F6' },
];

const DARK_TEXT_HEX = '#0F172A';
const WHITE_TEXT_HEX = '#FFFFFF';
const FALLBACK_BG_HEX = '#D4E5FF';

/**
 * Normalizes 3-char or 6-char hex strings (with or without leading '#') into uppercase `#RRGGBB`.
 * Returns null if input is invalid.
 */
export function normalizeHex(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const cleaned = input.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(cleaned)) {
    const expanded = cleaned
      .split('')
      .map((ch) => ch + ch)
      .join('');
    return `#${expanded.toUpperCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return `#${cleaned.toUpperCase()}`;
  }
  return null;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const norm = normalizeHex(hex);
  if (!norm) return null;
  const intVal = parseInt(norm.slice(1), 16);
  return {
    r: (intVal >> 16) & 255,
    g: (intVal >> 8) & 255,
    b: intVal & 255,
  };
}

/**
 * Converts hex color to HSB/HSV (h: 0-360, s: 0-100, b: 0-100).
 */
export function hexToHsb(hex: string): { h: number; s: number; b: number } {
  const rgb = hexToRgb(hex) || { r: 212, g: 229, b: 255 };
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
      h = 60 * ((b - r) / delta + 2);
    } else {
      h = 60 * ((r - g) / delta + 4);
    }
  }
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;

  return {
    h: Math.round(h),
    s: Math.round(s),
    b: Math.round(v),
  };
}

/**
 * Converts HSB/HSV (h: 0-360, s: 0-100, b: 0-100) into `#RRGGBB`.
 */
export function hsbToHex(h: number, s: number, b: number): string {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.max(0, Math.min(100, s)) / 100;
  const val = Math.max(0, Math.min(100, b)) / 100;

  const c = val * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = val - c;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (hue < 60) {
    rPrime = c;
    gPrime = x;
  } else if (hue < 120) {
    rPrime = x;
    gPrime = c;
  } else if (hue < 180) {
    gPrime = c;
    bPrime = x;
  } else if (hue < 240) {
    gPrime = x;
    bPrime = c;
  } else if (hue < 300) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();

  return `#${toHex(rPrime)}${toHex(gPrime)}${toHex(bPrime)}`;
}

function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const channel = (val: number) => {
    const srgb = val / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

/**
 * Returns WCAG 2.1 contrast ratio between two hex colors (1.00 - 21.00).
 */
export function getContrastRatio(hexA: string, hexB: string): number {
  const rgbA = hexToRgb(hexA) || { r: 255, g: 255, b: 255 };
  const rgbB = hexToRgb(hexB) || { r: 15, g: 23, b: 42 };
  const lumA = getRelativeLuminance(rgbA);
  const lumB = getRelativeLuminance(rgbB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * Computes WCAG-compliant foreground, muted text, borders, and badge backgrounds
 * so timetable cards remain readable on any custom or preset background color.
 */
export function getCardContrastTheme(bgHex: string): CardContrastTheme {
  const safeHex = normalizeHex(bgHex) || FALLBACK_BG_HEX;
  const darkContrast = getContrastRatio(safeHex, DARK_TEXT_HEX);
  const whiteContrast = getContrastRatio(safeHex, WHITE_TEXT_HEX);

  const isLightBg = darkContrast >= whiteContrast;
  const contrastRatio = isLightBg ? darkContrast : whiteContrast;
  const wcagLevel: 'AAA' | 'AA' | 'Large Only' =
    contrastRatio >= 7 ? 'AAA' : contrastRatio >= 4.5 ? 'AA' : 'Large Only';

  return {
    bgHex: safeHex,
    textColor: isLightBg ? DARK_TEXT_HEX : WHITE_TEXT_HEX,
    mutedColor: isLightBg ? '#334155' : 'rgba(255, 255, 255, 0.86)',
    borderColor: isLightBg ? 'rgba(15, 23, 42, 0.14)' : 'rgba(255, 255, 255, 0.22)',
    chipBg: isLightBg ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.18)',
    isLightBg,
    contrastRatio,
    wcagLevel,
  };
}
