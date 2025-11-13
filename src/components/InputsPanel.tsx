import type { GlobalSettings, L2Spec, UnitsMode } from '../types';
import { GlobalInputs } from './GlobalInputs';
import { L2Card } from './L2Card';

interface InputsPanelProps {
  global: GlobalSettings;
  l2s: L2Spec[];
  setGlobal: (values: Partial<GlobalSettings>) => void;
  setUnits: (mode: UnitsMode) => void;
  updateL2: (id: string, values: Partial<L2Spec>) => void;
  addL2: () => void;
  removeL2: (id: string) => void;
}

export function InputsPanel({
  global,
  l2s,
  setGlobal,
  setUnits,
  updateL2,
  addL2,
  removeL2,
}: InputsPanelProps) {
  return (
    <section className="surface">
      <div className="panel-title">Global Settings</div>
      <GlobalInputs global={global} onChange={setGlobal} onUnits={setUnits} />

      <div className="panel-title" style={{ marginTop: 24 }}>
        L2s
      </div>
      <div className="l2-list">
        {l2s.map((l2) => (
          <L2Card
            key={l2.id}
            l2={l2}
            units={global.units}
            onChange={updateL2}
            onRemove={removeL2}
            disableRemoval={l2s.length === 1}
          />
        ))}
      </div>
      <button type="button" className="btn btn-ghost" onClick={addL2}>
        + Add L2
      </button>
    </section>
  );
}
