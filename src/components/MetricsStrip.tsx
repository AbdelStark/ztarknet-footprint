import { SimulationTotals } from '../calc/model';
import { GlobalSettings } from '../types';
import { formatBytes, formatPercent, formatNumber } from '../calc/units';

interface MetricsStripProps {
  totals: SimulationTotals;
  global: GlobalSettings;
}

export function MetricsStrip({ totals, global }: MetricsStripProps) {
  const items = [
    {
      label: 'Avg Block Load',
      value: `${formatBytes(totals.avgBytesPerBlock, global.units, 3)} · ${formatPercent(
        totals.avgSharePct,
      )}`,
    },
    {
      label: 'Peak if Lumped',
      value: `${formatPercent(totals.peakSharePct)} of block`,
    },
    {
      label: 'Blocks / day',
      value: formatNumber(totals.dailyBlocks, { maximumFractionDigits: 2 }),
    },
  ];

  return (
    <div className="metrics-strip">
      {items.map((item) => (
        <div className="metrics-pill" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}
