import { parseCssColor, type RgbaColor } from '@/core/color';
import { getErrorMessage } from '@/shared/errors';
import { describeElement } from './describe-element';

export type ElementColorId = 'text' | 'background' | 'border' | 'fill' | 'stroke';

export interface ElementColorEntry {
  id: ElementColorId;
  label: string;
  note: string;
  color: RgbaColor;
}

export interface ElementColorReport {
  entries: ElementColorEntry[];
  hasBackgroundImage: boolean;
}

const BORDER_SIDE_NAMES = ['top', 'right', 'bottom', 'left'] as const;
const INVISIBLE_BORDER_STYLES = ['none', 'hidden'];
const NON_COLOR_SVG_PAINTS = ['none', 'context-fill', 'context-stroke'];

function parseColorOrNull(rawValue: string, entryLabel: string): RgbaColor | null {
  try {
    return parseCssColor(rawValue);
  } catch (parseError) {
    console.warn(
      `[Chromalens] Skipped the "${entryLabel}" color because "${rawValue}" could not be read as a color. Reason: ${getErrorMessage(parseError)}`,
    );
    return null;
  }
}

function findVisibleBorderColor(computedStyle: CSSStyleDeclaration): string | null {
  for (const sideName of BORDER_SIDE_NAMES) {
    const borderWidth = Number.parseFloat(computedStyle.getPropertyValue(`border-${sideName}-width`));
    const borderStyle = computedStyle.getPropertyValue(`border-${sideName}-style`);

    if (borderWidth > 0 && !INVISIBLE_BORDER_STYLES.includes(borderStyle)) {
      return computedStyle.getPropertyValue(`border-${sideName}-color`);
    }
  }
  return null;
}

function findInheritedBackground(element: Element): { color: RgbaColor; sourceElement: Element } | null {
  let ancestorElement = element.parentElement;

  while (ancestorElement) {
    const ancestorColor = parseColorOrNull(getComputedStyle(ancestorElement).backgroundColor, 'Background');

    if (ancestorColor && ancestorColor.alpha > 0) {
      return { color: ancestorColor, sourceElement: ancestorElement };
    }
    ancestorElement = ancestorElement.parentElement;
  }
  return null;
}

function createEntryIfVisible(
  id: ElementColorId,
  label: string,
  rawValue: string,
  note = '',
): ElementColorEntry | null {
  const parsedColor = parseColorOrNull(rawValue, label);
  return parsedColor && parsedColor.alpha > 0 ? { id, label, note, color: parsedColor } : null;
}

function isPlainColorPaint(paintValue: string): boolean {
  return paintValue !== '' && !NON_COLOR_SVG_PAINTS.includes(paintValue) && !paintValue.startsWith('url(');
}

function readSvgColors(computedStyle: CSSStyleDeclaration): ElementColorEntry[] {
  const svgEntries = [
    isPlainColorPaint(computedStyle.fill) ? createEntryIfVisible('fill', 'Fill', computedStyle.fill) : null,
    isPlainColorPaint(computedStyle.stroke) ? createEntryIfVisible('stroke', 'Stroke', computedStyle.stroke) : null,
  ];
  return svgEntries.filter((svgEntry): svgEntry is ElementColorEntry => svgEntry !== null);
}

function readHtmlColors(element: Element, computedStyle: CSSStyleDeclaration): ElementColorEntry[] {
  const entries: Array<ElementColorEntry | null> = [createEntryIfVisible('text', 'Text', computedStyle.color)];

  const ownBackgroundColor = parseColorOrNull(computedStyle.backgroundColor, 'Background');
  if (ownBackgroundColor && ownBackgroundColor.alpha > 0) {
    entries.push({ id: 'background', label: 'Background', note: '', color: ownBackgroundColor });
  } else {
    const inheritedBackground = findInheritedBackground(element);
    if (inheritedBackground) {
      entries.push({
        id: 'background',
        label: 'Background',
        note: `from <${describeElement(inheritedBackground.sourceElement)}>`,
        color: inheritedBackground.color,
      });
    }
  }

  const visibleBorderColor = findVisibleBorderColor(computedStyle);
  if (visibleBorderColor) {
    entries.push(createEntryIfVisible('border', 'Border', visibleBorderColor));
  }

  return entries.filter((entry): entry is ElementColorEntry => entry !== null);
}

export function readElementColors(element: Element): ElementColorReport {
  let computedStyle: CSSStyleDeclaration;

  try {
    computedStyle = getComputedStyle(element);
  } catch (styleError) {
    throw new Error(
      `The browser refused to provide computed styles for <${element.tagName.toLowerCase()}>: ${getErrorMessage(styleError)}`,
    );
  }

  if (element instanceof SVGElement) {
    return { entries: readSvgColors(computedStyle), hasBackgroundImage: false };
  }

  return {
    entries: readHtmlColors(element, computedStyle),
    hasBackgroundImage: computedStyle.backgroundImage !== 'none' && computedStyle.backgroundImage !== '',
  };
}
