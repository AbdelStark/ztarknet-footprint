import type { GlobalSettings, UnitsMode } from '../types';

interface GlobalInputsProps {
  global: GlobalSettings;
  onChange: (values: Partial<GlobalSettings>) => void;
  onUnits: (mode: UnitsMode) => void;
}

export function GlobalInputs({
  global,
  onChange,
  onUnits,
}: GlobalInputsProps) {
  const unitLabel = global.units === 'binary' ? 'MiB' : 'MB';
  const base = global.units === 'binary' ? 1024 * 1024 : 1000 * 1000;
  const blockSizeValue = Number((global.blockSizeBytes / base).toFixed(3));

  return (
    <div className="inputs-grid">
      <div className="field">
        <label>Block Size ({unitLabel})</label>
        <input
          type="number"
          min={0.5}
          step={0.1}
          value={blockSizeValue}
          onChange={(event) => {
            const val = Number(event.target.value) || 0;
            onChange({ blockSizeBytes: Math.max(0.25, val) * base });
          }}
        />
        <small>Binary-accurate bytes stored internally.</small>
      </div>

      <div className="field">
        <label>Block Time (seconds)</label>
        <input
          type="number"
          min={10}
          step={5}
          value={global.blockTimeSeconds}
          onChange={(event) =>
            onChange({ blockTimeSeconds: Number(event.target.value) || 1 })
          }
        />
        <small>Default 75s for Zcash.</small>
      </div>

      <div className="field">
        <label>Policy Lane (%)</label>
        <input
          type="number"
          min={0}
          max={100}
          placeholder="off"
          value={global.lanePct ?? ''}
          onChange={(event) => {
            const raw = event.target.value;
            if (raw === '') {
              onChange({ lanePct: null });
              return;
            }
            onChange({ lanePct: Math.max(0, Math.min(100, Number(raw))) });
          }}
        />
        <small>
          Optional throttle lane for `STARK_VERIFY` (set blank to disable).
        </small>
      </div>

      <div className="field">
        <label>Units Mode</label>
        <div className="presets">
          <button
            type="button"
            className="pill"
            aria-pressed={global.units === 'binary'}
            onClick={() => onUnits('binary')}
          >
            KiB/MiB
          </button>
          <button
            type="button"
            className="pill"
            aria-pressed={global.units === 'decimal'}
            onClick={() => onUnits('decimal')}
          >
            KB/MB
          </button>
        </div>
        <small>Impacts formatting only; calculations stay binary.</small>
      </div>
    </div>
  );
}
