import { type CSSProperties, useState } from 'react';
import { type ColorFormatId, formatColor } from '@/core/color';
import type { ElementColorEntry } from '@/core/dom';
import { FormatList } from './FormatList';

interface ColorRowProps {
  entry: ElementColorEntry;
  selectedFormatId: ColorFormatId;
  onCopy: (valueToCopy: string) => void;
}

function buildCssRgbaString({ red, green, blue, alpha }: ElementColorEntry['color']): string {
  return `rgba(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)}, ${alpha})`;
}

export function ColorRow({ entry, selectedFormatId, onCopy }: ColorRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { value, isApproximate } = formatColor(entry.color, selectedFormatId);
  const labelText = entry.note ? `${entry.label} (${entry.note})` : entry.label;
  const swatchStyle = { '--swatch-color': buildCssRgbaString(entry.color) } as CSSProperties;

  return (
    <div className="cn-row">
      <div className="cn-row-main">
        <span className="cn-swatch" style={swatchStyle} />
        <div className="cn-row-text">
          <span className="cn-row-label">{labelText}</span>
          <button
            type="button"
            className="cn-row-value"
            aria-label={`Copy ${entry.label} color ${value}`}
            onClick={() => onCopy(value)}
          >
            {isApproximate && <span className="cn-approximate-mark">{'\u2248'}</span>}
            {value}
          </button>
        </div>
        <button
          type="button"
          className="cn-expand-button"
          aria-expanded={isExpanded}
          aria-label={`Show all formats for ${entry.label}`}
          onClick={() => setIsExpanded((wasExpanded) => !wasExpanded)}
        >
          {'\u25be'}
        </button>
      </div>
      {isExpanded && <FormatList color={entry.color} onCopy={onCopy} />}
    </div>
  );
}
