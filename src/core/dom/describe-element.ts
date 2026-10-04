export function describeElement(element: Element): string {
  const tagName = element.tagName.toLowerCase();
  const idSuffix = element.id ? `#${element.id}` : '';
  const [firstClassName] = (element.getAttribute('class') ?? '').trim().split(/\s+/);
  const classSuffix = firstClassName ? `.${firstClassName}` : '';
  return `${tagName}${idSuffix}${classSuffix}`;
}
