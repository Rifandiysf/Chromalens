import { toOklab } from './convert-color';
import type { PaletteEntry } from './palettes';
import type { RgbaColor } from './types';

export interface ClosestColorMatch {
  name: string;
  isExactMatch: boolean;
}

function squaredOklabDistance(firstColor: ReturnType<typeof toOklab>, secondColor: ReturnType<typeof toOklab>): number {
  return (
    (firstColor.lightness - secondColor.lightness) ** 2 +
    (firstColor.greenRedAxis - secondColor.greenRedAxis) ** 2 +
    (firstColor.blueYellowAxis - secondColor.blueYellowAxis) ** 2
  );
}

function hasSameEightBitChannels(firstColor: RgbaColor, secondColor: RgbaColor): boolean {
  return (
    Math.round(firstColor.red) === Math.round(secondColor.red) &&
    Math.round(firstColor.green) === Math.round(secondColor.green) &&
    Math.round(firstColor.blue) === Math.round(secondColor.blue)
  );
}

export function findClosestColor(color: RgbaColor, paletteEntries: readonly PaletteEntry[]): ClosestColorMatch {
  const [firstEntry, ...remainingEntries] = paletteEntries;

  if (!firstEntry) {
    throw new Error('Cannot find the closest color because the palette is empty.');
  }

  const targetOklab = toOklab(color);
  let closestEntry = firstEntry;
  let smallestDistance = squaredOklabDistance(targetOklab, firstEntry.oklab);

  for (const paletteEntry of remainingEntries) {
    const distanceToEntry = squaredOklabDistance(targetOklab, paletteEntry.oklab);
    if (distanceToEntry < smallestDistance) {
      smallestDistance = distanceToEntry;
      closestEntry = paletteEntry;
    }
  }

  return {
    name: closestEntry.name,
    isExactMatch: hasSameEightBitChannels(color, closestEntry.color),
  };
}
