import type { L2Result, SimulationTotals } from '../calc/model';
import type { UnitsMode } from '../types';
import { formatBytes, formatPercent } from '../calc/units';

interface AverageBarsProps {
  perL2: L2Result[];
  totals: SimulationTotals;
  units: UnitsMode;
}

export function AverageBars({ perL2, totals, units }: AverageBarsProps) {
  return (
    <div>
      <div className="panel-title" style={{ marginBottom: 10 }}>
        Average bytes per block
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <BarRow
          label="Aggregate"
          bytes={totals.avgBytesPerBlock}
          share={totals.avgSharePct}
          units={units}
        />
        {perL2.map((l2) => (
          <BarRow
            key={l2.id}
            label={l2.label}
            bytes={l2.avgBytesPerBlock}
            share={l2.avgSharePct}
            units={units}
          />
        ))}
      </div>
    </div>
  );
}

interface BarRowProps {
  label: string;
  bytes: number;
  share: number;
  units: UnitsMode;
}

function BarRow({ label, bytes, share, units }: BarRowProps) {
  const width = `${Math.min(100, share)}%`;
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 13,
          color: 'var(--muted)',
        }}
      >
        <span>{label}</span>
        <span>
          {formatBytes(bytes, units, 4)} | {formatPercent(share)}
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            display: 'block',
            height: '100%',
            width,
            background:
              'linear-gradient(90deg, rgba(0,255,136,0.6), rgba(255,209,102,0.7))',
          }}
        />
      </div>
    </div>
  );
}
