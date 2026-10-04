import { colorsNamed } from 'culori';
import tailwindColors from 'tailwindcss/colors';
import { toOklab } from './convert-color';
import { parseCssColor } from './parse-color';
import type { RgbaColor } from './types';

export interface PaletteEntry {
  name: string;
  color: RgbaColor;
  oklab: ReturnType<typeof toOklab>;
}

const BITS_PER_COLOR_CHANNEL = 8;
const CHANNEL_BIT_MASK = 0xff;

function createPaletteEntry(name: string, color: RgbaColor): PaletteEntry {
  return { name, color, oklab: toOklab(color) };
}

function createCssNamedColorEntries(): PaletteEntry[] {
  return (
    Object.entries(colorsNamed)
      .filter(([colorName]) => !colorName.includes('grey'))
      .map(([colorName, packedRgbValue]) =>
        createPaletteEntry(colorName, {
          red: (packedRgbValue >> (BITS_PER_COLOR_CHANNEL * 2)) & CHANNEL_BIT_MASK,
          green: (packedRgbValue >> BITS_PER_COLOR_CHANNEL) & CHANNEL_BIT_MASK,
          blue: packedRgbValue & CHANNEL_BIT_MASK,
          alpha: 1,
        }),
      )
  );
}

function createTailwindColorEntries(): PaletteEntry[] {
  const tailwindEntries: PaletteEntry[] = [];

  for (const [familyName, familyValue] of Object.entries(tailwindColors)) {
    if (typeof familyValue === 'string') {
      if (familyName === 'black' || familyName === 'white') {
        tailwindEntries.push(createPaletteEntry(familyName, parseCssColor(familyValue)));
      }
      continue;
    }

    for (const [shadeLevel, shadeColorString] of Object.entries(familyValue)) {
      tailwindEntries.push(createPaletteEntry(`${familyName}-${shadeLevel}`, parseCssColor(shadeColorString)));
    }
  }

  return tailwindEntries;
}

let cachedCssNamedColorEntries: PaletteEntry[] | null = null;
let cachedTailwindColorEntries: PaletteEntry[] | null = null;

export function getCssNamedColorEntries(): PaletteEntry[] {
  cachedCssNamedColorEntries ??= createCssNamedColorEntries();
  return cachedCssNamedColorEntries;
}

export function getTailwindColorEntries(): PaletteEntry[] {
  cachedTailwindColorEntries ??= createTailwindColorEntries();
  return cachedTailwindColorEntries;
}
