import type { UnitsMode } from '../types';

const UNIT_TABLE = {
  binary: {
    base: 1024,
    labels: ['B', 'KiB', 'MiB', 'GiB', 'TiB'],
  },
  decimal: {
    base: 1000,
    labels: ['B', 'KB', 'MB', 'GB', 'TB'],
  },
};

export function formatBytes(
  bytes: number,
  mode: UnitsMode,
  fractionDigits = 2,
): string {
  if (!Number.isFinite(bytes)) {
    return '—';
  }
  const absValue = Math.abs(bytes);
  const table = UNIT_TABLE[mode];
  if (absValue < 1) {
    return `${bytes.toFixed(fractionDigits)} ${table.labels[0]}`;
  }
  let idx = 0;
  let value = absValue;
  while (value >= table.base && idx < table.labels.length - 1) {
    value /= table.base;
    idx += 1;
  }
  const signed = Math.sign(bytes) * value;
  return `${signed.toFixed(fractionDigits)} ${table.labels[idx]}`;
}

export function formatPercent(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {},
): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  const fmt = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    ...options,
  });
  return fmt.format(value);
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) {
    return '—';
  }
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (hrs) parts.push(`${hrs}h`);
  if (mins) parts.push(`${mins}m`);
  if (!parts.length || secs) parts.push(`${secs}s`);
  return parts.join(' ');
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
