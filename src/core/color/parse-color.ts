import { clampGamut, converter, parse } from 'culori';
import { ColorParseError } from './errors';
import type { RgbaColor } from './types';

const MAXIMUM_CHANNEL_VALUE = 255;

const convertToRgb = converter('rgb');
const mapIntoSrgbGamut = clampGamut('rgb');

function toChannelByte(normalizedChannel: number): number {
  return Math.min(Math.max(normalizedChannel * MAXIMUM_CHANNEL_VALUE, 0), MAXIMUM_CHANNEL_VALUE);
}

export function parseCssColor(cssColorString: string): RgbaColor {
  if (typeof cssColorString !== 'string' || cssColorString.trim() === '') {
    throw new ColorParseError(
      `Cannot parse the color because a non-empty string was expected but received ${JSON.stringify(cssColorString)}.`,
      cssColorString,
    );
  }

  const trimmedColorString = cssColorString.trim();
  const parsedColor = parse(trimmedColorString);

  if (!parsedColor) {
    throw new ColorParseError(
      `"${trimmedColorString}" is not a CSS color that Chromalens can read, so it cannot be converted.`,
      cssColorString,
    );
  }

  const rgbColor = convertToRgb(mapIntoSrgbGamut(parsedColor));

  if (!rgbColor) {
    throw new ColorParseError(
      `"${trimmedColorString}" was recognized as a color but could not be converted to sRGB.`,
      cssColorString,
    );
  }

  return {
    red: toChannelByte(rgbColor.r),
    green: toChannelByte(rgbColor.g),
    blue: toChannelByte(rgbColor.b),
    alpha: rgbColor.alpha ?? 1,
  };
}
