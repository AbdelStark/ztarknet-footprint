import type { PresetDefinition, PresetKey } from '../state/store';

interface PresetsBarProps {
  presets: PresetDefinition[];
  activeKey: PresetKey | null;
  onSelect: (key: PresetKey) => void;
}

export function PresetsBar({ presets, activeKey, onSelect }: PresetsBarProps) {
  return (
    <div className="presets">
      {presets.map((preset) => (
        <button
          key={preset.key}
          type="button"
          className="pill"
          aria-pressed={preset.key === activeKey}
          onClick={() => onSelect(preset.key)}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
