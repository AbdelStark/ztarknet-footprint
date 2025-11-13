import type { SupplyWindow } from '../calc/model';
import type { UnitsMode } from '../types';
import { formatBytes, formatPercent } from '../calc/units';

interface WindowGaugesProps {
  windows: SupplyWindow[];
  units: UnitsMode;
}

export function WindowGauges({ windows, units }: WindowGaugesProps) {
  return (
    <div className="gauges">
      {windows.map((window) => (
        <div className="gauge" key={window.label}>
          <h4>{window.label} supply</h4>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14 }}>
            {formatBytes(window.demandBytes, units, 2)} demand vs{' '}
            {formatBytes(window.supplyBytes, units, 2)} supply
          </div>
          <div className="gauge-meter">
            <span
              style={{
                transform: `scaleX(${Math.min(1, window.utilizationPct / 100)})`,
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
            Utilization {formatPercent(window.utilizationPct)}
          </div>
        </div>
      ))}
    </div>
  );
}
