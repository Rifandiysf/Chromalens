export class ColorParseError extends Error {
  readonly originalValue: unknown;

  constructor(message: string, originalValue: unknown) {
    super(message);
    this.name = 'ColorParseError';
    this.originalValue = originalValue;
  }
}
