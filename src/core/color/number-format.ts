export function roundToDecimals(value: number, decimalPlaces: number): number {
  const decimalMultiplier = 10 ** decimalPlaces;
  const roundedValue = Math.round(value * decimalMultiplier) / decimalMultiplier;
  return roundedValue === 0 ? 0 : roundedValue;
}
