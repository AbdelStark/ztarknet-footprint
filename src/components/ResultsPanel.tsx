import type { SimulationResults } from '../calc/model';
import { formatBytes, formatPercent, formatNumber } from '../calc/units';
import type { GlobalSettings } from '../types';
import { BlockBar } from './BlockBar';
import { AverageBars } from './AverageBars';
import { LaneScheduler } from './LaneScheduler';
import { MarkdownExporter } from './MarkdownExporter';
import { KpiGrid } from './KpiGrid';
import { WindowGauges } from './WindowGauges';

interface ResultsPanelProps {
  global: GlobalSettings;
  results: SimulationResults;
  markdown: string;
  onCopyMarkdown: () => Promise<void>;
}

export function ResultsPanel({
  global,
  results,
  markdown,
  onCopyMarkdown,
}: ResultsPanelProps) {
  const { totals } = results;
  const metrics = [
    {
      label: 'Avg bytes/block',
      value: `${formatBytes(totals.avgBytesPerBlock, global.units, 4)} (${formatPercent(
        totals.avgSharePct,
      )})`,
      caption: 'Aggregate average footprint',
    },
    {
      label: 'Daily blocks',
      value: formatNumber(totals.dailyBlocks, {
        maximumFractionDigits: 3,
      }),
      caption: '2 MiB equivalents consumed/day',
    },
    {
      label: 'L1 bytes / L2 tx',
      value: totals.l1BytesPerTx
        ? Number(totals.l1BytesPerTx).toExponential(3)
        : '0',
      caption: 'Per-transaction footprint',
    },
    {
      label: 'L2 tx / L1 byte',
      value: totals.l2TxPerL1Byte
        ? Number(totals.l2TxPerL1Byte).toLocaleString()
        : '—',
      caption: 'Efficiency (higher is better)',
    },
  ];

  return (
    <div className="results-grid">
      <KpiGrid metrics={metrics} />
      <BlockBar
        usedBytes={totals.peakBytesPerBlock}
        blockSizeBytes={global.blockSizeBytes}
        units={global.units}
      />
      <AverageBars perL2={results.perL2} totals={totals} units={global.units} />
      <WindowGauges windows={totals.windows} units={global.units} />
      <LaneScheduler lane={totals.lane} />
      <MarkdownExporter snippet={markdown} onCopy={onCopyMarkdown} />
    </div>
  );
}
