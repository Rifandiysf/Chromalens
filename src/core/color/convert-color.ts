import { converter, type Rgb } from 'culori';
import type { RgbaColor } from './types';

const MAXIMUM_CHANNEL_VALUE = 255;
const NEUTRAL_CHROMA_THRESHOLD = 0.0004;

const convertToHsl = converter('hsl');
const convertToHwb = converter('hwb');
const convertToOklab = converter('oklab');
const convertToOklch = converter('oklch');

function toCuloriRgb(color: RgbaColor): Rgb {
  return {
    mode: 'rgb',
    r: color.red / MAXIMUM_CHANNEL_VALUE,
    g: color.green / MAXIMUM_CHANNEL_VALUE,
    b: color.blue / MAXIMUM_CHANNEL_VALUE,
    alpha: color.alpha,
  };
}

export function toHsl(color: RgbaColor) {
  const { h, s, l } = convertToHsl(toCuloriRgb(color));
  return { hue: h ?? 0, saturation: s * 100, lightness: l * 100 };
}

export function toHwb(color: RgbaColor) {
  const { h, w, b } = convertToHwb(toCuloriRgb(color));
  return { hue: h ?? 0, whiteness: w * 100, blackness: b * 100 };
}

export function toOklab(color: RgbaColor) {
  const { l, a, b } = convertToOklab(toCuloriRgb(color));
  return { lightness: l, greenRedAxis: a, blueYellowAxis: b };
}

export function toOklch(color: RgbaColor) {
  const { l, c, h } = convertToOklch(toCuloriRgb(color));
  const hasHue = c >= NEUTRAL_CHROMA_THRESHOLD && h !== undefined;
  return { lightness: l, chroma: c, hue: hasHue ? h : 0 };
}
