import { getErrorMessage } from './errors';

export function promoteToTopLayer(element: HTMLElement): void {
  if (typeof element.showPopover !== 'function') {
    return;
  }

  try {
    if (!element.hasAttribute('popover')) {
      element.setAttribute('popover', 'manual');
    }
    if (element.matches(':popover-open')) {
      element.hidePopover();
    }
    element.showPopover();
  } catch (popoverError) {
    console.warn(
      `[Chromalens] Could not move the overlay to the top layer, so it may appear behind some page elements. Reason: ${getErrorMessage(popoverError)}`,
    );
  }
}
