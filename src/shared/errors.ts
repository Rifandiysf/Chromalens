export function getErrorMessage(thrownValue: unknown): string {
  if (thrownValue instanceof Error) {
    return thrownValue.message;
  }
  return typeof thrownValue === 'string' ? thrownValue : JSON.stringify(thrownValue);
}
