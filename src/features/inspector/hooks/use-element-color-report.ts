import { useMemo } from 'react';
import { type ElementColorReport, readElementColors } from '@/core/dom';
import { getErrorMessage } from '@/shared/errors';

type ElementColorResult = { report: ElementColorReport; errorMessage: null } | { report: null; errorMessage: string };

/** Reads the colors of an element once per element and turns failures into a message for the panel. */
export function useElementColorReport(element: Element): ElementColorResult {
  return useMemo(() => {
    try {
      return { report: readElementColors(element), errorMessage: null };
    } catch (readError) {
      console.error(
        `[Chromalens] Could not read the colors of <${element.tagName.toLowerCase()}>: ${getErrorMessage(readError)}`,
        readError,
      );
      return { report: null, errorMessage: `Could not read this element's colors. ${getErrorMessage(readError)}` };
    }
  }, [element]);
}
