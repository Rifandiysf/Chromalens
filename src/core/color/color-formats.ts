import { toHsl, toHwb, toOklab, toOklch } from './convert-color';
import { findClosestColor } from './find-closest-color';
import { roundToDecimals } from './number-format';
import { getCssNamedColorEntries, getTailwindColorEntries } from './palettes';
import type { FormattedColor, RgbaColor } from './types';

const OPAQUE_ALPHA_THRESHOLD = 0.995;
const MAXIMUM_CHANNEL_VALUE = 255;

export interface ColorFormat {
  id: string;
  label: string;
  format: (color: RgbaColor) => FormattedColor;
}

function exact(value: string): FormattedColor {
  return { value, isApproximate: false };
}

function isTranslucent(color: RgbaColor): boolean {
  return color.alpha < OPAQUE_ALPHA_THRESHOLD;
}

function formatAlpha(alpha: number): string {
  return String(roundToDecimals(alpha, 2));
}

function buildAlphaSuffix(color: RgbaColor): string {
  return isTranslucent(color) ? ` / ${formatAlpha(color.alpha)}` : '';
}

function toTwoDigitHex(channelValue: number): string {
  return Math.round(channelValue).toString(16).padStart(2, '0');
}

function formatRgbChannels(color: RgbaColor): string {
  return [color.red, color.green, color.blue].map((channelValue) => Math.round(channelValue)).join(', ');
}

function formatHslChannels(color: RgbaColor): string {
  const { hue, saturation, lightness } = toHsl(color);
  return `${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%`;
}

export const COLOR_FORMATS = [
  {
    id: 'hex',
    label: 'HEX',
    format: (color) => {
      const hexColor = `#${toTwoDigitHex(color.red)}${toTwoDigitHex(color.green)}${toTwoDigitHex(color.blue)}`;
      return exact(
        isTranslucent(color) ? `${hexColor}${toTwoDigitHex(color.alpha * MAXIMUM_CHANNEL_VALUE)}` : hexColor,
      );
    },
  },
  { id: 'rgb', label: 'RGB', format: (color) => exact(`rgb(${formatRgbChannels(color)})`) },
  {
    id: 'rgba',
    label: 'RGBA',
    format: (color) => exact(`rgba(${formatRgbChannels(color)}, ${formatAlpha(color.alpha)})`),
  },
  { id: 'hsl', label: 'HSL', format: (color) => exact(`hsl(${formatHslChannels(color)})`) },
  {
    id: 'hsla',
    label: 'HSLA',
    format: (color) => exact(`hsla(${formatHslChannels(color)}, ${formatAlpha(color.alpha)})`),
  },
  {
    id: 'hwb',
    label: 'HWB',
    format: (color) => {
      const { hue, whiteness, blackness } = toHwb(color);
      return exact(
        `hwb(${Math.round(hue)} ${Math.round(whiteness)}% ${Math.round(blackness)}%${buildAlphaSuffix(color)})`,
      );
    },
  },
  {
    id: 'oklch',
    label: 'OKLCH',
    format: (color) => {
      const { lightness, chroma, hue } = toOklch(color);
      return exact(
        `oklch(${roundToDecimals(lightness * 100, 2)}% ${roundToDecimals(chroma, 4)} ${roundToDecimals(hue, 2)}${buildAlphaSuffix(color)})`,
      );
    },
  },
  {
    id: 'oklab',
    label: 'OKLAB',
    format: (color) => {
      const { lightness, greenRedAxis, blueYellowAxis } = toOklab(color);
      return exact(
        `oklab(${roundToDecimals(lightness * 100, 2)}% ${roundToDecimals(greenRedAxis, 4)} ${roundToDecimals(blueYellowAxis, 4)}${buildAlphaSuffix(color)})`,
      );
    },
  },
  {
    id: 'css-name',
    label: 'CSS name',
    format: (color) => {
      const closestMatch = findClosestColor(color, getCssNamedColorEntries());
      return { value: closestMatch.name, isApproximate: !closestMatch.isExactMatch };
    },
  },
  {
    id: 'tailwind',
    label: 'Tailwind',
    format: (color) => {
      const closestMatch = findClosestColor(color, getTailwindColorEntries());
      return { value: closestMatch.name, isApproximate: !closestMatch.isExactMatch };
    },
  },
  {
    id: 'srgb',
    label: 'color(srgb)',
    format: (color) => {
      const [red, green, blue] = [color.red, color.green, color.blue].map((channelValue) =>
        roundToDecimals(channelValue / MAXIMUM_CHANNEL_VALUE, 3),
      );
      return exact(`color(srgb ${red} ${green} ${blue}${buildAlphaSuffix(color)})`);
    },
  },
] as const satisfies readonly ColorFormat[];

export type ColorFormatId = (typeof COLOR_FORMATS)[number]['id'];

export const DEFAULT_COLOR_FORMAT_ID: ColorFormatId = 'hex';

export function isColorFormatId(candidateId: unknown): candidateId is ColorFormatId {
  return COLOR_FORMATS.some((colorFormat) => colorFormat.id === candidateId);
}

export function formatColor(color: RgbaColor, formatId: ColorFormatId): FormattedColor {
  const matchingFormat: ColorFormat | undefined = COLOR_FORMATS.find((colorFormat) => colorFormat.id === formatId);

  if (!matchingFormat) {
    const supportedIds = COLOR_FORMATS.map((colorFormat) => colorFormat.id).join(', ');
    throw new Error(
      `Cannot format the color because "${formatId}" is not a supported format. Supported formats are: ${supportedIds}.`,
    );
  }

  return matchingFormat.format(color);
}
