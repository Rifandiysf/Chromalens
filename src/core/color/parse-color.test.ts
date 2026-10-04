import { describe, expect, it } from 'vitest';
import { ColorParseError, parseCssColor } from './index';

describe('parseCssColor', () => {
  it('parses legacy rgb()', () => {
    expect(parseCssColor('rgb(255, 0, 0)')).toEqual({ red: 255, green: 0, blue: 0, alpha: 1 });
  });

  it('parses modern rgb() with a percentage alpha', () => {
    const parsedColor = parseCssColor('rgb(100 200 50 / 40%)');
    expect(Math.round(parsedColor.green)).toBe(200);
    expect(parsedColor.alpha).toBeCloseTo(0.4);
  });

  it('parses rgba() computed by browsers for translucent colors', () => {
    expect(parseCssColor('rgba(0, 0, 0, 0.5)').alpha).toBeCloseTo(0.5);
  });

  it('parses transparent as fully transparent', () => {
    expect(parseCssColor('transparent').alpha).toBe(0);
  });

  it('parses oklch() and returns the matching sRGB color', () => {
    const parsedColor = parseCssColor('oklch(62.8% 0.2577 29.23)');
    expect(Math.round(parsedColor.red)).toBe(255);
    expect(Math.round(parsedColor.green)).toBe(0);
  });

  it('keeps out-of-gamut colors inside the sRGB range', () => {
    const parsedColor = parseCssColor('oklch(70% 0.4 150)');
    for (const channelValue of [parsedColor.red, parsedColor.green, parsedColor.blue]) {
      expect(channelValue).toBeGreaterThanOrEqual(0);
      expect(channelValue).toBeLessThanOrEqual(255);
    }
  });

  it('throws a ColorParseError that explains an unreadable value', () => {
    expect(() => parseCssColor('not-a-color')).toThrow(ColorParseError);
    expect(() => parseCssColor('not-a-color')).toThrow(/not a CSS color that Chromalens can read/);
  });

  it('throws a ColorParseError for empty input', () => {
    expect(() => parseCssColor('   ')).toThrow(/non-empty string/);
  });
});
