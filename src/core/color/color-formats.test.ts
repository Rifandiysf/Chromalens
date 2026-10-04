import { describe, expect, it } from 'vitest';
import { COLOR_FORMATS, DEFAULT_COLOR_FORMAT_ID, formatColor, isColorFormatId, parseCssColor } from './index';

function formatCssColor(cssColorString: string, formatId: Parameters<typeof formatColor>[1]): string {
  return formatColor(parseCssColor(cssColorString), formatId).value;
}

describe('formatColor', () => {
  it('formats pure red in every channel-based format', () => {
    expect(formatCssColor('rgb(255, 0, 0)', 'hex')).toBe('#ff0000');
    expect(formatCssColor('rgb(255, 0, 0)', 'rgb')).toBe('rgb(255, 0, 0)');
    expect(formatCssColor('rgb(255, 0, 0)', 'rgba')).toBe('rgba(255, 0, 0, 1)');
    expect(formatCssColor('rgb(255, 0, 0)', 'hsl')).toBe('hsl(0, 100%, 50%)');
    expect(formatCssColor('rgb(255, 0, 0)', 'hsla')).toBe('hsla(0, 100%, 50%, 1)');
    expect(formatCssColor('rgb(255, 0, 0)', 'hwb')).toBe('hwb(0 0% 0%)');
    expect(formatCssColor('rgb(255, 0, 0)', 'oklch')).toBe('oklch(62.8% 0.2577 29.23)');
    expect(formatCssColor('rgb(255, 0, 0)', 'oklab')).toBe('oklab(62.8% 0.2249 0.1258)');
    expect(formatCssColor('rgb(255, 0, 0)', 'srgb')).toBe('color(srgb 1 0 0)');
  });

  it('formats a blue-500 style color', () => {
    expect(formatCssColor('rgb(59, 130, 246)', 'hex')).toBe('#3b82f6');
    expect(formatCssColor('rgb(59, 130, 246)', 'hsl')).toBe('hsl(217, 91%, 60%)');
    expect(formatCssColor('rgb(59, 130, 246)', 'hwb')).toBe('hwb(217 23% 4%)');
    expect(formatCssColor('rgb(59, 130, 246)', 'oklch')).toBe('oklch(62.31% 0.188 259.81)');
  });

  it('adds alpha to HEX and modern color functions only when the color is translucent', () => {
    expect(formatCssColor('rgba(0, 0, 0, 0.5)', 'hex')).toBe('#00000080');
    expect(formatCssColor('rgba(0, 0, 0, 0.5)', 'hwb')).toBe('hwb(0 0% 100% / 0.5)');
    expect(formatCssColor('rgba(0, 0, 0, 0.5)', 'oklch')).toBe('oklch(0% 0 0 / 0.5)');
    expect(formatCssColor('rgb(0, 0, 0)', 'oklch')).toBe('oklch(0% 0 0)');
  });

  it('reports a neutral gray with a hue of 0', () => {
    expect(formatCssColor('rgb(128, 128, 128)', 'oklch')).toBe('oklch(59.99% 0 0)');
  });

  it('finds exact and approximate CSS color names', () => {
    expect(formatColor(parseCssColor('rgb(255, 0, 0)'), 'css-name')).toEqual({ value: 'red', isApproximate: false });
    expect(formatColor(parseCssColor('rgb(59, 130, 246)'), 'css-name')).toEqual({
      value: 'dodgerblue',
      isApproximate: true,
    });
  });

  it('finds the closest Tailwind color', () => {
    const tailwindMatch = formatColor(parseCssColor('rgb(59, 130, 246)'), 'tailwind');
    expect(tailwindMatch.value).toBe('blue-500');
    expect(formatColor(parseCssColor('#000'), 'tailwind')).toEqual({ value: 'black', isApproximate: false });
  });

  it('throws an explanatory error for an unknown format id', () => {
    expect(() => formatColor(parseCssColor('red'), 'cmyk' as never)).toThrow(/"cmyk" is not a supported format/);
  });
});

describe('format registry', () => {
  it('has unique ids and a valid default', () => {
    const formatIds = COLOR_FORMATS.map((colorFormat) => colorFormat.id);
    expect(new Set(formatIds).size).toBe(formatIds.length);
    expect(isColorFormatId(DEFAULT_COLOR_FORMAT_ID)).toBe(true);
    expect(isColorFormatId('cmyk')).toBe(false);
  });
});
