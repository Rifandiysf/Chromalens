import { useRef } from 'react';
import { COLOR_FORMATS, type ColorFormatId, isColorFormatId } from '@/core/color';
import { describeElement } from '@/core/dom';
import { useCopyToClipboard } from '../hooks/use-copy-to-clipboard';
import { useElementColorReport } from '../hooks/use-element-color-report';
import type { PointerAnchor } from '../hooks/use-element-picker';
import { usePanelPosition } from '../hooks/use-panel-position';
import { ColorRow } from './ColorRow';
import { PanelErrorBoundary } from './PanelErrorBoundary';

interface ColorPanelProps {
  element: Element;
  anchor: PointerAnchor;
  isLocked: boolean;
  selectedFormatId: ColorFormatId;
  onChangeFormat: (newFormatId: ColorFormatId) => void;
  onUnlock: () => void;
}

function ColorPanelContent({
  element,
  isLocked,
  selectedFormatId,
  onChangeFormat,
  onUnlock,
}: Omit<ColorPanelProps, 'anchor'>) {
  const { report, errorMessage } = useElementColorReport(element);
  const { copyStatus, copyValue } = useCopyToClipboard();

  const hintText = isLocked ? 'Click a value to copy it. Esc to unlock.' : 'Click to lock this element. Esc to exit.';

  return (
    <>
      <div className="cn-header">
        <span className="cn-element-name">{describeElement(element)}</span>
        <select
          className="cn-format-select"
          aria-label="Color format"
          value={selectedFormatId}
          onChange={(changeEvent) => {
            if (isColorFormatId(changeEvent.target.value)) {
              onChangeFormat(changeEvent.target.value);
            }
          }}
        >
          {COLOR_FORMATS.map((colorFormat) => (
            <option key={colorFormat.id} value={colorFormat.id}>
              {colorFormat.label}
            </option>
          ))}
        </select>
        {isLocked && (
          <button type="button" className="cn-close-button" aria-label="Unlock element" onClick={onUnlock}>
            {'\u00d7'}
          </button>
        )}
      </div>

      {errorMessage !== null && <p className="cn-empty-message">{errorMessage}</p>}
      {report?.entries.length === 0 && <p className="cn-empty-message">This element has no visible colors.</p>}
      {report?.entries.map((entry) => (
        <ColorRow key={entry.id} entry={entry} selectedFormatId={selectedFormatId} onCopy={copyValue} />
      ))}
      {report?.hasBackgroundImage && (
        <p className="cn-background-image-note">
          This element also has a background image or gradient, which is not read.
        </p>
      )}

      <div className={`cn-status${copyStatus ? ` is-${copyStatus.tone}` : ''}`} role="status" aria-live="polite">
        {copyStatus?.message ?? hintText}
      </div>
    </>
  );
}

export function ColorPanel(props: ColorPanelProps) {
  const panelReference = useRef<HTMLDivElement>(null);
  usePanelPosition(panelReference, props.anchor);

  return (
    <section ref={panelReference} className={`cn-panel${props.isLocked ? ' is-locked' : ''}`} aria-label="Chromalens">
      <PanelErrorBoundary resetKey={props.element}>
        <ColorPanelContent
          element={props.element}
          isLocked={props.isLocked}
          selectedFormatId={props.selectedFormatId}
          onChangeFormat={props.onChangeFormat}
          onUnlock={props.onUnlock}
        />
      </PanelErrorBoundary>
    </section>
  );
}
