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
      <section className="result-card">
        <div className="section-heading">
          <h3>Network Snapshot</h3>
          <span>Aggregated across {results.perL2.length} rollup(s)</span>
        </div>
        <KpiGrid metrics={metrics} />
      </section>

      <section className="result-card dual">
        <div>
          <div className="section-heading">
            <h3>Peak block</h3>
            <span>Worst-case if all proofs land together</span>
          </div>
          <BlockBar
            usedBytes={totals.peakBytesPerBlock}
            blockSizeBytes={global.blockSizeBytes}
            units={global.units}
          />
        </div>
        <div>
          <div className="section-heading">
            <h3>Average footprint</h3>
            <span>Per block over settlement window</span>
          </div>
          <AverageBars
            perL2={results.perL2}
            totals={totals}
            units={global.units}
          />
        </div>
      </section>

      <section className="result-card">
        <div className="section-heading">
          <h3>Supply windows</h3>
          <span>Compare demand vs Zcash L1 supply</span>
        </div>
        <WindowGauges windows={totals.windows} units={global.units} />
      </section>

      <section className="result-card dual">
        <div>
          <div className="section-heading">
            <h3>Lane scheduler</h3>
            <span>Blocks to clear proofs under policy lane</span>
          </div>
          <LaneScheduler lane={totals.lane} />
        </div>
        <div>
          <div className="section-heading">
            <h3>Share-ready markdown</h3>
            <span>Copy/paste to forums & docs</span>
          </div>
          <MarkdownExporter snippet={markdown} onCopy={onCopyMarkdown} />
        </div>
      </section>
    </div>
  );
}
