import { useEffect } from 'react';
import { promoteToTopLayer } from '@/shared/top-layer';
import { ColorPanel } from './components/ColorPanel';
import { useElementPicker } from './hooks/use-element-picker';
import { useElementRectangle } from './hooks/use-element-rectangle';
import { useSelectedFormat } from './hooks/use-selected-format';

interface InspectorAppProps {
  shadowHost: HTMLElement;
  onExit: () => void;
}

export function InspectorApp({ shadowHost, onExit }: InspectorAppProps) {
  const { selectedFormatId, changeSelectedFormat } = useSelectedFormat();
  const { hoveredElement, lockedElement, pointerAnchor, isLocked, unlock } = useElementPicker({
    shadowHost,
    onExit,
  });

  const activeElement = lockedElement ?? hoveredElement;
  const highlightRectangle = useElementRectangle(activeElement);

  useEffect(() => {
    promoteToTopLayer(shadowHost);
  }, [shadowHost, activeElement]);

  return (
    <div className="cn-root">
      {highlightRectangle && (
        <div
          className="cn-highlight"
          style={{
            left: highlightRectangle.left,
            top: highlightRectangle.top,
            width: highlightRectangle.width,
            height: highlightRectangle.height,
          }}
        />
      )}
      {activeElement && (
        <ColorPanel
          element={activeElement}
          anchor={pointerAnchor}
          isLocked={isLocked}
          selectedFormatId={selectedFormatId}
          onChangeFormat={changeSelectedFormat}
          onUnlock={unlock}
        />
      )}
    </div>
  );
}
