import type { L2Spec, UnitsMode } from '../types';

interface L2CardProps {
  l2: L2Spec;
  units: UnitsMode;
  onChange: (id: string, values: Partial<L2Spec>) => void;
  onRemove: (id: string) => void;
  disableRemoval?: boolean;
}

export function L2Card({
  l2,
  units,
  onChange,
  onRemove,
  disableRemoval,
}: L2CardProps) {
  const cadenceHours = Number((l2.settlementCadenceSeconds / 3600).toFixed(2));
  const proofBase = units === 'binary' ? 1024 : 1000;
  const proofLabel = units === 'binary' ? 'KiB' : 'KB';
  const proofValue = Number((l2.proofSizeBytes / proofBase).toFixed(2));

  return (
    <div className="l2-card">
      <header>
        <input
          className="heading-input"
          value={l2.label}
          onChange={(event) => onChange(l2.id, { label: event.target.value })}
        />
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => onRemove(l2.id)}
          disabled={disableRemoval}
        >
          Remove
        </button>
      </header>

      <div className="l2-card-grid">
        <div className="field">
          <label>TPS</label>
          <input
            type="number"
            min={1}
            step={100}
            value={l2.tps}
            onChange={(event) =>
              onChange(l2.id, { tps: Math.max(1, Number(event.target.value)) })
            }
          />
        </div>

        <div className="field">
          <label>Cadence (hours)</label>
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={cadenceHours}
            onChange={(event) => {
              const hours = Math.max(0.5, Number(event.target.value) || 0.5);
              onChange(l2.id, { settlementCadenceSeconds: hours * 3600 });
            }}
          />
        </div>

        <div className="field">
          <label>Proof size ({proofLabel})</label>
          <input
            type="number"
            min={1}
            step={1}
            value={proofValue}
            onChange={(event) => {
              const val = Math.max(1, Number(event.target.value));
              onChange(l2.id, { proofSizeBytes: val * proofBase });
            }}
          />
        </div>
      </div>
    </div>
  );
}
