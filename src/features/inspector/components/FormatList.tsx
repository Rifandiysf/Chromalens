import { COLOR_FORMATS, formatColor, type RgbaColor } from '@/core/color';

interface FormatListProps {
  color: RgbaColor;
  onCopy: (valueToCopy: string) => void;
}

export function FormatList({ color, onCopy }: FormatListProps) {
  return (
    <div className="cn-format-list">
      {COLOR_FORMATS.map((colorFormat) => {
        const { value, isApproximate } = formatColor(color, colorFormat.id);

        return (
          <button
            key={colorFormat.id}
            type="button"
            className="cn-format-item"
            aria-label={`Copy ${colorFormat.label} value ${value}`}
            onClick={() => onCopy(value)}
          >
            <span className="cn-format-name">{colorFormat.label}</span>
            <span className="cn-format-value">{isApproximate ? `\u2248 ${value}` : value}</span>
          </button>
        );
      })}
    </div>
  );
}
