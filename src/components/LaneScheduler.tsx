import type { LaneMetrics } from '../calc/model';
import { formatDuration, formatPercent } from '../calc/units';

interface LaneSchedulerProps {
  lane: LaneMetrics | null;
}

export function LaneScheduler({ lane }: LaneSchedulerProps) {
  if (!lane) {
    return (
      <div>
        <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
          Lane is disabled — proofs can land in a single block if needed.
        </p>
      </div>
    );
  }

  const blocks = Array.from({ length: lane.blocksToClear }, (_, idx) => idx);
  const displayBlocks = blocks.slice(0, 20);
  const more = lane.blocksToClear - displayBlocks.length;

  return (
    <div>
      <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
        Lane at {formatPercent(lane.pct, 1)} admits {formatBytesShort(lane.bytesPerBlock)} per block.
        Clearing one round needs <strong>{lane.blocksToClear}</strong> block(s) (~
        {formatDuration(lane.durationSeconds)}).
      </p>
      <div className="lane-strip">
        {displayBlocks.map((block) => (
          <div key={block} className="lane-block" />
        ))}
        {more > 0 ? (
          <span style={{ marginLeft: 8, color: 'var(--muted)' }}>+{more} more</span>
        ) : null}
      </div>
    </div>
  );
}

function formatBytesShort(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KiB`;
  }
  return `${bytes.toFixed(0)} B`;
}
