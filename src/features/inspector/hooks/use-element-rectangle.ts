import { useEffect, useState } from 'react';

export interface ElementRectangle {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** The viewport position of an element, kept up to date while the page scrolls or resizes. */
export function useElementRectangle(element: Element | null): ElementRectangle | null {
  const [rectangle, setRectangle] = useState<ElementRectangle | null>(null);

  useEffect(() => {
    if (!element?.isConnected) {
      setRectangle(null);
      return;
    }

    let animationFrameId: number | null = null;

    function measureElement(): void {
      animationFrameId = null;
      if (!element?.isConnected) {
        setRectangle(null);
        return;
      }
      const { left, top, width, height } = element.getBoundingClientRect();
      setRectangle({ left, top, width, height });
    }

    function scheduleMeasurement(): void {
      animationFrameId ??= requestAnimationFrame(measureElement);
    }

    measureElement();
    window.addEventListener('scroll', scheduleMeasurement, { capture: true, passive: true });
    window.addEventListener('resize', scheduleMeasurement, { passive: true });

    return () => {
      window.removeEventListener('scroll', scheduleMeasurement, { capture: true });
      window.removeEventListener('resize', scheduleMeasurement);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [element]);

  return rectangle;
}
