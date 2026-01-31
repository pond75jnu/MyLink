import { memo } from 'react';
import { Check } from 'lucide-react';

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
  '#64748b', // slate
] as const;

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const ColorPicker = memo(function ColorPicker({
  value,
  onChange,
  className = '',
}: ColorPickerProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">색상</label>
      <div className="grid grid-cols-9 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`
              w-7 h-7 rounded-full flex items-center justify-center
              transition-transform hover:scale-110
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              ${value === color ? 'ring-2 ring-offset-2 ring-gray-900' : ''}
            `}
            style={{ backgroundColor: color }}
            aria-label={`색상 ${color}`}
            aria-pressed={value === color}
          >
            {value === color && <Check className="w-4 h-4 text-white drop-shadow" />}
          </button>
        ))}
      </div>
    </div>
  );
});

export { ColorPicker, PRESET_COLORS };
export type { ColorPickerProps };
