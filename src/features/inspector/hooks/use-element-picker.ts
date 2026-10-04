import { useEffect, useState } from 'react';
import { BLOCKED_INTERACTION_EVENT_TYPES } from '../constants';

export interface PointerAnchor {
  horizontal: number;
  vertical: number;
}

interface PendingHover {
  target: Element;
  anchor: PointerAnchor;
}

interface UseElementPickerOptions {
  /** The overlay's own host element. Events that come from it are never treated as page events. */
  shadowHost: HTMLElement;
  /** Called when the user presses Esc while nothing is locked. */
  onExit: () => void;
}

function isEventFromOverlay(event: Event, shadowHost: HTMLElement): boolean {
  return event.composedPath().includes(shadowHost);
}

/**
 * Tracks which page element is hovered or locked.
 * Hovering previews an element, clicking locks it, Esc unlocks and then exits.
 */
export function useElementPicker({ shadowHost, onExit }: UseElementPickerOptions) {
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null);
  const [lockedElement, setLockedElement] = useState<Element | null>(null);
  const [pointerAnchor, setPointerAnchor] = useState<PointerAnchor>({ horizontal: 0, vertical: 0 });

  const isLocked = lockedElement !== null;

  useEffect(() => {
    let pendingHover: PendingHover | null = null;
    let animationFrameId: number | null = null;

    // Mouse moves fire far more often than the screen refreshes, so updates are batched per frame.
    function commitPendingHover(): void {
      animationFrameId = null;
      if (pendingHover) {
        setHoveredElement(pendingHover.target);
        setPointerAnchor(pendingHover.anchor);
        pendingHover = null;
      }
    }

    function handleMouseMove(mouseEvent: MouseEvent): void {
      if (isLocked || isEventFromOverlay(mouseEvent, shadowHost) || !(mouseEvent.target instanceof Element)) {
        return;
      }

      pendingHover = {
        target: mouseEvent.target,
        anchor: { horizontal: mouseEvent.clientX, vertical: mouseEvent.clientY },
      };
      animationFrameId ??= requestAnimationFrame(commitPendingHover);
    }

    function handleClick(mouseEvent: MouseEvent): void {
      if (isEventFromOverlay(mouseEvent, shadowHost)) {
        return;
      }

      // Stops the page from reacting (following links, submitting forms...) while picking colors.
      mouseEvent.preventDefault();
      mouseEvent.stopImmediatePropagation();

      if (mouseEvent.target instanceof Element) {
        setLockedElement(mouseEvent.target);
        setHoveredElement(mouseEvent.target);
        setPointerAnchor({ horizontal: mouseEvent.clientX, vertical: mouseEvent.clientY });
      }
    }

    function handleBlockedInteraction(mouseEvent: Event): void {
      if (isEventFromOverlay(mouseEvent, shadowHost)) {
        return;
      }
      mouseEvent.preventDefault();
      mouseEvent.stopImmediatePropagation();
    }

    function handleKeyDown(keyboardEvent: KeyboardEvent): void {
      if (keyboardEvent.key !== 'Escape') {
        return;
      }

      keyboardEvent.preventDefault();
      keyboardEvent.stopPropagation();

      if (isLocked) {
        setLockedElement(null);
        setHoveredElement(null);
      } else {
        onExit();
      }
    }

    // Capture phase listeners run before the page's own handlers.
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown, true);
    for (const eventType of BLOCKED_INTERACTION_EVENT_TYPES) {
      document.addEventListener(eventType, handleBlockedInteraction, true);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      for (const eventType of BLOCKED_INTERACTION_EVENT_TYPES) {
        document.removeEventListener(eventType, handleBlockedInteraction, true);
      }
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isLocked, shadowHost, onExit]);

  function unlock(): void {
    setLockedElement(null);
    setHoveredElement(null);
  }

  return { hoveredElement, lockedElement, pointerAnchor, isLocked, unlock };
}
