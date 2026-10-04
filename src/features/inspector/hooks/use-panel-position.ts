import { type RefObject, useLayoutEffect } from 'react';
import { PANEL_OFFSET_PIXELS, VIEWPORT_MARGIN_PIXELS } from '../constants';
import type { PointerAnchor } from './use-element-picker';

function clampBetween(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

/**
 * Places the panel next to the pointer and keeps it inside the viewport.
 * It repositions itself whenever the panel's size changes (for example when a row expands).
 */
export function usePanelPosition(panelReference: RefObject<HTMLElement | null>, anchor: PointerAnchor): void {
  useLayoutEffect(() => {
    const panelElement = panelReference.current;
    if (!panelElement) {
      return;
    }

    function positionPanel(): void {
      if (!panelElement) {
        return;
      }

      const { width: panelWidth, height: panelHeight } = panelElement.getBoundingClientRect();
      let panelLeft = anchor.horizontal + PANEL_OFFSET_PIXELS;
      let panelTop = anchor.vertical + PANEL_OFFSET_PIXELS;

      // Flip to the other side of the pointer when the panel would leave the viewport.
      if (panelLeft + panelWidth + VIEWPORT_MARGIN_PIXELS > window.innerWidth) {
        panelLeft = anchor.horizontal - PANEL_OFFSET_PIXELS - panelWidth;
      }
      if (panelTop + panelHeight + VIEWPORT_MARGIN_PIXELS > window.innerHeight) {
        panelTop = anchor.vertical - PANEL_OFFSET_PIXELS - panelHeight;
      }

      const largestLeft = Math.max(VIEWPORT_MARGIN_PIXELS, window.innerWidth - panelWidth - VIEWPORT_MARGIN_PIXELS);
      const largestTop = Math.max(VIEWPORT_MARGIN_PIXELS, window.innerHeight - panelHeight - VIEWPORT_MARGIN_PIXELS);

      panelElement.style.transform = `translate(${clampBetween(panelLeft, VIEWPORT_MARGIN_PIXELS, largestLeft)}px, ${clampBetween(panelTop, VIEWPORT_MARGIN_PIXELS, largestTop)}px)`;
    }

    positionPanel();
    const resizeObserver = new ResizeObserver(positionPanel);
    resizeObserver.observe(panelElement);
    return () => resizeObserver.disconnect();
  }, [panelReference, anchor.horizontal, anchor.vertical]);
}
