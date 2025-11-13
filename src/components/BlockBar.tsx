import type { UnitsMode } from '../types';
import { formatBytes, formatPercent } from '../calc/units';

interface BlockBarProps {
  usedBytes: number;
  blockSizeBytes: number;
  units: UnitsMode;
  label?: string;
}

export function BlockBar({
  usedBytes,
  blockSizeBytes,
  units,
  label = 'Single block composition',
}: BlockBarProps) {
  const width = 520;
  const height = 32;
  const clamped = Math.min(
    width,
    Math.max(0, Math.round((usedBytes / blockSizeBytes) * width)),
  );
  const sharePct =
    blockSizeBytes > 0 ? (usedBytes / blockSizeBytes) * 100 : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--muted)' }}>
          {formatBytes(usedBytes, units, 2)} ({formatPercent(sharePct)})
        </span>
      </div>
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label}
        className="block-bar"
      >
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          rx="8"
          fill="rgba(255,255,255,0.08)"
        />
        <rect
          x="0"
          y="0"
          width={clamped}
          height={height}
          rx="8"
          fill="url(#barGradient)"
        />
        <text
          x={width - 8}
          y={height / 2 + 5}
          textAnchor="end"
          fontFamily="var(--font-mono)"
          fontSize="14"
          fill="var(--ink)"
        >
          {formatPercent(sharePct)}
        </text>
        <defs>
          <linearGradient id="barGradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
