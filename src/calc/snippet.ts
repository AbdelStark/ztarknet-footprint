import type { SimulationResults } from './model';
import type { SimulationState } from '../types';
import { formatBytes, formatNumber, formatPercent } from './units';

export function buildMarkdownSnippet(
  state: SimulationState,
  results: SimulationResults,
): string {
  const { global } = state;
  const { totals, perL2 } = results;
  const header = `## Footprint (block=${formatBytes(global.blockSizeBytes, global.units, 2)}, time=${global.blockTimeSeconds}s, lane=${global.lanePct ?? 0}%)`;
  const summary = [
    `- Avg bytes/block: **${formatBytes(
      totals.avgBytesPerBlock,
      global.units,
      3,
    )}** (${formatPercent(totals.avgSharePct)})`,
    `- Peak if aligned: **${formatBytes(
      totals.peakBytesPerBlock,
      global.units,
      2,
    )}** (${formatPercent(totals.peakSharePct)})`,
    `- Daily blocks consumed: **${totals.dailyBlocks.toFixed(3)}**`,
    `- L1 bytes per L2 tx: **${totals.l1BytesPerTx.toExponential(3)}**`,
  ].join('\n');

  const tableHeader =
    '| L2 | TPS | Cadence | Proof | Avg bytes/block | Share |\n| --- | ---: | ---: | ---: | ---: | ---: |';

  const rows = perL2
    .map(
      (l2) =>
        `| ${l2.label} | ${formatNumber(l2.tps)} | ${(l2.settlementCadenceSeconds / 3600).toFixed(1)} h | ${formatBytes(
          l2.proofBytes,
          global.units,
          2,
        )} | ${formatBytes(l2.avgBytesPerBlock, global.units, 3)} | ${formatPercent(l2.avgSharePct)} |`,
    )
    .join('\n');

  return [header, summary, tableHeader, rows].join('\n\n');
}
