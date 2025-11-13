import type { GlobalSettings, L2Spec, SimulationState } from '../types';

const SECONDS_PER_DAY = 86_400;
const SIX_HOURS = 6 * 3_600;

export interface L2Result {
  id: string;
  label: string;
  tps: number;
  settlementCadenceSeconds: number;
  proofBytes: number;
  txPerSettlement: number;
  blocksPerCadence: number;
  avgBytesPerBlock: number;
  avgSharePct: number;
  peakBytesPerBlock: number;
  peakSharePct: number;
  proofsPerDay: number;
  bytesPerDay: number;
  dailyBlocks: number;
  l1BytesPerTx: number;
  l2TxPerL1Byte: number;
}

export interface LaneMetrics {
  pct: number;
  bytesPerBlock: number;
  blocksToClear: number;
  durationSeconds: number;
}

export interface SupplyWindow {
  windowSeconds: number;
  label: string;
  supplyBytes: number;
  demandBytes: number;
  utilizationPct: number;
}

export interface SimulationTotals {
  totalProofBytes: number;
  avgBytesPerBlock: number;
  avgSharePct: number;
  peakBytesPerBlock: number;
  peakSharePct: number;
  bytesPerDay: number;
  dailyBlocks: number;
  totalTxPerDay: number;
  l1BytesPerTx: number;
  l2TxPerL1Byte: number;
  lane: LaneMetrics | null;
  windows: SupplyWindow[];
}

export interface SimulationResults {
  perL2: L2Result[];
  totals: SimulationTotals;
}

export function computeSimulation(state: SimulationState): SimulationResults {
  const { global, l2s } = state;
  const perL2 = l2s.map((l2) => computeL2Result(l2, global));

  const totalProofBytes = perL2.reduce((sum, l2) => sum + l2.proofBytes, 0);
  const avgBytesPerBlock = perL2.reduce((sum, l2) => sum + l2.avgBytesPerBlock, 0);
  const bytesPerDay = perL2.reduce((sum, l2) => sum + l2.bytesPerDay, 0);
  const peakBytesPerBlock = perL2.reduce(
    (sum, l2) => sum + l2.peakBytesPerBlock,
    0,
  );
  const totalTxPerDay = perL2.reduce(
    (sum, l2) => sum + l2.tps * SECONDS_PER_DAY,
    0,
  );

  const lane = computeLane(global, totalProofBytes);
  const windows = computeWindows(global, bytesPerDay);

  const totals: SimulationTotals = {
    totalProofBytes,
    avgBytesPerBlock,
    avgSharePct: share(avgBytesPerBlock, global.blockSizeBytes),
    peakBytesPerBlock,
    peakSharePct: share(peakBytesPerBlock, global.blockSizeBytes),
    bytesPerDay,
    dailyBlocks: safeDivide(bytesPerDay, global.blockSizeBytes),
    totalTxPerDay,
    l1BytesPerTx: safeDivide(bytesPerDay, totalTxPerDay),
    l2TxPerL1Byte: safeDivide(totalTxPerDay, bytesPerDay),
    lane,
    windows,
  };

  return { perL2, totals };
}

function computeL2Result(l2: L2Spec, global: GlobalSettings): L2Result {
  const cadenceSeconds = Math.max(1, l2.settlementCadenceSeconds);
  const blockTime = Math.max(1, global.blockTimeSeconds);

  const txPerSettlement = l2.tps * cadenceSeconds;
  const blocksPerCadence = cadenceSeconds / blockTime;
  const avgBytesPerBlock =
    blocksPerCadence === 0 ? 0 : l2.proofSizeBytes / blocksPerCadence;
  const proofsPerDay = SECONDS_PER_DAY / cadenceSeconds;
  const bytesPerDay = proofsPerDay * l2.proofSizeBytes;
  const dailyBlocks = safeDivide(bytesPerDay, global.blockSizeBytes);
  const l1BytesPerTx = safeDivide(l2.proofSizeBytes, txPerSettlement);
  const l2TxPerL1Byte = safeDivide(txPerSettlement, l2.proofSizeBytes);

  return {
    id: l2.id,
    label: l2.label,
    tps: l2.tps,
    settlementCadenceSeconds: cadenceSeconds,
    proofBytes: l2.proofSizeBytes,
    txPerSettlement,
    blocksPerCadence,
    avgBytesPerBlock,
    avgSharePct: share(avgBytesPerBlock, global.blockSizeBytes),
    peakBytesPerBlock: l2.proofSizeBytes,
    peakSharePct: share(l2.proofSizeBytes, global.blockSizeBytes),
    proofsPerDay,
    bytesPerDay,
    dailyBlocks,
    l1BytesPerTx,
    l2TxPerL1Byte,
  };
}

function computeLane(
  global: GlobalSettings,
  totalProofBytes: number,
): LaneMetrics | null {
  if (global.lanePct === null || global.lanePct <= 0) {
    return null;
  }
  const pct = Math.min(100, global.lanePct);
  const bytesPerBlock = (pct / 100) * global.blockSizeBytes;
  if (bytesPerBlock <= 0) {
    return null;
  }
  const blocksToClear = Math.max(
    1,
    Math.ceil(totalProofBytes / bytesPerBlock),
  );
  const durationSeconds = blocksToClear * global.blockTimeSeconds;
  return {
    pct,
    bytesPerBlock,
    blocksToClear,
    durationSeconds,
  };
}

function computeWindows(
  global: GlobalSettings,
  bytesPerDay: number,
): SupplyWindow[] {
  const perSecond = bytesPerDay / SECONDS_PER_DAY;
  const windows: Array<[number, string]> = [
    [SIX_HOURS, '6 hours'],
    [SECONDS_PER_DAY, '24 hours'],
  ];
  return windows.map(([windowSeconds, label]) => {
    const supplyBytes =
      (windowSeconds / global.blockTimeSeconds) * global.blockSizeBytes;
    const demandBytes = perSecond * windowSeconds;
    return {
      windowSeconds,
      label,
      supplyBytes,
      demandBytes,
      utilizationPct: share(demandBytes, supplyBytes),
    };
  });
}

function share(bytes: number, blockSizeBytes: number): number {
  if (blockSizeBytes <= 0) {
    return 0;
  }
  return (bytes / blockSizeBytes) * 100;
}

function safeDivide(a: number, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) {
    return 0;
  }
  return a / b;
}
